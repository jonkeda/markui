import type { ParseError, ParseLimits } from './types';

export const DEFAULT_MARKUI_LIMITS: ParseLimits = {
  maxSourceBytes: 1_000_000,
  maxLines: 5_000,
  maxColumns: 1_000,
  maxBoxes: 1_000,
  maxTokens: 20_000,
  maxSvgBytes: 2_000_000,
};

const LIMIT_ERROR_CODES = new Set([
  'SOURCE_TOO_LARGE',
  'SOURCE_TOO_MANY_LINES',
  'SOURCE_LINE_TOO_LONG',
  'SOURCE_TOO_MANY_BOXES',
  'SOURCE_TOO_MANY_TOKENS',
  'SVG_TOO_LARGE',
]);

export function resolveMarkuiLimits(limits?: Partial<ParseLimits> | false): ParseLimits | false {
  if (limits === false) return false;
  return { ...DEFAULT_MARKUI_LIMITS, ...limits };
}

export function validateSourceLimits(
  source: string,
  limits?: Partial<ParseLimits> | false
): ParseError[] {
  const resolved = resolveMarkuiLimits(limits);
  if (resolved === false) return [];

  const errors: ParseError[] = [];
  const sourceBytes = utf8ByteLength(source);
  if (sourceBytes > resolved.maxSourceBytes) {
    errors.push(limitError(
      'SOURCE_TOO_LARGE',
      `MarkUI source is ${sourceBytes} bytes, which exceeds the ${resolved.maxSourceBytes} byte limit.`
    ));
  }

  const lines = source.split(/\r?\n/);
  if (lines.length > resolved.maxLines) {
    errors.push(limitError(
      'SOURCE_TOO_MANY_LINES',
      `MarkUI source has ${lines.length} lines, which exceeds the ${resolved.maxLines} line limit.`
    ));
  }

  let maxColumns = 0;
  let maxColumnRow = 1;
  for (let i = 0; i < lines.length; i++) {
    const columns = Array.from(lines[i]).length;
    if (columns > maxColumns) {
      maxColumns = columns;
      maxColumnRow = i + 1;
    }
  }

  if (maxColumns > resolved.maxColumns) {
    errors.push(limitError(
      'SOURCE_LINE_TOO_LONG',
      `Line ${maxColumnRow} has ${maxColumns} columns, which exceeds the ${resolved.maxColumns} column limit.`,
      maxColumnRow
    ));
  }

  return errors;
}

export function validateBoxLimit(
  boxCount: number,
  limits?: Partial<ParseLimits> | false
): ParseError[] {
  const resolved = resolveMarkuiLimits(limits);
  if (resolved === false || boxCount <= resolved.maxBoxes) return [];
  return [limitError(
    'SOURCE_TOO_MANY_BOXES',
    `MarkUI source produced ${boxCount} boxes, which exceeds the ${resolved.maxBoxes} box limit.`
  )];
}

export function validateTokenLimit(
  tokenCount: number,
  limits?: Partial<ParseLimits> | false
): ParseError[] {
  const resolved = resolveMarkuiLimits(limits);
  if (resolved === false || tokenCount <= resolved.maxTokens) return [];
  return [limitError(
    'SOURCE_TOO_MANY_TOKENS',
    `MarkUI source produced ${tokenCount} tokens, which exceeds the ${resolved.maxTokens} token limit.`
  )];
}

export function validateSvgLimit(
  svg: string,
  limits?: Partial<ParseLimits> | false
): ParseError[] {
  const resolved = resolveMarkuiLimits(limits);
  if (resolved === false) return [];

  const svgBytes = utf8ByteLength(svg);
  if (svgBytes <= resolved.maxSvgBytes) return [];

  return [limitError(
    'SVG_TOO_LARGE',
    `Rendered SVG is ${svgBytes} bytes, which exceeds the ${resolved.maxSvgBytes} byte limit.`
  )];
}

export function isLimitErrorCode(code: string): boolean {
  return LIMIT_ERROR_CODES.has(code);
}

export function utf8ByteLength(value: string): number {
  let bytes = 0;
  for (const ch of value) {
    const cp = ch.codePointAt(0) ?? 0;
    if (cp <= 0x7f) bytes += 1;
    else if (cp <= 0x7ff) bytes += 2;
    else if (cp <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

function limitError(code: string, message: string, row = 1): ParseError {
  return {
    code,
    message,
    row,
    col: 1,
    severity: 'error',
    phase: 1,
  };
}
