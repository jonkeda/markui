import { describe, expect, it } from 'vitest';
import {
  createValidationResult,
  validateMarkdownMarkuiBlocks,
  validateMarkuiSource,
} from './index';

describe('markui validator', () => {
  it('validates a single MarkUI source block in strict mode', () => {
    const file = validateMarkuiSource('[Save]', {
      mode: 'strict',
      path: 'screen.markui',
    });
    const result = createValidationResult([file], 'strict');

    expect(result.ok).toBe(true);
    expect(result.mode).toBe('strict');
    expect(result.files).toHaveLength(1);
    expect(result.files[0].blocks[0]).toMatchObject({
      name: null,
      blockIndex: 0,
      startLine: 1,
      ok: true,
    });
  });

  it('extracts named and unnamed MarkUI markdown fences with source line offsets', () => {
    const markdown = [
      '# Example',
      '',
      'Intro text.',
      '',
      '```markui:user-card',
      '[Save]',
      '```',
      '',
      '```ts',
      'const ignored = true;',
      '```',
      '',
      '```markui',
      '<Email________>',
      '```',
    ].join('\n');

    const file = validateMarkdownMarkuiBlocks(markdown, {
      mode: 'strict',
      path: 'README.md',
    });

    expect(file.kind).toBe('markdown');
    expect(file.blocks).toHaveLength(2);
    expect(file.blocks.map(block => block.name)).toEqual(['user-card', null]);
    expect(file.blocks.map(block => block.startLine)).toEqual([6, 14]);
  });

  it('treats markdown with no MarkUI fences as a valid empty result', () => {
    const file = validateMarkdownMarkuiBlocks('# Plain markdown\n\nNo diagrams here.');

    expect(file.ok).toBe(true);
    expect(file.blocks).toEqual([]);
  });
});
