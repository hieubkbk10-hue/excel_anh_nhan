import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, LabelList } from 'recharts';
import { OpportunityChartItem } from '../../types';
import { TrendingUp } from 'lucide-react';

interface OpportunityChartProps {
  data: OpportunityChartItem[];
  title: string;
}

const OpportunityChart: React.FC<OpportunityChartProps> = ({ data, title }) => {
  const formatValue = (val: number) => (val ? val.toLocaleString('vi-VN') : '');
  const tickFormatter = (value: string) => {
    const item = data.find((entry) => entry.label === value);
    if (!item) return '';
    return item.rowType === 'new' ? item.group : '';
  };
  const labelFormatter = (value: string) => {
    const item = data.find((entry) => entry.label === value);
    return item?.group ?? value;
  };

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200">
      <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-orange-100 text-orange-600">
                <TrendingUp size={18} />
            </div>
            <CardTitle className="text-base font-semibold uppercase text-slate-700">
                {title}
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 0, right: 60, left: 10, bottom: 0 }}
                barGap={4}
                barSize={32}
            >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                    dataKey="label" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    width={50}
                    tick={{ fontWeight: 600, fontSize: 14, fill: '#334155' }}
                    tickFormatter={tickFormatter}
                />
                <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '14px' }}
                    formatter={(value: number) => (value ? value.toLocaleString('vi-VN') : null)}
                    filterNull
                    labelFormatter={labelFormatter}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', paddingTop: '16px', fontWeight: 500 }} />
                
                <Bar dataKey="value1" name="HĐ Mới (Tiềm năng)" fill="#f97316" radius={[0, 4, 4, 0]}>
                    <LabelList 
                        dataKey="value1" 
                        position="right" 
                        offset={10}
                        formatter={formatValue}
                        style={{ fontSize: '13px', fontWeight: 'bold', fill: '#475569' }}
                    />
                </Bar>
                <Bar dataKey="value2" name="DT từ HĐ đã ký" stackId="a" fill="#1e293b" radius={[4, 0, 0, 4]}>
                    <LabelList 
                        dataKey="value2" 
                        position="center" 
                        formatter={formatValue}
                        style={{ fontSize: '12px', fontWeight: 'bold', fill: 'white' }}
                    />
                </Bar>
                <Bar dataKey="value3" name="DT từ HĐ mới" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]}>
                    <LabelList 
                        dataKey="value3" 
                        position="center" 
                        formatter={formatValue}
                        style={{ fontSize: '12px', fontWeight: 'bold', fill: 'white' }}
                    />
                    <LabelList
                        dataKey="total"
                        position="right"
                        offset={10}
                        formatter={formatValue}
                        style={{ fontSize: '13px', fontWeight: 'bold', fill: '#475569' }}
                    />
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpportunityChart;