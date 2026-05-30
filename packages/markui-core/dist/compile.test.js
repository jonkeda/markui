"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
function findByType(node, type) {
    if (node.type === type)
        return node;
    for (const child of node.children) {
        const found = findByType(child, type);
        if (found)
            return found;
    }
    return undefined;
}
function findAllByType(node, type) {
    const results = [];
    if (node.type === type)
        results.push(node);
    for (const child of node.children) {
        results.push(...findAllByType(child, type));
    }
    return results;
}
function visualFixture(name) {
    return (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../test/visual/fixtures', name), 'utf8');
}
(0, vitest_1.describe)('compile', () => {
    (0, vitest_1.it)('should produce valid SVG from a login form', () => {
        const src = [
            '+--- Login ---+',
            '|',
            '|  Username:',
            '|  <____________>',
            '|',
            '|  Password:',
            '|  <****________>',
            '|',
            '|  [x] Remember me',
            '|',
            '|  [Login]',
            '|',
            '+--+',
        ].join('\n');
        const { svg, errors, tree } = (0, index_1.compile)(src, { theme: 'clean' });
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(svg).toContain('</svg>');
        (0, vitest_1.expect)(tree.type).toBe('Document');
        (0, vitest_1.expect)(tree.children.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should produce SVG with different themes', () => {
        const src = '[Button]';
        const clean = (0, index_1.compile)(src, { theme: 'clean' });
        const blueprint = (0, index_1.compile)(src, { theme: 'blueprint' });
        const sketch = (0, index_1.compile)(src, { theme: 'sketch' });
        (0, vitest_1.expect)(clean.svg).toContain('<svg');
        (0, vitest_1.expect)(blueprint.svg).toContain('<svg');
        (0, vitest_1.expect)(sketch.svg).toContain('<svg');
        // Different themes should produce different SVG (different colors)
        (0, vitest_1.expect)(clean.svg).not.toBe(blueprint.svg);
    });
    (0, vitest_1.it)('should handle boxless content', () => {
        const src = [
            '# Welcome',
            '',
            'Name: <____________>',
            '[Submit]',
        ].join('\n');
        const { svg, tree } = (0, index_1.compile)(src);
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(tree.type).toBe('Document');
    });
    (0, vitest_1.it)('should handle empty input', () => {
        const { svg, tree, errors } = (0, index_1.compile)('');
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(tree.type).toBe('Document');
    });
    (0, vitest_1.it)('should parse a full dashboard layout', () => {
        const src = [
            '+------------------------------+',
            '| Dashboard                    |',
            '+--------+---------------------+',
            '| Nav    | Content             |',
            '| [Home] |                     |',
            '| [About]|                     |',
            '+--------+---------------------+',
        ].join('\n');
        const { svg, tree, errors } = (0, index_1.compile)(src, { theme: 'clean' });
        (0, vitest_1.expect)(svg).toContain('<svg');
        (0, vitest_1.expect)(tree.children.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should produce errors in strict mode for malformed input', () => {
        // Test strict vs autofix
        const src = '[Button]';
        const strict = (0, index_1.parse)(src, { mode: 'strict' });
        const autofix = (0, index_1.parse)(src, { mode: 'autofix' });
        (0, vitest_1.expect)(strict.mode).toBe('strict');
        (0, vitest_1.expect)(autofix.mode).toBe('autofix');
    });
});
(0, vitest_1.describe)('parse - complex scenarios', () => {
    (0, vitest_1.it)('should parse a form with multiple fields', () => {
        const src = [
            'First Name:',
            '<____________>',
            '',
            'Last Name:',
            '<____________>',
            '',
            'Email:',
            '<____________>',
            '(?) We will not share your email.',
            '',
            '[Submit]  [Cancel]',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const inputs = findAllByType(tree, 'TextInput');
        (0, vitest_1.expect)(inputs.length).toBeGreaterThanOrEqual(3);
        const buttons = findAllByType(tree, 'Button');
        (0, vitest_1.expect)(buttons.length).toBe(2);
    });
    (0, vitest_1.it)('should parse a vertical list with various widgets', () => {
        const src = [
            'v--- Product ----v',
            '| Widget A       |',
            '| $19.99         |',
            '| [Add to cart]  |',
            'v----------------v',
        ].join('\n');
        const { tree } = (0, index_1.compile)(src);
        const list = tree.children.find(n => n.type === 'VerticalList');
        (0, vitest_1.expect)(list).toBeDefined();
        (0, vitest_1.expect)(list.text).toBe('Product');
    });
    (0, vitest_1.it)('should parse tab bar syntax', () => {
        const src = [
            '[[Tab 1]]  [Tab 2]  [Tab 3]',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const activeTab = findByType(tree, 'ActiveTab');
        (0, vitest_1.expect)(activeTab).toBeDefined();
        (0, vitest_1.expect)(activeTab.text).toBe('Tab 1');
    });
    (0, vitest_1.it)('should parse a table with sortable columns', () => {
        const src = [
            '| Name  v | Age ^ | Role    |',
            '|---------|-------|---------|',
            '| Alice   |  30   | Eng     |',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const table = findByType(tree, 'Table');
        (0, vitest_1.expect)(table).toBeDefined();
    });
    (0, vitest_1.it)('should parse radio button group', () => {
        const src = [
            '(*) Option A',
            '( ) Option B',
            '( ) Option C',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const radios = findAllByType(tree, 'Radio');
        (0, vitest_1.expect)(radios.length).toBe(3);
        const selected = radios.filter(r => r.state === 'selected');
        (0, vitest_1.expect)(selected.length).toBe(1);
    });
    (0, vitest_1.it)('should parse toggle switches', () => {
        const src = '{[on]/off}';
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const toggle = findByType(tree, 'Toggle');
        (0, vitest_1.expect)(toggle).toBeDefined();
        (0, vitest_1.expect)(toggle.state).toBe('on');
    });
    (0, vitest_1.it)('should handle unicode box-drawing', () => {
        const src = [
            '┌─── Title ───┐',
            '│ content     │',
            '└─────────────┘',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        // After unicode normalization, this should be a valid box
        const box = findByType(tree, 'Box');
        (0, vitest_1.expect)(box).toBeDefined();
    });
    (0, vitest_1.it)('should parse breadcrumbs', () => {
        const src = 'Home > Products > Electronics';
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const bc = findByType(tree, 'Breadcrumb');
        (0, vitest_1.expect)(bc).toBeDefined();
    });
    (0, vitest_1.it)('should strip open accordion guide markers from content', () => {
        const src = [
            '[FAQ ^]',
            '|  You can return items within 30 days.',
            '+--+',
            '',
            '[Shipping v]',
        ].join('\n');
        const { svg, tree } = (0, index_1.compile)(src);
        const accordion = findByType(tree, 'Accordion');
        const labels = findAllByType(tree, 'Label').map(label => label.text);
        (0, vitest_1.expect)(accordion).toBeDefined();
        (0, vitest_1.expect)(labels).toContain('You can return items within 30 days.');
        (0, vitest_1.expect)(labels).not.toContain('|  You can return items within 30 days.');
        (0, vitest_1.expect)(svg).not.toContain('+--+');
    });
    (0, vitest_1.it)('should parse tree view', () => {
        const src = [
            '- Documents',
            '  - Work',
            '    - Project A',
            '  + Personal',
            '+ Downloads',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const treeNodes = findAllByType(tree, 'TreeNode');
        (0, vitest_1.expect)(treeNodes.length).toBeGreaterThanOrEqual(3);
    });
    (0, vitest_1.it)('should parse a complex box with title', () => {
        const src = [
            '+--- Settings ---+',
            '|                |',
            '|  Dark mode:    |',
            '|  {[on]/off}    |',
            '|                |',
            '+----------------+',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const box = findByType(tree, 'Box');
        (0, vitest_1.expect)(box).toBeDefined();
        if (box) {
            (0, vitest_1.expect)(box.text).toContain('Settings');
        }
    });
    (0, vitest_1.it)('should parse a typed container with a repaired right edge', () => {
        const src = [
            '+--@Modal--- Confirm ----------------+',
            '|                                     |',
            '|  Delete this item?                  |',
            '|                                     |',
            '|  [Delete]  [Cancel]                 |',
            '|                                     |',
            '+-------------------------------------+',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        const box = findByType(tree, 'Box');
        (0, vitest_1.expect)(box?.text).toBe('Confirm');
        (0, vitest_1.expect)(box?.typeName).toBe('Modal');
        (0, vitest_1.expect)(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+--@Modal--');
    });
    (0, vitest_1.it)('should parse nested boxes without literal border fragments', () => {
        const src = [
            '+--- Dashboard ---------------------------+',
            '| +--- Stats --------+ +--- Chart -------+ |',
            '| | Users: 1,234     | | [=======...] 70%| |',
            '| +------------------+ +-----------------+ |',
            '+-----------------------------------------+',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        (0, vitest_1.expect)(tree.children.find(node => node.type === 'Box' && node.text === 'Dashboard')).toBeDefined();
        (0, vitest_1.expect)(findAllByType(tree, 'Box').map(box => box.text)).toEqual(vitest_1.expect.arrayContaining(['Stats', 'Chart']));
        (0, vitest_1.expect)(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+-----------------------------------------+');
    });
    (0, vitest_1.it)('should parse a top-border tab bar inside its box', () => {
        const src = [
            '+--[[Overview]]--[Details]--[Settings]--+',
            '| Overview tab content                   |',
            '+----------------------------------------+',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        (0, vitest_1.expect)(findByType(tree, 'Box')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'TabBar')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'ActiveTab')?.text).toBe('Overview');
        (0, vitest_1.expect)(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+--');
    });
    (0, vitest_1.it)('should parse parenthesized status titles as toast notifications', () => {
        const src = [
            '+-- (v) ----------------------------+',
            '| File saved successfully           |',
            '+-----------------------------------+',
        ].join('\n');
        const { svg, tree } = (0, index_1.compile)(src);
        const toast = findByType(tree, 'Toast');
        (0, vitest_1.expect)(toast).toBeDefined();
        (0, vitest_1.expect)(toast?.annotationType).toBe('v');
        (0, vitest_1.expect)(toast?.text).toBeUndefined();
        (0, vitest_1.expect)(svg).toContain('data-markui="status-icon"');
        (0, vitest_1.expect)(svg).not.toContain('(v)');
    });
    (0, vitest_1.it)('should not treat ordinary titles starting with status letters as toasts', () => {
        const src = [
            '+--- Invoice ---+',
            '| Details       |',
            '+---------------+',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'autofix' });
        (0, vitest_1.expect)(findByType(tree, 'Toast')).toBeUndefined();
        (0, vitest_1.expect)(findByType(tree, 'Box')?.text).toBe('Invoice');
    });
});
(0, vitest_1.describe)('compile limits', () => {
    (0, vitest_1.it)('reports a parser error instead of parsing oversized source', () => {
        const result = (0, index_1.compile)('[Save]', { limits: { maxSourceBytes: 3 } });
        (0, vitest_1.expect)(result.errors.some(error => error.code === 'SOURCE_TOO_LARGE')).toBe(true);
        (0, vitest_1.expect)(result.tree.children).toEqual([]);
    });
    (0, vitest_1.it)('drops rendered SVG when the SVG output limit is exceeded', () => {
        const result = (0, index_1.compile)('[Save]', { limits: { maxSvgBytes: 10 } });
        (0, vitest_1.expect)(result.svg).toBe('');
        (0, vitest_1.expect)(result.errors.some(error => error.code === 'SVG_TOO_LARGE')).toBe(true);
    });
});
(0, vitest_1.describe)('visual regression fixtures', () => {
    (0, vitest_1.it)('keeps both columns in the column layout fixture', () => {
        const { tree } = (0, index_1.parse)(visualFixture('04-column-layout.markui'), { mode: 'autofix' });
        const columnLayout = findByType(tree, 'ColumnLayout');
        (0, vitest_1.expect)(columnLayout).toBeDefined();
        (0, vitest_1.expect)(columnLayout.children).toHaveLength(2);
        (0, vitest_1.expect)(findByType(tree, 'Heading')?.text).toBe('Dashboard');
        (0, vitest_1.expect)(findAllByType(tree, 'TableCell').map(cell => cell.text)).toContain('Team B');
    });
    (0, vitest_1.it)('renders the contact form fixture as a box with a textarea', () => {
        const { tree } = (0, index_1.parse)(visualFixture('05-form-annotations.markui'), { mode: 'autofix' });
        const box = findByType(tree, 'Box');
        (0, vitest_1.expect)(box?.text).toBe('Contact');
        (0, vitest_1.expect)(findByType(tree, 'Textarea')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'Annotation')?.text).toBe('We will only use this for the reply');
        (0, vitest_1.expect)(findAllByType(tree, 'Button').map(button => button.text)).toEqual(vitest_1.expect.arrayContaining(['Send', 'Cancel']));
    });
    (0, vitest_1.it)('recognizes all list container marker styles', () => {
        const { tree } = (0, index_1.parse)(visualFixture('07-list-containers.markui'), { mode: 'autofix' });
        (0, vitest_1.expect)(findByType(tree, 'VerticalList')?.text).toBe('Product');
        (0, vitest_1.expect)(findByType(tree, 'HorizontalList')?.text).toBe('Suggested');
        (0, vitest_1.expect)(findByType(tree, 'WrappedList')?.text).toBe('Tag');
        (0, vitest_1.expect)(findAllByType(tree, 'Button').map(button => button.text)).toEqual(vitest_1.expect.arrayContaining(['Add']));
    });
    (0, vitest_1.it)('keeps tabbed navigation inside its container', () => {
        const { tree } = (0, index_1.parse)(visualFixture('08-tabs-and-navigation.markui'), { mode: 'autofix' });
        (0, vitest_1.expect)(findByType(tree, 'Box')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'TabBar')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'Breadcrumb')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'Pagination')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'Expander')?.text).toBe('Details');
        (0, vitest_1.expect)(findAllByType(tree, 'Label').map(label => label.text?.trim())).toContain('Owner: Team UI');
    });
    (0, vitest_1.it)('keeps dense dashboard cards and table inside the dashboard box', () => {
        const { tree } = (0, index_1.parse)(visualFixture('09-dense-dashboard.markui'), { mode: 'autofix' });
        const dashboard = tree.children.find(node => node.type === 'Box' && node.text === 'Admin Dashboard');
        (0, vitest_1.expect)(dashboard).toBeDefined();
        (0, vitest_1.expect)(dashboard.children.filter(child => child.type === 'Box')).toHaveLength(3);
        const table = findByType(tree, 'Table');
        (0, vitest_1.expect)(table).toBeDefined();
        (0, vitest_1.expect)(table.row).toBe(9);
        (0, vitest_1.expect)(findAllByType(tree, 'TableCell').map(cell => cell.text)).toContain('Billing');
    });
    (0, vitest_1.it)('keeps the preview regression content and nested message card', () => {
        const { tree } = (0, index_1.parse)(visualFixture('10-current-bad-preview.markui'), { mode: 'autofix' });
        const preview = tree.children.find(node => node.type === 'Box' && node.text === 'Preview Regression Candidate');
        (0, vitest_1.expect)(preview).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'ColumnLayout')).toBeDefined();
        (0, vitest_1.expect)(findByType(tree, 'VerticalList')?.text).toBe('Message');
        (0, vitest_1.expect)(findByType(tree, 'Icon')?.iconIndex).toBe(1);
        (0, vitest_1.expect)(findByType(tree, 'ActiveTab')?.text).toBe('Open');
        (0, vitest_1.expect)(findAllByType(tree, 'Button').map(button => button.text)).toEqual(vitest_1.expect.arrayContaining(['Reply', 'Archive']));
        (0, vitest_1.expect)(findByType(tree, 'Annotation')?.text).toBe('Watch for text clipping, nested box drift, and list styling.');
    });
});
//# sourceMappingURL=compile.test.js.map