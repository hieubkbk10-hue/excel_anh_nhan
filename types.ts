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
  | 'signed-contract-list'
  | 'signed-revenue-list'
  | 'signed-revenue-from-signed-contract-list'
  | 'opportunity-source-list'
  | 'opportunity'
  | 'donut-contract'
  | 'donut-revenue-source'
  | 'donut-revenue';

export type ExcelChartOrder = number | 'layout';

export interface ExcelChartOrderGroup {
  order: number;
  items: ExcelChartId[];
}

export interface ExcelLayoutConfig {
  layoutItems: ExcelChartId[];
  rowGroups: ExcelChartOrderGroup[];
}

export interface ExcelChartSpec {
  id: ExcelChartId;
  sheet?: string;
  metrics: Record<string, string>;
  texts?: Record<string, ExcelTextConfig>;
}

export interface ExcelData {
  charts: Record<ExcelChartId, Record<string, number>>;
  texts: Record<ExcelChartId, Record<string, string>>;
  contractsSigned: SignedContractRow[];
  revenuesSigned: SignedContractRow[];
  revenuesFromSignedContracts: SignedContractRow[];
  opportunitySources: OpportunitySourceRow[];
}

export type ExcelTextConfig =
  | string
  | {
      value?: string;
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

export interface SignedContractRow {
  group: string;
  customer: string;
  contractNo: string;
  content: string;
  value: number;
  contractDate: string;
}

export interface OpportunitySourceRow {
  group: string;
  customer: string;
  type: string;
  project: string;
  priority: string;
  contractMonth: string;
  contractValue: number;
  revenueValue: number;
}
