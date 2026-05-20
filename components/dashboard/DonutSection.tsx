import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatCurrencyFull, formatInBillions } from '../../lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';
import { DonutDataItem, SignedContractRow } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Emerald, Amber
const REVENUE_COLORS = ['#1e293b', '#10b981']; // Slate-800, Emerald-500

const MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

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
  revenuesFromSignedContracts
}) => {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);

  const toggleMonth = (m: number) =>
    setSelectedMonths((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const filtered = useMemo(() => {
    if (selectedMonths.length === 0) {
      return { contractData, revenueSourceData, revenueData, contractTotal, revenueSourceTotal, revenueTotal };
    }

    const filterRows = (rows: SignedContractRow[]) =>
      rows.filter((r) => selectedMonths.includes(getMonth(r.contractDate)));

    const filteredContracts = filterRows(contractsSigned);
    const filteredRevenues = filterRows(revenuesSigned);
    const filteredRevenuesFromSigned = filterRows(revenuesFromSignedContracts);

    const sumByGroup = (rows: SignedContractRow[], group: string) =>
      rows.filter((r) => r.group.toUpperCase() === group).reduce((s, r) => s + r.value, 0);

    const cITO = sumByGroup(filteredContracts, 'ITO');
    const cUNI = sumByGroup(filteredContracts, 'UNI');
    const cG2B = sumByGroup(filteredContracts, 'G2B');
    const cTotal = cITO + cUNI + cG2B;

    const rsITO = sumByGroup(filteredRevenues, 'ITO');
    const rsUNI = sumByGroup(filteredRevenues, 'UNI');
    const rsG2B = sumByGroup(filteredRevenues, 'G2B');
    const rsTotal = rsITO + rsUNI + rsG2B;

    const rSigned = filteredRevenuesFromSigned.reduce((s, r) => s + r.value, 0);
    const rNew = filteredRevenues.reduce((s, r) => s + r.value, 0);
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
    contractsSigned, revenuesSigned, revenuesFromSignedContracts
  ]);

  return (
    <div className="col-span-1 lg:col-span-3">
      <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
        <div className="flex items-center gap-3">
          <PieChartIcon className="text-slate-500" size={24} />
          <h3 className="text-xl font-bold text-slate-800">Cơ cấu phân bổ</h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 ml-2">
          {MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => toggleMonth(m)}
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
                selectedMonths.includes(m)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400 hover:text-blue-600'
              )}
            >
              T{m}
            </button>
          ))}
          {selectedMonths.length > 0 && (
            <button
              onClick={() => setSelectedMonths([])}
              className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-300 bg-white text-slate-400 hover:text-red-500 hover:border-red-400 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
      </div>
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
    </div>
  );
};

export default DonutSection;
