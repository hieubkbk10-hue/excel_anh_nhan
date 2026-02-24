## Vấn đề hiện tại

Code đang clamp tỷ lệ % tối đa 100%:
```typescript
const contractForecastPercentClamped = Math.min(derivedData.contractForecastPercent, 100);
const revenueForecastPercentClamped = Math.min(derivedData.revenueForecastPercent, 100);
```

## Công thức đúng theo Excel

| Chỉ số | Công thức | Giá trị |
|--------|-----------|---------|
| Hợp đồng dự kiến % | M17 / L17 | 34.15 / 31.5 = **108.4%** |
| Doanh thu dự kiến % | (O35 + P35) / N35 | (3.44 + 28.27) / 28.35 = **111.9%** |

## File Changes

| File | Thay đổi |
|------|----------|
| `App.tsx` | Bỏ `Math.min(..., 100)` để hiển thị tỷ lệ thực, chỉ clamp cho progress bar width |

## Code sau khi sửa
```typescript
// Hiển thị % thực (có thể > 100%)
const contractForecastPercent = derivedData.contractForecastPercent;
const revenueForecastPercent = derivedData.revenueForecastPercent;

// Progress bar width vẫn clamp ở 100%
const contractBarWidth = Math.min(contractForecastPercent, 100);
const revenueBarWidth = Math.min(revenueForecastPercent, 100);
```