# RCA: Nested Boxes Render Literal Border Text

## Status

Open.

## Finding

Nested boxes render parts of the ASCII border literally, such as `+---` and the bottom border. The outer box should render as a real box. The parser should also tolerate small alignment mistakes where `+` and `|` do not line up perfectly.

Screenshot reference: image supplied in chat for "Nested Boxes".

## Affected Area

- `.my/Language/04f-containers-layout.md`
- `packages/markui-core/src/parser/boxes.ts`
- `packages/markui-core/src/parser/tree-builder.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
+--- Dashboard ---------------------------+
| +--- Stats --------+ +--- Chart -------+ |
| | Users: 1,234     | | [=======...] 70%| |
| +------------------+ +-----------------+ |
+-----------------------------------------+
```

## Expected Rendering

One outer rendered box titled `Dashboard`, containing two inner rendered boxes:

- `Stats`
- `Chart`

No literal border fragments should appear in the visual output.

## Evidence

The parsed tree currently starts with literal content from the top border instead of an outer `Box`:

```text
Document
  HorizontalGroup
    Label "+--"
    TreeNode "Dashboard ---------------------------+"
  Box "Stats"
  ContextMenu "Chart"
  HorizontalGroup
    Label "+-----------------------------------------+"
```

That means the outer ASCII box was not detected before tokenization.

## Root Cause

Box detection is too strict for this nested layout. It expects aligned border columns and matching sides. If the top border, side bars, or bottom border are slightly inconsistent, the outer box is rejected and later tokenized as visible text/tree syntax.

The renderer also has special handling for some nested titled structures that can draw only a separator/title instead of a full box, but the main failure in this example happens earlier: the outer box is not detected as a box.

## Recommended Fix

Improve box detection tolerance for nested layouts.

The parser should:

- detect top and bottom borders even when inner content slightly shifts perceived right edges
- tolerate a nearby `|` under a `+` within a small alignment threshold
- infer the outer right edge from the widest matching border row where possible
- consume repaired border rows so they do not become labels/tree nodes
- keep strict behavior for clearly invalid boxes

The renderer should also be reviewed so nested titled boxes render as full boxes when the language example expects a rendered container.

## Verification

Add tests for:

- perfectly aligned nested boxes
- slightly misaligned nested boxes
- border fragments are not emitted as visible labels
- nested rendered boxes still contain their children

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

