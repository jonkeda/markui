export * from './types';
export { parse } from './parser';
export { renderToSvg } from './renderer/svg-renderer';
export { getTheme, cleanTheme, sketchTheme, blueprintTheme } from './renderer/themes';

import { parse } from './parser';
import { renderToSvg } from './renderer/svg-renderer';
import { getTheme } from './renderer/themes';
import type { ParseMode, ParseError, WidgetNode } from './types';

/** Convenience: parse + render in one call */
export function compile(
  source: string,
  options?: { mode?: ParseMode; theme?: string }
): { svg: string; errors: ParseError[]; tree: WidgetNode } {
  const result = parse(source, { mode: options?.mode });
  const theme = getTheme(options?.theme ?? 'clean');
  const svg = renderToSvg(result.tree, theme);
  return { svg, errors: result.errors, tree: result.tree };
}
