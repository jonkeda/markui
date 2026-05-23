---
name: markui
description: 'Generate MarkUI ASCII wireframes. Use when creating UI mockups, screen layouts, wireframes, or prototypes in .markui files or markui fenced code blocks. Use when asked to draw, sketch, mock up, or wireframe a UI.'
argument-hint: 'Describe the screen or UI component to wireframe'
---

# MarkUI Wireframe Generation

Generate UI wireframes using the MarkUI language.

## When to Use

- Creating UI mockups or screen wireframes
- Prototyping layouts in ASCII
- Generating `.markui` files or ` ```markui ` fenced code blocks
- Drawing, sketching, or mocking up a UI component or screen

## File Format

- `.markui` files: **one screen**, no prose, monospaced
- `.md` files: use ` ```markui ` fenced blocks for multiple screens or explanatory text
- Named blocks: ` ```markui:component-name ` makes blocks referenceable as `@component-name`
- Icon meanings (`#N`) are defined in surrounding `.md` context, not inside wireframes

## Core Rules

1. **No modifiers** — no disabled, required, error, read-only, or stretch markers
2. **Text inside inputs is example data**, never placeholder hints
3. **Prefer ASCII, allow unicode** — ASCII (`+-|`, `[x]`, `#N`) preferred. Unicode (┌─┐│└┘, emoji, ✓, ●) is valid
4. Widgets on same line = **horizontal** layout; separate lines = **vertical**
5. Glyph width is rendered width — no pixel values
6. **Only UI elements are visible** — never render prompt instructions, requirements, conditions, or business rules as text in the wireframe. Apply them silently

## Bracket System

| Bracket  | Purpose                                     | Examples                           |
|----------|---------------------------------------------|------------------------------------|
| `[ ]`    | Buttons, checkboxes, sliders, steppers, etc | `[Submit]` `[x]` `[=====.....]`   |
| `[[ ]]`  | Active / emphasized                         | `[[Tab]]` `[[3]]`                  |
| `< >`    | Text inputs, dropdowns                      | `<____>` `<Select v>`             |
| `{ / }`  | Toggles                                     | `{[on]/off}` `{on/[off]}`         |
| `{n}`    | Badges                                      | `{3}` `{!}`                        |
| `( )`    | Radio buttons, tags/chips                   | `(*) ( )` / `(tag)` `(tag x)`     |
| `#N`     | Icons (numbered)                            | `#1` `#2`                          |
| `!`      | Image placeholder                           | `!==IMG==!`                        |

## `[ ]` Content Rules

Content inside `[]` determines the widget type. Checked in priority order:

| Content                | Widget          | Example          |
|------------------------|-----------------|------------------|
| single space           | Checkbox off    | `[ ]`            |
| single `x`            | Checkbox on     | `[x]`            |
| single `-`            | Checkbox mixed  | `[-]`            |
| single `/` or `\`     | Spinner         | `[/]`            |
| `...`                  | List truncation | `[...]`          |
| `- N +` pattern        | Stepper         | `[- 42 +]`       |
| only `=` and `.`       | Slider/progress | `[====....]`     |
| only `*` and `.` 3+   | Rating          | `[***..] 3/5`    |
| `[[content]]`          | Active tab/page | `[[Tab]]`        |
| ends with ` v` or ` ^`| Accordion       | `[Section v]`    |
| two `[]` touching      | Split button    | `[Save][v]`      |
| everything else        | Button          | `[Submit]`       |

## Widgets

### Inputs

```
<____________>           text input (underscores = editable area)
<hello_______>           text input with example data
<****________>           password input
<__/__/____>             date input
<123______>              number input
```

Consecutive `< >` lines of identical width = textarea.

### Dropdown

Trailing ` v` = collapsed, trailing ` ^` = expanded. A space before the chevron is required to distinguish from values like `<New v2>`.

```
<Select item v>          collapsed
<Select item ^>          expanded
```

Expanded with options, `->` closes:

```
<Fruit ^>
  Apple
  Banana
  Orange
->
```

Multi-select dropdown uses checkboxes inside:

```
<Tags: 3 selected v>
  [ ] Option A
  [x] Option B
  [x] Option C
