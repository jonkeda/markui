import { describe, it, expect } from 'vitest';
import { loadGrid } from './grid';

describe('loadGrid', () => {
  it('should create grid from simple text', () => {
    const grid = loadGrid('hello\nworld');
    expect(grid.height).toBe(2);
    expect(grid.width).toBe(5);
    expect(grid.rows[0].join('')).toBe('hello');
    expect(grid.rows[1].join('')).toBe('world');
  });

  it('should pad shorter lines with spaces', () => {
    const grid = loadGrid('long line\nhi');
    expect(grid.width).toBe(9);
    expect(grid.rows[1].join('')).toBe('hi       ');
  });

  it('should normalize unicode box-drawing characters', () => {
    const grid = loadGrid('┌─┐\n│x│\n└─┘');
    expect(grid.rows[0].join('')).toBe('+-+');
    expect(grid.rows[1].join('')).toBe('|x|');
    expect(grid.rows[2].join('')).toBe('+-+');
  });

  it('should handle double-line unicode (═)', () => {
    const grid = loadGrid('═══');
    expect(grid.rows[0].join('')).toBe('---');
  });

  it('should strip trailing blank lines', () => {
    const grid = loadGrid('hello\n\n\n');
    expect(grid.height).toBe(1);
  });

  it('should handle empty input', () => {
    const grid = loadGrid('');
    expect(grid.height).toBe(0);
    expect(grid.width).toBe(0);
  });

  it('should handle single line', () => {
    const grid = loadGrid('[Button]');
    expect(grid.height).toBe(1);
    expect(grid.width).toBe(8);
  });

  it('should handle mixed ascii and unicode', () => {
    const grid = loadGrid('+─┐\n│ │\n└─+');
    expect(grid.rows[0].join('')).toBe('+-+');
    expect(grid.rows[1].join('')).toBe('| |');
    expect(grid.rows[2].join('')).toBe('+-+');
  });

  it('should handle Windows line endings', () => {
    const grid = loadGrid('abc\r\ndef');
    expect(grid.height).toBe(2);
    expect(grid.rows[0].join('')).toBe('abc');
    expect(grid.rows[1].join('')).toBe('def');
  });
});
