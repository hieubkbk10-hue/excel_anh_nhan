## Plan

Đổi thứ tự bars trong `OpportunityChart.tsx`:

**Hiện tại:**
1. Stacked (value2 + value3) → TRÊN
2. Cam (value1) → DƯỚI

**Sau khi đổi:**
1. Cam (value1) → TRÊN  
2. Stacked (value2 + value3) → DƯỚI

Cụ thể: Move bar `value1` (cam) lên define **trước** stacked bars.