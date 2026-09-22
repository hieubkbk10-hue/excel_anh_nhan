import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SignedContractRow } from '../../types';
import { formatCurrencyFull, sortGroups } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const formatDate = (dateText: string) => {
  const [day, month, year] = dateText.split('/').map((part) => part.padStart(2, '0'));
  return `${day}/${month}/${year}`;
};

const DAY_MS = 86400000;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};

const getExpiryClass = (dateText: string): string => {
  const [day, month, year] = dateText.split('/').map((part) => Number(part));
  if (!day || !month || !year) return 'text-slate-600';
  const expiry = new Date(year, month - 1, day).getTime();
  const today = startOfToday();
  const in30Days = today + 30 * DAY_MS;
  if (expiry <= today) return 'bg-red-100 text-red-700';
  if (expiry <= in30Days) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

interface SignedContractListProps {
  rows: SignedContractRow[];
  title: string;
  filterMonths?: number[];
  compactSummary?: boolean;
  isContract?: boolean;
  expiryMode?: boolean;
}

type ColumnKey = 'group' | 'customer' | 'contractNo' | 'content' | 'value' | 'contractDate' | 'status';
type SortDirection = 'asc' | 'desc';
type FilterKey = Exclude<ColumnKey, 'group'>;

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  approved: 'bg-blue-100 text-blue-700',
  created: 'bg-amber-100 text-amber-700'
};

const statusClass = (status: string): string =>
  STATUS_COLORS[status.trim().toLowerCase()] ?? 'bg-slate-100 text-slate-600';

const columnLabels: Record<ColumnKey, string> = {
  group: 'NHÓM',
  customer: 'KHÁCH HÀNG',
  contractNo: 'SỐ HĐ',
  content: 'NỘI DUNG',
  value: 'GIÁ TRỊ',
  contractDate: 'NGÀY HĐ',
  status: 'TRẠNG THÁI'
};

