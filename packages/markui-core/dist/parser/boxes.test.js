"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const boxes_1 = require("./boxes");
const grid_1 = require("./grid");
(0, vitest_1.describe)('detectBoxes', () => {
    (0, vitest_1.it)('should detect a simple box', () => {
        const grid = (0, grid_1.loadGrid)([
            '+---------+',
            '| content |',
            '+---------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].top).toBe(0);
        (0, vitest_1.expect)(boxes[0].left).toBe(0);
        (0, vitest_1.expect)(boxes[0].bottom).toBe(2);
        (0, vitest_1.expect)(boxes[0].right).toBe(10);
        (0, vitest_1.expect)(boxes[0].hasRightBorder).toBe(true);
        (0, vitest_1.expect)(boxes[0].cornerChar).toBe('+');
    });
    (0, vitest_1.it)('should detect a titled box', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--- Title ---+',
            '| stuff       |',
            '+-------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].title).toBe('Title');
    });
    (0, vitest_1.it)('should detect a vertical list (v corners)', () => {
        const grid = (0, grid_1.loadGrid)('v--- Item ---v\n| content    |\nv------------v');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].cornerChar).toBe('v');
    });
    (0, vitest_1.it)('should detect a horizontal list (> corners)', () => {
        const grid = (0, grid_1.loadGrid)('>--- Item --->\n| content    |\n>------------>');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].cornerChar).toBe('>');
    });
    (0, vitest_1.it)('should detect a wrapped list (w corners)', () => {
        const grid = (0, grid_1.loadGrid)('w--- Item ---w\n| content    |\nw------------w');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].cornerChar).toBe('w');
    });
    (0, vitest_1.it)('should detect nested boxes', () => {
        const grid = (0, grid_1.loadGrid)([
            '+-------------------+',
            '| +------+          |',
            '| | inner|          |',
            '| +------+          |',
            '+-------------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(2);
        // The inner box should have the outer as parent
        const inner = boxes.find(b => b.title === undefined && b.right - b.left < 15);
        const outer = boxes.find(b => b.right - b.left >= 15);
        (0, vitest_1.expect)(inner).toBeDefined();
        (0, vitest_1.expect)(outer).toBeDefined();
    });
    (0, vitest_1.it)('should detect open-right box', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--- Login ----',
            '|',
            '|  Username:',
            '|  <______>',
            '|',
            '+----',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].title).toBe('Login');
        (0, vitest_1.expect)(boxes[0].hasRightBorder).toBe(false);
    });
    (0, vitest_1.it)('should detect column dividers', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--------+--------+',
            '| Left   | Right  |',
            '+--------+--------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBeGreaterThanOrEqual(1);
        // The main box should have a column divider
        const mainBox = boxes.find(b => b.left === 0);
        (0, vitest_1.expect)(mainBox).toBeDefined();
    });
    (0, vitest_1.it)('should detect scroll indicators', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--- List ---+',
            '| Item 1     #',
            '| Item 2     #',
            '| Item 3     #',
            '+------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].scrollRight).toBe(true);
    });
    (0, vitest_1.it)('should produce no errors for valid box', () => {
        const grid = (0, grid_1.loadGrid)([
            '+------+',
            '| test |',
            '+------+',
        ].join('\n'));
        const { errors } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(errors.length).toBe(0);
    });
    (0, vitest_1.it)('should handle boxless content', () => {
        const grid = (0, grid_1.loadGrid)('Just plain text');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(0);
    });
    (0, vitest_1.it)('should detect an open box without trailing +', () => {
        const grid = (0, grid_1.loadGrid)('+--- Title ----\n|\n|  content\n|\n+----');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].hasRightBorder).toBe(false);
        (0, vitest_1.expect)(boxes[0].title).toBe('Title');
    });
    (0, vitest_1.it)('should not treat marker letters inside open-right titles as corners', () => {
        const grid = (0, grid_1.loadGrid)('+--- Preview Flow ----\n|\n|  content\n|\n+----');
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].hasRightBorder).toBe(false);
        (0, vitest_1.expect)(boxes[0].title).toBe('Preview Flow');
    });
    (0, vitest_1.it)('should detect typed container', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--@Modal--- Confirm ---+',
            '| Are you sure?         |',
            '+-----------------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'strict');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].typeName).toBe('Modal');
        (0, vitest_1.expect)(boxes[0].title).toBe('Confirm');
    });
    (0, vitest_1.it)('should repair a one-column right edge mismatch in a typed container', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--@Modal--- Confirm ----------------+',
            '|                                     |',
            '|  Delete this item?                  |',
            '|                                     |',
            '+-------------------------------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'autofix');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].right).toBe(38);
        (0, vitest_1.expect)(boxes[0].typeName).toBe('Modal');
        (0, vitest_1.expect)(boxes[0].title).toBe('Confirm');
    });
    (0, vitest_1.it)('should detect a tab bar box with a repaired right edge', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--[[Overview]]--[Details]--[Settings]--+',
            '| Overview tab content                   |',
            '+----------------------------------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'autofix');
        (0, vitest_1.expect)(boxes.length).toBe(1);
        (0, vitest_1.expect)(boxes[0].title).toBeUndefined();
    });
    (0, vitest_1.it)('should detect a nested box layout when the right border is off by one', () => {
        const grid = (0, grid_1.loadGrid)([
            '+--- Dashboard ---------------------------+',
            '| +--- Stats --------+ +--- Chart -------+ |',
            '| | Users: 1,234     | | [=======...] 70%| |',
            '| +------------------+ +-----------------+ |',
            '+-----------------------------------------+',
        ].join('\n'));
        const { boxes } = (0, boxes_1.detectBoxes)(grid, 'autofix');
        (0, vitest_1.expect)(boxes.some(box => box.title === 'Dashboard')).toBe(true);
        (0, vitest_1.expect)(boxes.some(box => box.title === 'Stats')).toBe(true);
        (0, vitest_1.expect)(boxes.some(box => box.title === 'Chart')).toBe(true);
    });
});
//# sourceMappingURL=boxes.test.js.map