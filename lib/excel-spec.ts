import { ExcelChartSpec, ExcelLayoutConfig } from '../types';

export const EXCEL_FILE_URL = '/input.xlsx';
const DEFAULT_SHEET = 'TH_2026';

export const EXCEL_CHART_SPECS: ExcelChartSpec[] = [
  {
    id: 'header-plans',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'BÁO CÁO HOẠT ĐỘNG KDPM'
    },
    metrics: {
      contractPlan: 'L16',
      revenuePlan: 'N35'
    }
  },
  {
    id: 'kpi-contract',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Giá trị hợp đồng'
    },
    metrics: {
      current: 'N17',
      target: 'L17'
    }
  },
  {
    id: 'kpi-revenue',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Giá trị doanh thu'
    },
    metrics: {
      current: 'Q35',
      target: 'N35'
    }
  },
  {
    id: 'forecast',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Dự báo cuối năm'
    },
    metrics: {
      contractPlan: 'L17',
      contractForecast: 'M17',
      revenuePlan: 'N35',
      revenueSigned: 'O35',
      revenueNew: 'P35'
    }
  },
  {
    id: 'group-contract',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Hợp đồng theo nhóm (Tr)'
    },
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
    texts: {
      title: 'Doanh thu theo nhóm (Tr)'
    },
    metrics: {
      itoPlan: 'C35',
      itoActual: 'E35',
      uniPlan: 'F35',
      uniActual: 'I35',
      g2bPlan: 'J35',
      g2bActual: 'M35'
    }
  },
  {
    id: 'opportunity',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Nguồn cơ hội trong năm (Tr)'
    },
    metrics: {
      itoNewContract: 'D17',
      itoRevenueSigned: '0',
      itoRevenueNew: 'D35',
      uniNewContract: 'G17',
      uniRevenueSigned: 'G35',
      uniRevenueNew: 'H35',
      g2bNewContract: 'J17',
      g2bRevenueSigned: 'K35',
      g2bRevenueNew: 'L35'
    }
  },
  {
    id: 'donut-contract',
    sheet: DEFAULT_SHEET,
    texts: {
      title: 'Nguồn Hợp Đồng'
    },
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
    texts: {
      title: 'Nguồn Doanh Thu'
    },
    metrics: {
      signed: 'O35',
      new: 'P35',
      total: '(O35+P35)'
    }
  }
];

export const EXCEL_LAYOUT_CONFIG: ExcelLayoutConfig = {
  layoutItems: ['header-plans'],
  rowGroups: [
    { order: 1, items: ['kpi-contract', 'kpi-revenue', 'forecast'] },
    { order: 2, items: ['group-contract', 'group-revenue'] },
    { order: 3, items: ['opportunity'] },
    { order: 4, items: ['donut-contract', 'donut-revenue'] }
  ]
};
