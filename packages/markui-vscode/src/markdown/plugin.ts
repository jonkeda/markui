import { compile } from '@jonkeda/markui-core';
import { detectTheme, getThemeForMode } from './theme-detector';

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function renderMarkuiBlock(source: string, theme: string, maxSize: number): string {
	if (source.length > maxSize) {
		return `<div class="markui-error">MarkUI block too large (${source.length} characters, max ${maxSize}).</div>`;
	}
	try {
		const { svg, errors } = compile(source, { mode: 'autofix', theme });
		const criticalErrors = errors.filter(e => e.severity === 'error');
		if (criticalErrors.length > 0) {
			const messages = criticalErrors
				.map(e => `Line ${e.row}:${e.col} - ${escapeHtml(e.message)}`)
				.join('\n');
			return `<div class="markui-error">MarkUI errors:\n${messages}</div>`;
		}
		return `<div class="markui-diagram" data-theme="${escapeHtml(theme)}">${svg}</div>`;
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return `<div class="markui-error">MarkUI render error: ${escapeHtml(message)}</div>`;
	}
}

export function markuiPlugin(md: any, options?: { lightTheme?: string; darkTheme?: string; maxSize?: number }) {
	const lightTheme = options?.lightTheme || 'clean';
	const darkTheme = options?.darkTheme || 'blueprint';
	const maxSize = options?.maxSize || 50000;

	const defaultFence = md.renderer.rules.fence;
	md.renderer.rules.fence = (tokens: any[], idx: number, opts: any, env: any, self: any) => {
		const token = tokens[idx];
		const info = token.info.trim();
		if (info === 'markui' || info.startsWith('markui:')) {
			const mode = detectTheme();
			const theme = getThemeForMode(mode, lightTheme, darkTheme);
			return renderMarkuiBlock(token.content, theme, maxSize);
		}
		return defaultFence
			? defaultFence(tokens, idx, opts, env, self)
			: `<pre><code>${escapeHtml(token.content)}</code></pre>`;
	};
}
