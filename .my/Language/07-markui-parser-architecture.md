# MarkUI Parser Architecture

**Date:** 2026-05-22
**Status:** Design
**Purpose:** How to parse a `.markui` file into a widget tree.

---

## 1. The Problem

MarkUI is a 2D spatial language. Unlike conventional languages where nesting is syntactic (`<div><p>...</p></div>`), MarkUI nesting is visual — a box drawn inside another box is a child. The parser must reason about character positions on a 2D grid, not just a 1D token stream.

This means parsing happens in phases: first resolve the spatial structure, then recognize widgets within it.

---

## 2. Parsing Phases

```
.markui file
    │
    ▼
┌────────────────────┐
│ 1. Load Grid       │  file → char[rows][cols]
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 2. Detect Boxes    │  find box boundaries, build containment tree
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 3. Extract Content │  strip borders, get content lines per box
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 4. Tokenize Lines  │  recognize widget patterns per line
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 5. Multi-Line Merge│  join textareas, dropdowns, accordions
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 6. Layout Resolve  │  determine horizontal/vertical relationships
└────────┬───────────┘
         ▼
┌────────────────────┐
│ 7. Build Tree      │  emit final widget tree
└────────┬───────────┘
         ▼
    Widget Tree (AST)
```

---

## 3. Phase 1: Load Grid

Load the file into a 2D character grid. Each line becomes a row. Pad shorter lines with spaces so all rows have equal width.

```
Input:
  ┌─── Title ──┐
  │ [Button]   │
  └────────────┘

Grid (0-indexed):
  row 0: [ ][┌][─][─][─][ ][T][i][t][l][e][ ][─][─][┐]
  row 1: [ ][│][ ][[][B][u][t][t][o][n][]][ ][ ][ ][│]
  row 2: [ ][└][─][─][─][─][─][─][─][─][─][─][─][─][┘]
```

Every character has a coordinate `(row, col)`. All subsequent phases work on this grid.

---

## 4. Phase 2: Detect Boxes

### 4.1 Corner Detection

Scan the grid for box corner characters:

| Unicode | ASCII | Role         |
|---------|-------|--------------|
| `┌`     | `+`   | Top-left     |
| `┐`     | `+`   | Top-right    |
| `└`     | `+`   | Bottom-left  |
| `┘`     | `+`   | Bottom-right |

For Unicode boxes, corners are unambiguous. For ASCII boxes (`+`), a `+` is a corner if it connects to horizontal (`-`) and vertical (`|`) segments.

### 4.2 Box Tracing

From each top-left corner `┌` at `(r, c)`:

1. **Trace right** along `─` (skipping title text) until `┐` at `(r, c2)` → top border, width = `c2 - c`
2. **Trace down** from `(r, c)` along `│` until `└` at `(r2, c)` → left border, height = `r2 - r`
3. **Verify** `┘` exists at `(r2, c2)` and bottom border `─` connects `└` to `┘`
4. **Record** box as rectangle: `{ top: r, left: c, bottom: r2, right: c2 }`

Handle internal dividers: `┬` on the top border and `┴` on the bottom border mark column dividers. `├` and `┤` mark horizontal dividers.

### 4.3 Box Variants

| Border Pattern | Meaning        |
|----------------|----------------|
| `─` solid      | Regular box    |
| `═` double     | Header/footer  |
| `- - -` dashed | Drop zone      |
| `.` on divider | Resize handle  |

### 4.4 Containment Tree

Sort boxes by area (largest first). For each box, find the smallest box that fully contains it — that's its parent.

```
Algorithm:
  boxes = sort_by_area_desc(all_boxes)
  for each box B:
    B.parent = smallest box P where P fully contains B and P ≠ B
  root = boxes with no parent (or a virtual root if multiple)
```

Result: a tree of boxes. Each box knows its parent and children.

### 4.5 Column Regions

If a box has internal column dividers (`│` running vertically from `┬` to `┴`), split the box interior into column regions. Each column region is parsed independently, then laid out horizontally.

---

## 5. Phase 3: Extract Content

For each box, extract content lines by stripping the border characters:

```
Box at (0,1) to (2,14):
  row 0: ┌─── Title ──┐     ← top border → extract title "Title"
  row 1: │ [Button]   │     ← content → " [Button]   "
  row 2: └────────────┘     ← bottom border → skip
```

For each content row:
- Strip the left `│` and right `│`
- Record the content string with its grid offset (so column positions are preserved)

For boxes with column dividers, split each content line at the divider column.

---

## 6. Phase 4: Tokenize Lines

Scan each content line for widget patterns. This is where a traditional lexer/parser works.

### 6.1 Token Priority

Patterns are checked in priority order to resolve ambiguity:

