import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatInBillions } from '../../lib/utils';
import GroupForecastChart from './GroupForecastChart';

function parseMonth(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10);
}

/** Trích số mức độ từ priority dạng "Mức 1: ..." */
function parseLevel(priority: string): number | null {
  const match = priority.match(/Mức\s*(\d)/);
  return match ? Number(match[1]) : null;
}

interface KPIForecastProps {
  label: string;
  planYear: number;
  actual: number;
  planned: number;
  color: string;
  plannedColor: string;
  signed?: number;
  signedLabel?: string;
  signedColor?: string;
  plannedLabel?: string;
}

const KPIForecast: React.FC<KPIForecastProps> = ({
  label, planYear, actual, planned, color, plannedColor,
  signed = 0, signedLabel = 'Từ HĐ đã ký', signedColor = '#64748b', plannedLabel = 'Cơ hội',
}) => {
  const total = actual + signed + planned;
  const totalPct = planYear > 0 ? (total / planYear) * 100 : 0;
  const scaleBase = Math.max(planYear, total);
  const planBarPct = scaleBase > 0 ? (planYear / scaleBase) * 100 : 100;
  const actualPct = scaleBase > 0 ? (actual / scaleBase) * 100 : 0;
  const signedPct = scaleBase > 0 ? (signed / scaleBase) * 100 : 0;
  const plannedPct = scaleBase > 0 ? (planned / scaleBase) * 100 : 0;
  const remainingPct = Math.max(planBarPct - actualPct - signedPct - plannedPct, 0);
  const badgeBg = totalPct >= 100 ? '#16a34a' : totalPct >= 70 ? color : '#f59e0b';

  return (
    <Card className="flex-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-bold uppercase tracking-wide text-slate-600">{label}</CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-4xl font-extrabold" style={{ color }}>{formatInBillions(total)}</span>
            <span className="text-2xl font-bold px-4 py-1.5 rounded-full text-white"
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
            {signedPct > 0 && (
              <div className="h-full flex items-center justify-center text-xs font-bold text-white transition-all"
                style={{ width: `${signedPct}%`, backgroundColor: signedColor, minWidth: '1.5rem' }}>
                {signedPct > 12 ? formatInBillions(signed) : ''}
              </div>
            )}
            {remainingPct > 0 && (
              <div className="h-full bg-slate-100 transition-all" style={{ width: `${remainingPct}%` }} />
            )}
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-5 pt-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span className="font-medium text-slate-600">Thực tế: <strong>{formatInBillions(actual)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: plannedColor }} />
            <span className="font-medium text-slate-600">{plannedLabel}: <strong>{formatInBillions(planned)}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: signedColor }} />
            <span className="font-medium text-slate-600">{signedLabel}: <strong>{formatInBillions(signed)}</strong></span>
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
  revenueInProgress: number;
  revenueInProgressByGroup: Record<string, number>;
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
  revenueInProgress, revenueInProgressByGroup,
}) => {
  // Bộ lọc MỨC ĐỘ (mặc định check sẵn 3 mức)
  const [selectedLevels, setSelectedLevels] = useState<number[]>([1, 2, 3]);

  const levels = useMemo(
    () =>
      Array.from(new Set(opportunitySources.map((r) => parseLevel(r.priority)).filter((n): n is number => n !== null))).sort((a, b) => a - b),
    [opportunitySources]
  );

  const matchesLevel = (priority: string) => {
    const level = parseLevel(priority);
    return level !== null && selectedLevels.includes(level);
  };

  const filteredOpportunities = useMemo(
    () => opportunitySources.filter((r) => matchesLevel(r.priority)),
    [opportunitySources, selectedLevels]
  );

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

    const contractPlanned = filteredOpportunities
      .filter(r => inMonth(parseMonth(r.contractMonth)))
      .reduce((s, r) => s + r.contractValue, 0);

    const revenuePlanned = filteredOpportunities.reduce((s, r) => {
      const inDt = (month: string, dt: number) => {
        const m = parseMonth(month);
        return m >= 1 && inMonth(m) ? dt : 0;
      };
      return s + inDt(r.dtMonth1, r.dt1) + inDt(r.dtMonth2, r.dt2) + inDt(r.dtMonth3, r.dt3);
    }, 0);

    return { contractPlanned, revenuePlanned };
  }, [selectedMonths, selectedLevels, filteredOpportunities]);

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
          <div className="flex items-center gap-1 ml-2 border-l border-indigo-200 pl-3">
            <span className="text-xs font-bold uppercase text-indigo-700 mr-1">Mức độ:</span>
            {levels.map((level) => (
              <label
                key={level}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer transition-colors bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600"
              >
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(level)}
                  onChange={() =>
                    setSelectedLevels((prev) =>
                      prev.includes(level) ? prev.filter((x) => x !== level) : [...prev, level]
                    )
                  }
                  className="h-3.5 w-3.5 accent-indigo-600"
                />
                Mức {level}
              </label>
            ))}
          </div>
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
            plannedColor="#60a5fa"
          />
          <KPIForecast
            label="Dự Kiến Doanh Thu"
            planYear={revenuePlanYear}
            actual={revenueActual}
            planned={computed.revenuePlanned}
            signed={selectedLevels.includes(1) ? revenueInProgress : 0}
            plannedLabel="Cơ hội"
            signedLabel="Từ HĐ đã ký"
            color="#10b981"
            plannedColor="#34d399"
          />
        </div>
        <GroupForecastChart
          contractGroupPlan={contractGroupPlan}
          contractGroupActual={contractGroupActual}
          revenueGroupPlan={revenueGroupPlan}
          revenueGroupActual={revenueGroupActual}
          revenueInProgressByGroup={revenueInProgressByGroup}
          opportunitySources={filteredOpportunities}
          selectedMonths={selectedMonths}
          includeDtOpportunity={selectedLevels.includes(1)}
        />
      </CardContent>
    </Card>
  );
};

export default ForecastUntilMonth;
