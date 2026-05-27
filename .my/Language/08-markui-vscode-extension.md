# MarkUI VS Code Extension Design

**Date:** 2026-05-23
**Status:** Design (aligned with 06a v4.0, 07a parser architecture)
**Purpose:** VS Code extension providing IDE support for `.markui` files and ` ```markui ` fenced code blocks in markdown.

---

## 1. Overview

The MarkUI VS Code Extension provides:

| Feature | Description |
|---------|-------------|
| **Syntax Highlighting** | TextMate grammar for colorized `.markui` files |
| **Markdown Preview** | Renders `markui` fenced code blocks in markdown preview as styled wireframes |
| **Live Preview** | Side-by-side rendered wireframe panel for `.markui` files |
| **Diagnostics** | Inline error and warning markers from the parser |
| **Outline** | Document structure navigation (boxes, named sections) |
| **Snippets** | Quick insertion of common widget patterns |
| **Export** | Export to SVG, PNG |
| **Zoom Controls** | Zoom in/out, reset, fit to view |
| **Theme Support** | Clean, sketch, blueprint rendering themes |

---

## 2. Extension Structure

```
packages/vscode-extension/
├── src/
│   ├── extension.ts              # Entry point, command registration
│   ├── preview.ts                # Live preview webview panel
│   ├── diagnostics.ts            # Parse errors → VS Code diagnostics
│   ├── outline.ts                # Document symbol provider
│   ├── completion.ts             # Completion provider
│   ├── hover.ts                  # Hover information
│   └── markdown/
│       ├── plugin.ts             # markdown-it plugin for fenced blocks
│       ├── preview-script.ts     # Script injected into markdown preview
│       └── theme-detector.ts     # Light/dark theme detection
├── syntaxes/
│   └── markui.tmLanguage.json    # TextMate grammar
├── snippets/
│   └── markui.json               # Code snippets
├── language-configuration.json
├── package.json                  # Extension manifest
├── esbuild.js                    # Build script
├── tsconfig.json
└── README.md
```

---

## 3. Extension Manifest (package.json)

### 3.1 Basic Information

```json
{
  "name": "markui-vscode",
  "displayName": "MarkUI",
  "description": "MarkUI wireframe language support — preview, syntax highlighting, and export",
  "version": "0.1.0",
  "publisher": "jonkeda",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Programming Languages",
    "Visualization"
  ],
  "activationEvents": [
    "onLanguage:markui"
  ],
  "main": "./out/extension.js"
}
```

### 3.2 Contributes

```json
{
  "contributes": {
    "languages": [{
      "id": "markui",
      "aliases": ["MarkUI", "markui"],
      "extensions": [".markui"],
      "configuration": "./language-configuration.json"
    }],

    "grammars": [{
      "language": "markui",
      "scopeName": "source.markui",
      "path": "./syntaxes/markui.tmLanguage.json"
    }],

    "snippets": [{
      "language": "markui",
      "path": "./snippets/markui.json"
    }],

    "markdown.markdownItPlugins": true,

    "markdown.previewScripts": [
      "./out/markdown/preview-script.js"
    ],

    "notebookRenderer": [{
      "id": "jonkeda.markdown-it.markui-extension",
      "displayName": "MarkUI renderer for Markdown",
      "entrypoint": {
        "extends": "vscode.markdown-it-renderer",
        "path": "./out/markdown/notebook-renderer.js"
      }
    }],

    "commands": [
      {
        "command": "markui.preview",
        "title": "Open Preview",
        "category": "MarkUI",
        "icon": "$(open-preview)"
      },
      {
        "command": "markui.exportSvg",
        "title": "Export to SVG",
        "category": "MarkUI"
      },
      {
        "command": "markui.exportPng",
        "title": "Export to PNG",
        "category": "MarkUI"
      },
      {
        "command": "markui.changeTheme",
        "title": "Change Preview Theme",
        "category": "MarkUI"
      },
      {
        "command": "markui.zoomIn",
        "title": "Zoom In",
        "category": "MarkUI"
      },
      {
        "command": "markui.zoomOut",
        "title": "Zoom Out",
        "category": "MarkUI"
      },
      {
        "command": "markui.zoomReset",
        "title": "Reset Zoom",
        "category": "MarkUI"
      }
    ],

    "menus": {
      "editor/title": [{
        "command": "markui.preview",
        "when": "resourceLangId == markui",
        "group": "navigation"
      }],
      "editor/context": [
        {
          "command": "markui.exportSvg",
          "when": "resourceLangId == markui",
          "group": "markui"
        },
        {
          "command": "markui.exportPng",
          "when": "resourceLangId == markui",
          "group": "markui"
        }
      ]
    },

    "keybindings": [
      {
        "command": "markui.preview",
        "key": "ctrl+shift+v",
        "mac": "cmd+shift+v",
        "when": "resourceLangId == markui"
      },
      {
        "command": "markui.zoomIn",
        "key": "ctrl+=",
        "mac": "cmd+=",
        "when": "markui.previewFocused"
      },
      {
        "command": "markui.zoomOut",
        "key": "ctrl+-",
        "mac": "cmd+-",
        "when": "markui.previewFocused"
      },
      {
        "command": "markui.zoomReset",
        "key": "ctrl+0",
        "mac": "cmd+0",
        "when": "markui.previewFocused"
      }
    ],

    "configuration": {
      "title": "MarkUI",
      "properties": {
        "markui.defaultTheme": {
          "type": "string",
          "default": "clean",
          "enum": ["clean", "sketch", "blueprint"],
          "description": "Default rendering theme for preview"
        },
        "markui.previewAutoRefresh": {
          "type": "boolean",
          "default": true,
          "description": "Auto-refresh preview on document changes"
        },
        "markui.exportScale": {
          "type": "number",
          "default": 2,
          "description": "Scale factor for PNG export (1x, 2x, 3x)"
        },
        "markui.validateOnSave": {
          "type": "boolean",
          "default": true,
          "description": "Run validation on file save"
        },
        "markui.autoPreview": {
          "type": "boolean",
          "default": false,
          "description": "Automatically open preview when opening a .markui file"
        }
      }
    }
  }
}
```

---

## 4. TextMate Grammar

MarkUI is a spatial/positional language, not a keyword-based DSL. TextMate grammars are regex-based and line-oriented, which limits what can be highlighted. The strategy is to highlight structural elements (brackets, borders, annotations) rather than trying to parse full widget semantics.

### 4.1 Grammar Structure

```json
{
  "name": "MarkUI",
  "scopeName": "source.markui",
  "patterns": [
    { "include": "#box-border" },
    { "include": "#card-border" },
    { "include": "#heading" },
    { "include": "#annotation" },
    { "include": "#button" },
    { "include": "#active-tab" },
    { "include": "#checkbox" },
    { "include": "#radio" },
    { "include": "#input" },
    { "include": "#dropdown" },
    { "include": "#toggle" },
    { "include": "#badge" },
    { "include": "#tag" },
    { "include": "#link" },
    { "include": "#icon" },
    { "include": "#image" },
    { "include": "#separator" },
    { "include": "#component-ref" },
    { "include": "#slot" }
  ]
}
```

### 4.2 Key Patterns

#### Box Borders

```json
{
  "box-border": {
    "patterns": [
      {
        "comment": "Top/bottom border with optional title",
        "match": "^\\s*(\\+[-─=.# ]+\\+|\\+--\\+)\\s*$",
        "name": "markup.heading.markui"
      },
      {
        "comment": "Box border with title text",
        "match": "(\\+---\\s*)(.+?)(\\s*---+\\+)",
        "captures": {
          "1": { "name": "markup.heading.markui" },
          "2": { "name": "entity.name.section.markui" },
          "3": { "name": "markup.heading.markui" }
        }
      },
      {
        "comment": "Left/right vertical border",
        "match": "^\\s*\\|",
        "name": "markup.heading.markui"
      }
    ]
  }
}
```

#### Card Borders

```json
{
  "card-border": {
    "match": "(\\*---\\s*)(.+?)(\\s*---+\\*)",
    "captures": {
      "1": { "name": "markup.heading.markui" },
      "2": { "name": "entity.name.tag.markui" },
      "3": { "name": "markup.heading.markui" }
    }
  }
}
```

#### Buttons and Active Tabs

```json
{
  "active-tab": {
    "match": "\\[\\[([^\\]]+)\\]\\]",
    "captures": {
      "1": { "name": "markup.bold.markui" }
    },
    "name": "entity.name.function.markui"
  },
  "button": {
    "match": "\\[([^\\[\\]]+)\\]",
    "name": "entity.name.function.markui"
  }
}
```

#### Inputs and Dropdowns

```json
{
  "input": {
    "match": "<([^>]+)>",
    "name": "string.markui"
  },
  "dropdown": {
    "match": "<(.+?)\\s+([v^])>",
    "captures": {
      "1": { "name": "string.markui" },
      "2": { "name": "keyword.operator.markui" }
    }
  }
}
```

#### Annotations

```json
{
  "annotation": {
    "match": "^\\s*(\\(\\?\\)|\\(\\$\\)|\\(!\\)|\\(i\\)|\\(x\\)|\\(v\\))\\s*(.*)",
    "captures": {
      "1": { "name": "keyword.control.markui" },
      "2": { "name": "comment.markui" }
    }
  }
}
```

#### Toggle, Badge, Radio, Tag

```json
{
  "toggle": {
    "match": "\\{(\\[?[^}]+\\]?)/(\\[?[^}]+\\]?)\\}",
    "name": "constant.language.markui"
  },
  "badge": {
    "match": "\\{([0-9]+|!)\\}",
    "name": "constant.numeric.markui"
  },
  "radio": {
    "match": "\\((\\*| )\\)",
    "name": "keyword.operator.markui"
  },
  "tag": {
    "match": "\\(([^()]+)\\)",
    "name": "entity.name.tag.markui"
  }
}
```

#### Links, Icons, Images, Separators, Components

```json
{
  "link": {
    "match": "_([^_]+)_",
    "name": "markup.underline.link.markui"
  },
  "icon": {
    "match": "#(\\d+)",
    "name": "constant.character.markui"
  },
  "image": {
    "match": "!([=]+[^!]*[=]+)!",
    "name": "string.regexp.markui"
  },
  "separator": {
    "match": "^\\s*---+\\s*$",
    "name": "comment.line.markui"
  },
  "heading": {
    "match": "^(#{1,3})\\s+(.*)",
    "captures": {
      "1": { "name": "markup.heading.markui" },
      "2": { "name": "entity.name.section.markui" }
    }
  },
  "component-ref": {
    "match": "^\\s*@([a-zA-Z][a-zA-Z0-9_-]*)",
    "name": "variable.other.markui"
  },
  "slot": {
    "match": "\\{@slot(:[a-zA-Z][a-zA-Z0-9_-]*)?\\}",
    "name": "variable.parameter.markui"
  }
}
```

---

## 5. Language Configuration

```json
{
  "brackets": [
    ["[", "]"],
    ["<", ">"],
    ["{", "}"],
    ["(", ")"],
    ["+", "+"]
  ],
  "autoClosingPairs": [
    { "open": "[", "close": "]" },
    { "open": "<", "close": ">" },
    { "open": "{", "close": "}" },
    { "open": "(", "close": ")" },
    { "open": "\"", "close": "\"" }
  ],
  "surroundingPairs": [
    { "open": "[", "close": "]" },
    { "open": "<", "close": ">" },
    { "open": "{", "close": "}" },
    { "open": "(", "close": ")" },
    { "open": "_", "close": "_" }
  ],
  "folding": {
    "markers": {
      "start": "^\\s*\\+---",
      "end": "^\\s*\\+--\\+"
    }
  }
}
```

---

## 6. Extension Implementation

### 6.1 Entry Point

```typescript
import * as vscode from 'vscode';
import { MarkUIParser } from '@jonkeda/markui-core';
import { showPreview, updatePreview } from './preview';
import { validateDocument } from './diagnostics';
import { MarkUIOutlineProvider } from './outline';
import { MarkUICompletionProvider } from './completion';
import { MarkUIHoverProvider } from './hover';

