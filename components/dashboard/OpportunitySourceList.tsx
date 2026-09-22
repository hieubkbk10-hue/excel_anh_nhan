import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatCurrencyFull, sortGroups } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface OpportunitySourceListProps {
  rows: OpportunitySourceRow[];
  title: string;
  filterMonths?: number[];
  hideColumns?: ColumnKey[];
  filterByContractMonth?: boolean;
}

type ColumnKey =
  | 'group'
  | 'customer'
  | 'type'
  | 'project'
  | 'priority'
  | 'contractMonth'
  | 'contractValue'
  | 'note'
  | 'highlight'
  | 'revenueValue';
type SortDirection = 'asc' | 'desc';
type FilterKey = Exclude<ColumnKey, 'group' | 'type' | 'priority' | 'contractMonth' | 'note' | 'highlight'>;

const columnLabels: Record<ColumnKey, string> = {
  group: 'NHÓM',
  customer: 'KHÁCH HÀNG',
  type: 'LOẠI',
  project: 'CƠ HỘI/DỰ ÁN',
  priority: 'MỨC ĐỘ',
  contractMonth: 'THÁNG HĐ',
  contractValue: 'GIÁ TRỊ HĐ',
  note: 'GHI CHÚ',
  highlight: '#',
  revenueValue: 'GIÁ TRỊ DT'
};

