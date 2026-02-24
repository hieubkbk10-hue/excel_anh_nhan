## Root Cause
Lỗi `Cannot read properties of undefined (reading 'rowType')` xảy ra vì `LabelList` formatter không nhận được `entry` object như kỳ vọng - Recharts truyền tham số khác.

## Fix
Sửa LabelList để dùng custom `content` prop thay vì `formatter`, vì `content` cho phép truy cập đầy đủ data của từng bar:

```tsx
<LabelList
    content={({ x, y, width, height, value, ...props }) => {
      const entry = props.payload as OpportunityChartItem;
      if (entry.rowType !== 'stacked') return null;
      const total = entry.value2 + entry.value3;
      if (!total) return null;
      return (
        <text
          x={(x as number) + (width as number) + 10}
          y={(y as number) + (height as number) / 2}
          ...
        >
          {total.toLocaleString('vi-VN')}
        </text>
      );
    }}
/>
```

Điều này đảm bảo truy cập đúng `rowType` và tính tổng `value2 + value3` cho stacked bars.