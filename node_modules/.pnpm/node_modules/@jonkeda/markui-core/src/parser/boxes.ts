import { Grid, Box, BorderStyle, CornerChar, ParseError, ParseMode } from '../types';

function isCorner(ch: string): ch is CornerChar {
  return ch === '+' || ch === '*';
}

function isHBorder(ch: string): boolean {
  return ch === '-' || ch === '#' || ch === '.';
}

function isVBorder(ch: string): boolean {
  return ch === '|' || ch === '#' || ch === '.';
}

function boxArea(b: Box): number {
  return (b.bottom - b.top) * (b.right - b.left);
}

function contains(outer: Box, inner: Box): boolean {
  return (
    outer.top <= inner.top &&
    outer.left <= inner.left &&
    outer.bottom >= inner.bottom &&
    outer.right >= inner.right &&
    (outer.top !== inner.top || outer.left !== inner.left || outer.bottom !== inner.bottom || outer.right !== inner.right)
  );
}

function countLeadingPlus(grid: Grid, r: number, c: number): number {
  let count = 0;
  while (c + count < grid.width && grid.rows[r][c + count] === '+') {
    count++;
  }
  return count;
}

function isDashedBorder(grid: Grid, r: number, c1: number, c2: number): boolean {
  let dashCount = 0;
  let spaceCount = 0;
  for (let c = c1; c <= c2; c++) {
    const ch = grid.rows[r][c];
    if (ch === '-') dashCount++;
    else if (ch === ' ') spaceCount++;
  }
  return dashCount > 0 && spaceCount > 0 && spaceCount >= dashCount * 0.3;
}

function extractTitle(grid: Grid, box: Box): void {
  const r = box.top;
  const left = box.left + 1;
  const right = box.right - 1;
  if (right <= left) return;

  let titleChars: string[] = [];
  let inTitle = false;

  for (let c = left; c <= right; c++) {
    const ch = grid.rows[r][c];
    if (ch !== '-' && ch !== '#' && ch !== '.' && ch !== ' ') {
      inTitle = true;
      titleChars.push(ch);
    } else if (inTitle && ch === ' ') {
      titleChars.push(ch);
    } else if (inTitle && (ch === '-' || ch === '#' || ch === '.')) {
      break;
    }
  }

  const title = titleChars.join('').trim();
  if (title.length > 0) {
    box.title = title;
    // Check for @TypeName
    const typeMatch = title.match(/@(\w+)/);
    if (typeMatch) {
      box.typeName = typeMatch[1];
      box.title = title.replace(/@\w+/, '').trim() || undefined;
    }
  }
}

function detectTabsOnBorder(grid: Grid, box: Box): { tabs: { text: string; active: boolean; col: number }[] } | null {
  const r = box.top;
  const tabs: { text: string; active: boolean; col: number }[] = [];
  let c = box.left + 1;
  const maxC = box.right;

  while (c < maxC) {
    const ch = grid.rows[r][c];
    if (ch === '[') {
      // Check for [[active]]
      if (c + 1 < maxC && grid.rows[r][c + 1] === '[') {
        const start = c + 2;
        let end = start;
        while (end < maxC - 1 && !(grid.rows[r][end] === ']' && grid.rows[r][end + 1] === ']')) {
          end++;
        }
        if (end < maxC - 1) {
          const text = grid.rows[r].slice(start, end).join('');
          tabs.push({ text, active: true, col: c });
          c = end + 2;
          continue;
        }
      }
      // Regular [tab]
      const start = c + 1;
      let end = start;
      while (end < maxC && grid.rows[r][end] !== ']') {
        end++;
      }
      if (end < maxC) {
        const text = grid.rows[r].slice(start, end).join('');
        tabs.push({ text, active: false, col: c });
        c = end + 1;
        continue;
      }
    }
    c++;
  }

  return tabs.length > 0 ? { tabs } : null;
}

