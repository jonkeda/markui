"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../markui-core/dist/types.js
var require_types = __commonJS({
  "../markui-core/dist/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// ../markui-core/dist/limits.js
var require_limits = __commonJS({
  "../markui-core/dist/limits.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_MARKUI_LIMITS = void 0;
    exports2.resolveMarkuiLimits = resolveMarkuiLimits;
    exports2.validateSourceLimits = validateSourceLimits;
    exports2.validateBoxLimit = validateBoxLimit;
    exports2.validateTokenLimit = validateTokenLimit;
    exports2.validateSvgLimit = validateSvgLimit;
    exports2.isLimitErrorCode = isLimitErrorCode;
    exports2.utf8ByteLength = utf8ByteLength;
    exports2.DEFAULT_MARKUI_LIMITS = {
      maxSourceBytes: 1e6,
      maxLines: 5e3,
      maxColumns: 1e3,
      maxBoxes: 1e3,
      maxTokens: 2e4,
      maxSvgBytes: 2e6
    };
    var LIMIT_ERROR_CODES = /* @__PURE__ */ new Set([
      "SOURCE_TOO_LARGE",
      "SOURCE_TOO_MANY_LINES",
      "SOURCE_LINE_TOO_LONG",
      "SOURCE_TOO_MANY_BOXES",
      "SOURCE_TOO_MANY_TOKENS",
      "SVG_TOO_LARGE"
    ]);
    function resolveMarkuiLimits(limits) {
      if (limits === false)
        return false;
      return { ...exports2.DEFAULT_MARKUI_LIMITS, ...limits };
    }
    function validateSourceLimits(source, limits) {
      const resolved = resolveMarkuiLimits(limits);
      if (resolved === false)
        return [];
      const errors = [];
      const sourceBytes = utf8ByteLength(source);
      if (sourceBytes > resolved.maxSourceBytes) {
        errors.push(limitError("SOURCE_TOO_LARGE", `MarkUI source is ${sourceBytes} bytes, which exceeds the ${resolved.maxSourceBytes} byte limit.`));
      }
      const lines = source.split(/\r?\n/);
      if (lines.length > resolved.maxLines) {
        errors.push(limitError("SOURCE_TOO_MANY_LINES", `MarkUI source has ${lines.length} lines, which exceeds the ${resolved.maxLines} line limit.`));
      }
      let maxColumns = 0;
      let maxColumnRow = 1;
      for (let i = 0; i < lines.length; i++) {
        const columns = Array.from(lines[i]).length;
        if (columns > maxColumns) {
          maxColumns = columns;
          maxColumnRow = i + 1;
        }
      }
      if (maxColumns > resolved.maxColumns) {
        errors.push(limitError("SOURCE_LINE_TOO_LONG", `Line ${maxColumnRow} has ${maxColumns} columns, which exceeds the ${resolved.maxColumns} column limit.`, maxColumnRow));
      }
      return errors;
    }
    function validateBoxLimit(boxCount, limits) {
      const resolved = resolveMarkuiLimits(limits);
      if (resolved === false || boxCount <= resolved.maxBoxes)
        return [];
      return [limitError("SOURCE_TOO_MANY_BOXES", `MarkUI source produced ${boxCount} boxes, which exceeds the ${resolved.maxBoxes} box limit.`)];
    }
    function validateTokenLimit(tokenCount, limits) {
      const resolved = resolveMarkuiLimits(limits);
      if (resolved === false || tokenCount <= resolved.maxTokens)
        return [];
      return [limitError("SOURCE_TOO_MANY_TOKENS", `MarkUI source produced ${tokenCount} tokens, which exceeds the ${resolved.maxTokens} token limit.`)];
    }
    function validateSvgLimit(svg, limits) {
      const resolved = resolveMarkuiLimits(limits);
      if (resolved === false)
        return [];
      const svgBytes = utf8ByteLength(svg);
      if (svgBytes <= resolved.maxSvgBytes)
        return [];
      return [limitError("SVG_TOO_LARGE", `Rendered SVG is ${svgBytes} bytes, which exceeds the ${resolved.maxSvgBytes} byte limit.`)];
    }
    function isLimitErrorCode(code) {
      return LIMIT_ERROR_CODES.has(code);
    }
    function utf8ByteLength(value) {
      let bytes = 0;
      for (const ch of value) {
        const cp = ch.codePointAt(0) ?? 0;
        if (cp <= 127)
          bytes += 1;
        else if (cp <= 2047)
          bytes += 2;
        else if (cp <= 65535)
          bytes += 3;
        else
          bytes += 4;
      }
      return bytes;
    }
    function limitError(code, message, row = 1) {
      return {
        code,
        message,
        row,
        col: 1,
        severity: "error",
        phase: 1
      };
    }
  }
});

// ../markui-core/dist/parser/grid.js
var require_grid = __commonJS({
  "../markui-core/dist/parser/grid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadGrid = loadGrid;
    var unicodeMap = {
      "\u250C": "+",
      // ┌
      "\u2510": "+",
      // ┐
      "\u2514": "+",
      // └
      "\u2518": "+",
      // ┘
      "\u251C": "+",
      // ├
      "\u2524": "+",
      // ┤
      "\u252C": "+",
      // ┬
      "\u2534": "+",
      // ┴
      "\u253C": "+",
      // ┼
      "\u2500": "-",
      // ─
      "\u2550": "-",
      // ═
      "\u2502": "|"
      // │
    };
    function loadGrid(source) {
      const lines = source.split(/\r?\n/);
      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }
      const rows = lines.map((line) => {
        const chars = [];
        for (const ch of line) {
          chars.push(unicodeMap[ch] ?? ch);
        }
        return chars;
      });
      const maxWidth = rows.reduce((max, row) => Math.max(max, row.length), 0);
      for (const row of rows) {
        while (row.length < maxWidth) {
          row.push(" ");
        }
      }
      return {
        rows,
        width: maxWidth,
        height: rows.length
      };
    }
  }
});

// ../markui-core/dist/parser/boxes.js
var require_boxes = __commonJS({
  "../markui-core/dist/parser/boxes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.detectBoxes = detectBoxes;
    function isCorner(ch) {
      return ch === "+" || ch === "v" || ch === ">" || ch === "w";
    }
    function isVBorder(ch) {
      return ch === "|" || ch === "#" || ch === ".";
    }
    function boxArea(b) {
      return (b.bottom - b.top) * (b.right - b.left);
    }
    function contains(outer, inner) {
      return outer.top <= inner.top && outer.left <= inner.left && outer.bottom >= inner.bottom && outer.right >= inner.right && (outer.top !== inner.top || outer.left !== inner.left || outer.bottom !== inner.bottom || outer.right !== inner.right);
    }
    function countLeadingPlus(grid, r, c) {
      let count = 0;
      while (c + count < grid.width && grid.rows[r][c + count] === "+") {
        count++;
      }
      return count;
    }
    function isDashedBorder(grid, r, c1, c2) {
      let dashCount = 0;
      let spaceCount = 0;
      for (let c = c1; c <= c2; c++) {
        const ch = grid.rows[r][c];
        if (ch === "-")
          dashCount++;
        else if (ch === " ")
          spaceCount++;
      }
      return dashCount > 0 && spaceCount > 0 && spaceCount >= dashCount * 0.3;
    }
    function extractTitle(grid, box) {
      const r = box.top;
      const left = box.left + 1;
      const right = box.right - 1;
      if (right <= left)
        return;
      const rawTitleArea = grid.rows[r].slice(left, right + 1).join("");
      let titleChars = [];
      let inTitle = false;
      for (let c = left; c <= right; c++) {
        const ch = grid.rows[r][c];
        if (inTitle) {
          if (ch === "-" || ch === "#" || ch === ".") {
            break;
          }
          titleChars.push(ch);
        } else if (ch !== "-" && ch !== "#" && ch !== "." && ch !== " " && !isCorner(ch)) {
          inTitle = true;
          titleChars.push(ch);
        }
      }
      const title = titleChars.join("").trim();
      if (title.length > 0) {
        box.title = title;
        const typeMatch = title.match(/@(\w+)/);
        if (typeMatch) {
          box.typeName = typeMatch[1];
          const afterType = rawTitleArea.slice(rawTitleArea.indexOf(typeMatch[0]) + typeMatch[0].length);
          const trailingTitle = afterType.replace(/^[-#.\s]+/, "").replace(/[-#.\s+]+$/, "").trim();
          box.title = trailingTitle || title.replace(/@\w+/, "").trim() || void 0;
        }
      }
    }
    function detectTabsOnBorder(grid, box) {
      const r = box.top;
      const tabs = [];
      let c = box.left + 1;
      const maxC = box.right;
      while (c < maxC) {
        const ch = grid.rows[r][c];
        if (ch === "[") {
          if (c + 1 < maxC && grid.rows[r][c + 1] === "[") {
            const start2 = c + 2;
            let end2 = start2;
            while (end2 < maxC - 1 && !(grid.rows[r][end2] === "]" && grid.rows[r][end2 + 1] === "]")) {
              end2++;
            }
            if (end2 < maxC - 1) {
              const text = grid.rows[r].slice(start2, end2).join("");
              tabs.push({ text, active: true, col: c });
              c = end2 + 2;
              continue;
            }
          }
          const start = c + 1;
          let end = start;
          while (end < maxC && grid.rows[r][end] !== "]") {
            end++;
          }
          if (end < maxC) {
            const text = grid.rows[r].slice(start, end).join("");
            tabs.push({ text, active: false, col: c });
            c = end + 1;
            continue;
          }
        }
        c++;
      }
      return tabs.length > 0 ? { tabs } : null;
    }
    function hasNearbyCorner(grid, r, c, tolerance = 1) {
      for (let dc = -tolerance; dc <= tolerance; dc++) {
        const cc = c + dc;
        if (cc >= 0 && cc < grid.width && isCorner(grid.rows[r][cc]))
          return true;
      }
      return false;
    }
    function hasVerticalBorder(grid, top, bottom, c) {
      if (c < 0 || c >= grid.width)
        return false;
      for (let r = top + 1; r < bottom; r++) {
        if (!isVBorder(grid.rows[r][c]))
          return false;
      }
      return true;
    }
    function findRightBorderColumn(grid, top, bottom, topRight) {
      for (let delta = 0; delta <= 2; delta++) {
        const candidates = delta === 0 ? [topRight] : [topRight + delta, topRight - delta];
        for (const c of candidates) {
          if (hasVerticalBorder(grid, top, bottom, c) && hasNearbyCorner(grid, top, c) && hasNearbyCorner(grid, bottom, c)) {
            return c;
          }
        }
      }
      return null;
    }
    function tryBox(grid, r, c) {
      if (!isCorner(grid.rows[r][c]))
        return null;
      const cornerChar = grid.rows[r][c];
      const plusCount = countLeadingPlus(grid, r, c);
      const nestLevel = Math.max(0, plusCount - 1);
      const startC = c + nestLevel;
      const topRightCandidates = [];
      let hasDash = false;
      let lastDash = -1;
      for (let ci = startC + 1; ci < grid.width; ci++) {
        const ch = grid.rows[r][ci];
        if (ch === "-" || ch === "#" || ch === ".") {
          hasDash = true;
          lastDash = ci;
          continue;
        }
        if (isCorner(ch)) {
          if (hasDash) {
            topRightCandidates.push(ci);
          } else {
            if (ch === "+")
              break;
          }
          hasDash = false;
          continue;
        }
        if (ch !== " ")
          hasDash = false;
      }
      if (topRightCandidates.length === 0 && lastDash > startC + 1) {
        topRightCandidates.push(lastDash);
      }
      if (topRightCandidates.length === 0)
        return null;
      for (let ti = topRightCandidates.length - 1; ti >= 0; ti--) {
        const c2 = topRightCandidates[ti];
        let r2 = -1;
        let hasNestedPrefix = false;
        for (let ri = r + 1; ri < grid.height; ri++) {
          const ch = grid.rows[ri][c];
          if (isCorner(ch)) {
            if (c + 1 < grid.width && grid.rows[ri][c + 1] === "+") {
              hasNestedPrefix = true;
              continue;
            }
            r2 = ri;
            break;
          }
          if (!isVBorder(ch)) {
            if (hasNestedPrefix)
              continue;
            break;
          }
        }
        if (r2 === -1)
          continue;
        const repairedRight = findRightBorderColumn(grid, r, r2, c2);
        let hasRightBorder = repairedRight !== null;
        let right = repairedRight ?? c2;
        const bottomEnd = hasRightBorder ? right : Math.min(c2, grid.width - 1);
        let bottomHasDash = false;
        for (let ci = c + 1; ci < bottomEnd; ci++) {
          const ch = grid.rows[r2][ci];
          if (ch === "-" || ch === "#" || ch === ".") {
            bottomHasDash = true;
          }
        }
        if (!bottomHasDash && hasRightBorder)
          continue;
        if (!bottomHasDash && !hasRightBorder)
          continue;
        let leftOk = true;
        if (!hasNestedPrefix) {
          for (let ri = r + 1; ri < r2; ri++) {
            const ch = grid.rows[ri][c];
            if (!isVBorder(ch)) {
              leftOk = false;
              break;
            }
          }
        }
        if (!leftOk)
          continue;
        if (!hasRightBorder && isCorner(grid.rows[r][c2]))
          continue;
        const topDashed = isDashedBorder(grid, r, c + 1, Math.min(c2, right) - 1);
        let borderStyle = topDashed ? "dashed" : "solid";
        let scrollRight = false;
        let scrollBottom = false;
        if (hasRightBorder) {
          for (let ri = r + 1; ri < r2; ri++) {
            if (grid.rows[ri][right] === "#") {
              scrollRight = true;
              break;
            }
          }
        }
        for (let ci = c + 1; ci < (hasRightBorder ? right : grid.width); ci++) {
          if (grid.rows[r2][ci] === "#") {
            scrollBottom = true;
            break;
          }
        }
        const columnDividers = [];
        const resizeDividers = [];
        for (let ci = c + 1; ci < right; ci++) {
          const topCh = grid.rows[r][ci];
          const botCh = grid.rows[r2][ci];
          if (isCorner(topCh) && isCorner(botCh)) {
            let allVertical = true;
            let hasResize = false;
            for (let ri = r + 1; ri < r2; ri++) {
              const ch = grid.rows[ri][ci];
              if (ch === ".") {
                hasResize = true;
              } else if (!isVBorder(ch)) {
                allVertical = false;
                break;
              }
            }
            if (allVertical) {
              if (hasResize) {
                resizeDividers.push(ci);
              } else {
                columnDividers.push(ci);
              }
            }
          }
        }
        const box = {
          top: r,
          left: c,
          bottom: r2,
          right,
          cornerChar,
          borderStyle,
          hasRightBorder,
          scrollRight,
          scrollBottom,
          resizeDividers,
          columnDividers,
          children: [],
          nestLevel,
          hasNestedPrefix
        };
        extractTitle(grid, box);
        if (detectTabsOnBorder(grid, box)) {
          box.title = void 0;
        }
        return box;
      }
      return null;
    }
    function buildContainmentTree(boxes) {
      const sorted = [...boxes].sort((a, b) => boxArea(b) - boxArea(a));
      for (let i = 0; i < sorted.length; i++) {
        const child = sorted[i];
        for (let j = 0; j < sorted.length; j++) {
          if (i === j)
            continue;
          const candidate = sorted[j];
          if (contains(candidate, child)) {
            let smallest = candidate;
            for (let k = j + 1; k < sorted.length; k++) {
              if (k === i)
                continue;
              if (contains(sorted[k], child) && boxArea(sorted[k]) < boxArea(smallest)) {
                smallest = sorted[k];
              }
            }
            child.parent = smallest;
            if (!smallest.children.includes(child)) {
              smallest.children.push(child);
            }
            break;
          }
        }
      }
    }
    function detectBoxes(grid, mode) {
      const boxes = [];
      const errors = [];
      const visited = /* @__PURE__ */ new Set();
      for (let r = 0; r < grid.height; r++) {
        for (let c = 0; c < grid.width; c++) {
          if (!isCorner(grid.rows[r][c]))
            continue;
          const box = tryBox(grid, r, c);
          if (box) {
            const key = `${box.top},${box.left},${box.bottom},${box.right}`;
            if (!visited.has(key)) {
              visited.add(key);
              boxes.push(box);
            }
          }
        }
      }
      const toRemove = /* @__PURE__ */ new Set();
      for (let i = 0; i < boxes.length; i++) {
        for (let j = 0; j < boxes.length; j++) {
          if (i === j)
            continue;
          const outer = boxes[j];
          const inner = boxes[i];
          if (inner.top === outer.top && inner.bottom === outer.bottom && (outer.columnDividers.includes(inner.left) || outer.columnDividers.includes(inner.right) || outer.resizeDividers.includes(inner.left) || outer.resizeDividers.includes(inner.right))) {
            toRemove.add(i);
          }
        }
      }
      const filtered = boxes.filter((_, i) => !toRemove.has(i));
      const nestedSubs = [];
      for (const box of filtered) {
        if (!box.hasNestedPrefix)
          continue;
        const nestedRows = [];
        for (let r = box.top + 1; r < box.bottom; r++) {
          if (grid.rows[r][box.left] === "+" && box.left + 1 < grid.width && grid.rows[r][box.left + 1] === "+") {
            nestedRows.push(r);
          }
        }
        for (let ni = 0; ni < nestedRows.length; ni++) {
          const nestedR = nestedRows[ni];
          const nextR = ni + 1 < nestedRows.length ? nestedRows[ni + 1] : box.bottom;
          let lastDash = -1;
          for (let ci = box.left + 2; ci < grid.width; ci++) {
            const ch = grid.rows[nestedR][ci];
            if (ch === "-")
              lastDash = ci;
          }
          if (lastDash === -1)
            continue;
          const subBox = {
            top: nestedR,
            left: box.left,
            bottom: nextR,
            right: lastDash,
            cornerChar: "+",
            borderStyle: "solid",
            hasRightBorder: false,
            scrollRight: false,
            scrollBottom: false,
            resizeDividers: [],
            columnDividers: [],
            children: [],
            nestLevel: 1,
            parent: box
          };
          extractTitle(grid, subBox);
          box.children.push(subBox);
          nestedSubs.push(subBox);
        }
      }
      filtered.push(...nestedSubs);
      buildContainmentTree(filtered);
      return { boxes: filtered, errors };
    }
  }
});

// ../markui-core/dist/parser/content.js
var require_content = __commonJS({
  "../markui-core/dist/parser/content.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ROOT_KEY = void 0;
    exports2.extractContent = extractContent;
    function boxContentKey(boxIndex) {
      return `box:${boxIndex}`;
    }
    exports2.ROOT_KEY = "root";
    function extractContent(grid, boxes) {
      const contentMap = /* @__PURE__ */ new Map();
      const errors = [];
      const borderCells = /* @__PURE__ */ new Set();
      for (let bi = 0; bi < boxes.length; bi++) {
        const b = boxes[bi];
        for (let c = b.left; c <= b.right; c++) {
          borderCells.add(`${b.top},${c}`);
          borderCells.add(`${b.bottom},${c}`);
        }
        for (let r = b.top; r <= b.bottom; r++) {
          borderCells.add(`${r},${b.left}`);
        }
        if (b.hasRightBorder) {
          for (let r = b.top; r <= b.bottom; r++) {
            borderCells.add(`${r},${b.right}`);
          }
        }
        for (const dc of b.columnDividers) {
          for (let r = b.top; r <= b.bottom; r++) {
            borderCells.add(`${r},${dc}`);
          }
        }
        for (const dc of b.resizeDividers) {
          for (let r = b.top; r <= b.bottom; r++) {
            borderCells.add(`${r},${dc}`);
          }
        }
      }
      for (let bi = 0; bi < boxes.length; bi++) {
        const b = boxes[bi];
        const entry = extractBoxContent(grid, b, boxes, bi);
        contentMap.set(boxContentKey(bi), entry);
      }
      const rootLines = extractRootContent(grid, boxes);
      if (rootLines.length > 0) {
        contentMap.set(exports2.ROOT_KEY, { lines: rootLines });
      }
      return { contentMap, errors };
    }
    function extractBoxContent(grid, box, allBoxes, boxIndex) {
      const contentTop = box.top + 1;
      const contentBottom = box.bottom - 1;
      const contentLeft = box.left + 1;
      const contentRight = box.hasRightBorder ? box.right - 1 : grid.width - 1;
      const allDividers = [...box.columnDividers, ...box.resizeDividers].sort((a, b) => a - b);
      if (allDividers.length > 0) {
        const dividers = allDividers;
        const columns = [];
        const edges = [contentLeft, ...dividers.map((d) => d), contentRight + 1];
        for (let ci = 0; ci < edges.length - 1; ci++) {
          const colLeft = ci === 0 ? edges[ci] : edges[ci] + 1;
          const colRight = edges[ci + 1] - 1;
          if (colRight < colLeft)
            continue;
          const colLines = [];
          for (let r = contentTop; r <= contentBottom; r++) {
            if (isRowCoveredByChild(r, colLeft, colRight, box, allBoxes, boxIndex))
              continue;
            let lineChars = [];
            for (let c = colLeft; c <= colRight; c++) {
              lineChars.push(grid.rows[r][c]);
            }
            const lineText = lineChars.join("");
            colLines.push({ text: lineText, row: r, colOffset: colLeft });
          }
          columns.push({ left: colLeft, right: colRight, lines: colLines });
        }
        const allLines = [];
        for (let r = contentTop; r <= contentBottom; r++) {
          if (isRowCoveredByChild(r, contentLeft, contentRight, box, allBoxes, boxIndex))
            continue;
          let lineChars = [];
          for (let c = contentLeft; c <= contentRight; c++) {
            const ch = allDividers.includes(c) ? " " : grid.rows[r][c];
            lineChars.push(ch);
          }
          allLines.push({ text: lineChars.join(""), row: r, colOffset: contentLeft });
        }
        return { lines: allLines, columns };
      }
      const lines = [];
      for (let r = contentTop; r <= contentBottom; r++) {
        if (isRowCoveredByChild(r, contentLeft, contentRight, box, allBoxes, boxIndex))
          continue;
        let lineChars = [];
        for (let c = contentLeft; c <= contentRight; c++) {
          lineChars.push(grid.rows[r][c]);
        }
        lines.push({ text: lineChars.join(""), row: r, colOffset: contentLeft });
      }
      return { lines };
    }
    function isRowCoveredByChild(row, colLeft, colRight, parentBox, allBoxes, parentIndex) {
      for (const child of parentBox.children) {
        if (row >= child.top && row <= child.bottom && child.left <= colRight && child.right >= colLeft) {
          return true;
        }
      }
      return false;
    }
    function extractRootContent(grid, boxes) {
      const lines = [];
      const rootBoxes = boxes.filter((b) => !b.parent);
      for (let r = 0; r < grid.height; r++) {
        let coveredByBox = false;
        for (const b of rootBoxes) {
          if (r >= b.top && r <= b.bottom) {
            coveredByBox = true;
            break;
          }
        }
        if (coveredByBox)
          continue;
        const lineText = grid.rows[r].join("");
        if (lineText.trim().length > 0) {
          lines.push({ text: lineText, row: r, colOffset: 0 });
        }
      }
      return lines;
    }
  }
});

