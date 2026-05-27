"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTree = buildTree;
const content_1 = require("./content");
function buildTree(boxes, layoutMap, grid) {
    const document = {
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
        if (box.parent)
            continue;
        const node = buildBoxNode(box, bi, boxes, layoutMap, grid);
        document.children.push(node);
    }
    // Add root-level content (not in any box)
    const rootLayout = layoutMap.get(content_1.ROOT_KEY);
    if (rootLayout) {
        document.children.push(...rootLayout.children);
    }
    // Sort children by row, then col
    document.children.sort((a, b) => a.row - b.row || a.col - b.col);
    // Update document width to fit all children (open-right boxes may expand beyond grid)
    for (const child of document.children) {
        const childRight = child.col + (child.width ?? 0);
        if (childRight > document.width) {
            document.width = childRight;
        }
    }
    return document;
}
function buildBoxNode(box, boxIndex, allBoxes, layoutMap, grid) {
    // Determine widget type
    let nodeType;
    switch (box.cornerChar) {
        case 'v':
            nodeType = 'VerticalList';
            break;
        case '>':
            nodeType = 'HorizontalList';
            break;
        case 'w':
            nodeType = 'WrappedList';
            break;
        default:
            nodeType = 'Box';
            break;
    }
    // Check for context menu (floating box, indented from left edge)
    if (nodeType === 'Box' && box.left > 2 && !box.parent) {
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
    const node = {
        type: nodeType,
        text: box.title,
        row: box.top,
        col: box.left,
        width: box.right - box.left + 1,
        height: box.bottom - box.top + 1,
        children: [],
        level: box.nestLevel > 0 ? box.nestLevel : undefined,
        scrollRight: box.scrollRight || undefined,
        scrollBottom: box.scrollBottom || undefined,
        resizeDividers: box.resizeDividers.length > 0 ? box.resizeDividers : undefined,
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
        if (child.parent !== box)
            continue;
        const childNode = buildBoxNode(child, ci, allBoxes, layoutMap, grid);
        node.children.push(childNode);
    }
    // Sort children by row, then col
    node.children.sort((a, b) => a.row - b.row || a.col - b.col);
    // For open-right boxes, expand width to fit all content
    if (!box.hasRightBorder && node.children.length > 0) {
        let maxRight = node.col + node.width;
        for (const child of node.children) {
            const childRight = child.col + (child.width ?? 0);
            if (childRight > maxRight)
                maxRight = childRight;
        }
        node.width = maxRight - node.col + 1; // +1 for padding
    }
    // Make nested prefix sub-sections span parent's full width
    for (const child of node.children) {
        if (child.level && child.level > 0) {
            child.width = node.width;
        }
    }
    return node;
}
function detectTabBar(grid, box) {
    const r = box.top;
    const tabs = [];
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
    if (tabs.length === 0)
        return null;
    return {
        type: 'TabBar',
        row: r,
        col: box.left,
        width: box.right - box.left,
        children: tabs,
    };
}
//# sourceMappingURL=tree-builder.js.map