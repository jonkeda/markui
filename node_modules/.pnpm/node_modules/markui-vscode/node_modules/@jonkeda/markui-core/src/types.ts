// === Grid Types ===
export interface Grid {
  rows: string[][];   // 2D char array, rows[r][c]
  width: number;
  height: number;
}

// === Box Types ===
export type BorderStyle = 'solid' | 'dashed' | 'none';
export type CornerChar = '+' | 'v' | '>' | 'w';

export interface Box {
  top: number;
  left: number;
  bottom: number;
  right: number;
  title?: string;
  typeName?: string;       // @Modal, @Drawer etc.
  cornerChar: CornerChar;  // '+' = box, 'v' = vertical list, '>' = horizontal list, 'w' = wrapped list
  borderStyle: BorderStyle;
  hasRightBorder: boolean;
  scrollRight: boolean;
  scrollBottom: boolean;
  resizeDividers: number[]; // column indices with '.' dividers
  columnDividers: number[]; // column indices with '|' dividers
  parent?: Box;
  children: Box[];
  nestLevel: number;        // 0 = root, for ++--- prefix boxes
  hasNestedPrefix?: boolean; // true if box contains ++--- sub-sections
}

// === Token Types ===
export type WidgetType =
  | 'Document' | 'Box' | 'VerticalList' | 'HorizontalList' | 'WrappedList' | 'HorizontalGroup' | 'VerticalGroup'
  | 'ColumnLayout' | 'FormField'
  | 'Button' | 'IconButton' | 'SplitButton' | 'Link'
  | 'Checkbox' | 'Radio' | 'TextInput' | 'PasswordInput' | 'DateInput'
  | 'NumberInput' | 'Textarea' | 'Dropdown' | 'CustomInput'
  | 'Toggle' | 'Slider' | 'Stepper' | 'Rating'
  | 'Badge' | 'Tag' | 'RemovableChip' | 'Icon' | 'Image'
  | 'Separator' | 'Spinner' | 'ProgressBar' | 'Label' | 'Heading'
  | 'Annotation' | 'Accordion' | 'Expander' | 'TreeNode'
  | 'ComponentRef' | 'SlotMarker' | 'Toast'
  | 'TabBar' | 'Tab' | 'ActiveTab' | 'Breadcrumb' | 'Pagination'
  | 'Table' | 'TableRow' | 'TableHeader' | 'TableCell'
  | 'ContextMenu' | 'DropdownOption' | 'PrevButton' | 'NextButton';

export interface WidgetNode {
  type: WidgetType;
  text?: string;
  value?: string;
  row: number;
  col: number;
  width: number;
  height?: number;
  state?: string;     // 'checked', 'selected', 'expanded', 'collapsed', 'on', 'off', 'mixed', 'indeterminate'
  children: WidgetNode[];
  iconIndex?: number;
  level?: number;     // heading level, nest level
  annotationType?: string;  // '?' '$' '!' 'i' 'x' 'v'
  percentage?: number;
  numerator?: number;
  denominator?: number;
  scrollRight?: boolean;
  scrollBottom?: boolean;
  resizeDividers?: number[];
}

// === Content Types ===
export interface ContentLine {
  text: string;
  row: number;        // grid row
  colOffset: number;  // grid column offset of text start
}

export interface ColumnRegion {
  left: number;
  right: number;
  lines: ContentLine[];
}

// === Token on a line ===
export interface LineToken {
  type: WidgetType;
  text: string;
  value?: string;
  row?: number;       // source grid row (set by stampRow)
  start: number;      // column offset in the content line
  end: number;        // exclusive end column
  state?: string;
  iconIndex?: number;
  annotationType?: string;
  level?: number;
  percentage?: number;
  numerator?: number;
  denominator?: number;
  children?: LineToken[];
}

// === Parse Result ===
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
}

export interface ParseResult {
  tree: WidgetNode;
  errors: ParseError[];
  boxes: Box[];
  mode: ParseMode;
}

// === Renderer Types ===
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

// === Pipeline Types (between parser phases) ===
export interface ContentEntry {
  lines: ContentLine[];
  columns?: ColumnRegion[];
}

export type ContentMap = Map<string, ContentEntry>;

export interface TokenEntry {
  tokens: LineToken[][];
  columns?: { left: number; right: number; tokens: LineToken[][] }[];
}

export type TokenMap = Map<string, TokenEntry>;

export interface MergedEntry {
  widgets: WidgetNode[];
  columns?: { left: number; right: number; widgets: WidgetNode[] }[];
}

export type MergedMap = Map<string, MergedEntry>;

export interface LayoutEntry {
  children: WidgetNode[];
}

export type LayoutMap = Map<string, LayoutEntry>;
