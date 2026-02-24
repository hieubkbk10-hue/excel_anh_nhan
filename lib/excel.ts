import * as XLSX from 'xlsx';
import { ExcelData, ExcelGroupMetrics, ExcelSectionData } from '../types';

type GroupKey = 'ito' | 'uni' | 'g2b' | 'total';
type MetricKey = 'plan' | 'opportunity' | 'actual' | 'fromSigned' | 'fromNew';

type ColumnMap = Record<GroupKey, Partial<Record<MetricKey, number>>>;

const EXCEL_URL = '/Hop dong - Doanh thu.xlsx';

export async function loadExcelData(): Promise<ExcelData> {
  const rows = await loadSheetRows(EXCEL_URL);
  const contract = parseTable(rows, 'HỢP ĐỒNG', 'Năm');
  const revenue = parseTable(rows, 'DOANH THU', 'Đến hiện tại');

  return { contract, revenue };
}

async function loadSheetRows(url: string): Promise<unknown[][]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải file Excel: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false });
}

function parseTable(rows: unknown[][], startLabel: string, totalLabel: string): ExcelSectionData {
  const startIndex = findRowIndex(rows, startLabel);
  if (startIndex === -1) {
    throw new Error(`Không tìm thấy bảng ${startLabel}`);
  }

  const headerRow = rows[startIndex + 1] ?? [];
  const subHeaderRow = rows[startIndex + 2] ?? [];
  const columnMap = buildColumnMap(headerRow, subHeaderRow);

  const totalIndex = findRowIndex(rows.slice(startIndex), totalLabel);
  if (totalIndex === -1) {
    throw new Error(`Không tìm thấy dòng tổng ${totalLabel}`);
  }
  const totalRow = rows[startIndex + totalIndex] ?? [];

  return {
    ito: extractGroup(totalRow, columnMap, 'ito'),
    uni: extractGroup(totalRow, columnMap, 'uni'),
    g2b: extractGroup(totalRow, columnMap, 'g2b'),
    total: extractGroup(totalRow, columnMap, 'total')
  };
}

function buildColumnMap(headerRow: unknown[], subHeaderRow: unknown[]): ColumnMap {
  const map: ColumnMap = { ito: {}, uni: {}, g2b: {}, total: {} };
  let currentGroup: GroupKey | null = null;

  for (let index = 0; index < Math.max(headerRow.length, subHeaderRow.length); index += 1) {
    const header = normalizeLabel(headerRow[index]);
    const subHeader = normalizeLabel(subHeaderRow[index]);

    const group = header ? getGroupKey(header) : null;
    if (group) {
      currentGroup = group;
    }

    if (!currentGroup || !subHeader) {
      continue;
    }

    const metric = getMetricKey(subHeader);
    if (!metric) {
      continue;
    }

    map[currentGroup][metric] = index;
  }

  return map;
}

function extractGroup(row: unknown[], map: ColumnMap, group: GroupKey): ExcelGroupMetrics {
  return {
    plan: getRequiredValue(row, map, group, 'plan'),
    opportunity: getRequiredValue(row, map, group, 'opportunity'),
    actual: getRequiredValue(row, map, group, 'actual'),
    fromSigned: getOptionalValue(row, map, group, 'fromSigned'),
    fromNew: getOptionalValue(row, map, group, 'fromNew')
  };
}

function findRowIndex(rows: unknown[][], label: string): number {
  const normalizedLabel = normalizeLabel(label);
  return rows.findIndex((row) => row.some((cell) => normalizeLabel(cell) === normalizedLabel));
}

function getRequiredValue(row: unknown[], map: ColumnMap, group: GroupKey, metric: MetricKey): number {
  const index = map[group]?.[metric];
  if (index === undefined) {
    return 0;
  }
  return toNumber(row[index]);
}

function getOptionalValue(
  row: unknown[],
  map: ColumnMap,
  group: GroupKey,
  metric: MetricKey
): number | undefined {
  const index = map[group]?.[metric];
  if (index === undefined) {
    return undefined;
  }
  return toNumber(row[index]);
}

function normalizeLabel(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().toLowerCase();
}

function getGroupKey(label: string): GroupKey | null {
  if (label.includes('ito')) return 'ito';
  if (label.includes('uni')) return 'uni';
  if (label.includes('g2b')) return 'g2b';
  if (label.includes('bppm')) return 'total';
  return null;
}

function getMetricKey(label: string): MetricKey | null {
  if (label.includes('kế hoạch')) return 'plan';
  if (label.includes('từ hđ mới')) return 'fromNew';
  if (label.includes('cơ hội')) return 'opportunity';
  if (label.includes('thực tế')) return 'actual';
  if (label.includes('từ hđ đã ký')) return 'fromSigned';
  return null;
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}
