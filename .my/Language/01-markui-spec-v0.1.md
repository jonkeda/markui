# MarkUI Specification

**Date:** 2026-05-27
**Status:** v3.2

---

## 1. What is MarkUI?

MarkUI is an ASCII-native UI language where **the ASCII you type IS the UI**. There is no DSL, no markup transformation, no compilation step to produce a visual. The monospaced text file is simultaneously:

1. **Human-readable design** — A developer reads a `.markui` file and sees the UI.
2. **Machine-parseable source** — A parser extracts a widget tree, layout structure, and semantics.
3. **Interactive runtime** — The document runs: buttons click, checkboxes toggle, accordions expand.

MarkUI documents can also be compiled to real UI frameworks (WPF, MAUI, HTML/CSS, etc.) via code generation backends.

---

## 2. Core Principles

| Principle              | Meaning                                                                  |
|------------------------|--------------------------------------------------------------------------|
| **ASCII is the UI**    | What you type is what you see. No rendering pipeline.                    |
| **Monospaced always**  | Everything assumes a fixed-width font. Alignment is spatial.             |
| **Boxes are layout**   | ASCII box characters (`+`, `-`, `|`) define containers and structure.    |
| **Glyphs are widgets** | Inline ASCII patterns are the widget vocabulary. Semantic markers stay compact. |
| **Readable first**     | If a feature makes the ASCII unreadable, it's wrong.                     |
| **No modifiers**       | No disabled, required, error, read-only, or stretch markers.             |

---

## 3. File Format

- Extension: `.markui`
- Encoding: UTF-8
- Prefer ASCII for generated examples; documented Unicode input is valid
- All content is monospaced
- One screen per file, no prose text
- Multiple screens or explanatory text: use `.md` files with ` ```markui ` fenced blocks
- Named blocks in `.md` files: ` ```markui:component-name ` makes blocks referenceable as `@component-name`
- Icon meanings (`#N`) are defined in surrounding `.md` context, not inside wireframes
- Widget syntax is defined canonically in `04-markui-widget-reference.md` and its `04a-*` through `04i-*` chapters

---

## 4. Layout

### Vertical and Horizontal

- Widgets on **separate lines** = vertical flow (default)
- Widgets on the **same line** = horizontal layout; spacing is the gap

```
[Save]  [Cancel]  [Delete]
```

### Box

```
+--- Title ---+
| content     |
+-------------+
```

- `+` corners, `-` horizontal border, `|` vertical border
- Unicode box drawing is accepted as input but ASCII is preferred
- Boxes can include semantic types on the border, such as `+--@Modal--- Confirm --+`

### Boxless UI

MarkUI does not require a surrounding box:

```
Username:
<Jane____________>

[Login]
```

### Open-Right Shorthand

Right `|` is optional — a box can be defined by its left edge only:

```
+--- Title ----
|
|  content
|
+----
```

### Nested Box Prefix

`++` for level 2, `+++` for level 3:

```
+--- Settings ----
|
++--- Profile ----

  content here

++--- Preferences ----

  more content

+----
```

### Multi-Column Layout

Columns are boxes with internal `|` dividers:

```
+--------+---------------------+
| Side   | Main Content        |
| bar    |                     |
+--------+---------------------+
```

Adjacent boxes on the same line are also valid for major page regions.

### Special Border Characters

| Char | Role                                        |
|------|---------------------------------------------|
| `+`  | All corners and junctions                   |
| `-`  | Horizontal border                           |
| `|`  | Vertical border / column divider            |
| `.`  | Resizable splitter (replaces `-` or `|`)    |
| `#`  | Scroll indicator (replaces `-` or `|`)      |
| `v`  | Vertical list container corner              |
| `>`  | Horizontal list container corner            |
| `w`  | Wrapped list container corner               |

### List Containers

List containers distinguish repeatable regions from structural boxes:

```
v--- Product ----------------v
| Widget A       $19.99      |
| [Add to cart]              |
v----------------------------v

>--- Product --->  >--- Product --->
| Widget A      |  | Widget B      |
>--------------->  >--------------->

w--- Tags --------------------w
| (React) (TypeScript)        |
w-----------------------------w
```

### Sizing

Glyph width is the rendered width. No pixel values. Fill behavior is a runtime concern.

---

## 5. Interaction Model (Runtime)

When running interactively (terminal or VS Code panel), the document is live:

