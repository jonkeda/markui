import { ParseOptions, ParseResult, ParseError } from '../types';
import { loadGrid } from './grid';
import { detectBoxes } from './boxes';
import { extractContent } from './content';
import { tokenizeLines } from './tokenizer';
import { mergeMultiLine } from './merger';
import { resolveLayout } from './layout';
import { buildTree } from './tree-builder';

export function parse(source: string, options?: ParseOptions): ParseResult {
  const mode = options?.mode ?? 'autofix';
  const errors: ParseError[] = [];

  // Phase 1: Load Grid
  const grid = loadGrid(source);

  // Phase 2: Detect Boxes
  const { boxes, errors: boxErrors } = detectBoxes(grid, mode);
  errors.push(...boxErrors);

  // Phase 3: Extract Content
  const { contentMap, errors: contentErrors } = extractContent(grid, boxes);
  errors.push(...contentErrors);

  // Phase 4: Tokenize Lines
  const { tokenMap, errors: tokenErrors } = tokenizeLines(contentMap, mode);
  errors.push(...tokenErrors);

  // Phase 5: Multi-Line Merge
  const { mergedMap, errors: mergeErrors } = mergeMultiLine(tokenMap, mode);
  errors.push(...mergeErrors);

  // Phase 6: Layout Resolution
  const { layoutMap } = resolveLayout(mergedMap);

  // Phase 7: Build Tree
  const tree = buildTree(boxes, layoutMap, grid);

  return { tree, errors, boxes, mode };
}
