## Phân tích vấn đề

Code hiện tại (`lib/excel.ts`) **không đọc theo cell reference** (M17, N17, Q35...) mà đọc theo **header text** ("cơ hội", "thực tế", "từ hđ mới"...). Do đó, vấn đề có thể nằm ở:

1. **File Excel gốc** - cấu trúc cột bị thay đổi
2. **Cách mapping header** - logic `buildColumnMap()` đang map sai cột

## Cần xác nhận từ bạn

Để sửa đúng, tôi cần biết:

### Câu hỏi 1: Nguồn Hợp Đồng
- **Hiện tại sai**: Đang lấy cột M17
- **Cần đổi thành**: Cột N17
- Cột N17 có header text là gì? (ví dụ: "từ hđ mới", "cơ hội"...)

### Câu hỏi 2: Nguồn Doanh Thu (tổng)
- **Hiện tại sai**: Đang dùng Q35
- **Cần đổi thành**: O35 + P35
- O35 và P35 có header text là gì? (ví dụ: "từ hđ đã ký", "từ hđ mới"...)

## Phương án sửa

Sau khi có thông tin trên, tôi sẽ:

1. **Sửa `lib/excel.ts`** - cập nhật logic `getMetricKey()` hoặc `buildColumnMap()` để map đúng cột
2. **Sửa `App.tsx`** - nếu cần thay đổi công thức tính (ví dụ O35+P35 thay vì Q35)

Vui lòng cung cấp thêm thông tin về header text trong file Excel để tôi sửa chính xác!