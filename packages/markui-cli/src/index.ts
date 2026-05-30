#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import path from 'path';
import {
  DEFAULT_MARKUI_LIMITS,
  compile,
  isLimitErrorCode,
  utf8ByteLength,
} from '@jonkeda/markui-core';
import type { ParseError, ParseLimits } from '@jonkeda/markui-core';
import {
  createValidationResult,
  validateMarkdownMarkuiBlocks,
  validateMarkuiSource,
} from '@jonkeda/markui-validator';
import type {
  MarkuiFileResult,
  MarkuiValidationDiagnostic,
  MarkuiValidationResult,
  ParseMode,
} from '@jonkeda/markui-validator';

const VERSION = '0.1.0';
const DEFAULT_MAX_FILES = 1_000;
const VALUE_FLAGS = new Set(['format', 'mode', 'out', 'theme', 'max-warnings', 'max-bytes', 'max-files', 'max-svg-bytes']);
const BOOLEAN_FLAGS = new Set(['stdin', 'markdown', 'force', 'overwrite', 'fail-on-warnings', 'help', 'version']);

interface ParsedOptions {
  options: Record<string, string | boolean>;
  positionals: string[];
}

class CliError extends Error {
  constructor(message: string, readonly exitCode = 2) {
    super(message);
  }
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const command = argv[0] && !argv[0].startsWith('-') ? argv[0] : 'help';
  const commandArgs = command === 'help' ? argv : argv.slice(1);

  if (argv.includes('--version') || argv.includes('-v')) {
    process.stdout.write(`markui ${VERSION}\n`);
    return 0;
  }

  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(helpText());
    return 0;
  }

  switch (command) {
    case 'validate':
      return runValidate(parseOptions(commandArgs));
    case 'render':
      return runRender(parseOptions(commandArgs));
    case 'help':
      process.stdout.write(helpText());
      return 0;
    default:
      throw new CliError(`Unknown command: ${command}`);
  }
}

