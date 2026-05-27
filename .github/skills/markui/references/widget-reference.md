# MarkUI Widget Reference

Use this reference for canonical MarkUI syntax, parser priorities, and chapter navigation.

## Core Rules

1. `.markui` files contain one screen and no prose.
2. Markdown files can contain many `markui` fenced blocks.
3. Named Markdown fences such as `markui:user-card` define reusable components.
4. Visible wireframes contain UI only, not requirements or implementation notes.
5. Text inside inputs is example data, not placeholder copy.
6. Widgets on the same line imply horizontal layout. Separate lines imply vertical layout.
7. Prefer ASCII for generated examples. Unicode input is valid when documented by a chapter.
8. Glyph width is rendered width. Do not use pixel values.
9. Icon meanings for numbered icons such as `#1` are defined outside the wireframe.
10. No modifiers: do not encode disabled, required, read-only, error, or stretch state as widget modifiers.

## Chapter Map

- `buttons-forms-controls.md`: buttons, checks, radios, inputs, dropdowns, display text, icons, badges, toggles, sliders, progress, steppers, ratings, spinners, chips.
- `containers-layout.md`: boxes, list containers, nesting, layout, scroll, splitters, dock layout.
- `navigation-tables.md`: tabs, breadcrumbs, pagination, expanders, accordions, tree views, context menus, tables.
- `components-alerts-images.md`: typed containers, toasts, alerts, annotations, images, components, slots.
- `validation.md`: repo-specific validation commands and manual checks.

## Bracket Families

| Syntax | Meaning | Examples |
| --- | --- | --- |
| `[ ]` | Buttons, checks, compact controls, progress-like controls | `[Save]`, `[x]`, `[====....]` |
| `[[ ]]` | Active tab or active page | `[[Board]]`, `[[3]]` |
| `< >` | Inputs and dropdowns | `<Jane Doe____>`, `<English v>` |
| `{ / }` | Toggle | `{[on]/off}` |
| `{n}` | Badge | `{3}`, `{!}` |
| `( )` | Radio, chip, annotation prefix | `(*)`, `(React)`, `(?) Help` |
| `#N` | Numbered icon | `#1`, `#2` |
| `!` | Image placeholder | `!==IMG==!` |

## Square-Bracket Priority

Content inside `[]` is interpreted in this order:

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

## Angle-Bracket Priority

Content inside `< >` is interpreted in this order:

| Pattern | Widget | Example |
| --- | --- | --- |
| starts with `@` | Custom input | `<@datepicker>` |
| ends with space plus `v` | Closed dropdown | `<Country v>` |
| ends with space plus `^` | Open dropdown | `<Country ^>` |
| password/date/number shape | Specialized input convention | `<****____>`, `<__/__/____>`, `<123____>` |
| otherwise | Text input | `<Jane Doe____>` |

The space before `v` or `^` is required. `<New v2>` is a text input value, not a dropdown.
