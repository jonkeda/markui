# MarkUI Widget Reference: Buttons and Actions

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Button

A button represents a command or action. Use it for clear user-triggered commands such as save, cancel, delete, submit, or apply.

Syntax:

- `[Label]`
- Anything in square brackets that does not match a higher-priority widget is a button.

Example:

```text
[Save]
```

```markui
[Save]
```

Button row:

```text
[Save]  [Cancel]  [Delete]
```

```markui
[Save]  [Cancel]  [Delete]
```

Notes:

- Keep button labels short.
- Use buttons for commands, not state display.

---

## Icon Button

An icon button combines a numbered icon reference with an action label.

Syntax:

- `[#N Label]`
- `N` is a digit. Define the icon meaning in surrounding documentation.

Example:

```text
[#1 Search]  [#2 Settings]  [#3 Home]
```

```markui
[#1 Search]  [#2 Settings]  [#3 Home]
```

Unicode alternative:

```text
⚙ Settings   ✓ Complete
```

```markui
⚙ Settings   ✓ Complete
```

Notes:

- Prefer `#N` when semantic reuse matters.
- Unicode icons are allowed when readability matters more than numbered icon reuse.

---

## Split Button

A split button combines a primary action with an attached dropdown trigger.

Syntax:

- `[Action][v]` collapsed
- `[Action][^]` expanded

Collapsed:

```text
[Save][v]
```

```markui
[Save][v]
```

Expanded:

```text
[Save][^]
```

```markui
[Save][^]
```

Notes:

- The two bracketed controls must touch with no space.
- Use for action plus menu, not for ordinary adjacent buttons.

---

## Previous and Next Buttons

Previous and next buttons are compact navigation controls.

Syntax:

- `[<]`
- `[>]`

Example:

```text
[<] Previous    Next [>]
```

```markui
[<] Previous    Next [>]
```

Pagination usage:

```text
[<] 1  2  [[3]]  4  5 [>]
```

```markui
[<] 1  2  [[3]]  4  5 [>]
```

Notes:

- Use `[[N]]` for the active page.
- `[<]` and `[>]` are parsed before ordinary buttons.

