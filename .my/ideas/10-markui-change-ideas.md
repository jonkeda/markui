# MarkUI Language Change Ideas

**Date:** 2026-05-24
**Status:** Draft / Discussion

> **Note:** Changes 1, 2, 3, 5 implemented on 2026-05-24.

---

## 1. Simplify Open Box Syntax

**Problem:** The trailing `+` on open-right boxes confuses some LLMs. They struggle with the asymmetric `+---+` / `+--+` pattern.

**Current:**
```
+--- Login ---+
|
|  [Login]
|
+--+
```

**Proposed:** Drop the trailing `+` entirely — a plain `+---` starts a box, `+---` closes it. Open-right boxes must NOT have a trailing `+`:
```
+--- Login ----
|
|  [Login]
|
+----
```

**Considerations:**
- Simpler for LLMs to produce — no need to count or match right-side `+`
- Visually still clear: left edge `|` defines membership
- Full-form boxes (`+---+` / `|...|` / `+---+`) remain valid for grid/table layouts
- Parser change: stop requiring `+` at end of top/bottom border for open-right boxes
- The title-only top border (`+--- Title ---`) already reads naturally without trailing `+`

---

## 2. Card List Containers

**Problem:** Multiple `*---*` cards placed together don't clearly communicate "this is a list." The direction (vertical, horizontal, wrapped) is ambiguous.

**Proposed:** New corner characters on cards indicate list direction:

### Vertical list (items downward)
```
v----- Item -----v
| Content         |
| [Action]        |
v-----------------v
```
`v` corners = vertical list.

### Horizontal list (items rightward)
```
>----- Item ----->
| Content         |
| [Action]        |
>----------------->
```
`>` corners = horizontal list.

### Wrapped list (flow with wrapping)
```
w----- Item -----w
| Content         |
| [Action]        |
w-----------------w
```
`w` corners = wrapped/flow layout.

### Regular card (single, not a list)
```
*----- Item -----*
| Content         |
| [Action]        |
*-----------------*
```
`*` corners = single repeatable card (current behavior).

### Card lists can also be open boxes
```
v--- Product ----
|
|  Widget A
|  $19.99
|  [Add to cart]
|
+----
```

