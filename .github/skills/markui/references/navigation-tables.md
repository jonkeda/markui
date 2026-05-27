# MarkUI Navigation And Tables

Use this reference for navigation patterns and structured data.

## Tabs, Breadcrumbs, Pagination

```markui
+--[[Overview]]--[Details]--[Settings]--+
| Overview tab content                   |
+----------------------------------------+
```

```markui
Home > Products > Electronics > Laptops
```

```markui
Showing 21-30 of 120 results

[<] 1  2  [[3]]  4  5  ...  12 [>]
```

- `[[Tab]]` marks an active tab.
- `[[3]]` marks an active page.
- `[<]` and `[>]` are previous/next buttons.

## Expander And Accordion

An expander is one standalone collapsible section:

```markui
[Advanced Settings ^]
Timeout: [- 30 +]
Retries: [- 3 +]
```

```markui
[Advanced Settings v]
```

An accordion is a group of expander sections:

```markui
[FAQ ^]
You can return items within 30 days.

[Shipping v]

[Warranty v]
```

- `[Header ^]` is expanded.
- `[Header v]` is collapsed.
- Use plain body content under an open header.
- Do not draw legacy visible guide lines for new examples.
- Separate accordion sections with blank lines.

## Tree View And Context Menu

```markui
- Documents
  - Work
    - Project Alpha
    - Project Beta
  + Personal
+ Downloads
```

- `-` means expanded or leaf.
- `+` means collapsed.
- Indent controls tree depth.

Context menus are floating command lists. Indent from the left edge signals floating placement:

```markui
                   +--------------+
                   | Cut        ^X|
                   | Copy       ^C|
                   | Paste      ^V|
                   | ------------ |
                   | Select All ^A|
                   +--------------+
```

## Tables

Basic table:

```markui
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
```

Sortable table:

```markui
| Name  v    | Age ^ | Role      |
|------------|-------|-----------|
| Alice      |  30   | Engineer  |
| Bob        |  25   | Designer  |
```

Selectable table:

```markui
| [x] | Name    | Status  | Actions |
|-----|---------|---------|---------|
| [ ] | Alice   | Active  | [Edit]  |
| [x] | Bob     | Pending | [Edit]  |
```

- Use tables for structured rows and columns.
- Use boxes for layout regions, not table data.
- Header suffix `v` means descending sort.
- Header suffix `^` means ascending sort.
- A selection column uses checkboxes.
