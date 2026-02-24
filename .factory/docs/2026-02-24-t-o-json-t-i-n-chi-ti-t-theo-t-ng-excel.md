Đã chốt yêu cầu: tạo file JSON chi tiết trong `public`, mô tả vai trò của từng ô (ví dụ `A1` làm gì), vì format cố định và chỉ thay đổi số liệu.

Kế hoạch triển khai sau khi bạn duyệt:
1. Đọc file `public/Hop dong - Doanh thu.xlsx` bằng skill `excel` (bỏ qua file tạm `~$...`).
2. Duyệt toàn bộ sheet và toàn bộ vùng dữ liệu có dùng (`!ref`).
3. Sinh JSON dạng “từ điển ô” với cấu trúc chi tiết cho từng cell, ví dụ:
   - `sheetName`
   - `cell` (`A1`)
   - `value` hiện tại
   - `type` (string/number/date/formula/blank)
   - `role` (tiêu đề chính, nhãn cột, nhãn hàng, dữ liệu số, tổng, ghi chú, ...)
   - `semanticKey` ổn định để map dữ liệu sau này
   - `isInput` (ô sẽ thay số)
   - `dependsOn` (nếu là công thức)
   - `notes` mô tả nghiệp vụ ngắn
4. Thêm metadata tổng:
   - danh sách sheet
   - range từng sheet
   - version template + timestamp
   - quy tắc nhận diện vai trò ô.
5. Ghi file kết quả vào `public` (ví dụ: `public/hop-dong-doanh-thu-dictionary.json`).
6. Kiểm tra nhanh JSON hợp lệ và báo lại cho bạn đường dẫn + tóm tắt coverage (bao nhiêu sheet, bao nhiêu ô đã map).