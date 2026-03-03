import React, { useState } from 'react';
import DashboardView from '../components/dashboard/DashboardView';
import { loadExcelDataFromFile } from '../lib/excel';
import { ExcelData } from '../types';

const HomeUploadPage: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsParsing(true);
    try {
      const data = await loadExcelDataFromFile(file);
      setExcelData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đọc file Excel';
      setError(message);
    } finally {
      setIsParsing(false);
    }
  };

  if (excelData) {
    return <DashboardView excelData={excelData} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow-sm ring-1 ring-slate-200/60 rounded-lg p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-slate-900">Tải file Excel</h1>
          <p className="text-sm text-slate-500">Chọn file Excel theo template hiện có để hiển thị dashboard.</p>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
        />
        {isParsing && <p className="text-sm text-slate-500">Đang phân tích file...</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}
      </div>
    </div>
  );
};

export default HomeUploadPage;