let previewPanel: vscode.WebviewPanel | undefined;
let diagnosticCollection: vscode.DiagnosticCollection;
let currentTheme = 'clean';
let currentZoom = 100;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('markui');
  context.subscriptions.push(diagnosticCollection);

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('markui.preview', () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) showPreview(context, editor.document);
    }),
    vscode.commands.registerCommand('markui.exportSvg', () => exportToFormat('svg')),
    vscode.commands.registerCommand('markui.exportPng', () => exportToFormat('png')),
    vscode.commands.registerCommand('markui.changeTheme', changeTheme),
    vscode.commands.registerCommand('markui.zoomIn', () => zoom(+25)),
    vscode.commands.registerCommand('markui.zoomOut', () => zoom(-25)),
    vscode.commands.registerCommand('markui.zoomReset', () => zoom(0)),
  );

  // Providers
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider('markui', new MarkUIOutlineProvider()),
    vscode.languages.registerCompletionItemProvider('markui', new MarkUICompletionProvider()),
    vscode.languages.registerHoverProvider('markui', new MarkUIHoverProvider()),
  );

  // Watchers
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === 'markui') {
        validateDocument(e.document, diagnosticCollection);
        if (previewPanel) updatePreview(previewPanel, e.document, currentTheme, currentZoom);
      }
    }),
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === 'markui') validateDocument(doc, diagnosticCollection);
    }),
  );
}

