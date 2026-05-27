# RCA: Notification Should Render Status Icon

## Status

Open.

## Finding

Toast notifications currently use visible text markers like `(v)` and `(x)`. The rendered notification should use an icon instead of showing the raw marker.

## Affected Area

- `.my/Language/04i-components-alerts-images.md`
- `packages/markui-core/src/parser/tree-builder.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
+-- (v) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please try again.  |
+-----------------------------------+
```

## Expected Rendering

Each notification should render with:

- a status icon for success or error
- message text
- no visible `(v)` or `(x)` marker

## Evidence

Toast detection currently checks for a title starting with a bare status character and space:

```text
^[?$!ixv]\s
```

The docs use annotation-style markers with parentheses, such as `(v)` and `(x)`. Even when a toast is detected, the current toast renderer only renders text and does not draw a status icon.

## Root Cause

The docs and parser disagree on notification status syntax. The renderer also lacks a status-icon rendering path for toast notifications.

## Recommended Fix

Normalize toast status parsing and rendering.

The parser should accept the documented status marker format or the docs should be changed to the accepted syntax. The preferred user-facing rendering should map status markers to icons:

- `(v)` or `v` -> success icon
- `(x)` or `x` -> error icon
- `(!)` or `!` -> warning icon
- `(i)` or `i` -> info icon

The renderer should draw the icon and omit the raw marker text.

## Verification

Add or update tests for:

- success notification icon rendering
- error notification icon rendering
- raw marker not emitted as visible text
- docs examples validate

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

