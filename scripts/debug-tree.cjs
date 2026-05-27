const { parse } = require('../packages/markui-core/dist');

const src1 = `+--- Settings ----
|
++--- Account ----

  Email: <jane@example.com___>
  Name:  <Jane Smith_________>

++--- Appearance ----

  Theme:   <Dark v>
  Density: (*) Compact  ( ) Default

++--- Privacy ----

  Share usage data: {on/[off]}

+----`;

function dump(n, d = 0) {
  const indent = '  '.repeat(d);
  const info = [n.type];
  if (n.text) info.push(`"${n.text.substring(0, 50)}"`);
  info.push(`row=${n.row} col=${n.col}`);
  if (n.width) info.push(`w=${n.width}`);
  if (n.height) info.push(`h=${n.height}`);
  if (n.level) info.push(`level=${n.level}`);
  console.log(indent + info.join(' '));
  for (const c of n.children) dump(c, d + 1);
}

console.log('=== Nested Prefix ===');
dump(parse(src1, { mode: 'autofix' }).tree);

const src2 = `+--------+---------------------+
| Left   | Right               |
| column | column              |
+--------+---------------------+`;

const src3 = `+--@Modal--- Confirm Deletion -----------+
|                                        |
|  Are you sure you want to delete       |
|  this item? This cannot be undone.     |
|                                        |
|  [Delete]  [Cancel]                    |
|                                        |
+----------------------------------------+`;

console.log('\n=== Column Divider ===');
dump(parse(src2, { mode: 'autofix' }).tree);
console.log('\n=== Modal ===');
dump(parse(src3, { mode: 'autofix' }).tree);

const src4 = `+---------+---------------------+
| Sidebar . Main Content        |
| [Nav 1] . Some text here      |
| [Nav 2] .                     |
+---------+---------------------+`;
console.log('\n=== Resizable Splitter ===');
dump(parse(src4, { mode: 'autofix' }).tree);
