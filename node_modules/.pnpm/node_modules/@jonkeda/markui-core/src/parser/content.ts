import { Grid, Box, ContentLine, ColumnRegion, ContentEntry, ContentMap, ParseError } from '../types';

function boxContentKey(boxIndex: number): string {
  return `box:${boxIndex}`;
}

export const ROOT_KEY = 'root';

export function extractContent(
  grid: Grid,
  boxes: Box[]
): { contentMap: ContentMap; errors: ParseError[] } {
  const contentMap: ContentMap = new Map();
  const errors: ParseError[] = [];

  // Track which cells are covered by box borders
  const borderCells = new Set<string>();
  for (let bi = 0; bi < boxes.length; bi++) {
    const b = boxes[bi];
    // Top and bottom borders
    for (let c = b.left; c <= b.right; c++) {
      borderCells.add(`${b.top},${c}`);
      borderCells.add(`${b.bottom},${c}`);
    }
    // Left border
    for (let r = b.top; r <= b.bottom; r++) {
      borderCells.add(`${r},${b.left}`);
    }
    // Right border
    if (b.hasRightBorder) {
      for (let r = b.top; r <= b.bottom; r++) {
        borderCells.add(`${r},${b.right}`);
      }
    }
    // Column dividers
    for (const dc of b.columnDividers) {
      for (let r = b.top; r <= b.bottom; r++) {
        borderCells.add(`${r},${dc}`);
      }
    }
    // Resize dividers
    for (const dc of b.resizeDividers) {
      for (let r = b.top; r <= b.bottom; r++) {
        borderCells.add(`${r},${dc}`);
      }
    }
  }

  // Extract content for each box
  for (let bi = 0; bi < boxes.length; bi++) {
    const b = boxes[bi];
    const entry = extractBoxContent(grid, b, boxes, bi);
    contentMap.set(boxContentKey(bi), entry);
  }

  // Extract root-level content (not inside any box)
  const rootLines = extractRootContent(grid, boxes);
  if (rootLines.length > 0) {
    contentMap.set(ROOT_KEY, { lines: rootLines });
  }

  return { contentMap, errors };
}

function extractBoxContent(
  grid: Grid,
  box: Box,
  allBoxes: Box[],
  boxIndex: number
): ContentEntry {
  const contentTop = box.top + 1;
  const contentBottom = box.bottom - 1;
  const contentLeft = box.left + 1;
  const contentRight = box.hasRightBorder ? box.right - 1 : grid.width - 1;

  // If box has column dividers or resize dividers, split into column regions
  const allDividers = [...box.columnDividers, ...box.resizeDividers].sort((a, b) => a - b);
  if (allDividers.length > 0) {
    const dividers = allDividers;
    const columns: ColumnRegion[] = [];

    const edges = [contentLeft, ...dividers.map(d => d), contentRight + 1];
    for (let ci = 0; ci < edges.length - 1; ci++) {
      const colLeft = ci === 0 ? edges[ci] : edges[ci] + 1;
      const colRight = edges[ci + 1] - 1;
      if (colRight < colLeft) continue;

      const colLines: ContentLine[] = [];
      for (let r = contentTop; r <= contentBottom; r++) {
        // Skip rows covered by child boxes
        if (isRowCoveredByChild(r, colLeft, colRight, box, allBoxes, boxIndex)) continue;

        let lineChars: string[] = [];
        for (let c = colLeft; c <= colRight; c++) {
          lineChars.push(grid.rows[r][c]);
        }
        const lineText = lineChars.join('');
        colLines.push({ text: lineText, row: r, colOffset: colLeft });
      }
      columns.push({ left: colLeft, right: colRight, lines: colLines });
    }

    // Also collect all lines for the main lines array
    const allLines: ContentLine[] = [];
    for (let r = contentTop; r <= contentBottom; r++) {
      if (isRowCoveredByChild(r, contentLeft, contentRight, box, allBoxes, boxIndex)) continue;
      let lineChars: string[] = [];
      for (let c = contentLeft; c <= contentRight; c++) {
        const ch = allDividers.includes(c) ? ' ' : grid.rows[r][c];
        lineChars.push(ch);
      }
      allLines.push({ text: lineChars.join(''), row: r, colOffset: contentLeft });
    }

    return { lines: allLines, columns };
  }

  // No column dividers — extract content lines
  const lines: ContentLine[] = [];
  for (let r = contentTop; r <= contentBottom; r++) {
    // Skip rows fully covered by child boxes
    if (isRowCoveredByChild(r, contentLeft, contentRight, box, allBoxes, boxIndex)) continue;

    let lineChars: string[] = [];
    for (let c = contentLeft; c <= contentRight; c++) {
      lineChars.push(grid.rows[r][c]);
    }
    lines.push({ text: lineChars.join(''), row: r, colOffset: contentLeft });
  }

  return { lines };
}

function isRowCoveredByChild(
  row: number,
  colLeft: number,
  colRight: number,
  parentBox: Box,
  allBoxes: Box[],
  parentIndex: number
): boolean {
  for (const child of parentBox.children) {
    if (row >= child.top && row <= child.bottom && child.left <= colRight && child.right >= colLeft) {
      return true;
    }
  }
  return false;
}

function extractRootContent(grid: Grid, boxes: Box[]): ContentLine[] {
  const lines: ContentLine[] = [];
  const rootBoxes = boxes.filter(b => !b.parent);

  for (let r = 0; r < grid.height; r++) {
    // Check if this row is inside any root-level box
    let coveredByBox = false;
    for (const b of rootBoxes) {
      if (r >= b.top && r <= b.bottom) {
        coveredByBox = true;
        break;
      }
    }
    if (coveredByBox) continue;

    const lineText = grid.rows[r].join('');
    if (lineText.trim().length > 0) {
      lines.push({ text: lineText, row: r, colOffset: 0 });
    }
  }

  return lines;
}
