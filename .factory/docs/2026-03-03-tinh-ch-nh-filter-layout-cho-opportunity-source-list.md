## Problem Graph
1. [Main] Tinh chỉnh bảng `opportunity-source-list` để dễ đọc hơn <- depends on 1.1, 1.2
   1.1 [ROOT CAUSE] Cột `THÁNG HĐ` đang dùng input text, chưa đồng nhất dropdown như `MỨC ĐỘ`
   1.2 [ROOT CAUSE] Width cột `MỨC ĐỘ`/`THÁNG HĐ` hơi hẹp và `NHÓM`/`LOẠI` hơi rộng gây chồng text

## Execution (with reflection)
1. Đổi filter cột `THÁNG HĐ` sang dropdown
   - File: `components/dashboard/OpportunitySourceList.tsx`
   - Thay đổi:
     - Thêm state `selectedContractMonth` (mặc định `all`).
     - Tạo `contractMonthOptions` từ unique values cột F + option `Tất cả`.
     - Trong logic filter, áp điều kiện theo `selectedContractMonth` tương tự A/C/E.
     - Ở hàng filter table, cột `THÁNG HĐ` render `<select>` thay vì `<input>`.
   - Reflection: ✓ Đồng nhất UX dropdown theo yêu cầu.

2. Tinh chỉnh chiều rộng cột để tránh chồng text
   - File: `components/dashboard/OpportunitySourceList.tsx`
   - Thay đổi class width:
     - Giảm nhẹ width cột `NHÓM`, `LOẠI`.
     - Tăng width cột `MỨC ĐỘ`, `THÁNG HĐ`.
     - Có thể tăng thêm khoảng đệm ngang (`px`) riêng cho 2 cột `MỨC ĐỘ`/`THÁNG HĐ` ở header/body để dễ đọc.
   - Reflection: ✓ Đúng mục tiêu “tăng width MỨC ĐỘ, THÁNG HĐ; giảm NHÓM, LOẠI nhẹ”.

3. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `feat(ui): refine opportunity source column filters and spacing`.
   - Reflection: ✓ Tuân thủ AGENTS.md.