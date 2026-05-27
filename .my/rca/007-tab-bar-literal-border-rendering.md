# RCA: Tab Bar Does Not Render Correctly

## Status

Open.

## Finding

The tab bar example renders literal border fragments and separate button-like controls. It should render as one tab container with a proper active tab.

Screenshot reference: image supplied in chat for "Tab Bar".

## Affected Area

- `.my/Language/04g-navigation.md`
- `packages/markui-core/src/parser/boxes.ts`
- `packages/markui-core/src/parser/tree-builder.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
+--[[Overview]]--[Details]--[Settings]--+
| Overview tab content                   |
+----------------------------------------+
```

## Expected Rendering

One rendered tab container:

- `Overview` rendered as the active tab
- `Details` and `Settings` rendered as inactive tabs
- content rendered inside the same container
- no visible `+--`, `--`, or bottom border fragments

## Evidence

The parsed tree currently tokenizes the top border as normal inline content:

```text
Document
  HorizontalGroup
    Label "+--"
    ActiveTab "Overview"
    Label "--"
    Button "Details"
    Label "--"
    Button "Settings"
    Label "--+"
  TableRow or label content
  Label "+----------------------------------------+"
```

The existing tab-bar renderer can only run after the parser has detected a containing box and `detectTabBar` has identified tabs on the top border. In this case, box detection fails first.

## Root Cause

The top border contains tab tokens, so it no longer looks like a plain `+-----+` border to the box detector. Because no box is detected, tab-bar detection never runs, and the top border is tokenized as visible text plus button/tab tokens.

## Recommended Fix

Teach box detection to accept tab tokens embedded in the top border, or add an earlier tab-container detection pass before ordinary tokenization.

The parser should:

- classify the top row as a tab-container border
- extract `[[Overview]]`, `[Details]`, and `[Settings]` as tabs
- consume border separators such as `+--` and `--+`
- attach the content row to the tab container

The renderer should then render the existing `TabBar` node as one cohesive component.

## Verification

Add or update tests for:

- tab bar with active tab
- tab bar with multiple inactive tabs
- tab container content
- no literal border fragments in output

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

