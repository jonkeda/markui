# RCA: Open Dropdown Options Are Not Boxed

## Status

Open.

## Finding

Open dropdown examples render option rows as loose text below the control. The closing marker `->` is also visible. The dropdown options should render inside a dropdown panel box, and `->` should be consumed as syntax.

Screenshot reference: image supplied in chat for "Open Dropdown".

## Affected Area

- `.my/Language/04d-dropdowns-custom-inputs.md`
- `packages/markui-core/src/parser/merger.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
Fruit:
<Apple ^>
  Apple
  Banana
  Orange
->
```

Multi-select dropdowns use the same expanded-dropdown pattern but with option rows that include checkbox state.

## Expected Rendering

For open dropdowns with options:

- the dropdown control is rendered with the expanded indicator
- option rows are rendered inside a box/panel below the control
- the closing `->` marker is not rendered
- multi-select option rows are also inside the panel

Open dropdowns without option rows can be removed from the docs because they do not demonstrate useful behavior beyond the closed control with an up chevron.

## Evidence

The parsed tree currently binds the label and dropdown into a form field before expanded option merging runs:

```text
Document
  FormField "Fruit:"
    Label "Fruit:"
    Dropdown "Apple" expanded
  Label "Apple"
  Label "Banana"
  Label "Orange"
  Label "->"
```

The renderer already has dropdown option panel behavior when a `Dropdown` node has children. The options are not boxed because they never become dropdown children.

## Root Cause

Expanded-dropdown merging only handles a standalone expanded `Dropdown` token as the first line of the merge candidate. When the dropdown has a preceding label, form-field merging captures the dropdown first, so option rows remain root-level labels and the closing marker remains visible.

## Recommended Fix

Merge expanded dropdown option rows before form-field grouping, or teach form-field grouping to attach labels to an already-expanded dropdown node with children.

The parser should:

- consume option rows until `->`
- not emit `->` as visible content
- support plain option rows and checkbox option rows
- preserve option children under the dropdown node even when the dropdown is labeled

The docs should remove the "open without option rows" example.

## Verification

Add or update tests for:

- labeled open dropdown with options
- unlabeled open dropdown with options
- labeled multi-select dropdown with checkbox options
- no rendered `->` token

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

