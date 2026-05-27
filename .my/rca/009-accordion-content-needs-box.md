# RCA: Accordion Content Needs Boxed Sections

## Status

Open.

## Finding

Accordion sections have the same visual issue as expanders: expanded content renders loose instead of inside a section panel.

## Affected Area

- `.my/Language/04g-navigation.md`
- `packages/markui-core/src/parser/merger.ts`
- `packages/markui-core/src/renderer/svg-renderer.ts`

## Observed Input

```markui
[FAQ ^]
You can return items within 30 days.

[Shipping v]

[Warranty v]
```

## Expected Rendering

An accordion should render as a grouped component made of multiple expander sections:

- every section has a header row
- expanded sections have a boxed content panel
- collapsed sections have no content panel
- the group reads visually as one accordion, not unrelated rows

## Evidence

The merge pass creates an `Accordion` when multiple expander sections are present. The renderer then loops through the accordion children and delegates each child to the expander renderer.

Because the expander renderer lacks a content panel, accordion sections inherit the same loose-content problem.

## Root Cause

`Accordion` rendering is only a delegation wrapper around child `Expander` nodes. It does not add group chrome, and the child expander rendering does not box expanded content.

## Recommended Fix

Fix the shared expander rendering first, then add accordion group styling if needed.

The accordion renderer should:

- keep section headers aligned as one component
- use the expander body panel for open sections
- optionally draw one outer accordion frame when multiple sections belong together

## Verification

Add or update tests for:

- accordion with one expanded and multiple collapsed sections
- expanded section content is boxed
- no legacy guide lines or literal `+---` fragments appear

Then run:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

