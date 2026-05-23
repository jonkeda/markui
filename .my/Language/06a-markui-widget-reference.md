# MarkUI Widget Reference

**Date:** 2026-05-23
**Status:** v4.0 (incorporates doc 09d, 11, 12 decisions)
**Purpose:** Complete widget catalog for the MarkUI language.

---

## 1. Core Rules

1. **No modifiers** — no disabled, read-only, required, error, or stretch markers
2. **Text inside inputs is example data**, never placeholder hints — placeholders and validation are documented outside the wireframe
3. **Prefer ASCII, allow unicode** — ASCII box drawing (`+-|`), icons (`#N`), checkboxes (`[x]`) are preferred. Unicode equivalents (┌─┐│└┘, emoji, ✓, ●) are valid. ASCII was chosen for human keyboard entry; since LLMs are primary authors, we don't fight model knowledge
4. **Widgets on same line = horizontal** layout; separate lines = **vertical**
5. **Glyph width is rendered width** — no pixel values; fill behavior is a runtime concern
6. **Only UI elements are visible** — never render prompt instructions, requirements, conditions, or business rules as text in the wireframe. Apply them silently

---

## 2. File Format

- `.markui` files contain **one screen**, no prose text
- UTF-8, monospaced
- Multiple screens, flows, or explanatory text → use `.md` files with ` ```markui ` fenced code blocks
- Named blocks in `.md` files: ` ```markui:component-name ` makes the block referenceable as `@component-name`
- Icon meanings (`#N`) are defined in the surrounding `.md` context

---

## 3. Bracket Conventions

| Bracket    | Purpose                                                   | Examples                             |
| ---------- | --------------------------------------------------------- | ------------------------------------ |
| `[ ]`    | Buttons, checkboxes, sliders, steppers, ratings, spinners | `[Submit]` `[x]` `[=====.....]`   |
| `[[ ]]`  | Active / emphasized                                       | `[[Tab]]` `[[3]]`                  |
| `< >`    | Text inputs, dropdowns                                    | `<____>` `<Select v>`              |
| `{ / }`  | Toggles                                                   | `{[on]/off}` `{on/[off]}`          |
| `{n}`    | Badges                                                    | `{3}` `{!}`                        |
| `( )`    | Radio buttons, tags/chips                                 | `(*) ( )` / `(tag)` `(tag x)`     |
| `#N`     | Icons (numbered)                                          | `#1` `#2`                          |
| `!`      | Image placeholder                                         | `!==IMG==!`                         |

### `[ ]` Content Rules

Content inside `[]` determines the widget type. Checked in priority order:

| Content                        | Widget          | Example          |
| ------------------------------ | --------------- | ---------------- |
| single space                   | Checkbox off    | `[ ]`            |
| single `x`                    | Checkbox on     | `[x]`            |
| single `-`                    | Checkbox mixed  | `[-]`            |
| single `/` or `\`             | Spinner         | `[/]`            |
| `...`                          | List truncation | `[...]`          |
| `- N +` pattern                | Stepper         | `[- 42 +]`       |
| only `=` and `.`              | Slider/progress | `[====....]`     |
| only `*` and `.` (3+ chars)   | Rating          | `[***..] 3/5`    |
| `[[content]]`                  | Active tab/page | `[[Tab]]`        |
| ends with ` v` or ` ^`        | Accordion       | `[Section v]`    |
| everything else                | Button          | `[Submit]`       |

### `< >` Content Rules

The first and last characters determine input type:

| Pattern                        | Widget          | Example              |
| ------------------------------ | --------------- | -------------------- |
| first char `@`                | Custom input    | `<@datepicker>`      |
| ends with ` v>`              | Dropdown closed | `<Select v>`         |
| ends with ` ^>`              | Dropdown open   | `<Select ^>`         |
| underscores                    | Text input      | `<____>`             |
| other                          | Text with value | `<hello>`            |

A space before `v`/`^` is required to distinguish from values like `<New v2>`.

---

## 4. Annotations

Annotations bind to the nearest widget above them. A blank line breaks the binding.

These 6 prefixes are the **only** annotations. Any other `(text)` is a tag/chip widget.

| Prefix | Meaning                         |
| ------ | ------------------------------- |
| `(?)`  | Help text (visible below field) |
| `($)`  | Tooltip (shown on hover)        |
| `(!)`  | Warning (caution)               |
| `(i)`  | Info message                    |
| `(x)`  | Error (something wrong)         |
| `(v)`  | Success                         |

```
Password: <________>
(?) Must be at least 8 characters.

