import { randomBytes } from 'crypto';
import * as vscode from 'vscode';
import { parse, compile, getTheme, renderToSvg } from '@jonkeda/markui-core';
import type { WidgetNode, ParseError, Box } from '@jonkeda/markui-core';
import { markuiPlugin } from './markdown/plugin';

let diagnosticCollection: vscode.DiagnosticCollection;
let previewPanel: vscode.WebviewPanel | undefined;
let previewUpdateTimer: NodeJS.Timeout | undefined;
let currentTheme: ThemeName;
let currentZoom = 100;

type ThemeName = 'clean' | 'sketch' | 'blueprint';
const ALLOWED_THEMES = new Set<ThemeName>(['clean', 'sketch', 'blueprint']);

export function activate(context: vscode.ExtensionContext) {
	const config = vscode.workspace.getConfiguration('markui');
	currentTheme = normalizeTheme(config.get<string>('defaultTheme', 'clean'));

	diagnosticCollection = vscode.languages.createDiagnosticCollection('markui');
	context.subscriptions.push(diagnosticCollection);

	// Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('markui.preview', () => openPreview(context)),
		vscode.commands.registerCommand('markui.exportSvg', exportToSvg),
		vscode.commands.registerCommand('markui.changeTheme', changeTheme),
		vscode.commands.registerCommand('markui.zoomIn', () => adjustZoom(25)),
		vscode.commands.registerCommand('markui.zoomOut', () => adjustZoom(-25)),
		vscode.commands.registerCommand('markui.zoomReset', () => { currentZoom = 100; updatePreview(); }),
	);

	// Completion provider
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			'markui',
			new MarkuiCompletionProvider(),
			'[', '<', '{', '(', '#', '@'
		)
	);

	// Hover provider
	context.subscriptions.push(
		vscode.languages.registerHoverProvider('markui', new MarkuiHoverProvider())
	);

	// Document symbol (outline) provider
	context.subscriptions.push(
		vscode.languages.registerDocumentSymbolProvider('markui', new MarkuiOutlineProvider())
	);

	// Document change watcher
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.languageId === 'markui') {
				validateDocument(e.document);
				if (config.get<boolean>('previewAutoRefresh', true)) {
					schedulePreviewUpdate();
				}
			}
		})
	);

	// Document open watcher
	context.subscriptions.push(
		vscode.workspace.onDidOpenTextDocument(doc => {
			if (doc.languageId === 'markui') {
				validateDocument(doc);
				if (config.get<boolean>('autoPreview', false)) {
					openPreview(context);
				}
			}
		})
	);

	// Document save watcher
	context.subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(doc => {
			if (doc.languageId === 'markui' && config.get<boolean>('validateOnSave', true)) {
				validateDocument(doc);
			}
		})
	);

	// Document close watcher - clean up diagnostics
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(doc => {
			diagnosticCollection.delete(doc.uri);
		})
	);

	// Validate any already-open markui documents
	for (const doc of vscode.workspace.textDocuments) {
		if (doc.languageId === 'markui') {
			validateDocument(doc);
		}
	}

	return {
		extendMarkdownIt(md: any) {
			return md.use(markuiPlugin);
		}
	};
}

export function deactivate() {
	if (previewUpdateTimer) clearTimeout(previewUpdateTimer);
	previewPanel?.dispose();
}

// --- Diagnostics ---

function validateDocument(document: vscode.TextDocument): void {
	const source = document.getText();
	try {
		const result = parse(source, { mode: 'strict' });
		const diagnostics = result.errors.map(err => errorToDiagnostic(err, document));
		diagnosticCollection.set(document.uri, diagnostics);
	} catch {
		diagnosticCollection.set(document.uri, []);
	}
}

function errorToDiagnostic(err: ParseError, document: vscode.TextDocument): vscode.Diagnostic {
	const startLine = Math.max(0, err.row - 1);
	const startCol = Math.max(0, err.col - 1);
	const endLine = err.endRow != null ? Math.max(0, err.endRow - 1) : startLine;
	const endCol = err.endCol != null ? Math.max(0, err.endCol - 1) : document.lineAt(Math.min(endLine, document.lineCount - 1)).text.length;

	const range = new vscode.Range(startLine, startCol, endLine, endCol);

	let severity: vscode.DiagnosticSeverity;
	switch (err.severity) {
		case 'error': severity = vscode.DiagnosticSeverity.Error; break;
		case 'warning': severity = vscode.DiagnosticSeverity.Warning; break;
		case 'info': severity = vscode.DiagnosticSeverity.Information; break;
	}

	const diagnostic = new vscode.Diagnostic(range, err.message, severity);
	diagnostic.code = err.code;
	diagnostic.source = 'markui';
	return diagnostic;
}

