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

describe('multi-line merge', () => {
  it('should merge consecutive < > lines into a Textarea', () => {
    const src = [
      '<                        >',
      '<                        >',
      '<                        >',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const ta = findByType(tree, 'Textarea');
    expect(ta).toBeDefined();
  });

  it('should bind a label to an entire textarea run', () => {
    const src = [
      'Description:',
      '<                        >',
      '<                        >',
      '<                        >',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const ff = findByType(tree, 'FormField');
    const ta = findByType(tree, 'Textarea');
    const inputs = findAllByType(tree, 'TextInput');

    expect(ff).toBeDefined();
    expect(ta).toBeDefined();
    expect(inputs).toHaveLength(0);
  });

  it('should parse a table with header and data rows', () => {
    const src = [
      '| Name  | Age |',
      '|-------|-----|',
      '| Alice |  30 |',
      '| Bob   |  25 |',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const table = findByType(tree, 'Table');
    expect(table).toBeDefined();
  });

  it('should group label + input into FormField', () => {
    const src = [
      'Username:',
      '<____________>',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const ff = findByType(tree, 'FormField');
    expect(ff).toBeDefined();
  });

  it('should group label + input + annotation into FormField', () => {
    const src = [
      'Email:',
      '<____________>',
      '(?) Enter your email.',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const ff = findByType(tree, 'FormField');
    expect(ff).toBeDefined();
    // Should contain annotation as child
    const ann = findByType(tree, 'Annotation');
    expect(ann).toBeDefined();
  });

  it('should bind expanded dropdown options to a labeled dropdown', () => {
    const src = [
      'Fruit:',
      '<Apple ^>',
      '  Apple',
      '  Banana',
      '  Orange',
      '->',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const ff = findByType(tree, 'FormField');
    const dropdown = findByType(tree, 'Dropdown');
    const options = findAllByType(tree, 'DropdownOption');
    const labels = findAllByType(tree, 'Label').map(label => label.text);

    expect(ff).toBeDefined();
    expect(dropdown?.state).toBe('expanded');
    expect(options.map(option => option.text)).toEqual(['Apple', 'Banana', 'Orange']);
    expect(labels).not.toContain('->');
  });

  it('should bind multi-select dropdown options to a labeled dropdown', () => {
    const src = [
      'Assignees:',
      '<Team ^>',
      '  [x] Alice',
      '  [ ] Bob',
      '->',
    ].join('\n');
    const { tree } = parse(src, { mode: 'strict' });
    const options = findAllByType(tree, 'DropdownOption');

    expect(options.map(option => option.text)).toEqual(['Alice', 'Bob']);
    expect(options.map(option => option.state)).toEqual(['checked', 'unchecked']);
  });
});
