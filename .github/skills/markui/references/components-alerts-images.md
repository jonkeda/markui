# MarkUI Components, Alerts, And Images

Use this reference for semantic containers, annotations, media placeholders, and reusable components.

## Typed Containers

Typed containers declare semantic behavior with `@Type` on the border. The type is not the visible title.

```markui
+--@Modal--- Confirm ----------------+
|                                     |
|  Delete this item?                  |
|                                     |
|  [Delete]  [Cancel]                 |
|                                     |
+-------------------------------------+
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

A visible title can follow the type: `+--@Modal--- Confirm ---+`.

## Toasts, Inline Alerts, And Annotations

Toasts are small message boxes with a status marker in the title:

```markui
+-- (v) ----------------------------+
| File saved successfully           |
+-----------------------------------+

+-- (x) ----------------------------+
| Upload failed. Please try again.  |
+-----------------------------------+
```

Inline alerts use annotation prefixes as standalone messages:

```markui
(i) This is an informational message.
(!) Review your settings before continuing.
(x) An error occurred. Please try again.
(v) Operation completed successfully.
```

Annotations bind to the nearest widget above. A blank line breaks binding.

Prefixes:

- `(?)` help
- `($)` tooltip
- `(!)` warning
- `(i)` info
- `(x)` error
- `(v)` success

```markui
Email:
<user@example.com________>
(x) Please enter a valid email.

Password:
<****____________________>
(?) Must be at least 8 characters.
```

## Image Placeholders

Simple image:

```markui
!==IMG==!
```

Block image:

```markui
!=========!
!   IMG   !
!  16:9   !
!=========!
```

Inline image:

```markui
!==IMG==!  Product Name
           $29.99
           [Add to cart]
```

Leave blank rows after image placeholders when controls appear below them.

## Components And Slots

Named component block:

```markui:user-card
+--- User ----------+
| !==IMG==!         |
| <Full Name_____>  |
| (Admin)           |
+-------------------+
```

Component reference:

```markui
+--- Team Members ----------------------+
|                                       |
|  @user-card                           |
|                                       |
|  @user-card                           |
|                                       |
+---------------------------------------+
```

- Put repeated component references on separate rows.
- Leave enough vertical spacing to avoid preview overlap.
- A component reference inlines another `.markui` file or named Markdown block.

Slots mark where caller-provided content goes inside a component definition:

```markui
{@slot}
{@slot:header}
```

- Use `{@slot}` for default content.
- Use `{@slot:name}` for named regions.
