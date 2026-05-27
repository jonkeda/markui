import {
  TokenMap, MergedMap, MergedEntry,
  LineToken, WidgetNode, WidgetType, ParseError, ParseMode,
} from '../types';

export function mergeMultiLine(
  tokenMap: TokenMap,
  mode: ParseMode
): { mergedMap: MergedMap; errors: ParseError[] } {
  const mergedMap: MergedMap = new Map();
  const errors: ParseError[] = [];

  for (const [key, entry] of tokenMap) {
    const widgets = mergeTokenLines(entry.tokens);
    const me: MergedEntry = { widgets };

    if (entry.columns) {
      me.columns = entry.columns.map(col => ({
        left: col.left,
        right: col.right,
        widgets: mergeTokenLines(col.tokens),
      }));
    }

    mergedMap.set(key, me);
  }

  return { mergedMap, errors };
}

function mergeTokenLines(tokenLines: LineToken[][]): WidgetNode[] {
  const widgets: WidgetNode[] = [];
  let i = 0;

  while (i < tokenLines.length) {
    const line = tokenLines[i];
    if (line.length === 0) { i++; continue; }

    // Try multi-line merges in priority order
    let consumed = tryMergeTable(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    consumed = tryMergeTextarea(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    consumed = tryMergeExpandedDropdown(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    consumed = tryMergeAccordion(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    consumed = tryMergeImage(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    consumed = tryMergeFormField(tokenLines, i, widgets);
    if (consumed > 0) { i += consumed; continue; }

    // No multi-line merge — convert single-line tokens to widget nodes
    for (const tok of line) {
      widgets.push(tokenToNode(tok));
    }
    i++;
  }

  return widgets;
}

// ---------------------------------------------------------------------------
// Table merge: consecutive |...| lines with a |---| separator
// ---------------------------------------------------------------------------

function tryMergeTable(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  if (lines[startIdx].length !== 1 || lines[startIdx][0].type !== 'TableRow') return 0;

  let end = startIdx;
  while (end < lines.length && lines[end].length === 1 && lines[end][0].type === 'TableRow') {
    end++;
  }

  if (end - startIdx < 2) return 0;

  const rows = lines.slice(startIdx, end).map(l => l[0]);
  // Check for separator row
  const sepIdx = rows.findIndex(r => r.state === 'separator');

  const tableChildren: WidgetNode[] = [];
  for (let ri = 0; ri < rows.length; ri++) {
    const rowTok = rows[ri];
    if (rowTok.state === 'separator') continue;

    const isHeader = sepIdx !== -1 && ri < sepIdx;
    const rowType: WidgetType = isHeader ? 'TableHeader' : 'TableRow';
    const cellChildren: WidgetNode[] = (rowTok.children || []).map(c => ({
      type: 'TableCell' as WidgetType,
      text: c.text,
      row: c.row ?? 0,
      col: c.start,
      width: c.end - c.start,
      children: [],
    }));

    tableChildren.push({
      type: rowType,
      text: rowTok.text,
      row: rowTok.row ?? 0,
      col: rowTok.start,
      width: rowTok.end - rowTok.start,
      children: cellChildren,
    });
  }

  out.push({
    type: 'Table',
    row: rows[0].row ?? 0,
    col: rows[0].start,
    width: rows[0].end - rows[0].start,
    height: end - startIdx,
    children: tableChildren,
  });

  return end - startIdx;
}

// ---------------------------------------------------------------------------
// Textarea: consecutive TextInput lines of similar width
// ---------------------------------------------------------------------------

function tryMergeTextarea(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  const first = lines[startIdx];
  if (first.length !== 1 || first[0].type !== 'TextInput') return 0;

  let end = startIdx + 1;
  const firstWidth = first[0].end - first[0].start;
  while (end < lines.length) {
    const line = lines[end];
    if (line.length !== 1 || line[0].type !== 'TextInput') break;
    const w = line[0].end - line[0].start;
    if (Math.abs(w - firstWidth) > 2) break;
    end++;
  }

  if (end - startIdx < 2) return 0;

  const allLines = lines.slice(startIdx, end).map(l => l[0]);
  const combinedText = allLines.map(t => t.value || t.text).join('\n');

  out.push({
    type: 'Textarea',
    text: combinedText,
    value: combinedText,
    row: allLines[0].row ?? 0,
    col: allLines[0].start,
    width: firstWidth,
    height: end - startIdx,
    children: [],
  });

  return end - startIdx;
}

// ---------------------------------------------------------------------------
// Expanded Dropdown: <text ^> followed by option lines
// ---------------------------------------------------------------------------

function tryMergeExpandedDropdown(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  const first = lines[startIdx];
  if (first.length !== 1 || first[0].type !== 'Dropdown' || first[0].state !== 'expanded') return 0;

  let end = startIdx + 1;
  const options: WidgetNode[] = [];

  while (end < lines.length) {
    const line = lines[end];
    if (line.length === 0) { end++; continue; }

    // Check for option lines (indented text, checkboxes, or -> end marker)
    const firstTok = line[0];
    if (firstTok.type === 'Checkbox') {
      // Multi-select option
      const label = line.length > 1 ? line.slice(1).map(t => t.text).join(' ') : '';
      options.push({
        type: 'DropdownOption',
        text: label,
        state: firstTok.state,
        row: firstTok.row ?? 0,
        col: firstTok.start,
        width: firstTok.end - firstTok.start,
        children: [],
      });
      end++;
      continue;
    }

    if (firstTok.type === 'Label') {
      const txt = firstTok.text.trim();
      if (txt === '->') { end++; break; }
      options.push({
        type: 'DropdownOption',
        text: txt,
        row: firstTok.row ?? 0,
        col: firstTok.start,
        width: firstTok.end - firstTok.start,
        children: [],
      });
      end++;
      continue;
    }

    break;
  }

  if (options.length === 0) return 0;

  out.push({
    type: 'Dropdown',
    text: first[0].text,
    state: 'expanded',
    row: first[0].row ?? 0,
    col: first[0].start,
    width: first[0].end - first[0].start,
    children: options,
  });

  return end - startIdx;
}

// ---------------------------------------------------------------------------
// Accordion: consecutive [Header v]/[Header ^] patterns
// ---------------------------------------------------------------------------

function tryMergeAccordion(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  const first = lines[startIdx];
  if (first.length !== 1 || first[0].type !== 'Accordion') return 0;

  const sections: WidgetNode[] = [];
  let end = startIdx;

  while (end < lines.length) {
    const line = lines[end];
    if (line.length === 0) { end++; continue; }
    if (line.length !== 1 || line[0].type !== 'Accordion') {
      if (sections.length > 0) break;
      break;
    }

    const header = line[0];
    const sectionChildren: WidgetNode[] = [];

    // If expanded, collect content lines until next accordion header or empty line
    if (header.state === 'expanded') {
      end++;
      while (end < lines.length) {
        const contentLine = lines[end];
        if (contentLine.length === 0) break;
        if (contentLine.length === 1 && contentLine[0].type === 'Accordion') break;
        if (isAccordionCloseLine(contentLine)) {
          end++;
          break;
        }
        for (const tok of stripAccordionGuide(contentLine)) {
          sectionChildren.push(tokenToNode(tok));
        }
        end++;
      }
    } else {
      end++;
    }

    sections.push({
      type: 'Expander',
      text: header.text,
      state: header.state,
      row: header.row ?? 0,
      col: header.start,
      width: header.end - header.start,
      children: sectionChildren,
    });
  }

  if (sections.length < 2) {
    // Single accordion section — still output it
    if (sections.length === 1) {
      out.push(sections[0]);
      return end - startIdx;
    }
    return 0;
  }

  out.push({
    type: 'Accordion',
    row: sections[0].row,
    col: sections[0].col,
    width: sections[0].width,
    children: sections,
  });

  return end - startIdx;
}

function isAccordionCloseLine(line: LineToken[]): boolean {
  const text = line.map(tok => tok.text).join('');
  return /^\+-+\+$/.test(text);
}

function stripAccordionGuide(line: LineToken[]): LineToken[] {
  if (line.length === 0) return line;
  const [first, ...rest] = line;
  if (first.type !== 'Label' || !first.text.startsWith('|')) return line;

  const match = first.text.match(/^\|\s*/);
  const prefixLength = match?.[0].length ?? 1;
  const text = first.text.slice(prefixLength);
  if (text.length === 0) return rest;

  return [
    {
      ...first,
      text,
      start: first.start + prefixLength,
      end: first.start + prefixLength + text.length,
    },
    ...rest,
  ];
}

// ---------------------------------------------------------------------------
// Image: multi-line ! blocks  !=====! / ! IMG ! / !=====!
// ---------------------------------------------------------------------------

function tryMergeImage(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  const first = lines[startIdx];
  if (first.length !== 1 || first[0].type !== 'Image') return 0;

  // Single-line image is already handled by tokenizer
  // Check for multi-line: next lines also have Image tokens
  let end = startIdx + 1;
  while (end < lines.length && lines[end].length === 1 && lines[end][0].type === 'Image') {
    end++;
  }

  if (end - startIdx === 1) {
    // Single-line image — just convert
    out.push(tokenToNode(first[0]));
    return 1;
  }

  // Multi-line image — combine
  const allTokens = lines.slice(startIdx, end).map(l => l[0]);
  const imgText = allTokens.map(t => t.text).filter(t => t && t !== 'IMG').join(' ') || 'IMG';

  out.push({
    type: 'Image',
    text: imgText,
    row: allTokens[0].row ?? 0,
    col: allTokens[0].start,
    width: Math.max(...allTokens.map(t => t.end - t.start)),
    height: end - startIdx,
    children: [],
  });

  return end - startIdx;
}

// ---------------------------------------------------------------------------
// Form field: label followed by input, optionally followed by annotation
// ---------------------------------------------------------------------------

function tryMergeFormField(lines: LineToken[][], startIdx: number, out: WidgetNode[]): number {
  if (startIdx + 1 >= lines.length) return 0;

  const labelLine = lines[startIdx];
  const inputLine = lines[startIdx + 1];

  // Label line: single Label token ending with ':'
  if (
    labelLine.length !== 1 ||
    labelLine[0].type !== 'Label' ||
    !labelLine[0].text.endsWith(':')
  ) return 0;

  // Input line: single input-type token
  if (inputLine.length !== 1) return 0;
  const inputType = inputLine[0].type;
  const inputTypes: WidgetType[] = [
    'TextInput', 'PasswordInput', 'DateInput', 'NumberInput',
    'Textarea', 'Dropdown', 'CustomInput',
  ];
  if (!inputTypes.includes(inputType)) return 0;

  const labelNode = tokenToNode(labelLine[0]);
  const inputNode = tokenToNode(inputLine[0]);
  const children = [labelNode, inputNode];
  let consumed = 2;

  // Check for annotation on next line
  if (startIdx + 2 < lines.length) {
    const annoLine = lines[startIdx + 2];
    if (annoLine.length === 1 && annoLine[0].type === 'Annotation') {
      children.push(tokenToNode(annoLine[0]));
      consumed = 3;
    }
  }

  out.push({
    type: 'FormField',
    text: labelLine[0].text,
    row: labelLine[0].row ?? 0,
    col: labelLine[0].start,
    width: Math.max(
      labelLine[0].end - labelLine[0].start,
      inputLine[0].end - inputLine[0].start
    ),
    children,
  });

  return consumed;
}

// ---------------------------------------------------------------------------
// Token → WidgetNode conversion
// ---------------------------------------------------------------------------

function tokenToNode(tok: LineToken): WidgetNode {
  const node: WidgetNode = {
    type: tok.type,
    text: tok.text,
    row: tok.row ?? 0,
    col: tok.start,
    width: tok.end - tok.start,
    children: [],
  };
  if (tok.value !== undefined) node.value = tok.value;
  if (tok.state !== undefined) node.state = tok.state;
  if (tok.iconIndex !== undefined) node.iconIndex = tok.iconIndex;
  if (tok.level !== undefined) node.level = tok.level;
  if (tok.annotationType !== undefined) node.annotationType = tok.annotationType;
  if (tok.percentage !== undefined) node.percentage = tok.percentage;
  if (tok.numerator !== undefined) node.numerator = tok.numerator;
  if (tok.denominator !== undefined) node.denominator = tok.denominator;

  if (tok.children) {
    node.children = tok.children.map(c => tokenToNode(c));
  }

  return node;
}