export function deactivate() {
  previewPanel?.dispose();
}
```

### 6.2 Parser Integration

The extension depends on `@jonkeda/markui-core` which implements the 7-phase parser from doc 07a. The core package exposes:

```typescript
// @jonkeda/markui-core public API

interface ParseResult {
  tree: WidgetTree;           // AST from Phase 7
  errors: ParseError[];       // Errors from any phase
  boxes: Box[];               // Detected boxes from Phase 2
}

interface ParseError {
  message: string;
  row: number;                // 0-based grid row
  col: number;                // 0-based grid col
  endCol?: number;
  severity: 'error' | 'warning';
}

interface WidgetTree {
  type: string;
  children: WidgetNode[];
}

function parse(source: string): ParseResult;
function render(tree: WidgetTree, theme: string): string;  // → SVG
```

### 6.3 Diagnostics

```typescript
function validateDocument(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection
) {
  const source = document.getText();
  const { errors } = parse(source);

  const diagnostics = errors.map((error) => {
    const range = new vscode.Range(
      error.row, error.col,
      error.row, error.endCol ?? error.col + 10
    );
    const severity = error.severity === 'error'
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning;
    return new vscode.Diagnostic(range, error.message, severity);
  });

  collection.set(document.uri, diagnostics);
}
```

### 6.4 Preview Panel

```typescript
function showPreview(
  context: vscode.ExtensionContext,
  document: vscode.TextDocument
) {
  if (previewPanel) {
    previewPanel.reveal();
  } else {
    previewPanel = vscode.window.createWebviewPanel(
      'markuiPreview',
      'MarkUI Preview',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    previewPanel.onDidDispose(() => { previewPanel = undefined; });
  }
  updatePreview(previewPanel, document, currentTheme, currentZoom);
}

function updatePreview(
  panel: vscode.WebviewPanel,
  document: vscode.TextDocument,
  theme: string,
  zoom: number
) {
  const source = document.getText();
  const { tree, errors } = parse(source);

  if (tree && errors.length === 0) {
    const svg = render(tree, theme);
    panel.webview.html = getPreviewHtml(svg, zoom);
  } else {
    panel.webview.html = getErrorHtml(errors);
  }
}
```

### 6.5 Export

```typescript
async function exportToFormat(format: 'svg' | 'png') {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== 'markui') return;

  const { tree, errors } = parse(editor.document.getText());
  if (!tree || errors.length > 0) {
    vscode.window.showErrorMessage('Cannot export: document has errors');
    return;
  }

  const svg = render(tree, currentTheme);
  const ext = format;
  const defaultPath = editor.document.uri.fsPath.replace('.markui', `.${ext}`);

  const uri = await vscode.window.showSaveDialog({
    defaultUri: vscode.Uri.file(defaultPath),
    filters: { [ext.toUpperCase()]: [ext] },
  });

  if (!uri) return;

  if (format === 'svg') {
    await vscode.workspace.fs.writeFile(uri, Buffer.from(svg, 'utf-8'));
  } else {
    // PNG: convert SVG to PNG using canvas or sharp
    const scale = vscode.workspace.getConfiguration('markui').get<number>('exportScale', 2);
    const png = await svgToPng(svg, scale);
    await vscode.workspace.fs.writeFile(uri, png);
  }

  vscode.window.showInformationMessage(`Exported to ${uri.fsPath}`);
}
```

---

## 7. Markdown Preview Integration

MarkUI wireframes in `.md` files use fenced code blocks:

````markdown
```markui
+--- Login ----
|
|  Username: <____________>
|  Password: <____________>
|  [Login]
|
+----
```
````

Named blocks are also supported:

````markdown
```markui:@login-form
+--- Login ----
| ...
+----
```
````

### 7.1 markdown-it Plugin

```typescript
import { parse, render } from '@jonkeda/markui-core';
import { detectTheme, getThemeForMode } from './theme-detector';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function markuiPlugin(md: MarkdownIt, options?: PluginOptions) {
  const defaultTheme = options?.lightTheme ?? 'clean';
  const maxSize = options?.maxSize ?? 50_000;

  const originalFence = md.renderer.rules.fence;

  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();

    // Match ```markui or named fences such as ```markui:@component-name
    if (info === 'markui' || info.startsWith('markui:')) {
      return renderMarkuiBlock(token.content, defaultTheme, maxSize);
    }

    // Fall through to default renderer
    return originalFence
      ? originalFence(tokens, idx, opts, env, self)
      : self.render(tokens, opts, env);
  };
}

