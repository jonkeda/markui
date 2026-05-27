# MarkUI Widget Reference: Tables and Data

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Basic Table

A table uses pipe-delimited cells and a dash separator row.

Example:

```text
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
```

```markui
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
```

Notes:

- Use tables for structured rows and columns.
- Use boxes for layout regions, not table data.

---

## Sortable Table

Header suffix `v` means descending sort. Header suffix `^` means ascending sort.

Example:

```text
| Name  v    | Age ^ | Role      |
|------------|-------|-----------|
| Alice      |  30   | Engineer  |
| Bob        |  25   | Designer  |
```

```markui
| Name  v    | Age ^ | Role      |
|------------|-------|-----------|
| Alice      |  30   | Engineer  |
| Bob        |  25   | Designer  |
```

---

## Selectable Table

A selection column uses checkboxes.

Example:

```text
| [x] | Name    | Status  | Actions |
|-----|---------|---------|---------|
| [ ] | Alice   | Active  | [Edit]  |
| [x] | Bob     | Pending | [Edit]  |
```

```markui
| [x] | Name    | Status  | Actions |
|-----|---------|---------|---------|
| [ ] | Alice   | Active  | [Edit]  |
| [x] | Bob     | Pending | [Edit]  |
```

