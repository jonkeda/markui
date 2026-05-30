"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MARKUI_LIMITS = void 0;
exports.resolveMarkuiLimits = resolveMarkuiLimits;
exports.validateSourceLimits = validateSourceLimits;
exports.validateBoxLimit = validateBoxLimit;
exports.validateTokenLimit = validateTokenLimit;
exports.validateSvgLimit = validateSvgLimit;
exports.isLimitErrorCode = isLimitErrorCode;
exports.utf8ByteLength = utf8ByteLength;
exports.DEFAULT_MARKUI_LIMITS = {
    maxSourceBytes: 1000000,
    maxLines: 5000,
    maxColumns: 1000,
    maxBoxes: 1000,
    maxTokens: 20000,
    maxSvgBytes: 2000000,
};
const LIMIT_ERROR_CODES = new Set([
    'SOURCE_TOO_LARGE',
    'SOURCE_TOO_MANY_LINES',
    'SOURCE_LINE_TOO_LONG',
    'SOURCE_TOO_MANY_BOXES',
    'SOURCE_TOO_MANY_TOKENS',
    'SVG_TOO_LARGE',
]);
function resolveMarkuiLimits(limits) {
    if (limits === false)
        return false;
    return { ...exports.DEFAULT_MARKUI_LIMITS, ...limits };
}
function validateSourceLimits(source, limits) {
    const resolved = resolveMarkuiLimits(limits);
    if (resolved === false)
        return [];
    const errors = [];
    const sourceBytes = utf8ByteLength(source);
    if (sourceBytes > resolved.maxSourceBytes) {
        errors.push(limitError('SOURCE_TOO_LARGE', `MarkUI source is ${sourceBytes} bytes, which exceeds the ${resolved.maxSourceBytes} byte limit.`));
    }
    const lines = source.split(/\r?\n/);
    if (lines.length > resolved.maxLines) {
        errors.push(limitError('SOURCE_TOO_MANY_LINES', `MarkUI source has ${lines.length} lines, which exceeds the ${resolved.maxLines} line limit.`));
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
        errors.push(limitError('SOURCE_LINE_TOO_LONG', `Line ${maxColumnRow} has ${maxColumns} columns, which exceeds the ${resolved.maxColumns} column limit.`, maxColumnRow));
    }
    return errors;
}
function validateBoxLimit(boxCount, limits) {
    const resolved = resolveMarkuiLimits(limits);
    if (resolved === false || boxCount <= resolved.maxBoxes)
        return [];
    return [limitError('SOURCE_TOO_MANY_BOXES', `MarkUI source produced ${boxCount} boxes, which exceeds the ${resolved.maxBoxes} box limit.`)];
}
function validateTokenLimit(tokenCount, limits) {
    const resolved = resolveMarkuiLimits(limits);
    if (resolved === false || tokenCount <= resolved.maxTokens)
        return [];
    return [limitError('SOURCE_TOO_MANY_TOKENS', `MarkUI source produced ${tokenCount} tokens, which exceeds the ${resolved.maxTokens} token limit.`)];
}
function validateSvgLimit(svg, limits) {
    const resolved = resolveMarkuiLimits(limits);
    if (resolved === false)
        return [];
    const svgBytes = utf8ByteLength(svg);
    if (svgBytes <= resolved.maxSvgBytes)
        return [];
    return [limitError('SVG_TOO_LARGE', `Rendered SVG is ${svgBytes} bytes, which exceeds the ${resolved.maxSvgBytes} byte limit.`)];
}
function isLimitErrorCode(code) {
    return LIMIT_ERROR_CODES.has(code);
}
function utf8ByteLength(value) {
    let bytes = 0;
    for (const ch of value) {
        const cp = ch.codePointAt(0) ?? 0;
        if (cp <= 0x7f)
            bytes += 1;
        else if (cp <= 0x7ff)
            bytes += 2;
        else if (cp <= 0xffff)
            bytes += 3;
        else
            bytes += 4;
    }
    return bytes;
}
function limitError(code, message, row = 1) {
    return {
        code,
        message,
        row,
        col: 1,
        severity: 'error',
        phase: 1,
    };
}
//# sourceMappingURL=limits.js.map