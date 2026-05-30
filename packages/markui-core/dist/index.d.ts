export * from './types';
export * from './limits';
export { parse } from './parser';
export { renderToSvg } from './renderer/svg-renderer';
export { getTheme, cleanTheme, sketchTheme, blueprintTheme } from './renderer/themes';
import type { ParseMode, ParseError, WidgetNode, ParseLimits } from './types';
/** Convenience: parse + render in one call */
export declare function compile(source: string, options?: {
    mode?: ParseMode;
    theme?: string;
    limits?: Partial<ParseLimits> | false;
}): {
    svg: string;
    errors: ParseError[];
    tree: WidgetNode;
};
//# sourceMappingURL=index.d.ts.map