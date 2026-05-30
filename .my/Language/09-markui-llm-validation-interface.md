# MarkUI LLM Validation Interface

**Date:** 2026-05-30
**Status:** Initial implementation
**Purpose:** Decide whether MarkUI needs a CLI, an MCP server, or both so an LLM can validate generated MarkUI before returning it.

---

## 1. Problem

MarkUI is intentionally compact and human-editable, which makes it a good target for LLM-generated wireframes. The weak point is validation feedback. An LLM can produce plausible ASCII UI that looks right to a person but fails parser rules, renders oddly, or drifts away from documented syntax.

The validation loop should let an LLM:

- submit a `.markui` document or markdown fenced block,
- receive parser diagnostics with stable codes and exact locations,
- distinguish strict validation errors from autofix preview warnings,
- optionally receive a rendered artifact or dimensions for visual sanity checks,
- revise the MarkUI and validate again.

This is different from general documentation. The LLM needs a tool with a small, stable, machine-readable contract.

---

## 2. Existing Direction

The parser architecture already separates two modes:

| Mode | Intended Use |
|------|--------------|
| `strict` | validation, CI, linting, export gates |
| `autofix` | live preview, markdown preview, best-effort rendering |

The architecture notes already identify `markui validate` as the strict-mode surface for linting and CI. The VS Code extension also consumes parser diagnostics for editor feedback.

That means the core validator should not be invented in a separate agent tool. The public surface should wrap `@jonkeda/markui-core` and preserve its `ParseError` shape:

```typescript
interface ParseError {
  code: string;
  message: string;
  row: number;
  col: number;
  endRow?: number;
  endCol?: number;
  severity: 'error' | 'warning' | 'info';
  phase: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
```

---

## 3. CLI Option

A CLI would be the simplest validation interface:

```bash
markui validate screen.markui --format json
markui validate README.md --markdown --format json
markui render screen.markui --format svg --out screen.svg
```

Recommended CLI behavior:

| Command | Behavior |
|---------|----------|
| `markui validate <file>` | Parse one `.markui` file in `strict` mode. |
| `markui validate <glob>` | Validate multiple files and aggregate diagnostics. |
| `markui validate --stdin` | Accept generated MarkUI from an LLM without creating a temporary file. |
| `markui validate --markdown` | Extract and validate fenced `markui` and `markui:name` blocks. |
| `markui validate --mode strict\|autofix` | Default to `strict`, allow preview-oriented checks. |
| `markui validate --format text\|json` | Default to text for humans, JSON for agents. |
| `markui render <file>` | Render to SVG, optionally after strict validation. |

Recommended exit codes:

| Code | Meaning |
|------|---------|
| `0` | No errors. Warnings may exist if not promoted. |
| `1` | Validation found one or more errors. |
| `2` | Tool usage, file IO, or internal failure. |

Recommended JSON shape:

```json
{
  "ok": false,
  "mode": "strict",
  "files": [
    {
      "path": "screen.markui",
      "blocks": [
        {
          "name": null,
          "startLine": 1,
          "ok": false,
          "errors": [
            {
              "code": "BRACKET_UNCLOSED",
              "message": "Unclosed bracket",
              "row": 8,
              "col": 12,
              "severity": "error",
              "phase": 4
            }
          ]
        }
      ]
    }
  ]
}
```

### Why a CLI Helps LLMs

- Most coding agents can run shell commands already.
- CI, local development, docs validation, and release checks can use the same interface.
- `--stdin --format json` gives LLMs a clean validate-revise loop.
- It is easy to version with the package and test in the workspace.
- It avoids MCP-specific setup for users who only want validation.

### CLI Limits

- Some LLM hosts do not expose a shell.
- Shell output can be less discoverable than named tools.
- The agent must know which command to run and how to interpret its output.
- Long markdown files may require careful block extraction and line-offset reporting.

---

## 4. MCP Server Option

An MCP server would expose MarkUI validation as named tools for LLM clients:

| Tool | Behavior |
|------|----------|
| `validate_markui` | Validate source text and return structured diagnostics. |
| `validate_markdown_markui_blocks` | Validate all fenced MarkUI blocks in markdown. |
| `render_markui_svg` | Return SVG or an artifact reference for a valid source. |
| `explain_markui_diagnostic` | Return focused repair guidance for one diagnostic code. |

Example tool input:

```json
{
  "source": "+--- Settings ---+\n| [Save        |\n+----------------+",
  "mode": "strict",
  "sourceName": "generated.markui"
}
```

Example tool output:

