## Problem Graph
1. [Main] Điều chỉnh UI/UX bảng `signed-contract-list` theo yêu cầu mới <- depends on 1.1, 1.2, 1.3
   1.1 [ROOT CAUSE] Đang có dropdown nhóm ở header card + ô search cột NHÓM, bị trùng chức năng
   1.2 [ROOT CAUSE] Cột KHÁCH HÀNG và NỘI DUNG chưa giới hạn chiều rộng hợp lý
   1.3 [ROOT CAUSE] Table đang cho phép scroll ngang, không đúng mục tiêu responsive mới

## Execution (with reflection)
1. Chuyển filter cột NHÓM từ input search sang dropdown trong hàng filter
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Bỏ state/markup dropdown nhóm ở phần header card phía trên.
     - Ở hàng filter của table:
       - Cột `group` dùng `<select>` (option: `Tất cả` + danh sách nhóm có trong data).
       - Các cột còn lại vẫn giữ `<input>` search.
     - Điều chỉnh logic filter:
       - Không dùng `columnFilters.group` dạng text nữa.
       - Dùng selected group từ dropdown cột NHÓM để lọc chính xác theo nhóm.
   - Reflection: ✓ Không còn trùng filter, đúng yêu cầu “thay search nhóm bằng dropdown và bỏ dropdown trên”.

2. Giới hạn độ rộng cột KHÁCH HÀNG/NỘI DUNG, cho phép xuống dòng
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi class table cell:
     - `customer` và `content`: đặt `max-w-*` + `whitespace-normal break-words` để wrap.
     - Các cột còn lại vẫn `whitespace-nowrap` để giữ dữ liệu ngắn gọn.
   - Reflection: ✓ Tránh cột dài phá layout, vẫn đọc tốt trên màn hình nhỏ.

3. Bỏ scroll ngang để ưu tiên responsive
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Bỏ `overflow-x-auto` wrapper hiện tại.
     - Dùng table layout phù hợp (`table-fixed` + width cột hợp lý) để nội dung tự co giãn và wrap.
   - Reflection: ✓ Đúng yêu cầu “không scroll ngang”, giao diện responsive sạch hơn.

4. Giữ nguyên các tính năng đã ổn
   - Không đổi logic sort 3 trạng thái từng cột.
   - Không đổi format ngày `dd/MM/yyyy` đã sửa trước đó.
   - Reflection: ✓ Chỉ chỉnh đúng phạm vi yêu cầu, không mở rộng.

5. Verification + commit
   - Chạy: `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `feat(table): refine group filter and responsive column wrapping`.
   - Reflection: ✓ Tuân thủ AGENTS.md.