function renderMarkuiBlock(source: string, theme: string, maxSize: number): string {
  if (source.length > maxSize) {
    return `<div class="markui-error">Wireframe exceeds maximum size.</div>`;
  }

  try {
    const { tree, errors } = parse(source);

    if (errors.length > 0) {
      const msgs = errors.map(e => `Row ${e.row + 1}: ${e.message}`).join('<br>');
      return `<div class="markui-error"><strong>MarkUI Parse Error:</strong><br>${msgs}</div>`;
    }

    if (!tree) {
      return `<div class="markui-error">Failed to parse wireframe.</div>`;
    }

    const svg = render(tree, theme);
    return `<div class="markui-diagram" style="margin:16px 0; padding:16px; background:#fff; border:1px solid #e0e0e0; border-radius:4px; overflow-x:auto;">${svg}</div>`;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return `<div class="markui-error"><strong>MarkUI Error:</strong> ${escapeHtml(msg)}</div>`;
  }
}
```

### 7.2 Theme Detection

The markdown preview respects VS Code's light/dark mode:

```typescript
export function detectTheme(): 'light' | 'dark' {
  return document.body.classList.contains('vscode-dark') ? 'dark' : 'light';
}

export function getThemeForMode(mode: 'light' | 'dark'): string {
  return mode === 'dark' ? 'blueprint' : 'clean';
}
```

---

## 8. Outline Provider

The outline shows the box hierarchy as a document symbol tree:

```typescript
class MarkUIOutlineProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
    const { tree, boxes } = parse(document.getText());
    if (!tree) return [];
    return this.buildSymbols(tree.children, document);
  }

  private buildSymbols(
    nodes: WidgetNode[],
    document: vscode.TextDocument
  ): vscode.DocumentSymbol[] {
    return nodes
      .filter(n => n.type === 'Box' || n.type === 'Card' || n.type === 'Accordion')
      .map(node => {
        const range = new vscode.Range(node.row, node.col, node.row + (node.height ?? 1), 0);
        const name = node.text || node.type;
        const kind = node.type === 'Box' ? vscode.SymbolKind.Module
          : node.type === 'Card' ? vscode.SymbolKind.Class
          : vscode.SymbolKind.Enum;

        const symbol = new vscode.DocumentSymbol(name, node.type, kind, range, range);
        if (node.children) {
          symbol.children = this.buildSymbols(node.children, document);
        }
        return symbol;
      });
  }
}
```

---

## 9. Completion Provider

Context-aware completions for common patterns:

```typescript
class MarkUICompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.CompletionItem[] {
    const line = document.lineAt(position).text;
    const prefix = line.substring(0, position.character);
    const items: vscode.CompletionItem[] = [];

