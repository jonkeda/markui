---
name: markui-visual-review
description: Manual, human-commanded visual review of generated MarkUI preview images against their `.markui` source. Use only when the user explicitly asks to use this skill, asks for a chat-based/manual visual comparison, or asks whether generated MarkUI gallery images look correct; do not run automatically, in CI, or as part of routine visual tests.
---

# MarkUI Visual Review

## Overview

Compare generated MarkUI preview images with their source in the current chat. This is an occasional human-in-the-loop review step for suspicious previews, not an automated test gate.

## Guardrails

- Use this skill only on explicit human command.
- Do not call external LLM APIs for review.
- Do not run this in CI.
- Prefer reviewing a small set of suspicious fixtures, not the full gallery.
- Produce actionable findings, not baseline approvals.

## Workflow

1. Generate review artifacts if they do not exist:

```powershell
pnpm visual:gallery
```

2. Identify the fixture images to review. Prefer generated PNGs under:

```text
test-results/markui-visual-gallery/assets/png/<theme>/
```

3. Read the matching source file from:

```text
packages/markui-core/test/visual/fixtures/
examples/
```

4. Use the chat's image viewing capability to inspect each PNG. Compare only what is visible in the image to the source and parser diagnostics.

5. Classify each reviewed preview as one of:

- `looks-correct`: visual output matches the source closely enough.
- `needs-fix`: clipping, overlap, missing content, wrong layout, wrong widget type, unreadable theme, or suspicious parser/rendering behavior is visible.
- `unsure`: image/source is ambiguous or more context is needed.

## Review Checklist

- Does the preview match the ASCII structure?
- Are boxes, list containers, dividers, and nested regions placed correctly?
- Is any text clipped, overlapping, missing, or misaligned?
- Do widgets look like the intended control type?
- Is the SVG canvas large enough for all content?
- Is the selected theme readable?
- Is the issue likely parser, layout, renderer, markdown wrapper, or webview related?

## Output Format

Return concise findings:

```markdown
## MarkUI Visual Review

| Fixture | Theme | Status | Finding |
|---------|-------|--------|---------|
| 10-current-bad-preview.markui | clean | needs-fix | Text clips at right edge in nested content area. |

### Recommended Fixes

- Renderer: expand document width from child text bounds, not only AST node width.
- Fixture: add a minimized regression fixture if this is a new failure mode.
```

## When Fixing

- Add or update a fixture that reproduces the visual issue.
- Run `pnpm visual:svg` after parser/renderer changes.
- Run `pnpm visual:gallery` when visual inspection is needed.
- Do not update baselines or declare a preview approved without human confirmation.
