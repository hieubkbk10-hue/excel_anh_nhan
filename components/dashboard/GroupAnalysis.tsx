import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { GroupData } from '../../types';
import { cn, formatCurrencyFull } from '../../lib/utils';
import { FileText, DollarSign } from 'lucide-react';

interface GroupAnalysisProps {
  title: string;
  data: GroupData[];
  type: 'contract' | 'revenue';
}

const GroupAnalysis: React.FC<GroupAnalysisProps> = ({ title, data, type }) => {
  const isContract = type === 'contract';
  const primaryColor = isContract ? '#3b82f6' : '#10b981'; // Blue-500 : Emerald-500
  const lightColor = isContract ? '#e2e8f0' : '#e2e8f0'; // Slate-200
  const iconBg = isContract ? 'bg-blue-100' : 'bg-emerald-100';
  const iconColor = isContract ? 'text-blue-600' : 'text-emerald-600';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-slate-500">Kế hoạch: {(payload[0].value).toLocaleString('vi-VN')}</p>
          <p className={cn("font-medium", iconColor)}>Thực tế: {(payload[1].value).toLocaleString('vi-VN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1 overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 py-4">
        <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md", iconBg, iconColor)}>
                {isContract ? <FileText size={18} /> : <DollarSign size={18} />}
            </div>
            <CardTitle className="text-base font-semibold uppercase text-slate-700">
            {title}
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Chart Section */}
          <div className="h-[280px] p-5 border-b lg:border-b-0 lg:border-r border-slate-100">
             <div className="flex justify-center gap-6 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <span className="text-slate-500">Kế hoạch</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full", isContract ? "bg-blue-500" : "bg-emerald-500")}></div>
                    <span className="text-slate-700 font-medium">Thực tế</span>
                </div>
             </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                <Bar dataKey="plan" fill={lightColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="actual" fill={primaryColor} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List Section */}
          <div className="flex flex-col divide-y divide-slate-50 justify-center">
            {data.map((item) => {
               const percent = (item.actual / item.plan) * 100;
               return (
                <div key={item.name} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-base text-slate-800">{item.name}</span>
                    <span className={cn("text-sm font-bold px-2.5 py-0.5 rounded-full", 
                        percent >= 50 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                        {percent.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-slate-500 mb-2">
                    <span>KH: {item.plan.toLocaleString('vi-VN')}</span>
                    <span className={cn("font-medium", iconColor)}>TT: {item.actual.toLocaleString('vi-VN')}</span>
                  </div>

                  <Progress 
                    value={percent} 
                    className="h-2 bg-slate-100" 
                    indicatorColor={isContract ? "bg-blue-500" : "bg-emerald-500"} 
                  />
                  
                  <div className="mt-2 text-right">
                    <span className={cn("text-base font-bold", iconColor)}>
                        {formatCurrencyFull(item.actual * 1_000_000)} VNĐ
                    </span>
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupAnalysis;