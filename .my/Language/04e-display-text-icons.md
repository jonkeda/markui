# MarkUI Widget Reference: Display, Text, Icons, Controls, Tags

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Headings

Headings label sections and screens.

Syntax:

- `#` large heading
- `##` medium heading
- `###` small heading

Example:

```text
# Page Title
## Section Heading
### Subsection
```

```markui
# Page Title
## Section Heading
### Subsection
```

---

## Label

A label is plain text that does not match another widget pattern.

Example:

```text
This is a plain text label
Status: Active
```

```markui
This is a plain text label
Status: Active
```

---

## Link

A link is underscore-wrapped text outside an input.

Example:

```text
_Forgot password?_  _Create account_
```

```markui
_Forgot password?_  _Create account_
```

Notes:

- Underscores inside `< >` are input edit area, not links.

---

## Icon

Numbered icons are reusable semantic references. Unicode symbols are also valid when the symbol itself is meaningful.

Numbered icons:

```text
#1 Home   #2 Settings   #3 Profile
```

```markui
#1 Home   #2 Settings   #3 Profile
```

Unicode icons:

```text
✓ Saved   ⚙ Settings   🔍 Search
```

```markui
✓ Saved   ⚙ Settings   🔍 Search
```

Notes:

- Define `#N` meanings in surrounding Markdown.
- Prefer numbered icons for portable semantic references.

---

## Badge

A badge displays a compact count or alert marker.

Example:

```text
Messages {3}    Alerts {!}
```

```markui
Messages {3}    Alerts {!}
```

---

## Separator

A separator divides sections.

Syntax:

- `---` on a line by itself

Example:

```text
First section
---
Second section
```

```markui
First section
---
Second section
```

---

## Spinner

A spinner represents loading or indeterminate progress.

Example:

```text
[/] Loading...
```

```markui
[/] Loading...
```

---

## Tag and Chip

A tag or chip is parenthesized text that is not a reserved annotation prefix.

Example:

```text
(React) (TypeScript) (Node.js)
```

```markui
(React) (TypeScript) (Node.js)
```

---

## Removable Chip

A removable chip uses trailing ` x` before the closing parenthesis.

Example:

```text
(React) (Vue x) (Angular x)
```

```markui
(React) (Vue x) (Angular x)
```

Notes:

- `(?)`, `($)`, `(!)`, `(i)`, `(x)`, and `(v)` are reserved annotation prefixes.
- Other parenthesized text is a chip or tag.

---

## Toggle

A toggle represents a two-state switch. The active state is wrapped in square brackets inside the toggle.

On:

```text
Dark mode  {[on]/off}
```

```markui
Dark mode  {[on]/off}
```

Off:

```text
Notifications  {on/[off]}
```

```markui
Notifications  {on/[off]}
```

---

## Slider

A slider represents an adjustable range value.

```text
Volume: [=====.....] 50%
```

```markui
Volume: [=====.....] 50%
```

---

## Progress Bar

A progress bar represents completion or loading progress.

```text
[=======...] 70%
```

```markui
[=======...] 70%
```

---

## Stepper

A stepper represents a numeric value with decrement and increment controls.

```text
Quantity: [- 3 +]
```

```markui
Quantity: [- 3 +]
```

---

## Rating

A rating represents a score with filled and empty marks.

```text
Rating: [***..] 3/5
```

```markui
Rating: [***..] 3/5
```

Empty rating:

```text
Rating: [.....] 0/5
```

```markui
Rating: [.....] 0/5
```
