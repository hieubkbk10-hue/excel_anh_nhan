## Lỗi phát hiện

Biến `revenueFromSignedTotal` được định nghĩa bên trong `useMemo` hook nhưng được sử dụng trực tiếp trong JSX (ngoài scope của useMemo).

## Sửa lỗi

Thay đổi dòng 270 trong `App.tsx`:

```tsx
// Sai (biến không tồn tại ở scope này):
revenueTotal={revenueFromSignedTotal + revenueFromNewTotal}

// Đúng (dùng từ derivedData):
revenueTotal={derivedData.revenueForecast}
```

Biến `derivedData.revenueForecast` đã được tính sẵn trong useMemo với công thức `revenueFromSignedTotal + revenueFromNewTotal` (O35 + P35).