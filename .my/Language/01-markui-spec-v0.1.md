# MarkUI Specification v0.1 — First Draft

**Date:** 2026-05-21
**Status:** Draft

---

## 1. What is MarkUI?

MarkUI is an ASCII-native UI language where **the ASCII you type IS the UI**. There is no DSL, no markup transformation, no compilation step to produce a visual. The monospaced text file is simultaneously:

1. **Human-readable design** — A developer reads a `.markui` file and sees the UI.
2. **Machine-parseable source** — A parser extracts a widget tree, layout structure, and semantics.
3. **Interactive runtime** — The document runs: buttons click, checkboxes toggle, expanders expand.

MarkUI documents can also be compiled to real UI frameworks (WPF, MAUI, HTML/CSS, etc.) via code generation backends.

---

## 2. Core Principles

| Principle                     | Meaning                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| **ASCII is the UI**     | What you type is what you see. No rendering pipeline.                    |
| **Monospaced always**   | Everything assumes a fixed-width font. Alignment is spatial.             |
| **Boxes are layout**    | Unicode box-drawing characters define containers and structure.          |
| **Glyphs are widgets**  | Inline ASCII patterns are the widget vocabulary. No tags, no attributes. |
| **Readable first**      | If a feature makes the ASCII unreadable, it's wrong.                     |
| **Nesting with limits** | Boxes can contain boxes, but practical depth is 2–3 levels.             |

---

## 3. File Format

- Extension: `.markui`
- Encoding: UTF-8
- All content is monospaced
- A file represents one screen, panel, or component

---

## 4. Multi-Column Layout — Proposals

This is the most open design area. Three proposals follow.

### Proposal A: Side-by-Side Boxes

Columns are separate boxes placed horizontally adjacent:

```
┌─── Left ──────────┐ ┌─── Right ─────────┐
│ [Connect]         │ │ Status: Online    │
│ [Disconnect]      │ │ Ping: 42ms        │
└───────────────────┘ └───────────────────┘
```

**Pros:** Simple, no new syntax, each column is an independent box.
**Cons:** Hard to express that they're *siblings* in the same row. Fragile alignment — inserting a line in the left box misaligns the right.

### Proposal B: Column Dividers Inside a Box

A single box with internal `│` column dividers, using T-junctions at top and bottom:

```
┌─── Left ──────────┬─── Right ─────────┐
│ [Connect]         │ Status: Online    │
│ [Disconnect]      │ Ping: 42ms        │
└───────────────────┴───────────────────┘
```

**Pros:** Columns are explicitly part of the same container. Alignment is enforced by the divider character position. Rows are visually linked.
**Cons:** Adding/removing columns requires editing every line. Wider boxes get unwieldy.

### Proposal C: Hybrid

Both mechanisms coexist:

- **Internal dividers** for fine-grained layout within a box (form labels + fields, key-value pairs).
- **Adjacent boxes** for major page regions (sidebar + main content).

```
┌─── Sidebar ────────┐ ┌─── Main ──────────────────────────┐
│ [Nav Item 1]       │ │ ┌─── Form ────────┬─────────────┐ │
│ [Nav Item 2]       │ │ │ Name:           │ [_________] │ │
│ [Nav Item 3]       │ │ │ Email:          │ [_________] │ │
│                    │ │ └─────────────────┴─────────────┘ │
│                    │ │                                   │
│                    │ │ [Save]  [Cancel]                  │
└────────────────────┘ └───────────────────────────────────┘
```

**Pros:** Most expressive. Natural mapping to real UI patterns.
**Cons:** Most complex to parse. Ambiguity about when adjacent boxes are "in the same row" vs. stacked.

### Proposal D: Row Markers

Explicit syntax to declare a horizontal row of boxes:

```
═══ row ═══════════════════════════════════
┌─── Left ──────────┐ ┌─── Right ────────┐
│ [Connect]         │ │ Status: Online   │
└───────────────────┘ └──────────────────┘
═══ end ═══════════════════════════════════
```

**Pros:** Unambiguous grouping. Parser knows which boxes share a row.
**Cons:** Extra syntax. Adds visual noise.

_**Recommendation:** Start with Proposal B (internal dividers) for v0.1. It's the most natural ASCII representation and easiest to parse. Add Proposal A (adjacent boxes) later if needed._

---

## 5. Interaction Model (Runtime)

When running interactively (terminal or VS Code panel), the document is live:

| Widget             | Interaction                          |
| ------------------ | ------------------------------------ |
| `[Button]`       | Click → fires action                |
| `[Dropdown v]`   | Click → expands to show options     |
| `[ ] / [x]`      | Click → toggles check state         |
| `<on> / <off>`   | Click → toggles state               |
| `* Radio`        | Click → selects, deselects siblings |
| `> Expander`     | Click → expands/collapses content   |
| `[____]`         | Click → enters text editing mode    |
| `[====····]` | Drag → adjusts value                |

