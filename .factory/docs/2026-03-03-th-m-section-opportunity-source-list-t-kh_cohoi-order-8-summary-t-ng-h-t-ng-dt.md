## Problem Graph
1. [Main] Tạo section `opportunity-source-list` từ sheet `KH_CoHoi`, đặt order 8, với summary theo nhóm gồm `Tổng HĐ` và `Tổng DT` <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Chưa có id/dataset cho sheet `KH_CoHoi`
   1.2 [ROOT CAUSE] Chưa có parse cột G và công thức DT theo dòng `H + J + L`
   1.3 [ROOT CAUSE] Chưa có UI bảng + filter dropdown A/C/E cho section mới
   1.4 [ROOT CAUSE] Summary card hiện pattern cũ chỉ 1 tổng, chưa tách `Tổng HĐ` và `Tổng DT`

## Execution (with reflection)
1. Mở rộng type dữ liệu
   - File: `types.ts`
   - Thay đổi:
     - Thêm `opportunity-source-list` vào `ExcelChartId`.
     - Thêm interface row riêng cho `KH_CoHoi` (A-F + G + DT):
       - `group` (A), `customer` (B), `type` (C), `project` (D), `priority` (E), `contractMonth` (F)
       - `contractValue` (G)
       - `revenueValue` (H+J+L theo dòng)
     - Thêm `opportunitySources` vào `ExcelData`.
   - Reflection: ✓ Schema rõ nghĩa, không lạm dụng `SignedContractRow`.

2. Cập nhật source of truth trong `excel-spec.ts`
   - File: `lib/excel-spec.ts`
   - Thay đổi:
     - Dùng `KH_CoHoi_SHEET` cho id mới.
     - Thêm entry `EXCEL_CHART_SPECS`:
       - `id: 'opportunity-source-list'`
       - `sheet: KH_CoHoi_SHEET`
       - `texts.title: 'Nguồn dự án tìm năng'`
       - `metrics`/text config có mention tường minh công thức: `Giá trị DT = H + J + L (theo từng dòng)`.
     - Thêm layout row `{ order: 8, items: ['opportunity-source-list'] }`.
   - Reflection: ✓ Công thức xuất hiện rõ trong source of truth đúng yêu cầu.

3. Parse dữ liệu KH_CoHoi trong loader
   - File: `lib/excel.ts`
   - Thay đổi:
     - Import `KH_CoHoi_SHEET`.
     - Thêm `buildOpportunitySources(...)` đọc A2:L, lấy A-F, G, H, J, L.
     - `contractValue = toNumber(G)`.
     - `revenueValue = toNumber(H) + toNumber(J) + toNumber(L)`.
     - Rule số: giá trị không phải số (`-`, `.`, `...`, rỗng, text) => `0`.
     - Trả về `opportunitySources` trong `loadExcelData`.
   - Reflection: ✓ Đúng rule dữ liệu số anh yêu cầu.

4. Tạo component section mới với behavior yêu cầu
   - File mới: `components/dashboard/OpportunitySourceList.tsx`
   - Thay đổi:
     - UI bảng tương tự các section hiện tại (collapse/sort/search/filter).
     - Dropdown filter cho A (Nhóm), C (Loại), E (Mức độ).
     - Cột còn lại search text.
     - Cột hiển thị gồm: NHÓM, KHÁCH HÀNG, LOẠI, CƠ HỘI/DỰ ÁN, MỨC ĐỘ, THÁNG HĐ, GIÁ TRỊ HĐ, GIÁ TRỊ DT.
     - Summary theo từng nhóm (khối G2B/ITO...):
       - `Số HĐ`
       - `Tổng HĐ` = sum cột G theo nhóm
       - `Tổng DT` = sum (H+J+L) theo nhóm
   - Reflection: ✓ Bổ sung đúng điểm anh vừa chốt cho summary card.

5. Nối vào App
   - File: `App.tsx`
   - Thay đổi:
     - Derived data cho title + rows của `opportunity-source-list`.
     - Thêm renderer id mới.
     - Bổ sung `rowLayoutClasses[8]`.
   - Reflection: ✓ Section mới xuất hiện đúng order 8, không ảnh hưởng section cũ.

6. Verification + commit
   - Chạy `bunx tsc --noEmit`.
   - Commit local (không push), message gợi ý: `feat(home): add KH_CoHoi opportunity source section`.
   - Reflection: ✓ Tuân thủ AGENTS.md và pattern các commit gần nhất.