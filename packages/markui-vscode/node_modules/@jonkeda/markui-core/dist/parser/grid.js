"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGrid = loadGrid;
const unicodeMap = {
    '\u250C': '+', // ┌
    '\u2510': '+', // ┐
    '\u2514': '+', // └
    '\u2518': '+', // ┘
    '\u251C': '+', // ├
    '\u2524': '+', // ┤
    '\u252C': '+', // ┬
    '\u2534': '+', // ┴
    '\u253C': '+', // ┼
    '\u2500': '-', // ─
    '\u2550': '-', // ═
    '\u2502': '|', // │
};
function loadGrid(source) {
    const lines = source.split(/\r?\n/);
    // Remove trailing empty lines
    while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
    }
    // Normalize unicode box-drawing chars and split into char arrays
    const rows = lines.map(line => {
        const chars = [];
        for (const ch of line) {
            chars.push(unicodeMap[ch] ?? ch);
        }
        return chars;
    });
    // Find max width
    const maxWidth = rows.reduce((max, row) => Math.max(max, row.length), 0);
    // Pad all rows to equal width
    for (const row of rows) {
        while (row.length < maxWidth) {
            row.push(' ');
        }
    }
    return {
        rows,
        width: maxWidth,
        height: rows.length,
    };
}
//# sourceMappingURL=grid.js.map