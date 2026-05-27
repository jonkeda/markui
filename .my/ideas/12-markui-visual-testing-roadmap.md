# MarkUI Visual Testing Roadmap

**Date:** 2026-05-25
**Status:** Draft / implementation roadmap

## Problem

Some MarkUI previews do not look right even when parser tests pass. The current test suite mostly verifies that parsing succeeds and that generated SVG strings contain expected elements. That catches missing renderer branches, but it does not catch visual regressions such as:

- Text overlapping borders or nearby widgets.
- SVG canvas too small, clipping content.
- Incorrect row/column spacing.
- Bad nested box sizing.
- List containers rendering like regular boxes.
- Markdown preview CSS changing rendered dimensions.
- Theme-specific contrast or fill errors.
- Zoom/fit behavior hiding or distorting diagrams.

MarkUI needs visual tests that render actual output and compare it against approved baselines.

## Current State

Existing useful pieces:

- `packages/markui-core/src/renderer/svg-renderer.test.ts` tests renderer branches with SVG string assertions.
- `packages/markui-core/src/compile.test.ts` covers parser plus renderer integration.
- `scripts/check-examples.cjs` validates markdown fenced blocks by compiling them.
- `examples/*.markui` and `examples/*.md` provide a natural fixture set.
- VS Code preview, markdown preview, and notebook renderer all flow through `compile(...).svg`.

Gaps:

- No PNG/screenshot baselines.
- No visual diff threshold.
- No generated gallery for reviewing examples.
- No test coverage for markdown preview wrapper CSS.
- No test coverage for VS Code preview webview layout.
- No systematic capture across themes.

## Goals

1. Catch visible rendering regressions before they ship.
2. Make broken previews easy to inspect locally.
3. Keep visual tests deterministic enough for CI.
4. Use examples as living fixtures.
5. Separate fast renderer visual tests from slower extension/webview tests.

## Non-Goals

- Do not make every pixel sacred from day one.
- Do not require VS Code to run for the first visual test layer.
- Do not replace parser/unit tests.
- Do not add design-token syntax to `.markui` just for tests.

## Recommended Test Layers

### Layer 0: Manual Chat Visual Review

Purpose: get an occasional human-in-the-loop read on whether generated previews look correct before investing in strict pixel baselines.

Approach:

- Generate PNG images for the current fixture set.
- On explicit human command, invoke the repo skill at `.github/skills/markui-visual-review/SKILL.md`.
- Use this chat to view selected generated PNGs and compare them against the original `.markui` source.
- Classify each reviewed preview as `looks-correct`, `needs-fix`, or `unsure`.
- Return concrete visual issues, likely cause, and suggested next step in the chat.
- Do not automate this step, run it in CI, or call an external LLM review API.

Recommended review checklist:

- Does the rendered preview match the ASCII structure?
- Are boxes, list containers, dividers, and nested regions placed correctly?
- Is any text clipped, overlapping, missing, or misaligned?
- Do widgets look like the intended control type?
- Is the SVG canvas large enough for all content?
- Does the theme make the preview readable?
- Are there obvious parser/rendering mistakes that need a fixture or code fix?

Recommended artifact command:

```powershell
pnpm visual:gallery
```

Policy:

- This is advisory and human-commanded only.
- Run it seldomly: for suspicious previews, release checks, renderer rewrites, or before accepting baselines.
- Treat `needs-fix` as a triage queue.
- Treat `unsure` as a prompt or fixture-quality problem.
- Keep CI limited to deterministic tests and generated artifacts.

### Layer 1: SVG Structural Smoke Tests

Purpose: catch obvious invalid SVG and layout metadata problems without rasterization.

Checks:

- SVG parses as XML.
- Root `<svg>` has positive `width`, `height`, and `viewBox`.
- No `NaN`, `undefined`, or `Infinity` in output.
- No negative dimensions on `rect`, `line`, or key shapes.
- Text nodes are escaped.
- Canvas bounds include all child nodes from the AST.

Recommended command:

```powershell
pnpm --filter @jonkeda/markui-core test
```

Implementation:

- Add `packages/markui-core/src/renderer/svg-sanity.test.ts`.
- Use examples as fixture input.
- Run against `clean`, `sketch`, and `blueprint` themes.