// --- Preview ---

function openPreview(context: vscode.ExtensionContext): void {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== 'markui') {
		vscode.window.showWarningMessage('Open a .markui file to preview.');
		return;
	}

	if (previewPanel) {
		previewPanel.reveal(vscode.ViewColumn.Beside);
		updatePreview();
		return;
	}

	previewPanel = vscode.window.createWebviewPanel(
		'markuiPreview',
		'MarkUI Preview',
		vscode.ViewColumn.Beside,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);

	previewPanel.onDidDispose(() => {
		previewPanel = undefined;
		vscode.commands.executeCommand('setContext', 'markui.previewFocused', false);
	}, null, context.subscriptions);

	previewPanel.onDidChangeViewState(e => {
		vscode.commands.executeCommand('setContext', 'markui.previewFocused', e.webviewPanel.active);
	}, null, context.subscriptions);

	previewPanel.webview.onDidReceiveMessage(message => {
		handlePreviewMessage(message);
	}, null, context.subscriptions);

	updatePreview();
}

function schedulePreviewUpdate(): void {
	if (previewUpdateTimer) clearTimeout(previewUpdateTimer);
	previewUpdateTimer = setTimeout(() => {
		previewUpdateTimer = undefined;
		updatePreview();
	}, 150);
}

function adjustZoom(delta: number): void {
	if (currentZoom === -1) currentZoom = 100;
	currentZoom = clampZoom(currentZoom + delta);
	updatePreview();
}

