## Problem Graph
1. [Main] Thêm biểu đồ mới vào `EXCEL_CHART_SPECS` và chèn đúng vị trí trong `rowGroups` order 6 <- depends on 1.1, 1.2
   1.1 [Sub] Khai báo chart spec mới đúng convention id/title/sheet/metrics
   1.2 [Sub] Cập nhật layout để chart mới nằm giữa `donut-contract` và `donut-revenue`

## Execution (with reflection)
1. Solving 1.1...
   - Thought: File hiện tại đã có pattern donut chart (`donut-contract`, `donut-revenue`), nên chỉ cần thêm object mới theo đúng cấu trúc `id/sheet/texts/metrics`.
   - Action: Trong `lib/excel-spec.ts`, thêm 1 item mới trong `EXCEL_CHART_SPECS` ngay sau `donut-contract`:
     - `id: 'donut-revenue-source'`
     - `sheet: DEFAULT_SHEET`
     - `texts.title: 'Nguồn doanh thu'`
     - `metrics`:
       - `ito: 'D35'`
       - `uni: '(G35+H35)'`
       - `g2b: '(K35+L35)'`
       - `total: '(N35+O35)'`
   - Reflection: ✓ Khớp yêu cầu user + giữ consistency với format formula có ngoặc đã chốt.

2. Solving 1.2...
   - Thought: Muốn chart nằm giữa 2 chart cũ thì chỉ cần chèn id vào giữa mảng `items` của group `order: 6`.
   - Action: Sửa `EXCEL_LAYOUT_CONFIG.rowGroups` tại `order: 6` từ:
     - `['donut-contract', 'donut-revenue']`
     thành:
     - `['donut-contract', 'donut-revenue-source', 'donut-revenue']`
   - Reflection: ✓ Đảm bảo thứ tự render đúng theo yêu cầu “nằm giữa”.

3. Verification plan sau khi implement (theo rule repo)
   - Chạy: `bunx tsc --noEmit`
   - Nếu pass: commit local (không push) với message ngắn gọn theo style repo, ví dụ:
     - `feat(excel-spec): add donut revenue source chart in order 6`
   - Reflection: ✓ Tuân thủ AGENTS.md (chỉ chạy tsc, có thay đổi code thì phải commit).

Nếu anh/chị duyệt spec này, em sẽ implement đúng các bước trên ngay.