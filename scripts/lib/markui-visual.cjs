const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const fixtureRoot = path.join(repoRoot, 'packages', 'markui-core', 'test', 'visual', 'fixtures');
const examplesRoot = path.join(repoRoot, 'examples');
const defaultThemes = ['clean', 'sketch', 'blueprint'];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readCore() {
  const corePath = path.join(repoRoot, 'packages', 'markui-core', 'dist', 'index.js');
  if (!fs.existsSync(corePath)) {
    throw new Error(`Missing ${corePath}. Run "pnpm --filter @jonkeda/markui-core build" first.`);
  }
  return require(corePath);
}

function slugify(value) {
  return value
    .replace(/\\/g, '/')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listMarkuiFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => name.endsWith('.markui'))
    .sort()
    .map(name => path.join(dir, name));
}

function getFixtureFiles(options = {}) {
  const files = listMarkuiFiles(fixtureRoot).map(file => ({
    suite: 'curated',
    file,
    id: slugify(path.basename(file)),
  }));

  if (options.includeExamples) {
    files.push(...listMarkuiFiles(examplesRoot).map(file => ({
      suite: 'examples',
      file,
      id: `example-${slugify(path.basename(file))}`,
    })));
  }

  return files;
}

function getThemes(value) {
  if (Array.isArray(value)) {
    return value.map(theme => String(theme).trim()).filter(Boolean);
  }
  const raw = value || process.env.MARKUI_VISUAL_THEMES || defaultThemes.join(',');
  return raw.split(',').map(theme => theme.trim()).filter(Boolean);
}

function renderSvgToPng(svg, outputPath) {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (err) {
    return Promise.resolve({
      ok: false,
      error: `sharp is not available: ${err.message}`,
    });
  }

  ensureDir(path.dirname(outputPath));
  return sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath)
    .then(() => ({ ok: true, outputPath }))
    .catch(err => ({ ok: false, error: err.message }));
}

async function generateVisualOutputs(options = {}) {
  const { compile } = readCore();
  const outDir = options.outDir || path.join(repoRoot, 'test-results', 'markui-visual-gallery');
  const themes = getThemes(options.themes);
  const fixtures = getFixtureFiles({ includeExamples: options.includeExamples });
  const records = [];

  ensureDir(outDir);

  for (const fixture of fixtures) {
    const source = fs.readFileSync(fixture.file, 'utf8');
    const record = {
      id: fixture.id,
      suite: fixture.suite,
      name: path.basename(fixture.file),
      sourcePath: fixture.file,
      relativePath: path.relative(repoRoot, fixture.file),
      source,
      themes: [],
    };

    for (const theme of themes) {
      const compiled = compile(source, { mode: 'autofix', theme });
      const svgDir = path.join(outDir, 'assets', 'svg', theme);
      const pngDir = path.join(outDir, 'assets', 'png', theme);
      const svgPath = path.join(svgDir, `${fixture.id}.svg`);
      const pngPath = path.join(pngDir, `${fixture.id}.png`);

      ensureDir(svgDir);
      fs.writeFileSync(svgPath, compiled.svg, 'utf8');

      const png = await renderSvgToPng(compiled.svg, pngPath);
      record.themes.push({
        theme,
        svg: compiled.svg,
        svgPath,
        pngPath: png.ok ? pngPath : undefined,
        pngError: png.ok ? undefined : png.error,
        errors: compiled.errors,
        tree: compiled.tree,
      });
    }

    records.push(record);
  }

  return { repoRoot, outDir, themes, records };
}

function toPosixRelative(from, to) {
  return path.relative(from, to).replace(/\\/g, '/');
}

module.exports = {
  defaultThemes,
  ensureDir,
  escapeHtml,
  fixtureRoot,
  generateVisualOutputs,
  getFixtureFiles,
  getThemes,
  repoRoot,
  toPosixRelative,
};
