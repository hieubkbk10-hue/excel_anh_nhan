import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatCurrencyFull, sortGroups } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface RevenueRow {
  group: string;
  customer: string;
  type: string;
  project: string;
  priority: string;
  dtMonth: string;
  dtValue: number;
  note: string;
  sourceKey: string;
}

type ColKey = keyof RevenueRow | 'highlight';
type SortDir = 'asc' | 'desc';

function expandRows(rows: OpportunitySourceRow[], filterMonths?: number[]): RevenueRow[] {
  const parseMonth = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
  const result: RevenueRow[] = [];
  rows.forEach((row, i) => {
    const sourceKey = String(i);
    const lanes: { value: number; month: string; note: string }[] = [
      { value: row.dt1, month: row.dtMonth1, note: 'DT Lần 1' },
      { value: row.dt2, month: row.dtMonth2, note: 'DT Lần 2' },
      { value: row.dt3, month: row.dtMonth3, note: 'DT Lần 3' },
    ];
    for (const lane of lanes) {
      if (lane.value <= 0) continue;
      const m = parseMonth(lane.month);
      if (!m || isNaN(m)) continue;
      if (filterMonths && filterMonths.length > 0 && !filterMonths.includes(m)) continue;
      result.push({
        group: row.group, customer: row.customer, type: row.type,
        project: row.project, priority: row.priority,
        dtMonth: lane.month || '-', dtValue: lane.value, note: lane.note,
        sourceKey,
      });
    }
  });
  return result;
}

interface Props {
  rows: OpportunitySourceRow[];
  title: string;
  filterMonths?: number[];
}

