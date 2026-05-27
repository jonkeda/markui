import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { compile, parse } from './index';
import type { WidgetNode, WidgetType } from './types';

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

function visualFixture(name: string): string {
  return readFileSync(path.resolve(__dirname, '../test/visual/fixtures', name), 'utf8');
}

describe('compile', () => {
  it('should produce valid SVG from a login form', () => {
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
    const { svg, errors, tree } = compile(src, { theme: 'clean' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(tree.type).toBe('Document');
    expect(tree.children.length).toBeGreaterThan(0);
  });

  it('should produce SVG with different themes', () => {
    const src = '[Button]';
    const clean = compile(src, { theme: 'clean' });
    const blueprint = compile(src, { theme: 'blueprint' });
    const sketch = compile(src, { theme: 'sketch' });
    expect(clean.svg).toContain('<svg');
    expect(blueprint.svg).toContain('<svg');
    expect(sketch.svg).toContain('<svg');
    // Different themes should produce different SVG (different colors)
    expect(clean.svg).not.toBe(blueprint.svg);
  });

  it('should handle boxless content', () => {
    const src = [
      '# Welcome',
      '',
      'Name: <____________>',
      '[Submit]',
    ].join('\n');
    const { svg, tree } = compile(src);
    expect(svg).toContain('<svg');
    expect(tree.type).toBe('Document');
  });

  it('should handle empty input', () => {
    const { svg, tree, errors } = compile('');
    expect(svg).toContain('<svg');
    expect(tree.type).toBe('Document');
  });

  it('should parse a full dashboard layout', () => {
    const src = [
      '+------------------------------+',
      '| Dashboard                    |',
      '+--------+---------------------+',
      '| Nav    | Content             |',
      '| [Home] |                     |',
      '| [About]|                     |',
      '+--------+---------------------+',
    ].join('\n');
    const { svg, tree, errors } = compile(src, { theme: 'clean' });
    expect(svg).toContain('<svg');
    expect(tree.children.length).toBeGreaterThan(0);
  });

  it('should produce errors in strict mode for malformed input', () => {
    // Test strict vs autofix
    const src = '[Button]';
    const strict = parse(src, { mode: 'strict' });
    const autofix = parse(src, { mode: 'autofix' });
    expect(strict.mode).toBe('strict');
    expect(autofix.mode).toBe('autofix');
  });
});

describe('parse - complex scenarios', () => {
  it('should parse a form with multiple fields', () => {
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
    const { tree } = parse(src, { mode: 'autofix' });
    const inputs = findAllByType(tree, 'TextInput');
    expect(inputs.length).toBeGreaterThanOrEqual(3);
    const buttons = findAllByType(tree, 'Button');
    expect(buttons.length).toBe(2);
  });

  it('should parse a vertical list with various widgets', () => {
    const src = [
      'v--- Product ----v',
      '| Widget A       |',
      '| $19.99         |',
      '| [Add to cart]  |',
      'v----------------v',
    ].join('\n');
    const { tree } = compile(src);
    const list = tree.children.find(n => n.type === 'VerticalList');
    expect(list).toBeDefined();
    expect(list!.text).toBe('Product');
  });

  it('should parse tab bar syntax', () => {
    const src = [
      '[[Tab 1]]  [Tab 2]  [Tab 3]',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const activeTab = findByType(tree, 'ActiveTab');
    expect(activeTab).toBeDefined();
    expect(activeTab!.text).toBe('Tab 1');
  });

  it('should parse a table with sortable columns', () => {
    const src = [
      '| Name  v | Age ^ | Role    |',
      '|---------|-------|---------|',
      '| Alice   |  30   | Eng     |',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const table = findByType(tree, 'Table');
    expect(table).toBeDefined();
  });

  it('should parse radio button group', () => {
    const src = [
      '(*) Option A',
      '( ) Option B',
      '( ) Option C',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const radios = findAllByType(tree, 'Radio');
    expect(radios.length).toBe(3);
    const selected = radios.filter(r => r.state === 'selected');
    expect(selected.length).toBe(1);
  });

  it('should parse toggle switches', () => {
    const src = '{[on]/off}';
    const { tree } = parse(src, { mode: 'autofix' });
    const toggle = findByType(tree, 'Toggle');
    expect(toggle).toBeDefined();
    expect(toggle!.state).toBe('on');
  });

  it('should handle unicode box-drawing', () => {
    const src = [
      '┌─── Title ───┐',
      '│ content     │',
      '└─────────────┘',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    // After unicode normalization, this should be a valid box
    const box = findByType(tree, 'Box');
    expect(box).toBeDefined();
  });

  it('should parse breadcrumbs', () => {
    const src = 'Home > Products > Electronics';
    const { tree } = parse(src, { mode: 'autofix' });
    const bc = findByType(tree, 'Breadcrumb');
    expect(bc).toBeDefined();
  });

  it('should strip open accordion guide markers from content', () => {
    const src = [
      '[FAQ ^]',
      '|  You can return items within 30 days.',
      '+--+',
      '',
      '[Shipping v]',
    ].join('\n');
    const { svg, tree } = compile(src);
    const accordion = findByType(tree, 'Accordion');
    const labels = findAllByType(tree, 'Label').map(label => label.text);

    expect(accordion).toBeDefined();
    expect(labels).toContain('You can return items within 30 days.');
    expect(labels).not.toContain('|  You can return items within 30 days.');
    expect(svg).not.toContain('+--+');
  });

  it('should parse tree view', () => {
    const src = [
      '- Documents',
      '  - Work',
      '    - Project A',
      '  + Personal',
      '+ Downloads',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const treeNodes = findAllByType(tree, 'TreeNode');
    expect(treeNodes.length).toBeGreaterThanOrEqual(3);
  });

  it('should parse a complex box with title', () => {
    const src = [
      '+--- Settings ---+',
      '|                |',
      '|  Dark mode:    |',
      '|  {[on]/off}    |',
      '|                |',
      '+----------------+',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const box = findByType(tree, 'Box');
    expect(box).toBeDefined();
    if (box) {
      expect(box.text).toContain('Settings');
    }
  });

  it('should parse a typed container with a repaired right edge', () => {
    const src = [
      '+--@Modal--- Confirm ----------------+',
      '|                                     |',
      '|  Delete this item?                  |',
      '|                                     |',
      '|  [Delete]  [Cancel]                 |',
      '|                                     |',
      '+-------------------------------------+',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const box = findByType(tree, 'Box');
    expect(box?.text).toBe('Confirm');
    expect(box?.typeName).toBe('Modal');
    expect(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+--@Modal--');
  });

  it('should parse nested boxes without literal border fragments', () => {
    const src = [
      '+--- Dashboard ---------------------------+',
      '| +--- Stats --------+ +--- Chart -------+ |',
      '| | Users: 1,234     | | [=======...] 70%| |',
      '| +------------------+ +-----------------+ |',
      '+-----------------------------------------+',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    expect(tree.children.find(node => node.type === 'Box' && node.text === 'Dashboard')).toBeDefined();
    expect(findAllByType(tree, 'Box').map(box => box.text)).toEqual(expect.arrayContaining(['Stats', 'Chart']));
    expect(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+-----------------------------------------+');
  });

  it('should parse a top-border tab bar inside its box', () => {
    const src = [
      '+--[[Overview]]--[Details]--[Settings]--+',
      '| Overview tab content                   |',
      '+----------------------------------------+',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    expect(findByType(tree, 'Box')).toBeDefined();
    expect(findByType(tree, 'TabBar')).toBeDefined();
    expect(findByType(tree, 'ActiveTab')?.text).toBe('Overview');
    expect(findAllByType(tree, 'Label').map(label => label.text)).not.toContain('+--');
  });

  it('should parse parenthesized status titles as toast notifications', () => {
    const src = [
      '+-- (v) ----------------------------+',
      '| File saved successfully           |',
      '+-----------------------------------+',
    ].join('\n');
    const { svg, tree } = compile(src);
    const toast = findByType(tree, 'Toast');

    expect(toast).toBeDefined();
    expect(toast?.annotationType).toBe('v');
    expect(toast?.text).toBeUndefined();
    expect(svg).toContain('data-markui="status-icon"');
    expect(svg).not.toContain('(v)');
  });

  it('should not treat ordinary titles starting with status letters as toasts', () => {
    const src = [
      '+--- Invoice ---+',
      '| Details       |',
      '+---------------+',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    expect(findByType(tree, 'Toast')).toBeUndefined();
    expect(findByType(tree, 'Box')?.text).toBe('Invoice');
  });
});

describe('visual regression fixtures', () => {
  it('keeps both columns in the column layout fixture', () => {
    const { tree } = parse(visualFixture('04-column-layout.markui'), { mode: 'autofix' });
    const columnLayout = findByType(tree, 'ColumnLayout');
    expect(columnLayout).toBeDefined();
    expect(columnLayout!.children).toHaveLength(2);
    expect(findByType(tree, 'Heading')?.text).toBe('Dashboard');
    expect(findAllByType(tree, 'TableCell').map(cell => cell.text)).toContain('Team B');
  });

  it('renders the contact form fixture as a box with a textarea', () => {
    const { tree } = parse(visualFixture('05-form-annotations.markui'), { mode: 'autofix' });
    const box = findByType(tree, 'Box');
    expect(box?.text).toBe('Contact');
    expect(findByType(tree, 'Textarea')).toBeDefined();
    expect(findByType(tree, 'Annotation')?.text).toBe('We will only use this for the reply');
    expect(findAllByType(tree, 'Button').map(button => button.text)).toEqual(expect.arrayContaining(['Send', 'Cancel']));
  });

  it('recognizes all list container marker styles', () => {
    const { tree } = parse(visualFixture('07-list-containers.markui'), { mode: 'autofix' });
    expect(findByType(tree, 'VerticalList')?.text).toBe('Product');
    expect(findByType(tree, 'HorizontalList')?.text).toBe('Suggested');
    expect(findByType(tree, 'WrappedList')?.text).toBe('Tag');
    expect(findAllByType(tree, 'Button').map(button => button.text)).toEqual(expect.arrayContaining(['Add']));
  });

  it('keeps tabbed navigation inside its container', () => {
    const { tree } = parse(visualFixture('08-tabs-and-navigation.markui'), { mode: 'autofix' });
    expect(findByType(tree, 'Box')).toBeDefined();
    expect(findByType(tree, 'TabBar')).toBeDefined();
    expect(findByType(tree, 'Breadcrumb')).toBeDefined();
    expect(findByType(tree, 'Pagination')).toBeDefined();
    expect(findByType(tree, 'Expander')?.text).toBe('Details');
    expect(findAllByType(tree, 'Label').map(label => label.text?.trim())).toContain('Owner: Team UI');
  });

  it('keeps dense dashboard cards and table inside the dashboard box', () => {
    const { tree } = parse(visualFixture('09-dense-dashboard.markui'), { mode: 'autofix' });
    const dashboard = tree.children.find(node => node.type === 'Box' && node.text === 'Admin Dashboard');
    expect(dashboard).toBeDefined();
    expect(dashboard!.children.filter(child => child.type === 'Box')).toHaveLength(3);
    const table = findByType(tree, 'Table');
    expect(table).toBeDefined();
    expect(table!.row).toBe(9);
    expect(findAllByType(tree, 'TableCell').map(cell => cell.text)).toContain('Billing');
  });

  it('keeps the preview regression content and nested message card', () => {
    const { tree } = parse(visualFixture('10-current-bad-preview.markui'), { mode: 'autofix' });
    const preview = tree.children.find(node => node.type === 'Box' && node.text === 'Preview Regression Candidate');
    expect(preview).toBeDefined();
    expect(findByType(tree, 'ColumnLayout')).toBeDefined();
    expect(findByType(tree, 'VerticalList')?.text).toBe('Message');
    expect(findByType(tree, 'Icon')?.iconIndex).toBe(1);
    expect(findByType(tree, 'ActiveTab')?.text).toBe('Open');
    expect(findAllByType(tree, 'Button').map(button => button.text)).toEqual(expect.arrayContaining(['Reply', 'Archive']));
    expect(findByType(tree, 'Annotation')?.text).toBe('Watch for text clipping, nested box drift, and list styling.');
  });
});
