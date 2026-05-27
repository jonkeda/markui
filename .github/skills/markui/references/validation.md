# MarkUI Validation

Use this reference before changing examples, language docs, parser behavior, or renderer behavior in this repository.

## Repository Commands

Run commands from the repository root with `pnpm`.

For language docs after building core:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

For regular markdown examples after building core:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs
```

For tokenizer syntax changes:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core lint
```

For VS Code extension syntax, snippets, markdown preview, or notebook renderer changes:

```powershell
pnpm --filter markui-vscode build
pnpm --filter markui-vscode lint
```

Run broader workspace checks when changes cross package boundaries:

```powershell
pnpm build
pnpm test
pnpm lint
```

## File Ownership

- Source code lives under `packages/*/src`.
- Do not manually edit generated `dist/` files unless the task explicitly requests packaged artifacts.
- Do not manually edit `.vsix` artifacts.
- Keep public core exports routed through `packages/markui-core/src/index.ts`.
- Update `.my/Language/` and `.github/skills/markui/` when language syntax changes.

## Manual Checks

When no renderer or parser is available:

- Closed boxes have matching top and bottom borders.
- Closed box content rows start and end with `|`.
- Open-right boxes omit trailing right corners and right borders.
- Tables include a dash separator row.
- Expanded dropdowns close visible option lists with `->`.
- Accordion bodies use plain content under the open header.
- Image placeholders leave room before controls below.
- Examples contain only UI text, not requirements or implementation notes.
