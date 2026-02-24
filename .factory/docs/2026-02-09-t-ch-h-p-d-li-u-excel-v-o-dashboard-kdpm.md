## Phân tích File Excel "Hop dong - Doanh thu.xlsx"

### Cấu trúc Excel (1 sheet có 2 bảng):

**Bảng 1: HỢP ĐỒNG** (rows 1-17)
| Tháng | Nhóm ITO | Nhóm UNI | Nhóm G2B | BPPM (NĂM) |
|-------|----------|----------|----------|------------|
| Kế hoạch, Cơ hội, Thực tế cho từng nhóm |

- **ITO**: KH 11 tỷ, Cơ hội 11 tỷ, Thực tế 0
- **UNI**: KH 11 tỷ, Cơ hội 14.18 tỷ, Thực tế 130.8 tr
- **G2B**: KH 9.5 tỷ, Cơ hội 8.97 tỷ, Thực tế 296.3 tr
- **Tổng BPPM**: KH 31.5 tỷ (=30 tỷ header), Cơ hội 34.15 tỷ, Thực tế 427.09 tr

**Bảng 2: DOANH THU** (rows 19-38)
| Tháng | Nhóm ITO | Nhóm UNI | Nhóm G2B | BPPM (NĂM) |
|-------|----------|----------|----------|------------|
| KH, Từ HĐ đã ký, Từ HĐ mới, Thực tế |

- **ITO**: KH 11 tỷ, Từ HĐ đã ký 2.18 tỷ, Thực tế 0
- **UNI**: KH 8.8 tỷ, Từ HĐ đã ký 2.18 tỷ, Từ HĐ mới 13.67 tỷ, Thực tế 489.5 tr
- **G2B**: KH 8.55 tỷ, Từ HĐ đã ký 1.26 tỷ, Thực tế 208.5 tr
- **Tổng BPPM**: KH 28.35 tỷ (=25 tỷ header), Thực tế 698.1 tr

---

## Dữ liệu Hardcode cần thay thế

### 1. **App.tsx** - KPI Cards
```typescript
// HARDCODE HIỆN TẠI:
currentValue={15100800000}  // Hợp đồng
targetValue={30000000000}
currentValue={12151000000}  // Doanh thu
targetValue={25000000000}

// Dự báo cuối năm: 29.2 Tỷ (97.3%), 24.5 Tỷ (98%)
```

### 2. **App.tsx** - contractData & revenueData
```typescript
const contractData = [
    { name: 'ITO', plan: 15000, actual: 8200.5 },
    { name: 'UNI', plan: 9000, actual: 4800 },
    { name: 'G2B', plan: 6000, actual: 2100.3 },
];
```

### 3. **DonutSection.tsx** - Donut Charts
```typescript
const contractData = [
  { name: 'ITO', value: 8200500000 },
  { name: 'UNI', value: 4800000000 },
  { name: 'G2B', value: 2100300000 },
];
const revenueData = [
  { name: 'Từ HĐ đã ký', value: 8500500000 },
  { name: 'Từ HĐ mới', value: 3650500000 },
];
```

### 4. **OpportunityChart.tsx** - Opportunity Chart
```typescript
const formattedData = [
    { name: 'ITO', value1: 6299.5, value2: 3500, value3: 2499.8 },
    { name: 'UNI', value1: 4000.0, value2: 2000, value3: 1899.2 },
    { name: 'G2B', value1: 3799.7, value2: 1000, value3: 1500.0 },
]
```

---

## Plan Implementation

### Phase 1: Setup Excel Reader (lib/excel.ts)
1. Cài đặt thư viện `xlsx` 
2. Tạo module `lib/excel.ts` với functions:
   - `readExcelFile(filePath)` - đọc file Excel
   - `parseContractData()` - parse bảng Hợp đồng
   - `parseRevenueData()` - parse bảng Doanh thu
   - `calculateKPIs()` - tính toán các chỉ số KPI

### Phase 2: Define TypeScript Types (types.ts)
```typescript
interface ExcelData {
  contract: {
    ito: GroupMetrics;
    uni: GroupMetrics;
    g2b: GroupMetrics;
    total: TotalMetrics;
  };
  revenue: {
    ito: GroupMetrics;
    uni: GroupMetrics;
    g2b: GroupMetrics;
    total: TotalMetrics;
  };
}

interface GroupMetrics {
  plan: number;
  opportunity: number;
  actual: number;
  fromSignedContract?: number;
  fromNewContract?: number;
}
```

### Phase 3: Create Data Context (lib/DataContext.tsx)
1. Tạo React Context để share data từ Excel
2. Load data 1 lần khi app mount
3. Provide data cho tất cả components

### Phase 4: Update Components
1. **App.tsx**: Nhận data từ Context, truyền xuống components
2. **KPICard.tsx**: Giữ nguyên (đã nhận props)
3. **GroupAnalysis.tsx**: Giữ nguyên (đã nhận props)
4. **DonutSection.tsx**: Thêm props thay vì hardcode
5. **OpportunityChart.tsx**: Thêm props thay vì hardcode

### Phase 5: Excel Path Configuration
- File Excel nằm tại: `./Hop dong - Doanh thu.xlsx` (relative path)
- Vì chạy local, sử dụng relative import hoặc public folder

---

## File Changes Summary

| File | Action |
|------|--------|
| `package.json` | Thêm dependency `xlsx` |
| `lib/excel.ts` | **NEW** - Excel reader & parser |
| `lib/DataContext.tsx` | **NEW** - React Context cho data |
| `types.ts` | Thêm interfaces mới |
| `App.tsx` | Sử dụng DataContext, bỏ hardcode |
| `DonutSection.tsx` | Nhận props thay vì hardcode |
| `OpportunityChart.tsx` | Nhận props thay vì hardcode |

---

## Mapping Excel → Dashboard

| Excel Field | Dashboard Component |
|-------------|---------------------|
| BPPM Thực tế Hợp đồng | KPICard "Giá trị hợp đồng" |
| BPPM Kế hoạch Hợp đồng | KPICard target 30 Tỷ |
| BPPM Thực tế Doanh thu | KPICard "Giá trị doanh thu" |
| BPPM Kế hoạch Doanh thu | KPICard target 25 Tỷ |
| ITO/UNI/G2B KH+TT | GroupAnalysis chart |
| ITO/UNI/G2B Thực tế | DonutSection "Nguồn Hợp Đồng" |
| Từ HĐ đã ký/mới | DonutSection "Nguồn Doanh Thu" |
| Cơ hội + KH | OpportunityChart |