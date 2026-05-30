export * from './types';
export * from './limits';
export { parse } from './parser';
export { renderToSvg } from './renderer/svg-renderer';
export { getTheme, cleanTheme, sketchTheme, blueprintTheme } from './renderer/themes';

import { parse } from './parser';
import { renderToSvg } from './renderer/svg-renderer';
import { getTheme } from './renderer/themes';
import { validateSvgLimit } from './limits';
import type { ParseMode, ParseError, WidgetNode, ParseLimits } from './types';

/** Convenience: parse + render in one call */
export function compile(
  source: string,
  options?: { mode?: ParseMode; theme?: string; limits?: Partial<ParseLimits> | false }
): { svg: string; errors: ParseError[]; tree: WidgetNode } {
  const result = parse(source, { mode: options?.mode, limits: options?.limits });
  const theme = getTheme(options?.theme ?? 'clean');
  let svg = renderToSvg(result.tree, theme);
  const svgLimitErrors = validateSvgLimit(svg, options?.limits);
  const errors = [...result.errors, ...svgLimitErrors];
  if (svgLimitErrors.length > 0) {
    svg = '';
  }
  return { svg, errors, tree: result.tree };
}
