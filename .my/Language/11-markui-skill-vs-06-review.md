# SKILL.md vs 06-Widget-Reference Review

**Date:** 2026-05-22  
**Scope:** Comparison of `.github/skills/markui/SKILL.md` against `.my/Language/06-markui-widget-reference.md`  
**Purpose:** Identify gaps, contradictions, and improvements for both documents.

---

## 1. Contradiction: Unicode Box Drawing

**06 says:** "Unicode box drawing (`┌─┐│└┘`) is accepted as input but ASCII is preferred."  
**SKILL says:** "Pure ASCII only — no Unicode box drawing" (Core Rule 6).

**Proposal:** Decide one policy. The SKILL's strict rule is better for LLM generation (prevents ambiguity), but 06 should be updated to match. If the parser does accept Unicode box chars as input, document that as a parser tolerance, not a language feature.

**Action:** Update 06 §6 Box to remove "is accepted as input" or reframe as "the parser normalizes Unicode box chars to ASCII equivalents on input."

**DECISION: ✓ ASCII preferred, unicode allowed.** Both ASCII and Unicode box drawing are valid. ASCII is preferred for human authoring ease, but unicode borders (┌─┐│└┘), emoji icons, unicode checkmarks/radio symbols etc. are permitted. We don't fight model knowledge — ASCII was for keyboard entry by humans. Update both SKILL and 06 to reflect this policy.

---

## 2. Missing from SKILL: Split Button

**06 has:**
```
[Save][v]
```
> Two brackets touching: action + dropdown trigger.

**SKILL:** Not mentioned anywhere. The `[ ]` Content Rules table doesn't account for adjacent brackets.

**Proposal:** Add Split Button to SKILL under Widgets or as a row in the `[ ]` Content Rules table. This is a distinct interaction pattern that an LLM won't generate if it doesn't know about it.

**DECISION: ✓ ADD to SKILL.**

---

## 3. Missing from SKILL: Icon Button

**06 has:**
```
[#1 Search]
[#2 Settings]
```

**SKILL:** Icons inside buttons are implied by the bracket system but never shown as a pattern. An LLM could guess this, but explicit examples prevent `[Search #1]` (icon at wrong position).

**Proposal:** Add one example under the Button/Widgets section showing icon-in-button syntax.

**DECISION: ✓ ADD to SKILL.**

---

## 4. Missing from SKILL: Label

**06 has:** "Plain text label" as an explicit widget.

**SKILL:** Labels are used everywhere (e.g., "Username:" in examples) but never called out as a widget type. This is fine for generation — LLMs naturally produce labels. No action needed unless the parser needs to distinguish labels from headings.

**Proposal:** Low priority. Consider a one-line mention: "Plain text = label."

**DECISION: ✓ ADD to SKILL.** One-line mention.

---

## 5. Missing from SKILL: Link Constraint

**06 says:** `&` prefix is "line-start only."

**SKILL says:** `&Click here` — shows the prefix but doesn't state the line-start constraint.

**Proposal:** Add "line-start only" after the `&Click here` example. Without this, an LLM might generate `Click &here for more` mid-line.

**DECISION: ✓ CHANGED per doc 12.** Link syntax changed from `&Click here` to `_Click here_` (underscore-wrapped). No longer line-start only — underscores can appear anywhere.

---

## 6. Missing from SKILL: File Drop Zone

**06 has a full example:**
```
+- - - - - - - - - - - - - -+
|                            |
|   #1                       |
|   Drag files here          |
|   or [Browse]              |
|                            |
+- - - - - - - - - - - - - -+
```

**SKILL:** Mentions `- - -` dashed border = drop zone in the Box section but shows no example.

**Proposal:** Add a small File Drop Zone example under Containers or as a pattern. Drop zones are common enough in forms that LLMs should know the syntax.

**DECISION: ✗ SKIP.** Edge case, not needed in SKILL.

---

## 7. Missing from SKILL: Grid Layout

**06 has:**
```
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
```

**SKILL:** Shows tables and dock layouts but never explicitly shows a grid. The syntax is implied by box adjacency, but a grid is a distinct layout concept.

**Proposal:** Add one grid example. Without it, LLMs may use tables for grid layouts (semantically wrong) or not know how to lay out equal-width columns.

**DECISION: ✓ ADD to SKILL.**

---

## 8. Missing from SKILL: Dock Layout

**06 has:**
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

**SKILL:** The Settings example uses a similar structure but dock layout is never named or explained as a pattern.

**Proposal:** Add a Dock Layout example or at least name the pattern. This is the most common app shell layout and LLMs should produce it reliably.

**DECISION: ✓ ADD to SKILL.**

---

## 9. Missing from SKILL: Splitter + Scroll Combined

**06 has:**
```
+---------.------------------------------+
| Sidebar # Main Content                 #
| [Nav1]  # Item 1                       #
| [Nav2]  # Item 2                       #
+---------.##############################+
```

**SKILL:** Documents splitters (`.`) and scrollbars (`#`) separately but never shows them combined on the same border.

**Proposal:** Add one combined example. The junction-point convention (`.` at corners, `#` on body) is non-obvious.

**DECISION: ✓ ADD to SKILL.**

---

## 10. Missing from SKILL: Empty State Pattern

**06 has:**
```
+------------------------------+
|                              |
|        No items found        |
|        [Add Item]            |
|                              |
+------------------------------+
```

**SKILL:** No mention of empty states.

**Proposal:** Add as a pattern. Empty states are a standard UI pattern and LLMs often forget to wireframe them unless prompted.

