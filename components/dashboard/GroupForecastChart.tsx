import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatInBillions } from '../../lib/utils';

function parseMonth(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10);
}

const GROUPS = ['ITO', 'UNI', 'G2B'] as const;

const GROUP_COLORS: Record<string, string> = {
  ITO: '#3b82f6',
  UNI: '#10b981',
  G2B: '#f59e0b',
};

interface SectionTableProps {
  title: string;
  colors: Record<string, string>;
  headerBg: string;
  groups: typeof GROUPS;
  getPlan: (g: string) => number;
  getActual: (g: string) => number;
  getOpp: (g: string) => number;
  getOppSigned?: (g: string) => number;
  oppLabel?: string;
  oppSignedLabel?: string;
  oppSignedColor?: string;
}

const SectionTable: React.FC<SectionTableProps> = ({
  title, colors, headerBg, groups, getPlan, getActual, getOpp,
  getOppSigned, oppLabel = 'Cơ hội', oppSignedLabel = 'Từ HĐ đã ký', oppSignedColor = '#94a3b8',
}) => {
  const rows = groups.map(g => {
    const plan = getPlan(g);
    const actual = getActual(g);
    const opp = getOpp(g);
    const oppSigned = getOppSigned ? getOppSigned(g) : 0;
    const forecast = actual + opp + oppSigned;
    const scaleBase = Math.max(plan, forecast, 1);
    const vsKH = plan > 0 ? (forecast / plan) * 100 : 0;
    return {
      g, plan, actual, opp, oppSigned, forecast,
      planPct: Math.min((plan / scaleBase) * 100, 100),
      actualPct: Math.min((actual / scaleBase) * 100, 100),
      oppSignedPct: Math.min((oppSigned / scaleBase) * 100, 100),
      oppPct: Math.min((opp / scaleBase) * 100, 100),
      vsKH,
    };
  });

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="py-1.5 px-4 border-b border-slate-200" style={{ backgroundColor: headerBg }}>
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-4">
        <div className="grid grid-cols-3 divide-x divide-slate-100">
          {rows.map(({ g, plan, actual, opp, oppSigned, forecast, planPct, actualPct, oppSignedPct, oppPct, vsKH }) => {
            const color = colors[g] ?? '#3b82f6';
            return (
              <div key={g} className="px-4 space-y-4 first:pl-0 last:pr-0">
                {/* Group name + % KH */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold" style={{ color }}>{g}</span>
                  <span className="text-sm font-bold px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: vsKH >= 100 ? '#16a34a' : vsKH >= 70 ? color : '#f59e0b' }}>
                    {vsKH.toFixed(1)}%
                  </span>
                </div>

                {/* stat boxes */}
                <div className={`grid ${getOppSigned ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5`}>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: `${color}15` }}>
                    <div className="text-[11px] font-medium text-slate-500 mb-1">Thực tế</div>
                    <div className="text-sm font-extrabold" style={{ color }}>{formatInBillions(actual)}</div>
                  </div>
                  <div className="rounded-lg p-2 text-center" style={{ backgroundColor: `${color}20` }}>
                    <div className="text-[11px] font-medium text-slate-500 mb-1">{oppLabel}</div>
                    <div className="text-sm font-extrabold" style={{ color }}>{formatInBillions(opp)}</div>
                  </div>
                  {getOppSigned && (
                    <div className="rounded-lg p-2 text-center" style={{ backgroundColor: `${oppSignedColor}20` }}>
                      <div className="text-[11px] font-medium text-slate-500 mb-1">{oppSignedLabel}</div>
                      <div className="text-sm font-extrabold" style={{ color: oppSignedColor }}>{formatInBillions(oppSigned)}</div>
                    </div>
                  )}
                  <div className="bg-slate-100 rounded-lg p-2 text-center">
                    <div className="text-[11px] font-medium text-slate-500 mb-1">KH năm</div>
                    <div className="text-sm font-extrabold text-slate-600">{formatInBillions(plan)}</div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 w-12 shrink-0">KH năm</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-slate-400 transition-all" style={{ width: `${planPct}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 w-12 shrink-0">Dự báo</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full transition-all" style={{ width: `${actualPct}%`, backgroundColor: color }} />
                      {oppSignedPct > 0 && (
                        <div className="h-full transition-all" style={{ width: `${oppSignedPct}%`, backgroundColor: oppSignedColor }} />
                      )}
                      <div className="h-full transition-all opacity-45" style={{ width: `${oppPct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                </div>

                {/* Forecast total */}
                <div className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{ backgroundColor: `${color}10`, border: `1px solid ${color}30` }}>
                  <span className="text-xs font-semibold text-slate-500">Dự báo</span>
                  <span className="text-lg font-extrabold" style={{ color }}>{formatInBillions(forecast)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

interface Props {
  contractGroupPlan: Record<string, number>;
  contractGroupActual: Record<string, number>;
  revenueGroupPlan: Record<string, number>;
  revenueGroupActual: Record<string, number>;
  revenueInProgressByGroup: Record<string, number>;
  opportunitySources: OpportunitySourceRow[];
  selectedMonths: number[];
  includeDtOpportunity?: boolean;
}

const GroupForecastChart: React.FC<Props> = ({
  contractGroupPlan, contractGroupActual,
  revenueGroupPlan, revenueGroupActual,
  revenueInProgressByGroup,
  opportunitySources, selectedMonths,
  includeDtOpportunity = true,
}) => {
  const oppByGroup = useMemo(() => {
    const result: Record<string, { contract: number; revenue: number }> = {};
    for (const g of GROUPS) {
      const rows = opportunitySources.filter(r => r.group.toUpperCase() === g);
      const contract = rows
        .filter(r => selectedMonths.length === 0 || selectedMonths.includes(parseMonth(r.contractMonth)))
        .reduce((s, r) => s + r.contractValue, 0);
      const revenue = rows.reduce((s, r) => {
        const inDt = (month: string, dt: number) => {
          const m = parseMonth(month);
          return m >= 1 && (selectedMonths.length === 0 || selectedMonths.includes(m)) ? dt : 0;
        };
        return s + inDt(r.dtMonth1, r.dt1) + inDt(r.dtMonth2, r.dt2) + inDt(r.dtMonth3, r.dt3);
      }, 0);
      result[g] = { contract, revenue };
    }
    return result;
  }, [opportunitySources, selectedMonths]);

  return (
    <div className="space-y-4">
      <SectionTable
        title="Dự báo theo nhóm — Hợp đồng"
        colors={GROUP_COLORS}
        headerBg="#eff6ff"
        groups={GROUPS}
        getPlan={g => contractGroupPlan[g] ?? 0}
        getActual={g => contractGroupActual[g] ?? 0}
        getOpp={g => oppByGroup[g].contract}
      />
      <SectionTable
        title="Dự báo theo nhóm — Doanh thu"
        colors={GROUP_COLORS}
        headerBg="#f0fdf4"
        groups={GROUPS}
        getPlan={g => revenueGroupPlan[g] ?? 0}
        getActual={g => revenueGroupActual[g] ?? 0}
        getOpp={g => oppByGroup[g].revenue}
        getOppSigned={g => includeDtOpportunity ? (revenueInProgressByGroup[g] ?? 0) : 0}
        oppLabel="Cơ hội"
        oppSignedLabel="Từ HĐ đã ký"
      />
    </div>
  );
};

export default GroupForecastChart;
