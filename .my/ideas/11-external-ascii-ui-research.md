# MarkUI External ASCII UI Research

**Date:** 2026-05-25
**Status:** Research / recommendations

## Sources

- ASCII Mockups: https://ascii-mockups.com/
- ASCII Mockups LLM docs: https://ascii-mockups.com/llms.txt and https://ascii-mockups.com/llms-full.txt
- Frontend ASCII Previewer skill: https://mcpmarket.com/tools/skills/frontend-ascii-previewer
- Mockdown: https://www.mockdown.design/
- Mockdown about page: https://www.mockdown.design/about
- ASCII-Driven Development: https://medium.com/@calufa/ascii-driven-development-850f66661351

## Executive Summary

MarkUI is already stronger than the surveyed tools as a parseable language: it has a real AST, a renderer, VS Code diagnostics, markdown preview integration, themes, examples, and a growing widget vocabulary. The biggest opportunity is not to add more glyphs first. It is to add an agent handoff layer around the existing language.

The external tools point toward four high-value directions:

1. **Agent-ready export:** ASCII plus page metadata, component inventory, layout coordinates, warnings, and implementation hints.
2. **Structured interchange:** a JSON/project schema for import/export, multi-screen flows, and eventual visual editing.
3. **Variant workflows:** mobile/tablet/desktop, loading/empty/error, and multi-option layout comparisons.
4. **Editor ergonomics:** component palette, copy-as-agent-spec, layers/inspect, and template galleries.

The guiding principle should be: keep `.markui` visually clean, but make the exported handoff richly semantic.

## Source Findings

### ASCII Mockups

ASCII Mockups is a browser app positioned specifically as visual UI instructions for AI coding agents. Its public LLM documentation emphasizes:

- 45+ UI components.
- Multi-page mockups.
- Templates.
- Plain text, Markdown, JSON, and LLM-optimized exports.
- An import format where an AI assistant emits an `ascii-mockup-v1` JSON document.
- A component inventory with IDs, positions, sizes, properties, and `parentId`.
- Inline annotations such as component type and ID.
- shadcn/ui mapping guidance.

Relevant idea for MarkUI: build a first-class **MarkUI Agent Spec** export from the existing parser output. MarkUI already knows node type, text, row, column, width, height, state, and children. That is enough to generate a useful inventory without changing the language.

### Frontend ASCII Previewer Skill

The MCP Market skill is a workflow, not a language. Its differentiators are:

- "Visualize first" before writing frontend code.
- Require confirmation before implementation.
- Document dimensions, spacing, typography, and interactive states.
- Show mobile/tablet/desktop breakpoints.
- Compare multiple layout options with tradeoffs.
- Use ASCII diagrams to clarify component hierarchy.

Relevant idea for MarkUI: add workflow commands and docs, not necessarily new syntax. A VS Code command like `MarkUI: Copy Agent Spec` could emit a prompt-ready packet and explicitly tell coding agents to respect the layout, ask for confirmation if ambiguous, and only then implement.

### Mockdown

Mockdown is a browser-based ASCII wireframe editor. It emphasizes:

- Plain-text wireframes that can be pasted into AI coding tools.
- Markdown export.
- Drag-and-drop components.
- Inline editing and resizing.
- 20+ components.
- Layers and inspect panels.
- A fixed canvas size display such as `80x40`.
- No signup and local/offline usage.
- Use in GitHub issues, Slack, comments, and docs.

Relevant idea for MarkUI: the VS Code extension can become a lightweight structured editor without losing text-first identity. The most useful near-term pieces are an AST inspector, a component insertion palette, and "copy Markdown / copy agent spec" commands.

### ASCII-Driven Development

The Medium article frames ASCII as a low-fidelity thinking tool for the LLM era. The strongest ideas:

- Avoid premature high-fidelity design decisions.
- Separate structure from aesthetics.
- Evaluate hierarchy, flow, components, density, and relationships first.
- Iterate conversationally.
- Keep specs diffable, promptable, and editable by non-designers.
- Feed the final ASCII structure into code-generation tools with visual design direction later.

