## Problem Graph
1. [Main] Tách 2 route: `/` upload-only và `/test` dashboard dùng file mẫu <- depends on 1.1, 1.2, 1.3
   1.1 [Sub] Hiện tại app chưa có router, toàn bộ logic nằm trong `App.tsx` <- depends on 1.1.1
      1.1.1 [ROOT CAUSE] Cần tách dashboard thành component dùng lại được cho cả route đọc URL và route đọc file upload
   1.2 [Sub] `loadExcelData()` chỉ hỗ trợ fetch URL, chưa hỗ trợ parse từ file upload
   1.3 [Sub] Trang chủ cần UX upload đơn giản, auto parse, lỗi chi tiết, upload xong ẩn form

## Execution (with reflection)
1. Solving 1.1.1 (tách cấu trúc route + dashboard)
   - Thought: Tạo router tối thiểu với `react-router-dom` và tách `App.tsx` thành shell route, tránh duplicate UI logic.
   - Action:
     - Cài `react-router-dom` (dependency mới).
     - Tạo `pages/TestPage.tsx`: render dashboard cũ, dữ liệu từ `/input.xlsx`.
     - Tạo `components/dashboard/DashboardView.tsx`: chứa toàn bộ logic `derivedData` + UI render hiện tại đang ở `App.tsx`.
     - Cập nhật `index.tsx` dùng `BrowserRouter` + routes:
       - `/` -> `HomeUploadPage`
       - `/test` -> `TestPage`
   - Reflection: ✓ Đúng yêu cầu “/test giữ như hiện tại, đọc từ public/input.xlsx”.

2. Solving 1.2 (hỗ trợ parse Excel từ upload file)
   - Thought: Giữ backward compatibility cho route `/test`, thêm API mới cho upload thay vì phá API cũ.
   - Action (file `lib/excel.ts`):
     - Giữ `loadExcelData()` như hiện tại (vẫn dùng `EXCEL_FILE_URL`).
     - Thêm `loadExcelDataFromFile(file: File): Promise<ExcelData>`:
       - đọc `arrayBuffer` từ `File`.
       - dùng chung pipeline parse (`buildCharts`, `buildSignedContracts`, ...).
     - Refactor nhẹ `loadWorkbook(url)` thành `loadWorkbookFromUrl` + `loadWorkbookFromArrayBuffer` để tái sử dụng code.
     - Bổ sung validate lỗi chi tiết:
       - file rỗng/không phải excel.
       - workbook không có sheet bắt buộc (`TH_2026`, `HD_Thucte`, `DT_Thucte`, `KH DT_HD da ky`, `KH_CoHoi`).
       - trả message rõ ràng để UI hiển thị.
   - Reflection: ✓ Đảm bảo `/test` không đổi behavior, `/` có upload parse độc lập.

3. Solving 1.3 (UX trang chủ upload-only)
   - Thought: Theo yêu cầu: form upload đơn giản, auto parse khi chọn file, parse OK thì ẩn form và show full dashboard, parse lỗi thì show chi tiết và không render dashboard.
   - Action:
     - Tạo `pages/HomeUploadPage.tsx`:
       - State: `excelData`, `error`, `isParsing`, `hasUploadedSuccess`.
       - UI ban đầu: 1 khung upload đơn giản (input type=file `.xlsx,.xls`), không có link tải template.
       - `onChange` file input: auto parse ngay (không nút submit).
       - Nếu success: set data -> render `DashboardView` full màn hình, không render form nữa.
       - Nếu fail: giữ form, hiển thị lỗi chi tiết dạng text/list.
     - Không thêm cơ chế upload lại trong UI (đúng yêu cầu user F5 để upload lại).
   - Reflection: ✓ Khớp UX “để chụp màn hình”, upload thành công thì form biến mất.

4. Kiểm thử và commit
   - Thought: Tuân thủ rule repo: chỉ chạy `bunx tsc --noEmit` trước commit.
   - Action:
     - Chạy `bunx tsc --noEmit`.
     - Nếu pass: commit theo convention hiện có, ví dụ: `feat(route): split home upload flow and move static dashboard to /test`.
   - Reflection: ✓ Đúng AGENTS.md (không lint/build dư thừa), có commit nhưng không push.

## Danh sách file dự kiến thay đổi
- `index.tsx` (thêm router + route mapping)
- `App.tsx` (đổi thành app shell/router container, hoặc bỏ nếu không cần)
- `lib/excel.ts` (thêm loader từ File + validate lỗi chi tiết)
- `components/dashboard/DashboardView.tsx` (mới, tách UI dashboard hiện tại)
- `pages/TestPage.tsx` (mới, route dashboard cũ `/test`)
- `pages/HomeUploadPage.tsx` (mới, route upload client-side `/`)
- `package.json` (thêm `react-router-dom`)
- `bun.lock`/`package-lock.json` (nếu thay đổi lockfile do cài dependency)

Nếu bạn duyệt spec này, mình sẽ implement đúng theo các bước trên, rồi chạy `bunx tsc --noEmit` và commit luôn cho bạn.