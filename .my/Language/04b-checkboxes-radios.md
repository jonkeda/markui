# MarkUI Widget Reference: Checkboxes and Radios

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Checkbox

A checkbox represents an independent boolean or mixed selection state.

Syntax:

- `[ ]` unchecked
- `[x]` checked
- `[-]` mixed or indeterminate

All states:

```text
[ ] Unchecked
[x] Checked
[-] Mixed
```

```markui
[ ] Unchecked
[x] Checked
[-] Mixed
```

Checklist:

```text
[x] Accept terms
[ ] Subscribe to newsletter
[-] Select all
```

```markui
[x] Accept terms
[ ] Subscribe to newsletter
[-] Select all
```

Notes:

- Use checkboxes for independent choices.
- Use radio buttons when exactly one option in a group should be selected.

---

## Radio Button

A radio button represents one choice in a mutually exclusive group.

Syntax:

- `(*)` selected
- `( )` unselected

States:

```text
(*) Selected
( ) Unselected
```

```markui
(*) Selected
( ) Unselected
```

Radio group:

```text
(*) Daily digest
( ) Weekly summary
( ) Real-time
```

```markui
(*) Daily digest
( ) Weekly summary
( ) Real-time
```

Notes:

- Consecutive radio lines form a group.
- Keep one selected option in ordinary radio groups.

