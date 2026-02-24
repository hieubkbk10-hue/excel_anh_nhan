import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { FileText, DollarSign, Clock } from 'lucide-react';
import { cn, formatCurrencyFull } from '../../lib/utils';

interface KPICardProps {
  title: string;
  currentValue: number;
  targetValue: number;
  icon: 'file' | 'dollar' | 'clock';
  colorClass: string;
  bgClass: string;
  barColorClass: string;
  subText?: string;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  currentValue, 
  targetValue, 
  icon, 
  colorClass, 
  bgClass,
  barColorClass,
  subText 
}) => {
  const percentage = Math.min((currentValue / targetValue) * 100, 100);
  const formattedPercentage = ((currentValue / targetValue) * 100).toFixed(2);
  
  const IconMap = {
    file: FileText,
    dollar: DollarSign,
    clock: Clock
  };

  const IconComponent = IconMap[icon];

  return (
    <Card className="h-full border-none shadow-sm ring-1 ring-slate-200/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", bgClass, colorClass)}>
                <IconComponent size={24} strokeWidth={2.5} />
            </div>
            <CardTitle className="text-base font-medium text-muted-foreground uppercase tracking-wider">
                {title}
            </CardTitle>
        </div>
        <div className={cn("text-3xl font-bold", colorClass)}>
            {formattedPercentage}%
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-2 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-4xl font-bold tracking-tight text-slate-800")}>
              {(currentValue / 1_000_000_000).toFixed(2)}
            </span>
            <span className="text-lg text-muted-foreground font-medium">
              / {(targetValue / 1_000_000_000).toFixed(0)} tỷ
            </span>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-slate-500">Thực tế:</span>
             <span className={cn("text-2xl font-bold", colorClass)}>
                {formatCurrencyFull(currentValue)} <span className="text-sm font-semibold text-slate-400">VNĐ</span>
             </span>
          </div>
        </div>
        <div className="mt-5">
            <Progress value={percentage} indicatorColor={barColorClass} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;