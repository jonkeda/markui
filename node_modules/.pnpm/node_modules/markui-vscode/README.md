# MarkUI

**ASCII wireframes → visual UI diagrams**, right in VS Code.

MarkUI is a lightweight language for drawing UI wireframes using plain text characters. The VS Code extension renders them as clean SVG diagrams — in `.markui` files, in markdown preview, and in notebooks.

## Quick Start

```markui
+--- Login ---+
|
|  Username:
|  <________________________>
|
|  Password:
|  <****____________________>
|
|  [x] Remember me
|
|  [Login]  _Forgot password?_
|
+--+
```

Install the extension, open a `.markui` file, and press `Ctrl+Shift+V` to see the live preview.

## Features

| Feature | Description |
|---------|-------------|
| **Live Preview** | Side-by-side rendered wireframe for `.markui` files (`Ctrl+Shift+V`) |
| **Markdown Preview** | `markui` fenced code blocks render as SVG in markdown preview |
| **Syntax Highlighting** | Full TextMate grammar with colorized box borders, widgets, annotations |
| **Diagnostics** | Inline error and warning markers from the parser |
| **Outline** | Document structure navigation for boxes and sections |
| **Completions** | Context-aware suggestions after `[`, `<`, `{`, `(`, `@`, `#` |
| **Hover Info** | Widget type and properties on hover |
| **Snippets** | 9 built-in snippets for common patterns |
| **Themes** | Clean, sketch, and blueprint rendering themes |
| **Export** | Export to SVG from the context menu |

## Syntax at a Glance

### Widgets

| Syntax | Widget | Example |
|--------|--------|---------|
| `[text]` | Button | `[Submit]` `[Cancel]` |
| `[ ]` `[x]` `[-]` | Checkbox | `[x] Remember me` |
| `<____>` | Text input | `<John Doe_________>` |
| `<****>` | Password | `<****____________>` |
| `<Select v>` | Dropdown | `<Country v>` |
| `{[on]/off}` | Toggle | `{on/[off]}` |
| `(*) ( )` | Radio | `(*) Yes  ( ) No` |
| `{3}` `{!}` | Badge | `Messages {3}` |
| `(tag)` | Tag/chip | `(React) (Vue x)` |
| `#N` | Icon | `#1 Home  #2 Settings` |
| `_text_` | Link | `_Click here_` |
| `---` | Separator | |
| `[/]` | Spinner | `[/] Loading...` |

### Inputs & Controls

| Syntax | Widget | Example |
|--------|--------|---------|
| `[- N +]` | Stepper | `[- 42 +]` |
| `[====....]` | Slider | `[=====.....] 50%` |
| `[***..] ` | Rating | `[***..] 3/5` |
| `[[Tab]]` | Active tab | `[[Home]] [Settings]` |
| `[Section v]` | Accordion | `[Details ^]` |
| `<@name>` | Custom input | `<@datepicker>` |
| `!==IMG==!` | Image | |

### Boxes & Layout

```markui
+--- Titled Box ----------+
| Content inside           |
+--------------------------+
```

Open-right shorthand (no right border needed):

```markui
+--- Form ---+
|
|  Name: <____________>
|  Email: <____________>
|  [Save]
|
+--+
```

Widgets on the **same line** flow horizontally. Separate lines flow vertically.

### Tables

```markui
| Name    | Role     | Status  |
|---------|----------|---------|
| Alice   | Engineer | (Active)|
| Bob     | Designer | (Away)  |
```

### Navigation

```markui
+--[[Dashboard]]--[Users]--[Settings]--+
|                                       |
|  Welcome back, Admin                  |
|                                       |
+---------------------------------------+
```

### Annotations

Annotations bind to the nearest widget above them:

```markui
Email:
<________________________>
(?) We'll never share your email

Password:
<________________________>
(x) Must be at least 8 characters
```

Prefixes: `(?)` help, `($)` tooltip, `(!)` warning, `(i)` info, `(x)` error, `(v)` success.

## File Formats

| Format | Purpose |
|--------|---------|
| `.markui` | One screen per file, no prose |
| `.md` with ` ```markui ` blocks | Multiple screens, flows, documentation |

Named blocks in markdown enable component reuse:

````markdown
```markui:user-card
*-----------------------*
| !==IMG==!  User Name  |
|            Role       |
*-----------------------*
```

Reference it elsewhere with `@user-card`.
````

## Themes

Switch themes via the command palette: **MarkUI: Change Preview Theme**

- **Clean** — light, minimal wireframe style (default)
- **Sketch** — hand-drawn look
- **Blueprint** — dark blueprint grid

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| MarkUI: Open Preview | `Ctrl+Shift+V` | Open side-by-side preview |
| MarkUI: Export to SVG | — | Export current file as SVG |
| MarkUI: Change Preview Theme | — | Switch between clean/sketch/blueprint |
| MarkUI: Zoom In | `Ctrl+=` | Zoom in on preview |
| MarkUI: Zoom Out | `Ctrl+-` | Zoom out on preview |
| MarkUI: Reset Zoom | `Ctrl+0` | Reset preview zoom |

## Full Example

```markui
+--- Contact Us ----------------------------------------+
|                                                        |
|  # Get in Touch                                        |
|                                                        |
|  Name:                                                 |
|  <________________________>                            |
|                                                        |
|  Email:                                                |
|  <________________________>                            |
|  (?) We'll respond within 24 hours                     |
|                                                        |
|  Subject:                                              |
|  <General inquiry v>                                   |
|                                                        |
|  Message:                                              |
|  <                                                  >  |
|  <                                                  >  |
|  <                                                  >  |
|                                                        |
|  [x] Subscribe to newsletter                           |
|                                                        |
|  [Send Message]  [Clear]                               |
|                                                        |
+--------------------------------------------------------+
```

## License

MIT
