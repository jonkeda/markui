# MarkUI vs LLM Priors: Syntax Alignment Review

**Date:** 2026-05-23
**Trigger:** Models persistently generate `< combo ^ >` (chevron at end) instead of `<^ combo>` (chevron first).
**Question:** Where does MarkUI fight deeply entrenched model knowledge, and should the language yield?

---

## Principle

A wireframing DSL used via LLM skill has a unique constraint: **the skill competes with pretraining**. Every convention that contradicts what models "already know" from millions of training examples creates friction. The skill must override that knowledge every time, and sometimes it loses.

Signs a convention is fighting priors:

- Models consistently generate the wrong form even with the skill loaded
- The "wrong" form mirrors visual appearance of the real widget
- The convention contradicts an established ASCII/markdown/code convention

The question isn't "is our syntax logical?" — it's "will models reliably produce it?"

---

## 1. Dropdown Chevron Position — CRITI	CAL

**Current:** `<v Select item>` / `<^ Select item>` — chevron FIRST
**Models generate:** `<Select item v>` / `< combo ^ >` — chevron LAST

**Why models do this:**

- Visual appearance: real dropdowns show `[text ▼]` — label then arrow
- HTML/CSS: the caret is an `::after` pseudo-element (trailing)
- Every UI framework renders: `| Selected value    ▾ |`
- Thousands of ASCII wireframe examples in training data use trailing indicator

**How entrenched:** Extremely. This mirrors visual reality. Models are essentially drawing what they see.

**Proposal:** Change to trailing chevron: `<Select item v>` / `<Select item ^>`

**Tradeoff:** The "first char determines type" rule (`v`/`^` = dropdown, `@` = custom, `_` = text) becomes a "last char" or "presence of v/^" rule. Parsing is slightly more complex but unambiguous — `v>` or `^>` at end-of-input means dropdown.

**Alternative:** Use a different delimiter entirely: `{v Select item}` — but this conflicts with toggles/badges. Or `[v Select item]` — but this conflicts with buttons.

**Recommendation: CHANGE.** This is the #1 skill failure point. Trailing chevron matches visual reality and model priors.

**DECISION: ✓ CHANGE.** Adopt trailing chevron.

---

## 2. Breadcrumb Separator — HIGH

**Current:** `Home \ Products \ Electronics`
**Models generate:** `Home > Products > Electronics` or `Home / Products / Electronics`

**Why models do this:**

- Web conventions universally use `>` or `/` for breadcrumbs
- `\` is escape character (JS, C, regex), Windows path separator, or LaTeX command
- Bootstrap, Material UI, every design system uses `>` or `/`
- Screen readers announce breadcrumb items with "greater than"

**How entrenched:** Very. `>` for breadcrumbs is near-universal in web/UI contexts.

**Proposal:** Change to `>` separator: `Home > Products > Electronics`

**Tradeoff:** `>` has no conflicting meaning in MarkUI currently. In markdown it's blockquote — but MarkUI doesn't use markdown blockquotes (headings use `#` but `>` is free).

**Recommendation: CHANGE.** Zero ambiguity, matches universal convention.

**DECISION: ✓ CHANGE to `>`.** Universal, unambiguous in MarkUI context.

---

## 3. Link Prefix `&` — HIGH

**Current:** `&Click here for more`
**Models generate:** `[Click here](url)`, `_Click here_`, or just underlined-looking text

**Why models do this:**

- `&` = HTML entity prefix (`&amp;`), C address-of, logical AND, "and"
- Markdown links `[text](url)` are the most trained-on link syntax
- No major wireframing convention uses `&` for links
- Models have zero prior association between `&` and hyperlinks

**How entrenched:** Very. `&` has strong competing meanings. No wireframe convention reinforces it.

**Proposal options:**

| Option             | Example               | Pros                  | Cons                               |
| ------------------ | --------------------- | --------------------- | ---------------------------------- |
| Keep `&`         | `&Click here`       | Unique, no conflicts  | Models never generate it naturally |
| Use `~`          | `~Click here`       | Suggests underline    | `~` = strikethrough in markdown  |
| Use `>`          | —                    | —                    | Conflicts with breadcrumb proposal |
| Use markdown-style | `[Click here](url)` | Universal recognition | Conflicts with button `[...]`    |
| Underscores        | `_Click here_`      | Visual underline      | Could be confused with input       |

**Recommendation: Keep `&` but accept this is a "skill must teach" item.** None of the alternatives are clean. The `&` is at least unambiguous in parsing (line-start, followed by text, no closing bracket). Models can learn it because there's no "competing valid syntax" — they just need the hint.

**Alternative recommendation:** If we want zero-friction, use a label pattern: links are just plain text with context. But this loses the ability to distinguish links from labels in the wireframe.

**DECISION: ✓ CHANGE to underscores.** `_Click here_` — visual underline matches the universal affordance for links. Models naturally generate this form.

Parsing rule: `_text_` at any position (not just line-start) where underscores wrap non-underscore text = link. Distinct from input underscores `<___>` which are inside angle brackets and represent empty editable space.