    // After [ — suggest widget patterns
    if (prefix.endsWith('[')) {
      items.push(
        this.snippet('Button', '[${1:Label}]'),
        this.snippet('Checkbox', '[ ] ${1:Label}', '['),
        this.snippet('Checkbox checked', '[x] ${1:Label}', '['),
        this.snippet('Stepper', '[- ${1:0} +]', '['),
        this.snippet('Spinner', '[/] ${1:Loading...}', '['),
        this.snippet('Accordion collapsed', '[${1:Section} v]', '['),
        this.snippet('Accordion expanded', '[${1:Section} ^]', '['),
      );
    }

    // After < — suggest input patterns
    if (prefix.endsWith('<')) {
      items.push(
        this.snippet('Text input', '<${1:____________}>'),
        this.snippet('Dropdown', '<${1:Select} v>'),
        this.snippet('Custom input', '<@${1:datepicker}>'),
      );
    }

    // After { — suggest toggle/badge
    if (prefix.endsWith('{')) {
      items.push(
        this.snippet('Toggle on', '{[${1:on}]/${2:off}}'),
        this.snippet('Toggle off', '{${1:on}/[${2:off}]}'),
        this.snippet('Badge', '{${1:3}}'),
      );
    }

    // After ( — suggest radio/tag/annotation
    if (prefix.endsWith('(')) {
      items.push(
        this.snippet('Radio selected', '(*) ${1:Label}'),
        this.snippet('Radio unselected', '( ) ${1:Label}'),
        this.snippet('Tag', '(${1:Label})'),
        this.snippet('Help annotation', '(?) ${1:Help text}'),
        this.snippet('Error annotation', '(x) ${1:Error message}'),
      );
    }

