# RCA-001: Descriptive Text Rendered as Tags

**Date:** 2026-05-22
**Severity:** Medium
**Artifact:** `.github/skills/markui/SKILL.md`

---

## Observed Output

```
+============================================================+
| TITLE BAR                                                  |
+------------------------------------------------------------+
| BodyCam  v1.2.3     #glasses 85% #bolt   [ Settings ]      |
|  (bold)  (faint)     (tap to navigate)       (gear)        |
```

## Defects (4)

| # | Problem | What it produces | Correct alternative |
|---|---------|-----------------|---------------------|
| 1 | `(bold)` `(faint)` `(tap to navigate)` `(gear)` — LLM used `(text)` as inline comments/descriptions | Parsed as **tag/chip** widgets | Don't exist. MarkUI has no inline comments. Icon meaning goes in `.md` context. |
| 2 | `#glasses` `#bolt` — named icons | Not valid. `#` + non-digit is a heading or undefined | `#1` `#2` (numbered icons) |
| 3 | `+====+` — equals-sign border | Not a defined border character | `+----+` |
| 4 | `[ Settings ]` — spaces inside brackets | Valid (parses as button) but unconventional | `[Settings]` or `[#3 Settings]` |

## Root Cause Analysis

### Primary: `(text)` is ambiguous between tag and description

The skill lists `(tag)` as a widget and `(?)` as an annotation, but never explicitly states:

> **`(text)` with arbitrary text is always a tag/chip — never a comment or description.**

The LLM treated `()` as a general-purpose "annotation about the widget above" because:
- The annotation section shows `(?) ...` `(!) ...` etc. — all start with `(`
- The LLM generalized: "parentheses = description" and dropped the prefix character
- Nothing in the skill says "only these 6 single-char prefixes are valid annotations"

### Secondary: `#N` icon constraint not enforced

The skill says `#1` `#2` and "meaning defined in .md context" — but it shows `#1 Settings` as an example, which looks like `#name` is acceptable. The LLM generalized to `#glasses`, `#bolt`.

The rule **`#` + digit only** is stated in the bracket table (`#N`) but not reinforced in the icon section.

### Tertiary: No "what NOT to do" section

The skill is entirely affirmative (do this). It has no negative examples. LLMs benefit from explicit anti-patterns, especially for the `()` ambiguity.

## Fixes

### Fix 1: Add anti-pattern to annotations section

After the annotation examples, add:

```markdown
Only these 6 prefixes are valid annotations. `(text)` without a prefix character is a **tag/chip**, not a comment:

- `(bold)` = tag named "bold" — NOT a description
- `(gear)` = tag named "gear" — NOT an icon label
```

### Fix 2: Clarify icon numbering rule

Change the icon line in Data Display from:

```
#1 Settings              icon (meaning in .md context)
```

to:

```
#1  #2  #3               icons (digit only, meaning in .md context)
```

And add:

```markdown
Icons are `#` + digit. `#settings` or `#gear` is NOT valid — use `#1` and define meaning outside the wireframe.
```

### Fix 3: Document invalid border characters

Add to the box section:

```markdown
Only `+`, `-`, `|`, `.`, `#`, `*` are valid border characters. Do not use `=`, `~`, or other characters for borders.
```

## Impact

Without these fixes, the LLM will continue to:
- Use `(description)` as inline comments, creating phantom tag widgets
- Use `#name` for icons instead of `#N`
- Invent border characters
