## Plan

Thêm `console.log` vào custom `content` của LabelList để debug:

```tsx
content={({ x, y, width, height, payload }) => {
  console.log('LabelList payload:', payload);
  console.log('x, y, width, height:', x, y, width, height);
  
  const entry = payload as OpportunityChartItem | undefined;
  console.log('entry:', entry);
  console.log('rowType:', entry?.rowType);
  
  if (!entry || entry.rowType !== 'stacked') {
    console.log('Skipped - not stacked');
    return null;
  }
  const total = entry.value2 + entry.value3;
  console.log('total:', total);
  ...
}}
```

Điều này sẽ giúp thấy:
1. `payload` có chứa data đúng không
2. `rowType` có đúng là `'stacked'` không  
3. `total` có giá trị không
4. Tọa độ `x, y, width, height` có hợp lệ không