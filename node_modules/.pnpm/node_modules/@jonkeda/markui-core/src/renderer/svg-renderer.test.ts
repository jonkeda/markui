import { describe, it, expect } from 'vitest';
import { renderToSvg } from './svg-renderer';
import { getTheme } from './themes';
import type { WidgetNode } from '../types';

describe('renderToSvg', () => {
  const theme = getTheme('clean');

  function makeNode(overrides: Partial<WidgetNode> & { type: WidgetNode['type'] }): WidgetNode {
    return {
      row: 0, col: 0, width: 10, children: [],
      ...overrides,
    };
  }

  it('should render a Document node with SVG wrapper', () => {
    const tree = makeNode({ type: 'Document' });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('</svg>');
  });

  it('should render a Button', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Button', text: 'Click Me', col: 0, width: 10 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('Click Me');
    expect(svg).toContain('<rect');
  });

  it('should render a Checkbox', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Checkbox', state: 'checked', col: 0, width: 3 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('<rect');
  });

  it('should render a TextInput', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'TextInput', value: 'hello', col: 0, width: 15 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('hello');
  });

  it('should render a Heading', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Heading', text: 'Title', level: 1, col: 0, width: 7 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('Title');
  });

  it('should render a Separator', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Separator', col: 0, width: 20 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('<line');
  });

  it('should render a Label', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Label', text: 'Hello World', col: 0, width: 11 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('Hello World');
  });

  it('should render a Badge', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Badge', text: '3', col: 0, width: 3 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('3');
  });

  it('should render a Box with children', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({
        type: 'Box', text: 'Container', col: 0, width: 30, height: 5,
        children: [makeNode({ type: 'Label', text: 'Inside', row: 1, col: 2, width: 6 })],
      })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('Container');
    expect(svg).toContain('Inside');
  });

  it('should render with blueprint theme', () => {
    const blueprintTheme = getTheme('blueprint');
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Button', text: 'Test', col: 0, width: 6 })],
    });
    const svg = renderToSvg(tree, blueprintTheme);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Test');
  });

  it('should escape HTML entities in text', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Label', text: '<script>alert("xss")</script>', col: 0, width: 30 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });

  it('should handle empty Document', () => {
    const tree = makeNode({ type: 'Document' });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('should render an Icon', () => {
    const tree = makeNode({
      type: 'Document',
      children: [makeNode({ type: 'Icon', text: '1', iconIndex: 1, col: 0, width: 2 })],
    });
    const svg = renderToSvg(tree, theme);
    expect(svg).toContain('#1');
  });
});

describe('getTheme', () => {
  it('should return clean theme by default', () => {
    const theme = getTheme('clean');
    expect(theme.fontFamily).toBeDefined();
    expect(theme.fontSize).toBeGreaterThan(0);
  });

  it('should return blueprint theme', () => {
    const theme = getTheme('blueprint');
    expect(theme.background).toContain('#');
  });

  it('should return sketch theme', () => {
    const theme = getTheme('sketch');
    expect(theme.fontFamily).toBeDefined();
  });

  it('should default to clean for unknown name', () => {
    const theme = getTheme('unknown');
    const clean = getTheme('clean');
    expect(theme.background).toBe(clean.background);
  });
});
