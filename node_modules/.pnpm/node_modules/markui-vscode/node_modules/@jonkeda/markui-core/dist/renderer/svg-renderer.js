"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderToSvg = renderToSvg;
function renderToSvg(tree, theme) {
    const cw = theme.charWidth;
    const lh = theme.lineHeight;
    const totalW = (tree.width ?? 80) * cw + 20;
    const totalH = (tree.height ?? 40) * lh + 20;
    const parts = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`, `<defs><style>`, `.mu-text{font-family:${esc(theme.fontFamily)};font-size:${theme.fontSize}px;fill:${theme.foreground}}`, `.mu-heading{font-family:${esc(theme.fontFamily)};fill:${theme.headingColor};font-weight:700}`, `.mu-link{font-family:${esc(theme.fontFamily)};font-size:${theme.fontSize}px;fill:${theme.linkColor};text-decoration:underline}`, `</style></defs>`, `<rect width="100%" height="100%" fill="${theme.background}"/>`);
    renderNode(tree, theme, parts, 10, 10, cw, lh);
    parts.push('</svg>');
    return parts.join('\n');
}
function renderNode(node, t, out, baseX, baseY, cw, lh) {
    const x = baseX + node.col * cw;
    const y = baseY + node.row * lh;
    switch (node.type) {
        case 'Document':
            for (const child of node.children)
                renderNode(child, t, out, baseX, baseY, cw, lh);
            break;
        case 'Box':
        case 'ContextMenu':
            renderBox(node, t, out, baseX, baseY, cw, lh, false);
            break;
        case 'Card':
            renderBox(node, t, out, baseX, baseY, cw, lh, true);
            break;
        case 'Toast':
            renderToast(node, t, out, x, y, cw, lh);
            break;
        case 'HorizontalGroup':
        case 'VerticalGroup':
        case 'ColumnLayout':
        case 'FormField':
            for (const child of node.children)
                renderNode(child, t, out, baseX, baseY, cw, lh);
            break;
        case 'Button':
            renderButton(node, t, out, x, y, cw, lh);
            break;
        case 'IconButton':
            renderIconButton(node, t, out, x, y, cw, lh);
            break;
        case 'SplitButton':
            renderSplitButton(node, t, out, x, y, cw, lh);
            break;
        case 'PrevButton':
            renderNavButton(node, t, out, x, y, cw, lh, '\u25C0');
            break;
        case 'NextButton':
            renderNavButton(node, t, out, x, y, cw, lh, '\u25B6');
            break;
        case 'Link':
            renderLink(node, t, out, x, y, cw, lh);
            break;
        case 'Checkbox':
            renderCheckbox(node, t, out, x, y, cw, lh);
            break;
        case 'Radio':
            renderRadio(node, t, out, x, y, cw, lh);
            break;
        case 'TextInput':
        case 'PasswordInput':
        case 'DateInput':
        case 'NumberInput':
        case 'CustomInput':
            renderTextInput(node, t, out, x, y, cw, lh);
            break;
        case 'Textarea':
            renderTextarea(node, t, out, x, y, cw, lh);
            break;
        case 'Dropdown':
            renderDropdown(node, t, out, x, y, cw, lh);
            break;
        case 'Toggle':
            renderToggle(node, t, out, x, y, cw, lh);
            break;
        case 'Slider':
            renderSlider(node, t, out, x, y, cw, lh);
            break;
        case 'ProgressBar':
            renderSlider(node, t, out, x, y, cw, lh);
            break;
        case 'Stepper':
            renderStepper(node, t, out, x, y, cw, lh);
            break;
        case 'Rating':
            renderRating(node, t, out, x, y, cw, lh);
            break;
        case 'Badge':
            renderBadge(node, t, out, x, y, cw, lh);
            break;
        case 'Tag':
            renderTag(node, t, out, x, y, cw, lh);
            break;
        case 'RemovableChip':
            renderChip(node, t, out, x, y, cw, lh);
            break;
        case 'Icon':
            renderIcon(node, t, out, x, y, cw, lh);
            break;
        case 'Image':
            renderImage(node, t, out, x, y, cw, lh);
            break;
        case 'Separator':
            renderSeparator(node, t, out, x, y, cw, lh);
            break;
        case 'Spinner':
            renderSpinner(node, t, out, x, y, cw, lh);
            break;
        case 'Label':
            renderLabel(node, t, out, x, y, cw, lh);
            break;
        case 'Heading':
            renderHeading(node, t, out, x, y, cw, lh);
            break;
        case 'Annotation':
            renderAnnotation(node, t, out, x, y, cw, lh);
            break;
        case 'Accordion':
        case 'Expander':
            renderAccordion(node, t, out, x, y, cw, lh, baseX, baseY);
            break;
        case 'TreeNode':
            renderTreeNode(node, t, out, x, y, cw, lh);
            break;
        case 'ComponentRef':
            renderComponentRef(node, t, out, x, y, cw, lh);
            break;
        case 'SlotMarker':
            renderSlotMarker(node, t, out, x, y, cw, lh);
            break;
        case 'TabBar':
            renderTabBar(node, t, out, x, y, cw, lh, baseX, baseY);
            break;
        case 'Tab':
        case 'ActiveTab':
            renderTab(node, t, out, x, y, cw, lh);
            break;
        case 'Breadcrumb':
            renderBreadcrumb(node, t, out, x, y, cw, lh);
            break;
        case 'Pagination':
            for (const child of node.children)
                renderNode(child, t, out, baseX, baseY, cw, lh);
            break;
        case 'ListTruncation':
            out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-text" fill="${t.foreground}">...</text>`);
            break;
        case 'Table':
            renderTable(node, t, out, x, y, cw, lh, baseX, baseY);
            break;
        case 'TableRow':
        case 'TableHeader':
            break; // rendered by Table
        case 'TableCell':
            break; // rendered by Table
        case 'DropdownOption':
            break; // rendered by Dropdown
        default:
            // Fallback: render as label
            if (node.text) {
                out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
            }
            for (const child of node.children)
                renderNode(child, t, out, baseX, baseY, cw, lh);
            break;
    }
}
// ---------------------------------------------------------------------------
// Box / Card
// ---------------------------------------------------------------------------
function renderBox(node, t, out, baseX, baseY, cw, lh, isCard) {
    const x = baseX + node.col * cw;
    const y = baseY + node.row * lh;
    const w = node.width * cw;
    const h = (node.height ?? 3) * lh;
    const rx = isCard ? 8 : 2;
    out.push(`<g>`);
    // Shadow for cards
    if (isCard) {
        out.push(`<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="${rx}" fill="rgba(0,0,0,0.08)"/>`);
    }
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ` +
        `fill="${t.background}" stroke="${t.border}" stroke-width="1.5"/>`);
    // Title
    if (node.text) {
        out.push(`<text x="${x + 8}" y="${y + lh * 0.7}" class="mu-text" font-weight="600">${esc(node.text)}</text>`);
    }
    for (const child of node.children) {
        renderNode(child, t, out, baseX, baseY, cw, lh);
    }
    out.push('</g>');
}
// ---------------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------------
function renderToast(node, t, out, x, y, cw, lh) {
    const w = node.width * cw;
    const h = (node.height ?? 2) * lh;
    out.push(`<g>`);
    out.push(`<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="6" fill="rgba(0,0,0,0.1)"/>`);
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${t.tooltipBg}" stroke="${t.border}"/>`);
    if (node.text) {
        out.push(`<text x="${x + 8}" y="${y + h / 2 + 4}" fill="${t.tooltipFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text)}</text>`);
    }
    out.push('</g>');
}
// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
function renderButton(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, (node.text?.length ?? 4) * cw + 16);
    const h = lh + 4;
    const bx = x;
    const by = y + 2;
    out.push(`<rect x="${bx}" y="${by}" width="${w}" height="${h}" rx="4" ` +
        `fill="${t.buttonBg}" stroke="${t.buttonBorder}" stroke-width="1"/>`, `<text x="${bx + w / 2}" y="${by + h / 2 + 4}" text-anchor="middle" ` +
        `fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? '')}</text>`);
}
function renderIconButton(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, (node.text?.length ?? 4) * cw + 24);
    const h = lh + 4;
    out.push(`<rect x="${x}" y="${y + 2}" width="${w}" height="${h}" rx="4" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<text x="${x + 6}" y="${y + h / 2 + 6}" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">#${node.iconIndex ?? 0}</text>`, `<text x="${x + 20}" y="${y + h / 2 + 6}" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? '')}</text>`);
}
function renderSplitButton(node, t, out, x, y, cw, lh) {
    const textW = (node.text?.length ?? 4) * cw + 12;
    const arrowW = 20;
    const h = lh + 4;
    const by = y + 2;
    out.push(`<rect x="${x}" y="${by}" width="${textW + arrowW}" height="${h}" rx="4" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<line x1="${x + textW}" y1="${by}" x2="${x + textW}" y2="${by + h}" stroke="${t.buttonBorder}"/>`, `<text x="${x + textW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? '')}</text>`, `<text x="${x + textW + arrowW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">\u25BC</text>`);
}
function renderNavButton(node, t, out, x, y, cw, lh, arrow) {
    const s = lh;
    out.push(`<rect x="${x}" y="${y + 2}" width="${s}" height="${s}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`, `<text x="${x + s / 2}" y="${y + 2 + s / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="10px">${arrow}</text>`);
}
// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------
function renderLink(node, t, out, x, y, cw, lh) {
    out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-link">${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Checkbox
// ---------------------------------------------------------------------------
function renderCheckbox(node, t, out, x, y, cw, lh) {
    const s = 14;
    const by = y + (lh - s) / 2;
    const checked = node.state === 'checked';
    const mixed = node.state === 'mixed';
    out.push(`<rect x="${x}" y="${by}" width="${s}" height="${s}" rx="2" fill="${checked ? t.checkboxChecked : t.inputBg}" stroke="${t.checkboxBorder}"/>`);
    if (checked) {
        out.push(`<polyline points="${x + 3},${by + 7} ${x + 6},${by + 10} ${x + 11},${by + 4}" fill="none" stroke="#fff" stroke-width="2"/>`);
    }
    else if (mixed) {
        out.push(`<line x1="${x + 3}" y1="${by + s / 2}" x2="${x + s - 3}" y2="${by + s / 2}" stroke="${t.checkboxChecked}" stroke-width="2"/>`);
    }
    if (node.text) {
        out.push(`<text x="${x + s + 6}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
    }
}
// ---------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------
function renderRadio(node, t, out, x, y, cw, lh) {
    const r = 7;
    const cx = x + r;
    const cy = y + lh / 2;
    const selected = node.state === 'selected';
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.inputBg}" stroke="${t.radioBorder}" stroke-width="1.5"/>`);
    if (selected) {
        out.push(`<circle cx="${cx}" cy="${cy}" r="4" fill="${t.radioSelected}"/>`);
    }
    if (node.text) {
        out.push(`<text x="${x + r * 2 + 6}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text)}</text>`);
    }
}
// ---------------------------------------------------------------------------
// Text Input
// ---------------------------------------------------------------------------
function renderTextInput(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 60);
    const h = lh + 4;
    const by = y + 2;
    const stroke = node.type === 'CustomInput' ? `stroke-dasharray="4 2" stroke="${t.inputBorder}"` : `stroke="${t.inputBorder}"`;
    out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" ${stroke}/>`);
    let displayText = node.value ?? node.text ?? '';
    if (node.type === 'PasswordInput') {
        displayText = '\u2022'.repeat(displayText.length || 8);
    }
    if (displayText) {
        out.push(`<text x="${x + 6}" y="${by + h / 2 + 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(displayText)}</text>`);
    }
}
// ---------------------------------------------------------------------------
// Textarea
// ---------------------------------------------------------------------------
function renderTextarea(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 80);
    const h = (node.height ?? 3) * lh;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
    if (node.text) {
        const lines = node.text.split('\n');
        for (let li = 0; li < lines.length; li++) {
            out.push(`<text x="${x + 6}" y="${y + (li + 1) * lh - 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(lines[li])}</text>`);
        }
    }
}
// ---------------------------------------------------------------------------
// Dropdown
// ---------------------------------------------------------------------------
function renderDropdown(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 80);
    const h = lh + 4;
    const by = y + 2;
    out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
    out.push(`<text x="${x + 6}" y="${by + h / 2 + 4}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? '')}</text>`);
    // Chevron
    const chevY = by + h / 2;
    const chevX = x + w - 16;
    if (node.state === 'expanded') {
        out.push(`<polyline points="${chevX - 3},${chevY + 2} ${chevX},${chevY - 2} ${chevX + 3},${chevY + 2}" fill="none" stroke="${t.inputFg}" stroke-width="1.5"/>`);
    }
    else {
        out.push(`<polyline points="${chevX - 3},${chevY - 2} ${chevX},${chevY + 2} ${chevX + 3},${chevY - 2}" fill="none" stroke="${t.inputFg}" stroke-width="1.5"/>`);
    }
    // Render expanded options
    if (node.state === 'expanded' && node.children.length > 0) {
        const optY = by + h;
        const optH = node.children.length * lh;
        out.push(`<rect x="${x}" y="${optY}" width="${w}" height="${optH}" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
        for (let oi = 0; oi < node.children.length; oi++) {
            const opt = node.children[oi];
            const oY = optY + oi * lh;
            out.push(`<text x="${x + 8}" y="${oY + lh * 0.7}" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(opt.text ?? '')}</text>`);
        }
    }
}
// ---------------------------------------------------------------------------
// Toggle
// ---------------------------------------------------------------------------
function renderToggle(node, t, out, x, y, cw, lh) {
    const w = 36;
    const h = 18;
    const by = y + (lh - h) / 2;
    const isOn = node.state === 'on';
    out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${isOn ? t.toggleOnBg : t.toggleOffBg}"/>`);
    const knobX = isOn ? x + w - h / 2 - 2 : x + h / 2 + 2;
    out.push(`<circle cx="${knobX}" cy="${by + h / 2}" r="${h / 2 - 2}" fill="${t.toggleKnob}"/>`);
}
// ---------------------------------------------------------------------------
// Slider / ProgressBar
// ---------------------------------------------------------------------------
function renderSlider(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 60);
    const trackH = 6;
    const trackY = y + lh / 2 - trackH / 2;
    const pct = (node.percentage ?? 50) / 100;
    const filledW = w * pct;
    out.push(`<rect x="${x}" y="${trackY}" width="${w}" height="${trackH}" rx="3" fill="${t.sliderEmpty}"/>`);
    out.push(`<rect x="${x}" y="${trackY}" width="${filledW}" height="${trackH}" rx="3" fill="${t.sliderFilled}"/>`);
    // Thumb
    if (node.type === 'Slider') {
        out.push(`<circle cx="${x + filledW}" cy="${trackY + trackH / 2}" r="7" fill="${t.sliderFilled}" stroke="#fff" stroke-width="2"/>`);
    }
}
// ---------------------------------------------------------------------------
// Stepper
// ---------------------------------------------------------------------------
function renderStepper(node, t, out, x, y, cw, lh) {
    const h = lh + 2;
    const btnW = 24;
    const valW = 32;
    const by = y + 2;
    // Minus button
    out.push(`<rect x="${x}" y="${by}" width="${btnW}" height="${h}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`);
    out.push(`<text x="${x + btnW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">-</text>`);
    // Value
    out.push(`<rect x="${x + btnW}" y="${by}" width="${valW}" height="${h}" fill="${t.inputBg}" stroke="${t.inputBorder}"/>`);
    out.push(`<text x="${x + btnW + valW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.inputFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.value ?? node.text ?? '0')}</text>`);
    // Plus button
    out.push(`<rect x="${x + btnW + valW}" y="${by}" width="${btnW}" height="${h}" rx="3" fill="${t.buttonBg}" stroke="${t.buttonBorder}"/>`);
    out.push(`<text x="${x + btnW + valW + btnW / 2}" y="${by + h / 2 + 4}" text-anchor="middle" fill="${t.buttonFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">+</text>`);
}
// ---------------------------------------------------------------------------
// Rating
// ---------------------------------------------------------------------------
function renderRating(node, t, out, x, y, cw, lh) {
    const filled = node.numerator ?? 0;
    const total = node.denominator ?? 5;
    const starSize = 16;
    for (let si = 0; si < total; si++) {
        const sx = x + si * (starSize + 2);
        const fill = si < filled ? '#f59e0b' : t.sliderEmpty;
        out.push(`<text x="${sx}" y="${y + lh * 0.7}" fill="${fill}" font-size="${starSize}px">\u2605</text>`);
    }
}
// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------
function renderBadge(node, t, out, x, y, cw, lh) {
    const text = node.text ?? '';
    const r = Math.max(10, text.length * 4 + 6);
    const cx = x + r;
    const cy = y + lh / 2;
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.badgeBg}"/>`);
    out.push(`<text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${t.badgeFg}" font-family="${esc(t.fontFamily)}" font-size="11px" font-weight="600">${esc(text)}</text>`);
}
// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------
function renderTag(node, t, out, x, y, cw, lh) {
    const text = node.text ?? '';
    const w = text.length * cw + 16;
    const h = lh - 2;
    const by = y + 2;
    out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.tagBg}" stroke="${t.tagBorder}"/>`);
    out.push(`<text x="${x + 8}" y="${by + h / 2 + 4}" fill="${t.tagFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(text)}</text>`);
}
// ---------------------------------------------------------------------------
// Removable Chip
// ---------------------------------------------------------------------------
function renderChip(node, t, out, x, y, cw, lh) {
    const text = node.text ?? '';
    const w = text.length * cw + 28;
    const h = lh - 2;
    const by = y + 2;
    out.push(`<rect x="${x}" y="${by}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.tagBg}" stroke="${t.tagBorder}"/>`);
    out.push(`<text x="${x + 8}" y="${by + h / 2 + 4}" fill="${t.tagFg}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(text)}</text>`);
    // X button
    const xBtnX = x + w - 16;
    const xBtnY = by + h / 2;
    out.push(`<line x1="${xBtnX - 3}" y1="${xBtnY - 3}" x2="${xBtnX + 3}" y2="${xBtnY + 3}" stroke="${t.tagFg}" stroke-width="1.5"/>`);
    out.push(`<line x1="${xBtnX + 3}" y1="${xBtnY - 3}" x2="${xBtnX - 3}" y2="${xBtnY + 3}" stroke="${t.tagFg}" stroke-width="1.5"/>`);
}
// ---------------------------------------------------------------------------
// Icon
// ---------------------------------------------------------------------------
function renderIcon(node, t, out, x, y, cw, lh) {
    const s = 16;
    const by = y + (lh - s) / 2;
    out.push(`<rect x="${x}" y="${by}" width="${s}" height="${s}" rx="2" fill="${t.border}" opacity="0.3"/>`);
    out.push(`<text x="${x + s / 2}" y="${by + s / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="9px">#${node.iconIndex ?? 0}</text>`);
}
// ---------------------------------------------------------------------------
// Image
// ---------------------------------------------------------------------------
function renderImage(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 60);
    const h = (node.height ?? 3) * lh;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t.inputBg}" stroke="${t.border}" stroke-dasharray="4 2"/>`);
    // Diagonal lines to indicate image placeholder
    out.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${t.border}" stroke-width="0.5"/>`);
    out.push(`<line x1="${x + w}" y1="${y}" x2="${x}" y2="${y + h}" stroke="${t.border}" stroke-width="0.5"/>`);
    out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">${esc(node.text ?? 'IMG')}</text>`);
}
// ---------------------------------------------------------------------------
// Separator
// ---------------------------------------------------------------------------
function renderSeparator(node, t, out, x, y, cw, lh) {
    const w = Math.max(node.width * cw, 40);
    const ly = y + lh / 2;
    out.push(`<line x1="${x}" y1="${ly}" x2="${x + w}" y2="${ly}" stroke="${t.separatorColor}" stroke-width="1"/>`);
}
// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------
function renderSpinner(node, t, out, x, y, cw, lh) {
    const r = 8;
    const cx = x + r + 2;
    const cy = y + lh / 2;
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${t.border}" stroke-width="2"/>`);
    out.push(`<path d="M${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy}" fill="none" stroke="${t.buttonBg}" stroke-width="2"/>`);
}
// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------
function renderLabel(node, t, out, x, y, cw, lh) {
    out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Heading
// ---------------------------------------------------------------------------
function renderHeading(node, t, out, x, y, cw, lh) {
    const level = node.level ?? 1;
    const sizes = [24, 20, 17, 15, 14, 13];
    const size = sizes[Math.min(level - 1, sizes.length - 1)];
    out.push(`<text x="${x}" y="${y + lh * 0.7}" class="mu-heading" font-size="${size}px">${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Annotation
// ---------------------------------------------------------------------------
function renderAnnotation(node, t, out, x, y, cw, lh) {
    const typeColorMap = {
        '?': t.helpColor,
        '$': t.warningColor,
        '!': t.errorColor,
        'i': t.infoColor,
        'x': t.errorColor,
        'v': t.successColor,
    };
    const color = typeColorMap[node.annotationType ?? ''] ?? t.foreground;
    out.push(`<text x="${x}" y="${y + lh * 0.7}" fill="${color}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px">(${node.annotationType ?? '?'}) ${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Accordion / Expander
// ---------------------------------------------------------------------------
function renderAccordion(node, t, out, x, y, cw, lh, baseX, baseY) {
    if (node.type === 'Accordion') {
        for (const child of node.children) {
            renderNode(child, t, out, baseX, baseY, cw, lh);
        }
        return;
    }
    // Expander section
    const w = Math.max(node.width * cw, 120);
    const h = lh + 4;
    const expanded = node.state === 'expanded';
    const marker = expanded ? '\u25BC' : '\u25B6';
    out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="3" fill="${t.inputBg}" stroke="${t.border}"/>`);
    out.push(`<text x="${x + 6}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="10px">${marker}</text>`);
    out.push(`<text x="${x + 20}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" font-weight="600">${esc(node.text ?? '')}</text>`);
    if (expanded && node.children.length > 0) {
        for (const child of node.children) {
            renderNode(child, t, out, baseX, baseY, cw, lh);
        }
    }
}
// ---------------------------------------------------------------------------
// Tree Node
// ---------------------------------------------------------------------------
function renderTreeNode(node, t, out, x, y, cw, lh) {
    const indent = (node.level ?? 0) * 16;
    const marker = node.state === 'collapsed' ? '\u25B6' : '\u25BC';
    out.push(`<text x="${x + indent}" y="${y + lh * 0.7}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="10px">${marker}</text>`);
    out.push(`<text x="${x + indent + 14}" y="${y + lh * 0.7}" class="mu-text">${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Component Ref
// ---------------------------------------------------------------------------
function renderComponentRef(node, t, out, x, y, cw, lh) {
    const w = (node.text?.length ?? 10) * cw + 20;
    const h = lh + 4;
    out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="3" fill="none" stroke="${t.border}" stroke-dasharray="4 2"/>`);
    out.push(`<text x="${x + 8}" y="${y + h / 2 + 5}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" font-style="italic">@${esc(node.text ?? '')}</text>`);
}
// ---------------------------------------------------------------------------
// Slot Marker
// ---------------------------------------------------------------------------
function renderSlotMarker(node, t, out, x, y, cw, lh) {
    const w = (node.text?.length ?? 6) * cw + 20;
    const h = lh;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${t.border}" stroke-dasharray="2 2"/>`);
    out.push(`<text x="${x + w / 2}" y="${y + h / 2 + 4}" text-anchor="middle" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="11px" font-style="italic">${esc(node.text ?? 'slot')}</text>`);
}
// ---------------------------------------------------------------------------
// Tab Bar
// ---------------------------------------------------------------------------
function renderTabBar(node, t, out, x, y, cw, lh, baseX, baseY) {
    // Background line
    const w = node.width * cw;
    const h = lh + 4;
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${t.inactiveTabBg}"/>`);
    for (const child of node.children) {
        renderNode(child, t, out, baseX, baseY, cw, lh);
    }
}
function renderTab(node, t, out, x, y, cw, lh) {
    const text = node.text ?? '';
    const w = text.length * cw + 16;
    const h = lh + 2;
    const active = node.type === 'ActiveTab';
    out.push(`<rect x="${x}" y="${y + 1}" width="${w}" height="${h}" rx="4 4 0 0" ` +
        `fill="${active ? t.activeTabBg : t.inactiveTabBg}" stroke="${t.border}" stroke-width="1"/>`);
    out.push(`<text x="${x + 8}" y="${y + h / 2 + 5}" fill="${active ? t.activeTabFg : t.inactiveTabFg}" ` +
        `font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" ` +
        `${active ? 'font-weight="600"' : ''}>${esc(text)}</text>`);
}
// ---------------------------------------------------------------------------
// Breadcrumb
// ---------------------------------------------------------------------------
function renderBreadcrumb(node, t, out, x, y, cw, lh) {
    let cx = x;
    for (let i = 0; i < node.children.length; i++) {
        const seg = node.children[i];
        const text = seg.text ?? '';
        out.push(`<text x="${cx}" y="${y + lh * 0.7}" class="mu-text" ${i < node.children.length - 1 ? `fill="${t.linkColor}"` : ''}>${esc(text)}</text>`);
        cx += text.length * cw + 4;
        if (i < node.children.length - 1) {
            out.push(`<text x="${cx}" y="${y + lh * 0.7}" class="mu-text" fill="${t.foreground}"> &gt; </text>`);
            cx += 3 * cw;
        }
    }
}
// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------
function renderTable(node, t, out, x, y, cw, lh, baseX, baseY) {
    const rows = node.children;
    if (rows.length === 0)
        return;
    // Determine column widths from first row
    const firstRow = rows[0];
    const numCols = firstRow.children.length;
    const colWidths = [];
    for (let ci = 0; ci < numCols; ci++) {
        let maxW = 0;
        for (const row of rows) {
            if (ci < row.children.length) {
                const cellText = row.children[ci].text ?? '';
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
        const isHeader = row.type === 'TableHeader';
        let cx = x;
        if (isHeader) {
            out.push(`<rect x="${x}" y="${ry}" width="${totalW}" height="${lh}" fill="${t.inactiveTabBg}"/>`);
        }
        for (let ci = 0; ci < row.children.length; ci++) {
            const cell = row.children[ci];
            const cw2 = colWidths[ci] ?? 40;
            // Cell border
            out.push(`<rect x="${cx}" y="${ry}" width="${cw2}" height="${lh}" fill="none" stroke="${t.border}" stroke-width="0.5"/>`);
            // Cell text
            out.push(`<text x="${cx + 6}" y="${ry + lh * 0.7}" fill="${t.foreground}" font-family="${esc(t.fontFamily)}" font-size="${t.fontSize}px" ${isHeader ? 'font-weight="600"' : ''}>${esc(cell.text ?? '')}</text>`);
            cx += cw2;
        }
        ry += lh;
    }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function esc(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
//# sourceMappingURL=svg-renderer.js.map