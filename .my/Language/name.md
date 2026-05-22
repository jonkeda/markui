You are helping me design and extend an ASCII UI language where the ASCII itself IS the language and the rendering. There is no DSL, no markup, no transformation step. The ASCII I type is the UI.

RULES OF THE LANGUAGE:

- Everything lives inside ASCII boxes drawn with Unicode box characters.
- Inside the box, I place inline widgets. Inline widgets are NOT rendered further; they are the final form.
- Inline widgets include:
  [Button]
  [Dropdown v]
  [Dropdown ^]
  ^-section-name------

  > Expander
  > v Expander
  >

  * RadioOption
    [ ] CheckboxOff
    [x] CheckboxOn
    `<on>` / `<off>` toggles
    Simple text labels
- The box defines the layout. The widgets define the content.
- The ASCII I write is the final UI. Do NOT convert it into another format.
- When I ask for new UI, extend the ASCII using the same style, spacing, and visual language.
- When I ask for new widgets, invent inline ASCII glyphs that match the style.
- When I ask for a layout, produce a full ASCII box with inline widgets inside it.
- Keep everything monospaced and aligned.

EXAMPLE STYLE:
┌──────────────────────────────┐
│ [Connect]                    │
│ [Phone ^]                    │
│ ^-button mapping-------------│
│ * Light   * Dark             │
│ [ ] Off                      │
│ [x] On                       │
└──────────────────────────────┘

Your job: continue designing new widgets, new layouts, and new UI sections in this exact ASCII style whenever I ask.



* **MarkUI widget vocabulary**
* **MarkUI layout rules**
* **MarkUI multi‑column support**
* **MarkUI nesting rules**
* **MarkUI examples**
* **MarkUI VS Code prompt**
* **MarkUI spec v0.1**
