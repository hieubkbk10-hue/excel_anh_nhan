## Problem Graph
1. [Main] Bổ sung khả năng thu gọn/mở rộng section `signed-contract-list` bằng mũi tên dropdown <- depends on 1.1, 1.2
   1.1 [ROOT CAUSE] Card hiện luôn mở, chưa có state collapse
   1.2 [ROOT CAUSE] Header chưa có nút toggle ở bên phải tiêu đề

## Execution (with reflection)
1. Cập nhật component `SignedContractList`
   - File: `components/dashboard/SignedContractList.tsx`
   - Thay đổi:
     - Thêm state `isCollapsed` với mặc định `true` (thu gọn theo yêu cầu).
     - Bổ sung nút toggle ở **bên phải CardHeader**, dùng icon mũi tên (chevron) xoay theo trạng thái.
     - Khi `isCollapsed = true`: chỉ render header, ẩn toàn bộ `CardContent` (summary + table).
     - Khi `isCollapsed = false`: render đầy đủ UI như hiện tại.
   - Reflection: ✓ Đúng yêu cầu “mặc định thu gọn, ẩn toàn bộ nội dung, mũi tên bên phải”.

2. Giữ nguyên logic hiện có
   - Không thay đổi sort/search/filter/date format đã làm trước đó.
   - Toggle chỉ ảnh hưởng hiển thị, không làm mất state filter/sort khi mở lại.
   - Reflection: ✓ Không phá behavior đang ổn.

3. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `feat(ui): add collapsible signed contract section`.
   - Reflection: ✓ Tuân thủ AGENTS.md.