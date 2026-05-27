# Design Prompt: MarkUI Doc 04 Widget Reference

**Target doc:** `.my/Language/04-markui-widget-reference.md`  
**Chapter docs:** `.my/Language/04a-*` through `.my/Language/04i-*` as needed  
**Companion doc:** `.my/Language/05-markui-full-examples.md`  
**Status:** design only, not the final content  
**Intent:** replace the current `06-markui-widget-reference.md` and `09-markui-component-library.md` with a clean three-doc set: rewritten Doc 03 for design principles, Doc 04 as the canonical widget reference, and Doc 05 for full examples.

---

## Goal

Create a clean three-doc MarkUI language reference set:

- Rewrite Doc 03 as the home for MarkUI widget design principles and language-design rationale.
- Create Doc 04 as the canonical entry point for the MarkUI widget reference.
- Split the detailed widget reference into chapter docs when that keeps the reference easier to write, review, and maintain.
- Create Doc 05 as the home for full-screen and full-application MarkUI examples.

Doc 04 must merge:

- `06-markui-widget-reference.md`: widget descriptions, syntax rules, parser-relevant details, constraints, examples, and widget-specific edge-case notes.
- `09-markui-component-library.md`: category order, component library feel, and rendered-example organization.

Doc 04 must not contain large complete application examples. Those move to Doc 05.
Doc 04 must not absorb general design-principle prose. That material must stay in, or be moved into, the rewritten Doc 03.
Doc 04 may be a table of contents plus shared reference rules, with detailed widget chapters in `04a`, `04b`, and so on.

---

## Source Notes

Primary sources:

- `.my/Language/06-markui-widget-reference.md`
- `.my/Language/09-markui-component-library.md`
- `.my/Language/03-markui-widget-design-principles.md`
- `.github/skills/markui/SkillMarkui3.MD` for latest portable syntax guidance

Important clarification:

- Some explanatory text in Doc 06 overlaps with Doc 03.
- Keep general principles in Doc 03: glyph design philosophy, how to invent new widgets, state-in-glyph philosophy, nesting philosophy, and other language-design rationale.
- Move only widget-reference material into Doc 04: what each widget is, its syntax, states, examples, parser disambiguation, and usage notes.
- If a paragraph from Doc 06 reads like a principle rather than a reference entry, leave it in Doc 03 or cross-reference Doc 03 instead of copying it.

---

## Design Principles

1. Doc 04 is the widget reference, not a tutorial, design-principles doc, or showcase gallery.
2. Doc 04 can be split into multiple chapter docs, but `04-markui-widget-reference.md` remains the canonical entry point.
3. Every widget/component must have a description.
4. Every widget/component must show syntax and practical examples.
5. Use the category order from Doc 09.
6. Use only widget-reference text and rules from Doc 06, updated to current syntax. Leave general principles in Doc 03.
7. Every example must be written twice:
   - once as a normal Markdown code block for source comparison
   - once as a `markui` code block for rendered preview
8. Full-screen examples belong in Doc 05, not Doc 04.
9. Examples must be small, focused, and parser-valid.
10. Avoid stale syntax from older docs, especially accordion guide bodies and collapsed dropdowns with visible options.
11. Accordion and expander must be separate reference entries. An accordion is a grouped pattern made from multiple expanders.
12. Include Unicode examples where they clarify supported authoring, especially icons and box-drawing alternatives.

---

## Example Pair Rule

Every example in Doc 04 must use this paired format.

````markdown
```text
[Save]  [Cancel]
```

```markui
[Save]  [Cancel]
```
````

Rules for example pairs:

- The `text` and `markui` blocks must be identical unless the surrounding explanation explicitly says why they differ.
- Use `text` for the normal Markdown code block so Markdown renderers do not treat it as MarkUI.
- Keep each example narrow and focused on the widget being described.
- Do not combine unrelated widgets just to make the example look like an app.
- Do not place full-page examples in Doc 04.

---

## Required Section Template

Each widget or component section should follow this shape.

```markdown
### Component Name

Short description of what it represents and when to use it.

Syntax:
- Primary syntax
- State variants
- Important disambiguation rules

Behavior:
- How it is parsed
- How state is encoded
- How it composes with nearby widgets

Examples:

[Paired text + markui examples]

Notes:
- Gotchas
- Avoid using it for...
- Related widgets
```

The final doc can omit empty headings, but every component must still cover description, syntax, examples, and notes when relevant.

---

## Target Doc 03 Rewrite Design

Suggested target path:

