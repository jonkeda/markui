# MarkUI Parser Architecture

**Date:** 2026-05-23
**Status:** Design (aligned with 06a v4.0)
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
  +--- Title --+
  | [Button]   |
  +------------+

Grid (0-indexed):
  row 0: [ ][+][-][-][-][ ][T][i][t][l][e][ ][-][-][+]
  row 1: [ ][|][ ][[][B][u][t][t][o][n][]][ ][ ][ ][|]
  row 2: [ ][+][-][-][-][-][-][-][-][-][-][-][-][-][+]
```

Every character has a coordinate `(row, col)`. All subsequent phases work on this grid.

### Unicode Normalization

MarkUI accepts both ASCII and Unicode box-drawing characters. Before grid processing, normalize Unicode to ASCII equivalents:

| Unicode       | ASCII | Role              |
|---------------|-------|-------------------|
| `┌` `┐` `└` `┘` `├` `┤` `┬` `┴` `┼` | `+` | Corner/junction |
| `─` `═`       | `-`   | Horizontal border |
| `│`           | `\|`  | Vertical border   |

After normalization, all subsequent phases work with ASCII characters only.

---

## 4. Phase 2: Detect Boxes

### 4.1 Corner Detection

Scan the grid for `+` characters. A `+` is a box corner if it connects to horizontal (`-`) and vertical (`|`) segments.

### 4.2 Box Tracing

From each potential top-left corner `+` at `(r, c)`:

1. **Trace right** along `-` (skipping title text) until another `+` at `(r, c2)` → top border, width = `c2 - c`
2. **Trace down** from `(r, c)` along `|` until `+` at `(r2, c)` → left border, height = `r2 - r`
3. **Verify** `+` exists at `(r2, c2)` and bottom border `-` connects bottom-left to bottom-right
4. **Record** box as rectangle: `{ top: r, left: c, bottom: r2, right: c2 }`

**Open-right boxes:** If the right `|` is absent, the box has no right border. Detect by: top `+---+` exists, left `|` column exists, bottom `+--+` exists, but no right `|` column. The top-right `+` sets a suggested width only.

Handle internal dividers: `+` on the top border with `|` below marks column dividers. `+` on left border with `-` to the right marks horizontal dividers.

### 4.3 Box Variants

| Border Pattern | Meaning        |
|----------------|----------------|
| `-` solid      | Regular box    |
| `.` on divider | Resize handle  |
| `#` on border  | Scroll region  |
| `v` corners    | Vertical list (repeatable) |
| `>` corners    | Horizontal list (repeatable) |
| `w` corners    | Wrapped list (repeatable) |

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

If a box has internal column dividers (`|` running vertically from `+` to `+`), split the box interior into column regions. Each column region is parsed independently, then laid out horizontally.

### 4.6 Nested Prefix Boxes

`++---` and `+++---` at line start (within a parent box) create nested sections without full box drawing:

```
+--- Settings ----
|
++--- Profile ----
  Name: <John Doe____________>
++--- Preferences ----
  Dark mode  {[on]/off}
+----
```

Detection: count leading `+` characters before `---`. `+` = level 1, `++` = level 2, `+++` = level 3. Content belongs to the nearest preceding header at the same or lesser depth. Parent's `+--+` ends all open nested boxes.

---

## 5. Phase 3: Extract Content

For each box, extract content lines by stripping the border characters:

```
Box at (0,1) to (2,14):
  row 0: +--- Title --+     ← top border → extract title "Title"
  row 1: | [Button]   |     ← content → " [Button]   "
  row 2: +------------+     ← bottom border → skip
```

For each content row:
- Strip the left `|` and right `|` (if present)
- Record the content string with its grid offset (so column positions are preserved)

For boxes with column dividers, split each content line at the divider column.

### Title Extraction

The title appears on the top border between `+---` and `---+`:

```
+--- Card Title ---+     → title = "Card Title"
+--@Modal--- Confirm ---+  → type = "Modal", title = "Confirm"
v--- Product ---v        → title = "Product" (vertical list)
```

Typed containers: if `@Name` appears after `+--`, extract the type name separately. Everything after the type is the visible title.

---

## 6. Phase 4: Tokenize Lines

Scan each content line for widget patterns. This is where a traditional lexer/parser works.

### 6.1 Token Priority

Patterns are checked in priority order to resolve ambiguity:

