"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const svg_renderer_1 = require("./svg-renderer");
const themes_1 = require("./themes");
(0, vitest_1.describe)('renderToSvg', () => {
    const theme = (0, themes_1.getTheme)('clean');
    function makeNode(overrides) {
        return {
            row: 0, col: 0, width: 10, children: [],
            ...overrides,
        };
    }
    (0, vitest_1.it)('should render a Document node with SVG wrapper', () => {
        const tree = makeNode({ type: 'Document' });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
        (0, vitest_1.expect)(svg).toContain('</svg>');
    });
    (0, vitest_1.it)('should render a Button', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Button', text: 'Click Me', col: 0, width: 10 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('Click Me');
        (0, vitest_1.expect)(svg).toContain('<rect');
    });
    (0, vitest_1.it)('should render a Checkbox', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Checkbox', state: 'checked', col: 0, width: 3 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('<rect');
    });
    (0, vitest_1.it)('should render a TextInput', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'TextInput', value: 'hello', col: 0, width: 15 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('hello');
    });
    (0, vitest_1.it)('should render a Heading', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Heading', text: 'Title', level: 1, col: 0, width: 7 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('Title');
    });
    (0, vitest_1.it)('should render a Separator', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Separator', col: 0, width: 20 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('<line');
    });
    (0, vitest_1.it)('should render a Label', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Label', text: 'Hello World', col: 0, width: 11 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('Hello World');
    });
    (0, vitest_1.it)('should render a Badge', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Badge', text: '3', col: 0, width: 3 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('3');
    });
    (0, vitest_1.it)('should render a Box with children', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({
                    type: 'Box', text: 'Container', col: 0, width: 30, height: 5,
                    children: [makeNode({ type: 'Label', text: 'Inside', row: 1, col: 2, width: 6 })],
                })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('Container');
        (0, vitest_1.expect)(svg).toContain('Inside');
    });
    (0, vitest_1.it)('should render with blueprint theme', () => {
        const blueprintTheme = (0, themes_1.getTheme)('blueprint');
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Button', text: 'Test', col: 0, width: 6 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, blueprintTheme);
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(svg).toContain('Test');
    });
    (0, vitest_1.it)('should escape HTML entities in text', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Label', text: '<script>alert("xss")</script>', col: 0, width: 30 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).not.toContain('<script>');
        (0, vitest_1.expect)(svg).toContain('&lt;script&gt;');
    });
    (0, vitest_1.it)('should handle empty Document', () => {
        const tree = makeNode({ type: 'Document' });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(svg).toContain('</svg>');
    });
    (0, vitest_1.it)('should render an Icon', () => {
        const tree = makeNode({
            type: 'Document',
            children: [makeNode({ type: 'Icon', text: '1', iconIndex: 1, col: 0, width: 2 })],
        });
        const svg = (0, svg_renderer_1.renderToSvg)(tree, theme);
        (0, vitest_1.expect)(svg).toContain('#1');
    });
});
(0, vitest_1.describe)('getTheme', () => {
    (0, vitest_1.it)('should return clean theme by default', () => {
        const theme = (0, themes_1.getTheme)('clean');
        (0, vitest_1.expect)(theme.fontFamily).toBeDefined();
        (0, vitest_1.expect)(theme.fontSize).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should return blueprint theme', () => {
        const theme = (0, themes_1.getTheme)('blueprint');
        (0, vitest_1.expect)(theme.background).toContain('#');
    });
    (0, vitest_1.it)('should return sketch theme', () => {
        const theme = (0, themes_1.getTheme)('sketch');
        (0, vitest_1.expect)(theme.fontFamily).toBeDefined();
    });
    (0, vitest_1.it)('should default to clean for unknown name', () => {
        const theme = (0, themes_1.getTheme)('unknown');
        const clean = (0, themes_1.getTheme)('clean');
        (0, vitest_1.expect)(theme.background).toBe(clean.background);
    });
});
//# sourceMappingURL=svg-renderer.test.js.map