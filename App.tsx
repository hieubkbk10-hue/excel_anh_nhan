import React, { useEffect, useMemo, useState } from 'react';
import KPICard from './components/dashboard/KPICard';
import GroupAnalysis from './components/dashboard/GroupAnalysis';
import OpportunityChart from './components/dashboard/OpportunityChart';
import DonutSection from './components/dashboard/DonutSection';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Clock } from 'lucide-react';
import { formatCurrency } from './lib/utils';
import { loadExcelData } from './lib/excel';
import { DonutDataItem, ExcelData, ExcelGroupMetrics, GroupData, OpportunityChartItem } from './types';

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

    const { contract, revenue } = excelData;
    const contractPlan = contract.total.plan;
    const revenuePlan = revenue.total.plan;

    const contractGroupData: GroupData[] = [
      { name: 'ITO', plan: contract.ito.plan / 1_000_000, actual: contract.ito.actual / 1_000_000 },
      { name: 'UNI', plan: contract.uni.plan / 1_000_000, actual: contract.uni.actual / 1_000_000 },
      { name: 'G2B', plan: contract.g2b.plan / 1_000_000, actual: contract.g2b.actual / 1_000_000 }
    ];

    const revenueGroupData: GroupData[] = [
      { name: 'ITO', plan: revenue.ito.plan / 1_000_000, actual: revenue.ito.actual / 1_000_000 },
      { name: 'UNI', plan: revenue.uni.plan / 1_000_000, actual: revenue.uni.actual / 1_000_000 },
      { name: 'G2B', plan: revenue.g2b.plan / 1_000_000, actual: revenue.g2b.actual / 1_000_000 }
    ];

    const contractFromNewTotal = contract.total.fromNew ?? contract.total.opportunity ?? 0;
    const contractDonutData: DonutDataItem[] = [
      { name: 'ITO', value: contract.ito.actual },
      { name: 'UNI', value: contract.uni.actual },
      { name: 'G2B', value: contract.g2b.actual }
    ];

    const revenueFromSignedTotal = revenue.total.fromSigned ?? 0;
    const revenueFromNewTotal = revenue.total.fromNew ?? revenue.total.opportunity ?? 0;
    const revenueDonutData: DonutDataItem[] = [
      { name: 'Từ HĐ đã ký', value: revenueFromSignedTotal },
      { name: 'Từ HĐ mới', value: revenueFromNewTotal }
    ];

    const buildOpportunityRows = (
      group: string,
      contractGroup: ExcelGroupMetrics,
      revenueGroup: ExcelGroupMetrics
    ): OpportunityChartItem[] => {
      const newContract = (contractGroup.fromNew ?? contractGroup.opportunity ?? 0) / 1_000_000;
      const signedRevenue = (revenueGroup.fromSigned ?? 0) / 1_000_000;
      const newRevenue = (revenueGroup.fromNew ?? revenueGroup.opportunity ?? 0) / 1_000_000;

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
      ...buildOpportunityRows('ITO', contract.ito, revenue.ito),
      ...buildOpportunityRows('UNI', contract.uni, revenue.uni),
      ...buildOpportunityRows('G2B', contract.g2b, revenue.g2b)
    ];

    const contractForecast = contractFromNewTotal;
    const revenueForecast = revenueFromSignedTotal + revenueFromNewTotal;
    const contractForecastPercent = contractPlan ? (contractForecast / contractPlan) * 100 : 0;
    const revenueForecastPercent = revenuePlan ? (revenueForecast / revenuePlan) * 100 : 0;

    return {
      contractPlan,
      revenuePlan,
      contractGroupData,
      revenueGroupData,
      contractFromNewTotal,
      contractDonutData,
      revenueDonutData,
      opportunityData,
      contractForecast,
      revenueForecast,
      contractForecastPercent,
      revenueForecastPercent
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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    BÁO CÁO HOẠT ĐỘNG KDPM
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                    Kế hoạch năm: Hợp đồng {formatCurrency(derivedData.contractPlan)} | Doanh thu {formatCurrency(derivedData.revenuePlan)}
                </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-md">
                <span>Cập nhật mới nhất</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TOP KPI ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-full">
                <KPICard 
                    title="Giá trị hợp đồng"
                    currentValue={excelData.contract.total.actual}
                    targetValue={excelData.contract.total.plan}
                    icon="file"
                    colorClass="text-blue-600"
                    bgClass="bg-blue-50"
                    barColorClass="bg-blue-600"
                />
            </div>
            <div className="h-full">
                <KPICard 
                    title="Giá trị doanh thu"
                    currentValue={excelData.revenue.total.actual}
                    targetValue={excelData.revenue.total.plan}
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
                                Dự báo cuối năm
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
                title="Hợp đồng theo nhóm (Tr)" 
                data={derivedData.contractGroupData} 
                type="contract"
            />
            <GroupAnalysis 
                title="Doanh thu theo nhóm (Tr)" 
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
              contractTotal={excelData.contract.total.fromNew ?? excelData.contract.total.opportunity ?? 0}
              revenueTotal={derivedData.revenueForecast}
            />
        </div>

      </main>
    </div>
  );
};

export default App;