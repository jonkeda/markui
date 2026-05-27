# MarkUI Widget Reference: Components, Alerts, Images

**Date:** 2026-05-27
**Status:** v1.0 draft
**Parent:** `04-markui-widget-reference.md`

---

## Typed Container

A typed container declares semantic behavior with `@Type` on the border. The type is not the visible title.

Modal:

```text
+--@Modal--- Confirm -----------------+
|                                     |
|  Delete this item?                  |
|                                     |
|  [Delete]  [Cancel]                 |
|                                     |
+-------------------------------------+
```

```markui
+--@Modal--- Confirm ----------------+
|                                     |
|  Delete this item?                  |
|                                     |
|  [Delete]  [Cancel]                 |
|                                     |
+-------------------------------------+
```

Drawer:

```text
+--@Drawer--- Filters ----
|
|  Category:
|  <All categories v>
|
|  Rating:
|  [***..] 3 stars
|
|  [Apply]  [Clear]
|
+----
```

```markui
+--@Drawer--- Filters ----
|
|  Category:
|  <All categories v>
|
|  Rating:
|  [***..] 3 stars
|
|  [Apply]  [Clear]
|
+----
```

Typed component container:

```text
+--@ProductCard--+
| Widget A       |
| $19.99         |
+----------------+
```

```markui
+--@ProductCard--+
| Widget A       |
| $19.99         |
+----------------+
```

Notes:

- A visible title can follow the type: `+--@Modal--- Confirm ---+`.

---

## Toast Notification

A toast is a small message box with a status marker in the title.

Example:

```text
+-- (v) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please try again.  |
+-----------------------------------+
```

```markui
+-- (v) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please try again.  |
+-----------------------------------+
```

---

## Inline Alert

Inline alerts use annotation prefixes as standalone messages.

Example:

```text
(i) This is an informational message.
(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

```markui
(i) This is an informational message.
(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

---

## Annotation

Annotations bind to the nearest widget above. A blank line breaks binding.

Prefixes:

- `(?)` help
- `($)` tooltip
- `(!)` warning
- `(i)` info
- `(x)` error
- `(v)` success

Input annotations:

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

Button tooltip:

```text
[Create Account]
($) Submits the registration form.
```

```markui
[Create Account]
($) Submits the registration form.
```

Blank line breaks binding:

```text
Email:
<user@example.com________>

(i) This info message is standalone.
```

```markui
Email:
<user@example.com________>

(i) This info message is standalone.
```

---

## Image Placeholder

An image placeholder reserves a media region.

Simple image:

```text
!==IMG==!
```

```markui
!==IMG==!
```

Block image:

```text
!=========!
!   IMG   !
!  16:9   !
!=========!
```

```markui
!=========!
!   IMG   !
!  16:9   !
!=========!
```

Inline image:

```text
!==IMG==!  Product Name
           $29.99
           [Add to cart]
```

```markui
!==IMG==!  Product Name
           $29.99
           [Add to cart]
```

Image followed by controls:

```text
!==IMG==!


[Upload Photo]
```

```markui
!==IMG==!


[Upload Photo]
```

Notes:

- Leave blank rows after image placeholders when controls appear below them.

---

## Named Component Block

A named `markui` block defines reusable component content in Markdown.

Example:

```text
+--- User ----------+
| !==IMG==!         |
| <Full Name_____>  |
| (Admin)           |
+-------------------+
```

```markui:@user-card
+--- User ----------+
| !==IMG==!         |
| <Full Name_____>  |
| (Admin)           |
+-------------------+
```

---

## Component Reference

A component reference inlines another `.markui` file or named Markdown block.

Example:

```text
+--- Team Members ----------------------+
|                                       |
|  @user-card                           |
|                                       |
|  @user-card                           |
|                                       |
+---------------------------------------+
```

```markui
+--- Team Members ----------------------+
|                                       |
|  @user-card                           |
|                                       |
|  @user-card                           |
|                                       |
+---------------------------------------+
```

Notes:

- Put repeated component references on separate rows.
- Leave enough vertical spacing to avoid preview overlap.

---

## Slot Marker

Slots mark where caller-provided content goes inside a component definition.

Example:

```text
{@slot}
{@slot:header}
```

```markui
{@slot}
{@slot:header}
```

Notes:

- Use `{@slot}` for default content.
- Use `{@slot:name}` for named regions.
