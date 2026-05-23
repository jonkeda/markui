# RCA-004: Business Rules Rendered as Visible Text

**Date:** 2026-05-22
**Severity:** High
**Artifact:** `.github/skills/markui/SKILL.md`

---

## Observed Output

```
| **Azure Deployments** (visible when Azure) |
```

The LLM embedded a conditional visibility rule — `(visible when Azure)` — as visible text inside the wireframe.

## Expected Output

```
| Azure Deployments                          |
```

The condition from the prompt should be applied silently — show the section (because we're depicting the Azure state) but never render the rule itself as visible text.

## Root Cause Analysis

### Primary: Skill doesn't tell the LLM to keep prompt instructions out of the wireframe

The LLM received something like "show Azure Deployments section (visible when Azure is selected)" in the prompt. Instead of silently applying the condition and just rendering the UI, it echoed the instruction as visible text `(visible when Azure)`.

The skill says "no prose text" but doesn't explicitly state:

> Requirements, conditions, and instructions from the prompt are **not UI elements** — do not render them as text in the wireframe.

### Secondary: `(text)` pattern encourages inline annotations

The LLM sees `(?)` help text, `(!)` warnings, and `(tag)` chips — all using `()`. It's a small leap to `(visible when Azure)` as another kind of parenthesized annotation. RCA-001 partially addressed this but didn't cover the broader category of prompt-echo.

## Fix

Add a core rule: wireframes contain only UI elements. Requirements and conditions from the prompt must never appear as visible text.
