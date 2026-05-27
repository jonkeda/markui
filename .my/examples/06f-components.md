# Reusable Components

Named blocks and component references.

## Defining Components

Use `markui:name` to create referenceable blocks.

```markui:user-card
+--- User ----------+
| !==IMG==!         |
|                   |
|                   |
| <Full Name_____>  |
| (Admin)           |
+-------------------+
```

```markui:nav-sidebar
+--- Navigation ---+
| #1 Dashboard     |
| #2 Users         |
| #3 Settings      |
| ---              |
| #4 Help          |
| #5 Logout        |
+------------------+
```

## Using Components

Reference components with `@name` at line start.

```markui
+--------------------------------------------------+
| ## Team Members                                  |
|                                                  |
| @user-card                                       |
|                                                  |
| @user-card                                       |
|                                                  |
| @user-card                                       |
|                                                  |
| [<]   1   [[2]]   3   [>]                        |
+--------------------------------------------------+
```

## Custom Inputs

For widgets beyond native syntax, use `<@name>`.

```markui
+--- Event Details ----
|
|  Title:
|  <________________________>
|
|  Start:      <@datepicker>
|  End:        <@datepicker>
|  Color:      <@colorpicker>
|
|  Description:
|  <@richtext>
|
|  [Create Event]  [Cancel]
|
+----
```

## Typed Containers

`@Type` on a box border declares semantic behavior.

```markui
+--@Drawer--- Filters -----------+
|                                |
|  Category:                     |
|  [ ] Electronics               |
|  [ ] Clothing                  |
|  [x] Books                     |
|                                |
|  Price Range:                  |
|  [========..] $0 - $80         |
|                                |
|  Rating:                       |
|  [***..]          3 stars      |
|                                |
|  [Apply Filters]  [Clear]      |
|                                |
+--------------------------------+
```