```json
{
  "ok": false,
  "mode": "strict",
  "diagnostics": [
    {
      "code": "BRACKET_UNCLOSED",
      "message": "Unclosed bracket",
      "row": 2,
      "col": 3,
      "severity": "error",
      "phase": 4,
      "repairHint": "Close the button with ] before the box border."
    }
  ]
}
```

### Why MCP Helps LLMs

- The tool name advertises the capability directly to the model.
- Inputs and outputs are structured without shell quoting or temporary files.
- Hosts can sandbox the server while still allowing validation.
- The server can expose MarkUI docs, diagnostic references, and examples as resources.
- It is friendlier for chat-first environments where the user does not think in terminal commands.

### MCP Limits

- It adds protocol, packaging, and installation complexity.
- It duplicates surface area unless it wraps the same core library or CLI.
- MCP host support is still not universal.
- A persistent server can create version-skew questions: which MarkUI grammar is the LLM validating against?

---

## 5. Recommendation

Build a CLI first, then add an MCP server only as a thin wrapper around the same validation library.

The CLI should be the canonical automation contract because it helps more than LLMs: it supports CI, example validation, local scripts, package consumers, and release checks. A reliable CLI with stable JSON output is also enough for coding agents that can run commands.

The MCP server becomes valuable after the CLI contract is stable. It should not own validation behavior. It should import `@jonkeda/markui-core` directly or call the same shared validation module used by the CLI.

Recommended implementation order:

1. Add `markui validate` with `--stdin`, `--format json`, `--markdown`, and strict-mode default.
2. Use that CLI in `scripts/check-examples.cjs` or a replacement script so examples and docs exercise the same path as users.
3. Add targeted repair hints keyed by diagnostic code.
4. Add `markui render` once validation output is stable.
5. Add an MCP server exposing `validate_markui` and `validate_markdown_markui_blocks` if agent-host usage becomes a primary workflow.

---

## 6. Shared Contract

Both surfaces should share a single validation contract:

| Concern | Decision |
|---------|----------|
| Parser mode | Default to `strict`; allow `autofix` explicitly. |
| Diagnostic shape | Reuse core `ParseError` fields. |
| Locations | Report both block-relative and file-relative locations for markdown. |
| Output | JSON must be stable enough for LLM parsing. |
| Human text | Text output can change; JSON should not change casually. |
| Repairs | Use short `repairHint` strings, not automatic source rewrites at first. |
| Rendering | Render only after validation, unless `--force` or `mode: "autofix"` is explicit. |

For markdown fenced blocks, diagnostics should include enough context for an LLM to patch the correct block:

```typescript
interface MarkuiBlockDiagnostic {
  path?: string;
  blockName?: string;
  blockIndex: number;
  blockStartLine: number;
  row: number;
  col: number;
  fileRow: number;
  fileCol: number;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

---

## 7. Open Questions

- Should the CLI live in `@jonkeda/markui-core` as a `bin`, or in a separate package such as `@jonkeda/markui-cli`?
- Should warnings fail validation by default, or only under `--max-warnings 0`?
- Should `validate --markdown` support named component references across blocks in the same markdown file?
- Should the MCP server expose rendered SVG directly, or write artifacts and return references?
- Should repair hints live in core with diagnostics, or in a higher-level validator package?

---

## 8. Decision

We need a validation interface for LLM-generated MarkUI. Start with a CLI because it is the smallest useful primitive and serves CI, docs, local development, and coding agents at the same time.

An MCP server is useful, but it should come second. Its job is to make the CLI/core validation contract easier for LLM hosts to call, not to become a separate source of MarkUI truth.

---

## 9. Initial Implementation

The first implementation uses three TypeScript workspace packages:

| Package | Role |
|---------|------|
| `@jonkeda/markui-validator` | Shared JSON validation contract, markdown fence extraction, file/block diagnostic shaping, repair hints. |
| `@jonkeda/markui-cli` | `markui validate` and `markui render` command line interface. |
| `@jonkeda/markui-mcp` | stdio MCP server for LLM hosts. |

The CLI exposes:

```bash
markui validate screen.markui --format json
markui validate README.md --format json
markui validate --stdin --markdown --format json
markui render screen.markui --out screen.svg
```

The MCP server exposes:

| Tool | Purpose |
|------|---------|
| `validate_markui` | Validate raw MarkUI source text. |
| `validate_markdown_markui_blocks` | Validate fenced MarkUI blocks in markdown. |
| `render_markui_svg` | Render MarkUI source to SVG after validation, unless `force` is set. |
| `explain_markui_diagnostic` | Return a focused repair hint for a diagnostic code. |

Both surfaces use `@jonkeda/markui-validator`, so CLI JSON and MCP structured output share one shape.
