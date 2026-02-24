import { ExcelChartSpec } from '../types';

const DEFAULT_SHEET = 'Sheet1 (2)';

export const EXCEL_CHART_SPECS: ExcelChartSpec[] = [
  {
    id: 'header-plans',
    sheet: DEFAULT_SHEET,
    metrics: {
      contractPlan: 'L17',
      revenuePlan: 'N34'
    }
  },
  {
    id: 'kpi-contract',
    sheet: DEFAULT_SHEET,
    metrics: {
      current: 'N17',
      target: 'L17'
    }
  },
  {
    id: 'kpi-revenue',
    sheet: DEFAULT_SHEET,
    metrics: {
      current: 'Q34',
      target: 'N34'
    }
  },
  {
    id: 'forecast',
    sheet: DEFAULT_SHEET,
    metrics: {
      contractPlan: 'L17',
      contractForecast: 'M17',
      revenuePlan: 'N34',
      revenueSigned: 'O34',
      revenueNew: 'P34'
    }
  },
  {
    id: 'group-contract',
    sheet: DEFAULT_SHEET,
    metrics: {
      itoPlan: 'C17',
      itoActual: 'E17',
      uniPlan: 'F17',
      uniActual: 'H17',
      g2bPlan: 'I17',
      g2bActual: 'K17'
    }
  },
  {
    id: 'group-revenue',
    sheet: DEFAULT_SHEET,
    metrics: {
      itoPlan: 'C34',
      itoActual: 'E34',
      uniPlan: 'F34',
      uniActual: 'I34',
      g2bPlan: 'J34',
      g2bActual: 'M34'
    }
  },
  {
    id: 'opportunity',
    sheet: DEFAULT_SHEET,
    metrics: {
      itoNewContract: 'D17',
      itoRevenueSigned: '0',
      itoRevenueNew: 'D34',
      uniNewContract: 'G17',
      uniRevenueSigned: 'G34',
      uniRevenueNew: 'H34',
      g2bNewContract: 'J17',
      g2bRevenueSigned: 'K34',
      g2bRevenueNew: 'L34'
    }
  },
  {
    id: 'donut-contract',
    sheet: DEFAULT_SHEET,
    metrics: {
      ito: 'D17',
      uni: 'G17',
      g2b: 'J17',
      total: 'M17'
    }
  },
  {
    id: 'donut-revenue',
    sheet: DEFAULT_SHEET,
    metrics: {
      signed: 'O34',
      new: 'P34',
      total: '(O34+P34)'
    }
  }
];
