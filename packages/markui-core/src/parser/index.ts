import { ParseOptions, ParseResult, ParseError, WidgetNode, TokenMap, LineToken } from '../types';
import { validateBoxLimit, validateSourceLimits, validateTokenLimit } from '../limits';
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
  const limitErrors = validateSourceLimits(source, options?.limits);
  if (limitErrors.length > 0) {
    return { tree: emptyDocument(), errors: limitErrors, boxes: [], mode };
  }

  // Phase 1: Load Grid
  const grid = loadGrid(source);

  // Phase 2: Detect Boxes
  const { boxes, errors: boxErrors } = detectBoxes(grid, mode);
  errors.push(...boxErrors);

  const boxLimitErrors = validateBoxLimit(boxes.length, options?.limits);
  if (boxLimitErrors.length > 0) {
    errors.push(...boxLimitErrors);
    return { tree: emptyDocument(), errors, boxes: [], mode };
  }

  // Phase 3: Extract Content
  const { contentMap, errors: contentErrors } = extractContent(grid, boxes);
  errors.push(...contentErrors);

  // Phase 4: Tokenize Lines
  const { tokenMap, errors: tokenErrors } = tokenizeLines(contentMap, mode);
  errors.push(...tokenErrors);

  const tokenLimitErrors = validateTokenLimit(countTokens(tokenMap), options?.limits);
  if (tokenLimitErrors.length > 0) {
    errors.push(...tokenLimitErrors);
    return { tree: emptyDocument(), errors, boxes: [], mode };
  }

  // Phase 5: Multi-Line Merge
  const { mergedMap, errors: mergeErrors } = mergeMultiLine(tokenMap, mode);
  errors.push(...mergeErrors);

  // Phase 6: Layout Resolution
  const { layoutMap } = resolveLayout(mergedMap);

  // Phase 7: Build Tree
  const tree = buildTree(boxes, layoutMap, grid);

  return { tree, errors, boxes, mode };
}

function emptyDocument(): WidgetNode {
  return {
    type: 'Document',
    text: '',
    row: 0,
    col: 0,
    width: 0,
    height: 0,
    children: [],
  };
}

function countTokens(tokenMap: TokenMap): number {
  let count = 0;
  for (const entry of tokenMap.values()) {
    count += countTokenLines(entry.tokens);
    if (entry.columns) {
      for (const column of entry.columns) {
        count += countTokenLines(column.tokens);
      }
    }
  }
  return count;
}

function countTokenLines(lines: LineToken[][]): number {
  let count = 0;
  for (const line of lines) {
    for (const token of line) {
      count += countToken(token);
    }
  }
  return count;
}

function countToken(token: LineToken): number {
  return 1 + (token.children?.reduce((sum, child) => sum + countToken(child), 0) ?? 0);
}