async function runValidate(parsed: ParsedOptions): Promise<number> {
  const mode = parseMode(parsed.options.mode);
  const format = parseValidationFormat(parsed.options.format);
  const limits = parseCliLimits(parsed.options);
  const maxFiles = parseOptionalInteger(parsed.options['max-files'], '--max-files') ?? DEFAULT_MAX_FILES;
  const files: MarkuiFileResult[] = [];

  if (parsed.options.stdin) {
    const source = await readStdin(limits.maxSourceBytes);
    files.push(validateSourceText(source, {
      limits,
      markdown: Boolean(parsed.options.markdown),
      mode,
      path: '<stdin>',
    }));
  } else {
    if (parsed.positionals.length === 0) {
      throw new CliError('validate requires at least one file, directory, or --stdin.');
    }

    const inputFiles = collectInputFiles(parsed.positionals, maxFiles);
    for (const filePath of inputFiles) {
      files.push(validateSourceFile(filePath, {
        limits,
        markdown: Boolean(parsed.options.markdown),
        mode,
      }));
    }
  }

  const result = createValidationResult(files, mode);
  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${formatTextResult(result)}\n`);
  }

  if (result.errorCount > 0) return 1;
  if (parsed.options['fail-on-warnings'] && result.warningCount > 0) return 1;

  const maxWarnings = parseOptionalInteger(parsed.options['max-warnings'], '--max-warnings');
  if (maxWarnings !== undefined && result.warningCount > maxWarnings) return 1;

  return 0;
}

async function runRender(parsed: ParsedOptions): Promise<number> {
  const mode = parseMode(parsed.options.mode);
  const theme = String(parsed.options.theme ?? 'clean');
  const limits = parseCliLimits(parsed.options);
  parseRenderFormat(parsed.options.format ?? 'svg');

  let source: string;
  let sourcePath = '<stdin>';

  if (parsed.options.stdin) {
    source = await readStdin(limits.maxSourceBytes);
  } else {
    if (parsed.positionals.length !== 1) {
      throw new CliError('render requires exactly one file or --stdin.');
    }
    const absolutePath = path.resolve(parsed.positionals[0]);
    sourcePath = displayPath(absolutePath);
    assertFileWithinByteLimit(absolutePath, limits.maxSourceBytes);
    source = readFileSync(absolutePath, 'utf8');
  }

  const validationFile = validateMarkuiSource(source, { mode, path: sourcePath, limits });
  const validation = createValidationResult([validationFile], mode);
  if (validation.errorCount > 0 && !parsed.options.force) {
    process.stderr.write(`${formatTextResult(validation)}\n`);
    return 1;
  }

  const rendered = compile(source, { mode, theme, limits });
  const limitErrors = rendered.errors.filter(error => isLimitErrorCode(error.code));
  if (limitErrors.length > 0) {
    process.stderr.write(`${formatParseErrors(limitErrors)}\n`);
    return 1;
  }

  const outPath = parsed.options.out ? path.resolve(String(parsed.options.out)) : undefined;
  if (outPath) {
    if (existsSync(outPath) && !parsed.options.overwrite) {
      throw new CliError(`Output already exists: ${displayPath(outPath)}. Pass --overwrite to replace it.`);
    }
    mkdirSync(path.dirname(outPath), { recursive: true });
    writeFileSync(outPath, rendered.svg, 'utf8');
    process.stdout.write(`Wrote ${displayPath(outPath)}\n`);
  } else {
    process.stdout.write(`${rendered.svg}\n`);
  }

  return 0;
}

function parseOptions(args: string[]): ParsedOptions {
  const options: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--') {
      positionals.push(...args.slice(i + 1));
      break;
    }

    if (arg === '-h') {
      options.help = true;
      continue;
    }
    if (arg === '-v') {
      options.version = true;
      continue;
    }
    if (arg === '-o') {
      const value = args[++i];
      if (!value) throw new CliError('-o requires a value.');
      options.out = value;
      continue;
    }

    if (arg.startsWith('--')) {
      const equalIndex = arg.indexOf('=');
      const key = equalIndex === -1 ? arg.slice(2) : arg.slice(2, equalIndex);
      const inlineValue = equalIndex === -1 ? undefined : arg.slice(equalIndex + 1);

      if (VALUE_FLAGS.has(key)) {
        const value = inlineValue ?? args[++i];
        if (!value) throw new CliError(`--${key} requires a value.`);
        options[key] = value;
        continue;
      }

      if (BOOLEAN_FLAGS.has(key)) {
        if (inlineValue !== undefined) throw new CliError(`--${key} does not accept a value.`);
        options[key] = true;
        continue;
      }

      throw new CliError(`Unknown option: --${key}`);
    }

    positionals.push(arg);
  }

  return { options, positionals };
}

function validateSourceFile(filePath: string, options: { limits: ParseLimits; markdown: boolean; mode: ParseMode }): MarkuiFileResult {
  const absolutePath = path.resolve(filePath);
  assertFileWithinByteLimit(absolutePath, options.limits.maxSourceBytes);
  const source = readFileSync(absolutePath, 'utf8');
  const pathLabel = displayPath(absolutePath);

  return validateSourceText(source, {
    limits: options.limits,
    markdown: options.markdown || isMarkdownPath(absolutePath),
    mode: options.mode,
    path: pathLabel,
  });
}

function validateSourceText(
  source: string,
  options: { limits: ParseLimits; markdown: boolean; mode: ParseMode; path: string }
): MarkuiFileResult {
  return options.markdown
    ? validateMarkdownMarkuiBlocks(source, { limits: options.limits, mode: options.mode, path: options.path })
    : validateMarkuiSource(source, { limits: options.limits, mode: options.mode, path: options.path });
}

function collectInputFiles(inputs: string[], maxFiles: number): string[] {
  const files: string[] = [];
  for (const input of inputs) {
    const absolutePath = path.resolve(input);
    if (!existsSync(absolutePath)) {
      throw new CliError(`Input not found: ${input}`);
    }

    const stat = statSync(absolutePath);
    if (stat.isDirectory()) {
      collectDirectoryFiles(absolutePath, files, maxFiles);
    } else {
      addInputFile(files, absolutePath, maxFiles);
    }
  }
  return files;
}

function collectDirectoryFiles(directory: string, files: string[], maxFiles: number): void {
  const entries = readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      collectDirectoryFiles(entryPath, files, maxFiles);
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.markui') || isMarkdownPath(entry.name))) {
      addInputFile(files, entryPath, maxFiles);
    }
  }
}

function addInputFile(files: string[], filePath: string, maxFiles: number): void {
  if (files.length >= maxFiles) {
    throw new CliError(`Too many input files. Limit is ${maxFiles}; pass --max-files to raise it.`);
  }
  files.push(filePath);
}

function formatTextResult(result: MarkuiValidationResult): string {
  const lines: string[] = [];

  for (const file of result.files) {
    const label = file.path ?? '<source>';
    if (file.blocks.length === 0) {
      lines.push(`${label}: no MarkUI blocks found`);
      continue;
    }

    const diagnostics = file.blocks.flatMap(block => block.errors);
    if (diagnostics.length === 0) {
      const blockLabel = file.blocks.length === 1 ? 'block' : 'blocks';
      lines.push(`OK ${label} (${file.blocks.length} ${blockLabel})`);
      continue;
    }

    for (const diagnostic of diagnostics) {
      lines.push(formatDiagnostic(diagnostic));
    }
  }

  lines.push(`Summary: ${result.errorCount} error(s), ${result.warningCount} warning(s), ${result.infoCount} info`);
  return lines.join('\n');
}

function formatDiagnostic(diagnostic: MarkuiValidationDiagnostic): string {
  const pathLabel = diagnostic.path ?? '<source>';
  const blockLabel = diagnostic.blockName ? `#${diagnostic.blockName}` : '';
  const hint = diagnostic.repairHint ? ` (${diagnostic.repairHint})` : '';
  return `${pathLabel}${blockLabel}:${diagnostic.fileRow}:${diagnostic.fileCol} ${diagnostic.severity} ${diagnostic.code} ${diagnostic.message}${hint}`;
}

