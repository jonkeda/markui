# RCA: Annotation Should Render Icons

## Status

Open.

## Finding

Annotations attached to fields or controls render raw prefixes such as `(x)` and `(?)`. They should render with icons, the same as inline alerts.

## Affected Area

- `.my/Language/04i-components-alerts-images.md`
- `packages/markui-core/src/parser/merger.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
Email:
<user@example.com________>
(x) Please enter a valid email.

Password:
<****____________________>
(?) Must be at least 8 characters.
```

## Expected Rendering

Field annotations should render near the associated widget with:

- icon matching annotation type
- annotation text
- no raw syntax marker
- clear association with the field/control

## Evidence

The form-field merge already attaches an annotation line to the nearest field when it immediately follows the input:

```text
FormField "Email:"
  Label "Email:"
  TextInput
  Annotation "Please enter a valid email."
```

However, the renderer for `Annotation` prints the raw marker text instead of an icon.

## Root Cause

The AST preserves annotation semantics, but `renderAnnotation` renders the source prefix literally. There is no renderer distinction between syntax marker and visual icon.

## Recommended Fix

Reuse the icon mapping from inline alerts for bound annotations.

The renderer should:

- draw a compact icon beside the annotation text
- omit the raw prefix
- keep warning/error/help/info/success color semantics
- preserve annotation binding inside `FormField`

## Verification

Add or update tests for:

- field error annotation icon
- field help annotation icon
- annotation remains attached to the form field
- no raw `(x)` or `(?)` text in rendered SVG

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

