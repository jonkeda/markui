"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectBoxes = detectBoxes;
function isCorner(ch) {
    return ch === '+' || ch === 'v' || ch === '>' || ch === 'w';
}
function isHBorder(ch) {
    return ch === '-' || ch === '#' || ch === '.';
}
function isVBorder(ch) {
    return ch === '|' || ch === '#' || ch === '.';
}
function boxArea(b) {
    return (b.bottom - b.top) * (b.right - b.left);
}
function contains(outer, inner) {
    return (outer.top <= inner.top &&
        outer.left <= inner.left &&
        outer.bottom >= inner.bottom &&
        outer.right >= inner.right &&
        (outer.top !== inner.top || outer.left !== inner.left || outer.bottom !== inner.bottom || outer.right !== inner.right));
}
function countLeadingPlus(grid, r, c) {
    let count = 0;
    while (c + count < grid.width && grid.rows[r][c + count] === '+') {
        count++;
    }
    return count;
}
function isDashedBorder(grid, r, c1, c2) {
    let dashCount = 0;
    let spaceCount = 0;
    for (let c = c1; c <= c2; c++) {
        const ch = grid.rows[r][c];
        if (ch === '-')
            dashCount++;
        else if (ch === ' ')
            spaceCount++;
    }
    return dashCount > 0 && spaceCount > 0 && spaceCount >= dashCount * 0.3;
}
function extractTitle(grid, box) {
    const r = box.top;
    const left = box.left + 1;
    const right = box.right - 1;
    if (right <= left)
        return;
    const rawTitleArea = grid.rows[r].slice(left, right + 1).join('');
    let titleChars = [];
    let inTitle = false;
    for (let c = left; c <= right; c++) {
        const ch = grid.rows[r][c];
        if (inTitle) {
            if (ch === '-' || ch === '#' || ch === '.') {
                break;
            }
            titleChars.push(ch);
        }
        else if (ch !== '-' && ch !== '#' && ch !== '.' && ch !== ' ' && !isCorner(ch)) {
            inTitle = true;
            titleChars.push(ch);
        }
    }
    const title = titleChars.join('').trim();
    if (title.length > 0) {
        box.title = title;
        // Check for @TypeName
        const typeMatch = title.match(/@(\w+)/);
        if (typeMatch) {
            box.typeName = typeMatch[1];
            const afterType = rawTitleArea.slice(rawTitleArea.indexOf(typeMatch[0]) + typeMatch[0].length);
            const trailingTitle = afterType.replace(/^[-#.\s]+/, '').replace(/[-#.\s]+$/, '').trim();
            box.title = trailingTitle || title.replace(/@\w+/, '').trim() || undefined;
        }
    }
}
function detectTabsOnBorder(grid, box) {
    const r = box.top;
    const tabs = [];
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
function tryBox(grid, r, c) {
    if (!isCorner(grid.rows[r][c]))
        return null;
    const cornerChar = grid.rows[r][c];
    // Count leading plus for nested prefix: ++--- = nestLevel 1
    const plusCount = countLeadingPlus(grid, r, c);
    const nestLevel = Math.max(0, plusCount - 1);
    const startC = c + nestLevel; // skip extra + chars
    // Scan right for top-right corner
    // Collect all potential top-right corners
    const topRightCandidates = [];
    let hasDash = false;
    let lastDash = -1;
    for (let ci = startC + 1; ci < grid.width; ci++) {
        const ch = grid.rows[r][ci];
        if (ch === '-' || ch === '#' || ch === '.') {
            hasDash = true;
            lastDash = ci;
            continue;
        }
        if (isCorner(ch)) {
            if (hasDash) {
                topRightCandidates.push(ci);
            }
            else {
                // A plain + without a border run usually starts a separate adjacent box.
                // Marker letters like v/w can also appear inside titles.
                if (ch === '+')
                    break;
            }
            hasDash = false;
            continue;
        }
        if (ch !== ' ')
            hasDash = false;
    }
    // If no corner found but we have dashes, allow open-right (no trailing +)
    if (topRightCandidates.length === 0 && lastDash > startC + 1) {
        topRightCandidates.push(lastDash);
    }
    if (topRightCandidates.length === 0)
        return null;
    // Try from farthest to nearest to find the largest valid box
    for (let ti = topRightCandidates.length - 1; ti >= 0; ti--) {
        const c2 = topRightCandidates[ti];
        // Scan down from top-left for bottom-left corner
        let r2 = -1;
        let hasNestedPrefix = false;
        for (let ri = r + 1; ri < grid.height; ri++) {
            const ch = grid.rows[ri][c];
            if (isCorner(ch)) {
                // Skip nested prefix markers (++, +++) — they are sub-section headers
                if (c + 1 < grid.width && grid.rows[ri][c + 1] === '+') {
                    hasNestedPrefix = true;
                    continue;
                }
                r2 = ri;
                break;
            }
            if (!isVBorder(ch)) {
                if (hasNestedPrefix)
                    continue; // content between nested sections
                break;
            }
        }
        if (r2 === -1)
            continue;
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
        if (!bottomHasDash && hasRightBorder)
            continue;
        if (!bottomHasDash && !hasRightBorder)
            continue;
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
        // Verify left border (relaxed for nested prefix boxes)
        let leftOk = true;
        if (!hasNestedPrefix) {
            for (let ri = r + 1; ri < r2; ri++) {
                const ch = grid.rows[ri][c];
                if (!isVBorder(ch)) {
                    leftOk = false;
                    break;
                }
            }
        }
        if (!leftOk)
            continue;
        // Open-right boxes must not have a trailing corner char
        if (!hasRightBorder && isCorner(grid.rows[r][c2]))
            continue;
        // Detect border style
        const topDashed = isDashedBorder(grid, r, c + 1, c2 - 1);
        let borderStyle = topDashed ? 'dashed' : 'solid';
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
        const columnDividers = [];
        const resizeDividers = [];
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
                    }
                    else if (!isVBorder(ch)) {
                        allVertical = false;
                        break;
                    }
                }
                if (allVertical) {
                    if (hasResize) {
                        resizeDividers.push(ci);
                    }
                    else {
                        columnDividers.push(ci);
                    }
                }
            }
        }
        const box = {
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
            hasNestedPrefix,
        };
        extractTitle(grid, box);
        return box;
    }
    return null;
}
function buildContainmentTree(boxes) {
    // Sort by area descending so we can efficiently find parents
    const sorted = [...boxes].sort((a, b) => boxArea(b) - boxArea(a));
    for (let i = 0; i < sorted.length; i++) {
        const child = sorted[i];
        for (let j = 0; j < sorted.length; j++) {
            if (i === j)
                continue;
            const candidate = sorted[j];
            if (contains(candidate, child)) {
                // Found the smallest container — since sorted descending, the first match
                // from the end would be smallest. Let's find the smallest.
                let smallest = candidate;
                for (let k = j + 1; k < sorted.length; k++) {
                    if (k === i)
                        continue;
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
function detectBoxes(grid, mode) {
    const boxes = [];
    const errors = [];
    const visited = new Set();
    for (let r = 0; r < grid.height; r++) {
        for (let c = 0; c < grid.width; c++) {
            if (!isCorner(grid.rows[r][c]))
                continue;
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
    const toRemove = new Set();
    for (let i = 0; i < boxes.length; i++) {
        for (let j = 0; j < boxes.length; j++) {
            if (i === j)
                continue;
            const outer = boxes[j];
            const inner = boxes[i];
            // Inner shares top/bottom with outer and its left or right is a column divider
            if (inner.top === outer.top &&
                inner.bottom === outer.bottom &&
                (outer.columnDividers.includes(inner.left) || outer.columnDividers.includes(inner.right) ||
                    outer.resizeDividers.includes(inner.left) || outer.resizeDividers.includes(inner.right))) {
                toRemove.add(i);
            }
        }
    }
    const filtered = boxes.filter((_, i) => !toRemove.has(i));
    // Create sub-boxes for nested prefix sections (++---, +++---)
    const nestedSubs = [];
    for (const box of filtered) {
        if (!box.hasNestedPrefix)
            continue;
        // Find ++ lines inside the box
        const nestedRows = [];
        for (let r = box.top + 1; r < box.bottom; r++) {
            if (grid.rows[r][box.left] === '+' &&
                box.left + 1 < grid.width &&
                grid.rows[r][box.left + 1] === '+') {
                nestedRows.push(r);
            }
        }
        // Create sub-box for each nested section
        for (let ni = 0; ni < nestedRows.length; ni++) {
            const nestedR = nestedRows[ni];
            const nextR = ni + 1 < nestedRows.length ? nestedRows[ni + 1] : box.bottom;
            // Find lastDash on the ++ line for the right edge
            let lastDash = -1;
            for (let ci = box.left + 2; ci < grid.width; ci++) {
                const ch = grid.rows[nestedR][ci];
                if (ch === '-')
                    lastDash = ci;
            }
            if (lastDash === -1)
                continue;
            const subBox = {
                top: nestedR,
                left: box.left,
                bottom: nextR,
                right: lastDash,
                cornerChar: '+',
                borderStyle: 'solid',
                hasRightBorder: false,
                scrollRight: false,
                scrollBottom: false,
                resizeDividers: [],
                columnDividers: [],
                children: [],
                nestLevel: 1,
                parent: box,
            };
            extractTitle(grid, subBox);
            box.children.push(subBox);
            nestedSubs.push(subBox);
        }
    }
    filtered.push(...nestedSubs);
    buildContainmentTree(filtered);
    return { boxes: filtered, errors };
}
//# sourceMappingURL=boxes.js.map