import { parse } from '@jonkeda/markui-core';
import type { ParseError, ParseMode, ParseLimits } from '@jonkeda/markui-core';

export type { ParseError, ParseMode };

export type MarkuiSourceKind = 'markui' | 'markdown';

export interface MarkuiValidationDiagnostic extends ParseError {
  path?: string;
  blockName: string | null;
  blockIndex: number;
  blockStartLine: number;
  fileRow: number;
  fileCol: number;
  repairHint?: string;
}

export interface MarkuiBlockResult {
  name: string | null;
  blockIndex: number;
  startLine: number;
  ok: boolean;
  errors: MarkuiValidationDiagnostic[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface MarkuiFileResult {
  path?: string;
  kind: MarkuiSourceKind;
  ok: boolean;
  blocks: MarkuiBlockResult[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface MarkuiValidationResult {
  ok: boolean;
  mode: ParseMode;
  files: MarkuiFileResult[];
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

export interface ValidateSourceOptions {
  mode?: ParseMode;
  path?: string;
  limits?: Partial<ParseLimits> | false;
}

export interface ValidateMarkdownOptions extends ValidateSourceOptions {}

interface BlockContext {
  path?: string;
  blockName: string | null;
  blockIndex: number;
  blockStartLine: number;
  limits?: Partial<ParseLimits> | false;
}

const MARKUI_FENCE_RE = /^([ \t]*)(`{3,}|~{3,})[ \t]*markui(?::([\w.-]+))?[^\S\r\n]*\r?\n([\s\S]*?)^\1\2[ \t]*(?:\r?\n|$)/gm;

const REPAIR_HINTS: Record<string, string> = {
  BOX_UNCLOSED_TOP: 'Close the box with a matching bottom border, or use a valid open-right box shape.',
  BOX_MISALIGNED: 'Align the vertical border with the matching top or bottom corner.',
  BOX_OVERLAP: 'Nest boxes completely or separate them so their borders do not overlap.',
  BRACKET_UNCLOSED: 'Close the widget with the matching bracket before the line ends.',
  BRACKET_MISMATCH: 'Use matching bracket families: [..], <..>, {..}, or (..).',
  DROPDOWN_NO_CLOSE: 'Close the expanded dropdown options with -> before leaving the dropdown.',
  ACCORDION_NO_CLOSE: 'Close the expanded accordion body before the next unrelated block.',
  COMPONENT_NOT_FOUND: 'Define the named component block before referencing it, or remove the component reference.',
};

export function validateMarkuiSource(source: string, options: ValidateSourceOptions = {}): MarkuiFileResult {
  const mode = options.mode ?? 'strict';
  const block = validateBlock(source, mode, {
    path: options.path,
    blockName: null,
    blockIndex: 0,
    blockStartLine: 1,
    limits: options.limits,
  });

  return buildFileResult({
    path: options.path,
    kind: 'markui',
    blocks: [block],
  });
}

export function validateMarkdownMarkuiBlocks(source: string, options: ValidateMarkdownOptions = {}): MarkuiFileResult {
  const mode = options.mode ?? 'strict';
  const blocks: MarkuiBlockResult[] = [];
  MARKUI_FENCE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = MARKUI_FENCE_RE.exec(source)) !== null) {
    const blockName = match[3] ?? null;
    const blockSource = match[4].replace(/\r?\n$/, '');
    const contentStartIndex = match.index + firstLineLength(match[0]);
    const blockStartLine = lineNumberAt(source, contentStartIndex);

    blocks.push(validateBlock(blockSource, mode, {
      path: options.path,
      blockName,
      blockIndex: blocks.length,
      blockStartLine,
      limits: options.limits,
    }));
  }

  return buildFileResult({
    path: options.path,
    kind: 'markdown',
    blocks,
  });
}

export function createValidationResult(files: MarkuiFileResult[], mode: ParseMode = 'strict'): MarkuiValidationResult {
  const counts = countFiles(files);
  return {
    ok: counts.errorCount === 0,
    mode,
    files,
    ...counts,
  };
}

export function getRepairHint(error: ParseError): string | undefined {
  return error.fix?.description ?? REPAIR_HINTS[error.code];
}

export function getRepairHintForCode(code: string): string | undefined {
  return REPAIR_HINTS[code];
}

function validateBlock(source: string, mode: ParseMode, context: BlockContext): MarkuiBlockResult {
  const result = parse(source, { mode, limits: context.limits });
  const errors = result.errors.map(error => toValidationDiagnostic(error, context));
  const counts = countDiagnostics(errors);

  return {
    name: context.blockName,
    blockIndex: context.blockIndex,
    startLine: context.blockStartLine,
    ok: counts.errorCount === 0,
    errors,
    ...counts,
  };
}

function toValidationDiagnostic(error: ParseError, context: BlockContext): MarkuiValidationDiagnostic {
  const rowOffset = error.row > 0 ? error.row - 1 : error.row;
  const fileRow = context.blockStartLine + Math.max(0, rowOffset);
  const fileCol = error.col > 0 ? error.col : 1;
  const repairHint = getRepairHint(error);

  return {
    ...error,
    path: context.path,
    blockName: context.blockName,
    blockIndex: context.blockIndex,
    blockStartLine: context.blockStartLine,
    fileRow,
    fileCol,
    ...(repairHint ? { repairHint } : {}),
  };
}

function buildFileResult(input: {
  path?: string;
  kind: MarkuiSourceKind;
  blocks: MarkuiBlockResult[];
}): MarkuiFileResult {
  const counts = countBlocks(input.blocks);
  return {
    path: input.path,
    kind: input.kind,
    ok: counts.errorCount === 0,
    blocks: input.blocks,
    ...counts,
  };
}

function countDiagnostics(errors: ParseError[]): Pick<MarkuiBlockResult, 'errorCount' | 'warningCount' | 'infoCount'> {
  return {
    errorCount: errors.filter(error => error.severity === 'error').length,
    warningCount: errors.filter(error => error.severity === 'warning').length,
    infoCount: errors.filter(error => error.severity === 'info').length,
  };
}

function countBlocks(blocks: MarkuiBlockResult[]): Pick<MarkuiFileResult, 'errorCount' | 'warningCount' | 'infoCount'> {
  return {
    errorCount: blocks.reduce((sum, block) => sum + block.errorCount, 0),
    warningCount: blocks.reduce((sum, block) => sum + block.warningCount, 0),
    infoCount: blocks.reduce((sum, block) => sum + block.infoCount, 0),
  };
}

function countFiles(files: MarkuiFileResult[]): Pick<MarkuiValidationResult, 'errorCount' | 'warningCount' | 'infoCount'> {
  return {
    errorCount: files.reduce((sum, file) => sum + file.errorCount, 0),
    warningCount: files.reduce((sum, file) => sum + file.warningCount, 0),
    infoCount: files.reduce((sum, file) => sum + file.infoCount, 0),
  };
}

function firstLineLength(text: string): number {
  const newline = text.match(/\r?\n/);
  return newline && newline.index !== undefined
    ? newline.index + newline[0].length
    : text.length;
}

function lineNumberAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}