->
```

### Custom Input

```
<@datepicker>
<@colorpicker>
```

`<@name>` — component-defined input when native syntax is insufficient. First char `@` after `<` = custom input.

### Toggle

```
{[on]/off}       on state
{on/[off]}       off state
```

### Radio

```
(*) Selected
( ) Unselected
```

Consecutive radios form a group.

### Data Display

```
[=======...] 70%         slider / progress bar
[***..] 3/5              rating
{3}                      badge count
{!}                      badge alert
(Technology) (React x)   tag / removable chip
#1  #2  #3               icons (digit only — #name is invalid)
!==IMG==!                 image placeholder
---                       separator (3+ dashes, line by itself)
_Click here_             link (underscore-wrapped)
[/] Loading...           spinner
[- 42 +]                 stepper
[Save][v]                split button (adjacent brackets)
[#1 Search]              icon button
```

Plain text on a line = label.

### Annotations

Bind to the nearest widget above. Blank line breaks binding.

```
Password: <________>
(?) Must be at least 8 characters.
($) Tooltip shown on hover.
(!) Warning message.
(i) Info message.
(x) Error message.
(v) Success message.
```

These 6 prefixes — `(?)` `($)` `(!)` `(i)` `(x)` `(v)` — are the **only** annotations. Any other `(text)` is a tag/chip widget. Do not use `()` for comments, descriptions, or labels.

### Headings

```
# Large Heading
## Medium Heading
### Small Heading
```

## Containers

### Box

```
+--- Title ---+
| content     |
+-------------+
```

- `+` corners, `-` horizontal, `|` vertical — structural containers
- `*` corners = repeatable list item (card). Never use `*` for one-off containers
- `.` on border = resizable splitter
- `#` on border = scroll indicator
- `- - -` dashed border = drop zone

Only these characters (and their unicode equivalents) on borders. Do not use `=`, `~`, or other decorative characters.

### Open-Right (no right border)

```
+--- Title ---+
|
|  content
|
+--+
```

### Nested Prefix

`++` level 2, `+++` level 3 — no `|` or closing border needed:

```
+--- Settings ---+
|
++--- Profile ---+

  Name: <John Doe____________>

++--- Preferences ---+

  Dark mode  {[on]/off}

+--+
```

### Grid Layout

```
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
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

### Scroll + Splitter

`#` on border = scrollable. `.` on border = resizable. Combined:

```
+---------.------------------------------+
| Sidebar # Main Content                 #
| [Nav1]  # Item 1                       #
| [Nav2]  # Item 2                       #
+---------.##############################+
```

`.` at junction = resizable. `#` on body = scrollable.

## Navigation

```
+--[[Active]]--[Tab2]--[Tab3]--+        tab bar
Home > Products > Laptops               breadcrumb
[<] 1 2 [[3]] 4 5 ... 10 [>]           pagination
```

`[[Tab]]` / `[[3]]` = active (tabs, pagination).

### Accordion

```
[Section 1 ^]
|  Content for section 1
|  More content here
+--+

[Section 2 v]

[Section 3 v]
```

`[Header ^]` = expanded (open-right body). `[Header v]` = collapsed. Blank lines separate sections.

### Expander

A single collapsible section (not grouped with siblings):

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
  + Personal
+ Downloads
```

`-` = expanded/leaf, `+` = collapsed. Indent = depth.

### Context Menu

```
              +--------------+
              | Cut        ^X|
              | Copy       ^C|
              | ------------ |
              | Select All ^A|
              +--------------+
```

Indent from left edge = floating.

## Tables

```
| Name  | Age | Role     |
|-------|-----|----------|
| Alice |  30 | Engineer |
| Bob   |  25 | Designer |
```

Sortable columns: `v` descending, `^` ascending in header cell.
Selection column: `[x]`/`[ ]` as first cell.

## Cards

Use `*` corners for repeatable elements:

```
*--- Product ---*  *--- Product ---*  [...]
| Widget A      |  | Widget B      |
| $19.99        |  | $29.99        |
*---------------*  *---------------*
```

## Custom Components

```
@component-name              reference (inlines the component)
<@datepicker>                custom input
+--@Modal--- Title ---+      typed container (Modal, Drawer, etc.)
*--@ProductCard--*           typed card for codegen
{@slot}                      default slot in component definition
{@slot:header}               named slot
```

## Toast / Notification

```
+-- (!) ----------------------------+
| File saved successfully           |
+-----------------------------------+
```

Markers: `(!)` warning, `(i)` info, `(x)` error, `(v)` success.

## Procedure

1. Identify the screen or component to wireframe
2. Choose the container: full-page box, boxless, or component
3. Lay out the structure: header, content areas, footer
4. Place widgets using the bracket conventions
5. Add annotations for help text, tooltips, or validation messages
6. If in a `.md` file, wrap in ` ```markui ` fenced block with optional name
7. Define icon meanings in the `.md` context above the block

## Example: Login Screen

```markui
+--- Login ----------------------------+
|                                      |
|  Username:                           |
|  <________________________>          |
|                                      |
|  Password:                           |
|  <________________________>          |
|                                      |
|  [x] Remember me                    |
|                                      |
|  [Login]                             |
|                                      |
|  _Forgot password?_  _Sign up_      |
|                                      |
+--------------------------------------+
```

## Example: Settings Page

```markui
+--- Settings ---------------------------------------------------------+
|                                                                       |
|  [[General]]  [Notifications]  [Privacy]                              |
|  ---                                                                  |
|                                                                       |
|  +------------------+                                                 |
|  |   !==IMG==!      |   Display Name:                                 |
|  |                  |   <Jane Smith_____________>                      |
|  +------------------+                                                 |
|                          Email:                                       |
|                          <jane@example.com______>                      |
|                                                                       |
|  ---                                                                  |
|                                                                       |
|  Dark mode       {[on]/off}                                           |
|  Notifications   {on/[off]}                                           |
|                                                                       |
|  Language:                                                            |
|  <English v>                                                          |
|                                                                       |
|  [Save Changes]  [Cancel]                                             |
|                                                                       |
+-----------------------------------------------------------------------+
```
