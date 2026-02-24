import React, { useEffect, useMemo, useState } from 'react';
import KPICard from './components/dashboard/KPICard';
import GroupAnalysis from './components/dashboard/GroupAnalysis';
import OpportunityChart from './components/dashboard/OpportunityChart';
import DonutSection from './components/dashboard/DonutSection';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Clock } from 'lucide-react';
import { formatCurrency } from './lib/utils';
import { loadExcelData } from './lib/excel';
import { DonutDataItem, ExcelData, GroupData, OpportunityChartItem } from './types';

const App: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadExcelData()
      .then((data) => {
        if (isMounted) {
          setExcelData(data);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải dữ liệu Excel');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

    const revenueDonutData: DonutDataItem[] = [
      { name: 'Từ HĐ đã ký', value: getMetric(donutRevenueMetrics, 'signed') },
      { name: 'Từ HĐ mới', value: getMetric(donutRevenueMetrics, 'new') }
    ];

    const buildOpportunityRows = (group: string, prefix: string): OpportunityChartItem[] => {
      const newContract = getMetric(opportunityMetrics, `${prefix}NewContract`) / 1_000_000;
      const signedRevenue = getMetric(opportunityMetrics, `${prefix}RevenueSigned`) / 1_000_000;
      const newRevenue = getMetric(opportunityMetrics, `${prefix}RevenueNew`) / 1_000_000;

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

    const forecastContractPlan = getMetric(forecastMetrics, 'contractPlan');
    const forecastRevenuePlan = getMetric(forecastMetrics, 'revenuePlan');
    const contractForecast = getMetric(forecastMetrics, 'contractForecast');
    const revenueForecast =
      getMetric(forecastMetrics, 'revenueSigned') + getMetric(forecastMetrics, 'revenueNew');
    const contractForecastPercent =
      forecastContractPlan ? (contractForecast / forecastContractPlan) * 100 : 0;
    const revenueForecastPercent = forecastRevenuePlan ? (revenueForecast / forecastRevenuePlan) * 100 : 0;

    return {
      headerMetrics,
      kpiContractMetrics,
      kpiRevenueMetrics,
      forecastMetrics,
      headerContractPlan,
      headerRevenuePlan,
      contractGroupData,
      revenueGroupData,
      contractDonutData,
      revenueDonutData,
      opportunityData,
      contractForecast,
      revenueForecast,
      contractForecastPercent,
      revenueForecastPercent,
      contractDonutTotal: getMetric(donutContractMetrics, 'total'),
      revenueDonutTotal: getMetric(donutRevenueMetrics, 'total'),
      kpiContractTitle: getText('kpi-contract', 'title', 'Giá trị hợp đồng'),
      kpiRevenueTitle: getText('kpi-revenue', 'title', 'Giá trị doanh thu'),
      headerTitle: getText('header-plans', 'title', 'BÁO CÁO HOẠT ĐỘNG KDPM'),
      forecastTitle: getText('forecast', 'title', 'Dự báo cuối năm'),
      groupContractTitle: getText('group-contract', 'title', 'Hợp đồng theo nhóm (Tr)'),
      groupRevenueTitle: getText('group-revenue', 'title', 'Doanh thu theo nhóm (Tr)')
    };
  }, [excelData]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <span className="text-sm font-medium text-red-600">{error}</span>
      </div>
    );
  }

  if (!excelData || !derivedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <span className="text-sm font-medium text-slate-500">Đang tải dữ liệu Excel...</span>
      </div>
    );
  }

  const contractForecastPercent = derivedData.contractForecastPercent;
  const revenueForecastPercent = derivedData.revenueForecastPercent;
  const contractForecastPercentClamped = Math.min(contractForecastPercent, 100);
  const revenueForecastPercentClamped = Math.min(revenueForecastPercent, 100);
  const latestUpdateText = `Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')}`;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {derivedData.headerTitle}
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Kế hoạch năm: Hợp đồng {formatCurrency(derivedData.headerContractPlan)} | Doanh thu {formatCurrency(derivedData.headerRevenuePlan)}
                </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-md">
                <span>{latestUpdateText}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TOP KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="h-full">
                 <Card className="h-full border-none shadow-sm ring-1 ring-slate-200/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                <Clock size={24} strokeWidth={2.5} />
                            </div>
                            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">
                                {derivedData.forecastTitle}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-7">
                        {/* Forecast Items */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-medium text-slate-600">Hợp đồng dự kiến</span>
                                <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                                  {contractForecastPercent.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900">
                                  {(derivedData.contractForecast / 1_000_000_000).toFixed(1)}
                                </span>
                                <span className="text-lg text-slate-500 font-medium">Tỷ</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${contractForecastPercentClamped}%` }}></div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-base font-medium text-slate-600">Doanh thu dự kiến</span>
                                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
                                  {revenueForecastPercent.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900">
                                  {(derivedData.revenueForecast / 1_000_000_000).toFixed(1)}
                                </span>
                                <span className="text-lg text-slate-500 font-medium">Tỷ</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-teal-500" style={{ width: `${revenueForecastPercentClamped}%` }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* MIDDLE CHART ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GroupAnalysis 
                title={derivedData.groupContractTitle} 
                data={derivedData.contractGroupData} 
                type="contract"
            />
            <GroupAnalysis 
                title={derivedData.groupRevenueTitle} 
                data={derivedData.revenueGroupData} 
                type="revenue"
            />
        </div>

        {/* BOTTOM SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="col-span-1 lg:col-span-3">
                 <OpportunityChart data={derivedData.opportunityData} />
            </div>
            <DonutSection
              contractData={derivedData.contractDonutData}
              revenueData={derivedData.revenueDonutData}
              contractTotal={derivedData.contractDonutTotal}
              revenueTotal={derivedData.revenueDonutTotal}
            />
        </div>

      </main>
    </div>
  );
};

export default App;