const SignedContractList: React.FC<SignedContractListProps> = ({ rows, title, filterMonths, compactSummary = false, isContract = false, expiryMode = false }) => {
  const baseRows = useMemo(() => {
    if (!filterMonths || filterMonths.length === 0) return rows;
    return rows.filter((row) => {
      const parts = row.contractDate.split('/');
      const month = parts.length >= 2 ? Number(parts[1]) : 0;
      return filterMonths.includes(month);
    });
  }, [rows, filterMonths]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [sortState, setSortState] = useState<{ key: ColumnKey; direction: SortDirection } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<FilterKey, string>>({
    customer: '',
    contractNo: '',
    content: '',
    value: '',
    contractDate: '',
    status: ''
  });

  const groupOptions = useMemo(() => {
    const groups = Array.from(
      new Set(baseRows.map((row) => row.group).filter((group) => group))
    ) as string[];
    return groups.sort((a, b) => sortGroups(a, b));
  }, [baseRows]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(
      new Set(baseRows.map((row) => row.status).filter((status) => status))
    ) as string[];
    return statuses.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [baseRows]);

  const filteredRows = useMemo(() => {
    const preFiltered = selectedGroup === 'all' ? baseRows : baseRows.filter((row) => row.group === selectedGroup);
    return preFiltered.filter((row) => {
      return (Object.keys(columnFilters) as FilterKey[]).every((key) => {
        const query = columnFilters[key].trim().toLowerCase();
        if (!query) return true;
        if (key === 'value') {
          return String(row.value).toLowerCase().includes(query);
        }
        return String(row[key] ?? '').toLowerCase().includes(query);
      });
    });
  }, [baseRows, selectedGroup, columnFilters]);

  const toDateValue = (dateText: string) => {
    const [day, month, year] = dateText.split('/').map((part) => Number(part));
    if (!day || !month || !year) return 0;
    return new Date(year, month - 1, day).getTime();
  };

  const sortedRows = useMemo(() => {
    if (!sortState) return filteredRows;
    const { key, direction } = sortState;
    const sorted = [...filteredRows].sort((a, b) => {
      if (key === 'value') {
        return a.value - b.value;
      }
      if (key === 'contractDate') {
        return toDateValue(a.contractDate) - toDateValue(b.contractDate);
      }
      return String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'vi-VN');
    });
    return direction === 'asc' ? sorted : sorted.reverse();
  }, [filteredRows, sortState]);

  const summaryItems = useMemo(() => {
    const summaryMap = new Map<string, { count: number; total: number }>();
    for (const row of sortedRows) {
      const group = row.group || 'Khác';
      const current = summaryMap.get(group) ?? { count: 0, total: 0 };
      current.count += 1;
      current.total += row.value;
      summaryMap.set(group, current);
    }
    return Array.from(summaryMap.entries()).map(([group, data]) => ({
      group,
      count: data.count,
      total: data.total
    })).sort((a, b) => sortGroups(a.group, b.group));
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
          {compactSummary ? (
            <div className="flex flex-wrap gap-3">
              {summaryItems.map((item) => (
                <div key={item.group} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-600">{item.group}:</span>
                  <span className="font-bold text-emerald-600">{formatCurrencyFull(item.total)}</span>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-3 gap-2">
            {summaryItems.map((item) => (
              <div key={item.group} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">{item.group}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Số HĐ <strong className="font-bold text-slate-700">{item.count}</strong>
                </span>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  Tổng <strong className={`font-bold ${isContract ? 'text-blue-600' : 'text-emerald-600'}`}>{formatCurrencyFull(item.total)}</strong>
                </span>
              </div>
            ))}
          </div>
          )}

          <div className="rounded-lg border border-slate-200">
            <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                    <th
                      key={key}
                      className={`px-4 py-1.5 text-left font-semibold whitespace-nowrap ${
                        key === 'value' || key === 'contractDate' ? 'text-right' : ''
                      } ${
                        key === 'group'
                          ? 'w-14'
                          : key === 'customer'
                            ? 'w-48'
                            : key === 'contractNo'
                              ? 'w-32'
                              : key === 'content'
                                ? 'w-56'
                                : key === 'value'
                                  ? 'w-28'
: key === 'contractDate'
                                  ? 'w-20'
                                    : key === 'status'
                                      ? 'w-20'
                                      : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                      >
                        {expiryMode && key === 'contractDate' ? 'HẾT HẠN HĐ' : columnLabels[key]}
                        <span className="text-xs text-slate-400">{getSortIndicator(key)}</span>
                      </button>
                    </th>
                  ))}
                </tr>
                <tr className="bg-white">
                  {(Object.keys(columnLabels) as ColumnKey[]).map((key) => (
                    <th key={`filter-${key}`} className="px-4 py-2">
                      {key === 'group' ? (
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
                      ) : key === 'status' ? (
                        <select
                          value={columnFilters.status}
                          onChange={(event) => handleFilterChange('status', event.target.value)}
                          className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                          <option value="">Tất cả</option>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={columnFilters[key as FilterKey]}
                          onChange={(event) => handleFilterChange(key as FilterKey, event.target.value)}
                          placeholder={`Tìm ${(expiryMode && key === 'contractDate' ? 'hết hạn hđ' : columnLabels[key]).toLowerCase()}`}
                          className="h-8 w-full rounded-md border border-slate-200 px-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedRows.map((row, index) => (
                  <tr key={`${row.contractNo}-${index}`} className="hover:bg-slate-50/60">
                    <td className="px-4 py-0.5 text-xs font-medium text-slate-700 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-48">
                      {row.customer}
                    </td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-nowrap">{row.contractNo}</td>
                    <td className="px-4 py-0.5 text-xs text-slate-600 whitespace-normal break-words max-w-56">
                      {row.content}
                    </td>
                    <td className={`px-4 py-0.5 text-xs text-right font-semibold whitespace-nowrap ${isContract ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {formatCurrencyFull(row.value)}
                    </td>
                    <td className="px-4 py-0.5 text-xs text-right whitespace-nowrap">
                      {expiryMode ? (
                        <span className={`inline-block rounded px-1.5 py-0.5 font-semibold tabular-nums ${getExpiryClass(row.contractDate)}`}>
                          {formatDate(row.contractDate)}
                        </span>
                      ) : (
                        <span className="text-slate-600 tabular-nums">{formatDate(row.contractDate)}</span>
                      )}
                    </td>
                    <td className="px-4 py-0.5 whitespace-nowrap">
                      {row.status ? (
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${statusClass(row.status)}`}>
                          {row.status}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1 px-3 py-0.5 rounded-full border border-slate-200 text-[11px] text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <ChevronDown className="h-3 w-3 rotate-180" />
              Thu gọn
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SignedContractList;
