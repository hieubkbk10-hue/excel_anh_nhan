import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SignedContractRow } from '../../types';
import { formatCurrencyFull } from '../../lib/utils';

interface SignedContractListProps {
  rows: SignedContractRow[];
  title: string;
}

const SignedContractList: React.FC<SignedContractListProps> = ({ rows, title }) => {
  const [selectedGroup, setSelectedGroup] = useState('all');

  const groupOptions = useMemo(() => {
    const groups = Array.from(
      new Set(rows.map((row) => row.group).filter((group) => group))
    ) as string[];
    return groups.sort((a, b) => a.localeCompare(b, 'vi-VN'));
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (selectedGroup === 'all') return rows;
    return rows.filter((row) => row.group === selectedGroup);
  }, [rows, selectedGroup]);

  const summaryItems = useMemo(() => {
    const summaryMap = new Map<string, { count: number; total: number }>();
    for (const row of filteredRows) {
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
    }));
  }, [filteredRows]);

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm border-slate-200">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold uppercase text-slate-700">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">Nhóm</span>
            <select
              value={selectedGroup}
              onChange={(event) => setSelectedGroup(event.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">Tất cả</option>
              {groupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
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
                <span className="text-xs font-medium text-slate-400">Tổng giá trị</span>
                <span className="text-base font-bold text-emerald-600">
                  {formatCurrencyFull(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">NHÓM</th>
                <th className="px-4 py-3 text-left font-semibold">KHÁCH HÀNG</th>
                <th className="px-4 py-3 text-left font-semibold">SỐ HĐ</th>
                <th className="px-4 py-3 text-left font-semibold">NỘI DUNG</th>
                <th className="px-4 py-3 text-right font-semibold">GIÁ TRỊ</th>
                <th className="px-4 py-3 text-left font-semibold">NGÀY HĐ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRows.map((row, index) => (
                <tr key={`${row.contractNo}-${index}`} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-700">{row.group}</td>
                  <td className="px-4 py-3 text-slate-600">{row.customer}</td>
                  <td className="px-4 py-3 text-slate-600">{row.contractNo}</td>
                  <td className="px-4 py-3 text-slate-600">{row.content}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-700">
                    {formatCurrencyFull(row.value)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.contractDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignedContractList;
