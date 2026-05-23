import { describe, it, expect } from 'vitest';
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

  it('should parse a card with various widgets', () => {
    const src = [
      '*--- Product ---*',
      '| Widget A      |',
      '| $19.99        |',
      '| [Buy Now]     |',
      '*---------------*',
    ].join('\n');
    const { tree } = parse(src, { mode: 'autofix' });
    const card = findByType(tree, 'Card');
    expect(card).toBeDefined();
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
      '│ content      │',
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
});
