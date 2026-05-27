# MarkUI Containers And Layout

Use this reference for boxes, list containers, layout regions, and border semantics.

## Boxes

Closed box:

```markui
+--- User Profile ----------------+
| Name:  Jane Smith               |
| Role:  Administrator            |
+---------------------------------+
```

Open-right box:

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

Boxless UI:

```markui
Username:
<Jane____________>

Password:
<****____________>

[Login]
```

- Use closed boxes for exact containment.
- Use open-right boxes for sketchy, left-anchored groups.
- Do not add trailing right `+` or right `|` in open-right boxes.
- Unicode box drawing input is accepted, but generated examples should prefer ASCII.

## List Containers

Vertical list containers use `v` corners:

```markui
v--- Product ----------------v
| Widget A       $19.99      |
| [Add to cart]              |
v----------------------------v
```

Horizontal list containers use `>` corners:

```markui
>--- Product --->  >--- Product --->
| Widget A      |  | Widget B      |
| $19.99        |  | $29.99        |
>--------------->  >--------------->
```

Wrapped list containers use `w` corners:

```markui
w--- Tags --------------------w
| (React) (TypeScript)        |
| (Design) (Docs)             |
w-----------------------------w
```

Do not use `*---` card corners for new examples.

## Nested And Grid Layout

Nested boxes:

```markui
+--- Dashboard ---------------------------+
| +--- Stats --------+ +--- Chart -------+ |
| | Users: 1,234     | | [=======...] 70%| |
| +------------------+ +-----------------+ |
+-----------------------------------------+
```

Prefix nested boxes:

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

Grid layout uses box dividers:

```markui
+----------+----------+----------+
| Cell 1   | Cell 2   | Cell 3   |
+----------+----------+----------+
| Cell 4   | Cell 5   | Cell 6   |
+----------+----------+----------+
```

## Scroll, Splitters, Dock Layout

`#` on a border indicates scrolling:

```markui
+--- Messages ---------------------+
| #1 New message                   #
| #2 Meeting reminder              #
+##################################+
```

`.` on a divider indicates resizing:

```markui
+----------.-----------------------+
| Sidebar  . Main Content          |
| [Nav 1]  . Welcome               |
+----------.-----------------------+
```

Dock layout has header, side region, main content, and footer:

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
