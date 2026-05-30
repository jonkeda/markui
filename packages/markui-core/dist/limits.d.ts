import type { ParseError, ParseLimits } from './types';
export declare const DEFAULT_MARKUI_LIMITS: ParseLimits;
export declare function resolveMarkuiLimits(limits?: Partial<ParseLimits> | false): ParseLimits | false;
export declare function validateSourceLimits(source: string, limits?: Partial<ParseLimits> | false): ParseError[];
export declare function validateBoxLimit(boxCount: number, limits?: Partial<ParseLimits> | false): ParseError[];
export declare function validateTokenLimit(tokenCount: number, limits?: Partial<ParseLimits> | false): ParseError[];
export declare function validateSvgLimit(svg: string, limits?: Partial<ParseLimits> | false): ParseError[];
export declare function isLimitErrorCode(code: string): boolean;
export declare function utf8ByteLength(value: string): number;
//# sourceMappingURL=limits.d.ts.map