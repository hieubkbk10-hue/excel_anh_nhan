## Root Cause
Trong Recharts với `layout="vertical"`, khi có **stacked bars** (value2+value3 với `stackId="a"`) và **non-stacked bar** (value1 không có stackId), thứ tự define của `<Bar>` components **KHÔNG** quyết định vị trí hiển thị.

Recharts render stacked bars và non-stacked bars theo logic riêng, không theo thứ tự code.

## Solution
Thêm prop `reverseStackOrder={true}` vào `<BarChart>` component để đảo thứ tự hiển thị các bars.

```tsx
<BarChart
    layout="vertical"
    data={data}
    reverseStackOrder={true}  // <-- Thêm dòng này
    ...
>
```

Nếu `reverseStackOrder` không hoạt động đúng ý, sẽ chuyển sang cách 2: gộp tất cả bars vào cùng stackId và điều khiển qua thứ tự code.