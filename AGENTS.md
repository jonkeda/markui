# AGENTS.md

## Scope

These instructions apply to the whole repository. If a nested `AGENTS.md` is added later, prefer the more specific file for files under that directory.

## Project Snapshot

MarkUI is a pnpm TypeScript workspace for turning ASCII wireframes into visual UI diagrams. The two active packages are:

- `packages/markui-core`: parser, AST/types, SVG renderer, themes, and Vitest coverage.
- `packages/markui-vscode`: VS Code extension, TextMate grammar, snippets, markdown preview integration, and notebook renderer.

Supporting areas:

- `examples/`: `.markui` examples plus markdown files with fenced `markui` blocks.
- `scripts/check-examples.cjs`: validates fenced `markui` blocks in markdown examples using the built core package.
- `scripts/debug-tree.cjs`: local parser/tree inspection helper.
- `.github/skills/markui/SKILL2.md`: LLM-facing MarkUI language guide; update it when language syntax changes.
- `.my/Language/`: design/spec notes. Keep these aligned when changing the language.
- `docs/superpowers/plans/`: implementation plans and change notes.
- `Wireframes/`: git submodule/reference material. Do not edit it unless the task explicitly targets it.

## Commands

Use pnpm from the repo root.

- Install: `pnpm install`
- Build all packages: `pnpm build`
- Test workspace: `pnpm test`
- Type/lint workspace: `pnpm lint`
- Core build: `pnpm --filter @jonkeda/markui-core build`
- Core tests: `pnpm --filter @jonkeda/markui-core test`
- Core type check: `pnpm --filter @jonkeda/markui-core lint`
- VS Code extension build: `pnpm --filter markui-vscode build`
- VS Code extension production build: `pnpm --filter markui-vscode build:prod`
- VS Code extension type check: `pnpm --filter markui-vscode lint`
- VS Code extension watch build: `pnpm --filter markui-vscode watch`
- Validate markdown examples after building core: `node scripts/check-examples.cjs`
- Validate language docs after building core: `node scripts/check-examples.cjs .my/Language`

`scripts/check-examples.cjs` imports `packages/markui-core/dist/index`, so rebuild core before relying on it.

## Development Notes

- This repo is strict TypeScript targeting ES2020/CommonJS.
- Prefer source edits under `packages/*/src`, then regenerate build output only when the task calls for packaged artifacts.
- Do not manually edit `node_modules/`, `.pnpm/`, package `node_modules/`, or generated `dist/` files.
- Do not manually edit `.vsix` artifacts. Rebuild/repackage them only for explicit release or packaging tasks.
- Keep public core exports routed through `packages/markui-core/src/index.ts`.
- The core parse flow is `loadGrid` -> `detectBoxes` -> `extractContent` -> `tokenizeLines` -> `mergeMultiLine` -> `resolveLayout` -> `buildTree`.
- Renderer changes usually need tests in `packages/markui-core/src/renderer/svg-renderer.test.ts`.
- Parser or language syntax changes usually need updates in core tests, `examples/`, `packages/markui-vscode/syntaxes/markui.tmLanguage.json`, `packages/markui-vscode/snippets/markui.json`, `.github/skills/markui/SKILL2.md`, and `.my/Language/`.

## Testing Guidance

- Add or update Vitest tests next to affected core code using `*.test.ts`.
- For tokenizer syntax, update `packages/markui-core/src/parser/tokenizer.test.ts`.
- For box/container detection, update `packages/markui-core/src/parser/boxes.test.ts`.
- For parse/render integration behavior, update `packages/markui-core/src/compile.test.ts`.
- For SVG output behavior, update `packages/markui-core/src/renderer/svg-renderer.test.ts`.
- Run the narrow package command first, then the workspace command when the change crosses package boundaries.

## MarkUI Language Guidance

- `.markui` files should contain one screen and no prose.
- Markdown files can use fenced code blocks such as ```` ```markui ```` and named blocks such as ```` ```markui:component-name ````.
- Prefer ASCII wireframe syntax unless existing docs/examples intentionally demonstrate Unicode normalization.
- Widgets on the same line imply horizontal layout; separate lines imply vertical layout.
- Text inside inputs is example data, not placeholder copy.
- Keep visible wireframes limited to UI elements. Do not encode requirements, business rules, or implementation notes as visible wireframe text.

Current syntax conventions include:

- Boxes use `+`, `-`, and `|`; open-right boxes do not need a trailing right `+`.
- List containers use `v` for vertical lists, `>` for horizontal lists, and `w` for wrapped lists.
- Inputs use `<...>`, dropdowns use `<Label v>` or `<Label ^>`, toggles use `{[on]/off}` or `{on/[off]}`, badges use `{3}` or `{!}`, radios use `(*)` and `( )`, and icons use numbered forms like `#1`.
- Annotation prefixes are limited to `(?)`, `($)`, `(!)`, `(i)`, `(x)`, and `(v)`.

## Git And Generated Files

- The worktree may already be dirty. Preserve user changes and avoid unrelated cleanup.
- Before touching generated outputs, confirm they are part of the requested deliverable.
- If source changes require regenerated artifacts, say which command produced them.
- Keep edits scoped to the package or docs area relevant to the request.
