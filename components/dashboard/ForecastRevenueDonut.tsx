import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatCurrencyFull, formatInBillions } from '../../lib/utils';
import { DonutDataItem, OpportunitySourceRow, SignedContractRow } from '../../types';

const REVENUE_COLORS = ['#1e293b', '#10b981'];

function getMonth(contractDate: string): number {
  const parts = contractDate.split('/');
  return parts.length >= 2 ? Number(parts[1]) : 0;
}

interface Props {
  revenueData: DonutDataItem[];
  revenueTotal: number;
  revenuesSigned: SignedContractRow[];
  revenuesFromSignedContracts: SignedContractRow[];
  opportunitySources: OpportunitySourceRow[];
  selectedMonths: number[];
}

const ForecastRevenueDonut: React.FC<Props> = ({
  revenueData,
  revenueTotal,
  revenuesSigned,
  revenuesFromSignedContracts,
  opportunitySources,
  selectedMonths
}) => {
  const filtered = useMemo(() => {
    if (selectedMonths.length === 0) return { data: revenueData, total: revenueTotal };

    const filterRows = (rows: SignedContractRow[]) =>
      rows.filter((r) => selectedMonths.includes(getMonth(r.contractDate)));

    const parseMonth = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
    const filteredRevenuesFromSigned = filterRows(revenuesFromSignedContracts);

    const rSigned = filteredRevenuesFromSigned.reduce((s, r) => s + r.value, 0);
    const rNew = opportunitySources.reduce((s, r) => {
      return s +
        (selectedMonths.includes(parseMonth(r.dtMonth1)) ? r.dt1 : 0) +
        (selectedMonths.includes(parseMonth(r.dtMonth2)) ? r.dt2 : 0) +
        (selectedMonths.includes(parseMonth(r.dtMonth3)) ? r.dt3 : 0);
    }, 0);

    return {
      data: [
        { name: 'Từ HĐ đã ký', value: rSigned },
        { name: 'Từ HĐ mới', value: rNew }
      ],
      total: rSigned + rNew
    };
  }, [selectedMonths, revenueData, revenueTotal, revenuesFromSignedContracts, opportunitySources]);

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-2 border-b border-slate-100">
        <CardTitle className="text-center text-base font-semibold uppercase text-slate-500">
          Dự báo doanh thu
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filtered.data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {filtered.data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={REVENUE_COLORS[index % REVENUE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrencyFull(value) + ' VNĐ'}
                contentStyle={{ borderRadius: '8px', fontSize: '14px', padding: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-xs text-slate-400 font-medium uppercase mb-1">Tổng doanh thu</div>
            <div className="text-2xl font-bold text-slate-800">{formatInBillions(filtered.total)}</div>
          </div>
        </div>
        <div className="mt-8 space-y-4">
          {filtered.data.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-base">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: REVENUE_COLORS[index % REVENUE_COLORS.length] }} />
                <span className="text-slate-600 font-medium">{entry.name}</span>
              </div>
              <span className={cn('font-bold text-slate-800 text-right tabular-nums')}>
                {formatCurrencyFull(entry.value)} VNĐ
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastRevenueDonut;
