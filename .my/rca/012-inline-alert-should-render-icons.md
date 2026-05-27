# RCA: Inline Alert Should Render Icons

## Status

Open.

## Finding

Standalone inline alerts render raw annotation prefixes such as `(i)`, `(!)`, `(x)`, and `(v)`. They should render with icons.

## Affected Area

- `.my/Language/04i-components-alerts-images.md`
- `packages/markui-core/src/parser/tokenizer.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
(i) This is an informational message.
(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

## Expected Rendering

Each inline alert should render as an alert row with:

- status icon
- status color
- message text
- no raw `(i)`, `(!)`, `(x)`, or `(v)` prefix

## Evidence

The tokenizer correctly classifies these rows as `Annotation` nodes. The renderer then prints the prefix literally:

```text
(${annotationType}) message
```

So the parser has the semantic information, but the renderer does not convert it into icon UI.

## Root Cause

`renderAnnotation` is still a literal syntax renderer. It colors the text by annotation type but keeps the source marker visible.

## Recommended Fix

Update annotation rendering for standalone alerts:

- map annotation type to an icon
- draw the icon before the message
- keep color semantics
- do not render the raw prefix

If inline alerts and field annotations need different layouts, add a context flag or infer from parent node.

## Verification

Add or update tests for:

- standalone info/warning/error/success alert icon rendering
- raw prefixes are absent from SVG text
- color mapping remains correct

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