- `.my/Language/03-markui-widget-design-principles.md`

Doc 03 should be rewritten before or alongside Doc 04 so Doc 04 can stay focused.

Doc 03 owns:

- MarkUI design principles.
- Glyph design philosophy.
- Rules for inventing new widgets.
- State-is-visible rationale.
- No modifiers rationale.
- Composition-over-invention guidance.
- Nesting readability guidance.
- General language-design decisions that are not individual widget reference entries.

Doc 03 should not duplicate every widget example from Doc 04. It can include short principle examples only when they explain a design rule.

---

## Target Doc 04 Outline

Use the categorization from Doc 09.

Preferred structure:

- Keep `.my/Language/04-markui-widget-reference.md` as the canonical index and entry point.
- Put shared rules, parsing summaries, chapter links, and coverage status in the root Doc 04.
- Put detailed widget/component sections into chapter docs.
- If a single-file reference is ever needed, generate or manually assemble it from the chapter docs after the chapter content is approved.

Suggested chapter files:

- `04a-buttons-actions.md`
- `04b-checkboxes-radios.md`
- `04c-inputs-forms.md`
- `04d-dropdowns-custom-inputs.md`
- `04e-display-text-icons.md`
- `04f-containers-layout.md`
- `04g-navigation.md`
- `04h-tables-data.md`
- `04i-components-alerts-images.md`

The exact chapter list can change, but chapter boundaries should follow the Doc 09 category order and avoid giant all-in-one files.

### 0. Document Header

Include:

- Title: `MarkUI Widget Reference`
- Status and date
- Purpose: canonical widget reference for MarkUI
- Replacement note: supersedes Doc 06 and Doc 09 after approval
- Companion note: full examples live in Doc 05
- Chapter index linking to all `04a-*` through `04i-*` docs

### 1. Core Rules

Source: Doc 06 and SkillMarkui3 for reference rules only. Do not duplicate Doc 03's broader design-principle prose.

Must cover:

- No modifiers: no disabled, required, read-only, error, stretch markers.
- Text inside inputs is example data, not placeholder copy.
- Prefer ASCII for generated examples, but document Unicode input support where useful.
- Same line means horizontal layout; separate lines mean vertical layout.
- Glyph width is rendered width.
- Only UI elements are visible.
- `.markui` files contain one screen and no prose.
- Markdown files can contain multiple `markui` fenced blocks.
- Named blocks are referenceable with `@name`.
- Icon meanings are defined outside the wireframe when using numbered icons.
- Link to or mention Doc 03 for design principles rather than copying them.

### 2. Bracket Conventions and Parsing Priority

Source: Doc 06 plus current syntax.

Must include a compact table for:

- `[ ]`
- `[[ ]]`
- `< >`
- `{ / }`
- `{n}`
- `( )`
- `#N`
- `!`

Must include updated parsing priority for `[ ]` content:

- Checkbox off/on/mixed
- Spinner
- Stepper
- Slider/progress
- Rating
- Split button
- Accordion/expander
- Previous/next buttons
- Icon button
- Default button

Note:

- This parsing-priority section is reference material. Keep it concise.
- Do not copy Doc 03's "rules for inventing new widgets" into Doc 04.

Must include updated parsing priority for `< >` content:

- Custom input
- Dropdown closed
- Dropdown open
- Text input
- Password/date/number conventions where relevant

### 3. Buttons and Actions

Components:

- Button
- Icon button
- Split button
- Previous/next navigation button

Required examples:

- Single button
- Button row
- Icon button with `#N`
- Unicode icon button or Unicode icon alternative, such as `⚙ Settings` or `✓ Complete`
- Split button collapsed
- Split button expanded
- `[<]` and `[>]` navigation controls

### 4. Checkboxes and Radios

Components:

- Checkbox
- Radio button
- Radio group

Required examples:

- `[ ]`, `[x]`, `[-]`
- Checkbox with label
- Radio selected and unselected
- Radio group with 3 choices

### 5. Text Inputs

Components:

- Text input empty
- Text input with example value
- Password input
- Date input
- Number input
- Textarea
- Form field convention

Required examples:

- Empty input
- Filled input
- Password
- Date
- Number
- Multi-line textarea
- Label + input + annotation

### 6. Dropdowns and Custom Inputs

Components:

- Closed dropdown
- Open dropdown
- Multi-select dropdown
- Custom input

Required examples:

