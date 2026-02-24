export interface KPIData {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: 'file' | 'dollar' | 'clock';
  color: string;
}

export interface GroupData {
  name: string;
  plan: number;
  actual: number;
}

export interface OpportunityData {
  group: string;
  newContract: number;
  signedFromOld: number;
  revenueFromNew: number;
}

export type ExcelChartId =
  | 'header-plans'
  | 'kpi-contract'
  | 'kpi-revenue'
  | 'forecast'
  | 'group-contract'
  | 'group-revenue'
  | 'opportunity'
  | 'donut-contract'
  | 'donut-revenue';

export interface ExcelChartSpec {
  id: ExcelChartId;
  sheet?: string;
  metrics: Record<string, string>;
  texts?: Record<string, ExcelTextConfig>;
}

export interface ExcelData {
  charts: Record<ExcelChartId, Record<string, number>>;
  texts: Record<ExcelChartId, Record<string, string>>;
}

export type ExcelTextConfig =
  | string
  | {
      value?: string;
      from?: string;
      fallback?: string;
    };

export interface DonutDataItem {
  name: string;
  value: number;
}

export interface OpportunityChartItem {
  label: string;
  group: string;
  rowType: 'new' | 'stacked';
  value1: number;
  value2: number;
  value3: number;
  total: number;
}
