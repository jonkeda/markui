const fs = require('fs');
const path = require('path');
const { compile } = require('../packages/markui-core/dist/index');

const dir = path.join(__dirname, '..', 'examples');
const bt = '`'.repeat(3);
const re = new RegExp(bt + 'markui(?::[\\w-]*)?\\r?\\n([\\s\\S]*?)' + bt, 'g');

const mdFiles = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();

for (const f of mdFiles) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const blocks = [];
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(content)) !== null) {
    blocks.push(m[1]);
  }
  let totalNodes = 0;
  let totalErrors = 0;
  for (const src of blocks) {
    const { errors, tree } = compile(src);
    const count = (n) => {
      let c = 1;
      for (const ch of n.children) c += count(ch);
      return c;
    };
    totalNodes += count(tree);
    totalErrors += errors.filter(e => e.severity === 'error').length;
  }
  console.log(`${f}: ${blocks.length} blocks, ${totalNodes} nodes, ${totalErrors} errors`);
}
