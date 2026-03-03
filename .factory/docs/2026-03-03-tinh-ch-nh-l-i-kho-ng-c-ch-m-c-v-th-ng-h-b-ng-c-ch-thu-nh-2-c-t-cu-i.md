## Problem Graph
1. [Main] Tránh đè text giữa cột `MỨC ĐỘ` và `THÁNG HĐ` trong `opportunity-source-list` <- depends on 1.1
   1.1 [ROOT CAUSE] 2 cột cuối (`GIÁ TRỊ HĐ`, `GIÁ TRỊ DT`) đang chiếm chiều ngang hơi lớn, làm vùng `MỨC ĐỘ`/`THÁNG HĐ` vẫn chật.

## Execution (with reflection)
1. Giảm width 2 cột cuối để nhường chỗ
   - File: `components/dashboard/OpportunitySourceList.tsx`
   - Thay đổi:
     - Thu nhỏ width header của `contractValue` và `revenueValue` (ví dụ về `w-28`/`w-30` tùy mức hợp lý).
     - Giữ `text-right`, `whitespace-nowrap` cho giá trị số để không vỡ layout.
   - Reflection: ✓ Đúng yêu cầu “giảm 2 cột cuối xíu”.

2. Cân lại spacing giữa `MỨC ĐỘ` và `THÁNG HĐ`
   - File: `components/dashboard/OpportunitySourceList.tsx`
   - Thay đổi:
     - Giữ tăng padding ngang cho 2 cột `priority` và `contractMonth` (đã có), kết hợp với width mới của 2 cột cuối để tạo khoảng tách rõ hơn.
   - Reflection: ✓ Giảm khả năng đè text mà không đổi behavior filter/sort.

3. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `fix(ui): adjust opportunity source column widths for readability`.
   - Reflection: ✓ Tuân thủ AGENTS.md.