function tryBox(grid: Grid, r: number, c: number): Box | null {
  if (!isCorner(grid.rows[r][c])) return null;

  const cornerChar = grid.rows[r][c] as CornerChar;

  // Count leading plus for nested prefix: ++--- = nestLevel 1
  const plusCount = countLeadingPlus(grid, r, c);
  const nestLevel = Math.max(0, plusCount - 1);
  const startC = c + nestLevel; // skip extra + chars

  // Scan right for top-right corner
  // Collect all potential top-right corners
  const topRightCandidates: number[] = [];
  let hasDash = false;
  for (let ci = startC + 1; ci < grid.width; ci++) {
    const ch = grid.rows[r][ci];
    if (isCorner(ch)) {
      if (hasDash) {
        topRightCandidates.push(ci);
      }
    }
    if (ch === '-' || ch === '#' || ch === '.') {
      hasDash = true;
    }
  }

  if (topRightCandidates.length === 0) return null;

  // Try from farthest to nearest to find the largest valid box
  for (let ti = topRightCandidates.length - 1; ti >= 0; ti--) {
    const c2 = topRightCandidates[ti];

    // Scan down from top-left for bottom-left corner
    let r2 = -1;
    for (let ri = r + 1; ri < grid.height; ri++) {
      const ch = grid.rows[ri][c];
      if (isCorner(ch)) {
        r2 = ri;
        break;
      }
      if (!isVBorder(ch)) break;
    }
    if (r2 === -1) continue;

    // Check bottom-right corner
    let hasRightBorder = true;
    const brCh = grid.rows[r2][c2];
    if (!isCorner(brCh)) {
      // Try open-right box: verify left border is valid, no right border needed
      hasRightBorder = false;
      // Still need to verify bottom border from c to some end
    }

    // Verify bottom border has at least one dash
    const bottomEnd = hasRightBorder ? c2 : Math.min(c2, grid.width - 1);
    let bottomHasDash = false;
    for (let ci = c + 1; ci < bottomEnd; ci++) {
      const ch = grid.rows[r2][ci];
      if (ch === '-' || ch === '#' || ch === '.') {
        bottomHasDash = true;
      }
    }
    if (!bottomHasDash && hasRightBorder) continue;
    if (!bottomHasDash && !hasRightBorder) continue;

    // Verify right border if present
    if (hasRightBorder) {
      let rightOk = true;
      for (let ri = r + 1; ri < r2; ri++) {
        const ch = grid.rows[ri][c2];
        if (!isVBorder(ch)) {
          rightOk = false;
          break;
        }
      }
      if (!rightOk) {
        // Try open-right
        hasRightBorder = false;
      }
    }

    // Verify left border
    let leftOk = true;
    for (let ri = r + 1; ri < r2; ri++) {
      const ch = grid.rows[ri][c];
      if (!isVBorder(ch)) {
        leftOk = false;
        break;
      }
    }
    if (!leftOk) continue;

    // Detect border style
    const topDashed = isDashedBorder(grid, r, c + 1, c2 - 1);
    let borderStyle: BorderStyle = topDashed ? 'dashed' : 'solid';

    // Detect scroll indicators
    let scrollRight = false;
    let scrollBottom = false;
    if (hasRightBorder) {
      for (let ri = r + 1; ri < r2; ri++) {
        if (grid.rows[ri][c2] === '#') {
          scrollRight = true;
          break;
        }
      }
    }
    for (let ci = c + 1; ci < (hasRightBorder ? c2 : grid.width); ci++) {
      if (grid.rows[r2][ci] === '#') {
        scrollBottom = true;
        break;
      }
    }

    // Detect column dividers and resize dividers within the box
    const columnDividers: number[] = [];
    const resizeDividers: number[] = [];
    for (let ci = c + 1; ci < c2; ci++) {
      const topCh = grid.rows[r][ci];
      const botCh = grid.rows[r2][ci];
      if (isCorner(topCh) && isCorner(botCh)) {
        // Check vertical line between them
        let allVertical = true;
        let hasResize = false;
        for (let ri = r + 1; ri < r2; ri++) {
          const ch = grid.rows[ri][ci];
          if (ch === '.') {
            hasResize = true;
          } else if (!isVBorder(ch)) {
            allVertical = false;
            break;
          }
        }
        if (allVertical) {
          if (hasResize) {
            resizeDividers.push(ci);
          } else {
            columnDividers.push(ci);
          }
        }
      }
    }

    const box: Box = {
      top: r,
      left: c,
      bottom: r2,
      right: hasRightBorder ? c2 : c2,
      cornerChar,
      borderStyle,
      hasRightBorder,
      scrollRight,
      scrollBottom,
      resizeDividers,
      columnDividers,
      children: [],
      nestLevel,
    };

    extractTitle(grid, box);

    return box;
  }

  return null;
}

function buildContainmentTree(boxes: Box[]): void {
  // Sort by area descending so we can efficiently find parents
  const sorted = [...boxes].sort((a, b) => boxArea(b) - boxArea(a));

  for (let i = 0; i < sorted.length; i++) {
    const child = sorted[i];
    for (let j = 0; j < sorted.length; j++) {
      if (i === j) continue;
      const candidate = sorted[j];
      if (contains(candidate, child)) {
        // Found the smallest container — since sorted descending, the first match
        // from the end would be smallest. Let's find the smallest.
        let smallest = candidate;
        for (let k = j + 1; k < sorted.length; k++) {
          if (k === i) continue;
          if (contains(sorted[k], child) && boxArea(sorted[k]) < boxArea(smallest)) {
            smallest = sorted[k];
          }
        }
        child.parent = smallest;
        if (!smallest.children.includes(child)) {
          smallest.children.push(child);
        }
        break;
      }
    }
  }
}

export function detectBoxes(
  grid: Grid,
  mode: ParseMode
): { boxes: Box[]; errors: ParseError[] } {
  const boxes: Box[] = [];
  const errors: ParseError[] = [];
  const visited = new Set<string>();

  for (let r = 0; r < grid.height; r++) {
    for (let c = 0; c < grid.width; c++) {
      if (!isCorner(grid.rows[r][c])) continue;

      const box = tryBox(grid, r, c);
      if (box) {
        const key = `${box.top},${box.left},${box.bottom},${box.right}`;
        if (!visited.has(key)) {
          visited.add(key);
          boxes.push(box);
        }
      }
    }
  }

  // Remove boxes that are just column sections of a larger box
  const toRemove = new Set<number>();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = 0; j < boxes.length; j++) {
      if (i === j) continue;
      const outer = boxes[j];
      const inner = boxes[i];
      // Inner shares top/bottom with outer and its left or right is a column divider
      if (
        inner.top === outer.top &&
        inner.bottom === outer.bottom &&
        (outer.columnDividers.includes(inner.left) || outer.columnDividers.includes(inner.right))
      ) {
        toRemove.add(i);
      }
    }
  }

  const filtered = boxes.filter((_, i) => !toRemove.has(i));

  buildContainmentTree(filtered);

  return { boxes: filtered, errors };
}