    // At line start — suggest structural elements
    if (prefix.trim() === '') {
      items.push(
        this.snippet('Box', '+--- ${1:Title} ---+\n|  ${2}\n+--+'),
        this.snippet('Card', '*--- ${1:Title} ---*\n| ${2}\n*---*'),
        this.snippet('Separator', '---'),
        this.snippet('Heading', '# ${1:Heading}'),
        this.snippet('Component ref', '@${1:component-name}'),
      );
    }

    return items;
  }

  private snippet(label: string, body: string, filterPrefix?: string): vscode.CompletionItem {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    item.insertText = new vscode.SnippetString(body);
    if (filterPrefix) item.filterText = filterPrefix + label.toLowerCase();
    return item;
  }
}
```

---

## 10. Hover Provider

Shows widget type information on hover:

```typescript
class MarkUIHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Hover | undefined {
    const { tree } = parse(document.getText());
    if (!tree) return undefined;

    const node = findNodeAt(tree, position.line, position.character);
    if (!node) return undefined;

    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**${node.type}**`);
    if (node.text) md.appendMarkdown(` — \`${node.text}\``);
    if (node.value !== undefined) md.appendMarkdown(`\n\nValue: \`${node.value}\``);
    if (node.state) md.appendMarkdown(`\n\nState: ${node.state}`);

    return new vscode.Hover(md);
  }
}
```

---

## 11. Code Snippets

```json
{
  "Login Form": {
    "prefix": "login",
    "body": [
      "+--- Login ---+",
      "|",
      "|  Username:",
      "|  <________________________>",
      "|",
      "|  Password:",
      "|  <________________________>",
      "|",
      "|  [x] Remember me",
      "|",
      "|  [Login]",
      "|",
      "+--+"
    ],
    "description": "Login form wireframe"
  },

  "Form Field": {
    "prefix": "field",
    "body": [
      "${1:Label}:",
      "<________________________>",
      "(?) ${2:Help text}"
    ],
    "description": "Form field with label and help text"
  },

  "Tab Bar": {
    "prefix": "tabs",
    "body": [
      "+--[[${1:Tab 1}]]--[${2:Tab 2}]--[${3:Tab 3}]--+",
      "|  ${0}",
      "+--+"
    ],
    "description": "Tab bar with content"
  },

  "Card": {
    "prefix": "card",
    "body": [
      "*--- ${1:Title} ---*",
      "| ${0}",
      "*---*"
    ],
    "description": "Repeatable card"
  },

  "Dock Layout": {
    "prefix": "dock",
    "body": [
      "+------------------------------+",
      "| ${1:Header}                       |",
      "+--------+---------------------+",
      "| ${2:Side}   | ${3:Main Content}        |",
      "|        |                     |",
      "+--------+---------------------+",
      "| ${4:Footer}                       |",
      "+------------------------------+"
    ],
    "description": "Dock layout (header/sidebar/main/footer)"
  },

  "Table": {
    "prefix": "table",
    "body": [
      "| ${1:Name}  | ${2:Value} |",
      "|-------|-------|",
      "| ${3:Row 1} | ${4:Data}  |",
      "| ${5:Row 2} | ${6:Data}  |"
    ],
    "description": "Data table"
  },

  "Dropdown Expanded": {
    "prefix": "dropdown",
    "body": [
      "<${1:Select} ^>",
      "  ${2:Option 1}",
      "  ${3:Option 2}",
      "  ${4:Option 3}",
      "->"
    ],
    "description": "Expanded dropdown"
  },

  "Accordion": {
    "prefix": "accordion",
    "body": [
      "[${1:Section 1} ^]",
      "|  ${2:Content here}",
      "+--+",
      "",
      "[${3:Section 2} v]",
      "",
      "[${4:Section 3} v]"
    ],
    "description": "Accordion with sections"
  },

  "Toast": {
    "prefix": "toast",
    "body": [
      "+-- (${1|v,i,!,x|}) ----------------------------+",
      "| ${2:Message text}                    |",
      "+-----------------------------------+"
    ],
    "description": "Toast notification"
  }
}
```

---

## 12. Build and Packaging

### 12.1 Dependencies

```json
{
  "dependencies": {
    "@jonkeda/markui-core": "workspace:*"
  },
  "devDependencies": {
    "@types/vscode": "^1.85.0",
    "esbuild": "^0.20.0",
    "typescript": "^5.4.0"
  }
}
```

### 12.2 Build Script (esbuild)

Bundle the extension and markdown preview script separately:

```javascript
const { build } = require('esbuild');

