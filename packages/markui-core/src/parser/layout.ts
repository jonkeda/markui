import { MergedMap, LayoutMap, LayoutEntry, WidgetNode } from '../types';

export function resolveLayout(
  mergedMap: MergedMap
): { layoutMap: LayoutMap } {
  const layoutMap: LayoutMap = new Map();

  for (const [key, entry] of mergedMap) {
    // If the entry has column regions, wrap in ColumnLayout
    if (entry.columns && entry.columns.length > 0) {
      const columnChildren: WidgetNode[] = entry.columns.map(col => {
        const grouped = groupByRow(col.widgets);
        return {
          type: 'VerticalGroup' as const,
          row: col.widgets.length > 0 ? col.widgets[0].row : 0,
          col: col.left,
          width: col.right - col.left,
          children: grouped,
        };
      });

      const layoutNode: WidgetNode = {
        type: 'ColumnLayout',
        row: columnChildren[0]?.row ?? 0,
        col: columnChildren[0]?.col ?? 0,
        width: columnChildren.reduce((sum, c) => sum + c.width, 0),
        children: columnChildren,
      };

      layoutMap.set(key, { children: [layoutNode] });
    } else {
      // Group widgets by row for horizontal grouping
      const grouped = groupByRow(entry.widgets);
      layoutMap.set(key, { children: grouped });
    }
  }

  return { layoutMap };
}

function groupByRow(widgets: WidgetNode[]): WidgetNode[] {
  if (widgets.length <= 1) return widgets;

  // Group consecutive widgets on the same row
  const result: WidgetNode[] = [];
  let currentGroup: WidgetNode[] = [];
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

function flushGroup(group: WidgetNode[], result: WidgetNode[]): void {
  if (group.length === 0) return;

  if (group.length === 1) {
    result.push(group[0]);
  } else {
    // Multiple widgets on same row → HorizontalGroup
    result.push({
      type: 'HorizontalGroup',
      row: group[0].row,
      col: group[0].col,
      width: (group[group.length - 1].col + group[group.length - 1].width) - group[0].col,
      children: group,
    });
  }
}
