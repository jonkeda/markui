import {
  ContentMap, TokenMap, TokenEntry,
  LineToken, WidgetType, ParseError, ParseMode,
} from '../types';

export function tokenizeLines(
  contentMap: ContentMap,
  mode: ParseMode
): { tokenMap: TokenMap; errors: ParseError[] } {
  const tokenMap: TokenMap = new Map();
  const errors: ParseError[] = [];

  for (const [key, entry] of contentMap) {
    const tokenizedLines: LineToken[][] = [];
    for (const line of entry.lines) {
      const tokens = tokenizeLine(line.text, line.row, line.colOffset);
      tokenizedLines.push(tokens);
    }

    const te: TokenEntry = { tokens: tokenizedLines };
    if (entry.columns) {
      te.columns = entry.columns.map(col => ({
        left: col.left,
        right: col.right,
        tokens: col.lines.map(l => tokenizeLine(l.text, l.row, l.colOffset)),
      }));
    }

    tokenMap.set(key, te);
  }

  return { tokenMap, errors };
}

// ---------------------------------------------------------------------------
// Main line tokenizer
// ---------------------------------------------------------------------------

function tokenizeLine(text: string, row: number, colOffset: number): LineToken[] {
  const trimmed = text.trim();
  if (trimmed.length === 0) return [];

  // Whole-line: separator (3+ dashes only)
  if (/^-{3,}$/.test(trimmed)) {
    const start = text.indexOf('-');
    return [{
      type: 'Separator', text: trimmed,
      start: start + colOffset, end: start + trimmed.length + colOffset,
    }];
  }

  // Whole-line: breadcrumb  text > text > text
  if (
    trimmed.includes(' > ') &&
    !trimmed.startsWith('[') &&
    !trimmed.startsWith('<') &&
    !trimmed.startsWith('{') &&
    !trimmed.startsWith('(')
  ) {
    const parts = trimmed.split(' > ');
    if (parts.length >= 2 && parts.every(p => p.trim().length > 0)) {
      const s = text.indexOf(trimmed) + colOffset;
      return [{
        type: 'Breadcrumb', text: trimmed,
        start: s, end: s + trimmed.length,
        children: parts.map((p, idx) => ({
          type: 'Label' as WidgetType,
          text: p.trim(),
          start: s, end: s + p.length,
        })),
      }];
    }
  }

  // Whole-line: table row  |cell|cell|
  if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length >= 3) {
    return parseTableRow(trimmed, row, colOffset + text.indexOf(trimmed));
  }

  // Heading at line start
  const headingMatch = text.match(/^(\s*)(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    const indent = headingMatch[1].length;
    const level = headingMatch[2].length;
    const hText = headingMatch[3];
    return [{
      type: 'Heading', text: hText,
      start: indent + colOffset, end: indent + headingMatch[2].length + 1 + hText.length + colOffset,
      level,
    }];
  }

  // Component ref at line start
  const compMatch = text.match(/^(\s*)@(\w[\w.-]*)(.*)$/);
  if (compMatch) {
    const indent = compMatch[1].length;
    const name = compMatch[2];
    return [{
      type: 'ComponentRef', text: name,
      start: indent + colOffset, end: indent + 1 + name.length + colOffset,
    }];
  }

  // Annotation at line start: (?) text, ($) text, etc.
  const annoMatch = text.match(/^(\s*)\(([?$!ixv])\)\s+(.*)$/);
  if (annoMatch) {
    const indent = annoMatch[1].length;
    const aType = annoMatch[2];
    const aText = annoMatch[3];
    return [{
      type: 'Annotation', text: aText,
      start: indent + colOffset, end: text.length + colOffset,
      annotationType: aType,
    }];
  }

  // Character-by-character scan
  const tokens: LineToken[] = [];
  let i = 0;

  while (i < text.length) {
    // Skip whitespace
    if (text[i] === ' ' || text[i] === '\t') { i++; continue; }

    let token: LineToken | null = null;

    switch (text[i]) {
      case '[': token = tryBracket(text, i, row, colOffset); break;
      case '<': token = tryAngle(text, i, row, colOffset); break;
      case '{': token = tryBrace(text, i, row, colOffset); break;
      case '(': token = tryParen(text, i, row, colOffset); break;
      case '!': token = tryImage(text, i, row, colOffset); break;
      case '_': token = tryLink(text, i, row, colOffset); break;
      case '#': token = tryIcon(text, i, row, colOffset); break;
      case '+':
      case '-':
        if (i < text.length - 1 && text[i + 1] === ' ') {
          token = tryTreeNode(text, i, row, colOffset);
        }
        break;
    }

    if (token) {
      tokens.push(token);
      i = token.end - colOffset;
    } else {
      // Collect plain text as Label
      const labelStart = i;
      i++;
      while (i < text.length && !isSpecialStart(text, i)) {
        i++;
      }
      const labelText = text.substring(labelStart, i).trimEnd();
      if (labelText.trim().length > 0) {
        tokens.push({
          type: 'Label', text: labelText.trim(),
          start: labelStart + colOffset, end: labelStart + labelText.length + colOffset,
        });
      }
    }
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Character classification
// ---------------------------------------------------------------------------

function isSpecialStart(text: string, i: number): boolean {
  const ch = text[i];
  if (ch === '[' || ch === '<' || ch === '{' || ch === '(' || ch === '!' || ch === '_' || ch === '#') return true;
  if ((ch === '+' || ch === '-') && i + 1 < text.length && text[i + 1] === ' ') return true;
  return false;
}

// ---------------------------------------------------------------------------
// Bracket tokens  [...]
// ---------------------------------------------------------------------------

function findClosingBracket(text: string, openPos: number, open: string, close: string): number {
  let depth = 0;
  for (let i = openPos; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function tryBracket(text: string, i: number, row: number, co: number): LineToken | null {
  if (i >= text.length) return null;

  // 9. Active tab  [[content]]
  if (text[i + 1] === '[') {
    const innerEnd = text.indexOf(']]', i + 2);
    if (innerEnd !== -1) {
      const content = text.substring(i + 2, innerEnd);
      const end = innerEnd + 2;

      return {
        type: 'ActiveTab', text: content,
        start: i + co, end: end + co, state: 'selected',
      };
    }
  }

  // Find matching ]
  const closeIdx = findClosingBracket(text, i, '[', ']');
  if (closeIdx === -1) return null;

  const content = text.substring(i + 1, closeIdx);
  const fullLen = closeIdx - i + 1;

  // 1. Checkbox off  [ ]
  if (content === ' ') {
    return { type: 'Checkbox', text: '', start: i + co, end: closeIdx + 1 + co, state: 'unchecked' };
  }

  // 2. Checkbox on  [x]
  if (content === 'x' || content === 'X') {
    return { type: 'Checkbox', text: '', start: i + co, end: closeIdx + 1 + co, state: 'checked' };
  }

  // 3. Checkbox mixed  [-]
  if (content === '-' && fullLen === 3) {
    return { type: 'Checkbox', text: '', start: i + co, end: closeIdx + 1 + co, state: 'mixed' };
  }

  // 4. Spinner  [/] [\]
  if ((content === '/' || content === '\\') && fullLen === 3) {
    return { type: 'Spinner', text: content, start: i + co, end: closeIdx + 1 + co, state: 'indeterminate' };
  }

  // 5. List truncation  [...]
  if (content === '...') {
    return { type: 'ListTruncation', text: '...', start: i + co, end: closeIdx + 1 + co };
  }

  // 6. Stepper  [- N +]
  const stepperMatch = content.match(/^-\s+(\d+)\s+\+$/);
  if (stepperMatch) {
    return {
      type: 'Stepper', text: stepperMatch[1],
      value: stepperMatch[1],
      start: i + co, end: closeIdx + 1 + co,
      numerator: parseInt(stepperMatch[1], 10),
    };
  }

  // 7. Slider / ProgressBar  [===..]  (only = and . chars)
  if (content.length >= 2 && /^[=.]+$/.test(content)) {
    const filled = (content.match(/=/g) || []).length;
    const total = content.length;
    const pct = Math.round((filled / total) * 100);
    return {
      type: 'Slider', text: content,
      start: i + co, end: closeIdx + 1 + co,
      percentage: pct,
    };
  }

  // 8. Rating  [***.]  (only * and . chars, 3+ chars)
  if (content.length >= 3 && /^[*.]+$/.test(content)) {
    const filled = (content.match(/\*/g) || []).length;
    const total = content.length;
    return {
      type: 'Rating', text: content,
      start: i + co, end: closeIdx + 1 + co,
      numerator: filled, denominator: total,
    };
  }

  // 10. Split button  [text][v] or [text][^]
  if (closeIdx + 1 < text.length && text[closeIdx + 1] === '[') {
    const secondClose = text.indexOf(']', closeIdx + 2);
    if (secondClose !== -1) {
      const secondContent = text.substring(closeIdx + 2, secondClose);
      if (secondContent === 'v' || secondContent === '^') {
        return {
          type: 'SplitButton', text: content,
          start: i + co, end: secondClose + 1 + co,
          state: secondContent === 'v' ? 'collapsed' : 'expanded',
        };
      }
    }
  }

  // 11. Accordion / Expander  [text v] or [text ^]
  if (content.length >= 3 && (content.endsWith(' v') || content.endsWith(' ^'))) {
    const label = content.slice(0, -2);
    const dir = content[content.length - 1];
    return {
      type: 'Accordion', text: label,
      start: i + co, end: closeIdx + 1 + co,
      state: dir === '^' ? 'expanded' : 'collapsed',
    };
  }

  // 12. Prev / Next  [<] [>]
  if (content === '<') {
    return { type: 'PrevButton', text: '<', start: i + co, end: closeIdx + 1 + co };
  }
  if (content === '>') {
    return { type: 'NextButton', text: '>', start: i + co, end: closeIdx + 1 + co };
  }

  // 13. Icon button  [#N text]
  const iconBtnMatch = content.match(/^#(\d+)\s+(.+)$/);
  if (iconBtnMatch) {
    return {
      type: 'IconButton', text: iconBtnMatch[2],
      start: i + co, end: closeIdx + 1 + co,
      iconIndex: parseInt(iconBtnMatch[1], 10),
    };
  }

  // 14. Button (default)
  return { type: 'Button', text: content, start: i + co, end: closeIdx + 1 + co };
}

// ---------------------------------------------------------------------------
// Angle tokens  <...>
// ---------------------------------------------------------------------------

function tryAngle(text: string, i: number, row: number, co: number): LineToken | null {
  const closeIdx = text.indexOf('>', i + 1);
  if (closeIdx === -1) return null;

  const content = text.substring(i + 1, closeIdx);

  // 15. Custom input  <@name>
  if (content.startsWith('@')) {
    return {
      type: 'CustomInput', text: content.substring(1),
      start: i + co, end: closeIdx + 1 + co,
    };
  }

  // 16. Dropdown closed  <text v>
  if (content.length >= 3 && content.endsWith(' v')) {
    return {
      type: 'Dropdown', text: content.slice(0, -2),
      start: i + co, end: closeIdx + 1 + co,
      state: 'collapsed',
    };
  }

  // 17. Dropdown open  <text ^>
  if (content.length >= 3 && content.endsWith(' ^')) {
    return {
      type: 'Dropdown', text: content.slice(0, -2),
      start: i + co, end: closeIdx + 1 + co,
      state: 'expanded',
    };
  }

  // Password input  <***>
  if (/^\*+$/.test(content)) {
    return {
      type: 'PasswordInput', text: '',
      start: i + co, end: closeIdx + 1 + co,
    };
  }

  // 18. Text input empty  <___>
  if (/^_+$/.test(content)) {
    return {
      type: 'TextInput', text: '',
      start: i + co, end: closeIdx + 1 + co,
      value: '',
    };
  }

  // 19. Text input with value  <text>
  return {
    type: 'TextInput', text: content,
    start: i + co, end: closeIdx + 1 + co,
    value: content,
  };
}

// ---------------------------------------------------------------------------
// Brace tokens  {...}
// ---------------------------------------------------------------------------

function tryBrace(text: string, i: number, row: number, co: number): LineToken | null {
  const closeIdx = text.indexOf('}', i + 1);
  if (closeIdx === -1) return null;

  const content = text.substring(i + 1, closeIdx);

  // 20. Toggle on  {[on]/off}
  const toggleOnMatch = content.match(/^\[(.+?)\]\/(.+)$/);
  if (toggleOnMatch) {
    return {
      type: 'Toggle', text: `${toggleOnMatch[1]}/${toggleOnMatch[2]}`,
      start: i + co, end: closeIdx + 1 + co,
      state: 'on',
      value: toggleOnMatch[1],
    };
  }

  // 21. Toggle off  {on/[off]}
  const toggleOffMatch = content.match(/^(.+?)\/\[(.+?)\]$/);
  if (toggleOffMatch) {
    return {
      type: 'Toggle', text: `${toggleOffMatch[1]}/${toggleOffMatch[2]}`,
      start: i + co, end: closeIdx + 1 + co,
      state: 'off',
      value: toggleOffMatch[2],
    };
  }

  // 22. Badge  {N} or {!}
  if (content.length <= 4 && !content.includes('/')) {
    return {
      type: 'Badge', text: content,
      start: i + co, end: closeIdx + 1 + co,
    };
  }

  // Fallback: badge
  return {
    type: 'Badge', text: content,
    start: i + co, end: closeIdx + 1 + co,
  };
}

// ---------------------------------------------------------------------------
// Paren tokens  (...)
// ---------------------------------------------------------------------------

function tryParen(text: string, i: number, row: number, co: number): LineToken | null {
  // 23. Radio selected  (*)
  if (text.substring(i, i + 3) === '(*)') {
    return {
      type: 'Radio', text: '',
      start: i + co, end: i + 3 + co,
      state: 'selected',
    };
  }

  // 24. Radio unselected  ( )
  if (text.substring(i, i + 3) === '( )') {
    return {
      type: 'Radio', text: '',
      start: i + co, end: i + 3 + co,
      state: 'unselected',
    };
  }

  const closeIdx = text.indexOf(')', i + 1);
  if (closeIdx === -1) return null;

  const content = text.substring(i + 1, closeIdx);

  // 25. Removable chip  (text x)
  if (content.length >= 3 && content.endsWith(' x')) {
    return {
      type: 'RemovableChip', text: content.slice(0, -2),
      start: i + co, end: closeIdx + 1 + co,
    };
  }

  // 27. Tag/chip  (text)
  return {
    type: 'Tag', text: content,
    start: i + co, end: closeIdx + 1 + co,
  };
}

// ---------------------------------------------------------------------------
// Image  !==text==!
// ---------------------------------------------------------------------------

function tryImage(text: string, i: number, row: number, co: number): LineToken | null {
  // Single-line image:  !==text==!  or  !=====!
  if (i + 2 < text.length && text[i + 1] === '=') {
    const endIdx = text.indexOf('!', i + 2);
    if (endIdx !== -1) {
      const content = text.substring(i + 1, endIdx);
      // Must have = chars
      if (content.includes('=')) {
        const imgText = content.replace(/=/g, '').trim();
        return {
          type: 'Image', text: imgText || 'IMG',
          start: i + co, end: endIdx + 1 + co,
        };
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Link  _text_
// ---------------------------------------------------------------------------

function tryLink(text: string, i: number, row: number, co: number): LineToken | null {
  if (i + 2 >= text.length) return null;
  const closeIdx = text.indexOf('_', i + 1);
  if (closeIdx === -1 || closeIdx === i + 1) return null;

  const content = text.substring(i + 1, closeIdx);
  // Don't match if it looks like underscores inside angle brackets
  if (content.includes('<') || content.includes('>')) return null;

  return {
    type: 'Link', text: content,
    start: i + co, end: closeIdx + 1 + co,
  };
}

// ---------------------------------------------------------------------------
// Icon  #N  or  Heading  # text
// ---------------------------------------------------------------------------

function tryIcon(text: string, i: number, row: number, co: number): LineToken | null {
  if (i + 1 >= text.length) return null;

  // #N icon (digit after #)
  if (/\d/.test(text[i + 1])) {
    let end = i + 2;
    while (end < text.length && /\d/.test(text[end])) end++;
    const num = parseInt(text.substring(i + 1, end), 10);
    return {
      type: 'Icon', text: `#${num}`,
      start: i + co, end: end + co,
      iconIndex: num,
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Tree node  + item  or  - item
// ---------------------------------------------------------------------------

function tryTreeNode(text: string, i: number, row: number, co: number): LineToken | null {
  // Must have indent context or be at start
  const marker = text[i];
  if (text[i + 1] !== ' ') return null;

  const indent = i;
  const nodeText = text.substring(i + 2).trimEnd();
  if (nodeText.length === 0) return null;

  return {
    type: 'TreeNode', text: nodeText,
    start: i + co, end: text.length + co,
    level: Math.floor(indent / 2),
    state: marker === '-' ? 'collapsed' : 'expanded',
  };
}

// ---------------------------------------------------------------------------
// Table row parsing
// ---------------------------------------------------------------------------

function parseTableRow(trimmed: string, row: number, startCol: number): LineToken[] {
  const inner = trimmed.slice(1, -1);
  const cells = inner.split('|');

  // Check if separator row  |---|---|
  const isSep = cells.every(c => /^[-:]+$/.test(c.trim()) || c.trim() === '');
  if (isSep) {
    return [{
      type: 'TableRow', text: trimmed,
      start: startCol, end: startCol + trimmed.length,
      state: 'separator',
    }];
  }

  const children: LineToken[] = cells.map((c, idx) => ({
    type: 'TableCell' as WidgetType,
    text: c.trim(),
    start: startCol + 1 + cells.slice(0, idx).reduce((a, x) => a + x.length + 1, 0),
    end: startCol + 1 + cells.slice(0, idx).reduce((a, x) => a + x.length + 1, 0) + c.length,
  }));

  return [{
    type: 'TableRow', text: trimmed,
    start: startCol, end: startCol + trimmed.length,
    children,
  }];
}
