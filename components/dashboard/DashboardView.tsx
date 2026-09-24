import React, { useMemo, useState } from 'react';
import KPICard from './KPICard';
import GroupAnalysis from './GroupAnalysis';
import OpportunityChart from './OpportunityChart';
import DonutSection from './DonutSection';
import SignedContractList from './SignedContractList';
import OpportunitySourceList from './OpportunitySourceList';
import OpportunityRevenueList from './OpportunityRevenueList';
import ForecastUntilMonth from './ForecastUntilMonth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Clock } from 'lucide-react';
import { formatCurrency, formatCurrencyFull, formatInBillions, parseLevel } from '../../lib/utils';
import { EXCEL_LAYOUT_CONFIG } from '../../lib/excel-spec';
import { buildRenderRows } from '../../lib/layout-order';
import { DonutDataItem, ExcelChartId, ExcelData, GroupData, OpportunityChartItem } from '../../types';

function parseMonth(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10);
}

interface DashboardViewProps {
  excelData: ExcelData;
}

const DashboardView: React.FC<DashboardViewProps> = ({ excelData }) => {
  const derivedData = useMemo(() => {
    if (!excelData) return null;

    const charts = excelData.charts;
    const texts = excelData.texts;
    const headerMetrics = charts['header-plans'];
    const kpiContractMetrics = charts['kpi-contract'];
    const kpiRevenueMetrics = charts['kpi-revenue'];
    const forecastMetrics = charts['forecast'];
    const groupContractMetrics = charts['group-contract'];
    const groupRevenueMetrics = charts['group-revenue'];
    const opportunityMetrics = charts['opportunity'];
    const donutContractMetrics = charts['donut-contract'];
    const donutRevenueSourceMetrics = charts['donut-revenue-source'];
    const donutRevenueMetrics = charts['donut-revenue'];

    const getMetric = (metrics: Record<string, number> | undefined, key: string) =>
      metrics?.[key] ?? 0;
    const getText = (chartId: keyof typeof texts, key: string, fallback: string) =>
      texts?.[chartId]?.[key] ?? fallback;

    const headerContractPlan = getMetric(headerMetrics, 'contractPlan');
    const headerRevenuePlan = getMetric(headerMetrics, 'revenuePlan');

    const contractGroupData: GroupData[] = [
      {
        name: 'ITO',
        plan: getMetric(groupContractMetrics, 'itoPlan') / 1_000_000,
        actual: getMetric(groupContractMetrics, 'itoActual') / 1_000_000
      },
      {
        name: 'UNI',
        plan: getMetric(groupContractMetrics, 'uniPlan') / 1_000_000,
        actual: getMetric(groupContractMetrics, 'uniActual') / 1_000_000
      },
      {
        name: 'G2B',
        plan: getMetric(groupContractMetrics, 'g2bPlan') / 1_000_000,
        actual: getMetric(groupContractMetrics, 'g2bActual') / 1_000_000
      }
    ];

    const revenueGroupData: GroupData[] = [
      {
        name: 'ITO',
        plan: getMetric(groupRevenueMetrics, 'itoPlan') / 1_000_000,
        actual: getMetric(groupRevenueMetrics, 'itoActual') / 1_000_000
      },
      {
        name: 'UNI',
        plan: getMetric(groupRevenueMetrics, 'uniPlan') / 1_000_000,
        actual: getMetric(groupRevenueMetrics, 'uniActual') / 1_000_000
      },
      {
        name: 'G2B',
        plan: getMetric(groupRevenueMetrics, 'g2bPlan') / 1_000_000,
        actual: getMetric(groupRevenueMetrics, 'g2bActual') / 1_000_000
      }
    ];

    const contractDonutData: DonutDataItem[] = [
      { name: 'ITO', value: getMetric(donutContractMetrics, 'ito') },
      { name: 'UNI', value: getMetric(donutContractMetrics, 'uni') },
      { name: 'G2B', value: getMetric(donutContractMetrics, 'g2b') }
    ];

    const rSignedDefault = excelData.revenuesFromSignedContracts.reduce((s, r) => s + r.value, 0);
    const rNewDefault = excelData.opportunitySources.reduce((s, r) => s + r.revenueValue, 0);
    const revenueDonutData: DonutDataItem[] = [
      { name: 'Từ HĐ đã ký', value: rSignedDefault },
      { name: 'Từ HĐ mới', value: rNewDefault }
    ];

    const revenueSourceDonutData: DonutDataItem[] = [
      { name: 'ITO', value: getMetric(donutRevenueSourceMetrics, 'ito') },
      { name: 'UNI', value: getMetric(donutRevenueSourceMetrics, 'uni') },
      { name: 'G2B', value: getMetric(donutRevenueSourceMetrics, 'g2b') }
    ];

    const buildOpportunityRows = (group: string, prefix: string): OpportunityChartItem[] => {
      const newContract = getMetric(opportunityMetrics, `${prefix}NewContract`);
      const signedRevenue = getMetric(opportunityMetrics, `${prefix}RevenueSigned`);
      const newRevenue = getMetric(opportunityMetrics, `${prefix}RevenueNew`);

      return [
        {
          label: `${group}-new`,
          group,
          rowType: 'new',
          value1: newContract,
          value2: 0,
          value3: 0,
          total: 0
        },
        {
          label: `${group}-stacked`,
          group,
          rowType: 'stacked',
          value1: 0,
          value2: signedRevenue,
          value3: newRevenue,
          total: signedRevenue + newRevenue
        }
      ];
    };

    const opportunityData: OpportunityChartItem[] = [
      ...buildOpportunityRows('ITO', 'ito'),
      ...buildOpportunityRows('UNI', 'uni'),
      ...buildOpportunityRows('G2B', 'g2b')
    ];

    const revenueInProgressByGroup = {
      ITO: getMetric(opportunityMetrics, 'itoRevenueSigned'),
      UNI: getMetric(opportunityMetrics, 'uniRevenueSigned'),
      G2B: getMetric(opportunityMetrics, 'g2bRevenueSigned')
    };
    const revenueInProgress =
      revenueInProgressByGroup.ITO + revenueInProgressByGroup.UNI + revenueInProgressByGroup.G2B;

    const forecastContractPlan = getMetric(forecastMetrics, 'contractPlan');
    const forecastRevenuePlan = getMetric(forecastMetrics, 'revenuePlan');

    const contractActualForecast = getMetric(forecastMetrics, 'contractActual');
    const revenueActualForecast = getMetric(forecastMetrics, 'revenueActual');
    const revenueSignedForecast = getMetric(forecastMetrics, 'revenueSigned');

    const buildForecastByLevel = () => {
      const cumContract: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      const cumRevenue: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
      for (const r of excelData.opportunitySources) {
        const level = parseLevel(r.priority);
        if (level == null) continue;
        const oppContract = r.contractValue;
        const inDt = (month: string, dt: number) => (parseMonth(month) >= 1 ? dt : 0);
        const oppRevenue = inDt(r.dtMonth1, r.dt1) + inDt(r.dtMonth2, r.dt2) + inDt(r.dtMonth3, r.dt3);
        for (let t = level; t <= 3; t++) {
          cumContract[t] += oppContract;
          cumRevenue[t] += oppRevenue;
        }
      }
      const labels: Record<number, string> = { 1: 'Mức 1', 2: 'Mức 1+2', 3: 'Mức 1+2+3' };
      return {
        contract: [1, 2, 3].map((t) => ({ label: labels[t], value: contractActualForecast + cumContract[t] })),
        revenue: [1, 2, 3].map((t) => ({ label: labels[t], value: revenueActualForecast + revenueSignedForecast + cumRevenue[t] }))
      };
    };
    const forecastByLevel = buildForecastByLevel();

    return {
      headerMetrics,
      kpiContractMetrics,
      kpiRevenueMetrics,
      forecastMetrics,
      headerContractPlan,
      headerRevenuePlan,
      contractGroupPlan: {
        ITO: getMetric(groupContractMetrics, 'itoPlan'),
        UNI: getMetric(groupContractMetrics, 'uniPlan'),
        G2B: getMetric(groupContractMetrics, 'g2bPlan'),
      },
      contractGroupActual: {
        ITO: getMetric(groupContractMetrics, 'itoActual'),
        UNI: getMetric(groupContractMetrics, 'uniActual'),
        G2B: getMetric(groupContractMetrics, 'g2bActual'),
      },
      revenueGroupPlan: {
        ITO: getMetric(groupRevenueMetrics, 'itoPlan'),
        UNI: getMetric(groupRevenueMetrics, 'uniPlan'),
        G2B: getMetric(groupRevenueMetrics, 'g2bPlan'),
      },
      revenueGroupActual: {
        ITO: getMetric(groupRevenueMetrics, 'itoActual'),
        UNI: getMetric(groupRevenueMetrics, 'uniActual'),
        G2B: getMetric(groupRevenueMetrics, 'g2bActual'),
      },
      contractGroupData,
      revenueGroupData,
      contractDonutData,
      revenueDonutData,
      revenueSourceDonutData,
      opportunityData,
      revenueInProgress,
      revenueInProgressByGroup,
      contractForecastByLevel: forecastByLevel.contract,
      revenueForecastByLevel: forecastByLevel.revenue,
      contractDonutTotal: getMetric(donutContractMetrics, 'total'),
      revenueSourceDonutTotal: getMetric(donutRevenueSourceMetrics, 'total'),
      revenueDonutTotal: rSignedDefault + rNewDefault,
      kpiContractTitle: getText('kpi-contract', 'title', 'Giá trị hợp đồng'),
      kpiRevenueTitle: getText('kpi-revenue', 'title', 'Giá trị doanh thu'),
      headerTitle: getText('header-plans', 'title', 'BÁO CÁO HOẠT ĐỘNG KDPM'),
      forecastTitle: getText('forecast', 'title', 'Dự báo cuối năm (Mức 1,2,3)'),
      groupContractTitle: getText('group-contract', 'title', 'Hợp đồng theo nhóm'),
      groupRevenueTitle: getText('group-revenue', 'title', 'Doanh thu theo nhóm'),
      signedContractTitle: getText(
        'signed-contract-list',
        'title',
        'Chi tiết danh sách hợp đồng đã ký'
      ),
      signedContractRows: excelData.contractsSigned,
      signedRevenueTitle: getText(
        'signed-revenue-list',
        'title',
        'Chi tiết danh sách doanh thu'
      ),
      signedRevenueRows: excelData.revenuesSigned,
      signedRevenueFromSignedContractTitle: getText(
        'signed-revenue-from-signed-contract-list',
        'title',
        'Doanh thu từ hợp đồng đã ký'
      ),
      signedRevenueFromSignedContractRows: excelData.revenuesFromSignedContracts,
      opportunitySourceTitle: getText(
        'opportunity-source-list',
        'title',
        'Chi tiết nguồn hợp đồng'
      ),
      opportunitySourceRows: excelData.opportunitySources,
      opportunityTitle: getText('opportunity', 'title', 'Nguồn cơ hội trong năm'),
      donutContractTitle: getText('donut-contract', 'title', 'Nguồn Hợp Đồng'),
      donutRevenueSourceTitle: getText('donut-revenue-source', 'title', 'Nguồn doanh thu (Mới)'),
      donutRevenueTitle: getText('donut-revenue', 'title', 'Nguồn Doanh Thu')
    };
  }, [excelData]);

  if (!derivedData) return null;

  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [forecastMonths, setForecastMonths] = useState<number[]>([]);

  const latestUpdateText = `Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')}`;
  const renderRows = buildRenderRows(EXCEL_LAYOUT_CONFIG);
  const rowLayoutClasses: Record<number, string> = {
    1: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[3fr_3fr_4fr] gap-6',
    2: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
    3: 'grid grid-cols-1 gap-8',
    4: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    5: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    6: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    7: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    8: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
    9: 'grid grid-cols-1 gap-8'
  };

  const chartRenderers: Record<ExcelChartId, () => React.ReactNode> = {
    'header-plans': () => (
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="w-[80%] max-w-none mx-auto px-4 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {derivedData.headerTitle}
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Kế hoạch năm: HĐ: {formatCurrencyFull(derivedData.headerContractPlan)} VNĐ | DT: {' '}
              {formatCurrencyFull(derivedData.headerRevenuePlan)} VNĐ
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-md">
            <span>{latestUpdateText}</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>
      </header>
    ),
    'kpi-contract': () => (
      <div className="h-full">
        <KPICard
          title={derivedData.kpiContractTitle}
          currentValue={derivedData.kpiContractMetrics?.current ?? 0}
          targetValue={derivedData.kpiContractMetrics?.target ?? 0}
          icon="file"
          colorClass="text-blue-600"
          bgClass="bg-blue-50"
          barColorClass="bg-blue-600"
        />
      </div>
    ),
    'kpi-revenue': () => (
      <div className="h-full">
        <KPICard
          title={derivedData.kpiRevenueTitle}
          currentValue={derivedData.kpiRevenueMetrics?.current ?? 0}
          targetValue={derivedData.kpiRevenueMetrics?.target ?? 0}
          icon="dollar"
          colorClass="text-emerald-600"
          bgClass="bg-emerald-50"
          barColorClass="bg-emerald-600"
        />
      </div>
    ),
    forecast: () => {
        const forecastMetrics = derivedData.forecastMetrics;
        return (
          <div className="h-full">
            <Card className="h-full border-none shadow-sm ring-1 ring-slate-200/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Clock size={24} strokeWidth={2.5} />
                  </div>
                  <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">
                    {derivedData.forecastTitle}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100">
                      <th className="pb-2 pr-2 font-medium">Mức độ</th>
                      <th className="pb-2 pr-2 font-medium text-right">Hợp đồng</th>
                      <th className="pb-2 font-medium text-right">Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {derivedData.contractForecastByLevel.map((row, index) => {
                      const revenueRow = derivedData.revenueForecastByLevel[index];
                      const contractPct = (forecastMetrics?.contractPlan ?? 0) ? (row.value / (forecastMetrics?.contractPlan ?? 0)) * 100 : 0;
                      const revenuePct = (forecastMetrics?.revenuePlan ?? 0) ? (revenueRow.value / (forecastMetrics?.revenuePlan ?? 0)) * 100 : 0;
                      return (
                        <tr key={row.label} className="border-b border-slate-50">
                          <td className="py-3 pr-3 whitespace-nowrap font-bold text-base text-slate-700">{row.label}</td>
                          <td className="py-3 pr-3 text-right whitespace-nowrap">
                            <div className="text-3xl font-extrabold text-blue-600">{formatInBillions(row.value)}</div>
                            <div className="text-lg font-bold text-blue-400">{contractPct.toFixed(1)}%</div>
                          </td>
                          <td className="py-3 text-right whitespace-nowrap">
                            <div className="text-3xl font-extrabold text-emerald-600">{formatInBillions(revenueRow.value)}</div>
                            <div className="text-lg font-bold text-emerald-400">{revenuePct.toFixed(1)}%</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        );
      },
    'group-contract': () => (
      <GroupAnalysis title={derivedData.groupContractTitle} data={derivedData.contractGroupData} type="contract" />
    ),
    'group-revenue': () => (
      <GroupAnalysis title={derivedData.groupRevenueTitle} data={derivedData.revenueGroupData} type="revenue" />
    ),
    'signed-contract-list': () => (
      <SignedContractList rows={derivedData.signedContractRows} title={derivedData.signedContractTitle} isContract />
    ),
    'signed-revenue-list': () => (
      <SignedContractList rows={derivedData.signedRevenueRows} title={derivedData.signedRevenueTitle} />
    ),
    'signed-revenue-from-signed-contract-list': () => (
      <SignedContractList
        rows={derivedData.signedRevenueFromSignedContractRows}
        title={derivedData.signedRevenueFromSignedContractTitle}
        filterMonths={selectedMonths}
        compactSummary
        expiryMode
      />
    ),
    'opportunity-source-list': () => (
      <OpportunitySourceList
        rows={derivedData.opportunitySourceRows}
        title={derivedData.opportunitySourceTitle}
        filterMonths={selectedMonths}
        hideColumns={['revenueValue']}
        filterByContractMonth
      />
    ),
    'opportunity-revenue-list': () => (
      <OpportunityRevenueList
        rows={derivedData.opportunitySourceRows}
        title="Chi tiết nguồn doanh thu"
        filterMonths={selectedMonths}
      />
    ),
    opportunity: () => (
      <div className="col-span-1 lg:col-span-3">
        <OpportunityChart data={derivedData.opportunityData} title={derivedData.opportunityTitle} />
      </div>
    ),
    'donut-contract': () => (
      <DonutSection
        contractData={derivedData.contractDonutData}
        revenueData={derivedData.revenueDonutData}
        revenueSourceData={derivedData.revenueSourceDonutData}
        contractTotal={derivedData.contractDonutTotal}
        revenueTotal={derivedData.revenueDonutTotal}
        revenueSourceTotal={derivedData.revenueSourceDonutTotal}
        contractTitle={derivedData.donutContractTitle}
        revenueTitle={derivedData.donutRevenueTitle}
        revenueSourceTitle={derivedData.donutRevenueSourceTitle}
        contractsSigned={derivedData.signedContractRows}
        revenuesSigned={derivedData.signedRevenueRows}
        revenuesFromSignedContracts={derivedData.signedRevenueFromSignedContractRows}
        opportunitySources={derivedData.opportunitySourceRows}
        selectedMonths={selectedMonths}
        onSelectedMonthsChange={setSelectedMonths}
        monthlyContractPlan={excelData.monthlyContractPlan}
        monthlyRevenuePlan={excelData.monthlyRevenuePlan}
      />
    ),
    'donut-revenue-source': () => null,
    'donut-revenue': () => null
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {renderRows
        .filter((row) => row.type === 'layout')
        .flatMap((row) =>
          row.items.map((id) => {
            const renderer = chartRenderers[id];
            return renderer ? <React.Fragment key={`layout-${id}`}>{renderer()}</React.Fragment> : null;
          })
        )}

      <main className="w-[80%] max-w-none mx-auto px-4 py-8 space-y-8">
        {renderRows
          .filter((row) => row.type === 'row')
          .map((row) => (
            <React.Fragment key={`row-${row.order}`}>
              {row.order === 5 && (
                <h1 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 pt-2 uppercase">
                  Kế hoạch Hợp đồng - Doanh thu
                </h1>
              )}
              <div className={rowLayoutClasses[row.order] ?? 'grid grid-cols-1 gap-6'}>
                {row.items.map((id) => {
                  const renderer = chartRenderers[id];
                  return renderer ? <React.Fragment key={id}>{renderer()}</React.Fragment> : null;
                })}
              </div>
              {row.order === 8 && (
                <>
                  <h1 className="text-2xl font-bold text-slate-800 border-b border-slate-200 pb-3 pt-2 uppercase">
                    Dự báo kết quả kinh doanh
                  </h1>
                  <ForecastUntilMonth
                    contractPlanYear={derivedData.kpiContractMetrics?.target ?? 0}
                    contractActual={derivedData.kpiContractMetrics?.current ?? 0}
                    revenuePlanYear={derivedData.kpiRevenueMetrics?.target ?? 0}
                    revenueActual={derivedData.kpiRevenueMetrics?.current ?? 0}
                    opportunitySources={derivedData.opportunitySourceRows}
                    selectedMonths={forecastMonths}
                    onSelectedMonthsChange={setForecastMonths}
                    contractGroupPlan={derivedData.contractGroupPlan}
                    contractGroupActual={derivedData.contractGroupActual}
                    revenueGroupPlan={derivedData.revenueGroupPlan}
                    revenueGroupActual={derivedData.revenueGroupActual}
                    revenueInProgress={derivedData.revenueInProgress}
                    revenueInProgressByGroup={derivedData.revenueInProgressByGroup}
                  />
                </>
              )}
            </React.Fragment>
          ))}
      </main>
    </div>
  );
};

export default DashboardView;
