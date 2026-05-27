# RCA: Boxless UI Needs A Default Rendered Container

## Status

Open.

## Finding

A UI written without an explicit outer ASCII box renders as loose controls on the page. The desired behavior is that a boxless UI still renders inside a visible container box.

## Affected Area

- `.my/Language/04f-containers-layout.md`
- `packages/markui-core/src/renderer/svg-renderer.ts`
- potentially `packages/markui-core/src/parser/tree-builder.ts`

## Observed Input

```markui
Username:
<Jane____________>

Password:
<****____________>

[Login]
```

## Expected Rendering

The controls should render as a complete UI surface with an implicit outer box, even though the source does not draw one.

## Evidence

The current document AST contains root-level controls:

```text
Document
  FormField "Username:"
  FormField "Password:"
  Button "Login"
```

The document renderer renders those direct children without wrapping them in a container.

## Root Cause

The renderer treats the `Document` node as a transparent layout root. It does not create a visual frame when no top-level `Box` exists.

This was acceptable for literal widget snippets, but it does not match the newer design rule that complete boxless UIs should still preview as a boxed UI.

## Recommended Fix

Add an implicit root container for boxless documents that contain visible UI controls. This can be implemented either:

- in rendering, by drawing a root frame around direct document children when there is no top-level box
- in AST normalization, by wrapping root-level nodes in an implicit `Box`

The implicit container should not change source syntax. It is a rendering behavior.

## Verification

Add or update tests for:

- a boxless form renders with one outer frame
- an explicitly boxed UI does not get a duplicate outer frame
- small single-widget examples still render cleanly

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

