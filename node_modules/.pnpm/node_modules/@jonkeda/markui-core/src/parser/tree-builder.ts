import { Box, Grid, LayoutMap, WidgetNode, WidgetType } from '../types';
import { ROOT_KEY } from './content';

export function buildTree(
  boxes: Box[],
  layoutMap: LayoutMap,
  grid: Grid
): WidgetNode {
  const document: WidgetNode = {
    type: 'Document',
    row: 0,
    col: 0,
    width: grid.width,
    height: grid.height,
    children: [],
  };

  // Build nodes for root-level boxes (no parent)
  const rootBoxes = boxes.filter(b => !b.parent);

  for (let bi = 0; bi < boxes.length; bi++) {
    const box = boxes[bi];
    if (box.parent) continue;

    const node = buildBoxNode(box, bi, boxes, layoutMap, grid);
    document.children.push(node);
  }

  // Add root-level content (not in any box)
  const rootLayout = layoutMap.get(ROOT_KEY);
  if (rootLayout) {
    document.children.push(...rootLayout.children);
  }

  // Sort children by row, then col
  document.children.sort((a, b) => a.row - b.row || a.col - b.col);

  return document;
}

function buildBoxNode(
  box: Box,
  boxIndex: number,
  allBoxes: Box[],
  layoutMap: LayoutMap,
  grid: Grid
): WidgetNode {
  // Determine widget type
  let nodeType: WidgetType = box.cornerChar === '*' ? 'Card' : 'Box';

  // Check for context menu (floating box, indented from left edge)
  if (box.left > 2 && !box.parent) {
    nodeType = 'ContextMenu';
  }

  // Check for toast (annotation marker in title)
  if (box.title && /^[?$!ixv]\s/.test(box.title)) {
    nodeType = 'Toast';
  }

  // Check for typed container
  if (box.typeName) {
    // @Modal, @Drawer etc. — keep as Box but store typeName
  }

  const node: WidgetNode = {
    type: nodeType,
    text: box.title,
    row: box.top,
    col: box.left,
    width: box.right - box.left + 1,
    height: box.bottom - box.top + 1,
    children: [],
    level: box.nestLevel > 0 ? box.nestLevel : undefined,
  };

  // Check for tab bar on top border
  const tabBar = detectTabBar(grid, box);
  if (tabBar) {
    node.children.push(tabBar);
  }

  // Add box content from layout map
  const key = `box:${boxIndex}`;
  const layout = layoutMap.get(key);
  if (layout) {
    node.children.push(...layout.children);
  }

  // Add child boxes
  for (let ci = 0; ci < allBoxes.length; ci++) {
    const child = allBoxes[ci];
    if (child.parent !== box) continue;

    const childNode = buildBoxNode(child, ci, allBoxes, layoutMap, grid);
    node.children.push(childNode);
  }

  // Sort children by row, then col
  node.children.sort((a, b) => a.row - b.row || a.col - b.col);

  return node;
}

function detectTabBar(grid: Grid, box: Box): WidgetNode | null {
  const r = box.top;
  const tabs: WidgetNode[] = [];
  let c = box.left + 1;
  const maxC = box.right;

  while (c < maxC) {
    const ch = grid.rows[r][c];

    // Active tab  [[text]]
    if (ch === '[' && c + 1 < maxC && grid.rows[r][c + 1] === '[') {
      const start = c + 2;
      let end = start;
      while (end < maxC - 1 && !(grid.rows[r][end] === ']' && grid.rows[r][end + 1] === ']')) {
        end++;
      }
      if (end < maxC - 1) {
        const text = grid.rows[r].slice(start, end).join('');
        tabs.push({
          type: 'ActiveTab',
          text,
          row: r,
          col: c,
          width: end + 2 - c,
          state: 'selected',
          children: [],
        });
        c = end + 2;
        continue;
      }
    }

    // Inactive tab  [text]
    if (ch === '[') {
      const start = c + 1;
      let end = start;
      while (end < maxC && grid.rows[r][end] !== ']') {
        end++;
      }
      if (end < maxC) {
        const text = grid.rows[r].slice(start, end).join('');
        tabs.push({
          type: 'Tab',
          text,
          row: r,
          col: c,
          width: end + 1 - c,
          children: [],
        });
        c = end + 1;
        continue;
      }
    }

    c++;
  }

  if (tabs.length === 0) return null;

  return {
    type: 'TabBar',
    row: r,
    col: box.left,
    width: box.right - box.left,
    children: tabs,
  };
}
