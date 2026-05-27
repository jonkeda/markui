# MarkUI Widget Design Principles

**Date:** 2026-05-27  
**Status:** v4.0 draft  
**Purpose:** Design rationale for MarkUI widget glyphs. This document explains how widgets should be designed and extended. The canonical widget catalog lives in `04-markui-widget-reference.md`.

---

## 1. Role of This Document

Doc 03 owns MarkUI design principles, not the widget catalog.

Use this document when deciding whether a new glyph belongs in the language, whether a pattern is readable enough to standardize, or where a design rationale should live.

Use Doc 04 when looking up the exact syntax for an existing widget.

---

## 2. Core Principles

1. **A widget is a glyph.** A widget is a recognizable ASCII or Unicode pattern that a human can read and the parser can identify.
2. **State is visible.** The current state is encoded directly in the glyph: `[x]`, `( )`, `{on/[off]}`, `[Section ^]`.
3. **No hidden attributes.** MarkUI does not use `key=value` attributes inside wireframes.
4. **No modifiers.** Do not add required, disabled, error, read-only, stretch, or visual-state modifiers to widgets. Show messages with annotations instead.
5. **Composition beats invention.** Combine existing widgets before inventing a new glyph.
6. **Readable first.** If a pattern is hard to read in monospace, it is not a good MarkUI pattern.
7. **The source is the sketch.** The text file should still look like a UI before any renderer processes it.

---

## 3. Glyph Design Rules

### 3.1 The Glyph Must Be Self-Evident

A reader should be able to guess the control from its shape.

Good:

```text
[ ] Subscribe
[x] Accept terms
(*) Daily
( ) Weekly
```

Bad:

```text
[Checkbox]
[Radio selected]
```

The bad examples require hidden semantics in the label. The good examples expose state in the glyph.

### 3.2 Use Existing Bracket Families

New widgets should reuse the existing bracket family that matches their role:

| Family | Design role |
| --- | --- |
| `[ ]` | Actions, checks, compact controls, progress-like controls |
| `[[ ]]` | Active or selected navigation items |
| `< >` | Inputs and dropdown-like entry controls |
| `{ / }` | Switches and compact status values |
| `( )` | Radios, chips, tags, and annotation prefixes |
| `#N` | Numbered icon references |
| `!` | Image placeholders |

Do not introduce new bracket families unless composition with existing ones fails.

### 3.3 Keep State in the Smallest Stable Token

The part that changes should be small and obvious:

```text
[ ] -> [x]
{[on]/off} -> {on/[off]}
[Section v] -> [Section ^]
```

Avoid designs where changing state requires rewriting large text regions.

### 3.4 Avoid Ambiguity

One visible pattern should mean one widget family. If two widgets might use the same pattern, add a disambiguation rule or choose another pattern.

Examples of current disambiguation rules:

- `<Country v>` is a dropdown because it ends with space plus `v`.
- `<New v2>` is a text input value because it does not end with space plus a single chevron.
- `(?) Help` is an annotation because `(?)` is a reserved annotation prefix.
- `(React)` is a chip because it is not one of the reserved annotation prefixes.

---

## 4. Composition Guidance

Before adding a new widget, check whether existing widgets can express the idea:

| Desired control | Prefer composition |
| --- | --- |
| Search bar | `<Search________>` plus `[#1 Search]` when needed |
| Tag input | `(React) (Vue x)` plus `<Add tag____>` |
| Icon action | `[#1 Search]` |
| Card list | `v`, `>`, or `w` list containers |
| Modal behavior | typed container `+--@Modal--- Title ---+` |

New glyphs should only be added when composition loses essential semantics or becomes unreadable.

---

## 5. Containers and Nesting Principles

### 5.1 Boxes Are Layout

Boxes are not decoration. A box means containment, grouping, or a named UI region.

Use a full box when containment needs to be visually precise. Use an open-right box for quick left-anchored sketches. Use prefix nesting when deeply nested full boxes would become noisy.

### 5.2 Limit Nesting Depth

Three levels is the practical maximum for readable ASCII UI.

```text
+--- Level 1 ------------------------+
| +--- Level 2 --------------------+ |
| | +--- Level 3 ----------------+ | |
| | | content                    | | |
| | +----------------------------+ | |
| +--------------------------------+ |
+------------------------------------+
```

If a design needs deeper nesting, split the UI into components or simplify the layout.

### 5.3 Prefer Directional List Containers

Use list-container corners when the object is a repeatable item:

- `v` for vertical lists
- `>` for horizontal lists
- `w` for wrapped lists

Use `+` for structural boxes.

---

## 6. Text and Requirements

Visible wireframes should contain UI text only.

Do not put implementation notes, requirements, validation rules, or business logic in visible UI text. If the UI needs help, warning, info, error, or success copy, use annotations from Doc 04.

Bad:

```text
Password must be validated server-side
```

Good:

```text
Password:
<****________>
(?) Must be at least 8 characters.
```

---

## 7. Unicode Policy

ASCII remains the preferred authoring style because it is portable, keyboard-friendly, and predictable in monospace.

Unicode is valid when it improves readability or when input is copied from a source using box-drawing characters or symbols. Examples include:

- Box drawing: `┌─┐`, `│`, `└─┘`
- Symbols: `✓`, `⚙`
- Emoji when monospace readability is acceptable: `🔍`
- Domain-specific glyphs when they remain readable in monospace

When semantic reuse matters, numbered icons such as `#1` are still preferred because their meaning can be defined outside the wireframe.

---

## 8. Where Details Belong

| Material | Home |
| --- | --- |
| Design rationale | Doc 03 |
| Exact widget syntax | Doc 04 root and chapter docs |
| Full app examples | Doc 05 |
| Parser architecture | Doc 07 |
| VS Code extension behavior | Doc 08 |

If a paragraph explains why MarkUI works this way, keep it here. If it explains how to write a widget, put it in Doc 04.