---

## 4. Accordion/Expander `[v]`/`[^]` Chevron Position — MEDIUM

**Current:** `[v Section 2]` (collapsed), `[^ Section 1]` (expanded)
**Models sometimes generate:** `[Section 2 v]` or `> Section 2` / `v Section 1`

**Why models do this:**

- Same trailing-indicator pattern as dropdowns
- Many wireframe conventions use `▶` / `▼` prefix or suffix
- HTML `<details>` and tree views use leading indicators, so this is split

**How entrenched:** Moderate. Unlike dropdowns, accordion chevrons are more varied in training data. Some conventions DO use leading chevron (`▼ Section`). The `[v ...]` form is a button with content — which is actually quite natural.

**Proposal:** Align with dropdown decision. If dropdown moves to trailing, accordion should too: `[Section 2 v]` / `[Section 1 ^]`.

**Tradeoff:** The `[ ]` Content Rules table currently checks for `v`/`^` as a button disambiguation. Moving to trailing means the content rule needs to check last character before `]`.

**Recommendation: CHANGE if dropdown changes.** Consistency between dropdown and accordion chevron position is more important than either individual choice.

**DECISION: ✓ CHANGE.** Trailing chevron for consistency with dropdown.

---

## 5. Toggle Syntax `{[on]/off}` — MEDIUM

**Current:** `{[on]/off}` (on state), `{on/[off]}` (off state)
**Models generate:** Various — `[ON | off]`, `(on/off)`, `[toggle: on]`, `{on|off}`

**Why models do this:**

- The `{[on]/off}` syntax is unique to MarkUI — no prior art
- `|` as separator is more common than `/` in "choice" contexts
- The `[ ]` inside `{ }` for marking active state is a novel nesting
- Models often don't know which side gets `[ ]`

**How entrenched:** Moderate. There's no strong universal convention for ASCII toggles, so models are guessing. The MarkUI syntax IS logical — it's just novel.

**Proposal options:**

| Option         | On state             | Off state          | Pros                    | Cons                               |
| -------------- | -------------------- | ------------------ | ----------------------- | ---------------------------------- |
| Current        | `{[on]/off}`       | `{on/[off]}`     | Clear active state      | Novel, models struggle             |
| Pipe separator | `{[on]\|off}`       | `{on\|[off]}`     | `\|` is more "or"-like | Still novel                        |
| Slider-like    | `[*on--off]`       | `[on--*off]`     | Visual slider           | Conflicts with slider `[===...]` |
| Simple         | `{on}` / `{off}` | Single state shown | Simple                  | Loses toggle visual                |

**Recommendation: KEEP.** No strong alternative exists in model priors. The `{[active]/inactive}` pattern is learnable because there's no competing convention that models default to. Models generate varied wrong answers (no single dominant prior), meaning the skill just needs to be clear. The fix is better examples, not syntax change.

**DECISION: ✓ KEEP.**

---

## 6. Image Placeholder `!==IMG==!` — LOW-MEDIUM

**Current:** `!==IMG==!` (simple) or multi-line with `!` bookends
**Models generate:** `[Image]`, `[IMG]`, `![placeholder]`, `{image}`, or just `IMG`

**Why models do this:**

- Markdown: `![alt](url)` — leading `!` for images
- Many wireframe tools use `[Image placeholder]` or `{img}`
- The `!==IMG==!` with `=` padding is unique to MarkUI
- Square brackets `[IMG]` is the most "natural" guess

**How entrenched:** Moderate. Models know `!` relates to images (from markdown) but not the `!==...==!` form.

**Proposal:** The `!` bookend actually leverages markdown association (`!` = image). The issue is the `==` padding. Models might do better with just `![IMG]!` or `!IMG!`.

**Recommendation: KEEP.** The multi-line form with `!` borders is visually clear. Models can learn `!==IMG==!` because the `!` does trigger image association. The errors are varied (no single dominant alternative), so the skill can override.

**DECISION: ✓ KEEP.**

---

## 7. Icon `#N` Conflicts with Heading `#` — LOW-MEDIUM

**Current:** `#1 Settings` = icon, `# Settings` = heading
**Models sometimes generate:** Icons as emoji, text descriptions, or confuse with headings

**Why models do this:**

- `#` is overwhelmingly "heading" in markdown (billions of examples)
- `#` is "comment" in Python/bash/YAML
- `#` is "id selector" in CSS
- The distinction (digit after `#` = icon, space after `#` = heading) is subtle

**How entrenched:** High for `#` = heading. Low for icon representation (no standard exists).

**Proposal:** The disambiguation rule (digit immediately after `#` = icon) is actually clean and parseable. The conflict is more theoretical than practical because icons appear inline while headings are line-start + space.

**Recommendation: KEEP `#N` but ALLOW unicode/emoji as alternative.**

