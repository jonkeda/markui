"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
const limits_1 = require("../limits");
const grid_1 = require("./grid");
const boxes_1 = require("./boxes");
const content_1 = require("./content");
const tokenizer_1 = require("./tokenizer");
const merger_1 = require("./merger");
const layout_1 = require("./layout");
const tree_builder_1 = require("./tree-builder");
function parse(source, options) {
    const mode = options?.mode ?? 'autofix';
    const errors = [];
    const limitErrors = (0, limits_1.validateSourceLimits)(source, options?.limits);
    if (limitErrors.length > 0) {
        return { tree: emptyDocument(), errors: limitErrors, boxes: [], mode };
    }
    // Phase 1: Load Grid
    const grid = (0, grid_1.loadGrid)(source);
    // Phase 2: Detect Boxes
    const { boxes, errors: boxErrors } = (0, boxes_1.detectBoxes)(grid, mode);
    errors.push(...boxErrors);
    const boxLimitErrors = (0, limits_1.validateBoxLimit)(boxes.length, options?.limits);
    if (boxLimitErrors.length > 0) {
        errors.push(...boxLimitErrors);
        return { tree: emptyDocument(), errors, boxes: [], mode };
    }
    // Phase 3: Extract Content
    const { contentMap, errors: contentErrors } = (0, content_1.extractContent)(grid, boxes);
    errors.push(...contentErrors);
    // Phase 4: Tokenize Lines
    const { tokenMap, errors: tokenErrors } = (0, tokenizer_1.tokenizeLines)(contentMap, mode);
    errors.push(...tokenErrors);
    const tokenLimitErrors = (0, limits_1.validateTokenLimit)(countTokens(tokenMap), options?.limits);
    if (tokenLimitErrors.length > 0) {
        errors.push(...tokenLimitErrors);
        return { tree: emptyDocument(), errors, boxes: [], mode };
    }
    // Phase 5: Multi-Line Merge
    const { mergedMap, errors: mergeErrors } = (0, merger_1.mergeMultiLine)(tokenMap, mode);
    errors.push(...mergeErrors);
    // Phase 6: Layout Resolution
    const { layoutMap } = (0, layout_1.resolveLayout)(mergedMap);
    // Phase 7: Build Tree
    const tree = (0, tree_builder_1.buildTree)(boxes, layoutMap, grid);
    return { tree, errors, boxes, mode };
}
function emptyDocument() {
    return {
        type: 'Document',
        text: '',
        row: 0,
        col: 0,
        width: 0,
        height: 0,
        children: [],
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
//# sourceMappingURL=index.js.map