Relevant idea for MarkUI: protect the language from becoming a styling DSL. MarkUI should model structure, state, and relationships. Color, typography, shadows, exact spacing tokens, and animation should live in themes, renderers, or handoff metadata.

## Current MarkUI Fit

### Strengths

- Existing AST and parse pipeline.
- SVG renderer and themes.
- VS Code live preview, diagnostics, outline, hover, completions, and export to SVG.
- Markdown fenced block support.
- Named blocks and component references.
- Typed containers such as `+--@Modal--+`.
- Broad widget vocabulary for forms, navigation, data display, layout, annotations, and list containers.

### Gaps

- No canonical JSON project/interchange format.
- No agent-optimized export format.
- No component inventory output.
- No stable component IDs in export.
- No first-class multi-screen/project file format beyond markdown conventions.
- No documented viewport or state variant workflow.
- No command to copy a prompt-ready implementation spec.
- No built-in component/template gallery beyond snippets and examples.
- No visual layer/inspect panel in the extension.
- Some local docs and extension completions still appear to reference older card syntax, so syntax docs need a sync pass.

## Recommendations

### 1. Add `markui-agent-v1` Export

Create an export format designed for AI coding agents. It should include the original source, parsed component inventory, hierarchy, dimensions, warnings, and optional target-framework hints.

Example:

````text
@format: markui-agent-v1
@page: Account Settings
@description: User profile and notification preferences
@dimensions: 72x28
@source: settings.markui

@components:
  - Box[box-1]: "Settings" at row 1, col 1, size 72x28
  - TabBar[tabbar-1] at row 3, col 3, size 31x1
    children: ActiveTab "Profile", Tab "Notifications", Tab "Privacy"
  - TextInput[input-1]: "Jane Smith" at row 8, col 17, size 24x1
  - Toggle[toggle-1]: state on at row 13, col 17, size 10x1
  - Button[button-1]: "Save Changes" at row 22, col 3, size 14x1

@implementation-hints:
  target: react
  component-library: shadcn/ui
  instruction: preserve hierarchy and layout before applying visual styling

@ascii:
```markui
+--- Settings ------------------------------------------------------+
| [[Profile]] [Notifications] [Privacy]                            |
|                                                                  |
| Display Name: <Jane Smith_________>                              |
| Email:        <jane@example.com___>                              |
|                                                                  |
| Dark mode:    {[on]/off}                                         |
|                                                                  |
| [Save Changes] [Cancel]                                          |
+------------------------------------------------------------------+
```
````

Implementation sketch:

- Add `packages/markui-core/src/export/agent-spec.ts`.
- Generate stable IDs from type, normalized text, row, and column, without adding IDs to source syntax.
- Include parse errors and warnings in the export.
- Add tests around export shape and hierarchy.
- Add a VS Code command: `MarkUI: Copy Agent Spec`.

Why this fits MarkUI:

- It uses the existing AST.
- It does not pollute the visible wireframe with non-UI metadata.
- It makes MarkUI much more useful for Codex, Claude Code, Cursor, Copilot, v0, Lovable, and Bolt style workflows.

### 2. Define `markui-project-v1` JSON

ASCII Mockups has a JSON import/export schema. MarkUI should define its own, but keep it source-first.

Recommended shape:

```json
{
  "format": "markui-project-v1",
  "version": "0.1.0",
  "screens": [
    {
      "id": "settings.desktop.loaded",
      "name": "Settings",
      "description": "Desktop loaded state",
      "viewport": { "name": "desktop", "width": 96, "height": 40 },
      "state": "loaded",
      "source": "+--- Settings ----\n|\n+----",
      "tree": {
        "type": "Document",
        "children": []
      }
    }
  ],
  "components": []
}
```

Use cases:

- Visual editor import/export.
- Multi-screen flows.
- Snapshot testing.
- LLM import, where the AI emits JSON and MarkUI renders/parses it.
- Future code generation.

Implementation sketch:

- Add `packages/markui-core/src/export/project.ts`.
- Keep `source` required.
- Treat `tree` as derived/cacheable data, not the canonical source.
- Add JSON schema docs in `.my/Language/`.

