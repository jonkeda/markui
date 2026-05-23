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
});
