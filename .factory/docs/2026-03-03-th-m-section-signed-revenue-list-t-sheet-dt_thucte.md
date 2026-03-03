## Problem Graph
1. [Main] Tạo section mới `signed-revenue-list` (UI y hệt signed-contract-list) đọc dữ liệu từ sheet `DT_Thucte` và chèn vào layout order 4 <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] `ExcelData` hiện chỉ có 1 dataset `contractsSigned` từ `HD_Thucte`
   1.2 [ROOT CAUSE] `ExcelChartId`/`EXCEL_CHART_SPECS` chưa có id `signed-revenue-list`
   1.3 [ROOT CAUSE] App chưa có renderer cho section doanh thu mới
   1.4 [ROOT CAUSE] Layout order chưa chèn row 4 mới và chưa đẩy opportunity/donut xuống 5/6

## Execution (with reflection)
1. Mở rộng type cho dataset doanh thu mới
   - File: `types.ts`
   - Thay đổi:
     - Thêm `signed-revenue-list` vào `ExcelChartId`.
     - Mở rộng `ExcelData` thêm `revenuesSigned: SignedContractRow[]` (dùng lại schema 6 cột y hệt).
   - Reflection: ✓ Tận dụng kiểu dữ liệu sẵn có, tránh duplicate interface (DRY).

2. Mở rộng excel loader cho sheet `DT_Thucte`
   - File: `lib/excel.ts`
   - Thay đổi:
     - Import `DT_Thucte_SHEET` từ `excel-spec.ts`.
     - Reuse hàm `buildSignedContracts(workbook, sheetName)` để đọc `DT_Thucte` (A2:F) tương tự `HD_Thucte`.
     - Trả về `revenuesSigned` cùng `contractsSigned` trong `loadExcelData()`.
   - Reflection: ✓ Reuse pipeline parse date/number/filter row đã ổn định từ các commit gần nhất.

3. Khai báo spec mới cho id doanh thu
   - File: `lib/excel-spec.ts`
   - Thay đổi:
     - Giữ `export const DT_Thucte_SHEET = 'DT_Thucte';` (đã có).
     - Thêm entry mới vào `EXCEL_CHART_SPECS`:
       - `id: 'signed-revenue-list'`
       - `sheet: DT_Thucte_SHEET`
       - `texts.title: 'Chi tiết danh sách doanh thu'`
       - `metrics: {}`
   - Reflection: ✓ Theo đúng pattern đã áp dụng với `signed-contract-list`.

4. Gắn UI mới vào App + cập nhật layout order
   - File: `App.tsx`
   - Thay đổi:
     - Trong `derivedData`, thêm:
       - `signedRevenueTitle` từ `getText('signed-revenue-list', 'title', 'Chi tiết danh sách doanh thu')`
       - `signedRevenueRows: excelData.revenuesSigned`
     - Trong `chartRenderers`, thêm renderer `signed-revenue-list` dùng lại component `SignedContractList` (giữ behavior y hệt 100%).
     - Cập nhật `rowLayoutClasses` thêm order 6 cùng class phù hợp.
   - File: `lib/excel-spec.ts`
   - Thay đổi `rowGroups`:
     - order 3: `['signed-contract-list']` (giữ nguyên)
     - order 4: `['signed-revenue-list']` (mới)
     - đẩy `opportunity` xuống order 5
     - đẩy `donut-contract`, `donut-revenue` xuống order 6
   - Reflection: ✓ Đúng yêu cầu vị trí UI mới và dịch order.

5. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local, không push. Message gợi ý: `feat(home): add DT_Thucte signed revenue section`.
   - Reflection: ✓ Tuân thủ quy trình các commit gần nhất và AGENTS.md.