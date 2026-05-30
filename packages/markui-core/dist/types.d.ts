export interface Grid {
    rows: string[][];
    width: number;
    height: number;
}
export type BorderStyle = 'solid' | 'dashed' | 'none';
export type CornerChar = '+' | 'v' | '>' | 'w';
export interface Box {
    top: number;
    left: number;
    bottom: number;
    right: number;
    title?: string;
    typeName?: string;
    cornerChar: CornerChar;
    borderStyle: BorderStyle;
    hasRightBorder: boolean;
    scrollRight: boolean;
    scrollBottom: boolean;
    resizeDividers: number[];
    columnDividers: number[];
    parent?: Box;
    children: Box[];
    nestLevel: number;
    hasNestedPrefix?: boolean;
}
export type WidgetType = 'Document' | 'Box' | 'VerticalList' | 'HorizontalList' | 'WrappedList' | 'HorizontalGroup' | 'VerticalGroup' | 'ColumnLayout' | 'FormField' | 'Button' | 'IconButton' | 'SplitButton' | 'Link' | 'Checkbox' | 'Radio' | 'TextInput' | 'PasswordInput' | 'DateInput' | 'NumberInput' | 'Textarea' | 'Dropdown' | 'CustomInput' | 'Toggle' | 'Slider' | 'Stepper' | 'Rating' | 'Badge' | 'Tag' | 'RemovableChip' | 'Icon' | 'Image' | 'Separator' | 'Spinner' | 'ProgressBar' | 'Label' | 'Heading' | 'Annotation' | 'Accordion' | 'Expander' | 'TreeNode' | 'ComponentRef' | 'SlotMarker' | 'Toast' | 'TabBar' | 'Tab' | 'ActiveTab' | 'Breadcrumb' | 'Pagination' | 'Table' | 'TableRow' | 'TableHeader' | 'TableCell' | 'ContextMenu' | 'DropdownOption' | 'PrevButton' | 'NextButton';
export interface WidgetNode {
    type: WidgetType;
    text?: string;
    value?: string;
    row: number;
    col: number;
    width: number;
    height?: number;
    state?: string;
    children: WidgetNode[];
    iconIndex?: number;
    level?: number;
    typeName?: string;
    annotationType?: string;
    percentage?: number;
    numerator?: number;
    denominator?: number;
    scrollRight?: boolean;
    scrollBottom?: boolean;
    resizeDividers?: number[];
}
export interface ContentLine {
    text: string;
    row: number;
    colOffset: number;
}
export interface ColumnRegion {
    left: number;
    right: number;
    lines: ContentLine[];
}
export interface LineToken {
    type: WidgetType;
    text: string;
    value?: string;
    row?: number;
    start: number;
    end: number;
    state?: string;
    iconIndex?: number;
    annotationType?: string;
    level?: number;
    percentage?: number;
    numerator?: number;
    denominator?: number;
    children?: LineToken[];
}
export type Severity = 'error' | 'warning' | 'info';
export type ParseMode = 'strict' | 'autofix';
export interface AutofixAction {
    description: string;
    applied: boolean;
}
export interface ParseError {
    code: string;
    message: string;
    row: number;
    col: number;
    endRow?: number;
    endCol?: number;
    severity: Severity;
    phase: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    fix?: AutofixAction;
}
export interface ParseOptions {
    mode?: ParseMode;
    limits?: Partial<ParseLimits> | false;
}
export interface ParseResult {
    tree: WidgetNode;
    errors: ParseError[];
    boxes: Box[];
    mode: ParseMode;
}
export interface ThemeColors {
    background: string;
    foreground: string;
    border: string;
    buttonBg: string;
    buttonFg: string;
    buttonBorder: string;
    inputBg: string;
    inputBorder: string;
    inputFg: string;
    activeTabBg: string;
    activeTabFg: string;
    inactiveTabBg: string;
    inactiveTabFg: string;
    checkboxBorder: string;
    checkboxChecked: string;
    radioBorder: string;
    radioSelected: string;
    linkColor: string;
    headingColor: string;
    separatorColor: string;
    badgeBg: string;
    badgeFg: string;
    tagBg: string;
    tagFg: string;
    tagBorder: string;
    errorColor: string;
    warningColor: string;
    successColor: string;
    infoColor: string;
    helpColor: string;
    tooltipBg: string;
    tooltipFg: string;
    sliderFilled: string;
    sliderEmpty: string;
    toggleOnBg: string;
    toggleOffBg: string;
    toggleKnob: string;
    scrollbarBg: string;
    boxShadow: string;
    fontFamily: string;
    fontSize: number;
    charWidth: number;
    lineHeight: number;
}
export interface RenderOptions {
    theme?: string;
    width?: number;
    height?: number;
}
export interface ParseLimits {
    maxSourceBytes: number;
    maxLines: number;
    maxColumns: number;
    maxBoxes: number;
    maxTokens: number;
    maxSvgBytes: number;
}
export interface ContentEntry {
    lines: ContentLine[];
    columns?: ColumnRegion[];
}
export type ContentMap = Map<string, ContentEntry>;
export interface TokenEntry {
    tokens: LineToken[][];
    columns?: {
        left: number;
        right: number;
        tokens: LineToken[][];
    }[];
}
export type TokenMap = Map<string, TokenEntry>;
export interface MergedEntry {
    widgets: WidgetNode[];
    columns?: {
        left: number;
        right: number;
        widgets: WidgetNode[];
    }[];
}
export type MergedMap = Map<string, MergedEntry>;
export interface LayoutEntry {
    children: WidgetNode[];
}
export type LayoutMap = Map<string, LayoutEntry>;
//# sourceMappingURL=types.d.ts.map