| Widget                  | Interaction                          |
|-------------------------|--------------------------------------|
| `[Button]`              | Click fires action                   |
| `[Button][v]`           | Click opens attached action menu     |
| `<Dropdown v>`          | Click expands to show options        |
| `<Dropdown ^>`          | Click collapses visible options      |
| `[ ]` / `[x]` / `[-]`   | Click toggles check state            |
| `{[on]/off}`            | Click toggles state                  |
| `(*)`                   | Click selects, deselects siblings    |
| `[Section ^]`           | Click collapses an expander section  |
| `[Section v]`           | Click expands an expander section    |
| `<____>`                | Click enters text editing mode       |
| `[=====.....]`          | Drag adjusts value                   |
| `[[Tab]]`               | Click selects active tab             |

### State

The file IS the state. When a checkbox is toggled, the file changes from `[ ]` to `[x]`. The document is a live, self-modifying artifact.

### Binding (Future)

How widgets connect to code is deferred. Possible directions:

- Companion file (e.g., `screen.markui.ts`) with handlers keyed by widget identity
- Convention-based naming (widget label to handler function name)

---

## 6. Code Generation

MarkUI documents can be compiled to real UI frameworks:

| Target         | Mapping                                                          |
|----------------|------------------------------------------------------------------|
| HTML/CSS       | Box to `<div>`, widgets to form elements, layout to CSS Grid     |
| WPF/XAML       | Box to `GroupBox`/`StackPanel`, widgets to WPF controls          |
| MAUI           | Box to layouts, widgets to MAUI controls                         |
| Terminal (TUI) | Direct rendering with box-drawing characters                     |

Code generation is backend-specific. The MarkUI parser produces a **widget tree**, and each backend walks the tree to emit framework code.

---

## 7. Grammar (Sketch)

```
document     = (box | prefix-section | content-line)*
box          = top-border newline (content-line newline)* bottom-border
top-border   = corner ("-" | title | type-marker)* corner?
bottom-border= corner ("-" | "." | "#")* corner?
corner       = "+" | "v" | ">" | "w"
content-line = "|" (widget | text | nested-box)* "|"?
type-marker  = "@" ident

widget       = heading | button | icon-button | split-button
             | prev-next | active-tab | dropdown | custom-input
             | checkbox | radio | toggle | input | textarea
             | expander | accordion | slider | progress
             | separator | badge | chip | icon | image | link
             | rating | stepper | spinner | annotation
             | component-reference | slot

heading      = "#"+" " label
button       = "[" label "]"
icon-button  = "[" "#" digit " " label "]"
split-button = "[" label "]" "[" ("v" | "^") "]"
prev-next    = "[" ("<" | ">") "]"
active-tab   = "[[" label "]]"
dropdown     = "<" label " " ("v" | "^") ">"
custom-input = "<@" ident ">"
checkbox     = "[" (" " | "x" | "-") "]"
radio        = "(" ("*" | " ") ")"
toggle       = "{" "[" state "]" "/" state "}"
input        = "<" ("_" | text)+ ">"
textarea     = input newline input+
expander     = "[" label " " ("^" | "v") "]"
accordion    = expander (blank-line expander)*
slider       = "[" "="* "."* "]"
progress     = "[" "="* "."* "]"
rating       = "[" "*"* "."* "]"
stepper      = "[" "- " number " +" "]"
badge        = "{" (digit+ | "!") "}"
chip         = "(" label (" x")? ")"
icon         = "#" digit
image        = "!" ("=" | text)+ "!"
link         = "_" text "_"
separator    = "---"+
spinner      = "[" ("/" | "\\") "]"
annotation   = "(" ("?" | "$" | "!" | "i" | "x" | "v") ")" text
component-reference = "@" ident
slot         = "{@slot" (":" ident)? "}"

label        = (printable-char - special)+
title        = " " label " "
```

This is illustrative, not formal. Square brackets and angle brackets are resolved by the priority rules in `04-markui-widget-reference.md`. See `07-markui-parser-architecture.md` for parser design.

---

## 8. Next Steps

1. Keep the TypeScript parser aligned with the canonical `04-*` widget references.
2. Keep the VS Code grammar, snippets, markdown preview, and notebook renderer aligned with language changes.
3. Validate `.markui` examples and fenced `markui` blocks when the grammar changes.
