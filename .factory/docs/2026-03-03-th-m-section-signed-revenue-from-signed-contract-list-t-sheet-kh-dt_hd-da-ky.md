## Problem Graph
1. [Main] Tạo section mới `signed-revenue-from-signed-contract-list` lấy dữ liệu từ `KH_DT_HD_da_ky_SHEET` với title `Doanh thu từ hợp đồng đã ký` <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Chưa có `ExcelChartId` và dataset cho sheet `KH DT_HD da ky`
   1.2 [ROOT CAUSE] Loader hiện mới đọc `HD_Thucte` và `DT_Thucte`
   1.3 [ROOT CAUSE] Chưa có spec entry + renderer cho id mới
   1.4 [ROOT CAUSE] Layout chưa có row order 7 cho section mới

## Execution (with reflection)
1. Mở rộng type cho id và dữ liệu mới
   - File: `types.ts`
   - Thay đổi:
     - Thêm `signed-revenue-from-signed-contract-list` vào `ExcelChartId`.
     - Mở rộng `ExcelData` thêm mảng dữ liệu mới (dùng lại `SignedContractRow[]` để DRY), ví dụ `revenuesFromSignedContracts`.
   - Reflection: ✓ Giữ cùng schema 6 cột, không tạo type dư thừa.

2. Mở rộng Excel loader đọc sheet `KH_DT_HD_da_ky_SHEET`
   - File: `lib/excel.ts`
   - Thay đổi:
     - Import `KH_DT_HD_da_ky_SHEET` từ `lib/excel-spec.ts`.
     - Reuse hàm `buildSignedContracts(workbook, sheetName)` (đã chuẩn hóa date, parse value, lọc dòng) để đọc sheet mới.
     - Trả dataset mới trong `loadExcelData()` cùng các dataset hiện có.
   - Reflection: ✓ Bám đúng pattern/commit gần nhất, tránh duplicate logic.

3. Khai báo spec id mới + title mới
   - File: `lib/excel-spec.ts`
   - Thay đổi:
     - Thêm entry vào `EXCEL_CHART_SPECS`:
       - `id: 'signed-revenue-from-signed-contract-list'`
       - `sheet: KH_DT_HD_da_ky_SHEET`
       - `texts.title: 'Doanh thu từ hợp đồng đã ký'`
       - `metrics: {}`
   - Reflection: ✓ Đồng bộ cơ chế cấu hình title như các section trước.

4. Nối vào App + đặt order 7 (cuối cùng)
   - File: `App.tsx`
   - Thay đổi:
     - Trong `derivedData`: thêm title và rows cho id mới bằng `getText(..., 'Doanh thu từ hợp đồng đã ký')` + dataset từ excelData.
     - Trong `chartRenderers`: thêm renderer cho `signed-revenue-from-signed-contract-list`, reuse component `SignedContractList` (UI y hệt như anh yêu cầu “tương tự”).
     - Cập nhật `rowLayoutClasses` thêm key `7` (class tương đương row full-width phù hợp).
   - File: `lib/excel-spec.ts`
   - Thay đổi `EXCEL_LAYOUT_CONFIG.rowGroups`:
     - Giữ các order 1..6 như hiện tại.
     - Thêm row mới `order: 7, items: ['signed-revenue-from-signed-contract-list']` (nằm cuối cùng theo yêu cầu).
   - Reflection: ✓ Đúng vị trí “order 7 nằm cuối cùng”.

5. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `feat(home): add revenue-from-signed-contract section`.
   - Reflection: ✓ Tuân thủ quy trình commit gần nhất và AGENTS.md.