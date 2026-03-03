## Problem Graph
1. [Main] Cải thiện bảng `signed-contract-list` theo góp ý UI/UX <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Chưa có cơ chế sort từng cột
   1.2 [ROOT CAUSE] Chưa có search riêng cho từng cột
   1.3 [ROOT CAUSE] Cột `NGÀY HĐ` đang hiển thị sai format từ Excel (`1/1/26` thay vì `01/01/2026`)
   1.4 [ROOT CAUSE] Cell table có thể wrap gây rớt dòng

## Execution (with reflection)
1. Chuẩn hóa dữ liệu ngày ngay từ tầng đọc Excel
   - File: `lib/excel.ts`
   - Thay đổi:
     - Trong `buildSignedContracts`, xử lý riêng cột `F` bằng helper `formatExcelDateToDDMMYYYY(...)`.
     - Nếu là Excel serial number -> convert bằng `XLSX.SSF.parse_date_code` rồi format `dd/MM/yyyy` (pad 2 chữ số).
     - Nếu là string ngày (`1/1/26`, `1/1/2026`, `01/01/2026`) -> parse và chuẩn hóa về `dd/MM/yyyy`.
     - Nếu không parse được thì giữ nguyên string gốc (an toàn dữ liệu).
   - Reflection: ✓ Đảm bảo dữ liệu vào UI đã đúng chuẩn ngày, không phụ thuộc browser locale.

2. Bổ sung state sort + filter theo từng cột trong component
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Khai báo `ColumnKey = 'group' | 'customer' | 'contractNo' | 'content' | 'value' | 'contractDate'`.
     - Thêm state:
       - `sortState: { key: ColumnKey; direction: 'asc' | 'desc' } | null`
       - `columnFilters: Record<ColumnKey, string>`
     - Hàm `toggleSort(column)` theo chu kỳ anh chọn: `asc -> desc -> none`.
     - `filteredRows`: áp dụng filter cho từng cột (contains, không phân biệt hoa thường; cột số `value` so theo chuỗi đã format hoặc raw string).
     - `sortedRows`: sort sau filter; với `value` sort số; `contractDate` sort theo timestamp parse từ `dd/MM/yyyy`; các cột còn lại sort locale `vi-VN`.
   - Reflection: ✓ Đúng yêu cầu “mọi cột searchable + sortable”, UI vẫn đơn giản.

3. Cập nhật UI header + row để không rớt dòng
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Header mỗi cột thành nút bấm sort (text + mũi tên trạng thái nhẹ, không rườm rà).
     - Thêm 1 hàng filter ngay dưới header, mỗi cột 1 input (`placeholder` ngắn gọn).
     - Áp `whitespace-nowrap` cho header và các ô, đặc biệt cột `NGÀY HĐ`; thêm `min-w-*` hợp lý để không xuống dòng.
     - Bảng giữ `overflow-x-auto` để nếu hẹp màn hình sẽ scroll ngang thay vì wrap.
   - Reflection: ✓ Tránh rớt dòng, hành vi hiển thị ổn định trên trang chủ.

4. Giữ logic summary theo dataset sau filter nhóm/search
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Summary card sẽ tính theo tập `sortedRows`/`filteredRows` hiện tại (đúng kỳ vọng “lọc nhóm khác nhau thì tổng E thay đổi”).
   - Reflection: ✓ Data summary đồng nhất với bảng đang xem.

5. Verification + commit
   - Chạy: `bunx tsc --noEmit`.
   - Commit local (không push), ví dụ: `feat(table): add per-column sort and search for signed contracts`.
   - Reflection: ✓ Tuân thủ đúng AGENTS.md.