## Problem Graph
1. [Main] Cho phép cấu hình text title của `signed-contract-list` trong `EXCEL_CHART_SPECS` <- depends on 1.1, 1.2, 1.3
   1.1 [ROOT CAUSE] `signed-contract-list` hiện chỉ nằm trong `EXCEL_LAYOUT_CONFIG`, chưa có entry trong `EXCEL_CHART_SPECS`
   1.2 `App.tsx` đang hardcode title `Chi tiết danh sách hợp đồng đã ký`
   1.3 Cần giữ tương thích pipeline `buildTexts` (đọc `texts` từ specs)

## Execution (with reflection)
1. Cập nhật `lib/excel-spec.ts`
   - Thêm 1 entry mới trong `EXCEL_CHART_SPECS` với:
     - `id: 'signed-contract-list'`
     - `sheet: HD_Thucte_SHEET`
     - `texts: { title: 'Chi tiết danh sách hợp đồng đã ký' }`
     - `metrics: {}` (rỗng, vì component này lấy data bảng từ `contractsSigned`, không dùng chart metrics)
   - Reflection: ✓ Title sẽ đi theo cùng cơ chế config như các chart khác.

2. Cập nhật `App.tsx`
   - Bỏ hardcode `signedContractTitle`.
   - Lấy title qua `getText('signed-contract-list', 'title', 'Chi tiết danh sách hợp đồng đã ký')`.
   - Giữ nguyên phần `signedContractRows: excelData.contractsSigned`.
   - Reflection: ✓ Đồng bộ với pattern hiện có của toàn dashboard.

3. Kiểm tra kiểu dữ liệu và compile
   - Đảm bảo `ExcelChartId` đã có `signed-contract-list` (đã có từ trước).
   - Chạy `bunx tsc --noEmit`.
   - Reflection: ✓ Không đổi behavior dữ liệu, chỉ đổi nguồn title từ hardcode -> config.

4. Commit theo convention
   - Commit local, không push.
   - Message đề xuất: `feat(spec): configure signed-contract-list title via excel chart specs`