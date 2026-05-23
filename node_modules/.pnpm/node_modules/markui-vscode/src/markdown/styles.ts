export const markuiStyles = `
.markui-diagram {
	margin: 1em 0;
	padding: 1em;
	background: var(--vscode-editor-background, #ffffff);
	border: 1px solid var(--vscode-panel-border, #e0e0e0);
	border-radius: 4px;
	overflow-x: auto;
}

.markui-diagram svg {
	max-width: 100%;
	height: auto;
	display: block;
	margin: 0 auto;
}

.markui-diagram[data-theme="blueprint"] {
	background: #1a2744;
}

.markui-error {
	margin: 1em 0;
	padding: 0.75em 1em;
	background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
	border: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
	border-radius: 4px;
	color: var(--vscode-errorForeground, #f48771);
	font-family: var(--vscode-editor-font-family, monospace);
	font-size: var(--vscode-editor-font-size, 13px);
	white-space: pre-wrap;
}
`;