### 3. Standardize Screen, Viewport, And State Variants

Do not add hidden metadata lines inside `.markui` files yet. Prefer markdown conventions first.

Recommended markdown convention:

````markdown
<!-- markui: screen=settings viewport=desktop state=loaded width=96 height=40 -->
```markui:settings.desktop.loaded
+--- Settings ----
|
+----
```

<!-- markui: screen=settings viewport=mobile state=loaded width=40 height=72 -->
```markui:settings.mobile.loaded
+--- Settings ----
|
+----
```
````

This supports:

- Mobile/tablet/desktop variants.
- Loading/empty/error/success states.
- A/B or option comparisons.
- Code-review diffs where each variant is still text.

Implementation sketch:

- Teach markdown preview plugin to read optional `markui:` HTML comments before fenced blocks.
- Add a utility that groups named blocks by screen.
- Add a "variant comparison" renderer later.

### 4. Add A "Copy Implementation Prompt" Workflow

The Frontend ASCII Previewer skill is valuable because it controls workflow, not because its ASCII syntax is unique.

Add a VS Code command:

- `MarkUI: Copy Implementation Prompt`

The prompt should include:

- MarkUI source.
- Agent spec export.
- Parse warnings.
- Target stack if configured.
- Explicit instruction to preserve structure first.
- Explicit instruction to ask before changing layout.
- Optional instruction to create mobile/tablet/desktop variants before coding.

This command would turn MarkUI into a direct bridge between design planning and implementation.

### 5. Expand The Component Registry Before Adding Many New Glyphs

ASCII Mockups has many component categories: drawers, sheets, command palettes, calendars, popovers, hover cards, charts, carousels, scroll areas, data tables, trees, avatars, skeletons, and more.

MarkUI should not create a unique glyph for every modern UI primitive. That would make the language hard to remember.

Recommended approach:

- Use native MarkUI glyphs for common controls.
- Use typed containers for complex components:

```markui
+--@Command--- Command Menu ----
| Search: <Type a command______>
| ---
| #1 Open file
| #2 Run task
| #3 Toggle sidebar
+----
```

```markui
+--@Chart--- Revenue Trend ----
| Jan  Feb  Mar  Apr  May
| ..   ...  ==== =====
| Revenue: [======....] 64%
+----
```

```markui
+--@Calendar--- May 2026 ----
| Mo Tu We Th Fr Sa Su
|             1  2  3
|  4  5  6  7  8  9 10
+----
```

Needed work:

- Document a typed-container registry.
- Add renderer affordances for common typed containers only when useful.
- Include component mappings in agent export.
- Avoid expanding the parser with too many bespoke token cases.

### 6. Add An Agent Readiness Linter

Add warnings for patterns that make AI handoff weaker:

- Unlabeled inputs.
- `#N` icons without a legend in surrounding markdown.
- Repeated buttons with identical labels and no context.
- Very wide screens without a matching mobile variant.
- Mixed viewport sizes in the same markdown group.
- Tables with inconsistent columns.
- Markdown examples whose fenced blocks do not parse cleanly.
- Use of deprecated syntax from older specs.

Implementation sketch:

- Add `packages/markui-core/src/lint/agent-readiness.ts`.
- Expose warnings through parse result or a separate `lintForAgents` API.
- Surface the warnings in VS Code diagnostics and the agent export.

### 7. Build A Template Gallery

Mockdown and ASCII Mockups both lean heavily on component/template insertion. MarkUI already has examples, but agents and humans need a faster "start here" path.

Recommended templates:

- Login/auth.
- Settings page.
- SaaS dashboard.
- Data table with filters.
- Kanban board.
- Ecommerce product page.
- Checkout flow.
- Empty/loading/error states.
- Modal and drawer flows.
- Mobile navigation variants.

Implementation sketch:

- Add curated snippets in `packages/markui-vscode/snippets/markui.json`.
- Add a VS Code command: `MarkUI: Insert Template`.
- Keep examples and snippets generated from the same source if possible.

### 8. Consider A Lightweight Visual Editing Layer

