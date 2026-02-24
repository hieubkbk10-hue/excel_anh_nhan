Mình sẽ triển khai theo hướng sau (chưa thực thi):

1. Đọc `public/hop-dong-doanh-thu-dictionary.json` để xác định các field cốt lõi app đang dùng và quy ước key theo cell (ví dụ `A1`).
2. Dùng skill `excel` để parse file `public/Hop_dong_doanh_thu_BPPM_nam_2026.xlsx` trên **toàn bộ workbook**.
3. Tạo file mới `public/hop-dong-doanh-thu-dictionary-2026.json` với schema tối ưu nhưng vẫn tương thích app:
   - Chỉ giữ các ô có dữ liệu (bỏ ô trống).
   - Giữ mapping theo sheet + cell để tra cứu nhanh.
   - Bổ sung metadata tối thiểu phục vụ xử lý (ví dụ danh sách sheet, merge info nếu cần cho render/điền liệu) nhưng không phá vỡ cách đọc hiện tại.
4. So khớp nhanh với cấu trúc app đang đọc dictionary (search nơi consume JSON) để đảm bảo không lỗi runtime.
5. Chạy validator của project (ít nhất build/typecheck/lint theo script có sẵn) để xác nhận thay đổi an toàn.
6. Báo lại đường dẫn file tạo mới và tóm tắt schema cuối cùng.

Nếu bạn duyệt spec này, mình sẽ bắt đầu thực thi ngay.