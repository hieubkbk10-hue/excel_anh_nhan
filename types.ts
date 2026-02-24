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

export interface ExcelGroupMetrics {
  plan: number;
  opportunity: number;
  actual: number;
  fromSigned?: number;
  fromNew?: number;
}

export interface ExcelSectionData {
  ito: ExcelGroupMetrics;
  uni: ExcelGroupMetrics;
  g2b: ExcelGroupMetrics;
  total: ExcelGroupMetrics;
}

export interface ExcelData {
  contract: ExcelSectionData;
  revenue: ExcelSectionData;
}

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