**Considerations:**
- Clear semantic signal for codegen — `v`/`>`/`w` maps directly to flex-direction + wrap
- `*` becomes "this is a card template" without implying repetition direction
- Current `*---*` `*---*` pattern is ambiguous — are they side-by-side? stacked? LLMs guess
- `[...]` for "list continues" may become unnecessary (see #3)
- Corner character table: `+` structural box, `*` card, `v` vertical list, `>` horizontal list, `w` wrapped list

---

## 3. Remove `[...]` List Truncation

**Problem:** `[...]` is a special-case widget that's rarely needed. The list container syntax (idea #2) already implies "this repeats."

**Current:**
```
*--- Product ---*
| Widget A      |
*---------------*
*--- Product ---*
| Widget B      |
*---------------*
[...]
```

**Proposed:** Remove `[...]`. A single card with list corners (`v`/`>`/`w`) implies repetition:
```
v--- Product ---v
| Widget A      |
v---------------v
```

This is one item template — the renderer/codegen knows it repeats.

**Considerations:**
- Fewer special-case widgets to remember
- Frees `[...]` from being reserved (though unlikely to conflict)
- If someone needs to show "3 of 50 items," that's a label: `Showing 3 of 50`
- Could keep `[...]` as a deprecated/ignored alias during transition

---

## 4. Combobox Input Syntax

**Problem:** Dropdowns (`<Select v>`) don't show an editable area. Should comboboxes (editable dropdowns) use underscores to indicate the text field?

**Option A — Underscores before chevron:**
```
<__________ v>       empty combobox
<Apple_____ v>       combobox with value
```

The `_` signals "you can type here" (consistent with `<____>` for text input), the ` v` signals "dropdown available."

**Option B — Keep current, no change:**
```
<Select v>           dropdown (not editable)
<Apple v>            dropdown with value
```

Combobox vs dropdown is a runtime/implementation detail, not a wireframe concern. A wireframe just says "pick a value" — whether the user can also type is a UX decision outside the wireframe.

**Option C — Separate widget:**
```
<______ v>           combobox (editable + dropdown)
<Select v>           dropdown (pick only, not editable)
```

Presence of `_` distinguishes combobox from dropdown.

**Considerations:**
- Option C is probably the clearest: `_` = editable, no `_` = select-only
- LLMs generally understand `<____>` as "type here" — adding ` v>` to that should be intuitive
- Risk: `<New v>` with a short value could be ambiguous (value "New" vs partial input) — but the existing space-before-chevron rule (`<New v2>` = value, `<New v>` = dropdown) still applies
- Option C makes the distinction `<____ v>` = combobox vs `<Select v>` = dropdown purely visual and unambiguous

---

## 5. Remove `*` Card Syntax

**Problem:** Is the `*` card corner actually needed? With list corners (`v`/`>`/`w`) handling repeatable items, what role does `*` play?

**Current roles of `*`:**
- Marks a box as a "card" (repeatable element) vs `+` (structural container)
- Visual distinction in ASCII between layout boxes and content cards

**Arguments for removing:**
- If you want a list, use `v`/`>`/`w` — that's clearer and includes direction
- A standalone card that doesn't repeat is just... a box (`+---+`)
- One fewer corner character to teach LLMs
- `*` is already overloaded (rating `[***]`, password `<****>`)

**Arguments for keeping:**
- `*` signals "this is content, not chrome" — useful for codegen even without list context
- Typed cards (`*--@ProductCard--*`) carry component semantics
- Removing it means `+` does double duty: both structural layout and content cards

**Recommendation:** Remove `*`. Use `+` for standalone cards and `v`/`>`/`w` for lists. Typed containers (`+--@ProductCard--+`) work fine with `+` corners.

---

## 6. Multi-Layout List Items

**Problem:** A list may contain items with different card layouts — not every item looks the same.

**Proposed:** Internal `v`/`>`/`w` borders act as item separators. Each section between separators is a distinct item layout:

### Vertical list with varying items
```
v----- Item 1 -----v
| Content            |
| [Action]           |
v----- Item 2 ------v
| Content            |
v----- Item 3 ------v
| [Action]           |
v--------------------v
```

- The **first** `v---v` opens the list
- Each **middle** `v---v` starts a new item (and closes the previous)
- The **last** `v---v` (no title) closes the list
- Each item between separators has its own layout

### How the parser reads this:

| Border | Meaning |
|--------|---------|
| `v----- Item 1 -----v` | List start + first item header |
| `v----- Item 2 ------v` | End item 1, start item 2 |
| `v----- Item 3 ------v` | End item 2, start item 3 |
| `v--------------------v` | End item 3, close list |

### Horizontal list with varying items
```
>--- Small --->--- Large ----------->--- Small --->
| [#1]        || !==IMG==!          || [#2]        |
|             || Product Name       ||             |
|             || $29.99  [Add]      ||             |
>-------------|>-------------------->|>------------>
```

### Mixed with open-box style
```
v--- Message ----
|
|  #1 Alice
|  Hello, how are you?
|
v--- Message ----
|
|  #2 Bob
|  I'm good, thanks!
|
+----
```

**Considerations:**
- Natural extension of the list container idea — internal borders = item boundaries
- Title on each separator names/types the item template
- Items without titles (`v---v`) are anonymous separators
- The closing border (no title) is unambiguous: it ends the list
- This replaces the need for multiple separate `*---*` cards stacked together
- Each item can have completely different content — no assumption of uniform layout

---

## Summary

| # | Change | Impact | Parser | Breaking |
|---|--------|--------|--------|----------|
| 1 | Drop trailing `+` on open boxes | Low | Minor — relax end-of-border check | No (additive) | **IMPLEMENTED** |
| 2 | Card list corners `v` `>` `w` | Medium | New corner types in box detection | No (additive, `*` still works) | **IMPLEMENTED** |
| 3 | Remove `[...]` | Low | Remove one token pattern | Yes (minor) | **IMPLEMENTED** |
| 4 | Combobox `<____ v>` | Low | Combine input + dropdown detection | No (additive) |
| 5 | Remove `*` cards | Medium | Remove `*` corner detection | Yes (replace with `+` or list corners) | **IMPLEMENTED** |
| 6 | Multi-layout list items | Medium | Internal list borders = item separators | No (new feature on top of #2) |

---

*MarkUI Change Ideas — May 2026*