// ../markui-core/dist/parser/tokenizer.js
var require_tokenizer = __commonJS({
  "../markui-core/dist/parser/tokenizer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.tokenizeLines = tokenizeLines;
    function tokenizeLines(contentMap, mode) {
      const tokenMap = /* @__PURE__ */ new Map();
      const errors = [];
      for (const [key, entry] of contentMap) {
        const tokenizedLines = [];
        for (const line of entry.lines) {
          const tokens = tokenizeLine(line.text, line.row, line.colOffset);
          stampRow(tokens, line.row);
          tokenizedLines.push(tokens);
        }
        const te = { tokens: tokenizedLines };
        if (entry.columns) {
          te.columns = entry.columns.map((col) => ({
            left: col.left,
            right: col.right,
            tokens: col.lines.map((l) => {
              const toks = tokenizeLine(l.text, l.row, l.colOffset);
              stampRow(toks, l.row);
              return toks;
            })
          }));
        }
        tokenMap.set(key, te);
      }
      return { tokenMap, errors };
    }
    function stampRow(tokens, row) {
      for (const t of tokens) {
        t.row = row;
        if (t.children)
          stampRow(t.children, row);
      }
    }
    function tokenizeLine(text, row, colOffset) {
      const trimmed = text.trim();
      if (trimmed.length === 0)
        return [];
      if (/^-{3,}$/.test(trimmed)) {
        const start = text.indexOf("-");
        return [{
          type: "Separator",
          text: trimmed,
          start: start + colOffset,
          end: start + trimmed.length + colOffset
        }];
      }
      if (trimmed.includes(" > ") && !trimmed.startsWith("[") && !trimmed.startsWith("<") && !trimmed.startsWith("{") && !trimmed.startsWith("(")) {
        const parts = trimmed.split(" > ");
        if (parts.length >= 2 && parts.every((p) => p.trim().length > 0)) {
          const s = text.indexOf(trimmed) + colOffset;
          return [{
            type: "Breadcrumb",
            text: trimmed,
            start: s,
            end: s + trimmed.length,
            children: parts.map((p, idx) => ({
              type: "Label",
              text: p.trim(),
              start: s,
              end: s + p.length
            }))
          }];
        }
      }
      if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length >= 3) {
        return parseTableRow(trimmed, row, colOffset + text.indexOf(trimmed));
      }
      const pagination = parsePagination(trimmed, row, colOffset + text.indexOf(trimmed));
      if (pagination)
        return [pagination];
      const headingMatch = text.match(/^(\s*)(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const indent = headingMatch[1].length;
        const level = headingMatch[2].length;
        const hText = headingMatch[3].trimEnd();
        return [{
          type: "Heading",
          text: hText,
          start: indent + colOffset,
          end: indent + headingMatch[2].length + 1 + hText.length + colOffset,
          level
        }];
      }
      const compMatch = text.match(/^(\s*)@(\w[\w.-]*)(.*)$/);
      if (compMatch) {
        const indent = compMatch[1].length;
        const name = compMatch[2];
        return [{
          type: "ComponentRef",
          text: name,
          start: indent + colOffset,
          end: indent + 1 + name.length + colOffset
        }];
      }
      const annoMatch = text.match(/^(\s*)\(([?$!ixv])\)\s+(.*)$/);
      if (annoMatch) {
        const indent = annoMatch[1].length;
        const aType = annoMatch[2];
        const aText = annoMatch[3].trimEnd();
        return [{
          type: "Annotation",
          text: aText,
          start: indent + colOffset,
          end: text.length + colOffset,
          annotationType: aType
        }];
      }
      const tokens = [];
      let i = 0;
      while (i < text.length) {
        if (text[i] === " " || text[i] === "	") {
          i++;
          continue;
        }
        let token = null;
        switch (text[i]) {
          case "[":
            token = tryBracket(text, i, row, colOffset);
            break;
          case "<":
            token = tryAngle(text, i, row, colOffset);
            break;
          case "{":
            token = tryBrace(text, i, row, colOffset);
            break;
          case "(":
            token = tryParen(text, i, row, colOffset);
            break;
          case "!":
            token = tryImage(text, i, row, colOffset);
            break;
          case "_":
            token = tryLink(text, i, row, colOffset);
            break;
          case "#":
            token = tryIcon(text, i, row, colOffset);
            break;
          case "+":
          case "-":
            if (i < text.length - 1 && text[i + 1] === " ") {
              token = tryTreeNode(text, i, row, colOffset);
            }
            break;
        }
        if (token) {
          tokens.push(token);
          i = token.end - colOffset;
        } else {
          const labelStart = i;
          i++;
          while (i < text.length && !isSpecialStart(text, i)) {
            i++;
          }
          const labelText = text.substring(labelStart, i).trimEnd();
          if (labelText.trim().length > 0) {
            tokens.push({
              type: "Label",
              text: labelText.trim(),
              start: labelStart + colOffset,
              end: labelStart + labelText.length + colOffset
            });
          }
        }
      }
      return tokens;
    }
    function isSpecialStart(text, i) {
      const ch = text[i];
      if (ch === "[" || ch === "<" || ch === "{" || ch === "(" || ch === "!" || ch === "_" || ch === "#")
        return true;
      if ((ch === "+" || ch === "-") && i + 1 < text.length && text[i + 1] === " ")
        return true;
      return false;
    }
    function findClosingBracket(text, openPos, open, close) {
      let depth = 0;
      for (let i = openPos; i < text.length; i++) {
        if (text[i] === open)
          depth++;
        else if (text[i] === close) {
          depth--;
          if (depth === 0)
            return i;
        }
      }
      return -1;
    }
    function tryBracket(text, i, row, co) {
      if (i >= text.length)
        return null;
      if (text[i + 1] === "[") {
        const innerEnd = text.indexOf("]]", i + 2);
        if (innerEnd !== -1) {
          const content2 = text.substring(i + 2, innerEnd);
          const end = innerEnd + 2;
          return {
            type: "ActiveTab",
            text: content2,
            start: i + co,
            end: end + co,
            state: "selected"
          };
        }
      }
      const closeIdx = findClosingBracket(text, i, "[", "]");
      if (closeIdx === -1)
        return null;
      const content = text.substring(i + 1, closeIdx);
      const fullLen = closeIdx - i + 1;
      if (content === " ") {
        return { type: "Checkbox", text: "", start: i + co, end: closeIdx + 1 + co, state: "unchecked" };
      }
      if (content === "x" || content === "X") {
        return { type: "Checkbox", text: "", start: i + co, end: closeIdx + 1 + co, state: "checked" };
      }
      if (content === "-" && fullLen === 3) {
        return { type: "Checkbox", text: "", start: i + co, end: closeIdx + 1 + co, state: "mixed" };
      }
      if ((content === "/" || content === "\\") && fullLen === 3) {
        return { type: "Spinner", text: content, start: i + co, end: closeIdx + 1 + co, state: "indeterminate" };
      }
      const stepperMatch = content.match(/^-\s+(\d+)\s+\+$/);
      if (stepperMatch) {
        return {
          type: "Stepper",
          text: stepperMatch[1],
          value: stepperMatch[1],
          start: i + co,
          end: closeIdx + 1 + co,
          numerator: parseInt(stepperMatch[1], 10)
        };
      }
      if (content.length >= 2 && /^[=.]+$/.test(content) && content.includes("=")) {
        const filled = (content.match(/=/g) || []).length;
        const total = content.length;
        const pct = Math.round(filled / total * 100);
        return {
          type: "Slider",
          text: content,
          start: i + co,
          end: closeIdx + 1 + co,
          percentage: pct
        };
      }
      if (content.length >= 3 && /^[*.]+$/.test(content) && content.includes("*")) {
        const filled = (content.match(/\*/g) || []).length;
        const total = content.length;
        return {
          type: "Rating",
          text: content,
          start: i + co,
          end: closeIdx + 1 + co,
          numerator: filled,
          denominator: total
        };
      }
      if (closeIdx + 1 < text.length && text[closeIdx + 1] === "[") {
        const secondClose = text.indexOf("]", closeIdx + 2);
        if (secondClose !== -1) {
          const secondContent = text.substring(closeIdx + 2, secondClose);
          if (secondContent === "v" || secondContent === "^") {
            return {
              type: "SplitButton",
              text: content,
              start: i + co,
              end: secondClose + 1 + co,
              state: secondContent === "v" ? "collapsed" : "expanded"
            };
          }
        }
      }
      if (content.length >= 3 && (content.endsWith(" v") || content.endsWith(" ^"))) {
        const label = content.slice(0, -2);
        const dir = content[content.length - 1];
        return {
          type: "Accordion",
          text: label,
          start: i + co,
          end: closeIdx + 1 + co,
          state: dir === "^" ? "expanded" : "collapsed"
        };
      }
      if (content === "<") {
        return { type: "PrevButton", text: "<", start: i + co, end: closeIdx + 1 + co };
      }
      if (content === ">") {
        return { type: "NextButton", text: ">", start: i + co, end: closeIdx + 1 + co };
      }
      const iconBtnMatch = content.match(/^#(\d+)\s+(.+)$/);
      if (iconBtnMatch) {
        return {
          type: "IconButton",
          text: iconBtnMatch[2],
          start: i + co,
          end: closeIdx + 1 + co,
          iconIndex: parseInt(iconBtnMatch[1], 10)
        };
      }
      return { type: "Button", text: content, start: i + co, end: closeIdx + 1 + co };
    }
    function tryAngle(text, i, row, co) {
      const closeIdx = text.indexOf(">", i + 1);
      if (closeIdx === -1)
        return null;
      const content = text.substring(i + 1, closeIdx);
      if (content.startsWith("@")) {
        return {
          type: "CustomInput",
          text: content.substring(1),
          start: i + co,
          end: closeIdx + 1 + co
        };
      }
      if (content.length >= 3 && content.endsWith(" v")) {
        return {
          type: "Dropdown",
          text: content.slice(0, -2),
          start: i + co,
          end: closeIdx + 1 + co,
          state: "collapsed"
        };
      }
      if (content.length >= 3 && content.endsWith(" ^")) {
        return {
          type: "Dropdown",
          text: content.slice(0, -2),
          start: i + co,
          end: closeIdx + 1 + co,
          state: "expanded"
        };
      }
      if (/^\*+$/.test(content)) {
        return {
          type: "PasswordInput",
          text: "",
          start: i + co,
          end: closeIdx + 1 + co
        };
      }
      if (/^_+$/.test(content)) {
        return {
          type: "TextInput",
          text: "",
          start: i + co,
          end: closeIdx + 1 + co,
          value: ""
        };
      }
      return {
        type: "TextInput",
        text: content,
        start: i + co,
        end: closeIdx + 1 + co,
        value: content
      };
    }
    function tryBrace(text, i, row, co) {
      const closeIdx = text.indexOf("}", i + 1);
      if (closeIdx === -1)
        return null;
      const content = text.substring(i + 1, closeIdx);
      const toggleOnMatch = content.match(/^\[(.+?)\]\/(.+)$/);
      if (toggleOnMatch) {
        return {
          type: "Toggle",
          text: `${toggleOnMatch[1]}/${toggleOnMatch[2]}`,
          start: i + co,
          end: closeIdx + 1 + co,
          state: "on",
          value: toggleOnMatch[1]
        };
      }
      const toggleOffMatch = content.match(/^(.+?)\/\[(.+?)\]$/);
      if (toggleOffMatch) {
        return {
          type: "Toggle",
          text: `${toggleOffMatch[1]}/${toggleOffMatch[2]}`,
          start: i + co,
          end: closeIdx + 1 + co,
          state: "off",
          value: toggleOffMatch[2]
        };
      }
      if (content.length <= 4 && !content.includes("/")) {
        return {
          type: "Badge",
          text: content,
          start: i + co,
          end: closeIdx + 1 + co
        };
      }
      return {
        type: "Badge",
        text: content,
        start: i + co,
        end: closeIdx + 1 + co
      };
    }
    function tryParen(text, i, row, co) {
      if (text.substring(i, i + 3) === "(*)") {
        return {
          type: "Radio",
          text: "",
          start: i + co,
          end: i + 3 + co,
          state: "selected"
        };
      }
      if (text.substring(i, i + 3) === "( )") {
        return {
          type: "Radio",
          text: "",
          start: i + co,
          end: i + 3 + co,
          state: "unselected"
        };
      }
      const closeIdx = text.indexOf(")", i + 1);
      if (closeIdx === -1)
        return null;
      const content = text.substring(i + 1, closeIdx);
      if (content.length >= 3 && content.endsWith(" x")) {
        return {
          type: "RemovableChip",
          text: content.slice(0, -2),
          start: i + co,
          end: closeIdx + 1 + co
        };
      }
      return {
        type: "Tag",
        text: content,
        start: i + co,
        end: closeIdx + 1 + co
      };
    }
    function tryImage(text, i, row, co) {
      if (i + 2 < text.length && text[i + 1] === "=") {
        const endIdx = text.indexOf("!", i + 2);
        if (endIdx !== -1) {
          const content = text.substring(i + 1, endIdx);
          if (content.includes("=")) {
            const imgText = content.replace(/=/g, "").trim();
            return {
              type: "Image",
              text: imgText || "IMG",
              start: i + co,
              end: endIdx + 1 + co
            };
          }
        }
      }
      return null;
    }
    function tryLink(text, i, row, co) {
      if (i + 2 >= text.length)
        return null;
      const closeIdx = text.indexOf("_", i + 1);
      if (closeIdx === -1 || closeIdx === i + 1)
        return null;
      const content = text.substring(i + 1, closeIdx);
      if (content.includes("<") || content.includes(">"))
        return null;
      return {
        type: "Link",
        text: content,
        start: i + co,
        end: closeIdx + 1 + co
      };
    }
    function tryIcon(text, i, row, co) {
      if (i + 1 >= text.length)
        return null;
      if (/\d/.test(text[i + 1])) {
        let end = i + 2;
        while (end < text.length && /\d/.test(text[end]))
          end++;
        const num = parseInt(text.substring(i + 1, end), 10);
        return {
          type: "Icon",
          text: `#${num}`,
          start: i + co,
          end: end + co,
          iconIndex: num
        };
      }
      return null;
    }
    function tryTreeNode(text, i, row, co) {
      const marker = text[i];
      if (text[i + 1] !== " ")
        return null;
      const indent = i;
      const nodeText = text.substring(i + 2).trimEnd();
      if (nodeText.length === 0)
        return null;
      return {
        type: "TreeNode",
        text: nodeText,
        start: i + co,
        end: text.length + co,
        level: Math.floor(indent / 2),
        state: marker === "-" ? "collapsed" : "expanded"
      };
    }
    function parsePagination(trimmed, row, startCol) {
      if (!trimmed.includes("[<]") || !trimmed.includes("[>]"))
        return null;
      const tokenRe = /\[<\]|\[>\]|\[\[\d+\]\]|\d+|\.{3}/g;
      const children = [];
      let match;
      while ((match = tokenRe.exec(trimmed)) !== null) {
        const raw = match[0];
        const start = startCol + match.index;
        const end = start + raw.length;
        if (raw === "[<]") {
          children.push({ type: "PrevButton", text: "<", start, end, row });
        } else if (raw === "[>]") {
          children.push({ type: "NextButton", text: ">", start, end, row });
        } else if (raw.startsWith("[[")) {
          children.push({ type: "ActiveTab", text: raw.slice(2, -2), start, end, row, state: "selected" });
        } else {
          children.push({ type: "Button", text: raw, start, end, row });
        }
      }
      if (children.length < 3)
        return null;
      return {
        type: "Pagination",
        text: trimmed,
        start: children[0].start,
        end: children[children.length - 1].end,
        row,
        children
      };
    }
    function parseTableRow(trimmed, row, startCol) {
      const inner = trimmed.slice(1, -1);
      const cells = inner.split("|");
      const isSep = cells.every((c) => /^[-:]+$/.test(c.trim()) || c.trim() === "");
      if (isSep) {
        return [{
          type: "TableRow",
          text: trimmed,
          start: startCol,
          end: startCol + trimmed.length,
          state: "separator"
        }];
      }
      const children = cells.map((c, idx) => ({
        type: "TableCell",
        text: c.trim(),
        start: startCol + 1 + cells.slice(0, idx).reduce((a, x) => a + x.length + 1, 0),
        end: startCol + 1 + cells.slice(0, idx).reduce((a, x) => a + x.length + 1, 0) + c.length
      }));
      return [{
        type: "TableRow",
        text: trimmed,
        start: startCol,
        end: startCol + trimmed.length,
        children
      }];
    }
  }
});

