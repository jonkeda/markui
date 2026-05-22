# MarkUI Widget Design Principles

**Date:** 2026-05-22
**Status:** v1.0
**Purpose:** Rules governing widget glyph design — how existing widgets work and how to create new ones.

---

## 1. Design Principles

1. **A widget is a glyph** — a recognizable ASCII pattern that a human reads as a control and a parser extracts as a node.
2. **Widgets are leaf nodes** — they cannot contain other widgets or boxes.
3. **One line, one widget** — a widget occupies part of a single line. Multi-line widgets (like expanders with content) use indentation to claim subsequent lines.
4. **State is visible** — the current state of every widget is encoded in its glyph. `[x]` is checked. `( )` is unselected. `{on/[off]}` is off. No hidden state.
5. **No attributes** — widgets have no key=value properties. Everything is expressed in the glyph shape and content.

---

## 2. Rules for Inventing New Widgets

### 2.1 The Glyph Must Be Self-Evident

A reader encountering the widget for the first time should have a reasonable guess what it does. `[x]` obviously means "checked." `(*)` obviously means "selected." If the glyph requires explanation, redesign it.

### 2.2 Use Existing Bracket Conventions

| Bracket   | Meaning                          | Examples                              |
| --------- | -------------------------------- | ------------------------------------- |
| `[ ]`   | Buttons, checkboxes, sliders     | `[Submit]` `[x]` `[=====.....]` |
| `[[ ]]` | Active / emphasized              | `[[Tab]]` `[[ Option ]]`          |
| `< >`   | Text inputs, dropdowns           | `<____>` `<Select v>`             |
| `{ / }` | Toggles                          | `{[on]/off}` `{on/[off]}`         |
| `{n}`   | Badges                           | `{3}` `{!}` `{3!}`             |
| `( )`   | Radio buttons, tags/chips        | `(*) ( )` / `(tag1) (tag2)`       |
| `(@)`   | Icons                            | `(@home)` `(@search)`             |
| `#`     | Image placeholder                | `#==IMG==#`                         |

New widgets should reuse these brackets with their established semantics. Don't invent new bracket types without strong justification.

### 2.3 State Is In the Glyph

Every possible state of a widget must be representable as a distinct glyph. The file shows the current state at all times.

Bad:

```
[Checkbox]     <- is it checked or not? Can't tell.
```

Good:

```
[ ] Checkbox   <- clearly unchecked
[x] Checkbox   <- clearly checked
```

### 2.4 One Pattern, One Widget

No ambiguity. If `[text]` could be a button or a badge, the patterns are broken. Use differentiators:

- Underscores → input (`<____>`)
- Chevrons → dropdown (`<Select v>`)
- `x`/space in exactly one char → checkbox (`[x]` / `[ ]`)
- `>` prefix → link (`[>Click here]`)
- `#` prefix → color (`<#FF5500>`)
- `*`/space in parens → radio (`(*)` / `( )`)

### 2.5 Composition Over Invention

Before creating a new widget, check if existing widgets can be composed:

- A "tag input" is a row of `(tags)` followed by a `<____>` input.
- A "search bar" is a `<____>` input with a `[(@search)]` button.
- A "card" is just a titled box with content.

Only create a new widget glyph when composition fails to capture the semantics.

### 2.6 Test the Readability

After designing a widget glyph, place it in a full MarkUI layout. If it visually clashes, is hard to parse at a glance, or breaks alignment, iterate.

### 2.7 Monospace Constraint

Every widget must render correctly in a monospace font at any reasonable terminal width. No reliance on proportional spacing, ligatures, or special rendering.

---

## 3. Nesting Rules

### 3.1 Maximum Depth

Boxes nest up to **3 levels** deep. Beyond that, readability degrades too much in monospace.

```
Level 0: ┌───────────────────────────────────────┐
Level 1: │ ┌───────────────────────────────────┐ │
Level 2: │ │ ┌───────────────────────────────┐ │ │
Level 3: │ │ │ content (max depth)           │ │ │
         │ │ └───────────────────────────────┘ │ │
         │ └───────────────────────────────────┘ │
         └───────────────────────────────────────┘
```

### 3.2 Nesting Indentation

Each nesting level consumes 2 characters (the `│` and a space):

```
│ ┌──           <- parent border + space + child border
```

### 3.3 What Can Nest

- Boxes inside boxes ✓
- Widgets inside boxes ✓
- Widgets inside widgets ✗ (widgets are leaf nodes)
- Boxes inside widgets ✗
