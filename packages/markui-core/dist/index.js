"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.blueprintTheme = exports.sketchTheme = exports.cleanTheme = exports.getTheme = exports.renderToSvg = exports.parse = void 0;
exports.compile = compile;
__exportStar(require("./types"), exports);
var parser_1 = require("./parser");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parser_1.parse; } });
var svg_renderer_1 = require("./renderer/svg-renderer");
Object.defineProperty(exports, "renderToSvg", { enumerable: true, get: function () { return svg_renderer_1.renderToSvg; } });
var themes_1 = require("./renderer/themes");
Object.defineProperty(exports, "getTheme", { enumerable: true, get: function () { return themes_1.getTheme; } });
Object.defineProperty(exports, "cleanTheme", { enumerable: true, get: function () { return themes_1.cleanTheme; } });
Object.defineProperty(exports, "sketchTheme", { enumerable: true, get: function () { return themes_1.sketchTheme; } });
Object.defineProperty(exports, "blueprintTheme", { enumerable: true, get: function () { return themes_1.blueprintTheme; } });
const parser_2 = require("./parser");
const svg_renderer_2 = require("./renderer/svg-renderer");
const themes_2 = require("./renderer/themes");
/** Convenience: parse + render in one call */
function compile(source, options) {
    const result = (0, parser_2.parse)(source, { mode: options?.mode });
    const theme = (0, themes_2.getTheme)(options?.theme ?? 'clean');
    const svg = (0, svg_renderer_2.renderToSvg)(result.tree, theme);
    return { svg, errors: result.errors, tree: result.tree };
}
//# sourceMappingURL=index.js.map