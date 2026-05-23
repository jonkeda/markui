# RCA-002: Dropdown Chevron Placed at Suffix Position

**Date:** 2026-05-22
**Severity:** Medium
**Artifact:** `.github/skills/markui/SKILL.md`

---

## Observed Output

```
|  Chat Model                                |
|  < gpt-4o                   v > Status     |
```

The LLM placed the chevron `v` at the end of the text (suffix), treating `<` and `>` as generic angle brackets with a `v` indicator near the closing `>`.

## Expected Output

```
|  Chat Model                                |
|  <v gpt-4o                   >  Status     |
```

Chevron `v` immediately after `<` (prefix position).

## Root Cause Analysis

### Primary: Skill shows the rule but doesn't explain WHY prefix matters

The skill states:

```
<v Select item>          collapsed (v = closed)
```

But the LLM reverted to the more common suffix pattern (`<text v>`) because:

1. **Suffix chevrons are the dominant pattern** in real-world UIs and in pre-training data (HTML `<select>`, Material Design, etc.)
2. The skill shows the correct example but doesn't call out the prefix position explicitly enough — it's easy to read `<v Select item>` as "the v is just part of the text"
3. The note says "v/^ at the start (prefix position)" only in 06 (the reference doc), not in the skill

### Secondary: First-char disambiguation rule is buried

The skill has this critical rule only in the full reference doc (06), not in the skill itself:

> First char after `<` determines input type: `v`/`^` = dropdown, `@` = custom input, `_` = text input.

Without this rule, the LLM doesn't understand that character position is structural, not decorative.

## Fix

Add the first-char disambiguation rule to the skill's Dropdown section, making prefix position explicit and contrasting with the wrong pattern.
