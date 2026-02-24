import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { cn, formatCurrency, formatCurrencyFull } from '../../lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';
import { DonutDataItem } from '../../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']; // Blue, Emerald, Amber

const REVENUE_COLORS = ['#1e293b', '#10b981']; // Slate-800, Emerald-500

const DonutChartWithLegend = ({ 
    title, 
    data,
    colors, 
    totalLabel, 
    totalValue 
}: { 
    title: string, 
    data: DonutDataItem[], 
    colors: string[], 
    totalLabel: string, 
    totalValue: string 
}) => {
    return (
        <Card className="h-full border-slate-200 shadow-sm">
             <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-center text-base font-semibold uppercase text-slate-500">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                strokeWidth={0}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value: number) => formatCurrencyFull(value) + ' VNĐ'}
                                contentStyle={{ borderRadius: '8px', fontSize: '14px', padding: '10px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Text */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <div className="text-xs text-slate-400 font-medium uppercase mb-1">{totalLabel}</div>
                        <div className="text-2xl font-bold text-slate-800">{totalValue}</div>
                    </div>
                </div>

                <div className="mt-8 space-y-4">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-base">
                            <div className="flex items-center gap-3">
                                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                                <span className="text-slate-600 font-medium">{entry.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">{formatCurrencyFull(entry.value)} VNĐ</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

interface DonutSectionProps {
  contractData: DonutDataItem[];
  revenueData: DonutDataItem[];
  contractTotal: number;
  revenueTotal: number;
}

const DonutSection: React.FC<DonutSectionProps> = ({
  contractData,
  revenueData,
  contractTotal,
  revenueTotal
}) => {
  return (
    <div className="col-span-1 lg:col-span-3">
        <div className="flex items-center gap-3 mb-5 px-1">
            <PieChartIcon className="text-slate-500" size={24} />
            <h3 className="text-xl font-bold text-slate-800">Phân tích hợp đồng - Doanh thu</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DonutChartWithLegend 
                title="Nguồn Hợp Đồng" 
                data={contractData} 
                colors={COLORS} 
                totalLabel="Tổng hợp đồng"
                totalValue={formatCurrency(contractTotal)}
            />
            <DonutChartWithLegend 
                title="Nguồn Doanh Thu" 
                data={revenueData} 
                colors={REVENUE_COLORS} 
                totalLabel="Tổng doanh thu"
                totalValue={formatCurrency(revenueTotal)}
            />
        </div>
    </div>
  );
};

export default DonutSection;