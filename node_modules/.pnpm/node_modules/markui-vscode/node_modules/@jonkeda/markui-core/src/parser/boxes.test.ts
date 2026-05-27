import { describe, it, expect } from 'vitest';
import { detectBoxes } from './boxes';
import { loadGrid } from './grid';

describe('detectBoxes', () => {
  it('should detect a simple box', () => {
    const grid = loadGrid([
      '+---------+',
      '| content |',
      '+---------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].top).toBe(0);
    expect(boxes[0].left).toBe(0);
    expect(boxes[0].bottom).toBe(2);
    expect(boxes[0].right).toBe(10);
    expect(boxes[0].hasRightBorder).toBe(true);
    expect(boxes[0].cornerChar).toBe('+');
  });

  it('should detect a titled box', () => {
    const grid = loadGrid([
      '+--- Title ---+',
      '| stuff       |',
      '+-------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].title).toBe('Title');
  });

  it('should detect a vertical list (v corners)', () => {
    const grid = loadGrid('v--- Item ---v\n| content    |\nv------------v');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].cornerChar).toBe('v');
  });

  it('should detect a horizontal list (> corners)', () => {
    const grid = loadGrid('>--- Item --->\n| content    |\n>------------>');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].cornerChar).toBe('>');
  });

  it('should detect a wrapped list (w corners)', () => {
    const grid = loadGrid('w--- Item ---w\n| content    |\nw------------w');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].cornerChar).toBe('w');
  });

  it('should detect nested boxes', () => {
    const grid = loadGrid([
      '+-------------------+',
      '| +------+          |',
      '| | inner|          |',
      '| +------+          |',
      '+-------------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(2);
    // The inner box should have the outer as parent
    const inner = boxes.find(b => b.title === undefined && b.right - b.left < 15);
    const outer = boxes.find(b => b.right - b.left >= 15);
    expect(inner).toBeDefined();
    expect(outer).toBeDefined();
  });

  it('should detect open-right box', () => {
    const grid = loadGrid([
      '+--- Login ----',
      '|',
      '|  Username:',
      '|  <______>',
      '|',
      '+----',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].title).toBe('Login');
    expect(boxes[0].hasRightBorder).toBe(false);
  });

  it('should detect column dividers', () => {
    const grid = loadGrid([
      '+--------+--------+',
      '| Left   | Right  |',
      '+--------+--------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBeGreaterThanOrEqual(1);
    // The main box should have a column divider
    const mainBox = boxes.find(b => b.left === 0);
    expect(mainBox).toBeDefined();
  });

  it('should detect scroll indicators', () => {
    const grid = loadGrid([
      '+--- List ---+',
      '| Item 1     #',
      '| Item 2     #',
      '| Item 3     #',
      '+------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].scrollRight).toBe(true);
  });

  it('should produce no errors for valid box', () => {
    const grid = loadGrid([
      '+------+',
      '| test |',
      '+------+',
    ].join('\n'));
    const { errors } = detectBoxes(grid, 'strict');
    expect(errors.length).toBe(0);
  });

  it('should handle boxless content', () => {
    const grid = loadGrid('Just plain text');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(0);
  });

  it('should detect an open box without trailing +', () => {
    const grid = loadGrid('+--- Title ----\n|\n|  content\n|\n+----');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].hasRightBorder).toBe(false);
    expect(boxes[0].title).toBe('Title');
  });

  it('should not treat marker letters inside open-right titles as corners', () => {
    const grid = loadGrid('+--- Preview Flow ----\n|\n|  content\n|\n+----');
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].hasRightBorder).toBe(false);
    expect(boxes[0].title).toBe('Preview Flow');
  });

  it('should detect typed container', () => {
    const grid = loadGrid([
      '+--@Modal--- Confirm ---+',
      '| Are you sure?         |',
      '+-----------------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'strict');
    expect(boxes.length).toBe(1);
    expect(boxes[0].typeName).toBe('Modal');
    expect(boxes[0].title).toBe('Confirm');
  });

  it('should repair a one-column right edge mismatch in a typed container', () => {
    const grid = loadGrid([
      '+--@Modal--- Confirm ----------------+',
      '|                                     |',
      '|  Delete this item?                  |',
      '|                                     |',
      '+-------------------------------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'autofix');
    expect(boxes.length).toBe(1);
    expect(boxes[0].right).toBe(38);
    expect(boxes[0].typeName).toBe('Modal');
    expect(boxes[0].title).toBe('Confirm');
  });

  it('should detect a tab bar box with a repaired right edge', () => {
    const grid = loadGrid([
      '+--[[Overview]]--[Details]--[Settings]--+',
      '| Overview tab content                   |',
      '+----------------------------------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'autofix');
    expect(boxes.length).toBe(1);
    expect(boxes[0].title).toBeUndefined();
  });

  it('should detect a nested box layout when the right border is off by one', () => {
    const grid = loadGrid([
      '+--- Dashboard ---------------------------+',
      '| +--- Stats --------+ +--- Chart -------+ |',
      '| | Users: 1,234     | | [=======...] 70%| |',
      '| +------------------+ +-----------------+ |',
      '+-----------------------------------------+',
    ].join('\n'));
    const { boxes } = detectBoxes(grid, 'autofix');
    expect(boxes.some(box => box.title === 'Dashboard')).toBe(true);
    expect(boxes.some(box => box.title === 'Stats')).toBe(true);
    expect(boxes.some(box => box.title === 'Chart')).toBe(true);
  });
});