function handlePreviewMessage(message: unknown): void {
	if (!isRecord(message) || typeof message.command !== 'string') return;

	switch (message.command) {
		case 'zoomIn': adjustZoom(25); break;
		case 'zoomOut': adjustZoom(-25); break;
		case 'zoomReset': currentZoom = 100; updatePreview(); break;
		case 'zoomFit': currentZoom = -1; updatePreview(); break;
		case 'setZoom':
			if (typeof message.value === 'number' && Number.isFinite(message.value)) {
				currentZoom = clampZoom(message.value);
				updatePreview();
			}
			break;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function clampZoom(value: number): number {
	return Math.max(25, Math.min(400, Math.round(value)));
}

function updatePreview(): void {
	if (!previewPanel) return;

	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== 'markui') return;

	const source = editor.document.getText();
	let svg = '';
	let errors: ParseError[] = [];

	try {
		const result = compile(source, { mode: 'autofix', theme: currentTheme });
		svg = result.svg;
		errors = result.errors;
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		errors = [{ code: 'RENDER_ERROR', message, row: 1, col: 1, severity: 'error', phase: 1 }];
	}

	const zoomStyle = currentZoom === -1
		? 'max-width: 100%; height: auto;'
		: `transform: scale(${currentZoom / 100}); transform-origin: top left;`;

	const zoomLabel = currentZoom === -1 ? 'Fit' : `${currentZoom}%`;

	const warningErrors = errors.filter(e => e.severity === 'warning' || e.severity === 'info');
	const criticalErrors = errors.filter(e => e.severity === 'error');

	const errorsHtml = criticalErrors.length > 0
		? `<div class="errors">${criticalErrors.map(e =>
			`<div class="error-item">Line ${e.row}:${e.col} [${escapeHtml(e.code)}] ${escapeHtml(e.message)}</div>`
		).join('')}</div>`
		: '';

	const warningsHtml = warningErrors.length > 0
		? `<div class="warnings">${warningErrors.map(e =>
			`<div class="warning-item">Line ${e.row}:${e.col} [${escapeHtml(e.code)}] ${escapeHtml(e.message)}</div>`
		).join('')}</div>`
		: '';

	previewPanel.webview.html = getPreviewHtml(previewPanel.webview, svg, zoomStyle, zoomLabel, errorsHtml, warningsHtml);
}

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getPreviewHtml(webview: vscode.Webview, svg: string, zoomStyle: string, zoomLabel: string, errorsHtml: string, warningsHtml: string): string {
	const nonce = getNonce();
	const escapedTheme = escapeHtml(currentTheme);
	const escapedZoomLabel = escapeHtml(zoomLabel);

	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		background: var(--vscode-editor-background);
		color: var(--vscode-editor-foreground);
		font-family: var(--vscode-font-family);
		font-size: var(--vscode-font-size);
		overflow: auto;
	}
	.toolbar {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: var(--vscode-editorWidget-background);
		border-bottom: 1px solid var(--vscode-editorWidget-border);
	}
	.toolbar button {
		padding: 2px 8px;
		background: var(--vscode-button-secondaryBackground);
		color: var(--vscode-button-secondaryForeground);
		border: 1px solid var(--vscode-button-border, transparent);
		border-radius: 2px;
		cursor: pointer;
		font-size: 13px;
	}
	.toolbar button:hover {
		background: var(--vscode-button-secondaryHoverBackground);
	}
	.toolbar .zoom-label {
		min-width: 48px;
		text-align: center;
		font-size: 12px;
		color: var(--vscode-descriptionForeground);
	}
	.toolbar .info {
		margin-left: auto;
		font-size: 11px;
		color: var(--vscode-descriptionForeground);
	}
	.errors {
		padding: 8px 12px;
		background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
		border-bottom: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
	}
	.error-item {
		color: var(--vscode-errorForeground, #f48771);
		font-family: monospace;
		font-size: 12px;
		padding: 2px 0;
	}
	.warnings {
		padding: 8px 12px;
		background: var(--vscode-inputValidation-warningBackground, #352a05);
		border-bottom: 1px solid var(--vscode-inputValidation-warningBorder, #b89500);
	}
	.warning-item {
		color: var(--vscode-editorWarning-foreground, #cca700);
		font-family: monospace;
		font-size: 12px;
		padding: 2px 0;
	}
	.preview-container {
		padding: 16px;
		overflow: auto;
	}
	.preview-svg {
		${zoomStyle}
	}
</style>
</head>
<body>
	<div class="toolbar">
		<button id="zoomOut" title="Zoom Out">−</button>
		<span class="zoom-label" id="zoomLabel">${escapedZoomLabel}</span>
		<button id="zoomIn" title="Zoom In">+</button>
		<button id="zoomReset" title="Reset Zoom">100%</button>
		<button id="zoomFit" title="Fit to Width">Fit</button>
		<span class="info">Theme: ${escapedTheme}</span>
	</div>
	${errorsHtml}
	${warningsHtml}
	<div class="preview-container">
		<div class="preview-svg">${svg}</div>
	</div>
	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		document.getElementById('zoomIn').addEventListener('click', () => vscode.postMessage({ command: 'zoomIn' }));
		document.getElementById('zoomOut').addEventListener('click', () => vscode.postMessage({ command: 'zoomOut' }));
		document.getElementById('zoomReset').addEventListener('click', () => vscode.postMessage({ command: 'zoomReset' }));
		document.getElementById('zoomFit').addEventListener('click', () => vscode.postMessage({ command: 'zoomFit' }));

		document.addEventListener('wheel', (e) => {
			if (e.ctrlKey) {
				e.preventDefault();
				vscode.postMessage({ command: e.deltaY < 0 ? 'zoomIn' : 'zoomOut' });
			}
		}, { passive: false });

		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomIn' });
			} else if (e.ctrlKey && e.key === '-') {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomOut' });
			} else if (e.ctrlKey && e.key === '0') {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomReset' });
			}
		});
	</script>
</body>
</html>`;
}

function getNonce(): string {
	return randomBytes(16).toString('base64');
}

// --- Export to SVG ---

async function exportToSvg(): Promise<void> {
	const editor = vscode.window.activeTextEditor;
	if (!editor || editor.document.languageId !== 'markui') {
		vscode.window.showWarningMessage('Open a .markui file to export.');
		return;
	}

	const source = editor.document.getText();
	try {
		const result = compile(source, { mode: 'autofix', theme: currentTheme });
		const criticalErrors = result.errors.filter(e => e.severity === 'error');
		if (criticalErrors.length > 0) {
			const proceed = await vscode.window.showWarningMessage(
				`There are ${criticalErrors.length} error(s). Export anyway?`,
				'Export', 'Cancel'
			);
			if (proceed !== 'Export') return;
		}

		const defaultUri = editor.document.uri.with({
			path: editor.document.uri.path.replace(/\.markui$/, '.svg')
		});

		const saveUri = await vscode.window.showSaveDialog({
			defaultUri,
			filters: { 'SVG Files': ['svg'] }
		});

		if (saveUri) {
			await vscode.workspace.fs.writeFile(saveUri, Buffer.from(result.svg, 'utf-8'));
			vscode.window.showInformationMessage(`Exported SVG to ${saveUri.fsPath}`);
		}
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		vscode.window.showErrorMessage(`Export failed: ${message}`);
	}
}

// --- Change Theme ---

async function changeTheme(): Promise<void> {
	const picked = await vscode.window.showQuickPick(
		[
			{ label: 'clean', description: 'Clean wireframe style' },
			{ label: 'sketch', description: 'Hand-drawn sketch style' },
			{ label: 'blueprint', description: 'Blueprint technical style' },
		],
		{ placeHolder: 'Select MarkUI preview theme' }
	);

	if (picked) {
		currentTheme = normalizeTheme(picked.label);
		updatePreview();
	}
}

function normalizeTheme(value: string | undefined): ThemeName {
	return value && ALLOWED_THEMES.has(value as ThemeName) ? value as ThemeName : 'clean';
}

// --- Completion Provider ---

class MarkuiCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(
		document: vscode.TextDocument,
		position: vscode.Position
	): vscode.CompletionItem[] {
		const lineText = document.lineAt(position).text;
		const charBefore = position.character > 0 ? lineText[position.character - 1] : '';
		const linePrefix = lineText.substring(0, position.character).trimStart();

		const items: vscode.CompletionItem[] = [];

		if (charBefore === '[') {
			items.push(
				this.makeSnippet('Button', '[${1:Label}]', 'Button element'),
				this.makeSnippet('Checkbox (unchecked)', '[ ] ${1:Label}', 'Unchecked checkbox'),
				this.makeSnippet('Checkbox (checked)', '[x] ${1:Label}', 'Checked checkbox'),
				this.makeSnippet('Active Tab', '[${1:Tab}]]', 'Active tab (double bracket)'),
			);
		} else if (charBefore === '<') {
			items.push(
				this.makeSnippet('Text Input', '<${1:placeholder}>', 'Text input field'),
				this.makeSnippet('Dropdown', '<${1:Select} v>', 'Dropdown selector'),
				this.makeSnippet('Dropdown (up)', '<${1:Select} ^>', 'Dropdown opening upward'),
			);
		} else if (charBefore === '{') {
			items.push(
				this.makeSnippet('Toggle', '{${1:On}/${2:Off}}', 'Toggle switch'),
				this.makeSnippet('Badge', '{${1:0}}', 'Notification badge'),
				this.makeSnippet('Slot', '{@slot}', 'Component slot'),
				this.makeSnippet('Named Slot', '{@slot:${1:name}}', 'Named component slot'),
			);
		} else if (charBefore === '(') {
			items.push(
				this.makeSnippet('Radio (selected)', '(*) ${1:Label}', 'Selected radio button'),
				this.makeSnippet('Radio (unselected)', '( ) ${1:Label}', 'Unselected radio button'),
				this.makeSnippet('Tag', '(${1:Tag})', 'Tag / label'),
				this.makeSnippet('Info annotation', '(i) ${1:Info text}', 'Info annotation'),
				this.makeSnippet('Warning annotation', '(!) ${1:Warning text}', 'Warning annotation'),
				this.makeSnippet('Help annotation', '(?) ${1:Help text}', 'Help annotation'),
				this.makeSnippet('Success annotation', '(v) ${1:Success}', 'Success annotation'),
				this.makeSnippet('Error annotation', '(x) ${1:Error}', 'Error annotation'),
			);
		} else if (charBefore === '#') {
			items.push(
				this.makeSnippet('Icon', '#${1:1}', 'Icon by index'),
			);
		} else if (charBefore === '@') {
			items.push(
				this.makeSnippet('Component reference', '@${1:ComponentName}', 'Reference a reusable component'),
			);
		} else if (linePrefix === '' || position.character === 0) {
			items.push(
				this.makeSnippet('Box', '+--- ${1:Title} ---+\n|                   |\n| ${2:content}          |\n|                   |\n+-------------------+', 'Box container'),
				this.makeSnippet('Card', '*--- ${1:Title} ---*\n|                   |\n| ${2:content}          |\n|                   |\n*-------------------*', 'Card container'),
				this.makeSnippet('Separator', '---', 'Horizontal separator'),
				this.makeSnippet('Heading 1', '# ${1:Heading}', 'Level 1 heading'),
				this.makeSnippet('Heading 2', '## ${1:Heading}', 'Level 2 heading'),
				this.makeSnippet('Heading 3', '### ${1:Heading}', 'Level 3 heading'),
				this.makeSnippet('Component ref', '@${1:ComponentName}', 'Reference a component'),
			);
		}

		return items;
	}

	private makeSnippet(label: string, insertText: string, detail: string): vscode.CompletionItem {
		const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
		item.insertText = new vscode.SnippetString(insertText);
		item.detail = detail;
		return item;
	}
}

// --- Hover Provider ---

class MarkuiHoverProvider implements vscode.HoverProvider {
	provideHover(
		document: vscode.TextDocument,
		position: vscode.Position
	): vscode.Hover | undefined {
		const source = document.getText();
		try {
			const result = parse(source, { mode: 'autofix' });
			const node = findNodeAtPosition(result.tree, position.line + 1, position.character + 1);
			if (!node) return undefined;

			const lines: string[] = [
				`**${node.type}**`,
			];
			if (node.text) lines.push(`Text: \`${node.text}\``);
			if (node.value) lines.push(`Value: \`${node.value}\``);
			if (node.state) lines.push(`State: \`${node.state}\``);
			if (node.width) lines.push(`Width: ${node.width}`);
			if (node.height) lines.push(`Height: ${node.height}`);
			if (node.children.length > 0) lines.push(`Children: ${node.children.length}`);

			const markdown = new vscode.MarkdownString(lines.join('\n\n'));
			return new vscode.Hover(markdown);
		} catch {
			return undefined;
		}
	}
}

