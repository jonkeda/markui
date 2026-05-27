# Layout Patterns

Box nesting, columns, dock layouts, and special containers.

## Simple Box

```markui
+--- Card Title -------------------+
| Content goes here.               |
+----------------------------------+
```

## Open-Right Shorthand

The right border is optional — less drawing, same structure.

```markui
+--- Login ----
|
|  Username:
|  <________________________>
|
|  Password:
|  <________________________>
|
|  [Login]
|
+----
```

## Column Layout

```markui
+--------+---------------------+
| Left   | Right               |
| column | column              |
+--------+---------------------+
```

## Dock Layout

Header, sidebar, main content, footer — all in one box.

```markui
+------------------------------+
| Header                       |
+--------+---------------------+
| Side   | Main Content        |
| bar    |                     |
|        |                     |
+--------+---------------------+
| Footer                       |
+------------------------------+
```

## Nested Prefix Boxes

`++` and `+++` create sub-sections without full box drawing.

```markui
+--- Settings ----
|
++--- Account ----

  Email: <jane@example.com___>
  Name:  <Jane Smith_________>

++--- Appearance ----

  Theme:   <Dark v>
  Density: (*) Compact  ( ) Default

++--- Privacy ----

  Share usage data: {on/[off]}

+----
```

## Scroll Region

`#` on a border indicates scrollable content.

```markui
+--- Messages ---+
| Alice: Hi!     #
| Bob: Hello     #
| Alice: How..   #
| Bob: Good      #
+----------------+
```

## Resizable Splitter

`.` on a divider indicates a draggable splitter.

```markui
+---------+---------------------+
| Sidebar . Main Content        |
| [Nav 1] . Some text here      |
| [Nav 2] .                     |
+---------+---------------------+
```

## Modal Dialog

Typed containers use `@Name` to declare behavior.

```markui
+--@Modal--- Confirm Deletion -----------+
|                                        |
|  Are you sure you want to delete       |
|  this item? This cannot be undone.     |
|                                        |
|  [Delete]  [Cancel]                    |
|                                        |
+----------------------------------------+
```