### Layer 2: Golden SVG Snapshots

Purpose: capture intentional SVG structure and geometry changes.

Approach:

- Compile a curated fixture set.
- Normalize volatile details.
- Store `.svg` baselines.
- Compare generated SVG to baseline in tests.

Recommended fixtures:

- `basic-widgets`
- `simple-form`
- `boxed-form`
- `contact-form`
- `user-profile`
- `product-catalog`
- `settings-accordion`
- `admin-dashboard`
- `email-client`
- `project-board`
- One fixture per high-risk widget family.

Recommended paths:

```text
packages/markui-core/test/visual/fixtures/*.markui
packages/markui-core/test/visual/baselines/svg/<theme>/*.svg
packages/markui-core/test/visual/__generated__/svg/<theme>/*.svg
```

Baseline update command:

```powershell
pnpm --filter @jonkeda/markui-core visual:update-svg
```

Verification command:

```powershell
pnpm --filter @jonkeda/markui-core visual:svg
```

Policy:

- SVG snapshot diffs are allowed when the renderer intentionally changes.
- Every baseline update should be reviewed visually, not accepted automatically.

### Layer 3: Raster PNG Visual Diff

Purpose: catch what humans see: overlap, clipping, bad spacing, missing fills, and theme regressions.

Approach:

- Compile MarkUI to SVG.
- Render SVG in Chromium with a pinned viewport and font.
- Capture PNG screenshots.
- Compare against PNG baselines with a small threshold.

Recommended tooling:

- `@playwright/test` for browser rendering and screenshots.
- Playwright screenshot comparisons for baseline management.
- Optional later: `pixelmatch` and `pngjs` if custom reporting is needed.

Recommended paths:

```text
packages/markui-core/test/visual/baselines/png/<theme>/*.png
packages/markui-core/test/visual/__diff__/png/<theme>/*.png
packages/markui-core/test/visual/render-fixture.html
packages/markui-core/test/visual/visual.spec.ts
```

Recommended commands:

```powershell
pnpm --filter @jonkeda/markui-core visual
pnpm --filter @jonkeda/markui-core visual:update
```

Initial threshold:

```text
maxDiffPixelRatio: 0.005
```

Tighten once fonts, rendering, and CI are stable.

### Layer 4: Example Gallery

Purpose: make review pleasant when many previews are suspicious.

Generate an HTML gallery containing:

- Source fixture.
- Rendered SVG.
- Theme selector or one column per theme.
- Parse warnings/errors.
- Link to generated PNG.

Recommended command:

```powershell
pnpm visual:gallery
```

Recommended paths:

```text
test-results/markui-visual-gallery/index.html
test-results/markui-visual-gallery/assets/
```

This should be a local review tool and CI artifact, not a committed baseline.

### Layer 5: Markdown Preview Visual Tests

Purpose: catch preview-specific issues where the same SVG looks fine alone but wrong inside markdown.

Approach:

- Build `markui-vscode` markdown preview bundle.
- Create a small HTML harness that loads the generated markdown preview CSS/script behavior or reproduces the wrapper.
- Render markdown files with `markui` fenced blocks.
- Screenshot each block.

High-risk cases:

- Multiple fenced blocks in one markdown file.
- Wide diagrams inside scroll containers.
- Dark mode theme detection.
- Blueprint/sketch theme CSS interactions.
- Markdown body CSS affecting SVG sizing.

Recommended paths:

```text
packages/markui-vscode/test/visual/markdown-fixtures/*.md
packages/markui-vscode/test/visual/markdown-preview.spec.ts
```

Recommended command:

```powershell
pnpm --filter markui-vscode visual:markdown
```

### Layer 6: VS Code Webview Smoke Tests

Purpose: verify the extension preview panel itself, including toolbar, zoom, fit, errors, and scroll behavior.

Approach:

- Use `@vscode/test-electron` or `vscode-test`.
- Open a fixture `.markui` workspace.
- Run `MarkUI: Open Preview`.
- Capture the webview panel screenshot.
- Run a small smoke matrix for zoom states.

