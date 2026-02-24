## Problem Graph
1. [Main] Refactor Excel parsing + render sang kiến trúc mở rộng tốt, mỗi bảng độc lập <- depends on 1.1, 1.2, 1.3, 1.4
   1.1 [ROOT CAUSE] Logic parse đang phụ thuộc label/header động, coupling cao giữa các bảng
   1.2 [Sub] Chưa có single source of truth để khai báo dữ liệu theo ô tuyệt đối + công thức
   1.3 [Sub] Kiểu dữ liệu output hiện tại gắn chặt vào contract/revenue cũ
   1.4 [Sub] Render layer chưa tách theo component data độc lập cho từng bảng

## Execution (with reflection)
1. Solving 1.1.1 (ROOT CAUSE) — thiết kế lại parser theo absolute reference
   - Thought: Cần engine đọc ô theo `Sheet!A1` và evaluator công thức cơ bản `(A1+A2)/A3` để dev tự định nghĩa metric.
   - Action:
     - Tạo evaluator nhỏ trong `lib/excel.ts` (hoặc module con) hỗ trợ:
       - token: cell ref (`A1`, `Sheet1!B3`), number literal, `+ - * / ( )`
       - resolve cell tuyệt đối từ workbook/sheet object
       - fallback giá trị `0` khi ô trống/không parse được
     - Không dùng dynamic scan theo header/label nữa.
   - Reflection: ✓ Đúng mục tiêu “dev-defined absolute coordinates”, giảm coupling.

2. Solving 1.2 — tạo single source of truth trong `lib/excel-spec.ts`
   - Thought: Cần 1 file khai báo toàn bộ bảng/biểu đồ, input độc lập, công thức độc lập.
   - Action: Tạo `lib/excel-spec.ts` chứa schema kiểu:
     - `type MetricExpr = string` (vd: `"KPI!A1"`, `"(KPI!A1+KPI!A2)/KPI!A3"`)
     - `type ChartSpec = { id, sheet?, metrics: Record<string, MetricExpr> }`
     - `export const EXCEL_CHART_SPECS: ChartSpec[] = [...]`
   - Reflection: ✓ Single source of truth rõ ràng, thêm chart mới chỉ cần thêm spec.

3. Solving 1.3 — đổi output shape sang per-component độc lập
   - Thought: Bạn muốn shape mới, không ràng buộc contract/revenue cũ.
   - Action:
     - Cập nhật type trong `types.ts`:
       - bỏ/không dùng `ExcelSectionData`, `ExcelGroupMetrics` cũ
       - thêm kiểu mới như `ExcelChartData = { id: string; metrics: Record<string, number> }`
       - `ExcelData = { charts: ExcelChartData[] }`
     - `loadExcelData()` trả về `charts` theo thứ tự spec.
   - Reflection: ✓ Dữ liệu tách biệt hoàn toàn theo chart, đúng “bảng 1 không liên quan bảng 2”.

4. Solving 1.4 — full end-to-end render + xóa logic cũ
   - Thought: Cần mỗi bảng render từ function riêng, nhận đúng data của nó.
   - Action:
     - Tìm nơi đang dùng `data.contract` / `data.revenue` (likely `App.tsx`, `components/*`).
     - Tạo mapping renderer theo `chart.id`:
       - mỗi chart có function component riêng (vd `renderContractChart(data)`, `renderRevenueChart(data)` hoặc component độc lập nhận `metrics`).
       - parent chỉ loop `charts` và route theo `id`.
     - Xóa toàn bộ logic parse/header map cũ trong `lib/excel.ts`.
   - Reflection: ✓ End-to-end đúng yêu cầu, tăng khả năng mở rộng.

5. Validation + commit (theo AGENTS.md)
   - Action:
     - Chạy `bunx tsc --noEmit` sau khi refactor code TS.
     - Nếu lỗi: sửa tới khi pass.
     - Commit local (không push) với message mô tả refactor single-source-of-truth.
   - Reflection: ✓ Tuân thủ rule dự án.

## Thay đổi file dự kiến (step-by-step actionable)
1. `lib/excel-spec.ts` (new)
   - Khai báo toàn bộ chart specs + metric expressions theo absolute cell refs/công thức.
2. `lib/excel.ts`
   - Đọc workbook.
   - Thực thi evaluator expression cho từng metric trong spec.
   - Trả output shape mới `{ charts: [...] }`.
   - Xóa parse logic cũ dựa label/header (`parseTable`, `buildColumnMap`, ...).
3. `types.ts`
   - Định nghĩa type mới cho chart-based data.
   - Remove/stop-export type cũ nếu không còn dùng.
4. `App.tsx` + các file trong `components/` liên quan
   - Refactor sang render function/component độc lập cho từng chart.
   - Mỗi component chỉ nhận data chart tương ứng, không phụ thuộc chart khác.
5. Cleanup usage
   - Sửa tất cả import/type/use-site theo shape mới.

## Kết quả mong đợi sau refactor
- Muốn thêm bảng/biểu đồ mới: chỉ cần thêm 1 spec trong `lib/excel-spec.ts` + 1 renderer/component.
- Metric được định nghĩa bằng absolute refs/công thức do dev kiểm soát.
- Các bảng độc lập hoàn toàn, không còn coupling parse theo header/label.
- Code dễ maintain/mở rộng hơn rõ rệt.