| Priority | Pattern | Widget | Rule |
|----------|---------|--------|------|
| 1 | `[ ]` | Checkbox off | Single space inside `[]` |
| 2 | `[x]` | Checkbox on | Single `x` inside `[]` |
| 3 | `[-]` | Checkbox mixed | Single `-` inside `[]` |
| 4 | `[/]` `[\]` | Spinner | Single `/` or `\` inside `[]` |
| 5 | `[- N +]` | Stepper | `[-` ... `+]` with number inside |
| 6 | `[===..]` | Slider/Progress | Only `=` and `.` inside `[]` |
| 7 | `[***.]` | Rating | Only `*` and `.` inside `[]`, 3+ chars |
| 8 | `[[content]]` | Active tab/page | Double brackets |
| 9 | `[...][v]` or `[...][^]` | Split button | Two `[]` touching, second is `[v]`/`[^]` |
| 10 | `[text v]` or `[text ^]` | Accordion/Expander | Trailing ` v` or ` ^` before `]` |
| 11 | `[<]` `[>]` | Prev/Next button | Single `<` or `>` |
| 12 | `[#N text]` | Icon button | `#` + digit inside `[]` |
| 13 | `[text]` | Button | Default for `[]` — label text inside |
| 14 | `<@name>` | Custom input | First char after `<` is `@` |
| 15 | `<text v>` | Dropdown closed | Trailing ` v` before `>` |
| 16 | `<text ^>` | Dropdown open | Trailing ` ^` before `>` |
| 17 | `<___>` | Text input | Contains underscores |
| 18 | `<text>` | Text input (value) | Angle brackets, no special chars |
| 19 | `{[on]/off}` | Toggle (on) | `[` marks active, `/` separates |
| 20 | `{on/[off]}` | Toggle (off) | `[` marks active, `/` separates |
| 22 | `{N}` `{!}` | Badge | Short content in `{}`, no `/` |
| 23 | `(*)` | Radio selected | Single `*` inside `()` |
| 24 | `( )` | Radio unselected | Single space inside `()` |
| 25 | `(text x)` | Removable chip | Trailing ` x` before `)` |
| 26 | `(?)` `($)` `(!)` `(i)` `(x)` `(v)` + text | Annotation | One of 6 prefixes at line start, followed by text |
| 27 | `(text)` | Tag/chip | Word content in `()` — any `()` not matching annotation or radio |
| 28 | `!==text==!` or `!` block | Image placeholder | `!` bookends |
| 29 | `---` | Separator | 3+ dashes on a line by itself |
| 30 | `_text_` | Link | Underscores wrapping non-underscore text, outside `< >` |
| 31 | `#N` | Icon | `#` + digit (not `# ` which is heading) |
| 32 | `# ` / `## ` / `### ` | Heading | `#` + space at line start |
| 33 | `@name` | Component ref | `@` at line start |
| 34 | `+` / `-` at indent | Tree node | Tree prefix at line start |
| 35 | plain text | Label | Fallback — anything not matched |

### 6.2 Annotation Detection

The 6 annotation prefixes — `(?)` `($)` `(!)` `(i)` `(x)` `(v)` — are the **only** annotations. Any other `(text)` is a tag/chip. Annotations bind to the nearest widget above; a blank line breaks the binding. When no widget is above (or after a blank line), the annotation is a standalone inline alert.

### 6.3 Dropdown Chevron Disambiguation

Trailing ` v>` and ` ^>` mean dropdown. A **space before** the chevron is required:

```
<Select item v>    → dropdown (space before v)
<New v2>           → text input with value "New v2" (no space before >)
<English v>        → dropdown
```

The parser checks: does the content before `>` end with ` v` or ` ^` (space + single chevron char)? If yes → dropdown. Otherwise → text input.

### 6.4 Accordion Chevron Disambiguation

Same trailing rule for `[]`:

```
[Section 1 v]      → accordion collapsed (space before v)
[Section 1 ^]      → accordion expanded
[Save]             → button (no trailing chevron)
```

### 6.5 Line Segmentation

A single line can contain multiple widgets separated by whitespace:

```
| [Save]  [Cancel]  [Delete]             |
```

Scan left-to-right. After matching a widget, skip whitespace, then look for the next widget. The gap between widgets is recorded as spacing.

### 6.6 Link Detection

`_text_` outside of `< >` brackets = link. Inside `< >`, underscores are editable area markers. The parser must not match `_` inside angle brackets as links.

```
_Forgot password?_         → link
<hello_______>             → text input with example data
_Sign up_  _Terms_         → two links
```

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

A `<text ^>` followed by indented option lines and a closing `->`:

```
<Fruit ^>                     ← dropdown (expanded)
  Apple                       ← option
  Banana                      ← option
  Orange                      ← option
->                            ← end marker
```

Multi-select variant has checkboxes in option lines:

```
<Tags: 3 selected v>
  [ ] Option A
  [x] Option B
  [x] Option C
->
```

Merge into a single dropdown node with children.

### Accordion / Expander

A `[Header ^]` line followed by `|`-prefixed content and `+--+`:

```
[Section 1 ^]                 ← expanded header
|  Content for section 1      ← child content
|  More content here          ← child content
+--+                          ← end marker

[Section 2 v]                 ← collapsed header (no body)
```

Consecutive accordion headers (separated by blank lines) form an accordion group. A standalone `[Header ^]`/`[Header v]` is an expander.

### Form Field Group

A label line, followed by an input, optionally followed by an annotation — group into a single form-field node:

```
Full Name:                    ← label
<________________________>    ← input
(?) First and last name.      ← annotation (help text)
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
Box              container with optional title, border style, type (@Modal etc.)
HorizontalGroup  widgets on the same line
VerticalGroup    widgets stacked (default within a box)
ColumnLayout     box split by column dividers
FormField        label + input + annotation group
VerticalList     repeatable box (v corners)
HorizontalList   repeatable box (> corners)
WrappedList      repeatable box (w corners)

Button           [label]
IconButton       [#N label]
SplitButton      [action][v]
Link             _text_
Checkbox         [x] / [ ] / [-]
Radio            (*) / ( )
TextInput        <value___>
Dropdown         <label v> / <label ^>
CustomInput      <@name>
Toggle           {[on]/off}
Slider           [=====.....]
Stepper          [- N +]
Rating           [***..] N/M
Badge            {n} / {!}
Tag              (label)
RemovableChip    (label x)
Icon             #N
Image            !==IMG==!
Separator        ---
Spinner          [/]
ProgressBar      [=======...]
Label            plain text
Heading          # / ## / ###
Annotation       (?) / ($) / (!) / (i) / (x) / (v) + text
Accordion        [header v] / [header ^] with children
TreeNode         +/- label
ComponentRef     @name
SlotMarker       {@slot} / {@slot:name}
Toast            box with annotation marker in title
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
| `children`  | Child nodes (for containers)                   |
| `state`     | Widget state: checked, selected, expanded, etc.|

---

## 10. Edge Cases

### Ambiguous `+`

`+` is both a box corner and a tree-node marker. Disambiguate by context:
- `+` at line start followed by a space and text → tree node
- `+` connected to `-` and `|` → box corner

### Nested Box Detection

When tracing a box, internal `|` characters are column dividers, not nested box borders. A nested box has its own `+` corner inside the parent's content area.

### Table vs Grid

Tables use `|` pipe characters without box-drawing corners. If a content line starts with `|` and contains `|`-delimited cells with a `|---|` separator row, it's a table, not a box border.

### List Container vs Box

`v`/`>`/`w` corners signal a repeatable list item. `+` corners signal a structural box. The parser checks the corner character to set the node type.

### Annotation vs Chip

`(!)` at line start followed by text = annotation. `(Technology)` = tag/chip. Only the 6 defined prefixes — `(?)` `($)` `(!)` `(i)` `(x)` `(v)` — are annotations. The parser matches these exactly; any other `(text)` is a chip.

### Link vs Input Underscores

`_text_` outside angle brackets = link. `<hello___>` = text input. The parser must track whether it is currently inside `< >` to avoid matching input underscores as links.

### Dropdown vs Text Value

`<Select v>` = dropdown (space before `v`). `<New v2>` = text input with value. The disambiguation rule: content ends with ` v` or ` ^` (space + single char) → dropdown. Otherwise → text input.

### Breadcrumb

`Home > Products > Laptops` — text segments separated by ` > `. Detected as a sequence of labels with `>` separators. Not confused with angle brackets because `>` here is outside `< >` and surrounded by spaces.

### Context Menu Shortcut Keys

`^X`, `^C`, `^V` inside a floating box = keyboard shortcuts, not accordion chevrons. These appear right-aligned in a context menu box and are not inside `[]` or `<>`.

---

## 11. Error Handling and Parser Modes

The parser operates in one of two modes, configured at parse time:

```typescript
interface ParseOptions {
  mode: 'strict' | 'autofix';
}

function parse(source: string, options?: ParseOptions): ParseResult;
```

### 11.1 Two Modes

| | **Strict** | **Autofix** |
|---|---|---|
| **Purpose** | Validation, CI, linting | IDE preview, live editing |
| **On error** | Report error, emit node as-is | Guess intent, fix the tree, report warning |
| **Output tree** | May contain Label fallbacks | Best-effort corrected tree |
| **Use case** | `markui validate`, export, publish | VS Code preview, markdown rendering |

Both modes always produce a tree (never throw). Both modes always produce an error/warning list. The difference is whether the tree reflects the literal text (strict) or the guessed intent (autofix).

### 11.2 Error Catalog

Errors are detected at specific phases. Each error has a code, severity, phase, and — in autofix mode — a fix action.

#### Phase 2: Box Detection Errors

| Code | Error | Strict | Autofix |
|------|-------|--------|---------|
| `BOX_UNCLOSED_TOP` | Top border `+---` with no matching bottom `+--+` | Error: unclosed box | Warning: treat as open-right box, infer `+--+` at last `\|` line |
| `BOX_UNCLOSED_RIGHT` | Top-left and bottom-left corners found, no right border | Info (valid open-right) | Info (same) |
| `BOX_MISALIGNED` | Left `\|` column doesn't align with top `+` corners | Error: border misalignment at row N | Warning: snap `\|` to nearest corner column |
| `BOX_OVERLAP` | Two boxes partially overlap without proper containment | Error: overlapping boxes | Warning: treat smaller box as child of larger |
| `BOX_ORPHAN_BORDER` | `+---` or `\|` that doesn't form a complete box | Warning: orphan border chars | Warning: ignore, treat as text |

#### Phase 4: Tokenization Errors

| Code | Error | Strict | Autofix |
|------|-------|--------|---------|
| `BRACKET_UNCLOSED` | `[text` without closing `]`, or `<text` without `>` | Error: unclosed bracket | Warning: infer closing bracket at end of content or line |
| `BRACKET_MISMATCH` | `[text>` or `<text]` — mismatched open/close | Error: bracket mismatch | Warning: use the opener to determine type, ignore closer |
| `BRACKET_EMPTY` | `[]` or `<>` with no content | Warning: empty widget | Warning: emit empty button / empty input |
| `CHEVRON_AMBIGUOUS` | `<text v2>` — could be dropdown or value ending in "v2" | Info: disambiguated as text input | Info: same (space-before-chevron rule resolves it) |
| `ANNOTATION_UNKNOWN` | `(?) text` where `?` is not one of the 6 defined prefixes — shouldn't happen since only `? $ ! i x v` match, but e.g. `(w)` | — (parsed as chip) | — (parsed as chip) |
| `LINK_INSIDE_INPUT` | `<hello _click_ world>` — underscores inside angle brackets look like a link | Warning: link-like pattern inside input | Warning: ignore, treat as input text |

#### Phase 5: Multi-Line Merge Errors

| Code | Error | Strict | Autofix |
|------|-------|--------|---------|
| `TEXTAREA_UNEVEN` | Consecutive `< >` lines of different widths | Warning: textarea width mismatch | Warning: pad shorter lines, merge as textarea |
| `DROPDOWN_NO_CLOSE` | `<Select ^>` with options but no `->` end marker | Error: unclosed dropdown | Warning: close dropdown at next blank line or box boundary |
| `ACCORDION_NO_CLOSE` | `[Section ^]` with `\|` body but no `+--+` | Error: unclosed accordion body | Warning: close at next accordion header, blank line, or box end |
| `ORPHAN_ENDMARKER` | `->` with no preceding expanded dropdown | Warning: orphan end marker | Warning: ignore, treat as label |

#### Phase 7: Tree Validation Errors

| Code | Error | Strict | Autofix |
|------|-------|--------|---------|
| `LABEL_LOOKS_LIKE_WIDGET` | A Label node whose text matches a widget pattern (e.g., `[unclosed` or `<broken`) | Warning: possible malformed widget | Warning: attempt re-parse with bracket inference |
| `SLOT_OUTSIDE_COMPONENT` | `{@slot}` in a non-component file | Warning: slot marker in non-component context | Warning: ignore, treat as label |
| `COMPONENT_NOT_FOUND` | `@name` references a component that doesn't exist | Warning: unresolved component ref | Warning: emit placeholder |

### 11.3 Autofix Strategies

Autofix doesn't modify the source file. It modifies the **parsed tree** to reflect guessed intent, and emits warnings describing what was fixed.

#### Bracket Completion

```
Source:    [Save   <Select v   {on/off
Strict:    Label    Label        Label
Autofix:   Button   Dropdown     Toggle (guessed closing brackets)
```

The autofix scanner tracks open brackets. If a line ends with an unclosed bracket, it infers the close at the line boundary:
- `[text` → `[text]` → Button
- `<text` → `<text>` → TextInput
- `{text/text` → `{text/[text]}` → Toggle (guess active state as second)

#### Box Repair

```
Source:
  +--- Title ---+
  | content
  | more content

Strict:   Error BOX_UNCLOSED_TOP — content becomes root-level labels
Autofix:  Infer +--+ after last | line — content stays inside the box
```

#### Dropdown Close

```
Source:
  <Fruit ^>
    Apple
    Banana

  Name: <____________>

Strict:   Error DROPDOWN_NO_CLOSE — options are separate labels
Autofix:  Close dropdown at blank line — Apple/Banana are options, Name is outside
```

### 11.4 Error Data Structure

```typescript
interface ParseError {
  code: string;              // e.g. "BOX_UNCLOSED_TOP"
  message: string;           // Human-readable description
  row: number;               // 0-based grid row
  col: number;               // 0-based grid col
  endRow?: number;           // For multi-line errors
  endCol?: number;
  severity: 'error' | 'warning' | 'info';
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  fix?: AutofixAction;       // Only in autofix mode
}

interface AutofixAction {
  description: string;       // "Inferred closing ] at end of line"
  applied: boolean;          // true if the tree was modified
}

interface ParseResult {
  tree: WidgetTree;          // Always present (may be partial)
  errors: ParseError[];      // Errors and warnings
  boxes: Box[];              // Detected boxes from Phase 2
  mode: 'strict' | 'autofix';
}
```

### 11.5 Mode Selection by Context

| Context | Mode | Reason |
|---------|------|--------|
| VS Code live preview | autofix | User is typing, want best-effort rendering |
| VS Code diagnostics | strict | Show real errors, don't hide problems |
| Markdown preview | autofix | Render what you can, errors in fenced blocks are common |
| CLI `markui validate` | strict | CI/linting should catch all issues |
| CLI `markui export` | strict | Don't export broken wireframes |
| CLI `markui export --force` | autofix | Export best-effort even with issues |

The VS Code extension runs **both modes simultaneously**: strict for diagnostics (red squiggles), autofix for preview (best rendering). This gives the user error feedback AND a usable preview at the same time.

### 11.6 Cascading Errors

Errors in early phases can cause cascading errors in later phases. The parser tracks the "root cause" to avoid flooding the user:

```
Phase 2: BOX_UNCLOSED_TOP at row 0          ← root cause
Phase 4: content parsed as root-level labels ← cascading (suppressed in strict)
Phase 7: LABEL_LOOKS_LIKE_WIDGET             ← cascading (suppressed)
```

Strategy: if Phase 2 reports an error for a region, suppress Phase 4/5/7 errors for content within that region. Show only the root cause.

---

## 12. Implementation Strategy

### 12.1 Recommended Stack

| Layer          | Tool                          |
|----------------|-------------------------------|
| Grid + Boxes   | Custom code (spatial logic)   |
| Line tokenizer | ANTLR, PEG, or hand-rolled   |
| Multi-line     | Custom merge pass             |
| Tree builder   | Visitor over parsed structure |

### 12.2 Why Not Pure ANTLR?

ANTLR operates on a 1D token stream. MarkUI's box containment is 2D — you can't express "this `[Button]` is inside this box" with a context-free grammar. The spatial phases (2, 3, 6) must be custom. ANTLR is useful for Phase 4 (line tokenization) only.

### 12.3 Suggested Language

TypeScript or C# — both have good parser tooling and are natural targets for VS Code extension or code-gen backends.

### 12.4 Test Strategy

Each phase is independently testable:
- Phase 1: given a file with mixed Unicode/ASCII, verify normalized grid
- Phase 2: given a grid, verify detected boxes and their rectangles
- Phase 4: given a content line, verify extracted tokens
- Phase 5: given tokenized lines, verify merged multi-line widgets
- Phase 7: given a full file, verify the output tree matches expected AST
