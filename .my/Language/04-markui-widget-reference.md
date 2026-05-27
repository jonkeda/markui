# MarkUI Widget Reference

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Purpose:** Canonical entry point for MarkUI widget syntax. Detailed widget entries live in the `04a-*` through `04i-*` chapter docs.

This document supersedes the reference role of `06-markui-widget-reference.md` and the component catalog role of `09-markui-component-library.md` after review. Full application examples live in `05-markui-full-examples.md`. Design rationale lives in `03-markui-widget-design-principles.md`.

---

## 1. Core Rules

1. `.markui` files contain one screen and no prose.
2. Markdown files can contain many `markui` fenced blocks.
3. Named Markdown fences such as ` ```markui:@user-card ` define reusable components.
4. Visible wireframes contain UI only, not requirements or implementation notes.
5. Text inside inputs is example data, not placeholder copy.
6. Widgets on the same line imply horizontal layout. Separate lines imply vertical layout.
7. Prefer ASCII for generated examples. Unicode input is valid when documented by a chapter.
8. Glyph width is rendered width. Do not use pixel values.
9. Icon meanings for numbered icons such as `#1` are defined outside the wireframe.
10. No modifiers: do not encode disabled, required, read-only, error, or stretch state as widget modifiers.

---

## 2. Chapter Index

| Chapter | Contents |
| --- | --- |
| [04a-buttons-actions.md](04a-buttons-actions.md) | Buttons, icon buttons, split buttons, previous/next buttons |
| [04b-checkboxes-radios.md](04b-checkboxes-radios.md) | Checkboxes, radio buttons, radio groups |
| [04c-inputs-forms.md](04c-inputs-forms.md) | Text inputs, password/date/number inputs, textareas, form fields |
| [04d-dropdowns-custom-inputs.md](04d-dropdowns-custom-inputs.md) | Closed/open dropdowns, multi-select dropdowns, custom inputs |
| [04e-display-text-icons.md](04e-display-text-icons.md) | Headings, labels, links, icons, badges, toggles, sliders, progress, steppers, ratings, spinners, chips |
| [04f-containers-layout.md](04f-containers-layout.md) | Boxes, list containers, nesting, layout, scroll, splitters, dock layout |
| [04g-navigation.md](04g-navigation.md) | Tabs, breadcrumbs, pagination, expanders, accordions, tree views, context menus |
| [04h-tables-data.md](04h-tables-data.md) | Tables, sortable tables, selectable tables |
| [04i-components-alerts-images.md](04i-components-alerts-images.md) | Typed containers, toasts, alerts, annotations, images, components, slots |

---

## 3. Bracket Families

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

---

## 4. Square-Bracket Priority

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

---

## 5. Angle-Bracket Priority

Content inside `< >` is interpreted in this order:

| Pattern | Widget | Example |
| --- | --- | --- |
| starts with `@` | Custom input | `<@datepicker>` |
| ends with space plus `v` | Closed dropdown | `<Country v>` |
| ends with space plus `^` | Open dropdown | `<Country ^>` |
| password/date/number shape | Specialized input convention | `<****____>`, `<__/__/____>`, `<123____>` |
| otherwise | Text input | `<Jane Doe____>` |

The space before `v` or `^` is required. `<New v2>` is a text input value, not a dropdown.

---

## 6. Reference Coverage

Before removing Doc 06 and Doc 09, verify:

- Every Doc 09 category appears in the Doc 04 chapter set.
- Every Doc 06 widget-reference entry appears in the Doc 04 chapter set.
- Every widget or component has a description.
- Every widget or component has paired `text` and `markui` examples.
- Dropdowns show closed and open usage.
- Dropdowns show open usage with and without visible options.
- List containers show vertical, horizontal, and wrapped usage.
- Expander and accordion are separate reference entries.
- Full app examples are in Doc 05, not Doc 04.
- Unicode examples appear where supported authoring benefits from them.