// ../markui-core/dist/parser/merger.js
var require_merger = __commonJS({
  "../markui-core/dist/parser/merger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mergeMultiLine = mergeMultiLine;
    function mergeMultiLine(tokenMap, mode) {
      const mergedMap = /* @__PURE__ */ new Map();
      const errors = [];
      for (const [key, entry] of tokenMap) {
        const widgets = mergeTokenLines(entry.tokens);
        const me = { widgets };
        if (entry.columns) {
          me.columns = entry.columns.map((col) => ({
            left: col.left,
            right: col.right,
            widgets: mergeTokenLines(col.tokens)
          }));
        }
        mergedMap.set(key, me);
      }
      return { mergedMap, errors };
    }
    function mergeTokenLines(tokenLines) {
      const widgets = [];
      let i = 0;
      while (i < tokenLines.length) {
        const line = tokenLines[i];
        if (line.length === 0) {
          i++;
          continue;
        }
        let consumed = tryMergeTable(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        consumed = tryMergeTextarea(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        consumed = tryMergeExpandedDropdown(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        consumed = tryMergeAccordion(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        consumed = tryMergeImage(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        consumed = tryMergeFormField(tokenLines, i, widgets);
        if (consumed > 0) {
          i += consumed;
          continue;
        }
        for (const tok of line) {
          widgets.push(tokenToNode(tok));
        }
        i++;
      }
      return widgets;
    }
    function tryMergeTable(lines, startIdx, out) {
      if (lines[startIdx].length !== 1 || lines[startIdx][0].type !== "TableRow")
        return 0;
      let end = startIdx;
      while (end < lines.length && lines[end].length === 1 && lines[end][0].type === "TableRow") {
        end++;
      }
      if (end - startIdx < 2)
        return 0;
      const rows = lines.slice(startIdx, end).map((l) => l[0]);
      const sepIdx = rows.findIndex((r) => r.state === "separator");
      const tableChildren = [];
      for (let ri = 0; ri < rows.length; ri++) {
        const rowTok = rows[ri];
        if (rowTok.state === "separator")
          continue;
        const isHeader = sepIdx !== -1 && ri < sepIdx;
        const rowType = isHeader ? "TableHeader" : "TableRow";
        const cellChildren = (rowTok.children || []).map((c) => ({
          type: "TableCell",
          text: c.text,
          row: c.row ?? 0,
          col: c.start,
          width: c.end - c.start,
          children: []
        }));
        tableChildren.push({
          type: rowType,
          text: rowTok.text,
          row: rowTok.row ?? 0,
          col: rowTok.start,
          width: rowTok.end - rowTok.start,
          children: cellChildren
        });
      }
      out.push({
        type: "Table",
        row: rows[0].row ?? 0,
        col: rows[0].start,
        width: rows[0].end - rows[0].start,
        height: end - startIdx,
        children: tableChildren
      });
      return end - startIdx;
    }
    function tryMergeTextarea(lines, startIdx, out) {
      const textarea = buildTextarea(lines, startIdx);
      if (!textarea)
        return 0;
      out.push(textarea.node);
      return textarea.consumed;
    }
    function buildTextarea(lines, startIdx) {
      const first = lines[startIdx];
      if (first.length !== 1 || first[0].type !== "TextInput")
        return null;
      let end = startIdx + 1;
      const firstWidth = first[0].end - first[0].start;
      while (end < lines.length) {
        const line = lines[end];
        if (line.length !== 1 || line[0].type !== "TextInput")
          break;
        const w = line[0].end - line[0].start;
        if (Math.abs(w - firstWidth) > 2)
          break;
        end++;
      }
      if (end - startIdx < 2)
        return null;
      const allLines = lines.slice(startIdx, end).map((l) => l[0]);
      const combinedText = allLines.map((t) => t.value || t.text).join("\n");
      return {
        node: {
          type: "Textarea",
          text: combinedText,
          value: combinedText,
          row: allLines[0].row ?? 0,
          col: allLines[0].start,
          width: firstWidth,
          height: end - startIdx,
          children: []
        },
        consumed: end - startIdx
      };
    }
    function tryMergeExpandedDropdown(lines, startIdx, out) {
      const dropdown = buildExpandedDropdown(lines, startIdx);
      if (!dropdown)
        return 0;
      out.push(dropdown.node);
      return dropdown.consumed;
    }
    function buildExpandedDropdown(lines, startIdx) {
      const first = lines[startIdx];
      if (first.length !== 1 || first[0].type !== "Dropdown" || first[0].state !== "expanded")
        return null;
      let end = startIdx + 1;
      const options = [];
      while (end < lines.length) {
        const line = lines[end];
        if (line.length === 0) {
          end++;
          continue;
        }
        const firstTok = line[0];
        if (firstTok.type === "Checkbox") {
          const label = line.length > 1 ? line.slice(1).map((t) => t.text).join(" ") : firstTok.text ?? "";
          options.push({
            type: "DropdownOption",
            text: label,
            state: firstTok.state,
            row: firstTok.row ?? 0,
            col: firstTok.start,
            width: firstTok.end - firstTok.start,
            children: []
          });
          end++;
          continue;
        }
        if (firstTok.type === "Label") {
          const txt = firstTok.text.trim();
          if (txt === "->") {
            end++;
            break;
          }
          options.push({
            type: "DropdownOption",
            text: txt,
            row: firstTok.row ?? 0,
            col: firstTok.start,
            width: firstTok.end - firstTok.start,
            children: []
          });
          end++;
          continue;
        }
        break;
      }
      if (options.length === 0)
        return null;
      return {
        node: {
          type: "Dropdown",
          text: first[0].text,
          state: "expanded",
          row: first[0].row ?? 0,
          col: first[0].start,
          width: first[0].end - first[0].start,
          children: options
        },
        consumed: end - startIdx
      };
    }
    function tryMergeAccordion(lines, startIdx, out) {
      const first = lines[startIdx];
      if (first.length !== 1 || first[0].type !== "Accordion")
        return 0;
      const sections = [];
      let end = startIdx;
      while (end < lines.length) {
        const line = lines[end];
        if (line.length === 0) {
          end++;
          continue;
        }
        if (line.length !== 1 || line[0].type !== "Accordion") {
          if (sections.length > 0)
            break;
          break;
        }
        const header = line[0];
        const sectionChildren = [];
        if (header.state === "expanded") {
          end++;
          while (end < lines.length) {
            const contentLine = lines[end];
            if (contentLine.length === 0)
              break;
            if (contentLine.length === 1 && contentLine[0].type === "Accordion")
              break;
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
          type: "Expander",
          text: header.text,
          state: header.state,
          row: header.row ?? 0,
          col: header.start,
          width: header.end - header.start,
          children: sectionChildren
        });
      }
      if (sections.length < 2) {
        if (sections.length === 1) {
          out.push(sections[0]);
          return end - startIdx;
        }
        return 0;
      }
      out.push({
        type: "Accordion",
        row: sections[0].row,
        col: sections[0].col,
        width: sections[0].width,
        children: sections
      });
      return end - startIdx;
    }
    function isAccordionCloseLine(line) {
      const text = line.map((tok) => tok.text).join("");
      return /^\+-+\+$/.test(text);
    }
    function stripAccordionGuide(line) {
      if (line.length === 0)
        return line;
      const [first, ...rest] = line;
      if (first.type !== "Label" || !first.text.startsWith("|"))
        return line;
      const match = first.text.match(/^\|\s*/);
      const prefixLength = match?.[0].length ?? 1;
      const text = first.text.slice(prefixLength);
      if (text.length === 0)
        return rest;
      return [
        {
          ...first,
          text,
          start: first.start + prefixLength,
          end: first.start + prefixLength + text.length
        },
        ...rest
      ];
    }
    function tryMergeImage(lines, startIdx, out) {
      const first = lines[startIdx];
      if (first.length !== 1 || first[0].type !== "Image")
        return 0;
      let end = startIdx + 1;
      while (end < lines.length && lines[end].length === 1 && lines[end][0].type === "Image") {
        end++;
      }
      if (end - startIdx === 1) {
        out.push(tokenToNode(first[0]));
        return 1;
      }
      const allTokens = lines.slice(startIdx, end).map((l) => l[0]);
      const imgText = allTokens.map((t) => t.text).filter((t) => t && t !== "IMG").join(" ") || "IMG";
      out.push({
        type: "Image",
        text: imgText,
        row: allTokens[0].row ?? 0,
        col: allTokens[0].start,
        width: Math.max(...allTokens.map((t) => t.end - t.start)),
        height: end - startIdx,
        children: []
      });
      return end - startIdx;
    }
    function tryMergeFormField(lines, startIdx, out) {
      if (startIdx + 1 >= lines.length)
        return 0;
      const labelLine = lines[startIdx];
      const inputLine = lines[startIdx + 1];
      if (labelLine.length !== 1 || labelLine[0].type !== "Label" || !labelLine[0].text.endsWith(":"))
        return 0;
      if (inputLine.length !== 1)
        return 0;
      const inputType = inputLine[0].type;
      const inputTypes = [
        "TextInput",
        "PasswordInput",
        "DateInput",
        "NumberInput",
        "Textarea",
        "Dropdown",
        "CustomInput"
      ];
      if (!inputTypes.includes(inputType))
        return 0;
      const labelNode = tokenToNode(labelLine[0]);
      let inputNode;
      let consumed = 2;
      const textarea = buildTextarea(lines, startIdx + 1);
      if (textarea) {
        inputNode = textarea.node;
        consumed = 1 + textarea.consumed;
      } else {
        const expandedDropdown = buildExpandedDropdown(lines, startIdx + 1);
        if (expandedDropdown) {
          inputNode = expandedDropdown.node;
          consumed = 1 + expandedDropdown.consumed;
        } else {
          inputNode = tokenToNode(inputLine[0]);
        }
      }
      const children = [labelNode, inputNode];
      if (startIdx + consumed < lines.length) {
        const annoLine = lines[startIdx + consumed];
        if (annoLine.length === 1 && annoLine[0].type === "Annotation") {
          children.push(tokenToNode(annoLine[0]));
          consumed++;
        }
      }
      out.push({
        type: "FormField",
        text: labelLine[0].text,
        row: labelLine[0].row ?? 0,
        col: labelLine[0].start,
        width: Math.max(labelLine[0].end - labelLine[0].start, inputLine[0].end - inputLine[0].start),
        children
      });
      return consumed;
    }
    function tokenToNode(tok) {
      const node = {
        type: tok.type,
        text: tok.text,
        row: tok.row ?? 0,
        col: tok.start,
        width: tok.end - tok.start,
        children: []
      };
      if (tok.value !== void 0)
        node.value = tok.value;
      if (tok.state !== void 0)
        node.state = tok.state;
      if (tok.iconIndex !== void 0)
        node.iconIndex = tok.iconIndex;
      if (tok.level !== void 0)
        node.level = tok.level;
      if (tok.annotationType !== void 0)
        node.annotationType = tok.annotationType;
      if (tok.percentage !== void 0)
        node.percentage = tok.percentage;
      if (tok.numerator !== void 0)
        node.numerator = tok.numerator;
      if (tok.denominator !== void 0)
        node.denominator = tok.denominator;
      if (tok.children) {
        node.children = tok.children.map((c) => tokenToNode(c));
      }
      return node;
    }
  }
});

// ../markui-core/dist/parser/layout.js
var require_layout = __commonJS({
  "../markui-core/dist/parser/layout.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveLayout = resolveLayout;
    function resolveLayout(mergedMap) {
      const layoutMap = /* @__PURE__ */ new Map();
      for (const [key, entry] of mergedMap) {
        if (entry.columns && entry.columns.length > 0) {
          const columnChildren = entry.columns.map((col) => {
            const grouped = groupByRow(col.widgets);
            return {
              type: "VerticalGroup",
              row: col.widgets.length > 0 ? col.widgets[0].row : 0,
              col: col.left,
              width: col.right - col.left,
              children: grouped
            };
          });
          const layoutNode = {
            type: "ColumnLayout",
            row: columnChildren[0]?.row ?? 0,
            col: columnChildren[0]?.col ?? 0,
            width: columnChildren.reduce((sum, c) => sum + c.width, 0),
            children: columnChildren
          };
          layoutMap.set(key, { children: [layoutNode] });
        } else {
          const grouped = groupByRow(entry.widgets);
          layoutMap.set(key, { children: grouped });
        }
      }
      return { layoutMap };
    }
    function groupByRow(widgets) {
      if (widgets.length <= 1)
        return widgets;
      const result = [];
      let currentGroup = [];
      let currentRow = -1;
      for (const w of widgets) {
        if (currentRow === -1) {
          currentRow = w.row;
          currentGroup.push(w);
        } else if (w.row === currentRow) {
          currentGroup.push(w);
        } else {
          flushGroup(currentGroup, result);
          currentGroup = [w];
          currentRow = w.row;
        }
      }
      flushGroup(currentGroup, result);
      return result;
    }
    function flushGroup(group, result) {
      if (group.length === 0)
        return;
      if (group.length === 1) {
        result.push(group[0]);
      } else {
        result.push({
          type: "HorizontalGroup",
          row: group[0].row,
          col: group[0].col,
          width: group[group.length - 1].col + group[group.length - 1].width - group[0].col,
          children: group
        });
      }
    }
  }
});

// ../markui-core/dist/parser/tree-builder.js
var require_tree_builder = __commonJS({
  "../markui-core/dist/parser/tree-builder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.buildTree = buildTree;
    var content_1 = require_content();
    function buildTree(boxes, layoutMap, grid) {
      const document2 = {
        type: "Document",
        row: 0,
        col: 0,
        width: grid.width,
        height: grid.height,
        children: []
      };
      const rootBoxes = boxes.filter((b) => !b.parent);
      for (let bi = 0; bi < boxes.length; bi++) {
        const box = boxes[bi];
        if (box.parent)
          continue;
        const node = buildBoxNode(box, bi, boxes, layoutMap, grid);
        document2.children.push(node);
      }
      const rootLayout = layoutMap.get(content_1.ROOT_KEY);
      if (rootLayout) {
        document2.children.push(...rootLayout.children);
      }
      document2.children.sort((a, b) => a.row - b.row || a.col - b.col);
      for (const child of document2.children) {
        const childRight = child.col + (child.width ?? 0);
        if (childRight > document2.width) {
          document2.width = childRight;
        }
      }
      return document2;
    }
    function buildBoxNode(box, boxIndex, allBoxes, layoutMap, grid) {
      let nodeType;
      switch (box.cornerChar) {
        case "v":
          nodeType = "VerticalList";
          break;
        case ">":
          nodeType = "HorizontalList";
          break;
        case "w":
          nodeType = "WrappedList";
          break;
        default:
          nodeType = "Box";
          break;
      }
      if (nodeType === "Box" && box.left > 2 && !box.parent) {
        nodeType = "ContextMenu";
      }
      const statusTitle = parseStatusTitle(box.title);
      if (statusTitle) {
        nodeType = "Toast";
      }
      if (box.typeName) {
      }
      const node = {
        type: nodeType,
        text: statusTitle ? statusTitle.text : box.title,
        row: box.top,
        col: box.left,
        width: box.right - box.left + 1,
        height: box.bottom - box.top + 1,
        children: [],
        level: box.nestLevel > 0 ? box.nestLevel : void 0,
        typeName: box.typeName || void 0,
        annotationType: statusTitle?.type,
        scrollRight: box.scrollRight || void 0,
        scrollBottom: box.scrollBottom || void 0,
        resizeDividers: box.resizeDividers.length > 0 ? box.resizeDividers : void 0
      };
      const tabBar = detectTabBar(grid, box);
      if (tabBar) {
        node.children.push(tabBar);
      }
      const key = `box:${boxIndex}`;
      const layout = layoutMap.get(key);
      if (layout) {
        node.children.push(...layout.children);
      }
      for (let ci = 0; ci < allBoxes.length; ci++) {
        const child = allBoxes[ci];
        if (child.parent !== box)
          continue;
        const childNode = buildBoxNode(child, ci, allBoxes, layoutMap, grid);
        node.children.push(childNode);
      }
      node.children.sort((a, b) => a.row - b.row || a.col - b.col);
      if (!box.hasRightBorder && node.children.length > 0) {
        let maxRight = node.col + node.width;
        for (const child of node.children) {
          const childRight = child.col + (child.width ?? 0);
          if (childRight > maxRight)
            maxRight = childRight;
        }
        node.width = maxRight - node.col + 1;
      }
      for (const child of node.children) {
        if (child.level && child.level > 0) {
          child.width = node.width;
        }
      }
      return node;
    }
    function parseStatusTitle(title) {
      if (!title)
        return null;
      const match = title.match(/^(?:\(([?$!ixv])\)|([?$!ixv])\s+)(.*)$/);
      if (!match)
        return null;
      return {
        type: match[1] ?? match[2],
        text: match[3].trim() || void 0
      };
    }
    function detectTabBar(grid, box) {
      const r = box.top;
      const tabs = [];
      let c = box.left + 1;
      const maxC = box.right;
      while (c < maxC) {
        const ch = grid.rows[r][c];
        if (ch === "[" && c + 1 < maxC && grid.rows[r][c + 1] === "[") {
          const start = c + 2;
          let end = start;
          while (end < maxC - 1 && !(grid.rows[r][end] === "]" && grid.rows[r][end + 1] === "]")) {
            end++;
          }
          if (end < maxC - 1) {
            const text = grid.rows[r].slice(start, end).join("");
            tabs.push({
              type: "ActiveTab",
              text,
              row: r,
              col: c,
              width: end + 2 - c,
              state: "selected",
              children: []
            });
            c = end + 2;
            continue;
          }
        }
        if (ch === "[") {
          const start = c + 1;
          let end = start;
          while (end < maxC && grid.rows[r][end] !== "]") {
            end++;
          }
          if (end < maxC) {
            const text = grid.rows[r].slice(start, end).join("");
            tabs.push({
              type: "Tab",
              text,
              row: r,
              col: c,
              width: end + 1 - c,
              children: []
            });
            c = end + 1;
            continue;
          }
        }
        c++;
      }
      if (tabs.length === 0)
        return null;
      return {
        type: "TabBar",
        row: r,
        col: box.left,
        width: box.right - box.left,
        children: tabs
      };
    }
  }
});

// ../markui-core/dist/parser/index.js
var require_parser = __commonJS({
  "../markui-core/dist/parser/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.parse = parse2;
    var limits_1 = require_limits();
    var grid_1 = require_grid();
    var boxes_1 = require_boxes();
    var content_1 = require_content();
    var tokenizer_1 = require_tokenizer();
    var merger_1 = require_merger();
    var layout_1 = require_layout();
    var tree_builder_1 = require_tree_builder();
    function parse2(source, options) {
      const mode = options?.mode ?? "autofix";
      const errors = [];
      const limitErrors = (0, limits_1.validateSourceLimits)(source, options?.limits);
      if (limitErrors.length > 0) {
        return { tree: emptyDocument(), errors: limitErrors, boxes: [], mode };
      }
      const grid = (0, grid_1.loadGrid)(source);
      const { boxes, errors: boxErrors } = (0, boxes_1.detectBoxes)(grid, mode);
      errors.push(...boxErrors);
      const boxLimitErrors = (0, limits_1.validateBoxLimit)(boxes.length, options?.limits);
      if (boxLimitErrors.length > 0) {
        errors.push(...boxLimitErrors);
        return { tree: emptyDocument(), errors, boxes: [], mode };
      }
      const { contentMap, errors: contentErrors } = (0, content_1.extractContent)(grid, boxes);
      errors.push(...contentErrors);
      const { tokenMap, errors: tokenErrors } = (0, tokenizer_1.tokenizeLines)(contentMap, mode);
      errors.push(...tokenErrors);
      const tokenLimitErrors = (0, limits_1.validateTokenLimit)(countTokens(tokenMap), options?.limits);
      if (tokenLimitErrors.length > 0) {
        errors.push(...tokenLimitErrors);
        return { tree: emptyDocument(), errors, boxes: [], mode };
      }
      const { mergedMap, errors: mergeErrors } = (0, merger_1.mergeMultiLine)(tokenMap, mode);
      errors.push(...mergeErrors);
      const { layoutMap } = (0, layout_1.resolveLayout)(mergedMap);
      const tree = (0, tree_builder_1.buildTree)(boxes, layoutMap, grid);
      return { tree, errors, boxes, mode };
    }
    function emptyDocument() {
      return {
        type: "Document",
        text: "",
        row: 0,
        col: 0,
        width: 0,
        height: 0,
        children: []
      };
    }
    function countTokens(tokenMap) {
      let count = 0;
      for (const entry of tokenMap.values()) {
        count += countTokenLines(entry.tokens);
        if (entry.columns) {
          for (const column of entry.columns) {
            count += countTokenLines(column.tokens);
          }
        }
      }
      return count;
    }
    function countTokenLines(lines) {
      let count = 0;
      for (const line of lines) {
        for (const token of line) {
          count += countToken(token);
        }
      }
      return count;
    }
    function countToken(token) {
      return 1 + (token.children?.reduce((sum, child) => sum + countToken(child), 0) ?? 0);
    }
  }
});

// ../markui-core/dist/renderer/svg-renderer.js
var require_svg_renderer = __commonJS({
  "../markui-core/dist/renderer/svg-renderer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.renderToSvg = renderToSvg2;
    function renderToSvg2(tree, theme) {
      const cw = theme.charWidth;
      const lh = theme.lineHeight;
      const totalW = (tree.width ?? 80) * cw + 20;
      const totalH = (tree.height ?? 40) * lh + 20;
      const parts = [];
      parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`, `<defs><style>`, `.mu-text{font-family:${esc(theme.fontFamily)};font-size:${theme.fontSize}px;fill:${theme.foreground}}`, `.mu-heading{font-family:${esc(theme.fontFamily)};fill:${theme.headingColor};font-weight:700}`, `.mu-link{font-family:${esc(theme.fontFamily)};font-size:${theme.fontSize}px;fill:${theme.linkColor};text-decoration:underline}`, `</style></defs>`, `<rect width="100%" height="100%" fill="${theme.background}"/>`);
      renderNode(tree, theme, parts, 10, 10, cw, lh);
      parts.push("</svg>");
      return parts.join("\n");
    }
    function renderNode(node, t, out, baseX, baseY, cw, lh) {
      const x = baseX + node.col * cw;
      const y = baseY + node.row * lh;
      switch (node.type) {
        case "Document":
          renderDocumentFrame(node, t, out, baseX, baseY, cw, lh);
          for (const child of node.children)
            renderNode(child, t, out, baseX, baseY, cw, lh);
          break;
        case "Box":
        case "ContextMenu":
          renderBox(node, t, out, baseX, baseY, cw, lh, false);
          break;
        case "VerticalList":
        case "HorizontalList":
        case "WrappedList":
          renderListContainer(node, t, out, baseX, baseY, cw, lh);
          break;
        case "Toast":
          renderToast(node, t, out, x, y, cw, lh);
          break;
        case "HorizontalGroup":
        case "VerticalGroup":
        case "ColumnLayout":
        case "FormField":
          for (const child of node.children)
            renderNode(child, t, out, baseX, baseY, cw, lh);
          break;
        case "Button":
          renderButton(node, t, out, x, y, cw, lh);
          break;
        case "IconButton":
          renderIconButton(node, t, out, x, y, cw, lh);
          break;
        case "SplitButton":
          renderSplitButton(node, t, out, x, y, cw, lh);
          break;
        case "PrevButton":
          renderNavButton(node, t, out, x, y, cw, lh, "\u25C0");
          break;
        case "NextButton":
          renderNavButton(node, t, out, x, y, cw, lh, "\u25B6");
          break;
        case "Link":
          renderLink(node, t, out, x, y, cw, lh);
          break;
        case "Checkbox":
          renderCheckbox(node, t, out, x, y, cw, lh);
          break;
        case "Radio":
          renderRadio(node, t, out, x, y, cw, lh);
          break;
        case "TextInput":
        case "PasswordInput":
        case "DateInput":
        case "NumberInput":
        case "CustomInput":
          renderTextInput(node, t, out, x, y, cw, lh);
          break;
        case "Textarea":
          renderTextarea(node, t, out, x, y, cw, lh);
          break;
        case "Dropdown":
          renderDropdown(node, t, out, x, y, cw, lh);
          break;
        case "Toggle":
          renderToggle(node, t, out, x, y, cw, lh);
          break;
        case "Slider":
          renderSlider(node, t, out, x, y, cw, lh);
          break;
        case "ProgressBar":
          renderSlider(node, t, out, x, y, cw, lh);
          break;
        case "Stepper":
          renderStepper(node, t, out, x, y, cw, lh);
          break;
        case "Rating":
          renderRating(node, t, out, x, y, cw, lh);
          break;
        case "Badge":
          renderBadge(node, t, out, x, y, cw, lh);
          break;
        case "Tag":
          renderTag(node, t, out, x, y, cw, lh);
          break;
        case "RemovableChip":
          renderChip(node, t, out, x, y, cw, lh);
          break;
        case "Icon":
          renderIcon(node, t, out, x, y, cw, lh);
          break;
        case "Image":
          renderImage(node, t, out, x, y, cw, lh);
          break;
        case "Separator":
          renderSeparator(node, t, out, x, y, cw, lh);
          break;
        case "Spinner":
          renderSpinner(node, t, out, x, y, cw, lh);
          break;
        case "Label":
          renderLabel(node, t, out, x, y, cw, lh);
          break;
        case "Heading":
          renderHeading(node, t, out, x, y, cw, lh);
          break;
        case "Annotation":
          renderAnnotation(node, t, out, x, y, cw, lh);
          break;
        case "Accordion":
        case "Expander":
          renderAccordion(node, t, out, x, y, cw, lh, baseX, baseY);
          break;
        case "TreeNode":
          renderTreeNode(node, t, out, x, y, cw, lh);
          break;
        case "ComponentRef":
          renderComponentRef(node, t, out, x, y, cw, lh);
          break;
        case "SlotMarker":
          renderSlotMarker(node, t, out, x, y, cw, lh);
          break;
        case "TabBar":
          renderTabBar(node, t, out, x, y, cw, lh, baseX, baseY);
          break;
        case "Tab":
        case "ActiveTab":
          renderTab(node, t, out, x, y, cw, lh);
          break;
        case "Breadcrumb":
          renderBreadcrumb(node, t, out, x, y, cw, lh);
          break;
        case "Pagination":
          for (const child of node.children)
            renderNode(child, t, out, baseX, baseY, cw, lh);
          break;
        case "Table":
          renderTable(node, t, out, x, y, cw, lh, baseX, baseY);
          break;
        case "TableRow":
        case "TableHeader":
          break;
        case "TableCell":
          break;
        case "DropdownOption":
          break;
        default:
          if (node.text) {
            out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
          }
          for (const child of node.children)
            renderNode(child, t, out, baseX, baseY, cw, lh);
          break;
      }
    }
    function renderDocumentFrame(node, t, out, baseX, baseY, cw, lh) {
      if (node.children.length === 0)
        return;
      const explicitContainerTypes = /* @__PURE__ */ new Set([
        "Box",
        "ContextMenu",
        "VerticalList",
        "HorizontalList",
        "WrappedList",
        "Toast",
        "Accordion",
        "Expander"
      ]);
      const needsFrame = node.children.some((child) => !explicitContainerTypes.has(child.type));
      if (!needsFrame)
        return;
      const bounds = getNodeCollectionBounds(node.children);
      const pad = 8;
      const x = Math.max(0, baseX + bounds.left * cw - pad);
      const y = Math.max(0, baseY + bounds.top * lh - pad);
      const w = Math.max((bounds.right - bounds.left) * cw + pad * 2, 120);
      const h = Math.max((bounds.bottom - bounds.top) * lh + pad * 2, lh * 3);
      out.push(`<rect data-markui="implicit-root" x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${t.background}" stroke="${t.border}" stroke-width="1.5"/>`);
    }
    function renderBox(node, t, out, baseX, baseY, cw, lh, isCard) {
      const x = baseX + node.col * cw;
      const y = baseY + node.row * lh;
      const w = node.width * cw;
      const h = (node.height ?? 3) * lh;
      const rx = isCard ? 8 : 2;
      out.push(`<g>`);
      if (node.level && node.level > 0) {
        out.push(`<line x1="${x}" y1="${y + lh * 0.5}" x2="${x + w}" y2="${y + lh * 0.5}" stroke="${t.border}" stroke-width="1" opacity="0.7"/>`);
        if (node.text) {
          out.push(`<text x="${x + 8}" y="${y + lh * 0.7}" class="mu-text" font-weight="600" font-size="${t.fontSize * 0.95}px">${esc(node.text)}</text>`);
        }
        for (const child of node.children) {
          renderNode(child, t, out, baseX, baseY, cw, lh);
        }
        out.push("</g>");
        return;
      }
      if (isCard) {
        out.push(`<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="${rx}" fill="rgba(0,0,0,0.08)"/>`);
      }
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${t.background}" stroke="${t.border}" stroke-width="1.5"/>`);
      if (node.text) {
        out.push(`<text x="${x + 8}" y="${y + lh * 0.7}" class="mu-text" font-weight="600">${esc(node.text)}</text>`);
      }
      for (const child of node.children) {
        renderNode(child, t, out, baseX, baseY, cw, lh);
      }
      if (node.scrollRight)
        renderVerticalScrollbar(out, t, x, y, w, h, lh);
      if (node.scrollBottom)
        renderHorizontalScrollbar(out, t, x, y, w, h);
      if (node.resizeDividers) {
        for (const dc of node.resizeDividers) {
          const dx = baseX + dc * cw;
          out.push(`<line x1="${dx}" y1="${y}" x2="${dx}" y2="${y + h}" stroke="${t.border}" stroke-width="1" stroke-dasharray="3 3"/>`);
          const midY = y + h / 2;
          for (let di = -1; di <= 1; di++) {
            out.push(`<circle cx="${dx}" cy="${midY + di * 8}" r="2" fill="${t.border}" opacity="0.6"/>`);
          }
        }
      }
      out.push("</g>");
    }
    function renderListContainer(node, t, out, baseX, baseY, cw, lh) {
      const x = baseX + node.col * cw;
      const y = baseY + node.row * lh;
      const w = node.width * cw;
      const h = (node.height ?? 3) * lh;
      const showRightScrollbar = node.scrollRight || node.type === "VerticalList" || node.type === "WrappedList";
      const showBottomScrollbar = node.scrollBottom || node.type === "HorizontalList" || node.type === "WrappedList";
      out.push(`<g data-markui="${node.type}">`);
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${t.background}" stroke="${t.border}" stroke-width="1.5"/>`);
      if (node.text) {
        out.push(`<rect x="${x + 1}" y="${y + 1}" width="${Math.max(w - 2, 0)}" height="${lh - 2}" fill="${t.inactiveTabBg}" opacity="0.45"/>`);
        renderListGlyph(node, t, out, x + 8, y + 4);
        out.push(`<text x="${x + 30}" y="${y + lh * 0.7}" class="mu-text" font-weight="600">${esc(node.text)}</text>`);
      } else {
        renderListGlyph(node, t, out, x + 8, y + 4);
      }
      for (const child of node.children) {
        renderNode(child, t, out, baseX, baseY, cw, lh);
      }
      if (showRightScrollbar)
        renderVerticalScrollbar(out, t, x, y, w, h, lh);
      if (showBottomScrollbar)
        renderHorizontalScrollbar(out, t, x, y, w, h);
      out.push("</g>");
    }
    function renderListGlyph(node, t, out, x, y) {
      if (node.type === "HorizontalList") {
        out.push(`<line x1="${x}" y1="${y + 5}" x2="${x + 16}" y2="${y + 5}" stroke="${t.border}" stroke-width="1.5"/>`);
        out.push(`<polyline points="${x + 12},${y + 1} ${x + 16},${y + 5} ${x + 12},${y + 9}" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);
        return;
      }
      if (node.type === "WrappedList") {
        out.push(`<path d="M${x},${y + 3} H${x + 14} Q${x + 18},${y + 3} ${x + 18},${y + 7} Q${x + 18},${y + 11} ${x + 14},${y + 11} H${x + 4}" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);
        out.push(`<polyline points="${x + 7},${y + 8} ${x + 4},${y + 11} ${x + 7},${y + 14}" fill="none" stroke="${t.border}" stroke-width="1.5"/>`);
        return;
      }
      for (let i = 0; i < 3; i++) {
        const cy = y + 2 + i * 5;
        out.push(`<circle cx="${x + 2}" cy="${cy}" r="1.3" fill="${t.border}"/>`);
        out.push(`<line x1="${x + 6}" y1="${cy}" x2="${x + 18}" y2="${cy}" stroke="${t.border}" stroke-width="1.5"/>`);
      }
    }
    function renderVerticalScrollbar(out, t, x, y, w, h, lh) {
      const sbw = 6;
      const sbx = x + w - sbw - 2;
      const sby = y + lh + 2;
      const sbh = Math.max(h - lh - 8, 12);
      out.push(`<rect data-markui="scrollbar-right" x="${sbx}" y="${sby}" width="${sbw}" height="${sbh}" rx="3" fill="${t.scrollbarBg}"/>`);
      const thumbH = Math.max(sbh * 0.35, 12);
      out.push(`<rect x="${sbx}" y="${sby}" width="${sbw}" height="${thumbH}" rx="3" fill="${t.border}" opacity="0.5"/>`);
    }
    function renderHorizontalScrollbar(out, t, x, y, w, h) {
      const sbh = 6;
      const sbx = x + 4;
      const sby = y + h - sbh - 2;
      const sbw = Math.max(w - 10, 12);
      out.push(`<rect data-markui="scrollbar-bottom" x="${sbx}" y="${sby}" width="${sbw}" height="${sbh}" rx="3" fill="${t.scrollbarBg}"/>`);
      const thumbW = Math.max(sbw * 0.35, 12);
      out.push(`<rect x="${sbx}" y="${sby}" width="${thumbW}" height="${sbh}" rx="3" fill="${t.border}" opacity="0.5"/>`);
    }
    function renderToast(node, t, out, x, y, cw, lh) {
      const w = node.width * cw;
      const h = (node.height ?? 2) * lh;
      const color = annotationColor(node.annotationType, t);
      const message = node.text || node.children.map((child) => child.text).filter(Boolean).join(" ");
      out.push(`<g>`);
      out.push(`<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="6" fill="rgba(0,0,0,0.1)"/>`);
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${t.tooltipBg}" stroke="${t.border}"/>`);
      if (node.annotationType) {
        renderStatusIcon(node.annotationType, color, t.tooltipFg, out, x + 10, y + h / 2 - 7);
      }
      if (message) {
        const textX = node.annotationType ? x + 34 : x + 8;
        out.push(`<text x="${textX}" y="${y + h / 2 + 4}" fill="${t.tooltipFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(message)}</text>`);
      }
      out.push("</g>");
    }
    function renderButton(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, (node.text?.length ?? 4) * cw + 16);
      const h = lh + 4;
      const bx = x;
      const by = y + 2;
      out.push(`<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="4" fill="${t.buttonBg}" stroke="${t.buttonBorder}" stroke-width="1"/>`, `<text x="${bx + w / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "")}</text>`);
    }
    function renderIconButton(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, (node.text?.length ?? 4) * cw + 24);
      const h = lh + 4;
      out.push(`<rect x="${x}" y="${y + 2}" width="${w}" height="${h}" rx="4" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<text x="${x + 6}" y="${y + h / 2 + 6}" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">#${node.iconIndex ?? 0}</text>`, `<text x="${x + 20}" y="${y + h / 2 + 6}" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "")}</text>`);
    }
    function renderSplitButton(node, t, out, x, y, cw, lh) {
      const textW = (node.text?.length ?? 4) * cw + 12;
      const arrowW = 20;
      const h = lh + 4;
      const by = y + 2;
      out.push(`<rect x="${x}" y="${by}" width="${textW + arrowW}" height="${h}" rx="4" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<line x1="${x + textW}" y1="${by}" x2="${x + textW}" y2="${by + h}" stroke="${t.buttonBorder}"/>`, `<text x="${x + textW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "")}</text>`, `<text x="${x + textW + arrowW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">\u25BC</text>`);
    }
    function renderNavButton(node, t, out, x, y, cw, lh, arrow) {
      const s = lh;
      out.push(`<rect x="${x}" y="${y + 2}" width="${s}" height="${s}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<text x="${x + s / 2}" y="${y + 2 + s / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">${arrow}</text>`);
    }
    function renderLink(node, t, out, x, y, cw, lh) {
      out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-link">${esc(node.text ?? "")}</text>`);
    }
    function renderCheckbox(node, t, out, x, y, cw, lh) {
      const s = 14;
      const by = y + (lh - s) / 2;
      const checked = node.state === "checked";
      const mixed = node.state === "mixed";
      out.push(`<rect x="${x}" y="${by}" width="${s}" height="${s}" rx="2" fill="${checked ? t.checkboxChecked : t.inputBg}" stroke="${t.checkboxBorder}"/>`);
      if (checked) {
        out.push(`<polyline points="${x + 3},${by + 7} ${x + 6},${by + 10} ${x + 11},${by + 4}" fill="none" stroke="#fff" stroke-width="2"/>`);
      } else if (mixed) {
        out.push(`<line x1="${x + 3}" y1="${by + s / 2}" x2="${x + s - 3}" y2="${by + s / 2}" stroke="${t.checkboxChecked}" stroke-width="2"/>`);
      }
      if (node.text) {
        out.push(`<text x="${x + s + 6}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
      }
    }
    function renderRadio(node, t, out, x, y, cw, lh) {
      const r = 7;
      const cx = x + r;
      const cy = y + lh / 2;
      const selected = node.state === "selected";
      out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.inputBg}" stroke="${t.radioBorder}" stroke-width="1.5"/>`);
      if (selected) {
        out.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="${t.radioSelected}"/>`);
      }
      if (node.text) {
        out.push(`<text x="${x + r * 2 + 6}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
      }
    }
    function renderTextInput(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 60);
      const h = lh - 2;
      const by = y + 1;
      const stroke = node.type === "CustomInput" ? `stroke-dasharray="4 2" stroke="${t.inputBorder}"` : `stroke="${t.inputBorder}"`;
      out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" ${stroke}/>`);
      let displayText = node.value ?? node.text ?? "";
      if (node.type === "PasswordInput") {
        displayText = "\u2022".repeat(displayText.length || 8);
      }
      if (displayText) {
        out.push(`<text x="${x + 6}" y="${by + h / 2 + 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(displayText)}</text>`);
      }
    }
    function renderTextarea(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 80);
      const h = (node.height ?? 3) * lh;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
      if (node.text) {
        const lines = node.text.split("\n");
        for (let li = 0; li < lines.length; li++) {
          out.push(`<text x="${x + 6}" y="${y + (li + 1) * lh - 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(lines[li])}</text>`);
        }
      }
    }
    function renderDropdown(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 80);
      const h = lh + 4;
      const by = y + 2;
      out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
      out.push(`<text x="${x + 6}" y="${by + h / 2 + 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "")}</text>`);
      const chevY = by + h / 2;
      const chevX = x + w - 16;
      if (node.state === "expanded") {
        out.push(`<polyline points="${chevX - 3},${chevY + 2} ${chevX},${chevY - 2} ${chevX + 3},${chevY + 2}" fill="none" stroke="${t.inputFg}" stroke-width="1.5"/>`);
      } else {
        out.push(`<polyline points="${chevX - 3},${chevY - 2} ${chevX},${chevY + 2} ${chevX + 3},${chevY - 2}" fill="none" stroke="${t.inputFg}" stroke-width="1.5"/>`);
      }
      if (node.state === "expanded" && node.children.length > 0) {
        const optY = by + h;
        const optH = node.children.length * lh;
        out.push(`<rect x="${x}" y="${optY}" width="${w}" height="${optH}" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
        for (let oi = 0; oi < node.children.length; oi++) {
          const opt = node.children[oi];
          const oY = optY + oi * lh;
          out.push(`<text x="${x + 8}" y="${oY + lh * 0.7}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(opt.text ?? "")}</text>`);
        }
      }
    }
    function renderToggle(node, t, out, x, y, cw, lh) {
      const w = 36;
      const h = 18;
      const by = y + (lh - h) / 2;
      const isOn = node.state === "on";
      out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${isOn ? t.toggleOnBg : t.toggleOffBg}"/>`);
      const knobX = isOn ? x + w - h / 2 - 2 : x + h / 2 + 2;
      out.push(`<circle cx="${knobX}" cy="${by + h / 2}" r="${h / 2 - 2}" fill="${t.toggleKnob}"/>`);
    }
    function renderSlider(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 60);
      const trackH = 6;
      const trackY = y + lh / 2 - trackH / 2;
      const pct = (node.percentage ?? 50) / 100;
      const filledW = w * pct;
      out.push(`<rect x="${x}" y="${trackY}" width="${w}" height="${trackH}" rx="3" fill="${t.sliderEmpty}"/>`);
      out.push(`<rect x="${x}" y="${trackY}" width="${filledW}" height="${trackH}" rx="3" fill="${t.sliderFilled}"/>`);
      if (node.type === "Slider") {
        out.push(`<circle cx="${x + filledW}" cy="${trackY + trackH / 2}" r="7" fill="${t.sliderFilled}" stroke="#fff" stroke-width="2"/>`);
      }
    }
    function renderStepper(node, t, out, x, y, cw, lh) {
      const h = lh + 2;
      const btnW = 24;
      const valW = 32;
      const by = y + 2;
      out.push(`<rect x="${x}" y="${by}" width="${btnW}" height="${h}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`);
      out.push(`<text x="${x + btnW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">-</text>`);
      out.push(`<rect x="${x + btnW}" y="${by}" width="${valW}" height="${h}" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
      out.push(`<text x="${x + btnW + valW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.value ?? node.text ?? "0")}</text>`);
      out.push(`<rect x="${x + btnW + valW}" y="${by}" width="${btnW}" height="${h}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`);
      out.push(`<text x="${x + btnW + valW + btnW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">+</text>`);
    }
    function renderRating(node, t, out, x, y, cw, lh) {
      const filled = node.numerator ?? 0;
      const total = node.denominator ?? 5;
      const starSize = 16;
      for (let si = 0; si < total; si++) {
        const sx = x + si * (starSize + 2);
        const fill = si < filled ? "#f59e0b" : t.sliderEmpty;
        out.push(`<text x="${sx}" y="${y + lh * 0.7}" fill="${fill}" font-size="${starSize}px">\u2605</text>`);
      }
    }
    function renderBadge(node, t, out, x, y, cw, lh) {
      const text = node.text ?? "";
      const r = Math.max(10, text.length * 4 + 6);
      const cx = x + r;
      const cy = y + lh / 2;
      out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.badgeBg}"/>`);
      out.push(`<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${t.badgeFg}" font-family="${esc(t.fontFamily)}" font-size="11px" font-weight="600">${esc(text)}</text>`);
    }
    function renderTag(node, t, out, x, y, cw, lh) {
      const text = node.text ?? "";
      const w = text.length * cw + 16;
      const h = lh - 2;
      const by = y + 2;
      out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.tagBg}" stroke="${t.tagBorder}"/>`);
      out.push(`<text x="${x + 8}" y="${by + h / 2 + 4}" fill="${t.tagFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(text)}</text>`);
    }
    function renderChip(node, t, out, x, y, cw, lh) {
      const text = node.text ?? "";
      const w = text.length * cw + 28;
      const h = lh - 2;
      const by = y + 2;
      out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.tagBg}" stroke="${t.tagBorder}"/>`);
      out.push(`<text x="${x + 8}" y="${by + h / 2 + 4}" fill="${t.tagFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(text)}</text>`);
      const xBtnX = x + w - 16;
      const xBtnY = by + h / 2;
      out.push(`<line x1="${xBtnX - 3}" y1="${xBtnY - 3}" x2="${xBtnX + 3}" y2="${xBtnY + 3}" stroke="${t.tagFg}" stroke-width="1.5"/>`);
      out.push(`<line x1="${xBtnX + 3}" y1="${xBtnY - 3}" x2="${xBtnX - 3}" y2="${xBtnY + 3}" stroke="${t.tagFg}" stroke-width="1.5"/>`);
    }
    function renderIcon(node, t, out, x, y, cw, lh) {
      const s = 16;
      const by = y + (lh - s) / 2;
      out.push(`<rect x="${x}" y="${by}" width="${s}" height="${s}" rx="2" fill="${t.border}" opacity="0.3"/>`);
      out.push(`<text x="${x + s / 2}" y="${by + s / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="9px">#${node.iconIndex ?? 0}</text>`);
    }
    function renderImage(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 60);
      const h = (node.height ?? 3) * lh;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t.inputBg}" stroke="${t.border}" stroke-dasharray="4 2"/>`);
      out.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${t.border}" stroke-width="0.5"/>`);
      out.push(`<line x1="${x + w}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${t.border}" stroke-width="0.5"/>`);
      out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "IMG")}</text>`);
    }
    function renderSeparator(node, t, out, x, y, cw, lh) {
      const w = Math.max(node.width * cw, 40);
      const ly = y + lh / 2;
      out.push(`<line x1="${x}" y1="${ly}" x2="${x + w}" y2="${ly}" stroke="${t.separatorColor}" stroke-width="1"/>`);
    }
    function renderSpinner(node, t, out, x, y, cw, lh) {
      const r = 8;
      const cx = x + r + 2;
      const cy = y + lh / 2;
      out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.border}" stroke-width="2"/>`);
      out.push(`<path d="M${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy}" fill="none" stroke="${t.buttonBg}" stroke-width="2"/>`);
    }
    function renderLabel(node, t, out, x, y, cw, lh) {
      out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text ?? "")}</text>`);
    }
    function renderHeading(node, t, out, x, y, cw, lh) {
      const level = node.level ?? 1;
      const sizes = [24, 20, 17, 15, 14, 13];
      const size = sizes[Math.min(level - 1, sizes.length - 1)];
      out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-heading" font-size="${size}px">${esc(node.text ?? "")}</text>`);
    }
    function renderAnnotation(node, t, out, x, y, cw, lh) {
      const color = annotationColor(node.annotationType, t);
      renderStatusIcon(node.annotationType ?? "?", color, t.background, out, x, y + 2);
      out.push(`<text x="${x + 22}" y="${y + lh * 0.7}" fill="${color}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? "")}</text>`);
    }
    function annotationColor(type, t) {
      const typeColorMap = {
        "?": t.helpColor,
        "$": t.warningColor,
        "!": t.errorColor,
        "i": t.infoColor,
        "x": t.errorColor,
        "v": t.successColor
      };
      return typeColorMap[type ?? ""] ?? t.foreground;
    }
    function renderStatusIcon(type, color, foreground, out, x, y) {
      const s = 14;
      const cx = x + s / 2;
      const cy = y + s / 2;
      out.push(`<circle data-markui="status-icon" cx="${cx}" cy="${cy}" r="${s / 2}" fill="${color}"/>`);
      if (type === "v") {
        out.push(`<polyline points="${x + 3.5},${y + 7.2} ${x + 6},${y + 9.7} ${x + 10.8},${y + 4.4}" fill="none" stroke="${foreground}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
        return;
      }
      if (type === "x") {
        out.push(`<line x1="${x + 4.2}" y1="${y + 4.2}" x2="${x + 9.8}" y2="${y + 9.8}" stroke="${foreground}" stroke-width="2" stroke-linecap="round"/>`);
        out.push(`<line x1="${x + 9.8}" y1="${y + 4.2}" x2="${x + 4.2}" y2="${y + 9.8}" stroke="${foreground}" stroke-width="2" stroke-linecap="round"/>`);
        return;
      }
      const glyph = type === "!" ? "!" : type === "i" ? "i" : type === "$" ? "$" : "?";
      out.push(`<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${foreground}" font-family="Arial, sans-serif" font-size="10px" font-weight="700">${glyph}</text>`);
    }
    function renderAccordion(node, t, out, x, y, cw, lh, baseX, baseY) {
      if (node.type === "Accordion") {
        const bounds = getNodeCollectionBounds(node.children.length > 0 ? node.children : [node]);
        const ax = baseX + bounds.left * cw - 4;
        const ay = baseY + bounds.top * lh - 2;
        const aw = Math.max((bounds.right - bounds.left) * cw + 8, 120);
        const ah = Math.max((bounds.bottom - bounds.top) * lh + 8, lh + 8);
        out.push(`<rect data-markui="accordion-frame" x="${Math.max(0, ax)}" y="${Math.max(0, ay)}" width="${aw}" height="${ah}" rx="4" fill="none" stroke="${t.border}" opacity="0.55"/>`);
        for (const child of node.children) {
          renderNode(child, t, out, baseX, baseY, cw, lh);
        }
        return;
      }
      const w = Math.max(node.width * cw, 120);
      const h = lh + 4;
      const expanded = node.state === "expanded";
      const marker = expanded ? "\u25BC" : "\u25B6";
      out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.border}"/>`);
      out.push(`<text x="${x + 6}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="10px">${marker}</text>`);
      out.push(`<text x="${x + 20}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" font-weight="600">${esc(node.text ?? "")}</text>`);
      if (expanded && node.children.length > 0) {
        const bounds = getNodeCollectionBounds(node.children);
        const panelX = x;
        const panelY = baseY + bounds.top * lh + 1;
        const panelW = Math.max(w, (bounds.right - node.col) * cw + 8);
        const panelH = Math.max((bounds.bottom - bounds.top) * lh + 8, lh + 8);
        out.push(`<rect data-markui="expander-panel" x="${panelX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="3" fill="${t.background}" stroke="${t.border}" stroke-width="1"/>`);
        for (const child of node.children) {
          renderNode(child, t, out, baseX, baseY, cw, lh);
        }
      }
    }
    function renderTreeNode(node, t, out, x, y, cw, lh) {
      const indent = (node.level ?? 0) * 16;
      const marker = node.state === "collapsed" ? "\u25B6" : "\u25BC";
      out.push(`<text x="${x + indent}" y="${y + lh * 0.7}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="10px">${marker}</text>`);
      out.push(`<text x="${x + indent + 14}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text ?? "")}</text>`);
    }
    function renderComponentRef(node, t, out, x, y, cw, lh) {
      const w = (node.text?.length ?? 10) * cw + 20;
      const h = lh + 4;
      out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="3" fill="none" stroke="${t.border}" stroke-dasharray="4 2"/>`);
      out.push(`<text x="${x + 8}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" font-style="italic">@${esc(node.text ?? "")}</text>`);
    }
    function renderSlotMarker(node, t, out, x, y, cw, lh) {
      const w = (node.text?.length ?? 6) * cw + 20;
      const h = lh;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${t.border}" stroke-dasharray="2 2"/>`);
      out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="11px" font-style="italic">${esc(node.text ?? "slot")}</text>`);
    }
    function renderTabBar(node, t, out, x, y, cw, lh, baseX, baseY) {
      const w = node.width * cw;
      const h = lh + 4;
      out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t.inactiveTabBg}"/>`);
      for (const child of node.children) {
        renderNode(child, t, out, baseX, baseY, cw, lh);
      }
    }
    function renderTab(node, t, out, x, y, cw, lh) {
      const text = node.text ?? "";
      const w = text.length * cw + 16;
      const h = lh + 2;
      const active = node.type === "ActiveTab";
      out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="4 4 0 0" fill="${active ? t.activeTabBg : t.inactiveTabBg}" stroke="${t.border}" stroke-width="1"/>`);
      out.push(`<text x="${x + 8}" y="${y + h / 2 + 5}" fill="${active ? t.activeTabFg : t.inactiveTabFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" ${active ? 'font-weight="600"' : ""}>${esc(text)}</text>`);
    }
    function renderBreadcrumb(node, t, out, x, y, cw, lh) {
      let cx = x;
      for (let i = 0; i < node.children.length; i++) {
        const seg = node.children[i];
        const text = seg.text ?? "";
        out.push(`<text x="${cx}" y="${y + lh * 0.7}" class="mu-text" ${i < node.children.length - 1 ? `fill="${t.linkColor}"` : ""}>${esc(text)}</text>`);
        cx += text.length * cw + 4;
        if (i < node.children.length - 1) {
          out.push(`<text x="${cx}" y="${y + lh * 0.7}" class="mu-text" fill="${t.foreground}"> &gt; </text>`);
          cx += 3 * cw;
        }
      }
    }
    function renderTable(node, t, out, x, y, cw, lh, baseX, baseY) {
      const rows = node.children;
      if (rows.length === 0)
        return;
      const firstRow = rows[0];
      const numCols = firstRow.children.length;
      const colWidths = [];
      for (let ci = 0; ci < numCols; ci++) {
        let maxW = 0;
        for (const row of rows) {
          if (ci < row.children.length) {
            const cellText = row.children[ci].text ?? "";
            maxW = Math.max(maxW, cellText.length * cw + 16);
          }
        }
        colWidths.push(Math.max(maxW, 40));
      }
      const totalW = colWidths.reduce((a, b) => a + b, 0);
      let ry = y;
      out.push(`<rect x="${x}" y="${y}" width="${totalW}" height="${rows.length * lh}" fill="${t.background}" stroke="${t.border}"/>`);
      for (let ri = 0; ri < rows.length; ri++) {
        const row = rows[ri];
        const isHeader = row.type === "TableHeader";
        let cx = x;
        if (isHeader) {
          out.push(`<rect x="${x}" y="${ry}" width="${totalW}" height="${lh}" fill="${t.inactiveTabBg}"/>`);
        }
        for (let ci = 0; ci < row.children.length; ci++) {
          const cell = row.children[ci];
          const cw2 = colWidths[ci] ?? 40;
          out.push(`<rect x="${cx}" y="${ry}" width="${cw2}" height="${lh}" fill="none" stroke="${t.border}" stroke-width="0.5"/>`);
          out.push(`<text x="${cx + 6}" y="${ry + lh * 0.7}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" ${isHeader ? 'font-weight="600"' : ""}>${esc(cell.text ?? "")}</text>`);
          cx += cw2;
        }
        ry += lh;
      }
    }
    function getNodeCollectionBounds(nodes) {
      let left = Number.POSITIVE_INFINITY;
      let top = Number.POSITIVE_INFINITY;
      let right = 0;
      let bottom = 0;
      for (const node of nodes) {
        const bounds = getNodeBounds(node);
        left = Math.min(left, bounds.left);
        top = Math.min(top, bounds.top);
        right = Math.max(right, bounds.right);
        bottom = Math.max(bottom, bounds.bottom);
      }
      if (!Number.isFinite(left) || !Number.isFinite(top)) {
        return { left: 0, top: 0, right: 0, bottom: 0 };
      }
      return { left, top, right, bottom };
    }
    function getNodeBounds(node) {
      let left = node.col;
      let top = node.row;
      let right = node.col + Math.max(node.width ?? 1, 1);
      let bottom = node.row + Math.max(node.height ?? 1, 1);
      for (const child of node.children) {
        const bounds = getNodeBounds(child);
        left = Math.min(left, bounds.left);
        top = Math.min(top, bounds.top);
        right = Math.max(right, bounds.right);
        bottom = Math.max(bottom, bounds.bottom);
      }
      return { left, top, right, bottom };
    }
    function esc(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
  }
});

// ../markui-core/dist/renderer/themes.js
var require_themes = __commonJS({
  "../markui-core/dist/renderer/themes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.blueprintTheme = exports2.sketchTheme = exports2.cleanTheme = void 0;
    exports2.getTheme = getTheme2;
    exports2.cleanTheme = {
      background: "#ffffff",
      foreground: "#1a1a1a",
      border: "#d1d5db",
      buttonBg: "#3b82f6",
      buttonFg: "#ffffff",
      buttonBorder: "#2563eb",
      inputBg: "#ffffff",
      inputBorder: "#9ca3af",
      inputFg: "#1a1a1a",
      activeTabBg: "#ffffff",
      activeTabFg: "#1a1a1a",
      inactiveTabBg: "#f3f4f6",
      inactiveTabFg: "#6b7280",
      checkboxBorder: "#9ca3af",
      checkboxChecked: "#3b82f6",
      radioBorder: "#9ca3af",
      radioSelected: "#3b82f6",
      linkColor: "#2563eb",
      headingColor: "#111827",
      separatorColor: "#e5e7eb",
      badgeBg: "#ef4444",
      badgeFg: "#ffffff",
      tagBg: "#e5e7eb",
      tagFg: "#374151",
      tagBorder: "#d1d5db",
      errorColor: "#ef4444",
      warningColor: "#f59e0b",
      successColor: "#10b981",
      infoColor: "#3b82f6",
      helpColor: "#8b5cf6",
      tooltipBg: "#1f2937",
      tooltipFg: "#f9fafb",
      sliderFilled: "#3b82f6",
      sliderEmpty: "#e5e7eb",
      toggleOnBg: "#3b82f6",
      toggleOffBg: "#d1d5db",
      toggleKnob: "#ffffff",
      scrollbarBg: "#e5e7eb",
      boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      fontSize: 13,
      charWidth: 8,
      lineHeight: 20
    };
    exports2.sketchTheme = {
      background: "#faf9f6",
      foreground: "#333333",
      border: "#aaaaaa",
      buttonBg: "#e0e0e0",
      buttonFg: "#333333",
      buttonBorder: "#999999",
      inputBg: "#fefefe",
      inputBorder: "#bbbbbb",
      inputFg: "#333333",
      activeTabBg: "#faf9f6",
      activeTabFg: "#333333",
      inactiveTabBg: "#eeeeee",
      inactiveTabFg: "#888888",
      checkboxBorder: "#999999",
      checkboxChecked: "#555555",
      radioBorder: "#999999",
      radioSelected: "#555555",
      linkColor: "#4477aa",
      headingColor: "#222222",
      separatorColor: "#cccccc",
      badgeBg: "#cc4444",
      badgeFg: "#ffffff",
      tagBg: "#eeeeee",
      tagFg: "#555555",
      tagBorder: "#cccccc",
      errorColor: "#cc4444",
      warningColor: "#cc8800",
      successColor: "#44aa66",
      infoColor: "#4477aa",
      helpColor: "#7744aa",
      tooltipBg: "#444444",
      tooltipFg: "#f5f5f5",
      sliderFilled: "#888888",
      sliderEmpty: "#dddddd",
      toggleOnBg: "#888888",
      toggleOffBg: "#cccccc",
      toggleKnob: "#ffffff",
      scrollbarBg: "#dddddd",
      boxShadow: "1px 2px 4px rgba(0,0,0,0.15)",
      fontFamily: "'Caveat', 'Comic Sans MS', cursive",
      fontSize: 14,
      charWidth: 8,
      lineHeight: 22
    };
    exports2.blueprintTheme = {
      background: "#1a365d",
      foreground: "#e2e8f0",
      border: "#4a7ab5",
      buttonBg: "#ffffff",
      buttonFg: "#1a365d",
      buttonBorder: "#e2e8f0",
      inputBg: "#1e3a5f",
      inputBorder: "#4a7ab5",
      inputFg: "#e2e8f0",
      activeTabBg: "#2d4a7a",
      activeTabFg: "#ffffff",
      inactiveTabBg: "#1a365d",
      inactiveTabFg: "#90b4e0",
      checkboxBorder: "#4a7ab5",
      checkboxChecked: "#90cdf4",
      radioBorder: "#4a7ab5",
      radioSelected: "#90cdf4",
      linkColor: "#90cdf4",
      headingColor: "#ffffff",
      separatorColor: "#2d4a7a",
      badgeBg: "#fc8181",
      badgeFg: "#1a202c",
      tagBg: "#2d4a7a",
      tagFg: "#e2e8f0",
      tagBorder: "#4a7ab5",
      errorColor: "#fc8181",
      warningColor: "#fbd38d",
      successColor: "#68d391",
      infoColor: "#90cdf4",
      helpColor: "#b794f4",
      tooltipBg: "#e2e8f0",
      tooltipFg: "#1a365d",
      sliderFilled: "#90cdf4",
      sliderEmpty: "#2d4a7a",
      toggleOnBg: "#90cdf4",
      toggleOffBg: "#2d4a7a",
      toggleKnob: "#ffffff",
      scrollbarBg: "#2d4a7a",
      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
      fontFamily: "'Fira Code', 'Consolas', monospace",
      fontSize: 13,
      charWidth: 8,
      lineHeight: 20
    };
    function getTheme2(name) {
      switch (name) {
        case "sketch":
          return { ...exports2.sketchTheme };
        case "blueprint":
          return { ...exports2.blueprintTheme };
        default:
          return { ...exports2.cleanTheme };
      }
    }
  }
});

// ../markui-core/dist/index.js
var require_dist = __commonJS({
  "../markui-core/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.blueprintTheme = exports2.sketchTheme = exports2.cleanTheme = exports2.getTheme = exports2.renderToSvg = exports2.parse = void 0;
    exports2.compile = compile3;
    __exportStar(require_types(), exports2);
    __exportStar(require_limits(), exports2);
    var parser_1 = require_parser();
    Object.defineProperty(exports2, "parse", { enumerable: true, get: function() {
      return parser_1.parse;
    } });
    var svg_renderer_1 = require_svg_renderer();
    Object.defineProperty(exports2, "renderToSvg", { enumerable: true, get: function() {
      return svg_renderer_1.renderToSvg;
    } });
    var themes_1 = require_themes();
    Object.defineProperty(exports2, "getTheme", { enumerable: true, get: function() {
      return themes_1.getTheme;
    } });
    Object.defineProperty(exports2, "cleanTheme", { enumerable: true, get: function() {
      return themes_1.cleanTheme;
    } });
    Object.defineProperty(exports2, "sketchTheme", { enumerable: true, get: function() {
      return themes_1.sketchTheme;
    } });
    Object.defineProperty(exports2, "blueprintTheme", { enumerable: true, get: function() {
      return themes_1.blueprintTheme;
    } });
    var parser_2 = require_parser();
    var svg_renderer_2 = require_svg_renderer();
    var themes_2 = require_themes();
    var limits_1 = require_limits();
    function compile3(source, options) {
      const result = (0, parser_2.parse)(source, { mode: options?.mode, limits: options?.limits });
      const theme = (0, themes_2.getTheme)(options?.theme ?? "clean");
      let svg = (0, svg_renderer_2.renderToSvg)(result.tree, theme);
      const svgLimitErrors = (0, limits_1.validateSvgLimit)(svg, options?.limits);
      const errors = [...result.errors, ...svgLimitErrors];
      if (svgLimitErrors.length > 0) {
        svg = "";
      }
      return { svg, errors, tree: result.tree };
    }
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var import_crypto = require("crypto");
var vscode = __toESM(require("vscode"));
var import_markui_core2 = __toESM(require_dist());

// src/markdown/plugin.ts
var import_markui_core = __toESM(require_dist());

// src/markdown/theme-detector.ts
function detectTheme() {
  if (typeof document === "undefined")
    return "light";
  const body = document.body;
  if (body.classList.contains("vscode-dark") || body.classList.contains("vscode-high-contrast")) {
    return "dark";
  }
  return "light";
}
function getThemeForMode(mode, lightTheme, darkTheme) {
  return mode === "dark" ? darkTheme : lightTheme;
}

// src/markdown/plugin.ts
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function renderMarkuiBlock(source, theme, maxSize) {
  if (source.length > maxSize) {
    return `<div class="markui-error">MarkUI block too large (${source.length} characters, max ${maxSize}).</div>`;
  }
  try {
    const { svg, errors } = (0, import_markui_core.compile)(source, {
      limits: { ...import_markui_core.DEFAULT_MARKUI_LIMITS, maxSourceBytes: maxSize },
      mode: "autofix",
      theme
    });
    const criticalErrors = errors.filter((e) => e.severity === "error");
    if (criticalErrors.length > 0) {
      const messages = criticalErrors.map((e) => `Line ${e.row}:${e.col} - ${escapeHtml(e.message)}`).join("\n");
      return `<div class="markui-error">MarkUI errors:
${messages}</div>`;
    }
    return `<div class="markui-diagram" data-theme="${escapeHtml(theme)}">${svg}</div>`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `<div class="markui-error">MarkUI render error: ${escapeHtml(message)}</div>`;
  }
}
function markuiPlugin(md, options) {
  const lightTheme = options?.lightTheme || "clean";
  const darkTheme = options?.darkTheme || "blueprint";
  const maxSize = options?.maxSize || 5e4;
  const defaultFence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const info = token.info.trim();
    if (info === "markui" || info.startsWith("markui:")) {
      const mode = detectTheme();
      const theme = getThemeForMode(mode, lightTheme, darkTheme);
      return renderMarkuiBlock(token.content, theme, maxSize);
    }
    return defaultFence ? defaultFence(tokens, idx, opts, env, self) : `<pre><code>${escapeHtml(token.content)}</code></pre>`;
  };
}

// src/extension.ts
var diagnosticCollection;
var previewPanel;
var previewUpdateTimer;
var currentTheme;
var currentZoom = 100;
var ALLOWED_THEMES = /* @__PURE__ */ new Set(["clean", "sketch", "blueprint"]);
function activate(context) {
  const config = vscode.workspace.getConfiguration("markui");
  currentTheme = normalizeTheme(config.get("defaultTheme", "clean"));
  diagnosticCollection = vscode.languages.createDiagnosticCollection("markui");
  context.subscriptions.push(diagnosticCollection);
  context.subscriptions.push(
    vscode.commands.registerCommand("markui.preview", () => openPreview(context)),
    vscode.commands.registerCommand("markui.exportSvg", exportToSvg),
    vscode.commands.registerCommand("markui.changeTheme", changeTheme),
    vscode.commands.registerCommand("markui.zoomIn", () => adjustZoom(25)),
    vscode.commands.registerCommand("markui.zoomOut", () => adjustZoom(-25)),
    vscode.commands.registerCommand("markui.zoomReset", () => {
      currentZoom = 100;
      updatePreview();
    })
  );
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      "markui",
      new MarkuiCompletionProvider(),
      "[",
      "<",
      "{",
      "(",
      "#",
      "@"
    )
  );
  context.subscriptions.push(
    vscode.languages.registerHoverProvider("markui", new MarkuiHoverProvider())
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider("markui", new MarkuiOutlineProvider())
  );
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.languageId === "markui") {
        validateDocument(e.document);
        if (config.get("previewAutoRefresh", true)) {
          schedulePreviewUpdate();
        }
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === "markui") {
        validateDocument(doc);
        if (config.get("autoPreview", false)) {
          openPreview(context);
        }
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (doc.languageId === "markui" && config.get("validateOnSave", true)) {
        validateDocument(doc);
      }
    })
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      diagnosticCollection.delete(doc.uri);
    })
  );
  for (const doc of vscode.workspace.textDocuments) {
    if (doc.languageId === "markui") {
      validateDocument(doc);
    }
  }
  return {
    extendMarkdownIt(md) {
      return md.use(markuiPlugin);
    }
  };
}
function deactivate() {
  if (previewUpdateTimer)
    clearTimeout(previewUpdateTimer);
  previewPanel?.dispose();
}
function validateDocument(document2) {
  const source = document2.getText();
  try {
    const result = (0, import_markui_core2.parse)(source, { mode: "strict" });
    const diagnostics = result.errors.map((err) => errorToDiagnostic(err, document2));
    diagnosticCollection.set(document2.uri, diagnostics);
  } catch {
    diagnosticCollection.set(document2.uri, []);
  }
}
function errorToDiagnostic(err, document2) {
  const startLine = Math.max(0, err.row - 1);
  const startCol = Math.max(0, err.col - 1);
  const endLine = err.endRow != null ? Math.max(0, err.endRow - 1) : startLine;
  const endCol = err.endCol != null ? Math.max(0, err.endCol - 1) : document2.lineAt(Math.min(endLine, document2.lineCount - 1)).text.length;
  const range = new vscode.Range(startLine, startCol, endLine, endCol);
  let severity;
  switch (err.severity) {
    case "error":
      severity = vscode.DiagnosticSeverity.Error;
      break;
    case "warning":
      severity = vscode.DiagnosticSeverity.Warning;
      break;
    case "info":
      severity = vscode.DiagnosticSeverity.Information;
      break;
  }
  const diagnostic = new vscode.Diagnostic(range, err.message, severity);
  diagnostic.code = err.code;
  diagnostic.source = "markui";
  return diagnostic;
}
function openPreview(context) {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "markui") {
    vscode.window.showWarningMessage("Open a .markui file to preview.");
    return;
  }
  if (previewPanel) {
    previewPanel.reveal(vscode.ViewColumn.Beside);
    updatePreview();
    return;
  }
  previewPanel = vscode.window.createWebviewPanel(
    "markuiPreview",
    "MarkUI Preview",
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );
  previewPanel.onDidDispose(() => {
    previewPanel = void 0;
    vscode.commands.executeCommand("setContext", "markui.previewFocused", false);
  }, null, context.subscriptions);
  previewPanel.onDidChangeViewState((e) => {
    vscode.commands.executeCommand("setContext", "markui.previewFocused", e.webviewPanel.active);
  }, null, context.subscriptions);
  previewPanel.webview.onDidReceiveMessage((message) => {
    handlePreviewMessage(message);
  }, null, context.subscriptions);
  updatePreview();
}
function schedulePreviewUpdate() {
  if (previewUpdateTimer)
    clearTimeout(previewUpdateTimer);
  previewUpdateTimer = setTimeout(() => {
    previewUpdateTimer = void 0;
    updatePreview();
  }, 150);
}
function adjustZoom(delta) {
  if (currentZoom === -1)
    currentZoom = 100;
  currentZoom = clampZoom(currentZoom + delta);
  updatePreview();
}
function handlePreviewMessage(message) {
  if (!isRecord(message) || typeof message.command !== "string")
    return;
  switch (message.command) {
    case "zoomIn":
      adjustZoom(25);
      break;
    case "zoomOut":
      adjustZoom(-25);
      break;
    case "zoomReset":
      currentZoom = 100;
      updatePreview();
      break;
    case "zoomFit":
      currentZoom = -1;
      updatePreview();
      break;
    case "setZoom":
      if (typeof message.value === "number" && Number.isFinite(message.value)) {
        currentZoom = clampZoom(message.value);
        updatePreview();
      }
      break;
  }
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function clampZoom(value) {
  return Math.max(25, Math.min(400, Math.round(value)));
}
function updatePreview() {
  if (!previewPanel)
    return;
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "markui")
    return;
  const source = editor.document.getText();
  let svg = "";
  let errors = [];
  try {
    const result = (0, import_markui_core2.compile)(source, { mode: "autofix", theme: currentTheme });
    svg = result.svg;
    errors = result.errors;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors = [{ code: "RENDER_ERROR", message, row: 1, col: 1, severity: "error", phase: 1 }];
  }
  const zoomStyle = currentZoom === -1 ? "max-width: 100%; height: auto;" : `transform: scale(${currentZoom / 100}); transform-origin: top left;`;
  const zoomLabel = currentZoom === -1 ? "Fit" : `${currentZoom}%`;
  const warningErrors = errors.filter((e) => e.severity === "warning" || e.severity === "info");
  const criticalErrors = errors.filter((e) => e.severity === "error");
  const errorsHtml = criticalErrors.length > 0 ? `<div class="errors">${criticalErrors.map(
    (e) => `<div class="error-item">Line ${e.row}:${e.col} [${escapeHtml2(e.code)}] ${escapeHtml2(e.message)}</div>`
  ).join("")}</div>` : "";
  const warningsHtml = warningErrors.length > 0 ? `<div class="warnings">${warningErrors.map(
    (e) => `<div class="warning-item">Line ${e.row}:${e.col} [${escapeHtml2(e.code)}] ${escapeHtml2(e.message)}</div>`
  ).join("")}</div>` : "";
  previewPanel.webview.html = getPreviewHtml(previewPanel.webview, svg, zoomStyle, zoomLabel, errorsHtml, warningsHtml);
}
function escapeHtml2(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function getPreviewHtml(webview, svg, zoomStyle, zoomLabel, errorsHtml, warningsHtml) {
  const nonce = getNonce();
  const escapedTheme = escapeHtml2(currentTheme);
  const escapedZoomLabel = escapeHtml2(zoomLabel);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
<style>
	* { margin: 0; padding: 0; box-sizing: border-box; }
	body {
		background: var(--vscode-editor-background);
		color: var(--vscode-editor-foreground);
		font-family: var(--vscode-font-family);
		font-size: var(--vscode-font-size);
		overflow: auto;
	}
	.toolbar {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: var(--vscode-editorWidget-background);
		border-bottom: 1px solid var(--vscode-editorWidget-border);
	}
	.toolbar button {
		padding: 2px 8px;
		background: var(--vscode-button-secondaryBackground);
		color: var(--vscode-button-secondaryForeground);
		border: 1px solid var(--vscode-button-border, transparent);
		border-radius: 2px;
		cursor: pointer;
		font-size: 13px;
	}
	.toolbar button:hover {
		background: var(--vscode-button-secondaryHoverBackground);
	}
	.toolbar .zoom-label {
		min-width: 48px;
		text-align: center;
		font-size: 12px;
		color: var(--vscode-descriptionForeground);
	}
	.toolbar .info {
		margin-left: auto;
		font-size: 11px;
		color: var(--vscode-descriptionForeground);
	}
	.errors {
		padding: 8px 12px;
		background: var(--vscode-inputValidation-errorBackground, #5a1d1d);
		border-bottom: 1px solid var(--vscode-inputValidation-errorBorder, #be1100);
	}
	.error-item {
		color: var(--vscode-errorForeground, #f48771);
		font-family: monospace;
		font-size: 12px;
		padding: 2px 0;
	}
	.warnings {
		padding: 8px 12px;
		background: var(--vscode-inputValidation-warningBackground, #352a05);
		border-bottom: 1px solid var(--vscode-inputValidation-warningBorder, #b89500);
	}
	.warning-item {
		color: var(--vscode-editorWarning-foreground, #cca700);
		font-family: monospace;
		font-size: 12px;
		padding: 2px 0;
	}
	.preview-container {
		padding: 16px;
		overflow: auto;
	}
	.preview-svg {
		${zoomStyle}
	}
</style>
</head>
<body>
	<div class="toolbar">
		<button id="zoomOut" title="Zoom Out">\u2212</button>
		<span class="zoom-label" id="zoomLabel">${escapedZoomLabel}</span>
		<button id="zoomIn" title="Zoom In">+</button>
		<button id="zoomReset" title="Reset Zoom">100%</button>
		<button id="zoomFit" title="Fit to Width">Fit</button>
		<span class="info">Theme: ${escapedTheme}</span>
	</div>
	${errorsHtml}
	${warningsHtml}
	<div class="preview-container">
		<div class="preview-svg">${svg}</div>
	</div>
	<script nonce="${nonce}">
		const vscode = acquireVsCodeApi();
		document.getElementById('zoomIn').addEventListener('click', () => vscode.postMessage({ command: 'zoomIn' }));
		document.getElementById('zoomOut').addEventListener('click', () => vscode.postMessage({ command: 'zoomOut' }));
		document.getElementById('zoomReset').addEventListener('click', () => vscode.postMessage({ command: 'zoomReset' }));
		document.getElementById('zoomFit').addEventListener('click', () => vscode.postMessage({ command: 'zoomFit' }));

		document.addEventListener('wheel', (e) => {
			if (e.ctrlKey) {
				e.preventDefault();
				vscode.postMessage({ command: e.deltaY < 0 ? 'zoomIn' : 'zoomOut' });
			}
		}, { passive: false });

		document.addEventListener('keydown', (e) => {
			if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomIn' });
			} else if (e.ctrlKey && e.key === '-') {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomOut' });
			} else if (e.ctrlKey && e.key === '0') {
				e.preventDefault();
				vscode.postMessage({ command: 'zoomReset' });
			}
		});
	</script>
</body>
</html>`;
}
function getNonce() {
  return (0, import_crypto.randomBytes)(16).toString("base64");
}
async function exportToSvg() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "markui") {
    vscode.window.showWarningMessage("Open a .markui file to export.");
    return;
  }
  const source = editor.document.getText();
  try {
    const result = (0, import_markui_core2.compile)(source, { mode: "autofix", theme: currentTheme });
    const criticalErrors = result.errors.filter((e) => e.severity === "error");
    if (criticalErrors.length > 0) {
      const proceed = await vscode.window.showWarningMessage(
        `There are ${criticalErrors.length} error(s). Export anyway?`,
        "Export",
        "Cancel"
      );
      if (proceed !== "Export")
        return;
    }
    const defaultUri = editor.document.uri.with({
      path: editor.document.uri.path.replace(/\.markui$/, ".svg")
    });
    const saveUri = await vscode.window.showSaveDialog({
      defaultUri,
      filters: { "SVG Files": ["svg"] }
    });
    if (saveUri) {
      await vscode.workspace.fs.writeFile(saveUri, Buffer.from(result.svg, "utf-8"));
      vscode.window.showInformationMessage(`Exported SVG to ${saveUri.fsPath}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Export failed: ${message}`);
  }
}
async function changeTheme() {
  const picked = await vscode.window.showQuickPick(
    [
      { label: "clean", description: "Clean wireframe style" },
      { label: "sketch", description: "Hand-drawn sketch style" },
      { label: "blueprint", description: "Blueprint technical style" }
    ],
    { placeHolder: "Select MarkUI preview theme" }
  );
  if (picked) {
    currentTheme = normalizeTheme(picked.label);
    updatePreview();
  }
}
function normalizeTheme(value) {
  return value && ALLOWED_THEMES.has(value) ? value : "clean";
}
var MarkuiCompletionProvider = class {
  provideCompletionItems(document2, position) {
    const lineText = document2.lineAt(position).text;
    const charBefore = position.character > 0 ? lineText[position.character - 1] : "";
    const linePrefix = lineText.substring(0, position.character).trimStart();
    const items = [];
    if (charBefore === "[") {
      items.push(
        this.makeSnippet("Button", "[${1:Label}]", "Button element"),
        this.makeSnippet("Checkbox (unchecked)", "[ ] ${1:Label}", "Unchecked checkbox"),
        this.makeSnippet("Checkbox (checked)", "[x] ${1:Label}", "Checked checkbox"),
        this.makeSnippet("Active Tab", "[${1:Tab}]]", "Active tab (double bracket)")
      );
    } else if (charBefore === "<") {
      items.push(
        this.makeSnippet("Text Input", "<${1:placeholder}>", "Text input field"),
        this.makeSnippet("Dropdown", "<${1:Select} v>", "Dropdown selector"),
        this.makeSnippet("Dropdown (up)", "<${1:Select} ^>", "Dropdown opening upward")
      );
    } else if (charBefore === "{") {
      items.push(
        this.makeSnippet("Toggle", "{${1:On}/${2:Off}}", "Toggle switch"),
        this.makeSnippet("Badge", "{${1:0}}", "Notification badge"),
        this.makeSnippet("Slot", "{@slot}", "Component slot"),
        this.makeSnippet("Named Slot", "{@slot:${1:name}}", "Named component slot")
      );
    } else if (charBefore === "(") {
      items.push(
        this.makeSnippet("Radio (selected)", "(*) ${1:Label}", "Selected radio button"),
        this.makeSnippet("Radio (unselected)", "( ) ${1:Label}", "Unselected radio button"),
        this.makeSnippet("Tag", "(${1:Tag})", "Tag / label"),
        this.makeSnippet("Info annotation", "(i) ${1:Info text}", "Info annotation"),
        this.makeSnippet("Warning annotation", "(!) ${1:Warning text}", "Warning annotation"),
        this.makeSnippet("Help annotation", "(?) ${1:Help text}", "Help annotation"),
        this.makeSnippet("Success annotation", "(v) ${1:Success}", "Success annotation"),
        this.makeSnippet("Error annotation", "(x) ${1:Error}", "Error annotation")
      );
    } else if (charBefore === "#") {
      items.push(
        this.makeSnippet("Icon", "#${1:1}", "Icon by index")
      );
    } else if (charBefore === "@") {
      items.push(
        this.makeSnippet("Component reference", "@${1:ComponentName}", "Reference a reusable component")
      );
    } else if (linePrefix === "" || position.character === 0) {
      items.push(
        this.makeSnippet("Box", "+--- ${1:Title} ---+\n|                   |\n| ${2:content}          |\n|                   |\n+-------------------+", "Box container"),
        this.makeSnippet("Card", "*--- ${1:Title} ---*\n|                   |\n| ${2:content}          |\n|                   |\n*-------------------*", "Card container"),
        this.makeSnippet("Separator", "---", "Horizontal separator"),
        this.makeSnippet("Heading 1", "# ${1:Heading}", "Level 1 heading"),
        this.makeSnippet("Heading 2", "## ${1:Heading}", "Level 2 heading"),
        this.makeSnippet("Heading 3", "### ${1:Heading}", "Level 3 heading"),
        this.makeSnippet("Component ref", "@${1:ComponentName}", "Reference a component")
      );
    }
    return items;
  }
  makeSnippet(label, insertText, detail) {
    const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.Snippet);
    item.insertText = new vscode.SnippetString(insertText);
    item.detail = detail;
    return item;
  }
};
var MarkuiHoverProvider = class {
  provideHover(document2, position) {
    const source = document2.getText();
    try {
      const result = (0, import_markui_core2.parse)(source, { mode: "autofix" });
      const node = findNodeAtPosition(result.tree, position.line + 1, position.character + 1);
      if (!node)
        return void 0;
      const lines = [
        `**${node.type}**`
      ];
      if (node.text)
        lines.push(`Text: \`${node.text}\``);
      if (node.value)
        lines.push(`Value: \`${node.value}\``);
      if (node.state)
        lines.push(`State: \`${node.state}\``);
      if (node.width)
        lines.push(`Width: ${node.width}`);
      if (node.height)
        lines.push(`Height: ${node.height}`);
      if (node.children.length > 0)
        lines.push(`Children: ${node.children.length}`);
      const markdown = new vscode.MarkdownString(lines.join("\n\n"));
      return new vscode.Hover(markdown);
    } catch {
      return void 0;
    }
  }
};
function findNodeAtPosition(node, row, col) {
  for (const child of node.children) {
    const found = findNodeAtPosition(child, row, col);
    if (found)
      return found;
  }
  const nodeEndCol = node.col + node.width;
  const nodeEndRow = node.height ? node.row + node.height : node.row;
  if (row >= node.row && row <= nodeEndRow && col >= node.col && col <= nodeEndCol) {
    return node;
  }
  return void 0;
}
var MarkuiOutlineProvider = class {
  provideDocumentSymbols(document2) {
    const source = document2.getText();
    try {
      const result = (0, import_markui_core2.parse)(source, { mode: "autofix" });
      return this.buildSymbolsFromBoxes(result.boxes, document2);
    } catch {
      return [];
    }
  }
  buildSymbolsFromBoxes(boxes, document2) {
    return boxes.map((box) => {
      const startLine = Math.max(0, box.top - 1);
      const endLine = Math.min(document2.lineCount - 1, box.bottom - 1);
      const startCol = Math.max(0, box.left - 1);
      const endCol = document2.lineAt(endLine).text.length;
      const range = new vscode.Range(startLine, startCol, endLine, endCol);
      const selectionRange = new vscode.Range(startLine, startCol, startLine, document2.lineAt(startLine).text.length);
      const name = box.title || box.typeName || "Container";
      const kind = this.getSymbolKind(box.typeName);
      const symbol = new vscode.DocumentSymbol(
        name,
        box.typeName || "",
        kind,
        range,
        selectionRange
      );
      symbol.children = this.buildSymbolsFromBoxes(box.children, document2);
      return symbol;
    });
  }
  getSymbolKind(typeName) {
    switch (typeName?.toLowerCase()) {
      case "card":
        return vscode.SymbolKind.Class;
      case "accordion":
        return vscode.SymbolKind.Enum;
      default:
        return vscode.SymbolKind.Module;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
