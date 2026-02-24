## Mục tiêu
Chuyển toàn bộ logic render trang chủ đang dùng `public/Hop dong - Doanh thu.xlsx` sang `public/input.xlsx` mà **không sai dữ liệu** và vẫn tương thích cấu trúc app hiện tại.

## Hiện trạng đã xác nhận
- App đang trỏ file cũ trong `lib/excel.ts`: `const EXCEL_URL = '/Hop dong - Doanh thu.xlsx'`.
- Có metadata/mapping hỗ trợ trong `public/input.json` và `public/hop-dong-doanh-thu-dictionary.json`.
- `input.xlsx` đã tồn tại trong `public` và là bản đầy đủ hơn.

## Phạm vi thực hiện
1. Khảo sát toàn bộ flow render homepage:
   - Component/page nào gọi parser Excel.
   - Các selector/mapper nào phụ thuộc cứng theo cell/sheet.
2. So sánh workbook cũ vs `input.xlsx`:
   - Danh sách sheet, vùng dữ liệu (`!ref`), merge, ô công thức, ô numeric quan trọng.
3. Chuẩn hóa mapping theo dictionary:
   - Dùng `input.json` + dictionary làm nguồn mô tả ý nghĩa ô.
   - Giảm hardcode trực tiếp cell rời rạc trong UI logic.
4. Refactor luồng đọc dữ liệu:
   - Đổi nguồn file mặc định sang `input.xlsx`.
   - Thêm guard/fallback khi thiếu sheet/cell để tránh render sai im lặng.
5. Xác minh và kiểm thử:
   - Chạy lint/typecheck/test (theo scripts repo).
   - Kiểm tra route trang chủ hiển thị đúng các nhóm số liệu chính.

## Kế hoạch chỉnh sửa chi tiết theo file
- `lib/excel.ts`
  - Đổi hằng `EXCEL_URL` -> `/input.xlsx`.
  - Bổ sung cơ chế đọc workbook an toàn (validate sheet/cell tồn tại trước khi parse).
- Các file dùng dữ liệu homepage (sẽ xác định chính xác sau khi scan):
  - Tách lớp ánh xạ `cellKey -> business field` (nếu đang rải rác).
  - Thay truy xuất cứng bằng hàm helper đọc từ metadata.
- (Nếu cần) thêm module helper mới trong `lib/`:
  - Ví dụ: `lib/excel-mapping.ts` để gom logic map từ dictionary/input.json.

## Quy tắc an toàn dữ liệu
- Ưu tiên `input.json` làm nguồn truth cho meaning/type.
- Chỉ render khi key hợp lệ; thiếu key thì throw/console error có ngữ cảnh (sheet + cell + field).
- Không thay đổi format hiển thị số nếu chưa có yêu cầu.

## Validation gate (bắt buộc trước khi chốt)
1. Chạy `lint`.
2. Chạy `typecheck`.
3. Chạy test hiện có.
4. Smoke check trang chủ (dev build) để đảm bảo không crash và số liệu đúng mapping.

## Tiêu chí hoàn thành
- Homepage render hoàn chỉnh bằng `input.xlsx`.
- Không còn phụ thuộc runtime vào file cũ.
- Mapping bám `input.json`/dictionary, không sai field trọng yếu.
- Validator pass.

## Rủi ro & hướng xử lý
- **Rủi ro 1:** Tên sheet giữa file cũ/mới lệch nhẹ.
  - Xử lý: thêm sheet alias map hoặc resolver theo metadata.
- **Rủi ro 2:** Ô merged/công thức làm lệch giá trị đọc.
  - Xử lý: normalize cell value + ưu tiên ô nguồn theo dictionary.
- **Rủi ro 3:** UI đang phụ thuộc hardcode ẩn.
  - Xử lý: scan toàn repo theo chuỗi cell/sheet/file-name trước khi sửa.

## Kết quả bàn giao
- Code đã chuyển sang `input.xlsx`.
- Mapping logic rõ ràng, tập trung, dễ bảo trì.
- Báo cáo ngắn các field quan trọng đã đối chiếu đúng theo dictionary.