| Priority | Pattern | Widget | Rule |
|----------|---------|--------|------|
| 1 | `[x]` `[ ]` `[-]` | Checkbox | Exactly 1 char inside `[]`: `x`, space, or `-` |
| 2 | `[- N +]` | Stepper | `[-` ... `+]` with number inside |
| 3 | `[=` or `[.` | Slider/Progress | Only `=` and `.` inside `[]` |
| 4 | `[*` or `[.` | Rating | Only `*` and `.` inside `[]` |
| 5 | `[~` | Skeleton | Only `~` inside `[]` |
| 6 | `[/]` `[\]` `[-]` `[\|]` | Spinner | Single spinner character |
| 7 | `[<]` `[>]` | Prev/Next button | Single `<` or `>` |
| 8 | `[(@` ... `)]` | Icon button | `(@name)` inside `[]` |
| 9 | `[>` ... `]` | Link | `>` prefix inside `[]` |
| 10 | `[` ... `][v]` or `][^]` | Split button | Two `[]` touching, second is `[v]`/`[^]` |
| 11 | `[` ... `>]` | Stretch button | Trailing `>` before `]` |
| 12 | `[` ... `~]` | Disabled button | Trailing `~` |
| 13 | `[` ... `]` | Button | Default for `[]` — label text inside |
| 14 | `[[x]]` `[[ ]]` | Multi-select option | Checkbox inside `[[]]` |
| 15 | `[[` ... `]]` | Active tab / option | Double brackets |
| 16 | `<\|` ... `\|>` | Read-only input | Pipes inside `<>` |
| 17 | `<#` ... `>` | Color input | `#` prefix inside `<>` |
| 18 | `<` ... `v>` or `^>` | Dropdown | Trailing chevron |
| 19 | `<` ... `>>` | Stretch input | Trailing `>>` |
| 20 | `<` ... `>` (with `_`) | Text input | Underscores = editable area |
| 21 | `<` ... `>` (stacked) | Textarea | Consecutive identical-width `<>` lines (Phase 5) |
| 22 | `{[` ... `]/` ... `}` | Toggle (on) | `[]` marks active state |
| 23 | `{` ... `/[` ... `]}` | Toggle (off) | `[]` marks active state |
| 24 | `{` digit+ modifier? `}` | Badge | Number/text, no `/` inside |
| 25 | `(*)` `( )` | Radio button | Single `*` or space inside `()` |
| 26 | `(@` ... `)` | Icon | `@` prefix |
| 27 | `(` ... `x)` | Removable chip | Trailing `x` before `)` |
| 28 | `(` ... `)` | Tag/chip | Word content |
| 29 | `#=` ... `=#` | Image placeholder | `#` borders with `=` |
| 30 | `───` | Separator | 3+ horizontal box-drawing chars |
| 31 | `(!)` `(i)` `(x)` `(v)` | Alert marker | Exactly one marker char |
| 32 | `v ` ... | Expanded section | `v` + space + label at line start |
| 33 | `> ` ... | Collapsed section | `>` + space + label at line start |
| 34 | `+` / `-` at indent | Tree node | Tree prefix at line start |
| 35 | `# ` / `## ` / `### ` | Heading | Markdown heading at line start |
| 36 | `? ` ... | Help text | `?` prefix at line start |
| 37 | `$ ` ... | Tooltip | `$` prefix at line start |
| 38 | `(*) ` / `( ) ` | Radio | Parens with `*` or space + label |
| 39 | plain text | Label | Fallback — anything not matched |

### 6.2 Modifier Extraction

After identifying a widget, check for trailing modifiers before the closing bracket:

```
<____________*!>
              ^^
              │└─ ! = error
              └── * = required
```

Modifiers: `~` disabled, `|` read-only, `*` required, `!` error, `>` stretch.

### 6.3 Line Segmentation

A single line can contain multiple widgets separated by whitespace:

```
│ [Save]  [Cancel]  [Delete]             │
```

Scan left-to-right. After matching a widget, skip whitespace, then look for the next widget. The gap between widgets is recorded as spacing.

---

## 7. Phase 5: Multi-Line Merge

Some widgets span multiple lines. After tokenizing individual lines, merge them:

### Textarea

Consecutive `< >` lines of identical width within the same box:

```
<                        >    ← line N
<                        >    ← line N+1
<                        >    ← line N+2
```

Merge into a single textarea node with height = number of lines.

### Expanded Dropdown

A `<...^>` or `<...v>` followed by indented `[[ ]]` lines and a closing `>`:

```
<Fruit ^>                     ← dropdown (expanded)
  [[ Apple  ]]                ← option
  [[ Banana ]]                ← option
  [[ Orange ]]                ← option
>                             ← end marker
```

Merge into a single dropdown node with children.

### Accordion / Expander

A `v Label` line followed by indented content until `>` or next section:

```
v Section 1                   ← expanded header
  Content for section 1       ← child content
>                             ← end marker
> Section 2                   ← collapsed header
```

### Scroll Region

A box whose right border has `│|` (double pipe) is a scroll container:

```
│ Item 1                   │|
│ Item 2                   │|
```

