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
(0, vitest_1.describe)('tokenizer - brackets', () => {
    (0, vitest_1.it)('should parse a button [text]', () => {
        const { tree } = (0, index_1.parse)('[Submit]', { mode: 'strict' });
        const btn = findByType(tree, 'Button');
        (0, vitest_1.expect)(btn).toBeDefined();
        (0, vitest_1.expect)(btn.text).toBe('Submit');
    });
    (0, vitest_1.it)('should parse checkbox unchecked [ ]', () => {
        const { tree } = (0, index_1.parse)('[ ] Accept terms', { mode: 'strict' });
        const cb = findByType(tree, 'Checkbox');
        (0, vitest_1.expect)(cb).toBeDefined();
        (0, vitest_1.expect)(cb.state).toBe('unchecked');
    });
    (0, vitest_1.it)('should parse checkbox checked [x]', () => {
        const { tree } = (0, index_1.parse)('[x] Accept terms', { mode: 'strict' });
        const cb = findByType(tree, 'Checkbox');
        (0, vitest_1.expect)(cb).toBeDefined();
        (0, vitest_1.expect)(cb.state).toBe('checked');
    });
    (0, vitest_1.it)('should parse checkbox mixed [-]', () => {
        const { tree } = (0, index_1.parse)('[-] Partial', { mode: 'strict' });
        const cb = findByType(tree, 'Checkbox');
        (0, vitest_1.expect)(cb).toBeDefined();
        (0, vitest_1.expect)(cb.state).toBe('mixed');
    });
    (0, vitest_1.it)('should parse spinner [/]', () => {
        const { tree } = (0, index_1.parse)('[/] Loading...', { mode: 'strict' });
        const sp = findByType(tree, 'Spinner');
        (0, vitest_1.expect)(sp).toBeDefined();
    });
    (0, vitest_1.it)('should parse [...] as a button', () => {
        const { tree } = (0, index_1.parse)('[...]', { mode: 'strict' });
        const btn = findByType(tree, 'Button');
        (0, vitest_1.expect)(btn).toBeDefined();
        (0, vitest_1.expect)(btn.text).toBe('...');
    });
    (0, vitest_1.it)('should parse stepper [- 42 +]', () => {
        const { tree } = (0, index_1.parse)('[- 42 +]', { mode: 'strict' });
        const st = findByType(tree, 'Stepper');
        (0, vitest_1.expect)(st).toBeDefined();
        (0, vitest_1.expect)(st.value).toBe('42');
    });
    (0, vitest_1.it)('should parse slider [=====.....]', () => {
        const { tree } = (0, index_1.parse)('[=====.....]', { mode: 'strict' });
        const sl = findByType(tree, 'Slider');
        (0, vitest_1.expect)(sl).toBeDefined();
        (0, vitest_1.expect)(sl.percentage).toBe(50);
    });
    (0, vitest_1.it)('should parse rating [***..]', () => {
        const { tree } = (0, index_1.parse)('[***..]', { mode: 'strict' });
        const r = findByType(tree, 'Rating');
        (0, vitest_1.expect)(r).toBeDefined();
        (0, vitest_1.expect)(r.numerator).toBe(3);
        (0, vitest_1.expect)(r.denominator).toBe(5);
    });
    (0, vitest_1.it)('should parse active tab [[Tab]]', () => {
        const { tree } = (0, index_1.parse)('[[Overview]]', { mode: 'strict' });
        const at = findByType(tree, 'ActiveTab');
        (0, vitest_1.expect)(at).toBeDefined();
        (0, vitest_1.expect)(at.text).toBe('Overview');
    });
    (0, vitest_1.it)('should parse split button [Save][v]', () => {
        const { tree } = (0, index_1.parse)('[Save][v]', { mode: 'strict' });
        const sb = findByType(tree, 'SplitButton');
        (0, vitest_1.expect)(sb).toBeDefined();
        (0, vitest_1.expect)(sb.text).toBe('Save');
    });
    (0, vitest_1.it)('should parse accordion collapsed [Section v]', () => {
        const { tree } = (0, index_1.parse)('[Section 1 v]', { mode: 'strict' });
        const acc = findByType(tree, 'Expander');
        (0, vitest_1.expect)(acc).toBeDefined();
        (0, vitest_1.expect)(acc.state).toBe('collapsed');
    });
    (0, vitest_1.it)('should parse accordion expanded [Section ^]', () => {
        const { tree } = (0, index_1.parse)('[Section 1 ^]', { mode: 'strict' });
        const acc = findByType(tree, 'Expander');
        (0, vitest_1.expect)(acc).toBeDefined();
        (0, vitest_1.expect)(acc.state).toBe('expanded');
    });
    (0, vitest_1.it)('should parse prev button [<]', () => {
        const { tree } = (0, index_1.parse)('[<]', { mode: 'strict' });
        const pb = findByType(tree, 'PrevButton');
        (0, vitest_1.expect)(pb).toBeDefined();
    });
    (0, vitest_1.it)('should parse next button [>]', () => {
        const { tree } = (0, index_1.parse)('[>]', { mode: 'strict' });
        const nb = findByType(tree, 'NextButton');
        (0, vitest_1.expect)(nb).toBeDefined();
    });
    (0, vitest_1.it)('should parse icon button [#1 Search]', () => {
        const { tree } = (0, index_1.parse)('[#1 Search]', { mode: 'strict' });
        const ib = findByType(tree, 'IconButton');
        (0, vitest_1.expect)(ib).toBeDefined();
        (0, vitest_1.expect)(ib.text).toBe('Search');
        (0, vitest_1.expect)(ib.iconIndex).toBe(1);
    });
});
(0, vitest_1.describe)('tokenizer - angle brackets', () => {
    (0, vitest_1.it)('should parse text input <____>', () => {
        const { tree } = (0, index_1.parse)('<____________>', { mode: 'strict' });
        const ti = findByType(tree, 'TextInput');
        (0, vitest_1.expect)(ti).toBeDefined();
    });
    (0, vitest_1.it)('should parse text input with value <hello>', () => {
        const { tree } = (0, index_1.parse)('<hello>', { mode: 'strict' });
        const ti = findByType(tree, 'TextInput');
        (0, vitest_1.expect)(ti).toBeDefined();
        (0, vitest_1.expect)(ti.value).toBe('hello');
    });
    (0, vitest_1.it)('should parse dropdown closed <Select v>', () => {
        const { tree } = (0, index_1.parse)('<Select item v>', { mode: 'strict' });
        const dd = findByType(tree, 'Dropdown');
        (0, vitest_1.expect)(dd).toBeDefined();
        (0, vitest_1.expect)(dd.state).toBe('collapsed');
    });
    (0, vitest_1.it)('should parse dropdown open <Select ^>', () => {
        const { tree } = (0, index_1.parse)('<Select ^>', { mode: 'strict' });
        const dd = findByType(tree, 'Dropdown');
        (0, vitest_1.expect)(dd).toBeDefined();
        (0, vitest_1.expect)(dd.state).toBe('expanded');
    });
    (0, vitest_1.it)('should disambiguate <New v2> as text input (no space before >)', () => {
        const { tree } = (0, index_1.parse)('<New v2>', { mode: 'strict' });
        const ti = findByType(tree, 'TextInput');
        (0, vitest_1.expect)(ti).toBeDefined();
        (0, vitest_1.expect)(ti.value).toBe('New v2');
        (0, vitest_1.expect)(findByType(tree, 'Dropdown')).toBeUndefined();
    });
    (0, vitest_1.it)('should parse custom input <@datepicker>', () => {
        const { tree } = (0, index_1.parse)('<@datepicker>', { mode: 'strict' });
        const ci = findByType(tree, 'CustomInput');
        (0, vitest_1.expect)(ci).toBeDefined();
        (0, vitest_1.expect)(ci.text).toBe('datepicker');
    });
    (0, vitest_1.it)('should parse password input <****>', () => {
        const { tree } = (0, index_1.parse)('<****>', { mode: 'strict' });
        const pi = findByType(tree, 'PasswordInput');
        (0, vitest_1.expect)(pi).toBeDefined();
    });
});
(0, vitest_1.describe)('tokenizer - braces', () => {
    (0, vitest_1.it)('should parse toggle on {[on]/off}', () => {
        const { tree } = (0, index_1.parse)('{[on]/off}', { mode: 'strict' });
        const t = findByType(tree, 'Toggle');
        (0, vitest_1.expect)(t).toBeDefined();
        (0, vitest_1.expect)(t.state).toBe('on');
    });
    (0, vitest_1.it)('should parse toggle off {on/[off]}', () => {
        const { tree } = (0, index_1.parse)('{on/[off]}', { mode: 'strict' });
        const t = findByType(tree, 'Toggle');
        (0, vitest_1.expect)(t).toBeDefined();
        (0, vitest_1.expect)(t.state).toBe('off');
    });
    (0, vitest_1.it)('should parse badge {3}', () => {
        const { tree } = (0, index_1.parse)('{3}', { mode: 'strict' });
        const b = findByType(tree, 'Badge');
        (0, vitest_1.expect)(b).toBeDefined();
        (0, vitest_1.expect)(b.text).toBe('3');
    });
    (0, vitest_1.it)('should parse badge {!}', () => {
        const { tree } = (0, index_1.parse)('{!}', { mode: 'strict' });
        const b = findByType(tree, 'Badge');
        (0, vitest_1.expect)(b).toBeDefined();
        (0, vitest_1.expect)(b.text).toBe('!');
    });
});
(0, vitest_1.describe)('tokenizer - parens', () => {
    (0, vitest_1.it)('should parse radio selected (*)', () => {
        const { tree } = (0, index_1.parse)('(*) Yes', { mode: 'strict' });
        const r = findByType(tree, 'Radio');
        (0, vitest_1.expect)(r).toBeDefined();
        (0, vitest_1.expect)(r.state).toBe('selected');
    });
    (0, vitest_1.it)('should parse radio unselected ( )', () => {
        const { tree } = (0, index_1.parse)('( ) No', { mode: 'strict' });
        const r = findByType(tree, 'Radio');
        (0, vitest_1.expect)(r).toBeDefined();
        (0, vitest_1.expect)(r.state).toBe('unselected');
    });
    (0, vitest_1.it)('should parse removable chip (React x)', () => {
        const { tree } = (0, index_1.parse)('(React x)', { mode: 'strict' });
        const rc = findByType(tree, 'RemovableChip');
        (0, vitest_1.expect)(rc).toBeDefined();
        (0, vitest_1.expect)(rc.text).toBe('React');
    });
    (0, vitest_1.it)('should parse tag (Technology)', () => {
        const { tree } = (0, index_1.parse)('(Technology)', { mode: 'strict' });
        const tag = findByType(tree, 'Tag');
        (0, vitest_1.expect)(tag).toBeDefined();
        (0, vitest_1.expect)(tag.text).toBe('Technology');
    });
});
(0, vitest_1.describe)('tokenizer - other patterns', () => {
    (0, vitest_1.it)('should parse separator ---', () => {
        const { tree } = (0, index_1.parse)('---', { mode: 'strict' });
        const sep = findByType(tree, 'Separator');
        (0, vitest_1.expect)(sep).toBeDefined();
    });
    (0, vitest_1.it)('should parse heading # Title', () => {
        const { tree } = (0, index_1.parse)('# Main Title', { mode: 'strict' });
        const h = findByType(tree, 'Heading');
        (0, vitest_1.expect)(h).toBeDefined();
        (0, vitest_1.expect)(h.text).toBe('Main Title');
        (0, vitest_1.expect)(h.level).toBe(1);
    });
    (0, vitest_1.it)('should parse heading ## Subtitle', () => {
        const { tree } = (0, index_1.parse)('## Subtitle', { mode: 'strict' });
        const h = findByType(tree, 'Heading');
        (0, vitest_1.expect)(h).toBeDefined();
        (0, vitest_1.expect)(h.level).toBe(2);
    });
    (0, vitest_1.it)('should parse link _Click here_', () => {
        const { tree } = (0, index_1.parse)('_Click here_', { mode: 'strict' });
        const l = findByType(tree, 'Link');
        (0, vitest_1.expect)(l).toBeDefined();
        (0, vitest_1.expect)(l.text).toBe('Click here');
    });
    (0, vitest_1.it)('should parse icon #1', () => {
        const { tree } = (0, index_1.parse)('#1 Settings', { mode: 'strict' });
        const icon = findByType(tree, 'Icon');
        (0, vitest_1.expect)(icon).toBeDefined();
        (0, vitest_1.expect)(icon.iconIndex).toBe(1);
    });
    (0, vitest_1.it)('should parse component ref @name', () => {
        const { tree } = (0, index_1.parse)('@user-card', { mode: 'strict' });
        const cr = findByType(tree, 'ComponentRef');
        (0, vitest_1.expect)(cr).toBeDefined();
        (0, vitest_1.expect)(cr.text).toBe('user-card');
    });
    (0, vitest_1.it)('should parse annotation (?) help text', () => {
        const { tree } = (0, index_1.parse)('(?) Must be 8 characters.', { mode: 'strict' });
        const ann = findByType(tree, 'Annotation');
        (0, vitest_1.expect)(ann).toBeDefined();
        (0, vitest_1.expect)(ann.annotationType).toBe('?');
    });
    (0, vitest_1.it)('should parse annotation (!) warning', () => {
        const { tree } = (0, index_1.parse)('(!) Check settings.', { mode: 'strict' });
        const ann = findByType(tree, 'Annotation');
        (0, vitest_1.expect)(ann).toBeDefined();
        (0, vitest_1.expect)(ann.annotationType).toBe('!');
    });
    (0, vitest_1.it)('should parse annotation (x) error', () => {
        const { tree } = (0, index_1.parse)('(x) Invalid email.', { mode: 'strict' });
        const ann = findByType(tree, 'Annotation');
        (0, vitest_1.expect)(ann).toBeDefined();
        (0, vitest_1.expect)(ann.annotationType).toBe('x');
    });
    (0, vitest_1.it)('should parse annotation (v) success', () => {
        const { tree } = (0, index_1.parse)('(v) All good.', { mode: 'strict' });
        const ann = findByType(tree, 'Annotation');
        (0, vitest_1.expect)(ann).toBeDefined();
        (0, vitest_1.expect)(ann.annotationType).toBe('v');
    });
    (0, vitest_1.it)('should parse image !==IMG==!', () => {
        const { tree } = (0, index_1.parse)('!==IMG==!', { mode: 'strict' });
        const img = findByType(tree, 'Image');
        (0, vitest_1.expect)(img).toBeDefined();
    });
    (0, vitest_1.it)('should parse breadcrumb Home > Products > Laptops', () => {
        const { tree } = (0, index_1.parse)('Home > Products > Laptops', { mode: 'strict' });
        const bc = findByType(tree, 'Breadcrumb');
        (0, vitest_1.expect)(bc).toBeDefined();
    });
    (0, vitest_1.it)('should parse plain text as Label', () => {
        const { tree } = (0, index_1.parse)('Hello world', { mode: 'strict' });
        const l = findByType(tree, 'Label');
        (0, vitest_1.expect)(l).toBeDefined();
    });
    (0, vitest_1.it)('should parse multiple widgets on same line', () => {
        const { tree } = (0, index_1.parse)('[Save]  [Cancel]  [Delete]', { mode: 'strict' });
        const buttons = findAllByType(tree, 'Button');
        (0, vitest_1.expect)(buttons.length).toBe(3);
    });
});
//# sourceMappingURL=tokenizer.test.js.map