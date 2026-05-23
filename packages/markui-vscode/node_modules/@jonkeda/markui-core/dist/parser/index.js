"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = parse;
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
    // Phase 1: Load Grid
    const grid = (0, grid_1.loadGrid)(source);
    // Phase 2: Detect Boxes
    const { boxes, errors: boxErrors } = (0, boxes_1.detectBoxes)(grid, mode);
    errors.push(...boxErrors);
    // Phase 3: Extract Content
    const { contentMap, errors: contentErrors } = (0, content_1.extractContent)(grid, boxes);
    errors.push(...contentErrors);
    // Phase 4: Tokenize Lines
    const { tokenMap, errors: tokenErrors } = (0, tokenizer_1.tokenizeLines)(contentMap, mode);
    errors.push(...tokenErrors);
    // Phase 5: Multi-Line Merge
    const { mergedMap, errors: mergeErrors } = (0, merger_1.mergeMultiLine)(tokenMap, mode);
    errors.push(...mergeErrors);
    // Phase 6: Layout Resolution
    const { layoutMap } = (0, layout_1.resolveLayout)(mergedMap);
    // Phase 7: Build Tree
    const tree = (0, tree_builder_1.buildTree)(boxes, layoutMap, grid);
    return { tree, errors, boxes, mode };
}
//# sourceMappingURL=index.js.map