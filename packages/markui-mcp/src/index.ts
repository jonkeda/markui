#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { compile } from '@jonkeda/markui-core';
import {
  createValidationResult,
  getRepairHintForCode,
  validateMarkdownMarkuiBlocks,
  validateMarkuiSource,
} from '@jonkeda/markui-validator';
import type { ParseMode } from '@jonkeda/markui-validator';
import * as z from 'zod/v4';

const VERSION = '0.1.0';
const modeSchema = z.enum(['strict', 'autofix']);

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  process.stdout.write(helpText());
  process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  process.stdout.write(`markui-mcp ${VERSION}\n`);
  process.exit(0);
}

const server = new McpServer({
  name: 'markui-mcp',
  version: VERSION,
});

server.registerTool('validate_markui', {
  title: 'Validate MarkUI',
  description: 'Validate MarkUI source text and return parser diagnostics using the shared MarkUI validation contract.',
  inputSchema: {
    source: z.string().describe('Raw MarkUI source text.'),
    mode: modeSchema.optional().describe('Parser mode. Defaults to strict.'),
    sourceName: z.string().optional().describe('Optional label to include in diagnostics, such as generated.markui.'),
  },
}, async ({ source, mode, sourceName }) => {
  const parsedMode = parseMode(mode);
  const file = validateMarkuiSource(source, {
    mode: parsedMode,
    path: sourceName ?? 'generated.markui',
  });
  const result = createValidationResult([file], parsedMode);
  return structuredToolResult(result);
});

server.registerTool('validate_markdown_markui_blocks', {
  title: 'Validate Markdown MarkUI Blocks',
  description: 'Extract and validate fenced ```markui and ```markui:name blocks from markdown source text.',
  inputSchema: {
    source: z.string().describe('Markdown source containing optional fenced MarkUI blocks.'),
    mode: modeSchema.optional().describe('Parser mode. Defaults to strict.'),
    sourceName: z.string().optional().describe('Optional label to include in diagnostics, such as README.md.'),
  },
}, async ({ source, mode, sourceName }) => {
  const parsedMode = parseMode(mode);
  const file = validateMarkdownMarkuiBlocks(source, {
    mode: parsedMode,
    path: sourceName ?? 'document.md',
  });
  const result = createValidationResult([file], parsedMode);
  return structuredToolResult(result);
});

server.registerTool('render_markui_svg', {
  title: 'Render MarkUI SVG',
  description: 'Render MarkUI source text to SVG. By default, rendering stops when strict validation reports errors.',
  inputSchema: {
    source: z.string().describe('Raw MarkUI source text.'),
    mode: modeSchema.optional().describe('Parser mode. Defaults to strict.'),
    theme: z.string().optional().describe('Renderer theme. Defaults to clean.'),
    sourceName: z.string().optional().describe('Optional label to include in diagnostics, such as generated.markui.'),
    force: z.boolean().optional().describe('Render even when validation reports errors.'),
  },
}, async ({ source, mode, theme, sourceName, force }) => {
  const parsedMode = parseMode(mode);
  const validationFile = validateMarkuiSource(source, {
    mode: parsedMode,
    path: sourceName ?? 'generated.markui',
  });
  const validation = createValidationResult([validationFile], parsedMode);

  if (validation.errorCount > 0 && !force) {
    return structuredToolResult({
      ok: false,
      svg: null,
      validation,
    }, true);
  }

  const rendered = compile(source, {
    mode: parsedMode,
    theme: theme ?? 'clean',
  });

  return structuredToolResult({
    ok: validation.errorCount === 0,
    svg: rendered.svg,
    validation,
  });
});

server.registerTool('explain_markui_diagnostic', {
  title: 'Explain MarkUI Diagnostic',
  description: 'Return focused repair guidance for a MarkUI diagnostic code.',
  inputSchema: {
    code: z.string().describe('Diagnostic code such as BRACKET_UNCLOSED or BOX_UNCLOSED_TOP.'),
  },
}, async ({ code }) => {
  const repairHint = getRepairHintForCode(code) ?? 'No specific repair hint is registered for this diagnostic code.';
  return structuredToolResult({
    code,
    repairHint,
  });
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function parseMode(mode: 'strict' | 'autofix' | undefined): ParseMode {
  return mode ?? 'strict';
}

function structuredToolResult(value: unknown, isError = false) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(value, null, 2),
      },
    ],
    structuredContent: value as Record<string, unknown>,
    ...(isError ? { isError: true } : {}),
  };
}

function helpText(): string {
  return [
    'MarkUI MCP server',
    '',
    'Usage:',
    '  markui-mcp',
    '',
    'Transport:',
    '  stdio',
    '',
    'Tools:',
    '  validate_markui',
    '  validate_markdown_markui_blocks',
    '  render_markui_svg',
    '  explain_markui_diagnostic',
    '',
  ].join('\n');
}

main().catch(error => {
  process.stderr.write(`markui-mcp failed: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