Mockdown shows the value of drag/drop, layers, inspect, resize, and copy Markdown. MarkUI can borrow this without becoming a browser-only design tool.

Phased approach:

1. Add AST inspector/layers in the existing preview webview.
2. Add click-to-source navigation from preview nodes back to source positions.
3. Add component insertion commands.
4. Later, allow simple resize/move operations that rewrite ASCII source.

This should stay optional. The source file remains the artifact of record.

## Ideas To Defer Or Avoid

### Avoid putting visual design tokens in `.markui`

The Medium article's strongest point is separation of structure from aesthetics. Do not add inline syntax for colors, shadows, exact font sizes, or border radii. Keep those in renderer themes or implementation prompts.

### Avoid making Unicode the primary language

Unicode can be accepted and normalized, but ASCII should remain the canonical authoring style. Unicode-heavy examples can look good, but they are harder to type, diff, and keep aligned across fonts.

### Avoid a glyph for every component

Use typed containers and export mappings for complex components. The simple glyph vocabulary is a MarkUI advantage.

### Avoid invisible inline annotations inside `.markui` for now

ASCII Mockups uses inline annotations for agents. MarkUI should generate those on export rather than requiring authors to type them into the source. This preserves the principle that visible source is visible UI.

## Priority Roadmap

### P0: Agent Handoff Layer

- Add `markui-agent-v1` export.
- Add `MarkUI: Copy Agent Spec`.
- Add `MarkUI: Copy Implementation Prompt`.
- Include component inventory, coordinates, hierarchy, state, errors, and warnings.
- Update `README.md`, `.github/skills/markui/SKILL2.md`, and examples to show the workflow.

### P1: Variants And Interchange

- Define markdown metadata convention for screen, viewport, and state.
- Define `markui-project-v1` JSON.
- Add variant grouping utilities.
- Add agent readiness lint warnings.
- Add framework/component mapping registry.

### P2: Editor Ergonomics

- Add preview-side AST/layers inspector.
- Add click-to-source navigation.
- Add template gallery command.
- Add visual insertion/resizing experiments.
- Add LLM JSON import for generated mockups.

## Concrete File Impact

Likely additions:

- `packages/markui-core/src/export/agent-spec.ts`
- `packages/markui-core/src/export/project.ts`
- `packages/markui-core/src/lint/agent-readiness.ts`
- `packages/markui-core/src/export/*.test.ts`
- `packages/markui-vscode/src/agent-export.ts`
- `packages/markui-vscode/src/templates.ts`
- `.my/Language/12-markui-agent-export-format.md`

Likely modifications:

- `packages/markui-core/src/index.ts`
- `packages/markui-core/src/types.ts`
- `packages/markui-vscode/package.json`
- `packages/markui-vscode/src/extension.ts`
- `packages/markui-vscode/snippets/markui.json`
- `.github/skills/markui/SKILL2.md`
- `README.md`
- `examples/*.md`

## Proposed Acceptance Criteria

For `markui-agent-v1`:

- Given any `.markui` source, export includes original source, page dimensions, component inventory, hierarchy, states, and parse diagnostics.
- Component IDs are stable across exports unless type/text/location changes.
- Export is useful when pasted directly into a coding agent prompt.
- No new visible syntax is required in `.markui`.

For variants:

- Markdown examples can group multiple `markui:*` blocks under one screen.
- A check script can report missing mobile/desktop pairs when a document opts into variant checking.
- The VS Code preview can show the active block and, later, compare variants.

For project JSON:

- JSON export can round-trip source text.
- JSON import can reconstruct a markdown project or individual `.markui` file.
- The AST is treated as derived data, not the source of truth.

## Bottom Line

MarkUI should become the **source-code-native UI planning format for agents**. The language should stay compact and readable. The tooling around it should become richer:

- Parseable source for humans.
- SVG preview for confidence.
- JSON for tools.
- Agent spec for coding assistants.
- Variants for responsive and stateful design.

That gives MarkUI a distinct position: not just an ASCII wireframe renderer, and not another visual mockup tool, but a structured bridge from low-fidelity UI thinking to reliable agent implementation.
