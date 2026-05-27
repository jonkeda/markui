# RCA: Component Name Should Start With @

## Status

Open.

## Finding

Named component examples define the component as `markui:user-card`, while component references use `@user-card`. A component name should start with `@` consistently.

## Affected Area

- `.my/Language/04i-components-alerts-images.md`
- `.my/Language/04-markui-widget-reference.md`
- `.my/Language/01-markui-spec-v0.1.md`
- `.github/skills/markui/SkillMarkui3.MD`
- `packages/markui-vscode`, if snippets or grammar expose named component block syntax

## Observed Input

````markdown
```markui:@user-card
+--- User ----------+
| !==IMG==!         |
| <Full Name_____>  |
| (Admin)           |
+-------------------+
```
````

Component references then use:

```markui
@user-card
```

## Expected Behavior

The component name should include the `@` marker consistently, for example:

````markdown
```markui:@user-card
...
```
````

References remain:

```markui
@user-card
```

## Evidence

The tokenizer already recognizes component references only when a line starts with `@`:

```text
@name -> ComponentRef
```

The documentation currently drops the `@` in named `markui:name` block identifiers, which creates two spellings for the same concept.

## Root Cause

Named block syntax came from Markdown fence naming conventions, while component reference syntax came from MarkUI source syntax. The docs did not normalize the component name spelling across both places.

## Recommended Fix

Update the language docs and portable skill so reusable component names are written with `@`.

Decide whether parser/extension support is required for named Markdown fences:

- if the extension parses fence names, allow `markui:@component-name`
- if fence names are documentation-only today, update docs now and add parser support when named component resolution is implemented

Keep `@name` line-start references unchanged.

## Verification

Search for old component block names:

```powershell
rg -n "markui:[^@`]" .my/Language .github/skills packages
```

Then run:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```