const OpportunityRevenueList: React.FC<Props> = ({ rows, title, filterMonths }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [highlights, setHighlights] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('khohoi_highlight_revenue_v1') || '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('khohoi_highlight_revenue_v1', JSON.stringify(highlights));
    } catch {
      // ignore
    }
  }, [highlights]);
  const [selectedHighlight, setSelectedHighlight] = useState<'all' | 'highlighted'>('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedDtMonth, setSelectedDtMonth] = useState('all');
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterDtValue, setFilterDtValue] = useState('');
  const [sortState, setSortState] = useState<{ key: ColKey; dir: SortDir } | null>(null);

  const baseRows = useMemo(() => expandRows(rows, filterMonths), [rows, filterMonths]);

  const uniq = (arr: string[]) => Array.from(new Set(arr)).sort((a,b) => a.localeCompare(b,'vi-VN'));
  const groupOptions = useMemo(() => uniq(baseRows.map(r => r.group).filter((s): s is string => !!s)).sort((a,b) => sortGroups(a,b)), [baseRows]);
  const typeOptions = useMemo(() => uniq(baseRows.map(r => r.type).filter((s): s is string => !!s)), [baseRows]);
  const priorityOptions = useMemo(() => uniq(baseRows.map(r => r.priority).filter((s): s is string => !!s)), [baseRows]);
  const dtMonthOptions = useMemo(() => uniq(baseRows.map(r => r.dtMonth).filter((s): s is string => !!s && s !== '-')), [baseRows]);

  const filteredRows = useMemo(() => baseRows.filter(row => {
    if (selectedGroup !== 'all' && row.group !== selectedGroup) return false;
    if (selectedType !== 'all' && row.type !== selectedType) return false;
    if (selectedPriority !== 'all' && row.priority !== selectedPriority) return false;
    if (selectedDtMonth !== 'all' && row.dtMonth !== selectedDtMonth) return false;
    if (filterCustomer && !row.customer.toLowerCase().includes(filterCustomer.toLowerCase())) return false;
    if (filterProject && !row.project.toLowerCase().includes(filterProject.toLowerCase())) return false;
    if (filterDtValue && !String(row.dtValue).includes(filterDtValue)) return false;
    if (selectedHighlight === 'highlighted' && !highlights[row.sourceKey]) return false;
    return true;
  }), [baseRows, selectedGroup, selectedType, selectedPriority, selectedDtMonth, filterCustomer, filterProject, filterDtValue, selectedHighlight, highlights]);

  const sortedRows = useMemo(() => {
    if (!sortState) return filteredRows;
    const { key, dir } = sortState;
    const sorted = [...filteredRows].sort((a, b) =>
      key === 'dtValue' ? a.dtValue - b.dtValue : String(a[key]).localeCompare(String(b[key]), 'vi-VN')
    );
    return dir === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sortState]);

  const summaryItems = useMemo(() => {
    const map = new Map<string, { total: number; seen: Set<string> }>();
    for (const row of sortedRows) {
      const item = map.get(row.group) ?? { total: 0, seen: new Set<string>() };
      item.total += row.dtValue;
      item.seen.add(row.sourceKey);
      map.set(row.group, item);
    }
    return Array.from(map.entries()).map(([group, { total, seen }]) => ({ group, total, count: seen.size }))
      .sort((a, b) => sortGroups(a.group, b.group));
  }, [sortedRows]);

  const toggleSort = (key: ColKey) => {
    if (key === 'highlight') return;
    setSortState(prev =>
      !prev || prev.key !== key ? { key, dir: 'asc' }
      : prev.dir === 'asc' ? { key, dir: 'desc' } : null
    );
  };

  const sortIcon = (key: ColKey) =>
    sortState?.key === key ? (sortState.dir === 'asc' ? ' ▲' : ' ▼') : '';

  const selectCls = 'h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200';
  const inputCls = 'h-8 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200';

  const cols: { key: ColKey; label: string; cls: string; align?: string }[] = [
    { key: 'group',    label: 'NHÓM',         cls: 'w-16' },
    { key: 'customer', label: 'KHÁCH HÀNG',   cls: 'w-44' },
    { key: 'type',     label: 'LOẠI',          cls: 'w-20' },
    { key: 'project',  label: 'CƠ HỘI/DỰ ÁN', cls: 'w-56' },
    { key: 'priority', label: 'MỨC ĐỘ',       cls: 'w-20' },
    { key: 'dtMonth',  label: 'THÁNG DT',      cls: 'w-16' },
    { key: 'dtValue',  label: 'GIÁ TRỊ DT',   cls: 'w-28', align: 'text-right' },
    { key: 'note',     label: 'GHI CHÚ',       cls: 'w-16' },
    { key: 'highlight', label: '#',             cls: 'w-16' },
  ];

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200">
      <CardHeader
        className="pb-4 border-b border-slate-100 bg-slate-50/40 cursor-pointer"
        onClick={() => setIsCollapsed(p => !p)}
      >
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold uppercase text-slate-700">{title}</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100">
            <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-6 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {summaryItems.map(item => (
              <div key={item.group} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{item.group}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Số cơ hội <strong className="font-bold text-slate-700">{item.count}</strong>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Tổng <strong className="font-bold text-emerald-600">{formatCurrencyFull(item.total)}</strong>
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200">
            <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {cols.map(col => (
                    <th key={col.key} className={`px-4 py-1.5 text-left font-semibold whitespace-nowrap ${col.cls} ${col.align ?? ''}`}>
                      <button type="button" onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900">
                        {col.label}<span className="text-xs text-slate-400">{sortIcon(col.key)}</span>
                      </button>
                    </th>
                  ))}
                </tr>
                <tr className="bg-white">
                  <th className="px-4 py-2">
                    <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className={selectCls}>
                      <option value="all">Tất cả</option>
                      {groupOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <input value={filterCustomer} onChange={e => setFilterCustomer(e.target.value)} placeholder="Tìm khách hàng" className={inputCls} />
                  </th>
                  <th className="px-4 py-2">
                    <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className={selectCls}>
                      <option value="all">Tất cả</option>
                      {typeOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <input value={filterProject} onChange={e => setFilterProject(e.target.value)} placeholder="Tìm dự án" className={inputCls} />
                  </th>
                  <th className="px-4 py-2">
                    <select value={selectedPriority} onChange={e => setSelectedPriority(e.target.value)} className={selectCls}>
                      <option value="all">Tất cả</option>
                      {priorityOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <select value={selectedDtMonth} onChange={e => setSelectedDtMonth(e.target.value)} className={selectCls}>
                      <option value="all">Tất cả</option>
                      {dtMonthOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </th>
                  <th className="px-4 py-2">
                    <input value={filterDtValue} onChange={e => setFilterDtValue(e.target.value)} placeholder="Tìm giá trị" className={inputCls} />
                  </th>
                  <th className="px-4 py-2" />
                  <th className="px-4 py-2">
                    <select value={selectedHighlight} onChange={e => setSelectedHighlight(e.target.value as 'all' | 'highlighted')} className={selectCls}>
                      <option value="all">Tất cả</option>
                      <option value="highlighted">Nổi bật</option>
                    </select>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRows.map((row, i) => (
                  <tr key={i} className={highlights[row.sourceKey] ? '[&_td]:!text-red-600 hover:bg-slate-100' : 'hover:bg-slate-50/60'}>
                    <td className="px-4 py-0.5 font-medium text-slate-700 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-48">{row.customer}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.type}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-56">{row.project}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.priority}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.dtMonth}</td>
                    <td className="px-4 py-0.5 text-right font-semibold text-emerald-600 whitespace-nowrap">{formatCurrencyFull(row.dtValue)}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-400 whitespace-nowrap">{row.note}</td>
                    <td className="px-2 py-0.5 text-center">
                      <input
                        type="checkbox"
                        checked={!!highlights[row.sourceKey]}
                        onChange={e => setHighlights(prev => ({ ...prev, [row.sourceKey]: e.target.checked }))}
                        className="h-4 w-4 cursor-pointer accent-red-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center pt-1">
            <button type="button" onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1 px-3 py-0.5 rounded-full border border-slate-200 text-[11px] text-slate-400 hover:bg-slate-100 transition-colors">
              <ChevronDown className="h-3 w-3 rotate-180" />
              Thu gọn
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default OpportunityRevenueList;
