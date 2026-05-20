import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatCurrencyFull, formatInBillions } from '../../lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';
import { DonutDataItem, OpportunitySourceRow, SignedContractRow } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Emerald, Amber
const REVENUE_COLORS = ['#1e293b', '#10b981']; // Slate-800, Emerald-500

/** Lấy tháng từ contractDate dạng DD/MM/YYYY */
function getMonth(contractDate: string): number {
  const parts = contractDate.split('/');
  return parts.length >= 2 ? Number(parts[1]) : 0;
}

const DonutChartWithLegend = ({
  title,
  data,
  colors,
  totalLabel,
  totalValue,
  valueClassName = 'font-bold text-slate-800'
}: {
  title: string;
  data: DonutDataItem[];
  colors: string[];
  totalLabel: string;
  totalValue: string;
  valueClassName?: string;
}) => (
  <Card className="h-full border-slate-200 shadow-sm">
    <CardHeader className="pb-2 border-b border-slate-100">
      <CardTitle className="text-center text-base font-semibold uppercase text-slate-500">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-6">
      <div className="relative h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => formatCurrencyFull(value) + ' VNĐ'}
              contentStyle={{ borderRadius: '8px', fontSize: '14px', padding: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="text-xs text-slate-400 font-medium uppercase mb-1">{totalLabel}</div>
          <div className="text-2xl font-bold text-slate-800">{totalValue}</div>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-base">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="text-slate-600 font-medium">{entry.name}</span>
            </div>
            <span className={cn(valueClassName, 'text-right tabular-nums')}>
              {formatCurrencyFull(entry.value)} VNĐ
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

interface DonutSectionProps {
  contractData: DonutDataItem[];
  revenueData: DonutDataItem[];
  revenueSourceData: DonutDataItem[];
  contractTotal: number;
  revenueTotal: number;
  revenueSourceTotal: number;
  contractTitle: string;
  revenueTitle: string;
  revenueSourceTitle: string;
  contractsSigned: SignedContractRow[];
  revenuesSigned: SignedContractRow[];
  revenuesFromSignedContracts: SignedContractRow[];
  opportunitySources: OpportunitySourceRow[];
  selectedMonths: number[];
  onSelectedMonthsChange: (months: number[]) => void;
}

const DonutSection: React.FC<DonutSectionProps> = ({
  contractData,
  revenueData,
  revenueSourceData,
  contractTotal,
  revenueTotal,
  revenueSourceTotal,
  contractTitle,
  revenueTitle,
  revenueSourceTitle,
  contractsSigned,
  revenuesSigned,
  revenuesFromSignedContracts,
  opportunitySources,
  selectedMonths,
  onSelectedMonthsChange
}) => {

  const filtered = useMemo(() => {
    if (selectedMonths.length === 0) {
      return { contractData, revenueSourceData, revenueData, contractTotal, revenueSourceTotal, revenueTotal };
    }

    const filterRows = (rows: SignedContractRow[]) =>
      rows.filter((r) => selectedMonths.includes(getMonth(r.contractDate)));

    const parseMonth = (s: string) => parseInt(s.replace(/\D/g, ''), 10);

    const filteredOpportunities = opportunitySources.filter((r) => {
      const m = parseMonth(r.contractMonth);
      return selectedMonths.includes(m);
    });
    const filteredRevenues = filterRows(revenuesSigned);
    const filteredRevenuesFromSigned = filterRows(revenuesFromSignedContracts);

    const sumOppByGroup = (group: string) =>
      filteredOpportunities
        .filter((r) => r.group.toUpperCase() === group)
        .reduce((s, r) => s + r.contractValue, 0);

    const cITO = sumOppByGroup('ITO');
    const cUNI = sumOppByGroup('UNI');
    const cG2B = sumOppByGroup('G2B');
    const cTotal = cITO + cUNI + cG2B;

    // revenueSource: tính từ opportunitySources theo tháng DT thực tế (dt1/dt2/dt3)
    const sumDtByGroup = (group: string) =>
      opportunitySources
        .filter((r) => r.group.toUpperCase() === group)
        .reduce((s, r) => {
          return s +
            (selectedMonths.includes(parseMonth(r.dtMonth1)) ? r.dt1 : 0) +
            (selectedMonths.includes(parseMonth(r.dtMonth2)) ? r.dt2 : 0) +
            (selectedMonths.includes(parseMonth(r.dtMonth3)) ? r.dt3 : 0);
        }, 0);

    const rsITO = sumDtByGroup('ITO');
    const rsUNI = sumDtByGroup('UNI');
    const rsG2B = sumDtByGroup('G2B');
    const rsTotal = rsITO + rsUNI + rsG2B;

    const rSigned = filteredRevenuesFromSigned.reduce((s, r) => s + r.value, 0);
    const rNew = opportunitySources.reduce((s, r) => {
      return s +
        (selectedMonths.includes(parseMonth(r.dtMonth1)) ? r.dt1 : 0) +
        (selectedMonths.includes(parseMonth(r.dtMonth2)) ? r.dt2 : 0) +
        (selectedMonths.includes(parseMonth(r.dtMonth3)) ? r.dt3 : 0);
    }, 0);
    const rTotal = rSigned + rNew;

    return {
      contractData: [
        { name: 'ITO', value: cITO },
        { name: 'UNI', value: cUNI },
        { name: 'G2B', value: cG2B }
      ],
      revenueSourceData: [
        { name: 'ITO', value: rsITO },
        { name: 'UNI', value: rsUNI },
        { name: 'G2B', value: rsG2B }
      ],
      revenueData: [
        { name: 'Từ HĐ đã ký', value: rSigned },
        { name: 'Từ HĐ mới', value: rNew }
      ],
      contractTotal: cTotal,
      revenueSourceTotal: rsTotal,
      revenueTotal: rTotal
    };
  }, [
    selectedMonths,
    contractData, revenueSourceData, revenueData,
    contractTotal, revenueSourceTotal, revenueTotal,
    opportunitySources, revenuesSigned, revenuesFromSignedContracts
  ]);

  return (
    <div className="col-span-1 lg:col-span-3">
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-100 bg-blue-50">
          <div className="flex flex-wrap items-center gap-2">
            <PieChartIcon className="text-blue-600 shrink-0" size={18} />
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-blue-700 mr-1">
              Cơ cấu phân bổ:
            </CardTitle>
            <button
              onClick={() => onSelectedMonthsChange([])}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                selectedMonths.length === 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              Tất cả
            </button>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map((m) => (
              <button
                key={m}
                onClick={() => onSelectedMonthsChange(selectedMonths.includes(m) ? selectedMonths.filter((x) => x !== m) : [...selectedMonths, m])}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  selectedMonths.includes(m)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                T{m}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DonutChartWithLegend
              title={contractTitle}
              data={filtered.contractData}
              colors={COLORS}
              totalLabel="Tổng hợp đồng"
              totalValue={formatInBillions(filtered.contractTotal)}
              valueClassName="font-bold text-slate-800 text-base"
            />
            <DonutChartWithLegend
              title={revenueSourceTitle}
              data={filtered.revenueSourceData}
              colors={COLORS}
              totalLabel="Tổng doanh thu"
              totalValue={formatInBillions(filtered.revenueSourceTotal)}
              valueClassName="font-bold text-slate-800 text-base"
            />
            <DonutChartWithLegend
              title={revenueTitle}
              data={filtered.revenueData}
              colors={REVENUE_COLORS}
              totalLabel="Tổng doanh thu"
              totalValue={formatInBillions(filtered.revenueTotal)}
              valueClassName="font-bold text-slate-800"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonutSection;
