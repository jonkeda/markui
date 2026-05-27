# Design Prompt: Turning MarkUI Language Docs Into a Codex Skill

**Target skill:** `markui` or `markui3`  
**Primary source docs:** `.my/Language/01-markui-spec-v0.1.md`, `.my/Language/04-markui-widget-reference.md`, `.my/Language/04a-*` through `.my/Language/04i-*`  
**Existing skill draft:** `.github/skills/markui/SkillMarkui3.MD`  
**Intent:** explain how to package the MarkUI language so Codex can reliably generate, edit, and validate MarkUI wireframes.

---

## Goal

Turn the MarkUI language into a reusable Codex skill that teaches another Codex instance how to:

- Generate valid `.markui` files.
- Write `markui` and named `markui:component-name` fenced blocks in Markdown.
- Update existing MarkUI examples without drifting from the current syntax.
- Translate UI requirements into readable ASCII wireframes.
- Use project validation commands when they exist.

The skill should make Codex better at authoring MarkUI, not become a complete copy of every language document.

---

## Recommended Shape

Use a compact skill with progressive disclosure:

```text
markui/
+-- SKILL.md
+-- agents/
|   +-- openai.yaml
+-- references/
    +-- widget-reference.md
    +-- containers-layout.md
    +-- components-alerts-images.md
    +-- validation.md
```

`SKILL.md` should contain the core workflow and the syntax rules Codex needs on almost every MarkUI task.

Detailed widget chapters should move into `references/` so Codex can load them only when needed.

Do not include extra README, changelog, installation guide, or process notes inside the final skill. Those are useful in `.my/prompts`, but they add clutter inside a deployed skill.

---

## Use the Existing Skill Draft

`.github/skills/markui/SkillMarkui3.MD` is already close to the desired skill body. It includes:

- Strong trigger metadata.
- Core MarkUI rules.
- Bracket priority rules.
- Container rules.
- Navigation, tables, components, images, and validation guidance.
- A complete example.

To turn it into a standard Codex skill:

1. Put it in a folder named after the skill, such as `markui/`.
2. Rename the file to `SKILL.md`.
3. Ensure the YAML frontmatter contains only `name` and `description`.
4. Keep the body concise enough for frequent loading.
5. Move less-common or long reference material into `references/`.
6. Add `agents/openai.yaml` for UI metadata if the skill will be listed in a skill picker.

---

## Skill Metadata

The frontmatter is the trigger surface. It must be clear because Codex sees it before the skill body.

Recommended `SKILL.md` frontmatter:

```yaml
---
name: markui
description: Generate, edit, and validate MarkUI ASCII wireframes. Use when creating UI mockups, screen layouts, prototypes, .markui files, markui fenced code blocks, named markui components, or when translating UI requirements into MarkUI syntax.
---
```

Use `markui3` only if multiple incompatible MarkUI skills must coexist. If this is the current language, prefer `markui`.

---

## What Belongs In SKILL.md

Keep high-frequency authoring guidance directly in `SKILL.md`:

- `.markui` files contain one screen and no prose.
- Markdown may contain many `markui` fenced blocks.
- Named fences use `markui:component-name`, and references use `@component-name`.
- Visible wireframes contain UI only, not requirements or implementation notes.
- Text inside inputs is example data, not placeholder copy.
- Same-line widgets imply horizontal layout; separate lines imply vertical layout.
- Prefer ASCII for generated examples.
- Icon meanings for `#N` live in surrounding Markdown.
- No modifiers for disabled, required, read-only, error, or stretch state.

Also include the core disambiguation rules:

- Square-bracket priority from Doc 04.
- Angle-bracket priority from Doc 04.
- Annotation prefixes: `(?)`, `($)`, `(!)`, `(i)`, `(x)`, `(v)`.
- Structural corners: `+`, `v`, `>`, `w`.
- Open-right boxes omit trailing right corners and right borders.
- Dropdowns are `<Label v>` and `<Label ^>`, with a required space before the chevron.
- Expanders are `[Header ^]` and `[Header v]`.

Include a short procedure:

1. Decide whether the user needs a `.markui` file, Markdown fenced block, or named component.
2. Choose the major layout structure.
3. Write only visible UI.
4. Apply widget syntax and priority rules.
5. Use component references for repeated dense content.
6. Validate with local MarkUI tooling when available.

---

## What Belongs In References

Move detailed or less-common material into references:

| Reference | Source | Use when |
| --- | --- | --- |
| `references/widget-reference.md` | `04-markui-widget-reference.md` | Need bracket priorities, chapter map, or canonical syntax summary |
| `references/buttons-forms-controls.md` | `04a-*` through `04e-*` | Need detailed widget examples |
| `references/containers-layout.md` | `04f-containers-layout.md` | Need box, list, grid, dock, scroll, or splitter details |
| `references/navigation-tables.md` | `04g-*` and `04h-*` | Need tabs, accordions, tree views, context menus, or tables |
| `references/components-alerts-images.md` | `04i-components-alerts-images.md` | Need typed containers, alerts, annotations, images, components, or slots |
| `references/validation.md` | AGENTS.md commands plus parser notes | Need project-specific build/test/example-check commands |

Reference files should be curated, not blindly copied. Remove duplicated prose and keep examples small.

---

## Validation Guidance For the Skill

In this repo, the skill should tell Codex to validate language examples with:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs .my/Language
```

For normal example changes:

```powershell
pnpm --filter @jonkeda/markui-core build
node scripts/check-examples.cjs
```

For core syntax or renderer changes, the skill should defer to the repository instructions and run the relevant package tests:

```powershell
pnpm --filter @jonkeda/markui-core test
pnpm --filter @jonkeda/markui-core lint
```

The skill should also include manual checks for projects without tooling:

- Closed boxes have matching top and bottom borders.
- Open-right boxes omit all right-side borders.
- Dropdown option lists close with `->`.
- Tables include a dash separator row.
- Image placeholders leave room before controls below.
- Examples do not contain prompt instructions or requirements as visible UI.

---

## Creation Workflow

When we are ready to create the actual skill:

1. Choose the install location.
   - Project-local source: `.github/skills/markui/`
   - Personal Codex skill: `$CODEX_HOME/skills/markui` or `~/.codex/skills/markui`
2. Initialize or normalize the folder so it contains `SKILL.md`.
3. Use `SkillMarkui3.MD` as the starting body.
4. Trim `SKILL.md` to the core authoring workflow.
5. Add curated `references/` files for chapter-level details.
6. Generate or update `agents/openai.yaml`.
7. Validate the skill folder with the Codex skill validation script when available.
8. Test the skill on realistic prompts.

Example realistic prompts:

- "Create a MarkUI login screen with validation messages."
- "Turn this product card requirement into a named `markui:product-card` component."
- "Update this old MarkUI example to current dropdown and accordion syntax."
- "Build a settings page using tabs, a form, a slider, and a save/cancel action row."

---

## Desired Final Behavior

After the skill exists, a Codex instance should reliably:

- Trigger the skill for MarkUI generation and editing tasks.
- Prefer the current Doc 04 syntax.
- Avoid stale syntax such as `<v Label>`, `*---` card corners, and legacy accordion guide lines.
- Produce readable ASCII that can be parsed and previewed.
- Know when to open detailed references.
- Know how to validate examples in this repository.

The best version of this skill is small in the hot path and rich on demand: `SKILL.md` gives Codex the muscle memory, while references provide the deeper language manual.
