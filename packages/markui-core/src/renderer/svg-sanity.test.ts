import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { compile, getTheme } from '../index';
import type { WidgetNode } from '../types';

const fixtureDir = path.resolve(__dirname, '../../test/visual/fixtures');
const fixtures = readdirSync(fixtureDir)
  .filter(name => name.endsWith('.markui'))
  .sort()
  .map(name => ({
    name,
    source: readFileSync(path.join(fixtureDir, name), 'utf8'),
  }));

const themes = ['clean', 'sketch', 'blueprint'];

function getNumberAttr(svg: string, attr: string): number {
  const match = svg.match(new RegExp(`${attr}="([^"]+)"`));
  if (!match) throw new Error(`Missing SVG ${attr} attribute`);
  return Number(match[1]);
}

function maxBounds(node: WidgetNode): { col: number; row: number } {
  let maxCol = node.col + (node.width ?? 0);
  let maxRow = node.row + (node.height ?? 1);

  for (const child of node.children) {
    const childBounds = maxBounds(child);
    maxCol = Math.max(maxCol, childBounds.col);
    maxRow = Math.max(maxRow, childBounds.row);
  }

  return { col: maxCol, row: maxRow };
}

function expectNoNegativeNumericDimensions(svg: string): void {
  const re = /\s(width|height)="(-?\d+(?:\.\d+)?)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    expect(Number(match[2]), `${match[1]} should be non-negative`).toBeGreaterThanOrEqual(0);
  }
}

function expectTextWithinCanvas(svg: string, width: number, height: number): void {
  const re = /<text\b[^>]*\sx="(-?\d+(?:\.\d+)?)"[^>]*\sy="(-?\d+(?:\.\d+)?)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    const x = Number(match[1]);
    const y = Number(match[2]);
    expect(x, 'text x should be inside SVG canvas').toBeGreaterThanOrEqual(0);
    expect(y, 'text y should be inside SVG canvas').toBeGreaterThanOrEqual(0);
    expect(x, 'text x should be inside SVG canvas').toBeLessThanOrEqual(width);
    expect(y, 'text y should be inside SVG canvas').toBeLessThanOrEqual(height);
  }
}

describe('visual fixture SVG sanity', () => {
  for (const fixture of fixtures) {
    for (const themeName of themes) {
      it(`${fixture.name} renders sane SVG with ${themeName}`, () => {
        const result = compile(fixture.source, { mode: 'autofix', theme: themeName });
        const errors = result.errors.filter(error => error.severity === 'error');
        expect(errors, `${fixture.name} should have no parse errors`).toEqual([]);

        const svg = result.svg;
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
        expect(svg).not.toMatch(/NaN|undefined|Infinity/);
        expect(svg).not.toMatch(/<script/i);
        expectNoNegativeNumericDimensions(svg);

        const width = getNumberAttr(svg, 'width');
        const height = getNumberAttr(svg, 'height');
        expect(width).toBeGreaterThan(0);
        expect(height).toBeGreaterThan(0);

        const theme = getTheme(themeName);
        const bounds = maxBounds(result.tree);
        expect(width).toBeGreaterThanOrEqual(bounds.col * theme.charWidth);
        expect(height).toBeGreaterThanOrEqual(bounds.row * theme.lineHeight);
        expectTextWithinCanvas(svg, width, height);
      });
    }
  }
});
