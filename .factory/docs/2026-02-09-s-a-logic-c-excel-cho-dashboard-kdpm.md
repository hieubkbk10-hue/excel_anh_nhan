## Phân tích Excel mới

### Bảng HỢP ĐỒNG (Row 17 - Năm):
| Nhóm | Kế hoạch | Từ HĐ mới | Thực tế |
|------|----------|-----------|---------|
| ITO | 11 tỷ | 11 tỷ | 10.5 tỷ |
| UNI | 11 tỷ | 14.18 tỷ | 8.95 tỷ |
| G2B | 9.5 tỷ | 8.97 tỷ | 6.1 tỷ |
| **BPPM** | **31.5 tỷ** | **34.15 tỷ** | **25.55 tỷ** |

### Bảng DOANH THU (Row 38 - Đến hiện tại):
| Nhóm | Kế hoạch | Từ HĐ đã ký | Từ HĐ mới | Thực tế |
|------|----------|-------------|-----------|---------|
| ITO | 11 tỷ | - | 11 tỷ | 10.5 tỷ |
| UNI | 8.8 tỷ | 2.18 tỷ | 13.67 tỷ | 7.3 tỷ |
| G2B | 8.55 tỷ | 1.26 tỷ | 3.6 tỷ | 7.35 tỷ |
| **BPPM** | **28.35 tỷ** | **3.44 tỷ** | **28.27 tỷ** | **25.15 tỷ** |

---

## Vấn đề cần sửa

### 1. Cột "Cơ hội" đã đổi thành "Từ HĐ mới"
- File `lib/excel.ts` đang tìm keyword "cơ hội" nhưng Excel mới dùng "từ hđ mới"
- Cần cập nhật `getMetricKey()` function

### 2. "Nguồn Hợp Đồng" donut chart
- **Hiện tại**: Lấy cột "Thực tế" của ITO/UNI/G2B
- **Yêu cầu**: Lấy cột "Từ HĐ mới" của ITO/UNI/G2B

### 3. "Hợp đồng dự kiến" = BPPM "Từ HĐ mới" = 34.15 tỷ (108.4% so với KH 31.5 tỷ)

---

## File Changes

| File | Thay đổi |
|------|----------|
| `lib/excel.ts` | Cập nhật `getMetricKey()` để nhận diện "từ hđ mới" thay vì "cơ hội" |
| `App.tsx` | Sửa `contractDonutData` lấy từ `fromNew` thay vì `actual` |

---

## Mapping sau khi sửa

| Dashboard | Excel Column |
|-----------|--------------|
| Giá trị hợp đồng (Thực tế) | BPPM Thực tế (N17) = 25.55 tỷ |
| Giá trị hợp đồng (KH) | BPPM Kế hoạch (L17) = 31.5 tỷ |
| Hợp đồng dự kiến | BPPM Từ HĐ mới (M17) = 34.15 tỷ |
| Nguồn Hợp Đồng (ITO) | ITO Từ HĐ mới (D17) = 11 tỷ |
| Nguồn Hợp Đồng (UNI) | UNI Từ HĐ mới (G17) = 14.18 tỷ |
| Nguồn Hợp Đồng (G2B) | G2B Từ HĐ mới (J17) = 8.97 tỷ |