### 9.1 State

The file IS the state. When a checkbox is toggled, the file changes from `[ ]` to `[x]`. The document is a live, self-modifying artifact.

### 9.2 Binding (Future)

How widgets connect to code is deferred to a later version. Possible directions:

- Companion file (e.g., `screen.markui.ts`) with handlers keyed by widget identity
- Inline annotations (but this risks breaking the "ASCII is the UI" principle)
- Convention-based naming (widget label → handler function name)

---

## 6. Code Generation

MarkUI documents can be compiled to real UI frameworks:

| Target         | Mapping                                                               |
| -------------- | --------------------------------------------------------------------- |
| HTML/CSS       | Box →`<div>`, widgets → form elements, layout → CSS Grid/Flexbox |
| WPF/XAML       | Box →`GroupBox`/`StackPanel`, widgets → WPF controls            |
| MAUI           | Box → layouts, widgets → MAUI controls                              |
| Terminal (TUI) | Direct rendering with box-drawing characters                          |

Code generation is backend-specific. The MarkUI parser produces a **widget tree**, and each backend walks the tree to emit framework code.

---

## 7. Grammar (Sketch)

A rough grammar for the parser:

```
document     = box+
box          = top-border newline (content-line newline)* bottom-border newline
top-border   = "┌" ("─" | title | tab-widget)* "┐"
bottom-border= "└" ("─" | "┴")* "┘"
content-line = "│" (widget | text | nested-box | column-divider)* "│"
column-divider = "│"

widget       = button | dropdown | checkbox | radio | toggle | input
             | expander | section | slider | separator

button       = "[" label "]"
dropdown     = "[" label ("v" | "^") "]"
checkbox     = "[" (" " | "x") "]" label
radio        = "*" label
toggle       = "<" ("on" | "off") ">"
input        = "[" ("_" | text)+ "]"
expander     = (">" | "v") label
section      = "^-" label "-"+
slider       = "[" "="* "·"* "]" percentage?
separator    = "─"+

label        = (printable-char - special)+
title        = " " label " "
```

_This is illustrative, not formal. A real PEG/parser-combinator grammar would handle ambiguities (e.g., `[text]` — is it a button or an input?)._

---

## 8. Open Questions

| #  | Question                                          | Options                                                           |
| -- | ------------------------------------------------- | ----------------------------------------------------------------- |
| 1  | How to distinguish `[Button]` from `[Input]`? | Underscores for input? Different brackets? [_input__]           |
| 2  | Active tab styling?                               | Spaces `[ Tab ]`, Double is active `[[Tab*]]`, double-border? |
| 3  | Radio unselected glyph?                           | explicit `○`?                                                  |
| 4  | Multi-column: which proposal?                     | A (adjacent), B (dividers), C (hybrid), D (row markers)?          |
| 5  | How do widgets get identity?                      | Defer                                                             |
| 6  | Scrollable regions?                               | let's think about this  maybe ^ and line and then a down char?   |
| 7  | Binding model?                                    | Defer                                                             |
| 8  | Theming / color?                                  | Defer                                                             |
| 9  | Responsive layout?                                | Let's think about it                                              |
| 10 | Comments?                                         | yes. no idea yet maybe blocks of ''' like in markdown            |

---

## 9. Next Steps
│ ┌─── Server ──────────────┬─── Status ─────────────────┐ │
│ │ Host: [192.168.1.1____] │ State:    Connected        │ │
│ │ Port: [8080__________]  │ Ping:     42ms             │ │
│ │                         │ Uptime:   3d 14h           │ │
│ │ [Connect]  [Disconnect] │                            │ │
│ └─────────────────────────┴────────────────────────────┘ │
│                                                          │
│ ^-options-------------------------------------------------│
│                                                          │
│ Protocol:   * TCP   * UDP   * WebSocket                  │
│ Encryption: <on>                                         │
│ Timeout:    [====····] 60s                               │
│                                                          │
│ > Advanced Settings                                      │
│                                                          │
│ ┌─── Log ────────────────────────────────────────────┐   │
│ │ 12:01 Connected to 192.168.1.1:8080                │   │
│ │ 12:02 Handshake complete                           │   │
│ │ 12:03 Ping: 42ms                                   │   │
│ └────────────────────────────────────────────────────┘   │
│                                                          │
│ [Save Config]  [Load Config]  [Reset]                    │
1. **Resolve open questions** — especially multi-column layout and widget identity
2. **Formal grammar** — PEG or parser-combinator spec
3. **Reference parser** — TypeScript or C# implementation
4. **VS Code extension** — syntax highlighting, live preview, interactive mode
5. **First code-gen backend** — HTML/CSS as the simplest target
