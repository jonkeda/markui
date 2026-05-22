# MarkUI LLM Skill Design

**Date:** 2026-05-22
**Status:** Design
**Purpose:** How to teach LLMs to generate valid MarkUI screens.

---

## 1. The Goal

An LLM should be able to:
- Generate `.markui` screens from natural language descriptions
- Convert wireframe sketches or UI descriptions into MarkUI
- Modify existing MarkUI files (add a field, rearrange layout, change states)
- Validate MarkUI output against the language rules

---

## 2. Skill Structure

The skill would be a `.instructions.md` or `SKILL.md` file that an LLM loads before generating MarkUI. It needs to convey:

1. **What MarkUI is** — ASCII-native UI, the text IS the UI
2. **The bracket system** — which brackets mean what
3. **Widget patterns** — how to draw each widget correctly
4. **Layout rules** — how boxes, columns, and alignment work
5. **Common mistakes** — what to avoid
6. **Examples** — input/output pairs

---

## 3. Instruction Layers

### Layer 1: Core Rules (always loaded)

Minimal rules that fit in a small context window. Enough to generate simple screens.

```markdown
# MarkUI Rules

You generate ASCII UI screens in MarkUI format.

## Brackets
- [ ]     Buttons, checkboxes, sliders: [Submit] [x] [=====.....]
- [[ ]]   Active/emphasized: [[Tab]]
- < >     Text inputs, dropdowns: <____> <Select v>
- { / }   Toggles: {[on]/off}
- {n}     Badges: {3} {3!}
- ( )     Radio, tags: (*) (tag)
- (@)     Icons: (@home)

## Modifiers (inside closing bracket)
- ~  disabled    [Submit~]  <____~>
- |  read-only   <|value|>
- *  required    <____*>
- !  error       <____!> followed by (!) message
- >  stretch     [Button >]  <input>>

## Annotations (line below widget)
- ?  help text   ? Must be 8+ characters
- $  tooltip     $Click to submit
- (!) error msg  (!) Invalid email

## Layout
- Boxes: ┌─┐ │ └─┘ (Unicode) or +--+ | (ASCII)
- Title: ┌─── Title ───┐
- Header/footer: ═ borders
- Widgets on same line = horizontal
- Widgets on separate lines = vertical
- Blank line = spacer
- [ ... ] = list continues

## Key Patterns
- Checkbox: [ ] unchecked  [x] checked  [-] indeterminate
- Radio: (*) selected  ( ) unselected
- Toggle: {[on]/off} or {on/[off]}
- Dropdown: <Select v> collapsed  <Select ^> expanded
- Slider: [=====.....] 50%
- Input: <hello_______> (underscores = remaining space)
- Tab bar: [[Active]] [Inactive] [Inactive]
```

### Layer 2: Extended Widgets (loaded on demand)

Additional patterns for complex screens:

```markdown
## Extended Widgets
- Stepper: [- 42 +]
- Rating: [***..] 3/5
- Split button: [Save][v]
- Color input: <#FF5500___>
- Badge variants: {3!} error  {3*} success  {3?} warning  {3i} info
- Removable chip: (tag x)
- Skeleton: [~~~~~~~~~~~~]
- Spinner: [/] Loading...
- Multi-select: [[x]] checked  [[ ]] unchecked
- Drop zone: +- - - -+ dashed border
- Scroll: │| double pipe on right edge
- Resize: . dots on divider
- Tree: - expanded  + collapsed (indented)
- Pagination: [<] 1 2 [3] 4 5 ... 10 [>]
- Breadcrumb: Home > Products > Item
- Alert: (i) info  (!) warning  (x) error  (v) success
```

### Layer 3: Layout & Composition (loaded for complex screens)

```markdown
## Layout Rules
- Grid: ┌──┬──┐ │ ├──┼──┤ │ └──┴──┘
- Column dividers: ┬ top, ┴ bottom, │ between
- Sidebar + main: two boxes side by side
- Dock: ═ header, ├─┬─┤ columns, ═ footer
- Glyph width = rendered width (no pixel values)
- > stretch marker fills available width
- Dialog = just a box (placement is runtime)
- Context menu = indented floating box

## Composition
- @component-name references another .markui file
- {placeholder} in a template card
- [ ... ] means the list continues / is repeatable
```

---

## 4. Prompt Patterns

### Pattern A: "Generate a screen"

```
User: Create a login screen with username, password, remember me checkbox, and a login button.

System: [loads Layer 1 rules]

Expected output: a .markui screen with a titled box, two inputs, a checkbox, and a button.
```

### Pattern B: "Modify an existing screen"

```
User: Add an email field after the username field in this screen: [pastes .markui]

System: [loads Layer 1 rules, reads existing file]

Expected: inserts a new <____*> input with "Email:" label in the right position.
```

### Pattern C: "Convert a description to MarkUI"

```
User: I need a settings page with tabs for Account, Security, and Notifications. 
The Account tab should have profile fields and a save button.

System: [loads Layer 1 + Layer 3 rules]

Expected: tabbed box with [[Account]] active, form fields inside, [Save] button.
```

### Pattern D: "Fix this MarkUI"

