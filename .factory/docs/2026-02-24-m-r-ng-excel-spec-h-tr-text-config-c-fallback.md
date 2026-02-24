## Problem Graph
1. [Main] Mở rộng cấu hình text trong `lib/excel-spec.ts` để hỗ trợ cả literal và đọc từ Excel, vẫn fallback an toàn
   1.1 [Sub] Chuẩn hóa shape type cho text config <- depends on 1.1.1
      1.1.1 [ROOT CAUSE] Hiện `texts` chỉ là `Record<string,string>` nên không biểu diễn được "excel expression + fallback"
   1.2 [Sub] Nâng `buildTexts` để resolve text theo config mới mà không phá backward compatibility
   1.3 [Sub] Cập nhật spec thực tế cho các chart (ví dụ `kpi-contract`) và giữ hành vi cũ
   1.4 [Sub] Validate type check + commit theo rule repo

## Execution (with reflection)
1. Solving 1.1.1 (types)
   - Thought: Cần type rõ ràng để biểu diễn text từ Excel và fallback literal.
   - Action: Trong `types.ts`, thêm type mới:
     - `type ExcelTextConfig = string | { value?: string; from?: string; fallback?: string }`
     - đổi `texts?: Record<string, string>` -> `texts?: Record<string, ExcelTextConfig>`
   - Reflection: ✓ Vừa hỗ trợ literal cũ (`"Giá trị hợp đồng"`), vừa hỗ trợ config mạnh hơn.

2. Nâng runtime resolve text
   - Thought: `buildTexts` hiện đang trả trực tiếp spec literal, chưa đọc Excel cho text.
   - Action: Trong `lib/excel.ts`:
     - đổi `buildTexts(specs)` thành `buildTexts(workbook, specs)`.
     - thêm `resolveText(config, workbook, sheetName)`:
       - Nếu `config` là string:
         - nếu trông như expression/cell hợp lệ thì thử đọc từ Excel (qua helper đọc cell hiện có);
         - nếu đọc không ra thì trả lại chính string đó (coi là literal fallback).
       - Nếu `config` là object:
         - nguồn ưu tiên: `from` (đọc từ Excel) -> `value` -> `fallback` -> `''`.
     - thêm helper `getCellTextValue(...)` dùng `resolveReference`, đọc raw cell và convert string an toàn (`null/undefined` => '').
   - Reflection: ✓ Đảm bảo fallback luôn có, và không ảnh hưởng metric evaluator hiện có.

3. Cập nhật spec ở `lib/excel-spec.ts`
   - Thought: User muốn “tăng sức mạnh” và vẫn fallback trong code.
   - Action: Cập nhật ví dụ thực tế:
     - `kpi-contract.texts.title` từ string thành object, ví dụ:
       - `{ from: 'B5', fallback: 'Giá trị hợp đồng' }`
     - Các chart khác có thể giữ nguyên string để backward compatibility.
   - Reflection: ✓ Thể hiện rõ cơ chế mới nhưng không bắt buộc migrate toàn bộ ngay.

4. Giữ tương thích dữ liệu đầu ra
   - Thought: `ExcelData.texts` vẫn cần `Record<string,string>` để UI không đổi.
   - Action: Chỉ đổi input spec type; output từ `buildTexts` vẫn normalize thành string thuần.
   - Reflection: ✓ Tránh lan thay đổi sang component/UI.

5. Validation + commit (theo AGENTS.md)
   - Thought: Rule repo yêu cầu chỉ chạy typecheck trước commit khi đổi TS/code.
   - Action:
     - chạy `bunx tsc --noEmit`
     - nếu pass: commit với message ngắn theo convention hiện tại, ví dụ `feat(excel): support configurable text source with fallback`
   - Reflection: ✓ Tuân thủ đúng guideline local project.

## File-level change list
1. `types.ts`
   - Thêm type `ExcelTextConfig`.
   - Cập nhật `ExcelChartSpec.texts` dùng `Record<string, ExcelTextConfig>`.

2. `lib/excel.ts`
   - `loadExcelData`: truyền workbook vào `buildTexts`.
   - `buildTexts`: resolve từng text key thành string.
   - Thêm `resolveText`, `getCellTextValue`, và util check expression/cell text-friendly.

3. `lib/excel-spec.ts`
   - Chuyển ít nhất 1 text literal mẫu (`kpi-contract.title`) sang object config có `from` + `fallback`.
   - Giữ các text literal còn lại để chứng minh tương thích ngược.

## Kết quả mong đợi
- Có thể cấu hình text như `"Giá trị hợp đồng"` (literal) hoặc text từ Excel (`from: 'B5'`) với fallback.
- Không phá behavior cũ.
- Typecheck pass và có commit local (không push).