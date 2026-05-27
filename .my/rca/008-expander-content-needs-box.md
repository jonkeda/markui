# RCA: Expander Content Needs A Box

## Status

Open.

## Finding

Expanded expander content renders as loose controls directly under the header. The content of an open expander should render inside a visible box/panel.

Screenshot reference: image supplied in chat for "Expander".

## Affected Area

- `.my/Language/04g-navigation.md`
- `packages/markui-core/src/parser/merger.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
[Advanced Settings ^]
Timeout: [- 30 +]
Retries: [- 3 +]
```

## Expected Rendering

The expander should render as:

- one header row with a chevron and title
- one content panel box under the header when expanded
- child controls inside that content panel

The content should not appear as unframed loose rows.

## Evidence

The parser correctly creates an `Expander` node with children for the expanded body. The renderer draws a header rectangle and then renders each child at its normal position:

```text
Expander "Advanced Settings" expanded
  FormField "Timeout:"
  FormField "Retries:"
```

There is no content-panel rectangle around the children.

## Root Cause

`renderAccordion` handles both `Accordion` and `Expander`. For an expanded `Expander`, it renders the header and then directly renders child nodes. The renderer never draws a body box for expanded content.

## Recommended Fix

Add a dedicated expanded-body panel in the expander renderer.

The renderer should:

- calculate the bounds of the expanded children
- draw a panel rectangle below the header
- render children inside that panel
- avoid overlapping the header border
- preserve collapsed expander behavior

## Verification

Add or update tests for:

- expanded expander body has a panel rectangle
- collapsed expander has no body panel
- child controls render inside the panel

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

