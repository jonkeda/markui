import { describe, it, expect } from 'vitest';
import { parse } from './index';
import type { WidgetNode, WidgetType } from '../types';

function findByType(node: WidgetNode, type: WidgetType): WidgetNode | undefined {
  if (node.type === type) return node;
  for (const child of node.children) {
    const found = findByType(child, type);
    if (found) return found;
  }
  return undefined;
}

function findAllByType(node: WidgetNode, type: WidgetType): WidgetNode[] {
  const results: WidgetNode[] = [];
  if (node.type === type) results.push(node);
  for (const child of node.children) {
    results.push(...findAllByType(child, type));
  }
  return results;
}

describe('tokenizer - brackets', () => {
  it('should parse a button [text]', () => {
    const { tree } = parse('[Submit]', { mode: 'strict' });
    const btn = findByType(tree, 'Button');
    expect(btn).toBeDefined();
    expect(btn!.text).toBe('Submit');
  });

  it('should parse checkbox unchecked [ ]', () => {
    const { tree } = parse('[ ] Accept terms', { mode: 'strict' });
    const cb = findByType(tree, 'Checkbox');
    expect(cb).toBeDefined();
    expect(cb!.state).toBe('unchecked');
  });

  it('should parse checkbox checked [x]', () => {
    const { tree } = parse('[x] Accept terms', { mode: 'strict' });
    const cb = findByType(tree, 'Checkbox');
    expect(cb).toBeDefined();
    expect(cb!.state).toBe('checked');
  });

  it('should parse checkbox mixed [-]', () => {
    const { tree } = parse('[-] Partial', { mode: 'strict' });
    const cb = findByType(tree, 'Checkbox');
    expect(cb).toBeDefined();
    expect(cb!.state).toBe('mixed');
  });

  it('should parse spinner [/]', () => {
    const { tree } = parse('[/] Loading...', { mode: 'strict' });
    const sp = findByType(tree, 'Spinner');
    expect(sp).toBeDefined();
  });

  it('should parse list truncation [...]', () => {
    const { tree } = parse('[...]', { mode: 'strict' });
    const lt = findByType(tree, 'ListTruncation');
    expect(lt).toBeDefined();
  });

  it('should parse stepper [- 42 +]', () => {
    const { tree } = parse('[- 42 +]', { mode: 'strict' });
    const st = findByType(tree, 'Stepper');
    expect(st).toBeDefined();
    expect(st!.value).toBe('42');
  });

  it('should parse slider [=====.....]', () => {
    const { tree } = parse('[=====.....]', { mode: 'strict' });
    const sl = findByType(tree, 'Slider');
    expect(sl).toBeDefined();
    expect(sl!.percentage).toBe(50);
  });

  it('should parse rating [***..]', () => {
    const { tree } = parse('[***..]', { mode: 'strict' });
    const r = findByType(tree, 'Rating');
    expect(r).toBeDefined();
    expect(r!.numerator).toBe(3);
    expect(r!.denominator).toBe(5);
  });

  it('should parse active tab [[Tab]]', () => {
    const { tree } = parse('[[Overview]]', { mode: 'strict' });
    const at = findByType(tree, 'ActiveTab');
    expect(at).toBeDefined();
    expect(at!.text).toBe('Overview');
  });

  it('should parse split button [Save][v]', () => {
    const { tree } = parse('[Save][v]', { mode: 'strict' });
    const sb = findByType(tree, 'SplitButton');
    expect(sb).toBeDefined();
    expect(sb!.text).toBe('Save');
  });

  it('should parse accordion collapsed [Section v]', () => {
    const { tree } = parse('[Section 1 v]', { mode: 'strict' });
    const acc = findByType(tree, 'Expander');
    expect(acc).toBeDefined();
    expect(acc!.state).toBe('collapsed');
  });

  it('should parse accordion expanded [Section ^]', () => {
    const { tree } = parse('[Section 1 ^]', { mode: 'strict' });
    const acc = findByType(tree, 'Expander');
    expect(acc).toBeDefined();
    expect(acc!.state).toBe('expanded');
  });

  it('should parse prev button [<]', () => {
    const { tree } = parse('[<]', { mode: 'strict' });
    const pb = findByType(tree, 'PrevButton');
    expect(pb).toBeDefined();
  });

  it('should parse next button [>]', () => {
    const { tree } = parse('[>]', { mode: 'strict' });
    const nb = findByType(tree, 'NextButton');
    expect(nb).toBeDefined();
  });

  it('should parse icon button [#1 Search]', () => {
    const { tree } = parse('[#1 Search]', { mode: 'strict' });
    const ib = findByType(tree, 'IconButton');
    expect(ib).toBeDefined();
    expect(ib!.text).toBe('Search');
    expect(ib!.iconIndex).toBe(1);
  });
});

