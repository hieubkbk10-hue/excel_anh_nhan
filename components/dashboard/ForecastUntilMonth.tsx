import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatInBillions } from '../../lib/utils';
import GroupForecastChart from './GroupForecastChart';

function parseMonth(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10);
}

interface KPIForecastProps {
  label: string;
  planYear: number;
  actual: number;
  planned: number;
  color: string;
  plannedColor: string;
}

const KPIForecast: React.FC<KPIForecastProps> = ({ label, planYear, actual, planned, color, plannedColor }) => {
  const total = actual + planned;
  const totalPct = planYear > 0 ? (total / planYear) * 100 : 0;
  const scaleBase = Math.max(planYear, total);
  const planBarPct = scaleBase > 0 ? (planYear / scaleBase) * 100 : 100;
  const actualPct = scaleBase > 0 ? (actual / scaleBase) * 100 : 0;
  const plannedPct = scaleBase > 0 ? (planned / scaleBase) * 100 : 0;
  const remainingPct = Math.max(planBarPct - actualPct - plannedPct, 0);
  const badgeBg = totalPct >= 100 ? '#16a34a' : totalPct >= 70 ? color : '#f59e0b';

  return (
    <Card className="flex-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-600">{label}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-extrabold" style={{ color }}>{formatInBillions(total)}</span>
            <span className="text-sm font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: badgeBg }}>
              {totalPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* KH năm bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 w-16 shrink-0">KH năm</span>
          <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex items-center">
            <div className="h-full rounded-lg bg-slate-300 flex items-center px-3 transition-all"
              style={{ width: `${planBarPct}%` }}>
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{formatInBillions(planYear)}</span>
            </div>
          </div>
        </div>
        {/* Dự báo stacked bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 w-16 shrink-0">Dự báo</span>
          <div className="h-7 flex-1 flex rounded-lg overflow-hidden bg-slate-100">
            <div className="h-full flex items-center justify-center text-xs font-bold text-white transition-all"
              style={{ width: `${actualPct}%`, backgroundColor: color, minWidth: actual > 0 ? '2.5rem' : 0 }}>
              {actualPct > 14 ? formatInBillions(actual) : ''}
            </div>
            {plannedPct > 0 && (
              <div className="h-full flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{ width: `${plannedPct}%`, backgroundColor: plannedColor, minWidth: '1.5rem' }}>
                {plannedPct > 12 ? formatInBillions(planned) : ''}
              </div>
            )}
            {remainingPct > 0 && (
              <div className="h-full bg-slate-100 transition-all" style={{ width: `${remainingPct}%` }} />
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex gap-5 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span className="font-medium text-slate-600">Thực tế: <strong>{formatInBillions(actual)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: plannedColor }} />
            <span className="font-medium text-slate-600">Cơ hội: <strong>{formatInBillions(planned)}</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface Props {
  contractPlanYear: number;
  contractActual: number;
  revenuePlanYear: number;
  revenueActual: number;
  opportunitySources: OpportunitySourceRow[];
  selectedMonths: number[];
  onSelectedMonthsChange: (months: number[]) => void;
  contractGroupPlan: Record<string, number>;
  contractGroupActual: Record<string, number>;
  revenueGroupPlan: Record<string, number>;
  revenueGroupActual: Record<string, number>;
}

const ALL_MONTHS = [1,2,3,4,5,6,7,8,9,10,11,12];

const ForecastUntilMonth: React.FC<Props> = ({
  contractPlanYear, contractActual,
  revenuePlanYear, revenueActual,
  opportunitySources,
  selectedMonths,
  onSelectedMonthsChange,
  contractGroupPlan, contractGroupActual,
  revenueGroupPlan, revenueGroupActual,
}) => {
  const toggle = (m: number) => {
    // If m is already the max selected month, deselect all (back to "Tất cả")
    const max = selectedMonths.length > 0 ? Math.max(...selectedMonths) : 0;
    if (max === m) {
      onSelectedMonthsChange([]);
    } else {
      // Select all months from 1 to m
      onSelectedMonthsChange(Array.from({ length: m }, (_, i) => i + 1));
    }
  };

  const computed = useMemo(() => {
    const isAll = selectedMonths.length === 0;
    const inMonth = (m: number) => isAll || selectedMonths.includes(m);

    const contractPlanned = opportunitySources
      .filter(r => inMonth(parseMonth(r.contractMonth)))
      .reduce((s, r) => s + r.contractValue, 0);

    const revenuePlanned = opportunitySources.reduce((s, r) =>
      s +
      (inMonth(parseMonth(r.dtMonth1)) ? r.dt1 : 0) +
      (inMonth(parseMonth(r.dtMonth2)) ? r.dt2 : 0) +
      (inMonth(parseMonth(r.dtMonth3)) ? r.dt3 : 0), 0);

    return { contractPlanned, revenuePlanned };
  }, [selectedMonths, opportunitySources]);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-indigo-100 bg-indigo-50">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-indigo-700 mr-1">
            Kế hoạch cơ hội:
          </CardTitle>
          <button onClick={() => onSelectedMonthsChange([])}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
              selectedMonths.length === 0
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}>
            Tất cả
          </button>
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
            <button key={m} onClick={() => toggle(m)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                selectedMonths.includes(m)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600'
              }`}>
              T{m}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <KPIForecast
            label="Dự Kiến Hợp Đồng"
            planYear={contractPlanYear}
            actual={contractActual}
            planned={computed.contractPlanned}
            color="#3b82f6"
            plannedColor="#818cf8"
          />
          <KPIForecast
            label="Dự Kiến Doanh Thu"
            planYear={revenuePlanYear}
            actual={revenueActual}
            planned={computed.revenuePlanned}
            color="#10b981"
            plannedColor="#34d399"
          />
        </div>
        <GroupForecastChart
          contractGroupPlan={contractGroupPlan}
          contractGroupActual={contractGroupActual}
          revenueGroupPlan={revenueGroupPlan}
          revenueGroupActual={revenueGroupActual}
          opportunitySources={opportunitySources}
          selectedMonths={selectedMonths}
        />
      </CardContent>
    </Card>
  );
};

export default ForecastUntilMonth;
