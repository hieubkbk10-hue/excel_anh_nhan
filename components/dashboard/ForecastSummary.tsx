import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow, SignedContractRow } from '../../types';
import { formatInBillions } from '../../lib/utils';

function getContractMonth(contractDate: string): number {
  const parts = contractDate.split('/');
  return parts.length >= 2 ? Number(parts[1]) : 0;
}
function parseMonth(s: string): number {
  return parseInt(s.replace(/\D/g, ''), 10);
}

interface KPIBarProps {
  label: string;
  plan: number;
  actual: number;
  forecast: number;
  color: string;
  forecastColor: string;
}

const KPIBar: React.FC<KPIBarProps> = ({ label, plan, actual, forecast, color, forecastColor }) => {
  const actualPct = plan > 0 ? Math.min((actual / plan) * 100, 100) : 0;
  const forecastExtra = Math.max(forecast - actual, 0);
  const forecastExtraPct = plan > 0 ? Math.min((forecastExtra / plan) * 100, 100 - actualPct) : 0;
  const remainingPct = Math.max(100 - actualPct - forecastExtraPct, 0);

  return (
    <Card className="flex-1 border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold uppercase text-slate-500">{label}</CardTitle>
          <div className="flex gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
              TT {(plan > 0 ? (actual / plan) * 100 : 0).toFixed(1)}%
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${forecastColor}20`, color: forecastColor }}>
              Ước {(plan > 0 ? (forecast / plan) * 100 : 0).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">Kế hoạch: {formatInBillions(plan)}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="h-8 w-full flex rounded-md overflow-hidden">
          <div className="h-full flex items-center justify-center text-xs font-semibold text-white transition-all"
            style={{ width: `${actualPct}%`, backgroundColor: color, minWidth: actual > 0 ? '2rem' : 0 }}>
            {actualPct > 12 ? formatInBillions(actual) : ''}
          </div>
          {forecastExtraPct > 0 && (
            <div className="h-full flex items-center justify-center text-xs font-semibold text-white transition-all"
              style={{ width: `${forecastExtraPct}%`, backgroundColor: forecastColor, minWidth: '1rem' }}>
              {forecastExtraPct > 10 ? formatInBillions(forecastExtra) : ''}
            </div>
          )}
          {remainingPct > 0 && (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-slate-100 transition-all"
              style={{ width: `${remainingPct}%` }}>
              {remainingPct > 12 ? formatInBillions(Math.max(plan - forecast, 0)) : ''}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: color }} />
            <span className="text-slate-600">Thực tế: <strong>{formatInBillions(actual)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: forecastColor }} />
            <span className="text-slate-600">Ước: <strong>{formatInBillions(forecast)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-slate-200" />
            <span className="text-slate-500">Còn lại: <strong>{formatInBillions(Math.max(plan - forecast, 0))}</strong></span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

interface Props {
  contractPlan: number;
  revenuePlan: number;
  contractActualDefault: number;
  contractForecastDefault: number;
  revenueActualDefault: number;
  revenueForecastDefault: number;
  contractsSigned: SignedContractRow[];
  revenuesFromSignedContracts: SignedContractRow[];
  opportunitySources: OpportunitySourceRow[];
  selectedMonths: number[];
  onSelectedMonthsChange: (months: number[]) => void;
}

const ForecastSummary: React.FC<Props> = ({
  contractPlan, revenuePlan,
  contractActualDefault, contractForecastDefault,
  revenueActualDefault, revenueForecastDefault,
  contractsSigned, revenuesFromSignedContracts, opportunitySources,
  selectedMonths, onSelectedMonthsChange,
}) => {
  const computed = useMemo(() => {
    if (selectedMonths.length === 0) {
      return {
        contractActual: contractActualDefault,
        contractForecast: contractForecastDefault,
        revenueActual: revenueActualDefault,
        revenueForecast: revenueForecastDefault,
      };
    }
    const filterByContractDate = (rows: SignedContractRow[]) =>
      rows.filter(r => selectedMonths.includes(getContractMonth(r.contractDate)));
    const filteredContracts = filterByContractDate(contractsSigned);
    const filteredRevenues = filterByContractDate(revenuesFromSignedContracts);
    const contractActual = filteredContracts.reduce((s, r) => s + r.value, 0);
    const revenueActual = filteredRevenues.reduce((s, r) => s + r.value, 0);
    const contractForecast = opportunitySources
      .filter(r => selectedMonths.includes(parseMonth(r.contractMonth)))
      .reduce((s, r) => s + r.contractValue, 0);
    const revenueForecast = opportunitySources.reduce((s, r) =>
      s +
      (selectedMonths.includes(parseMonth(r.dtMonth1)) ? r.dt1 : 0) +
      (selectedMonths.includes(parseMonth(r.dtMonth2)) ? r.dt2 : 0) +
      (selectedMonths.includes(parseMonth(r.dtMonth3)) ? r.dt3 : 0), 0);
    return { contractActual, contractForecast, revenueActual, revenueForecast };
  }, [selectedMonths, contractsSigned, revenuesFromSignedContracts, opportunitySources,
      contractActualDefault, contractForecastDefault, revenueActualDefault, revenueForecastDefault]);

  return (
    <div className="space-y-4">
      {/* Month filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => onSelectedMonthsChange([])}
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${selectedMonths.length === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400 hover:text-blue-600'}`}>
          Tất cả
        </button>
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
          <button key={m}
            onClick={() => onSelectedMonthsChange(selectedMonths.includes(m) ? selectedMonths.filter(x => x !== m) : [...selectedMonths, m])}
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors ${selectedMonths.includes(m) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-300 hover:border-blue-400 hover:text-blue-600'}`}>
            T{m}
          </button>
        ))}
      </div>
      {/* KPI tổng */}
      <div className="flex flex-col md:flex-row gap-4">
        <KPIBar label="Hợp đồng" plan={contractPlan}
          actual={computed.contractActual} forecast={computed.contractForecast}
          color="#3b82f6" forecastColor="#818cf8" />
        <KPIBar label="Doanh thu" plan={revenuePlan}
          actual={computed.revenueActual} forecast={computed.revenueForecast}
          color="#10b981" forecastColor="#34d399" />
      </div>
    </div>
  );
};

export default ForecastSummary;
