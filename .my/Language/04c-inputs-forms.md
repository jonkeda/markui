# MarkUI Widget Reference: Inputs and Forms

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Text Input

A text input represents editable text. Text inside the input is example data, not placeholder copy.

Syntax:

- `<____________>` empty input
- `<Jane Doe____>` input with example value

Empty:

```text
Name:
<________________________>
```

```markui
Name:
<________________________>
```

Filled:

```text
Name:
<Jane Smith_____________>
```

```markui
Name:
<Jane Smith_____________>
```

Notes:

- Underscores indicate editable area.
- Do not put placeholder hints inside inputs.

---

## Password Input

A password input uses asterisks for obscured example data.

Example:

```text
Password:
<****____________________>
```

```markui
Password:
<****____________________>
```

Notes:

- Use visible help text or annotations for password requirements.

---

## Date Input

A date input uses date-shaped editable content.

Example:

```text
Start date:
<__/__/____>
```

```markui
Start date:
<__/__/____>
```

---

## Number Input

A number input uses numeric example data.

Example:

```text
Quantity:
<123______>
```

```markui
Quantity:
<123______>
```

---

## Textarea

A textarea is formed by consecutive same-width input lines.

Example:

```text
Description:
<                              >
<                              >
<                              >
```

```markui
Description:
<                              >
<                              >
<                              >
```

Notes:

- Keep textarea rows the same width.
- Textareas are useful for comments, descriptions, and notes fields.

---

## Form Field Convention

A form field is a label followed by an input and optional annotation.

Example:

```text
Email:
<user@example.com________>
(x) Please enter a valid email.

Password:
<****____________________>
(?) Must be at least 8 characters.
```

```markui
Email:
<user@example.com________>
(x) Please enter a valid email.

Password:
<****____________________>
(?) Must be at least 8 characters.
```

Notes:

- A blank line separates field groups.
- An annotation binds to the nearest widget above it.

