# RCA: Typed Container Boxes Do Not Render Correctly

## Status

Open.

## Finding

Typed container examples render border fragments as visible text instead of rendering one complete box. The `@Type` marker and title are not converted into a typed container visual.

Screenshot reference: image supplied in chat for "Typed Container".

## Affected Area

- `.my/Language/04i-components-alerts-images.md`
- `packages/markui-core/src/parser/boxes.ts`
- `packages/markui-core/src/parser/tree-builder.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
+--@Modal--- Confirm ----------------+
|                                     |
|  Delete this item?                  |
|                                     |
|  [Delete]  [Cancel]                 |
|                                     |
+-------------------------------------+
```

## Expected Rendering

One rendered container box:

- semantic type stored as `Modal`
- visible title rendered as `Confirm`
- body content rendered inside the box
- no visible `+--@Modal--` or dashed title fragments

## Evidence

The current sample has a top border that is one column shorter than the body and bottom border:

```text
top line:    38 chars
body line:   39 chars
bottom line: 39 chars
```

The parsed tree therefore treats the top border as normal content:

```text
Document
  HorizontalGroup
    Label "+--@Modal--"
    TreeNode "Confirm ----------------+"
  Table
  Label "+-------------------------------------+"
```

Because no `Box` is detected, `@Modal` type extraction never runs.

## Root Cause

The immediate docs issue is a malformed example: the typed container top border does not line up with the right side and bottom border.

The parser issue is that box detection is strict about exact right-edge alignment. When a typed title border is off by one, the entire container falls through into normal tokenization.

## Recommended Fix

Fix the documentation example so the top, body, and bottom borders align.

Then improve box detection tolerance for typed containers:

- allow a small one-column border repair when the rest of the box is clear
- keep `@Type` extraction independent from visible title extraction
- do not emit repaired border fragments as labels/tree nodes

## Verification

Add or update tests for:

- aligned `+--@Modal--- Confirm ---+` typed container
- one-column mismatch repair for typed containers
- `typeName === "Modal"` and visible title `Confirm`
- no literal border fragments in output

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