```
User: This doesn't look right: [pastes broken .markui]

System: [loads Layer 1 rules, analyzes the file]

Expected: identifies misaligned borders, wrong bracket usage, broken box corners.
```

---

## 5. Common LLM Mistakes to Prevent

The instructions should explicitly warn against these:

| Mistake | Wrong | Right |
|---------|-------|-------|
| Using `[ ]` for inputs | `[username____]` | `<username____>` |
| Using `< >` for toggles | `<on>/<off>` | `{[on]/off}` |
| Forgetting box corners | `───────` without `┌` `┐` | `┌──────┐` |
| Misaligned box borders | Right `│` not at same column | All `│` at same column |
| Badge with `/` | `{on/off}` as badge | `{3}` no slash = badge |
| Pixel widths | `width: 200px` | Glyph width IS the width |
| HTML/XML tags | `<button>Submit</button>` | `[Submit]` |
| Missing underscores in inputs | `<>` | `<____>` |
| Mixing bracket meanings | `(Submit)` for button | `[Submit]` for button |
| Inventing new brackets | `{[ ]}` for something | Use existing conventions |

---

## 6. Validation Checklist

An LLM should self-check before returning MarkUI output:

1. **Box integrity** — Every `┌` has a matching `┘`. All `│` borders align vertically.
2. **Bracket correctness** — `[ ]` for buttons/checkboxes, `< >` for inputs, `{ / }` for toggles, `( )` for radio/tags.
3. **Modifier placement** — Modifiers go inside the closing bracket: `<____*>` not `<____>*`.
4. **Alignment** — Labels and inputs line up at consistent columns.
5. **Spacing** — Content has at least 1 char padding from box borders.
6. **No orphan widgets** — Inputs have labels. Errors have `(!)` messages. Required fields have `*`.
7. **Consistent state** — Only one radio selected per group. Toggle has exactly one `[active]` state.
8. **Width consistency** — All rows of a box have the same width between `│` borders.

---

## 7. Few-Shot Examples

The skill should include 3-5 complete input/output examples at different complexity levels. These are more effective than rules alone.

### Example 1: Simple form

```
Prompt: "Create a contact form with name, email, message, and submit button"

Output:
┌─── Contact Us ───────────────────────┐
│                                      │
│  Name:                               │
│  <______________________________*>   │
│                                      │
│  Email:                              │
│  <______________________________*>   │
│                                      │
│  Message:                            │
│  <                                  >│
│  <                                  >│
│  <                                  >│
│                                      │
│  [Send Message]                      │
│                                      │
└──────────────────────────────────────┘
```

### Example 2: Data table with actions

```
Prompt: "Show a user list with name, role, status columns, and edit/delete actions"

Output:
┌─── Users ────────────────────────────────────────────┐
│                                                      │
│  <Search users________________>  [(@search)]         │
│                                                      │
│  | Name          | Role      | Status   | Actions  | │
│  |---------------|-----------|----------|----------| │
│  | Alice Johnson | Admin     | (Active) | [E] [D]  | │
│  | Bob Smith     | Editor    | (Active) | [E] [D]  | │
│  | Carol White   | Viewer    | (Inactive)| [E] [D] | │
│                                                      │
│  [<] 1 [2] 3 ... 5 [>]                              │
│                                                      │
│  [+ Add User]                                        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Example 3: Settings with toggles and tabs

```
Prompt: "Settings page with General and Notifications tabs"

Output:
┌─── Settings ─────────────────────────────────────┐
│                                                  │
│  [[General]]  [Notifications]                    │
│  ──────────────────────────────────────────────  │
│                                                  │
│  Theme:                                          │
│  (*) Light  ( ) Dark  ( ) System                 │
│                                                  │
│  Language:                                       │
│  <English                    v>                  │
│                                                  │
│  Auto-save             {[on]/off}                │
│  Show line numbers     {on/[off]}                │
│                                                  │
│  Font size:                                      │
│  [- 14 +]                                        │
│                                                  │
│  [Save]  [Reset to Defaults]                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 8. Delivery Formats

The skill can be packaged as:

| Format | Use Case |
|--------|----------|
| `.instructions.md` | VS Code Copilot — auto-loaded for `.markui` files |
| `SKILL.md` | Copilot agent skill — loaded on demand |
| System prompt | Any LLM API — prepended to conversation |
| `.cursorrules` | Cursor IDE |
| `.clinerules` | Cline |
| `CONVENTIONS.md` | Generic — referenced in project root |

### VS Code Instructions Example

```yaml
---
applyTo: "**/*.markui"
---
```

This auto-loads the MarkUI rules whenever the user is working with `.markui` files.

---

## 9. Iterative Refinement

The skill should be tested and refined:

1. **Generate** — Give the LLM a prompt, see what it produces
2. **Validate** — Check against the rules (automated or manual)
3. **Fix** — Add warnings for common mistakes to the instructions
4. **Repeat** — Build a test suite of prompts with expected outputs
5. **Measure** — Track accuracy: correct brackets, aligned boxes, valid widgets

Start with Layer 1 only. Add Layer 2 and 3 only when the LLM consistently fails on complex screens without them.
