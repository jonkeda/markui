# MarkUI Widget Reference: Dropdowns and Custom Inputs

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Closed Dropdown

A closed dropdown shows the selected value or prompt and a collapsed chevron.

Syntax:

- `<Label v>`

Example:

```text
Country:
<Germany v>
```

```markui
Country:
<Germany v>
```

Notes:

- Do not show option rows below a closed dropdown.
- The space before `v` is required.

---

## Open Dropdown

An open dropdown shows expanded state. It can be shown with or without visible options.

Syntax:

- `<Label ^>`
- Option rows followed by `->` when options are visible.

Open without option rows:

```text
Country:
<Germany ^>
```

```markui
Country:
<Germany ^>
```

Open with options:

```text
Fruit:
<Apple ^>
  Apple
  Banana
  Orange
->
```

```markui
Fruit:
<Apple ^>
  Apple
  Banana
  Orange
->
```

Notes:

- Use `->` to close visible option lists.
- The space before `^` is required.

---

## Multi-Select Dropdown

A multi-select dropdown uses checkbox option rows when the option list is visible.

Closed summary:

```text
Tags:
<3 selected v>
```

```markui
Tags:
<3 selected v>
```

Open with options:

```text
Tags:
<3 selected ^>
  [x] React
  [ ] Vue
  [x] TypeScript
->
```

```markui
Tags:
<3 selected ^>
  [x] React
  [ ] Vue
  [x] TypeScript
->
```

Notes:

- Visible options require open state `^`.
- Do not write `<3 selected v>` followed by option rows.

---

## Custom Input

A custom input names a component-defined input control when native input syntax is insufficient.

Syntax:

- `<@name>`

Examples:

```text
Date:   <@datepicker>
Color:  <@colorpicker>
Search: <@autocomplete>
```

```markui
Date:   <@datepicker>
Color:  <@colorpicker>
Search: <@autocomplete>
```

Notes:

- Use custom inputs sparingly.
- Prefer native inputs when their syntax is clear enough.