describe('tokenizer - angle brackets', () => {
  it('should parse text input <____>', () => {
    const { tree } = parse('<____________>', { mode: 'strict' });
    const ti = findByType(tree, 'TextInput');
    expect(ti).toBeDefined();
  });

  it('should parse text input with value <hello>', () => {
    const { tree } = parse('<hello>', { mode: 'strict' });
    const ti = findByType(tree, 'TextInput');
    expect(ti).toBeDefined();
    expect(ti!.value).toBe('hello');
  });

  it('should parse dropdown closed <Select v>', () => {
    const { tree } = parse('<Select item v>', { mode: 'strict' });
    const dd = findByType(tree, 'Dropdown');
    expect(dd).toBeDefined();
    expect(dd!.state).toBe('collapsed');
  });

  it('should parse dropdown open <Select ^>', () => {
    const { tree } = parse('<Select ^>', { mode: 'strict' });
    const dd = findByType(tree, 'Dropdown');
    expect(dd).toBeDefined();
    expect(dd!.state).toBe('expanded');
  });

  it('should disambiguate <New v2> as text input (no space before >)', () => {
    const { tree } = parse('<New v2>', { mode: 'strict' });
    const ti = findByType(tree, 'TextInput');
    expect(ti).toBeDefined();
    expect(ti!.value).toBe('New v2');
    expect(findByType(tree, 'Dropdown')).toBeUndefined();
  });

  it('should parse custom input <@datepicker>', () => {
    const { tree } = parse('<@datepicker>', { mode: 'strict' });
    const ci = findByType(tree, 'CustomInput');
    expect(ci).toBeDefined();
    expect(ci!.text).toBe('datepicker');
  });

  it('should parse password input <****>', () => {
    const { tree } = parse('<****>', { mode: 'strict' });
    const pi = findByType(tree, 'PasswordInput');
    expect(pi).toBeDefined();
  });
});

describe('tokenizer - braces', () => {
  it('should parse toggle on {[on]/off}', () => {
    const { tree } = parse('{[on]/off}', { mode: 'strict' });
    const t = findByType(tree, 'Toggle');
    expect(t).toBeDefined();
    expect(t!.state).toBe('on');
  });

  it('should parse toggle off {on/[off]}', () => {
    const { tree } = parse('{on/[off]}', { mode: 'strict' });
    const t = findByType(tree, 'Toggle');
    expect(t).toBeDefined();
    expect(t!.state).toBe('off');
  });

  it('should parse badge {3}', () => {
    const { tree } = parse('{3}', { mode: 'strict' });
    const b = findByType(tree, 'Badge');
    expect(b).toBeDefined();
    expect(b!.text).toBe('3');
  });

  it('should parse badge {!}', () => {
    const { tree } = parse('{!}', { mode: 'strict' });
    const b = findByType(tree, 'Badge');
    expect(b).toBeDefined();
    expect(b!.text).toBe('!');
  });
});

