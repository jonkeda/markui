---
name: markui
description: Generate, edit, and validate MarkUI ASCII wireframes. Use when creating UI mockups, screen layouts, prototypes, .markui files, markui fenced code blocks, named markui components, or when translating UI requirements into MarkUI syntax.
---

# MarkUI Wireframe Authoring

Generate readable MarkUI source that can be parsed, previewed, and maintained as ASCII UI.

## Core Rules

1. `.markui` files contain one screen and no prose.
2. Markdown can contain many `markui` fenced blocks.
3. Named Markdown fences use `markui:component-name`; references use `@component-name`.
4. Visible wireframes contain UI only, not requirements, implementation notes, or prompt instructions.
5. Text inside inputs is example data, not placeholder copy.
6. Widgets on the same line imply horizontal layout; separate lines imply vertical layout.
7. Prefer ASCII for generated examples. Use documented Unicode only when it improves authoring clarity.
8. Icon meanings for numbered icons such as `#1` are defined outside the wireframe.
9. Do not encode disabled, required, read-only, error, or stretch state as widget modifiers.

## Reference Loading

- Read `references/widget-reference.md` for bracket families, parser priorities, and the chapter map.
- Read `references/buttons-forms-controls.md` for buttons, checks, inputs, dropdowns, text, icons, badges, toggles, sliders, ratings, and chips.
- Read `references/containers-layout.md` for boxes, open-right boxes, list containers, grids, scroll regions, splitters, and dock layout.
- Read `references/navigation-tables.md` for tabs, breadcrumbs, pagination, expanders, accordions, tree views, context menus, and tables.
- Read `references/components-alerts-images.md` for typed containers, alerts, annotations, image placeholders, named components, component references, and slots.
- Read `references/validation.md` before changing examples, language docs, parser behavior, or renderer behavior in this repository.

## Bracket Priorities

Interpret square brackets in this order:

| Content | Widget | Example |
| --- | --- | --- |
| single space | Checkbox off | `[ ]` |
| single `x` | Checkbox on | `[x]` |
| single `-` | Checkbox mixed | `[-]` |
| single `/` or `\` | Spinner | `[/]` |
| `- N +` | Stepper | `[- 42 +]` |
| only `=` and `.` | Slider or progress | `[=======...]` |
| only `*` and `.`, 3+ chars | Rating | `[***..]` |
| touching `[text][v]` or `[text][^]` | Split button | `[Save][v]` |
| ends with ` v` or ` ^` | Expander header | `[FAQ ^]` |
| single `<` or `>` | Previous/next button | `[<]`, `[>]` |
| `#N text` | Icon button | `[#1 Search]` |
| anything else | Button | `[Submit]` |

Interpret angle brackets in this order:

| Pattern | Widget | Example |
| --- | --- | --- |
| starts with `@` | Custom input | `<@datepicker>` |
| ends with space plus `v` | Closed dropdown | `<Country v>` |
| ends with space plus `^` | Open dropdown | `<Country ^>` |
| password/date/number shape | Specialized input | `<****____>`, `<__/__/____>`, `<123____>` |
| otherwise | Text input | `<Jane Doe____>` |

The space before dropdown or expander chevrons is required. Use `<Country v>`, not `<v Country>`; use `[FAQ ^]`, not `[FAQ^]`.

## Layout Choices

Choose the main structure before writing widgets:

- Boxless UI for simple forms or compact examples.
- Closed box for exact containment.
- Open-right box for sketchy, left-anchored sections.
- `v` list container for repeated vertical items.
- `>` list container for repeated horizontal items.
- `w` list container for wrapped repeated items.
- Table for structured rows and columns.
- Typed container such as `+--@Modal--- Confirm --+` for semantic behavior.

Do not use `*---` card corners for new examples.

## Authoring Procedure

1. Decide whether the output should be a `.markui` file, Markdown fenced block, or named component.
2. Pick the major layout structure.
3. Lay out visible UI only.
4. Add widgets using the priority rules above.
5. Use annotations only for visible help, tooltip, warning, info, error, or success messages.
6. Use component references for repeated dense blocks.
7. Validate with the host project's MarkUI tools when available.

## Validation Procedure

Validate generated or edited MarkUI before finalizing whenever a validator is available:

1. If an MCP tool named `validate_markui` or `validate_markdown_markui_blocks` is available, use it first.
2. Otherwise, if a `markui` CLI is available, use `markui validate --stdin --format json` for raw MarkUI or add `--markdown` for markdown fences.
3. In this repository, build the CLI first if needed with `pnpm --filter @jonkeda/markui-cli build`, then run `node packages/markui-cli/dist/index.js validate --stdin --format json`.
4. If no validator is available, use the manual QA checks below.

Treat JSON diagnostics as the source of truth. Fix reported `error` diagnostics before finalizing; mention any remaining warnings if they are intentional or blocked.

## Common Patterns

```markui
+--- Device Settings --------------------------------------+
|                                                          |
|  ## Device Settings                                      |
|                                                          |
|  Device name:                                            |
|  <Conference Room Display_______>                        |
|                                                          |
|  Network:                                                |
|  <Office Wi-Fi v>                                        |
|                                                          |
|  Brightness: [=======...] 70%                            |
|  Auto-update  {[on]/off}                                 |
|                                                          |
|  [Advanced ^]                                            |
|  Update window: <02:00 v>                                |
|                                                          |
|  [Save Changes]  [Cancel]                                |
|                                                          |
+----------------------------------------------------------+
```

```markui:user-card
+--- User ----------+
| !==IMG==!         |
| <Jane Doe______>  |
| (Admin)           |
+-------------------+
```

```markui
+--- Team Members ----------------------+
|                                       |
|  @user-card                           |
|                                       |
|  @user-card                           |
|                                       |
+---------------------------------------+
```

## Manual QA

When no parser or preview is available:

- Check that every closed box has matching top and bottom border width.
- Check that open-right boxes omit trailing right corners and right borders.
- Check that tables include a dash separator row.
- Check that expanded dropdowns close visible option lists with `->`.
- Check that accordion bodies use plain content under the open header.
- Check that examples contain only visible UI text.