[Submit]
($) Click to submit the form.

(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

---

## 5. Widgets

### Button

```
[Click Me]
[Primary]
[Cancel]
```

### Icon Button

```
[#1 Search]
[#2 Settings]
```

### Split Button

```
[Save][v]
```

Two brackets touching: action + dropdown trigger.

### Label

```
Plain text label
```

Plain text on a line = label.

### Heading

```
# Large Heading
## Medium Heading
### Small Heading
```

### Link

```
_Click here for more_
_https://example.com_
```

Underscores wrapping text = link. Distinct from input underscores `<___>` which are inside angle brackets.

### Icon

```
#1 Settings     #2 Profile     #3 Home
```

`#` + digit. Meaning defined in surrounding `.md` file. Emoji and unicode symbols are valid alternatives for decoration.

### Image Placeholder

```
!=========!
!   IMG   !
!  16:9   !
!=========!
```

Simple form: `!==IMG==!`

### Badge

```
{3}     count
{!}     alert
```

### Separator

```
---
```

3+ dashes on a line by itself.

### Progress Bar

```
[=======...] 70%
```

Only `=` (filled) and `.` (empty) inside `[]`.

### Tag / Chip

```
(Technology) (Design) (React)
```

### Removable Chip

```
(React) (Vue x) (Angular x)
```

Trailing ` x` before `)` = removable.

### Spinner

```
[/] Loading...
```

Single char (`/` or `\`) inside `[]`.

---

## 6. Form Widgets

### Text Input

```
<____________>
<hello_______>
```

Underscores = editable area. Text inside inputs is always **example data** (filled-in values), never placeholder hints. Placeholders and validation rules are documented outside the wireframe.

### Password Input

```
<****________>
```

### Date Input

```
<__/__/____>
```

### Number Input

```
<123______>
```

### Stepper

```
[- 42 +]
```

### Textarea

```
<                        >
<                        >
<                        >
```

Consecutive `< >` lines of identical width = single textarea.

### Checkbox

```
[ ] Unchecked
[x] Checked
[-] Indeterminate
```

### Radio Button

```
(*) Selected
( ) Unselected
```

Consecutive radio buttons form a group.

### Toggle / Switch

```
{[on]/off}       on
{on/[off]}       off
```

`[ ]` inside marks the active state. `/` separates states.

### Slider

```
[=====.....] 50%
[==========] 100%
[..........] 0%
```

Only `=` and `.` inside `[]`.

### Rating

```
[***..] 3/5
[*****] 5/5
[.....] 0/5
```

Only `*` and `.` inside `[]`, 3+ chars.

### Dropdown

```
<Select item v>      collapsed
<Select item ^>      expanded
```

Trailing ` v` = collapsed, trailing ` ^` = expanded. A space before the chevron is required to distinguish from values like `<New v2>`.

Expanded with options:

```
<Fruit ^>
  Apple
  Banana
  Orange
->
```

`->` end marker closes the dropdown.

### Multi-Select Dropdown

```
<Tags: 3 selected v>
  [ ] Option A
  [x] Option B
  [x] Option C
  [x] Option D
  [ ] Option E
->
```

### Custom Input

```
<@datepicker>
<@colorpicker>
<@autocomplete>
<@richtext>
```

`<@name>` — an input-type widget defined by a component. Use when native input syntax (`<____>`, `<__/__/____>`) is insufficient.

If the first character after `<` is `@`, the entire content up to `>` is a component name.

### File Drop Zone

```
+- - - - - - - - - - - - - -+
|                            |
|   #1                       |
|   Drag files here          |
|   or [Browse]              |
|                            |
+- - - - - - - - - - - - - -+
```

Dashed border (`- - -`) = drop zone.

### Form Field Convention

Label + input + annotation on consecutive lines = form field:

```
Full Name:
<________________________>
(?) First and last name.

Email:
<________________________>
(x) Please enter a valid email.
```

Blank line separates field groups.

---

## 7. Containers and Layout

### Box

```
+------------------------------+
| content                      |
+------------------------------+
```

ASCII preferred. Unicode box drawing (`┌─┐│└┘`) is also valid.

### Box Characters

| Char | Role                                        |
| ---- | ------------------------------------------- |
| `+`  | All corners and junctions                   |
| `-`  | Horizontal border                           |
| `\|` | Vertical border / column divider            |
| `.`  | Resizable splitter (replaces `-` or `\|`)   |
| `#`  | Scroll indicator (replaces `-` or `\|`)     |
| `*`  | Card/item corner (repeatable element)       |

Only these characters (and their unicode equivalents) on borders. Do not use `=`, `~`, or other decorative characters.

### Titled Box

```
+--- Card Title -------------------+
| content                          |
+----------------------------------+
```

### Open-Right Shorthand

The right `|` is optional. A box can be defined by its left edge only:

```
+--- Login ---+
|
|  Username:
|  <____________>
|
|  [Login]
|
+--+
```

- Top `+---+` starts the box (width is a hint, not enforced)
- Left `|` defines box membership
- Bottom `+--+` closes the box (can be collapsed)
- Full-form with right `|` is always valid

### Nested Box Prefix

`++` for level 2, `+++` for level 3. No closing border or `|` needed:

```
+--- Settings ---+
|
++--- Profile ---+

  Name:
  <John Doe____________>

++--- Preferences ---+

  Dark mode  {[on]/off}

+--+
```

- `+---` = level 1, `++---` = level 2, `+++---` = level 3
- Content is indented, no `|` prefix needed
- Next header at same/lesser depth ends the section
- Parent's `+--+` ends all open nested boxes

All three forms (full, open-right, prefix-nested) can be mixed freely.

### Boxless UI

A `.markui` file does not require a box:

```
Username:
<________________________>

Password:
<________________________>

[Login]
```

### Vertical Layout

Widgets on separate lines = vertical flow (default).

### Horizontal Layout

Multiple widgets on the same line = horizontal. Spacing is the gap.

```
[Save]  [Cancel]  [Delete]
```

### Grid Layout

```
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
```

### Scroll Region

`#` replaces `|` or `-` on a border to indicate scrollable content:

```
+--- List ---------------------+
| Item 1                       #
| Item 2                       #
| Item 3                       #
+------------------------------+
```

Horizontal scroll: `#` on bottom. Bidirectional: `#` on right + bottom.

### Resizable Splitters

`.` replaces `|` or `-` on a divider to indicate draggable/resizable:

```
+---------+---------------------+
| Sidebar . Main Content        |
| [Nav1]  . Some text           |
+---------+---------------------+
```

Horizontal splitter: `.` on horizontal divider.

### Splitter + Scroll Combined

`.` at junction points = resizable. `#` on divider body = scrollable:

```
+---------.------------------------------+
| Sidebar # Main Content                 #
| [Nav1]  # Item 1                       #
| [Nav2]  # Item 2                       #
+---------.##############################+
```

### Dock Layout

```
+------------------------------+
| Header                       |
+--------+---------------------+
| Side   | Main Content        |
| bar    |                     |
+--------+---------------------+
| Footer                       |
+------------------------------+
```

### Sizing

Glyph width is the rendered width. No pixel values. Fill behavior is a runtime concern.

### List Truncation

```
[...]
```

Indicates a list continues beyond what's drawn.

---

## 8. Navigation

### Tab Bar

```
+--[[Overview]]--[Details]--[Settings]--+
| Tab content here                      |
+---------------------------------------+
```

`[[Tab]]` = active. `[Tab]` = inactive.

### Context Menu

```
                   +--------------+
                   | Cut        ^X|
                   | Copy       ^C|
                   | Paste      ^V|
                   | ------------ |
                   | Select All ^A|
                   +--------------+
```

Indent from left edge signals "floating."

### Breadcrumb

```
Home > Products > Electronics > Laptops
```

`>` separator.

### Pagination

```
[<] 1 2 [[3]] 4 5 ... 10 [>]
```

`[[3]]` = active page, consistent with `[[Tab]]` for active tabs.

### Accordion

Multiple collapsible sections grouped together, separated by blank lines:

```
[Section 1 ^]
|  Content for section 1
|  More content here
+--+

[Section 2 v]

[Section 3 v]
```

`[Header ^]` = expanded (content below in open-right box). `[Header v]` = collapsed (button only).

`v` = closed, `^` = open — consistent with dropdown `<... v>` / `<... ^>`.

### Expander

A single collapsible section, not grouped with siblings:

```
[Advanced Settings ^]
|  Timeout: [- 30 +]
|  Retries: [- 3 +]
+--+
```

Same syntax as accordion — `[... ^]` / `[... v]` — but used standalone.

### Tree View

```
- Documents
  - Work
    - Project A
    - Project B
  + Personal
+ Downloads
```

`+` = collapsed. `-` = expanded/leaf.

---

## 9. Data Display

### Table

```
| Name       | Age | Role      |
|------------|-----|-----------|
| Alice      |  30 | Engineer  |
| Bob        |  25 | Designer  |
```

### Table (Sortable)

```
| Name  v    | Age ^ | Role      |
|------------|-------|-----------|
```

`v` descending, `^` ascending.

### Table (With Selection)

```
| [x] | Name    | Status  |
|-----|---------|---------|
| [ ] | Alice   | Active  |
| [x] | Bob     | Pending |
```

### Toast / Notification

```
+-- (!) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (i) ----------------------------+
| New message received              |
+-----------------------------------+
```

Markers: `(!)` warning, `(i)` info, `(x)` error, `(v)` success.

### Inline Alert

```
(i) This is an informational message.
(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

---

## 10. Patterns

### Card List (Vertical)

`*` corners distinguish repeatable cards from structural boxes:

```
*--- Product -----------------------*
| Widget A              $19.99      |
| In stock: 42                      |
*-----------------------------------*
*--- Product -----------------------*
| Widget B              $29.99      |
| In stock: 7                       |
*-----------------------------------*
[...]
```

### Card List (Horizontal)

```
*--- Product ---* *--- Product ---* [...]
| Widget A      | | Widget B      |
| $19.99        | | $29.99        |
*---------------* *---------------*
```

### Empty State

```
+------------------------------+
|                              |
|        No items found        |
|        [Add Item]            |
|                              |
+------------------------------+
```

---

## 11. Custom Components

### Component Reference

```
@user-card
@nav-item
@product-tile
```

`@name` at line-start references another `.markui` file or a named ` ```markui:name ` block. The referenced content is inlined at that position.

### Custom Input

```
<@datepicker>
<@colorpicker>
<@autocomplete>
<@richtext>
```

`<@name>` — an input-type widget defined by a component. Use when native input syntax (`<____>`, `<__/__/____>`) is insufficient.

If the first character after `<` is `@`, the entire content up to `>` is a component name.

### Typed Container

```
+--@Modal--- Confirm Deletion ----------+
|                                        |
|  This action cannot be undone.         |
|                                        |
|  [Delete]  [Cancel]                    |
|                                        |
+----------------------------------------+
```

`+--@Name--+` — the `@Name` is a **type** (Modal, Drawer, Popover, Sheet), not a visible title. The renderer uses it for behavior (overlay, animation, positioning).

A typed container can have a visible title after the type: `+--@Modal--- Confirm ---+`.

### Typed Card

```
*--@ProductCard--*  *--@ProductCard--*  [...]
| Widget A        |  | Widget B        |
| $19.99          |  | $29.99          |
*-----------------*  *-----------------*
```

`*--@Name--*` — a repeatable card with a component type for codegen.

### Slot Marker

Slots mark where caller-provided content goes inside a component definition:

- `{@slot}` — default/primary content slot (one per component)
- `{@slot:name}` — named slot for a specific region

Example component definition:

```
// file: modal.markui

+--- {@slot:title} ----------------------+
|                                         |
|  {@slot}                                |
|                                         |
|  [OK]  [Cancel]                         |
|                                         |
+-----------------------------------------+
```

When used as `+--@Modal--- Delete Item ---+`, the title fills `{@slot:title}` and the body content fills `{@slot}`. Unfilled slots render empty; surrounding chrome stays.

### Named Blocks in `.md` Files

Group related components in a single `.md` file using named fenced blocks:

````
```markui:user-card
*-----------------------*
| !==IMG==!  User Name  |
|            Role       |
*-----------------------*
```

```markui:product-tile
*-----------------------*
| !==IMG==!             |
| Product Name          |
| $00.00                |
*-----------------------*
```
````

Each block is referenceable as `@user-card`, `@product-tile` from other files.
