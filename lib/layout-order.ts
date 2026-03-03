import { ExcelChartId, ExcelLayoutConfig } from '../types';

export type RenderRow = {
  type: 'layout' | 'row';
  order: 'layout' | number;
  items: ExcelChartId[];
};

export function buildRenderRows(config: ExcelLayoutConfig): RenderRow[] {
  const rows: RenderRow[] = [];

  if (config.layoutItems.length) {
    rows.push({ type: 'layout', order: 'layout', items: config.layoutItems });
  }

  const sortedGroups = [...config.rowGroups].sort((a, b) => a.order - b.order);
  for (const group of sortedGroups) {
    rows.push({ type: 'row', order: group.order, items: group.items });
  }

  return rows;
}
