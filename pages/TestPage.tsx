import React, { useEffect, useState } from 'react';
import DashboardView from '../components/dashboard/DashboardView';
import { loadExcelData } from '../lib/excel';
import { ExcelData } from '../types';

const TestPage: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadExcelData()
      .then((data) => {
        if (isMounted) {
          setExcelData(data);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || 'Không thể tải dữ liệu Excel');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <span className="text-sm font-medium text-red-600">{error}</span>
      </div>
    );
  }

  if (!excelData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <span className="text-sm font-medium text-slate-500">Đang tải dữ liệu Excel...</span>
      </div>
    );
  }

  return <DashboardView excelData={excelData} />;
};

export default TestPage;
