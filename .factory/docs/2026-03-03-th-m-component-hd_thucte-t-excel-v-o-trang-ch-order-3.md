## Problem Graph
1. [Main] Thêm component “Chi tiết danh sách hợp đồng đã ký” lấy từ sheet `HD_Thucte` và render ở trang chủ <- depends on 1.1, 1.2, 1.3, 1.4, 1.5
   1.1 [ROOT CAUSE] Hiện pipeline `loadExcelData` chỉ trả dữ liệu `charts/texts` (metrics), chưa có dữ liệu dạng bảng từ range `A2:F...`
   1.2 Cần mở rộng type để chứa dữ liệu hợp đồng thực tế + summary theo nhóm
   1.3 Cần tạo UI component mới giống ảnh (thẻ summary + bảng chi tiết)
   1.4 Cần gắn component vào layout order mới: chèn row 3, đẩy `opportunity` xuống row 4
   1.5 Cần xử lý filter nhóm để summary “Tổng giá trị” cập nhật theo dữ liệu đang lọc

## Execution (with reflection)
1. Solving 1.1. Mở rộng luồng đọc Excel cho sheet `HD_Thucte`.
   - File: `lib/excel.ts`
   - Thay đổi:
     - Thêm hàm đọc sheet dạng bảng từ `HD_Thucte` với điểm bắt đầu `A2:F...`.
     - Parse từng dòng thành object với mapping cột:
       - A: `group`
       - B: `customer`
       - C: `contractNo`
       - D: `content`
       - E: `value` (number)
       - F: `contractDate` (string hiển thị)
     - Rule dừng/skip: bỏ dòng trống hoàn toàn A-F; giữ dòng có dữ liệu hợp lệ tối thiểu ở A hoặc B hoặc C.
     - Trả thêm nhánh dữ liệu mới trong `ExcelData` (vd: `contractsSigned`), không ảnh hưởng nhánh `charts/texts` hiện tại.
   - Reflection: ✓ Tách riêng read-model bảng, không phá logic chart cũ.

2. Solving 1.2. Cập nhật type để hỗ trợ dữ liệu bảng + filter.
   - File: `types.ts`
   - Thay đổi:
     - Thêm `ExcelChartId` mới: `signed-contract-list` (để đưa vào layout config như item chuẩn).
     - Thêm interface mới, ví dụ:
       - `SignedContractRow` (group, customer, contractNo, content, value, contractDate)
       - `SignedContractSummaryItem` (group, contractCount, totalValue)
     - Mở rộng `ExcelData` để có `contractsSigned: SignedContractRow[]`.
   - Reflection: ✓ Type-safe, App.tsx dễ derive dữ liệu hiển thị/filter.

3. Solving 1.3. Tạo component mới giống ảnh (2 phần).
   - File mới: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Props: `rows`, `title`, optional `defaultGroup = 'all'`.
     - State local: `selectedGroup`, `searchText` (áp dụng tối thiểu theo nhóm như yêu cầu; search giữ đơn giản theo khách hàng/số HĐ/nội dung).
     - Derived data:
       - `filteredRows` theo `selectedGroup` (+ search nếu có).
       - `summaryByGroup` từ `filteredRows` (khi chọn “Tất cả” thì là sum toàn bộ cột E; khi chọn nhóm thì chỉ sum nhóm đó theo yêu cầu).
     - UI:
       - Header: tiêu đề “Chi tiết danh sách hợp đồng đã ký”.
       - Summary cards theo group: hiển thị tên nhóm, số HĐ, tổng giá trị.
       - Bảng cột cố định đúng thứ tự: NHÓM | KHÁCH HÀNG | SỐ HĐ | NỘI DUNG | GIÁ TRỊ | NGÀY HĐ.
       - Format tiền: `vi-VN`.
     - Giữ style Tailwind đồng bộ các component dashboard hiện có.
   - Reflection: ✓ Đáp ứng đúng scope “làm đủ 2 phần như ảnh”, KISS (không thêm tính năng ngoài yêu cầu).

4. Solving 1.4. Nối dữ liệu vào App và renderer/layout.
   - File: `App.tsx`
   - Thay đổi:
     - Import component `SignedContractList`.
     - Trong `derivedData`, lấy `excelData.contractsSigned` và chuẩn hóa nếu cần.
     - Thêm renderer `signed-contract-list` trong `chartRenderers`.
     - Đặt wrapper full-width (`col-span-1 lg:col-span-3`) để giống layout ảnh.
   - File: `lib/excel-spec.ts`
   - Thay đổi layout:
     - Giữ row 1, row 2 như cũ.
     - Chèn row mới order 3: `['signed-contract-list']`.
     - Đẩy `opportunity` xuống order 4.
     - Đẩy donut xuống order 5.
   - File: `App.tsx` (rowLayoutClasses)
   - Thay đổi:
     - Thêm class cho order 5 (hoặc fallback grid hiện có) để giữ layout donut đúng.
   - Reflection: ✓ Bám đúng yêu cầu “component mới ở order 3, opportunity xuống 4”.

5. Solving 1.5. Verification + commit theo rule project.
   - Chạy duy nhất: `bunx tsc --noEmit` (theo AGENTS.md).
   - Nếu pass: commit toàn bộ thay đổi code với message theo convention repo (ví dụ: `feat(home): add HD_Thucte signed contracts section at row order 3`).
   - Không push.
   - Reflection: ✓ Tuân thủ quy định kiểm tra và git workflow của dự án.

## Xác nhận quyết định đã chốt với anh
- Đọc sheet `HD_Thucte` từ dòng `A2:F...`.
- Làm đủ 2 phần UI như ảnh (summary + bảng chi tiết).
- Tổng giá trị tính từ cột `E`, và cập nhật theo filter nhóm.
- Chèn row mới order 3 cho component này; đẩy `opportunity` xuống order 4.