const OpportunitySourceList: React.FC<OpportunitySourceListProps> = ({ rows, title, filterMonths, hideColumns = [], filterByContractMonth = false }) => {
  const visibleColumns = (Object.keys(columnLabels) as ColumnKey[]).filter((k) => !hideColumns.includes(k));
  const baseRows = useMemo(() => {
    if (!filterMonths || filterMonths.length === 0) return rows;
    const parseMonth = (s: string) => parseInt(s.replace(/\D/g, ''), 10);
    if (filterByContractMonth) {
      return rows.filter((row) => filterMonths.includes(parseMonth(row.contractMonth)));
    }
    return rows
      .map((row) => {
        const rv =
          (filterMonths.includes(parseMonth(row.dtMonth1)) ? row.dt1 : 0) +
          (filterMonths.includes(parseMonth(row.dtMonth2)) ? row.dt2 : 0) +
          (filterMonths.includes(parseMonth(row.dtMonth3)) ? row.dt3 : 0);
        return { ...row, revenueValue: rv };
      })
      .filter((row) => row.revenueValue > 0);
  }, [rows, filterMonths, filterByContractMonth]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('khohoi_notes_v1') || '{}') as Record<string, string>;
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('khohoi_notes_v1', JSON.stringify(notes));
    } catch {
      // ignore
    }
  }, [notes]);
  const [highlights, setHighlights] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('khohoi_highlight_v1') || '{}') as Record<string, boolean>;
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('khohoi_highlight_v1', JSON.stringify(highlights));
    } catch {
      // ignore
    }
  }, [highlights]);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedContractMonth, setSelectedContractMonth] = useState('all');
  const [selectedHighlight, setSelectedHighlight] = useState<'all' | 'highlighted'>('all');
  const [sortState, setSortState] = useState<{ key: ColumnKey; direction: SortDirection } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<FilterKey, string>>({
    customer: '',
    project: '',
    contractValue: '',
    revenueValue: ''
  });

  const groupOptions = useMemo(() => {
    const groups = Array.from(new Set(baseRows.map((row) => row.group).filter(Boolean))) as string[];
    return groups.sort((a, b) => sortGroups(a, b));
  }, [baseRows]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(baseRows.map((row) => row.type).filter(Boolean))) as string[];
    return types.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [baseRows]);

  const priorityOptions = useMemo(() => {
    const priorities = Array.from(new Set(baseRows.map((row) => row.priority).filter(Boolean))) as string[];
    return priorities.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [baseRows]);

  const contractMonthOptions = useMemo(() => {
    const months = Array.from(new Set(baseRows.map((row) => row.contractMonth).filter(Boolean))) as string[];
    return months.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [baseRows]);

  const filteredRows = useMemo(() => {
    const preFiltered = baseRows.filter((row) => {
      if (selectedGroup !== 'all' && row.group !== selectedGroup) return false;
      if (selectedType !== 'all' && row.type !== selectedType) return false;
      if (selectedPriority !== 'all' && row.priority !== selectedPriority) return false;
      if (selectedContractMonth !== 'all' && row.contractMonth !== selectedContractMonth) return false;
      if (selectedHighlight === 'highlighted' && !highlights[row.project]) return false;
      return true;
    });

    return preFiltered.filter((row) => {
      return (Object.keys(columnFilters) as FilterKey[]).every((key) => {
        const query = columnFilters[key].trim().toLowerCase();
        if (!query) return true;
        if (key === 'contractValue' || key === 'revenueValue') {
          return String(row[key]).toLowerCase().includes(query);
        }
        return String(row[key] ?? '').toLowerCase().includes(query);
      });
    });
  }, [baseRows, selectedGroup, selectedType, selectedPriority, selectedContractMonth, selectedHighlight, highlights, columnFilters]);

  const sortedRows = useMemo(() => {
    if (!sortState) return filteredRows;
    const { key, direction } = sortState;
    const sorted = [...filteredRows].sort((a, b) => {
      if (key === 'contractValue' || key === 'revenueValue') {
        return a[key] - b[key];
      }
      return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'vi-VN');
    });
    return direction === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sortState]);

  const summaryItems = useMemo(() => {
    const summaryMap = new Map<string, { count: number; totalContract: number; totalRevenue: number }>();
    for (const row of sortedRows) {
      const group = row.group || 'Khác';
      const current = summaryMap.get(group) ?? { count: 0, totalContract: 0, totalRevenue: 0 };
      current.count += 1;
      current.totalContract += row.contractValue;
      current.totalRevenue += row.revenueValue;
      summaryMap.set(group, current);
    }
    return Array.from(summaryMap.entries()).map(([group, data]) => ({
      group,
      count: data.count,
      totalContract: data.totalContract,
      totalRevenue: data.totalRevenue
    })).sort((a, b) => sortGroups(a.group, b.group));
  }, [sortedRows]);

  const handleFilterChange = (key: FilterKey, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSort = (key: ColumnKey) => {
    if (key === 'note' || key === 'highlight') return;
    setSortState((prev) => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const getSortIndicator = (key: ColumnKey) => {
    if (!sortState || sortState.key !== key) return '';
    return sortState.direction === 'asc' ? '▲' : '▼';
  };

  const renderFilterCell = (key: ColumnKey) => {
    if (key === 'group') {
      return (
        <select
          value={selectedGroup}
          onChange={(event) => setSelectedGroup(event.target.value)}
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">Tất cả</option>
          {groupOptions.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      );
    }
    if (key === 'type') {
      return (
        <select
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">Tất cả</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      );
    }
    if (key === 'priority') {
      return (
        <select
          value={selectedPriority}
          onChange={(event) => setSelectedPriority(event.target.value)}
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">Tất cả</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      );
    }
    if (key === 'contractMonth') {
      return (
        <select
          value={selectedContractMonth}
          onChange={(event) => setSelectedContractMonth(event.target.value)}
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">Tất cả</option>
          {contractMonthOptions.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      );
    }

    if (key === 'highlight') {
      return (
        <select
          value={selectedHighlight}
          onChange={(event) => setSelectedHighlight(event.target.value as 'all' | 'highlighted')}
          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
        >
          <option value="all">Tất cả</option>
          <option value="highlighted">Nổi bật</option>
        </select>
      );
    }
    if (key === 'note') return null;

    return (
      <input
        value={columnFilters[key as FilterKey]}
        onChange={(event) => handleFilterChange(key as FilterKey, event.target.value)}
        placeholder={`Tìm ${columnLabels[key].toLowerCase()}`}
        className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
    );
  };

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200">
      <CardHeader
        className="pb-4 border-b border-slate-100 bg-slate-50/40 cursor-pointer"
        onClick={() => setIsCollapsed((prev) => !prev)}
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
            {summaryItems.map((item) => (
              <div key={item.group} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{item.group}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Số cơ hội <strong className="font-bold text-slate-700">{item.count}</strong>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Tổng <strong className="font-bold text-blue-600">{formatCurrencyFull(item.totalContract)}</strong>
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200">
            <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {visibleColumns.map((key) => (
                    <th
                      key={key}
                      className={`px-4 py-1.5 text-left font-semibold whitespace-nowrap ${
                        key === 'contractValue' || key === 'revenueValue' ? 'text-right' : ''
                      } ${
                        key === 'group'
                          ? 'w-16'
: key === 'type'
                              ? 'w-14'
                            : key === 'priority'
                              ? 'w-20'
                              : key === 'contractMonth'
                                ? 'w-16'
                                : key === 'contractValue'
                                  ? 'w-28'
                                  : key === 'note'
                                    ? 'w-20'
                                    : key === 'highlight'
                                      ? 'w-16'
                                      : key === 'revenueValue'
                                        ? 'w-28'
                                : key === 'customer'
                                  ? 'w-44'
                                  : key === 'project'
                                    ? 'w-56'
                                    : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {columnLabels[key]}
                        <span className="text-xs text-slate-400">{getSortIndicator(key)}</span>
                      </button>
                    </th>
                  ))}
                </tr>
                <tr className="bg-white">
                  {visibleColumns.map((key) => (
                    <th key={`filter-${key}`} className="px-4 py-2">
                      {renderFilterCell(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRows.map((row, index) => (
                  <tr key={`${row.project}-${index}`} className={highlights[row.project] ? '[&_td]:!text-red-600 hover:bg-slate-100' : 'hover:bg-slate-50/60'}>
                    <td className="px-4 py-0.5 font-medium text-slate-700 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-48">
                      {row.customer}
                    </td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.type}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-56">
                      {row.project}
                    </td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.priority}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.contractMonth}</td>
                    {!hideColumns.includes('contractValue') && (
                      <td className="px-4 py-0.5 text-right font-semibold text-blue-600 whitespace-nowrap">
                        {formatCurrencyFull(row.contractValue)}
                      </td>
                    )}
                    {!hideColumns.includes('note') && (
                      <td className="px-2 py-0.5">
                        <textarea
                          value={notes[row.project] ?? ''}
                          onChange={(e) => setNotes((prev) => ({ ...prev, [row.project]: e.target.value }))}
                          rows={1}
                          className="w-full resize-y rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      </td>
                    )}
                    {!hideColumns.includes('highlight') && (
                      <td className="px-2 py-0.5 text-center">
                        <input
                          type="checkbox"
                          checked={!!highlights[row.project]}
                          onChange={(e) => setHighlights((prev) => ({ ...prev, [row.project]: e.target.checked }))}
                          className="h-4 w-4 cursor-pointer accent-red-600"
                        />
                      </td>
                    )}
                    {!hideColumns.includes('revenueValue') && (
                      <td className="px-4 py-0.5 text-right font-semibold text-emerald-600 whitespace-nowrap">
                        {formatCurrencyFull(row.revenueValue)}
                      </td>
                    )}
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

export default OpportunitySourceList;