- Closed dropdown without visible options: `<Country v>`
- Open dropdown header without listing options, for minimal state illustration: `<Country ^>`
- Open dropdown with visible options: `<Apple ^>` plus options and `->`
- Multi-select dropdown must be open if options are visible: `<3 selected ^>`
- Multi-select dropdown closed summary with no visible options: `<3 selected v>`
- Custom inputs: `<@datepicker>`, `<@colorpicker>`, `<@autocomplete>`

Important correction:

- Do not show visible options below a collapsed dropdown.
- Do not use `<Tags: 3 selected v>` with option rows. Use `^` for the open example.

### 7. Toggles, Sliders, Steppers, Rating, and Progress

Components:

- Toggle on/off
- Slider
- Progress bar
- Stepper
- Rating

Required examples:

- `{[on]/off}`
- `{on/[off]}`
- `[=====.....] 50%`
- `[=======...] 70%`
- `[- 3 +]`
- `[***..] 3/5`
- `[.....] 0/5`

### 8. Text and Display

Components:

- Heading levels
- Label
- Link
- Icon
- Badge
- Separator
- Spinner

Required examples:

- `#`, `##`, `###`
- Plain text label
- `_link text_`
- `#1`, `#2`, `#3`
- Unicode icon examples, such as `✓ Saved`, `⚙ Settings`, or `🔍 Search`, with a note that numbered `#N` icons remain preferred for portable semantic references
- `{3}` and `{!}`
- `---`
- `[/] Loading...`

### 9. Tags and Chips

Components:

- Tag/chip
- Removable chip

Required examples:

- `(React)`
- `(React) (TypeScript) (Node.js)`
- `(Vue x)`
- Mixed removable and non-removable chips

Important rule:

- Only `(?)`, `($)`, `(!)`, `(i)`, `(x)`, `(v)` are annotations.
- Other parenthesized text is a tag/chip.

### 10. Boxes and Containers

Components:

- Basic box
- Titled box
- Open-right box
- Boxless UI
- Vertical list container
- Horizontal list container
- Wrapped list container

Required examples:

- Closed box
- Titled box
- Open-right box with no trailing right `+`
- Boxless login form
- `v--- ... ---v`
- `>--- ... --->`
- `w--- ... ---w`

Important correction:

- Prefer `v`, `>`, and `w` list-container corners over old `*` card syntax for new reference examples.

### 11. Nested Boxes and Layout

Components:

- Full nested boxes
- Prefix nested boxes
- Grid layout
- Dock layout
- Horizontal layout
- Vertical layout

Required examples:

- Box inside box
- `++---` prefix section
- `+++---` deeper prefix section
- Simple grid
- Header/sidebar/main/footer dock layout
- Button row for horizontal layout
- Form stack for vertical layout

### 12. Navigation

Components:

- Tab bar
- Breadcrumb
- Pagination
- Expander
- Accordion
- Tree view
- Context menu

Required examples:

- Tab bar with `[[Active]]`
- Breadcrumb with ` > `
- Pagination with `[<]`, `[[3]]`, `[>]`
- Expander standalone
- Accordion with multiple expander sections: one open and two closed
- Tree view with expanded and collapsed nodes
- Floating context menu

Important correction:

- Expander is one standalone collapsible section.
- Accordion is a group of multiple expander sections.
- New expander and accordion examples should use plain body content under `[Header ^]`.
- Do not teach legacy visible body guides:

```text
|  content
+--+
```

The parser may tolerate the legacy guide, but it is not the preferred authoring style.

Doc 04 structure requirement:

- Create a `### Expander` section.
- Create a separate `### Accordion` section.
- In the accordion section, explicitly state that accordions are sometimes multiple expanders grouped together.
- Show one standalone expander example.
- Show one accordion example containing at least three expander headers.

### 13. Tables

Components:

- Basic table
- Sortable table
- Selectable table

Required examples:

- Header row + separator row + body rows
- Sort suffix `v`
- Sort suffix `^`
- Selection column using `[x]` and `[ ]`

### 14. Scroll and Splitters

Components:

- Scroll region
- Horizontal scroll
- Vertical scroll
- Resizable splitter
- Splitter plus scroll

Required examples:

- `#` on right border
- `#` on bottom border
- `.` divider
- Combined `.` junctions and `#` scroll body

### 15. Dock Layout

Components:

- Header
- Sidebar
- Main content
- Footer/status bar

Required examples:

- Small dock layout only.
- Do not include a full app-scale dashboard here; that belongs in Doc 05.

### 16. Typed Containers

Components:

- Modal
- Drawer
- Popover/sheet pattern if supported
- Typed component container

Required examples:

- `+--@Modal--- Confirm ---+`
- `+--@Drawer--- Filters ----`
- `+--@ProductCard--+`

Important rule:

- `@Type` is semantic behavior, not visible title.
- Visible title comes after the type.

### 17. Toast Notifications and Alerts

Components:

- Toast success
- Toast error
- Toast warning
- Toast info
- Inline alert

Required examples:

- `+-- (v) ---+`
- `+-- (x) ---+`
- `+-- (!) ---+`
- `+-- (i) ---+`
- Standalone `(i)`, `(!)`, `(x)`, `(v)` messages

### 18. Annotations

Components:

- Help annotation
- Tooltip annotation
- Warning annotation
- Info annotation
- Error annotation
- Success annotation

Required examples:

- Each prefix once
- Annotation bound to an input
- Annotation bound to a button
- Blank line breaking annotation binding

### 19. Image and Avatar

Components:

- Simple image placeholder
- Block image placeholder
- Inline image plus text
- Avatar-like usage

Required examples:

- `!==IMG==!`
- Multi-line image block
- Inline image with product text
- Image followed by controls with enough blank rows

### 20. Component References and Slots

Components:

- Named block definition
- Component reference
- Custom input component
- Slot marker
- Named slot marker

Required examples:

- `markui:@user-card`
- `@user-card`
- `<@datepicker>`
- `{@slot}`
- `{@slot:header}`

Important rule:

- For repeated component references, place each `@name` on its own row with enough vertical spacing to avoid overlap in preview.

---

## Doc 05 Full Examples Design

Create Doc 05 as a separate document for complete examples.

Suggested target path:

- `.my/Language/05-markui-full-examples.md`

Doc 05 should receive the full examples currently in Doc 09:

- Complete email client
- Complete dashboard

Doc 05 can also include full examples from examples or future drafts:

- Registration flow
- Project board
- Settings page
- Component composition page
- Admin dashboard

Doc 05 example rules:

- Full examples can be larger and more realistic.
- Each full example should still use the paired `text` and `markui` blocks if comparison is needed.
- Keep app-scale examples out of Doc 04.

---

## Migration Plan

1. Rewrite Doc 03 so it cleanly owns design principles and language-design rationale.
2. Draft root Doc 04 as the canonical widget-reference index and shared rules page.
3. Draft the `04a-*` chapter docs for detailed widget/component reference content.
4. Draft Doc 05 with full examples moved out of Doc 09.
5. Validate every `markui` block in Doc 04 chapter docs and Doc 05.
6. Render suspicious examples and visually inspect them.
7. Confirm the Doc 04 chapter set covers every widget-reference entry from Doc 06 and every category from Doc 09.
8. Confirm Doc 03 contains the principle material intentionally left out of Doc 04.
9. Mark Doc 06 and Doc 09 as superseded, then remove them only after Doc 03, root Doc 04, all Doc 04 chapters, and Doc 05 are approved.

---

## Coverage Checklist

Before approving final Doc 04, verify:

- [ ] Every Doc 09 category appears in Doc 04.
- [ ] Every widget-reference entry from Doc 06 appears in Doc 04.
- [ ] Root Doc 04 links to all chapter docs.
- [ ] Chapter docs follow the Doc 09 category order.
- [ ] General design-principle prose that belongs in Doc 03 is not copied into Doc 04.
- [ ] Every component has a description.
- [ ] Every component has at least one paired `text` and `markui` example.
- [ ] Components with states show all meaningful states.
- [ ] Dropdowns show both closed and open usage.
- [ ] Dropdowns show open usage both with and without visible option rows.
- [ ] List containers show vertical, horizontal, and wrapped usage.
- [ ] Expander and accordion are separate sections.
- [ ] Accordion is described as a grouped pattern made from multiple expanders.
- [ ] Expanders and accordions use current clean body syntax.
- [ ] Full app examples are moved to Doc 05.
- [ ] No example uses stale `*` card syntax.
- [ ] No visible wireframe text contains requirements, business rules, or implementation notes.
- [ ] ASCII examples remain primary.
- [ ] Unicode examples are included for supported authoring, especially icons and box-drawing alternatives.

---

## Decisions

1. Normal Markdown comparison blocks use `text` fences.
2. Do not add a separate parser-priority appendix. Keep parsing notes in the root summary or next to the relevant widget categories.
3. Legacy `*--- Card ---*` syntax should disappear from the canonical reference.
4. Unicode coverage should include all useful forms: simple symbols, emoji, and Unicode box drawing.
