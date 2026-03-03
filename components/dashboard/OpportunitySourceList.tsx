import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { OpportunitySourceRow } from '../../types';
import { formatCurrencyFull } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

interface OpportunitySourceListProps {
  rows: OpportunitySourceRow[];
  title: string;
}

type ColumnKey =
  | 'group'
  | 'customer'
  | 'type'
  | 'project'
  | 'priority'
  | 'contractMonth'
  | 'contractValue'
  | 'revenueValue';
type SortDirection = 'asc' | 'desc';
type FilterKey = Exclude<ColumnKey, 'group' | 'type' | 'priority'>;

const columnLabels: Record<ColumnKey, string> = {
  group: 'NHÓM',
  customer: 'KHÁCH HÀNG',
  type: 'LOẠI',
  project: 'CƠ HỘI/DỰ ÁN',
  priority: 'MỨC ĐỘ',
  contractMonth: 'THÁNG HĐ',
  contractValue: 'GIÁ TRỊ HĐ',
  revenueValue: 'GIÁ TRỊ DT'
};

const OpportunitySourceList: React.FC<OpportunitySourceListProps> = ({ rows, title }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [sortState, setSortState] = useState<{ key: ColumnKey; direction: SortDirection } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<FilterKey, string>>({
    customer: '',
    project: '',
    contractMonth: '',
    contractValue: '',
    revenueValue: ''
  });

  const groupOptions = useMemo(() => {
    const groups = Array.from(new Set(rows.map((row) => row.group).filter(Boolean))) as string[];
    return groups.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [rows]);

  const typeOptions = useMemo(() => {
    const types = Array.from(new Set(rows.map((row) => row.type).filter(Boolean))) as string[];
    return types.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [rows]);

  const priorityOptions = useMemo(() => {
    const priorities = Array.from(new Set(rows.map((row) => row.priority).filter(Boolean))) as string[];
    return priorities.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const baseRows = rows.filter((row) => {
      if (selectedGroup !== 'all' && row.group !== selectedGroup) return false;
      if (selectedType !== 'all' && row.type !== selectedType) return false;
      if (selectedPriority !== 'all' && row.priority !== selectedPriority) return false;
      return true;
    });

    return baseRows.filter((row) => {
      return (Object.keys(columnFilters) as FilterKey[]).every((key) => {
        const query = columnFilters[key].trim().toLowerCase();
        if (!query) return true;
        if (key === 'contractValue' || key === 'revenueValue') {
          return String(row[key]).toLowerCase().includes(query);
        }
        return String(row[key] ?? '').toLowerCase().includes(query);
      });
    });
  }, [rows, selectedGroup, selectedType, selectedPriority, columnFilters]);

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
    }));
  }, [sortedRows]);

  const handleFilterChange = (key: FilterKey, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSort = (key: ColumnKey) => {
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
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold uppercase text-slate-700">{title}</CardTitle>
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
            aria-label={isCollapsed ? 'Mở rộng bảng cơ hội' : 'Thu gọn bảng cơ hội'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {summaryItems.map((item) => (
              <div key={item.group} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-600">{item.group}</div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-400">Số HĐ</span>
                  <span className="text-base font-bold text-slate-700">{item.count}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-400">Tổng HĐ</span>
                  <span className="text-base font-bold text-slate-700">
                    {formatCurrencyFull(item.totalContract)}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-slate-400">Tổng DT</span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatCurrencyFull(item.totalRevenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-slate-200">
            <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                    <th
                      key={key}
                      className={`px-4 py-3 text-left font-semibold whitespace-nowrap ${
                        key === 'contractValue' || key === 'revenueValue' ? 'text-right' : ''
                      } ${key === 'customer' ? 'w-44' : ''} ${key === 'project' ? 'w-56' : ''}`}
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
                  {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                    <th key={`filter-${key}`} className="px-4 py-2">
                      {renderFilterCell(key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRows.map((row, index) => (
                  <tr key={`${row.project}-${index}`} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-normal break-words max-w-44">
                      {row.customer}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.type}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-normal break-words max-w-56">
                      {row.project}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.priority}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.contractMonth}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 whitespace-nowrap">
                      {formatCurrencyFull(row.contractValue)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">
                      {formatCurrencyFull(row.revenueValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default OpportunitySourceList;