Keep this layer small. It will be slower and more fragile than core renderer visual tests.

Recommended cases:

- Open preview for a valid diagram.
- Show parse errors above rendered output.
- Zoom in/out/reset.
- Fit-to-width.
- Export SVG still writes the same core output.

## Fixture Strategy

Use two fixture groups.

### Curated Regression Fixtures

These should be small and targeted. Commit them with baselines.

Examples:

- `box-open-right.markui`
- `nested-prefix-boxes.markui`
- `grid-columns.markui`
- `list-containers.markui`
- `forms-with-annotations.markui`
- `tables-sortable.markui`
- `navigation-tabs-breadcrumbs.markui`
- `textarea-and-dropdown.markui`
- `dense-dashboard.markui`
- `theme-contrast.markui`

### Real Example Fixtures

These come from `examples/`. They are broader and catch integration problems.

Options:

- Copy stable examples into `test/visual/fixtures/examples/`.
- Or reference `examples/` directly but require review when examples change.

Recommendation: start by referencing `examples/` directly for gallery generation, but use curated copies for strict PNG baselines.

## Visual Quality Assertions

Pixel diffs catch regressions, but they do not explain them. Add semantic checks that fail with clear messages.

Recommended assertions:

- No text element extends outside root SVG bounds.
- No text starts before x=0 or y=0.
- Every widget with a background rect has positive width and height.
- Document width/height is large enough for the widest/deepest AST node.
- Known single-line controls render with expected approximate height.
- Form fields grouped by parser do not collapse to the same row unless intended.
- No warning/error severity is produced for approved fixtures.

These can live beside visual tests and should run before PNG comparisons.

## Baseline Review Workflow

1. Run visual tests.
2. If a human asks for manual review, use `$markui-visual-review` in this chat on selected generated images.
3. If tests fail or manual review reports `needs-fix`, open the generated gallery.
4. Classify each diff or review finding:
   - intended renderer change
   - real regression
   - fixture changed
   - nondeterministic rendering
5. Fix regressions first.
6. Update baselines only after visual review.
7. Commit source changes and baseline changes together.

Recommended local commands:

```powershell
pnpm visual
pnpm visual:gallery
pnpm visual:update
```

Recommended CI behavior:

- Run Layer 1 and Layer 2 on every PR.
- Run Layer 3 on every PR once stable.
- Upload generated diffs and gallery as artifacts.
- Run Layer 5 and Layer 6 on main/nightly or before release.

## Implementation Roadmap

### Phase 0: Triage Current Broken Previews

Deliverables:

- Create a manual issue list of previews that look wrong.
- Capture screenshots before fixing.
- On explicit human command, use `$markui-visual-review` in this chat over selected screenshots and generated preview images.
- Record chat findings with fixture-level `looks-correct`, `needs-fix`, or `unsure` status when useful.
- Group issues by cause: parser tree, layout resolver, SVG renderer, markdown wrapper, or VS Code webview.

Acceptance criteria:

- Each known bad preview has a fixture name.
- Each known bad preview has a screenshot or generated SVG attached.
- Each known bad preview has a manual review note explaining what appears wrong or why it is uncertain when a human requested review.
- The visual test fixture list includes these cases.

### Phase 1: Core Visual Harness

Deliverables:

- Add `packages/markui-core/test/visual/fixtures/`.
- Add a script to compile fixtures to SVG for all themes.
- Add SVG sanity tests.
- Add gallery generation.

Suggested scripts:

```json
{
  "visual:svg": "vitest run src/renderer/svg-sanity.test.ts",
  "visual:gallery": "node scripts/generate-visual-gallery.cjs"
}
```

Acceptance criteria:

- All curated fixtures compile with zero parse errors.
- Gallery opens locally and shows all fixtures.
- No baseline comparison yet required.

### Phase 2: Golden SVG Baselines

Deliverables:

- Add baseline SVG files for curated fixtures.
- Add update and verify scripts.
- Normalize SVG output if needed.

Acceptance criteria:

- `visual:svg` fails when renderer geometry changes unexpectedly.
- Baseline updates are explicit.
- Diff output points to fixture and theme.

### Phase 3: PNG Pixel Baselines

