"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
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
(0, vitest_1.describe)('multi-line merge', () => {
    (0, vitest_1.it)('should merge consecutive < > lines into a Textarea', () => {
        const src = [
            '<                        >',
            '<                        >',
            '<                        >',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'strict' });
        const ta = findByType(tree, 'Textarea');
        (0, vitest_1.expect)(ta).toBeDefined();
    });
    (0, vitest_1.it)('should parse a table with header and data rows', () => {
        const src = [
            '| Name  | Age |',
            '|-------|-----|',
            '| Alice |  30 |',
            '| Bob   |  25 |',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'strict' });
        const table = findByType(tree, 'Table');
        (0, vitest_1.expect)(table).toBeDefined();
    });
    (0, vitest_1.it)('should group label + input into FormField', () => {
        const src = [
            'Username:',
            '<____________>',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'strict' });
        const ff = findByType(tree, 'FormField');
        (0, vitest_1.expect)(ff).toBeDefined();
    });
    (0, vitest_1.it)('should group label + input + annotation into FormField', () => {
        const src = [
            'Email:',
            '<____________>',
            '(?) Enter your email.',
        ].join('\n');
        const { tree } = (0, index_1.parse)(src, { mode: 'strict' });
        const ff = findByType(tree, 'FormField');
        (0, vitest_1.expect)(ff).toBeDefined();
        // Should contain annotation as child
        const ann = findByType(tree, 'Annotation');
        (0, vitest_1.expect)(ann).toBeDefined();
    });
});
//# sourceMappingURL=merger.test.js.map