Mark the parent box as scrollable.

### Form Field Group

A label line, followed by an input, followed by `?` help text or `(!)` error — group into a single form-field node:

```
Full Name:                    ← label
<________________________*>   ← input
? First and last name.        ← help text
```

---

## 8. Phase 6: Layout Resolution

Determine the spatial relationship between sibling widgets within a box.

### Horizontal vs Vertical

- Widgets on the **same row** → horizontal layout (inline)
- Widgets on **different rows** → vertical layout (stacked)

### Column Regions

If a box has column dividers, each column is a vertical layout. The columns are arranged horizontally.

### Spacing

The character gap between widgets on the same line is the horizontal spacing. Blank lines between widget rows are vertical spacing.

### Stretch

Widgets with the `>` stretch modifier fill available width. Multiple stretch widgets on the same line share the space equally.

---

## 9. Phase 7: Build Tree

Assemble the final AST:

```
Document
├── Box "Connection Manager"
│   ├── Box "Server" (column 1)
│   │   ├── FormField
│   │   │   ├── Label "Host:"
│   │   │   └── TextInput value="192.168.1.1"
│   │   ├── FormField
│   │   │   ├── Label "Port:"
│   │   │   └── TextInput value="8080"
│   │   └── HorizontalGroup
│   │       ├── Button "Connect"
│   │       └── Button "Disconnect"
│   ├── Box "Status" (column 2)
│   │   ├── Label "State: Connected"
│   │   ├── Label "Ping: 42ms"
│   │   └── Label "Uptime: 3d 14h"
│   └── ...
```

### Node Types

```
Document         root node
Box              container with optional title, border style
HorizontalGroup  widgets on the same line
VerticalGroup    widgets stacked (default within a box)
ColumnLayout     box split by column dividers
FormField        label + input + help/error group

Button           [label]
IconButton       [(@icon)]
SplitButton      [action][v]
Link             [>label]
Checkbox         [x] / [ ] / [-]
Radio            (*) / ( )
TextInput        <value___>
Dropdown         <label v>
Toggle           {[on]/off}
Slider           [=====.....]
Stepper          [- N +]
Rating           [***..] N/M
Badge            {n}
Tag              (label)
Icon             (@name)
Image            #==IMG==#
Separator        ───
Skeleton         [~~~~]
Spinner          [/]
ProgressBar      [=======...]
Label            plain text
Heading          # / ## / ###
HelpText         ? text
Tooltip          $ text
AlertMarker      (!) / (i) / (x) / (v)
TreeNode         +/- label
Accordion        v/> label with children
```

### Node Properties

Every node carries:

| Property    | Description                                    |
|-------------|------------------------------------------------|
| `type`      | Node type from the list above                  |
| `row`       | Grid row of the first character                |
| `col`       | Grid column of the first character             |
| `width`     | Character width of the widget                  |
| `text`      | Display text / label                           |
| `value`     | Current value (for inputs, sliders, etc.)      |
| `modifiers` | Set of: disabled, readonly, required, error, stretch |
| `children`  | Child nodes (for containers)                   |
| `state`     | Widget state: checked, selected, expanded, etc.|

---

## 10. Edge Cases

### Ambiguous `+`

In ASCII mode, `+` is both a corner and a tree-node marker. Disambiguate by context:
- `+` at line start followed by a space and text → tree node
- `+` connected to `-` and `|` → box corner

### Nested Box Detection

When tracing a box, internal `│` characters are column dividers, not nested box borders. A nested box has its own `┌` corner inside the parent's content area.

### Table vs Grid

Tables use `|` pipe characters without box-drawing corners. If a content line starts with `|` and contains `|`-delimited cells, it's a table row, not a box border.

### Comments

Not yet specified. Reserved for future — likely `'''` blocks or `//` line comments. The parser should skip unrecognized patterns as plain text labels.

---

## 11. Implementation Strategy

### Recommended Stack

| Layer          | Tool                          |
|----------------|-------------------------------|
| Grid + Boxes   | Custom code (spatial logic)   |
| Line tokenizer | ANTLR, PEG, or hand-rolled   |
| Multi-line     | Custom merge pass             |
| Tree builder   | Visitor over parsed structure |

### Why Not Pure ANTLR?

ANTLR operates on a 1D token stream. MarkUI's box containment is 2D — you can't express "this `[Button]` is inside this box" with a context-free grammar. The spatial phases (2, 3, 6) must be custom. ANTLR is useful for Phase 4 (line tokenization) only.

### Suggested Language

TypeScript or C# — both have good parser tooling and are natural targets for VS Code extension or code-gen backends.

### Test Strategy

Each phase is independently testable:
- Phase 2: given a grid, verify detected boxes and their rectangles
- Phase 4: given a content line, verify extracted tokens
- Phase 5: given tokenized lines, verify merged multi-line widgets
- Phase 7: given a full file, verify the output tree matches expected AST
