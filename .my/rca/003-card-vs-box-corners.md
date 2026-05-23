# RCA-003: Card Corners Used Instead of Box Corners

**Date:** 2026-05-22
**Severity:** Medium
**Artifact:** `.github/skills/markui/SKILL.md`

---

## Observed Output

```
| *----------------------------------------* |
| |  [ Test Connection                    ] | |
| |        Checking connection...           | |
| *----------------------------------------* |
```

The LLM used `*` corners for a nested box (container inside a container).

## Expected Output

```
| +----------------------------------------+ |
| |  [ Test Connection                    ] | |
| |        Checking connection...           | |
| +----------------------------------------+ |
```

Nested structural boxes use `+` corners.

## Root Cause Analysis

### Primary: Skill doesn't clearly separate `*` (repeatable list item) from `+` (structural box)

The skill says:

> `*` corners = card/repeatable element

And the Cards section shows:

```
*--- Product ---*  *--- Product ---*  [...]
```

But the **distinction rule** — `*` is for items that repeat in a list, `+` is for structural containers — is not stated explicitly. The LLM saw `*` as "an alternative box corner" and used it for a one-off nested container.

### Secondary: No negative example

Nothing says "do not use `*` for structural/singleton containers." The LLM has no signal that `*` carries semantic meaning (repeatable) beyond being a visual variant.

## Fix

Clarify in the skill that `*` means "this box repeats" and `+` means "structural container."
