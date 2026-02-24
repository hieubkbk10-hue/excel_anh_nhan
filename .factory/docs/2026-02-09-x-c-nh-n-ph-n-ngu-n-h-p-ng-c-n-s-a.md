## Kiểm tra lại

Tôi đã sửa `contractDonutData` để dùng `.actual` (N17 - Thực tế):
```tsx
const contractDonutData: DonutDataItem[] = [
  { name: 'ITO', value: contract.ito.actual },
  { name: 'UNI', value: contract.uni.actual },
  { name: 'G2B', value: contract.g2b.actual }
];
```

## Câu hỏi xác nhận

Phần nào của "Nguồn Hợp Đồng" vẫn sai?

1. **contractDonutData** (dữ liệu 3 phần ITO/UNI/G2B trong donut) - đã sửa dùng `.actual`
2. **contractTotal** (số tổng hiển thị ở giữa donut) - đang dùng `excelData.contract.total.actual`

Nếu `contractTotal` cũng cần thay đổi, vui lòng cho biết nên dùng giá trị nào?