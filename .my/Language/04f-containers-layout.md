# MarkUI Widget Reference: Containers and Layout

**Date:** 2026-05-27  
**Status:** v1.0 draft  
**Parent:** `04-markui-widget-reference.md`

---

## Basic Box

A box represents a contained UI region.

Example:

```text
+------------------------------+
| Content inside a box         |
+------------------------------+
```

```markui
+------------------------------+
| Content inside a box         |
+------------------------------+
```

Unicode box-drawing input is also accepted:

```text
┌──────────────┐
│ Content      │
└──────────────┘
```

```markui
┌──────────────┐
│ Content      │
└──────────────┘
```

---

## Titled Box

A titled box names a region.

Example:

```text
+--- User Profile ----------------+
| Name:  Jane Smith               |
| Role:  Administrator            |
+---------------------------------+
```

```markui
+--- User Profile ----------------+
| Name:  Jane Smith               |
| Role:  Administrator            |
+---------------------------------+
```

---

## Open-Right Box

An open-right box uses only the left border. Do not add a trailing right `+`.

Example:

```text
+--- Login ----
|
|  Username:
|  <Jane____________>
|
|  [Login]
|
+----
```

```markui
+--- Login ----
|
|  Username:
|  <Jane____________>
|
|  [Login]
|
+----
```

---

## Boxless UI

MarkUI does not require a surrounding box.

Example:

```text
Username:
<Jane____________>

Password:
<****____________>

[Login]
```

```markui
Username:
<Jane____________>

Password:
<****____________>

[Login]
```

## Vertical List Container

Use `v` corners for repeatable items that stack vertically.

Example:

```text
v--- Product ----------------v
| Widget A       $19.99      |
| [Add to cart]              |
v----------------------------v

v--- Product ----------------v
| Widget B       $29.99      |
| [Add to cart]              |
v----------------------------v
```

```markui
v--- Product ----------------v
| Widget A       $19.99      |
| [Add to cart]              |
v----------------------------v

v--- Product ----------------v
| Widget B       $29.99      |
| [Add to cart]              |
v----------------------------v
```

---

## Horizontal List Container

Use `>` corners for repeatable items that flow horizontally.

Example:

```text
>--- Product --->  >--- Product --->
| Widget A      |  | Widget B      |
| $19.99        |  | $29.99        |
>--------------->  >--------------->
```

```markui
>--- Product --->  >--- Product --->
| Widget A      |  | Widget B      |
| $19.99        |  | $29.99        |
>--------------->  >--------------->
```

---

## Wrapped List Container

Use `w` corners for repeatable items that wrap.

Example:

```text
w--- Tags --------------------w
| (React) (TypeScript)        |
| (Design) (Docs)             |
w-----------------------------w
```

```markui
w--- Tags --------------------w
| (React) (TypeScript)        |
| (Design) (Docs)             |
w-----------------------------w
```

---

## Nested Boxes

Boxes can contain other boxes.

Example:

```text
+--- Dashboard ---------------------------+
| +--- Stats --------+ +--- Chart -------+ |
| | Users: 1,234     | | [=======...] 70%| |
| +------------------+ +-----------------+ |
+-----------------------------------------+
```

```markui
+--- Dashboard ---------------------------+
| +--- Stats --------+ +--- Chart -------+ |
| | Users: 1,234     | | [=======...] 70%| |
| +------------------+ +-----------------+ |
+-----------------------------------------+
```

---

## Prefix Nested Boxes

Use `++---` and `+++---` for nested sections without full inner boxes.

Example:

```text
+--- Settings ----
|
++--- Profile ----

  Name:
  <Jane____________>

+++--- Privacy ----

  Public profile  {[on]/off}

+----
```

```markui
+--- Settings ----
|
++--- Profile ----

  Name:
  <Jane____________>

+++--- Privacy ----

  Public profile  {[on]/off}

+----
```

---

## Grid Layout

A grid uses box dividers to create rows and columns.

Example:

```text
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
```

```markui
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
```

---

## Horizontal and Vertical Layout

Same-row widgets imply horizontal layout. Separate rows imply vertical layout.

Horizontal:

```text
[Save]  [Cancel]  [Delete]
```

```markui
[Save]  [Cancel]  [Delete]
```

Vertical:

```text
Name:
<Jane____________>

Email:
<jane@example.com____>
```

```markui
Name:
<Jane____________>

Email:
<jane@example.com____>
```

---

## Scroll Region and Splitters

`#` on a border indicates scrolling. `.` on a divider indicates resizing.

Scroll:

```text
+--- Messages ---------------------+
| #1 New message                   #
| #2 Meeting reminder              #
+##################################+
```

```markui
+--- Messages ---------------------+
| #1 New message                   #
| #2 Meeting reminder              #
+##################################+
```

Splitter:

```text
+----------.-----------------------+
| Sidebar  . Main Content          |
| [Nav 1]  . Welcome               |
+----------.-----------------------+
```

```markui
+----------.-----------------------+
| Sidebar  . Main Content          |
| [Nav 1]  . Welcome               |
+----------.-----------------------+
```

---

## Dock Layout

A dock layout has header, side region, main content, and footer.

Example:

```text
+----------------------------------+
| Header                           |
+----------+-----------------------+
| Sidebar  | Main Content          |
| [Nav 1]  | Dashboard             |
+----------+-----------------------+
| Footer                           |
+----------------------------------+
```

```markui
+----------------------------------+
| Header                           |
+----------+-----------------------+
| Sidebar  | Main Content          |
| [Nav 1]  | Dashboard             |
+----------+-----------------------+
| Footer                           |
+----------------------------------+
```