function parseMode(value: string | boolean | undefined): ParseMode {
  if (value === undefined) return 'strict';
  if (value === 'strict' || value === 'autofix') return value;
  throw new CliError('--mode must be strict or autofix.');
}

function parseValidationFormat(value: string | boolean | undefined): 'text' | 'json' {
  if (value === undefined) return 'text';
  if (value === 'text' || value === 'json') return value;
  throw new CliError('validate --format must be text or json.');
}

function parseRenderFormat(value: string | boolean | undefined): 'svg' {
  if (value === undefined || value === 'svg') return 'svg';
  throw new CliError('render --format must be svg.');
}

function parseOptionalInteger(value: string | boolean | undefined, optionName: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new CliError(`${optionName} must be a non-negative integer.`);
  }
  return parsed;
}

function parseCliLimits(options: Record<string, string | boolean>): ParseLimits {
  return {
    ...DEFAULT_MARKUI_LIMITS,
    maxSourceBytes: parseOptionalInteger(options['max-bytes'], '--max-bytes') ?? DEFAULT_MARKUI_LIMITS.maxSourceBytes,
    maxSvgBytes: parseOptionalInteger(options['max-svg-bytes'], '--max-svg-bytes') ?? DEFAULT_MARKUI_LIMITS.maxSvgBytes,
  };
}

function assertFileWithinByteLimit(filePath: string, maxBytes: number): void {
  const size = statSync(filePath).size;
  if (size > maxBytes) {
    throw new CliError(`Input too large: ${displayPath(filePath)} is ${size} bytes; limit is ${maxBytes} bytes.`);
  }
}

function isMarkdownPath(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || ext === '.markdown';
}

function displayPath(absolutePath: string): string {
  return path.relative(process.cwd(), absolutePath) || path.basename(absolutePath);
}

async function readStdin(maxBytes: number): Promise<string> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of process.stdin) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > maxBytes) {
      throw new CliError(`stdin input is ${totalBytes} bytes; limit is ${maxBytes} bytes.`);
    }
    chunks.push(buffer);
  }
  const source = Buffer.concat(chunks).toString('utf8');
  const sourceBytes = utf8ByteLength(source);
  if (sourceBytes > maxBytes) {
    throw new CliError(`stdin input is ${sourceBytes} bytes after decoding; limit is ${maxBytes} bytes.`);
  }
  return source;
}

function formatParseErrors(errors: ParseError[]): string {
  return errors
    .map(error => `<source>:${error.row}:${error.col} ${error.severity} ${error.code} ${error.message}`)
    .join('\n');
}

function helpText(): string {
  return [
    'MarkUI command line tools',
    '',
    'Usage:',
    '  markui validate [files-or-directories] [--format text|json] [--mode strict|autofix]',
    '  markui validate --stdin [--markdown] [--format text|json]',
    '  markui render <file> [--out file.svg] [--theme clean] [--mode strict|autofix]',
    '',
    'Options:',
    '  --stdin                 Read MarkUI source from stdin',
    '  --markdown              Treat input as markdown and validate fenced markui blocks',
    '  --format <text|json>    Output format for validate',
    '  --format <svg>          Output format for render',
    '  --mode <strict|autofix> Parser mode, default strict',
    '  --fail-on-warnings      Exit 1 when warnings are present',
    '  --max-warnings <n>      Exit 1 when warning count exceeds n',
    '  --max-bytes <n>         Maximum input bytes, default 1000000',
    '  --max-files <n>         Maximum files when validating directories, default 1000',
    '  --max-svg-bytes <n>     Maximum rendered SVG bytes, default 2000000',
    '  --theme <name>          Render theme, default clean',
    '  -o, --out <file>        Write render output to a file',
    '  --force                 Render even when validation reports errors',
    '  --overwrite             Replace an existing --out file',
    '  -h, --help              Show this help',
    '  -v, --version           Show version',
    '',
  ].join('\n');
}

main()
  .then(code => {
    process.exitCode = code;
  })
  .catch(error => {
    if (error instanceof CliError) {
      process.stderr.write(`${error.message}\n`);
      process.stderr.write('Run `markui --help` for usage.\n');
      process.exitCode = error.exitCode;
      return;
    }

    process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    process.exitCode = 2;
  });
