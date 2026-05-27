"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const index_1 = require("../index");
const fixtureDir = path_1.default.resolve(__dirname, '../../test/visual/fixtures');
const fixtures = (0, fs_1.readdirSync)(fixtureDir)
    .filter(name => name.endsWith('.markui'))
    .sort()
    .map(name => ({
    name,
    source: (0, fs_1.readFileSync)(path_1.default.join(fixtureDir, name), 'utf8'),
}));
const themes = ['clean', 'sketch', 'blueprint'];
function getNumberAttr(svg, attr) {
    const match = svg.match(new RegExp(`${attr}="([^"]+)"`));
    if (!match)
        throw new Error(`Missing SVG ${attr} attribute`);
    return Number(match[1]);
}
function maxBounds(node) {
    let maxCol = node.col + (node.width ?? 0);
    let maxRow = node.row + (node.height ?? 1);
    for (const child of node.children) {
        const childBounds = maxBounds(child);
        maxCol = Math.max(maxCol, childBounds.col);
        maxRow = Math.max(maxRow, childBounds.row);
    }
    return { col: maxCol, row: maxRow };
}
function expectNoNegativeNumericDimensions(svg) {
    const re = /\s(width|height)="(-?\d+(?:\.\d+)?)"/g;
    let match;
    while ((match = re.exec(svg)) !== null) {
        (0, vitest_1.expect)(Number(match[2]), `${match[1]} should be non-negative`).toBeGreaterThanOrEqual(0);
    }
}
function expectTextWithinCanvas(svg, width, height) {
    const re = /<text\b[^>]*\sx="(-?\d+(?:\.\d+)?)"[^>]*\sy="(-?\d+(?:\.\d+)?)"/g;
    let match;
    while ((match = re.exec(svg)) !== null) {
        const x = Number(match[1]);
        const y = Number(match[2]);
        (0, vitest_1.expect)(x, 'text x should be inside SVG canvas').toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(y, 'text y should be inside SVG canvas').toBeGreaterThanOrEqual(0);
        (0, vitest_1.expect)(x, 'text x should be inside SVG canvas').toBeLessThanOrEqual(width);
        (0, vitest_1.expect)(y, 'text y should be inside SVG canvas').toBeLessThanOrEqual(height);
    }
}
(0, vitest_1.describe)('visual fixture SVG sanity', () => {
    for (const fixture of fixtures) {
        for (const themeName of themes) {
            (0, vitest_1.it)(`${fixture.name} renders sane SVG with ${themeName}`, () => {
                const result = (0, index_1.compile)(fixture.source, { mode: 'autofix', theme: themeName });
                const errors = result.errors.filter(error => error.severity === 'error');
                (0, vitest_1.expect)(errors, `${fixture.name} should have no parse errors`).toEqual([]);
                const svg = result.svg;
                (0, vitest_1.expect)(svg).toContain('<svg');
                (0, vitest_1.expect)(svg).toContain('</svg>');
                (0, vitest_1.expect)(svg).not.toMatch(/NaN|undefined|Infinity/);
                (0, vitest_1.expect)(svg).not.toMatch(/<script/i);
                expectNoNegativeNumericDimensions(svg);
                const width = getNumberAttr(svg, 'width');
                const height = getNumberAttr(svg, 'height');
                (0, vitest_1.expect)(width).toBeGreaterThan(0);
                (0, vitest_1.expect)(height).toBeGreaterThan(0);
                const theme = (0, index_1.getTheme)(themeName);
                const bounds = maxBounds(result.tree);
                (0, vitest_1.expect)(width).toBeGreaterThanOrEqual(bounds.col * theme.charWidth);
                (0, vitest_1.expect)(height).toBeGreaterThanOrEqual(bounds.row * theme.lineHeight);
                expectTextWithinCanvas(svg, width, height);
            });
        }
    }
});
//# sourceMappingURL=svg-sanity.test.js.map