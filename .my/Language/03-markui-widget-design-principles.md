# MarkUI Widget Design Principles

**Date:** 2026-05-22
**Status:** v3.1
**Purpose:** Rules governing widget glyph design — how existing widgets work and how to create new ones.

---

## 1. Design Principles

1. **A widget is a glyph** — a recognizable ASCII pattern that a human reads as a control and a parser extracts as a node.
2. **Widgets are leaf nodes** — they cannot contain other widgets or boxes.
3. **One line, one widget** — a widget occupies part of a single line. Multi-line widgets (like expanded dropdowns or accordion content) use indentation and end markers to claim subsequent lines.
4. **State is visible** — the current state of every widget is encoded in its glyph. `[x]` is checked. `( )` is unselected. `{on/[off]}` is off. No hidden state.
5. **No attributes** — widgets have no key=value properties. Everything is expressed in the glyph shape and content.
6. **No modifiers** — no disabled, required, error, read-only, or stretch markers. All inputs render identically regardless of state.

---

## 2. Rules for Inventing New Widgets

### 2.1 The Glyph Must Be Self-Evident

A reader encountering the widget for the first time should have a reasonable guess what it does. `[x]` obviously means "checked." `(*)` obviously means "selected." If the glyph requires explanation, redesign it.

### 2.2 Use Existing Bracket Conventions

| Bracket  | Meaning                                     | Examples                           |
|----------|---------------------------------------------|------------------------------------|
| `[ ]`    | Buttons, checkboxes, sliders, steppers, etc | `[Submit]` `[x]` `[=====.....]`   |
| `[[ ]]`  | Active / emphasized                         | `[[Tab]]` `[[3]]`                  |
| `< >`    | Text inputs, dropdowns                      | `<____>` `<v Select>`              |
| `{ / }`  | Toggles                                     | `{[on]/off}` `{on/[off]}`         |
| `{n}`    | Badges                                      | `{3}` `{!}`                        |
| `( )`    | Radio buttons, tags/chips                   | `(*) ( )` / `(tag)` `(tag x)`     |
| `#N`     | Icons (numbered)                            | `#1` `#2`                          |
| `!`      | Image placeholder                           | `!==IMG==!`                        |

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
[-] Checkbox   <- clearly indeterminate
```

### 2.4 One Pattern, One Widget

No ambiguity. Content inside brackets determines the widget type via priority-ordered rules:

**Inside `[ ]`:**

| Content             | Widget          | Example          |
|---------------------|-----------------|------------------|
| single space        | Checkbox off    | `[ ]`            |
| single `x`          | Checkbox on     | `[x]`            |
| single `-`          | Checkbox mixed  | `[-]`            |
| single `/` or `\`   | Spinner         | `[/]`            |
| `...`               | List truncation | `[...]`          |
| `- N +` pattern     | Stepper         | `[- 42 +]`       |
| only `=` and `.`    | Slider/progress | `[====....]`     |
| only `*` and `.` 3+ | Rating          | `[***..] 3/5`    |
| `[[content]]`       | Active tab/page | `[[Tab]]`        |
| everything else     | Button          | `[Submit]`       |

**Inside `< >`:**

| First char | Widget       | Example               |
|------------|--------------|-----------------------|
| `_`        | Text input   | `<____________>`      |
| `v`        | Dropdown     | `<v Select item>`     |
| `^`        | Dropdown     | `<^ Select item>`     |
| `@`        | Custom input | `<@datepicker>`       |
| other      | Text input   | `<hello_______>`      |

**Inside `{ }`:**

| Content       | Widget | Example        |
|---------------|--------|----------------|
| `[s]/s`       | Toggle | `{[on]/off}`   |
| digits or `!` | Badge  | `{3}` `{!}`    |
| `@...`        | Slot   | `{@slot:name}` |

### 2.5 Composition Over Invention

Before creating a new widget, check if existing widgets can be composed:

- A "tag input" is a row of `(tags)` followed by a `<____>` input.
- A "search bar" is a `<____>` input with a `[#1 Search]` icon button.
- A "card" is just a box with `*` corners.
- A "split button" is two adjacent brackets: `[Save][v]`.

Only create a new widget glyph when composition fails to capture the semantics.

### 2.6 Test the Readability

After designing a widget glyph, place it in a full MarkUI layout. If it visually clashes, is hard to parse at a glance, or breaks alignment, iterate.

### 2.7 Monospace Constraint

Every widget must render correctly in a monospace font at any reasonable terminal width. No reliance on proportional spacing, ligatures, or special rendering.

---

## 3. Nesting Rules

### 3.1 Box Forms

Three equivalent forms for containers, freely mixable:

| Form          | Syntax                    | Best for                       |
|---------------|---------------------------|--------------------------------|
| Full-form     | `+---+` with `|` borders  | Precise layout, side-by-side   |
| Open-right    | Left `|` only, `+--+` end | Quick wireframing, accordion   |
| Prefix-nested | `++`/`+++` headers        | Deep nesting without clutter   |

### 3.2 Nesting Depth

Boxes nest up to **3 levels** deep. Beyond that, readability degrades too much in monospace.

```
+--- Level 1 -------------------------+
| +--- Level 2 ---------------------+ |
| | +--- Level 3 (max) ----------+  | |
| | | content                    |  | |
| | +----------------------------+  | |
| +---------------------------------+ |
+-------------------------------------+
```

### 3.3 What Can Nest

- Boxes inside boxes: yes
- Widgets inside boxes: yes
- Widgets inside widgets: no (widgets are leaf nodes)
- Boxes inside widgets: no

---

## 4. Custom Components

When composition of existing widgets is insufficient, use custom components:

| Pattern           | Purpose                    | Example                         |
|-------------------|----------------------------|---------------------------------|
| `@name`           | Component reference        | `@user-card`                    |
| `<@name>`         | Custom input widget        | `<@datepicker>`                 |
| `+--@Type--+`     | Typed container            | `+--@Modal--- Title ---+`       |
| `*--@Type--*`     | Typed card                 | `*--@ProductCard--*`            |
| `{@slot}`         | Default slot               | Content insertion point         |
| `{@slot:name}`    | Named slot                 | `{@slot:header}`                |

Custom components are defined in separate `.markui` files or named ` ```markui:name ` blocks in `.md` files.

---

## 5. Annotations

Annotations bind to the nearest widget above them. A blank line breaks the binding.

| Prefix | Meaning  |
|--------|----------|
| `(?)`  | Help     |
| `($)`  | Tooltip  |
| `(!)`  | Warning  |
| `(i)`  | Info     |
| `(x)`  | Error    |
| `(v)`  | Success  |

Annotations document constraints and messages **outside** the wireframe's visual structure. They are not modifiers — they don't change widget rendering.