**DECISION: ✗ REMOVE from widget design.** Not a widget/syntax concern — it's a design pattern that belongs in guidance, not the language spec.

---

## 11. Missing from SKILL: Inline Alert vs Annotation

**06 distinguishes:**
- **Annotations** (§3) — bound to the widget above: `(?) help`, `($) tooltip`, etc.
- **Inline Alerts** (§8) — standalone messages: `(i) This is info.`

**SKILL:** Documents annotations with binding behavior but doesn't clarify that the same prefixes can also be used standalone (as inline alerts, unbound to any widget).

**Proposal:** Add a note: "Without a widget above (or after a blank line), annotation-prefixed lines become standalone inline alerts." This prevents LLMs from thinking `(i)` is only valid below a widget.

**DECISION: DEFERRED.**

---

## 12. Missing from SKILL: Separator Detail

**06 says:** "3+ dashes on a line by itself."

**SKILL:** Shows `---` as separator but doesn't specify the "3+" rule or the "by itself" constraint. A line like `--- some text ---` could be ambiguous.

**Proposal:** Add: "3+ dashes on a line by itself. Not a border — no `+` at ends."

**DECISION: DEFERRED.**

---

## 13. Missing from SKILL: Form Field Convention

**06 documents a layout convention:**
```
Full Name:
<________________________>
(?) First and last name.
```

**SKILL:** Uses this pattern in examples but never names it.

**Proposal:** Low priority. The pattern is self-evident in examples. Could add a one-line note: "Label + input + annotation on consecutive lines = form field."

**DECISION: ✓ OK.** Add one-line note.

---

## 14. Missing from 06: `[ ]` Content Rules (Priority Table)

**SKILL has** a disambiguation table that resolves what `[]` content means, checked in priority order. This is one of the most useful additions in SKILL.

**Proposal:** Backport this table to 06. Without it, the spec is ambiguous about how to distinguish `[x]` (checkbox) from `[x]` (button labeled "x"). The priority order makes it unambiguous.

**DECISION: ✓ ADD to 06.**

---

## 15. Missing from 06: Core Rules

**SKILL has 7 explicit rules** (no modifiers, ASCII only, example data not placeholders, etc.) that 06 scatters or omits.

**Proposal:** Add a "Core Rules" or "Design Rules" section to 06. These constraints define the language's philosophy and prevent parser ambiguity.

**DECISION: ✓ ADD to 06.** Note: ASCII is preferred but unicode is allowed (per decision #1).

---

## 16. Missing from 06: Chevron Position Rule

**SKILL says:** "Chevron is always the **first character** after `<` — never at the end. `< text v >` is wrong."

**Proposal:** Add this to 06 §5 Dropdown. It's a critical disambiguation rule.

**DECISION: ✓ CHANGED per doc 12.** Chevron moves to trailing position: `<Select v>` / `<Select ^>`. Update 06 accordingly.

---

## 17. Missing from 06: Annotation Exclusivity Rule

**SKILL says:** "These 6 prefixes — `(?)` `($)` `(!)` `(i)` `(x)` `(v)` — are the **only** annotations. Any other `(text)` is a tag/chip widget."

**Proposal:** Add this to 06 §3 Annotations. Without it, the boundary between annotations and chips is ambiguous.

**DECISION: ✓ ADD to 06.**

---

## 18. Missing from 06: Border Character Restrictions

**SKILL says:** "Only these characters on borders. Do not use `=`, `~`, or other characters."

**Proposal:** Add to 06 §6 Box Characters table or as a rule. Prevents creative border decoration that would break parsing.

**DECISION: ✓ ADD to 06.** But allow unicode border characters (┌─┐│└┘) as valid alternatives per decision #1.

---

## 19. Missing from 06: "Only UI Elements Visible" Rule

**SKILL Core Rule 7:** "Never render prompt instructions, requirements, conditions, or business rules as text in the wireframe. Apply them silently."

**Proposal:** Add to 06 as a design rule. This is critical for LLM generation — without it, models embed requirements text as wireframe labels.

**DECISION: ✓ ADD to 06.**

---

## Summary: Decisions

### ADD to SKILL

| # | Item | Notes |
|---|------|-------|
| 2 | Split Button | `[Save][v]` adjacent brackets |
| 3 | Icon Button example | `[#1 Search]` |
| 4 | Label mention | One-line: "Plain text = label" |
| 7 | Grid Layout example | Box grid, not table |
| 8 | Dock Layout pattern | Header/sidebar/main/footer |
| 9 | Splitter+Scroll combined | `.` at junction, `#` on body |
| 13 | Form Field convention | One-line note |

### ADD to 06

| # | Item | Notes |
|---|------|-------|
| 14 | `[]` Content Rules table | Backport from SKILL |
| 15 | Core Rules section | ASCII preferred, unicode allowed |
| 17 | Annotation exclusivity | Only 6 prefixes, rest = chip |
| 18 | Border char restrictions | Named chars only + unicode borders OK |
| 19 | "Only UI elements" rule | No business rules as wireframe text |

### CHANGED (per doc 12)

| # | Item | New syntax |
|---|------|------------|
| 1 | Unicode policy | ASCII preferred, unicode allowed everywhere |
| 5 | Link | `_Click here_` (was `&Click here`) |
| 16 | Chevron position | Trailing: `<Select v>` (was `<v Select>`) |

### SKIPPED / DEFERRED

| # | Item | Reason |
|---|------|--------|
| 6 | File Drop Zone | Edge case |
| 10 | Empty State | Design pattern, not widget syntax |
| 11 | Inline Alert vs Annotation | Deferred |
| 12 | Separator detail | Deferred |
