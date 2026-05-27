# RCA: List Containers Need Box And Scrollbar

## Status

Open.

## Finding

Vertical, horizontal, and wrapped list containers do not render with a strong enough list frame. They should render with a box around the list, make it visually clear that the contents are a list, and include a scrollbar affordance.

## Affected Area

- `.my/Language/04f-containers-layout.md`
- `packages/markui-core/src/parser/tree-builder.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
v--- Tasks ---v
| [ ] One     |
| [x] Two     |
v-------------v
```

```markui
>--- Steps ---------------->
| [One] [Two] [Three]      |
>-------------------------->
```

```markui
w--- Tags -----------------w
| {alpha} {beta} {gamma}   |
| {delta} {epsilon}        |
w--------------------------w
```

## Expected Rendering

Each list container should render as a list surface:

- a visible outer box/frame
- list-oriented child arrangement
- a scrollbar or scroll affordance
- clear visual difference from a generic card or ordinary box

## Evidence

The parser maps `v`, `>`, and `w` corner markers to list node types:

```text
VerticalList
HorizontalList
WrappedList
```

The renderer currently routes these through generic box rendering. Scrollbars are only rendered when explicit scrollbar metadata is present, such as border syntax using `#`.

## Root Cause

List containers have AST-level meaning, but the renderer does not give them a dedicated list treatment. They inherit generic box/card rendering and only show scrollbars when explicit border scroll markers are parsed.

## Recommended Fix

Add dedicated rendering for `VerticalList`, `HorizontalList`, and `WrappedList`.

The renderer should:

- draw an outer list frame
- keep the title/header behavior
- arrange children according to list direction
- add a scrollbar affordance by default for list containers
- preserve explicit scrollbar markers where present

## Verification

Add or update SVG renderer tests for:

- vertical list frame and scrollbar
- horizontal list frame and scrollbar
- wrapped list frame and scrollbar
- no regression for normal boxes/cards

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

