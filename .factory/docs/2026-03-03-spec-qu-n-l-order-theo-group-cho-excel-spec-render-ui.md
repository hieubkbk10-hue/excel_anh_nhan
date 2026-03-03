## Problem Graph
1. [Main] Áp dụng source-control order cho toàn bộ bảng + thứ tự render UI <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Cấu trúc spec hiện tại là mảng phẳng, không có metadata order/group
   1.2 App.tsx đang render theo hard-code layout cố định, không đọc order từ config
   1.3 Cần rule riêng cho layout id (`header-plans`) với `order = "layout"` tách khỏi sort số
   1.4 Cần map group cùng order thành 1 object `{ order, items: [...] }`

## Execution (with reflection)
1. Cập nhật model type để hỗ trợ order-group
   - File: `types.ts`
   - Thay đổi:
     - Thêm type mới:
       - `type ExcelChartOrder = number | 'layout'`
       - `interface ExcelChartOrderGroup { order: number; items: ExcelChartId[] }`
     - Tạo config type cho source-control:
       - `interface ExcelLayoutConfig { layoutItems: ExcelChartId[]; rowGroups: ExcelChartOrderGroup[] }`
   - Reflection: ✓ Valid vì tách rõ layout và non-layout, không phá type hiện có của `ExcelChartSpec`.

2. Refactor `excel-spec.ts` sang cấu trúc source-of-truth theo group order
   - File: `lib/excel-spec.ts`
   - Thay đổi:
     - Giữ nguyên `EXCEL_CHART_SPECS` (metrics/texts không đổi) để tránh ảnh hưởng parser Excel hiện tại.
     - Thêm constant mới, ví dụ:
       - `EXCEL_LAYOUT_CONFIG: ExcelLayoutConfig = {`
       - `layoutItems: ['header-plans'],`
       - `rowGroups: [`
       - `  { order: 1, items: ['kpi-contract', 'kpi-revenue', 'forecast'] },`
       - `  { order: 2, items: ['group-contract', 'group-revenue'] },`
       - `  { order: 3, items: ['opportunity'] },`
       - `  { order: 4, items: ['donut-contract', 'donut-revenue'] }`
       - `] }`
     - Rule enforce bằng runtime guard nhẹ (optional trong cùng file): validate id không trùng giữa layoutItems và rowGroups, validate mỗi id xuất hiện tối đa 1 lần.
   - Reflection: ✓ Valid theo đúng yêu cầu “cùng order thì gom vào chung 1 {}” và “layout là chữ, tách riêng”.

3. Tạo helper resolve thứ tự render từ config
   - File mới: `lib/layout-order.ts`
   - Thay đổi:
     - Export function `buildRenderRows(config: ExcelLayoutConfig): Array<{ type: 'layout' | 'row'; order: 'layout' | number; items: ExcelChartId[] }>`
     - Logic:
       - layout luôn đứng trên cùng theo rule tách riêng
       - `rowGroups` sort tăng dần theo `order`
       - item trong cùng group giữ nguyên thứ tự khai báo
   - Reflection: ✓ Valid vì tách logic order khỏi UI component, KISS + DRY.

4. Refactor App.tsx để render theo order config thay vì hard-code cố định
   - File: `App.tsx`
   - Thay đổi chính:
     - Import `EXCEL_LAYOUT_CONFIG` và `buildRenderRows`.
     - Giữ nguyên phần tính `derivedData` (không đổi business metrics).
     - Tách render từng chart block thành map `chartRenderers: Record<ExcelChartId, () => ReactNode>` để mỗi id biết cách render component tương ứng.
     - Render theo vòng lặp `renderRows`:
       - Nếu `type === 'layout'`: render các item layout (hiện tại là `header-plans`)
       - Nếu `type === 'row'`: render 1 container row, map `items` bên trong đúng thứ tự config.
     - Với group order = 1, đảm bảo 3 item `kpi-contract`, `kpi-revenue`, `forecast` cùng nằm 1 row.
   - Reflection: ✓ Valid vì UI order chuyển hoàn toàn sang source-control, không còn lệ thuộc vị trí hard-code trong JSX.

5. Chạy kiểm tra kiểu TypeScript
   - Command: `bunx tsc --noEmit`
   - Mục tiêu: đảm bảo refactor type-safe theo rule AGENTS.
   - Reflection: ✓ Đây là bước verify bắt buộc trước commit theo guideline repo.

6. Commit sau khi pass typecheck
   - Bước git:
     - `git diff --cached` (review secrets)
     - `git status`
     - `git add` các file thay đổi (`types.ts`, `lib/excel-spec.ts`, `lib/layout-order.ts`, `App.tsx`)
     - commit message đề xuất: `feat(layout): control dashboard row order via excel spec groups`
   - Reflection: ✓ Tuân thủ yêu cầu “mọi thay đổi code hoàn thành đều phải commit, không push”.

### Kết quả mong đợi sau triển khai
- Một nguồn cấu hình duy nhất quản lý thứ tự dashboard.
- Item cùng `order` được gom đúng 1 object group `{ order, items }`.
- `header-plans` được đánh dấu layout riêng, không tham gia sort số.
- Thứ tự hiển thị UI tự động bám theo config trong `excel-spec.ts`.