describe('tokenizer - parens', () => {
  it('should parse radio selected (*)', () => {
    const { tree } = parse('(*) Yes', { mode: 'strict' });
    const r = findByType(tree, 'Radio');
    expect(r).toBeDefined();
    expect(r!.state).toBe('selected');
  });

  it('should parse radio unselected ( )', () => {
    const { tree } = parse('( ) No', { mode: 'strict' });
    const r = findByType(tree, 'Radio');
    expect(r).toBeDefined();
    expect(r!.state).toBe('unselected');
  });

  it('should parse removable chip (React x)', () => {
    const { tree } = parse('(React x)', { mode: 'strict' });
    const rc = findByType(tree, 'RemovableChip');
    expect(rc).toBeDefined();
    expect(rc!.text).toBe('React');
  });

  it('should parse tag (Technology)', () => {
    const { tree } = parse('(Technology)', { mode: 'strict' });
    const tag = findByType(tree, 'Tag');
    expect(tag).toBeDefined();
    expect(tag!.text).toBe('Technology');
  });
});

describe('tokenizer - other patterns', () => {
  it('should parse separator ---', () => {
    const { tree } = parse('---', { mode: 'strict' });
    const sep = findByType(tree, 'Separator');
    expect(sep).toBeDefined();
  });

  it('should parse heading # Title', () => {
    const { tree } = parse('# Main Title', { mode: 'strict' });
    const h = findByType(tree, 'Heading');
    expect(h).toBeDefined();
    expect(h!.text).toBe('Main Title');
    expect(h!.level).toBe(1);
  });

  it('should parse heading ## Subtitle', () => {
    const { tree } = parse('## Subtitle', { mode: 'strict' });
    const h = findByType(tree, 'Heading');
    expect(h).toBeDefined();
    expect(h!.level).toBe(2);
  });

  it('should parse link _Click here_', () => {
    const { tree } = parse('_Click here_', { mode: 'strict' });
    const l = findByType(tree, 'Link');
    expect(l).toBeDefined();
    expect(l!.text).toBe('Click here');
  });

  it('should parse icon #1', () => {
    const { tree } = parse('#1 Settings', { mode: 'strict' });
    const icon = findByType(tree, 'Icon');
    expect(icon).toBeDefined();
    expect(icon!.iconIndex).toBe(1);
  });

  it('should parse component ref @name', () => {
    const { tree } = parse('@user-card', { mode: 'strict' });
    const cr = findByType(tree, 'ComponentRef');
    expect(cr).toBeDefined();
    expect(cr!.text).toBe('user-card');
  });

  it('should parse annotation (?) help text', () => {
    const { tree } = parse('(?) Must be 8 characters.', { mode: 'strict' });
    const ann = findByType(tree, 'Annotation');
    expect(ann).toBeDefined();
    expect(ann!.annotationType).toBe('?');
  });

  it('should parse annotation (!) warning', () => {
    const { tree } = parse('(!) Check settings.', { mode: 'strict' });
    const ann = findByType(tree, 'Annotation');
    expect(ann).toBeDefined();
    expect(ann!.annotationType).toBe('!');
  });

  it('should parse annotation (x) error', () => {
    const { tree } = parse('(x) Invalid email.', { mode: 'strict' });
    const ann = findByType(tree, 'Annotation');
    expect(ann).toBeDefined();
    expect(ann!.annotationType).toBe('x');
  });

  it('should parse annotation (v) success', () => {
    const { tree } = parse('(v) All good.', { mode: 'strict' });
    const ann = findByType(tree, 'Annotation');
    expect(ann).toBeDefined();
    expect(ann!.annotationType).toBe('v');
  });

  it('should parse image !==IMG==!', () => {
    const { tree } = parse('!==IMG==!', { mode: 'strict' });
    const img = findByType(tree, 'Image');
    expect(img).toBeDefined();
  });

  it('should parse breadcrumb Home > Products > Laptops', () => {
    const { tree } = parse('Home > Products > Laptops', { mode: 'strict' });
    const bc = findByType(tree, 'Breadcrumb');
    expect(bc).toBeDefined();
  });

  it('should parse plain text as Label', () => {
    const { tree } = parse('Hello world', { mode: 'strict' });
    const l = findByType(tree, 'Label');
    expect(l).toBeDefined();
  });

  it('should parse multiple widgets on same line', () => {
    const { tree } = parse('[Save]  [Cancel]  [Delete]', { mode: 'strict' });
    const buttons = findAllByType(tree, 'Button');
    expect(buttons.length).toBe(3);
  });
});
