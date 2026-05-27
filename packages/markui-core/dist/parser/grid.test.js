"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const grid_1 = require("./grid");
(0, vitest_1.describe)('loadGrid', () => {
    (0, vitest_1.it)('should create grid from simple text', () => {
        const grid = (0, grid_1.loadGrid)('hello\nworld');
        (0, vitest_1.expect)(grid.height).toBe(2);
        (0, vitest_1.expect)(grid.width).toBe(5);
        (0, vitest_1.expect)(grid.rows[0].join('')).toBe('hello');
        (0, vitest_1.expect)(grid.rows[1].join('')).toBe('world');
    });
    (0, vitest_1.it)('should pad shorter lines with spaces', () => {
        const grid = (0, grid_1.loadGrid)('long line\nhi');
        (0, vitest_1.expect)(grid.width).toBe(9);
        (0, vitest_1.expect)(grid.rows[1].join('')).toBe('hi       ');
    });
    (0, vitest_1.it)('should normalize unicode box-drawing characters', () => {
        const grid = (0, grid_1.loadGrid)('┌─┐\n│x│\n└─┘');
        (0, vitest_1.expect)(grid.rows[0].join('')).toBe('+-+');
        (0, vitest_1.expect)(grid.rows[1].join('')).toBe('|x|');
        (0, vitest_1.expect)(grid.rows[2].join('')).toBe('+-+');
    });
    (0, vitest_1.it)('should handle double-line unicode (═)', () => {
        const grid = (0, grid_1.loadGrid)('═══');
        (0, vitest_1.expect)(grid.rows[0].join('')).toBe('---');
    });
    (0, vitest_1.it)('should strip trailing blank lines', () => {
        const grid = (0, grid_1.loadGrid)('hello\n\n\n');
        (0, vitest_1.expect)(grid.height).toBe(1);
    });
    (0, vitest_1.it)('should handle empty input', () => {
        const grid = (0, grid_1.loadGrid)('');
        (0, vitest_1.expect)(grid.height).toBe(0);
        (0, vitest_1.expect)(grid.width).toBe(0);
    });
    (0, vitest_1.it)('should handle single line', () => {
        const grid = (0, grid_1.loadGrid)('[Button]');
        (0, vitest_1.expect)(grid.height).toBe(1);
        (0, vitest_1.expect)(grid.width).toBe(8);
    });
    (0, vitest_1.it)('should handle mixed ascii and unicode', () => {
        const grid = (0, grid_1.loadGrid)('+─┐\n│ │\n└─+');
        (0, vitest_1.expect)(grid.rows[0].join('')).toBe('+-+');
        (0, vitest_1.expect)(grid.rows[1].join('')).toBe('| |');
        (0, vitest_1.expect)(grid.rows[2].join('')).toBe('+-+');
    });
    (0, vitest_1.it)('should handle Windows line endings', () => {
        const grid = (0, grid_1.loadGrid)('abc\r\ndef');
        (0, vitest_1.expect)(grid.height).toBe(2);
        (0, vitest_1.expect)(grid.rows[0].join('')).toBe('abc');
        (0, vitest_1.expect)(grid.rows[1].join('')).toBe('def');
    });
});
//# sourceMappingURL=grid.test.js.map