# RCA: Remove File Drop Zone

## Status

Open.

## Finding

The widget reference includes a File Drop Zone example. This component should be removed.

## Affected Area

- `.my/Language/04f-containers-layout.md`
- `.my/Language/04-markui-widget-reference.md`
- `.my/prompts/04-markui-widget-reference-design.md`, if the prompt still references it

## Observed Input

The documentation includes a file drop style example using a dashed container. MarkUI does not currently have a dedicated `FileDropZone` widget type.

## Expected Result

Remove File Drop Zone from the widget reference and generated examples.

## Evidence

The current parser model supports boxes, dashed/styled borders, labels, icons, and related primitives. There is no clear first-class `FileDropZone` node that maps to a stable language feature.

Keeping it in the reference makes the docs imply a component contract that the language does not currently own.

## Root Cause

The component was included during the broader widget-reference merge as a design example, but it is outside the desired MarkUI widget surface for this round.

## Recommended Fix

Remove the File Drop Zone section and examples from the new widget reference set.

If a drop area is needed later, define it as a deliberate language feature with:

- source syntax
- AST type
- renderer behavior
- tests
- docs

## Verification

Search for remaining references:

```powershell
rg -n "FileDrop|file drop|drop zone|Drop Zone" .my/Language .my/prompts examples packages
```

Then run:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