Deliverables:

- Add Playwright dependency.
- Add browser harness for rendering SVG.
- Add PNG baseline comparisons for curated fixtures.
- Add CI artifact upload for diffs.

Suggested scripts:

```json
{
  "visual": "playwright test packages/markui-core/test/visual",
  "visual:update": "playwright test packages/markui-core/test/visual --update-snapshots"
}
```

Acceptance criteria:

- A text-overlap or clipping regression fails the test.
- Generated diffs are saved in a predictable location.
- Tests pass on local Windows and CI.

### Phase 4: Markdown Preview Harness

Deliverables:

- Add markdown fixture rendering.
- Include fenced block wrapper CSS.
- Screenshot standalone SVG vs markdown-wrapped SVG.

Acceptance criteria:

- Wide diagrams remain scrollable and not clipped.
- Multiple diagrams in one document render independently.
- Theme wrappers do not distort SVG dimensions.

### Phase 5: Extension Webview Smoke Tests

Deliverables:

- Add a small VS Code extension integration test suite.
- Open preview panel for one or two fixtures.
- Screenshot toolbar and diagram area.

Acceptance criteria:

- Preview opens successfully.
- Zoom controls work.
- Error panel appears for an invalid fixture.
- Screenshot is uploaded as CI artifact.

## Tooling Changes

Root `package.json`:

```json
{
  "scripts": {
    "visual": "pnpm --filter @jonkeda/markui-core visual",
    "visual:update": "pnpm --filter @jonkeda/markui-core visual:update",
    "visual:gallery": "node scripts/generate-visual-gallery.cjs"
  }
}
```

`packages/markui-core/package.json`:

```json
{
  "scripts": {
    "visual": "playwright test test/visual",
    "visual:update": "playwright test test/visual --update-snapshots",
    "visual:svg": "vitest run test/visual/svg-sanity.test.ts"
  },
  "devDependencies": {
    "@playwright/test": "^1.0.0"
  }
}
```

Use the actual latest Playwright version when implementing.

## Baseline Storage Policy

Commit:

- Curated fixture source files.
- Approved SVG baselines.
- Approved PNG baselines for stable core renderer tests.

Do not commit:

- Diff images.
- Generated galleries.
- Temporary screenshots.
- Webview smoke screenshots.

Recommended `.gitignore` additions:

```text
test-results/
packages/markui-core/test/visual/__generated__/
packages/markui-core/test/visual/__diff__/
packages/markui-vscode/test/visual/__generated__/
packages/markui-vscode/test/visual/__diff__/
```

## First Fixtures To Add

Start with the cases most likely to explain bad previews:

```text
01-basic-widgets.markui
02-open-right-box.markui
03-nested-prefix-boxes.markui
04-column-layout.markui
05-form-annotations.markui
06-table.markui
07-list-containers.markui
08-tabs-and-navigation.markui
09-dense-dashboard.markui
10-current-bad-preview.markui
```

The last fixture should be a minimized reproduction of whatever currently looks wrong.

## Open Questions

- Should visual baselines cover all themes or only `clean` at first?
- Should `examples/` be treated as strict baselines or gallery-only fixtures?
- Should renderer tests pin one font, or should they validate multiple monospaced fonts?
- Should markdown preview screenshots run in light and dark VS Code themes?
- Should visual tests fail on parse warnings, or only parse errors?

## Recommended First Implementation

Build the smallest useful version:

1. Add `test/visual/fixtures/10-current-bad-preview.markui` with one known broken preview.
2. Add `scripts/generate-visual-gallery.cjs`.
3. Generate SVG for `clean`, `sketch`, and `blueprint`.
4. Save the gallery to `test-results/markui-visual-gallery/index.html`.
5. Render PNG images for the fixture set.
6. Add `.github/skills/markui-visual-review/SKILL.md` for occasional human-commanded chat review.
7. Add SVG sanity checks for all fixtures.

This creates immediate value without introducing browser snapshot flakiness on day one. The manual chat review gives a fast first opinion on whether selected images look right and which fixes are needed, but only when a human asks for it. Once the bad previews are captured and the gallery is useful, add Playwright PNG baselines for the stable curated fixtures.