Models naturally reach for emoji (🔍 ⚙️ 🏠) when representing icons. The "pure ASCII" rule was motivated by human typing convenience, not a hard language constraint. Since the primary authors are now LLMs, fighting emoji is counterproductive.

**DECISION: ✓ ALLOW UNICODE.** Policy change:
- `#N` remains the preferred/canonical icon syntax (parseable, referenceable)
- Emoji and unicode symbols (🔍, ⚙️, ←, →, ✓, ✕) are **valid** in wireframes
- Skill should say "prefer `#N` for referenceable icons, emoji acceptable for decoration"
- This relaxes Core Rule 6 ("Pure ASCII only") to "Prefer ASCII; unicode/emoji permitted"

---

## 8. Badge `{3}` vs Code/Template Associations — LOW

**Current:** `{3}` = badge count, `{!}` = badge alert
**Models generate:** Usually correct! Occasionally `(3)` or `[3]`.

**Why this works:** Badges are a "notification dot/count" — the curly braces visually suggest a bubble/circle. There's no competing convention that's dominant. Models learn this quickly.

**Recommendation: KEEP.** Already fairly aligned with model intuition.

**DECISION: ✓ KEEP.**

---

## 9. Tree View `+`/`-` for Collapsed/Expanded — LOW

**Current:** `+` = collapsed, `-` = expanded/leaf
**Models generate:** Often correct! Sometimes `▶`/`▼` or `>`/`v`.

**Why this mostly works:** Windows Explorer (old), many terminal tools, and GUI tree widgets use `+`/`-`. This is actually well-established in older UI conventions. Models trained on enough examples get this right.

**Recommendation: KEEP.** Well-aligned with prior art.

**DECISION: ✓ KEEP.**

---

## Summary: Final Decisions

### CHANGE (accepted)

| # | Widget | Old | New | Reason |
|---|--------|-----|-----|--------|
| 1 | Dropdown (closed) | `<v Select>` | `<Select v>` | Trailing chevron matches visual reality |
| 1 | Dropdown (open) | `<^ Select>` | `<Select ^>` | Consistency |
| 2 | Breadcrumb | `Home \ Prod` | `Home > Prod` | Universal web convention |
| 3 | Link | `&Click here` | `_Click here_` | Underscore = underline, models generate this |
| 4 | Accordion (collapsed) | `[v Section]` | `[Section v]` | Match dropdown |
| 4 | Accordion (expanded) | `[^ Section]` | `[Section ^]` | Match dropdown |
| 7 | Icons/Unicode | ASCII only | ASCII preferred, unicode allowed | Don't fight emoji generation |

### KEEP (unchanged)

| # | Widget | Current | Reason to keep |
|---|--------|---------|----------------|
| 5 | Toggle | `{[on]/off}` | No dominant competing convention |
| 6 | Image | `!==IMG==!` | `!` leverages markdown association |
| 7 | Icons `#N` | `#1` `#2` | Stays as canonical form |
| 8 | Badges | `{3}` | Models already get this right |
| 9 | Tree `+`/`-` | Standard | Matches prior art |

---

## Impact on SKILL.md and 06

All changes accepted. Required updates:

1. **`[ ]` Content Rules table** — chevron detection moves from "first char" to "last char before `]`"
2. **`< >` Input type detection** — becomes:
   - First char `@` → custom input
   - Last char before `>` is ` v` or ` ^` → dropdown
   - Otherwise → text input
3. **Accordion/Expander** — flip all chevron positions in examples
4. **Breadcrumb** — `\` → `>`
5. **Link** — `&text` → `_text_`
6. **Core Rule 6** — "Pure ASCII only" → "Prefer ASCII; unicode/emoji permitted"
7. **Icon section** — add note that emoji are acceptable alternatives

### Parsing Impact (final)

```
<@ ...>        → custom input (first char `@`)
<... v>        → dropdown closed (last char before `>` is `v` preceded by space)
<... ^>        → dropdown open
<___...>       → text input (underscores)
<other>        → text input with value
```

```
[... v]        → accordion/expander collapsed (last char before `]` is `v` preceded by space)
[... ^]        → accordion/expander expanded
[x] [ ] [-]    → checkbox (single char)
[/] [\]        → spinner (single char)
[===...]       → slider/progress (only = and .)
[***.]         → rating (only * and .)
[...]          → list truncation
[- N +]        → stepper
[other]        → button
```

```
_text_         → link (underscores wrapping non-underscore text, outside < >)
```

All unambiguous. The `v`/`^` trailing detection requires a space before it to distinguish from content like `<New v2>` (text input with value "New v2") vs `<Select v>` (dropdown). Rule: ` v>` or ` ^>` at end = dropdown.

---

## Decision Framework

For each widget, ask:

1. **Do models generate the wrong form >30% of the time?** → Strong signal to change
2. **Is there a single dominant alternative?** → Change to that form
3. **Do models generate varied wrong answers?** → Skill can teach (no single prior to fight)
4. **Does the current syntax conflict with a universal convention?** → Change
5. **Is the current syntax novel but unambiguous?** → Keep, skill handles it