function findNodeAtPosition(node: WidgetNode, row: number, col: number): WidgetNode | undefined {
	// Check children first (more specific matches)
	for (const child of node.children) {
		const found = findNodeAtPosition(child, row, col);
		if (found) return found;
	}

	// Check if this node contains the position
	const nodeEndCol = node.col + node.width;
	const nodeEndRow = node.height ? node.row + node.height : node.row;

	if (row >= node.row && row <= nodeEndRow && col >= node.col && col <= nodeEndCol) {
		return node;
	}

	return undefined;
}

// --- Outline (Document Symbol) Provider ---

class MarkuiOutlineProvider implements vscode.DocumentSymbolProvider {
	provideDocumentSymbols(
		document: vscode.TextDocument
	): vscode.DocumentSymbol[] {
		const source = document.getText();
		try {
			const result = parse(source, { mode: 'autofix' });
			return this.buildSymbolsFromBoxes(result.boxes, document);
		} catch {
			return [];
		}
	}

	private buildSymbolsFromBoxes(boxes: Box[], document: vscode.TextDocument): vscode.DocumentSymbol[] {
		return boxes.map(box => {
			const startLine = Math.max(0, box.top - 1);
			const endLine = Math.min(document.lineCount - 1, box.bottom - 1);
			const startCol = Math.max(0, box.left - 1);
			const endCol = document.lineAt(endLine).text.length;

			const range = new vscode.Range(startLine, startCol, endLine, endCol);
			const selectionRange = new vscode.Range(startLine, startCol, startLine, document.lineAt(startLine).text.length);

			const name = box.title || box.typeName || 'Container';
			const kind = this.getSymbolKind(box.typeName);

			const symbol = new vscode.DocumentSymbol(
				name,
				box.typeName || '',
				kind,
				range,
				selectionRange
			);

			symbol.children = this.buildSymbolsFromBoxes(box.children, document);
			return symbol;
		});
	}

	private getSymbolKind(typeName?: string): vscode.SymbolKind {
		switch (typeName?.toLowerCase()) {
			case 'card': return vscode.SymbolKind.Class;
			case 'accordion': return vscode.SymbolKind.Enum;
			default: return vscode.SymbolKind.Module;
		}
	}
}
