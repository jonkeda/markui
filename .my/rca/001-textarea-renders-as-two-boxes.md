# RCA: Textarea Renders As Two Boxes

## Status

Open.

## Finding

The textarea example renders as two controls: a short single-line input above a larger textarea. It should render as one textarea box.

Screenshot reference: image supplied in chat for "Textarea".

## Affected Area

- `.my/Language/04c-inputs-forms.md`
- `packages/markui-core/src/parser/merger.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
Description:
<                              >
<                              >
<                              >
```

## Expected Rendering

One labeled textarea control:

- `Description:` as the field label
- one multi-line textarea box
- no separate single-line input above it

## Evidence

The parsed tree currently treats the first input line as a normal form field value and only merges the remaining input lines into a textarea:

```text
Document
  FormField "Description:"
    Label "Description:"
    TextInput
  Textarea
```

The renderer is then doing what the AST asks for: it draws the first child as a text input and the second child as a textarea.

## Root Cause

Textarea detection runs too late relative to form-field merging. The label plus first `<...>` line is merged into a `FormField` before the textarea merge can see the full run of consecutive same-width text input lines.

The problem is parser/merge order, not primarily SVG rendering.

## Recommended Fix

Detect textarea runs before single-line form-field binding consumes the first input. A label followed by two or more same-width text input lines should become one `FormField` containing a `Textarea`, or an equivalent AST shape that renders as one labeled textarea.

The textarea merge should consume all consecutive same-width text input lines in the run.

## Verification

Add or update parser/render tests for:

- unlabeled textarea from consecutive `<...>` lines
- labeled textarea with `Description:` above the run
- textarea still not created for a normal single-line text input

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