// Extension main bundle (Node.js)
build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  platform: 'node',
  external: ['vscode'],
  format: 'cjs',
});

// Markdown preview script (browser)
build({
  entryPoints: ['src/markdown/preview-script.ts'],
  bundle: true,
  outfile: 'out/markdown/preview-script.js',
  platform: 'browser',
  format: 'iife',
});
```

### 12.3 Package Structure

The monorepo uses pnpm workspaces:

```
packages/
├── core/                    # Parser + renderer (shared)
│   ├── src/
│   │   ├── parser/          # 7-phase parser (doc 07a)
│   │   ├── renderer/        # SVG renderer
│   │   └── index.ts
│   └── package.json
├── vscode-extension/        # This extension
│   └── package.json         # depends on @jonkeda/markui-core
├── themes/                  # Rendering themes
└── cli/                     # CLI tool
```

---

## 13. Differences from Wireframe Extension

The Wireframe extension parses a keyword-based DSL (indentation, named elements). MarkUI is fundamentally different:

| Aspect | Wireframe | MarkUI |
|--------|-----------|--------|
| **Language** | Keyword-based DSL with indentation | 2D spatial ASCII art |
| **Parsing** | 1D lexer/parser (ANTLR-like) | 2D grid → box detection → line tokenization (7 phases) |
| **File format** | `.wire` | `.markui` |
| **TextMate grammar** | Keywords, modifiers, attributes | Brackets, borders, positional patterns |
| **Folding** | Indentation-based | Box border markers (`+---` / `+--+`) |
| **Outline** | Element tree by indentation | Box containment tree by spatial position |
| **Markdown blocks** | ` ```wireframe ` | ` ```markui ` and ` ```markui:@name ` |
| **Completion** | Element names, attributes | Bracket patterns, structural templates |

The core innovation is that MarkUI's source code IS the visual layout — the parser must understand 2D spatial relationships, not just a token stream.
