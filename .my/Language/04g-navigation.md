# MarkUI Widget Reference: Navigation

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Tab Bar

A tab bar shows sibling views. `[[Tab]]` marks the active tab.

Example:

```text
+--[[Overview]]--[Details]--[Settings]--+
| Overview tab content                   |
+----------------------------------------+
```

```markui
+--[[Overview]]--[Details]--[Settings]--+
| Overview tab content                   |
+----------------------------------------+
```

---

## Breadcrumb

A breadcrumb shows a location path using ` > ` separators.

Example:

```text
Home > Products > Electronics > Laptops
```

```markui
Home > Products > Electronics > Laptops
```

---

## Pagination

Pagination uses previous/next buttons and active page brackets.

Example:

```text
Showing 21-30 of 120 results

[<] 1  2  [[3]]  4  5  ...  12 [>]
```

```markui
Showing 21-30 of 120 results

[<] 1  2  [[3]]  4  5  ...  12 [>]
```

---

## Expander

An expander is one standalone collapsible section.

Syntax:

- `[Header ^]` expanded
- `[Header v]` collapsed

Expanded:

```text
[Advanced Settings ^]
Timeout: [- 30 +]
Retries: [- 3 +]
```

```markui
[Advanced Settings ^]
Timeout: [- 30 +]
Retries: [- 3 +]
```

Collapsed:

```text
[Advanced Settings v]
```

```markui
[Advanced Settings v]
```

Notes:

- Use plain body content under the open header.
- Do not draw legacy visible guide lines for new examples.

---

## Accordion

An accordion is a grouped pattern made from multiple expander sections. Some sections are open and others are closed.

Example:

```text
[FAQ ^]
You can return items within 30 days.

[Shipping v]

[Warranty v]
```

```markui
[FAQ ^]
You can return items within 30 days.

[Shipping v]

[Warranty v]
```

Notes:

- Separate sections with blank lines.
- Use `[Header ^]` for open sections and `[Header v]` for closed sections.

---

## Tree View

A tree view shows hierarchy. `-` means expanded or leaf. `+` means collapsed.

Example:

```text
- Documents
  - Work
    - Project Alpha
    - Project Beta
  + Personal
+ Downloads
```

```markui
- Documents
  - Work
    - Project Alpha
    - Project Beta
  + Personal
+ Downloads
```

---

## Context Menu

A context menu is a floating command list. Indent from the left edge signals floating placement.

Example:

```text
                   +--------------+
                   | Cut        ^X|
                   | Copy       ^C|
                   | Paste      ^V|
                   | ------------ |
                   | Select All ^A|
                   +--------------+
```

```markui
                   +--------------+
                   | Cut        ^X|
                   | Copy       ^C|
                   | Paste      ^V|
                   | ------------ |
                   | Select All ^A|
                   +--------------+
```

