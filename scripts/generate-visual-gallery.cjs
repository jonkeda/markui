#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  escapeHtml,
  generateVisualOutputs,
  toPosixRelative,
} = require('./lib/markui-visual.cjs');

function renderDiagnostics(errors) {
  if (!errors.length) return '<p class="ok">No parser diagnostics.</p>';
  const items = errors.map(err => {
    const cls = err.severity === 'error' ? 'error' : err.severity === 'warning' ? 'warning' : 'info';
    return `<li class="${cls}">${escapeHtml(err.severity)} ${escapeHtml(err.code)} at ${err.row}:${err.col} - ${escapeHtml(err.message)}</li>`;
  }).join('\n');
  return `<ul class="diagnostics">${items}</ul>`;
}

function renderGallery({ outDir, records }) {
  const cards = records.map(record => {
    const previews = record.themes.map(themeRecord => {
      const image = themeRecord.pngPath
        ? `<img src="${toPosixRelative(outDir, themeRecord.pngPath)}" alt="${escapeHtml(record.name)} ${escapeHtml(themeRecord.theme)} preview">`
        : `<div class="svg-fallback">${themeRecord.svg}</div><p class="warning">PNG generation failed: ${escapeHtml(themeRecord.pngError || 'unknown error')}</p>`;

      return `
        <section class="theme">
          <h3>${escapeHtml(themeRecord.theme)}</h3>
          <div class="preview">${image}</div>
          ${renderDiagnostics(themeRecord.errors)}
          <p><a href="${toPosixRelative(outDir, themeRecord.svgPath)}">SVG</a>${themeRecord.pngPath ? ` | <a href="${toPosixRelative(outDir, themeRecord.pngPath)}">PNG</a>` : ''}</p>
        </section>`;
    }).join('\n');

    return `
      <article class="fixture">
        <header>
          <h2>${escapeHtml(record.name)}</h2>
          <p>${escapeHtml(record.suite)} | ${escapeHtml(record.relativePath)}</p>
        </header>
        <div class="fixture-grid">
          <section>
            <h3>Source</h3>
            <pre>${escapeHtml(record.source)}</pre>
          </section>
          <section class="themes">
            ${previews}
          </section>
        </div>
      </article>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MarkUI Visual Gallery</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; color: #1f2937; background: #f8fafc; }
  header.page { padding: 24px; background: #111827; color: #f9fafb; }
  header.page h1 { margin: 0 0 8px; font-size: 28px; }
  header.page p { margin: 0; color: #d1d5db; }
  .fixture { margin: 24px; padding: 20px; background: white; border: 1px solid #d1d5db; }
  .fixture > header { margin-bottom: 16px; }
  .fixture h2 { margin: 0 0 4px; font-size: 20px; }
  .fixture header p { margin: 0; color: #6b7280; font-size: 13px; }
  .fixture-grid { display: grid; grid-template-columns: minmax(280px, 420px) minmax(0, 1fr); gap: 16px; align-items: start; }
  pre { margin: 0; padding: 12px; overflow: auto; background: #0f172a; color: #e5e7eb; font: 12px/1.45 Consolas, monospace; }
  .themes { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
  .theme { min-width: 0; }
  .theme h3 { margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .04em; }
  .preview { overflow: auto; padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb; }
  .preview img { display: block; max-width: 100%; height: auto; background: white; }
  .svg-fallback svg { max-width: 100%; height: auto; }
  .diagnostics { margin: 8px 0; padding-left: 18px; font: 12px/1.4 Consolas, monospace; }
  .ok { color: #047857; font-size: 12px; }
  .error { color: #b91c1c; }
  .warning { color: #a16207; }
  .info { color: #1d4ed8; }
  @media (max-width: 900px) { .fixture-grid { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header class="page">
  <h1>MarkUI Visual Gallery</h1>
  <p>Generated ${escapeHtml(new Date().toISOString())}</p>
</header>
${cards}
</body>
</html>`;
}

async function main() {
  const includeExamples = process.env.MARKUI_VISUAL_INCLUDE_EXAMPLES !== '0';
  const outDir = process.env.MARKUI_VISUAL_OUT
    ? path.resolve(process.env.MARKUI_VISUAL_OUT)
    : undefined;

  const output = await generateVisualOutputs({ includeExamples, outDir });
  const html = renderGallery(output);
  const indexPath = path.join(output.outDir, 'index.html');
  fs.writeFileSync(indexPath, html, 'utf8');

  console.log(`Generated ${output.records.length} visual fixture(s).`);
  console.log(indexPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
