---
name: excel
description: "Đọc, phân tích và trích xuất template từ file Excel (.xlsx, .xls). Sử dụng khi: (1) User cần đọc/phân tích file Excel, (2) Trích xuất cấu trúc/template từ Excel, (3) Hiểu format dữ liệu trong spreadsheet, (4) Chuyển đổi Excel sang JSON/Object, (5) Phân tích headers, columns, data types trong Excel."
version: 1.0.0
---

# Excel Reader & Template Extractor

## Overview

Skill này giúp agent đọc, phân tích và trích xuất template từ file Excel. Hỗ trợ:

1. **Đọc file Excel**: Parse .xlsx/.xls files
2. **Trích xuất template**: Xác định cấu trúc, headers, data types
3. **Phân tích dữ liệu**: Hiểu format, validation rules
4. **Chuyển đổi format**: Excel → JSON, Object

## Core Workflow

### Phase 1: Kiểm tra môi trường

1. **Xác định project có package.json không**
   ```bash
   cat package.json | grep -E "(xlsx|exceljs|read-excel-file)"
   ```

2. **Cài đặt thư viện nếu cần**
   ```bash
   # Ưu tiên xlsx (SheetJS) - phổ biến nhất
   npm install xlsx
   
   # Hoặc exceljs - nhiều tính năng hơn
   npm install exceljs
   ```

### Phase 2: Đọc file Excel

**Sử dụng SheetJS (xlsx):**

```javascript
const XLSX = require('xlsx');

// Đọc file
const workbook = XLSX.readFile('path/to/file.xlsx');

// Lấy danh sách sheets
const sheetNames = workbook.SheetNames;

// Đọc sheet đầu tiên
const firstSheet = workbook.Sheets[sheetNames[0]];

// Chuyển sang JSON
const data = XLSX.utils.sheet_to_json(firstSheet);

// Chuyển sang Array of Arrays (giữ headers)
const dataWithHeaders = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
```

**Sử dụng ExcelJS:**

```javascript
const ExcelJS = require('exceljs');

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('path/to/file.xlsx');

const worksheet = workbook.getWorksheet(1);

// Đọc từng row
worksheet.eachRow((row, rowNumber) => {
  console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
});
```

### Phase 3: Trích xuất Template

**Script trích xuất template hoàn chỉnh:**

```javascript
const XLSX = require('xlsx');

function extractTemplate(filePath) {
  const workbook = XLSX.readFile(filePath);
  const template = {
    fileName: filePath,
    sheets: [],
    extractedAt: new Date().toISOString()
  };

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    
    // Lấy headers (row đầu tiên)
    const headers = [];
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: col });
      const cell = sheet[cellAddress];
      headers.push({
        column: XLSX.utils.encode_col(col),
        name: cell ? cell.v : null,
        type: cell ? cell.t : null // s=string, n=number, b=boolean, d=date
      });
    }

    // Phân tích data types từ sample rows
    const sampleData = XLSX.utils.sheet_to_json(sheet, { header: 1 }).slice(1, 6);
    const columnTypes = analyzeColumnTypes(headers, sampleData);

    template.sheets.push({
      name: sheetName,
      range: sheet['!ref'],
      totalRows: range.e.r - range.s.r + 1,
      totalColumns: range.e.c - range.s.c + 1,
      headers: headers,
      columnTypes: columnTypes,
      mergedCells: sheet['!merges'] || [],
      sampleData: sampleData.slice(0, 3)
    });
  });

  return template;
}

function analyzeColumnTypes(headers, sampleData) {
  return headers.map((header, colIndex) => {
    const values = sampleData.map(row => row[colIndex]).filter(v => v !== undefined);
    
    const types = values.map(v => {
      if (v === null || v === undefined) return 'null';
      if (typeof v === 'number') return 'number';
      if (typeof v === 'boolean') return 'boolean';
      if (v instanceof Date) return 'date';
      if (typeof v === 'string') {
        // Detect patterns
        if (/^\d{4}-\d{2}-\d{2}/.test(v)) return 'date';
        if (/^\d+$/.test(v)) return 'numeric-string';
        if (/^\d+\.\d+$/.test(v)) return 'decimal-string';
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) return 'email';
        if (/^(https?:\/\/)/.test(v)) return 'url';
        return 'string';
      }
      return typeof v;
    });

    return {
      column: header.column,
      headerName: header.name,
      detectedTypes: [...new Set(types)],
      primaryType: getMostCommonType(types),
      nullable: values.length < sampleData.length,
      sampleValues: values.slice(0, 3)
    };
  });
}

function getMostCommonType(types) {
  const counts = {};
  types.forEach(t => counts[t] = (counts[t] || 0) + 1);
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

// Sử dụng
const template = extractTemplate('your-file.xlsx');
console.log(JSON.stringify(template, null, 2));
```

### Phase 4: Output Format

**Template output structure:**

```json
{
  "fileName": "inventory.xlsx",
  "extractedAt": "2024-01-15T10:30:00Z",
  "sheets": [
    {
      "name": "Products",
      "range": "A1:F100",
      "totalRows": 100,
      "totalColumns": 6,
      "headers": [
        { "column": "A", "name": "SKU", "type": "s" },
        { "column": "B", "name": "Product Name", "type": "s" },
        { "column": "C", "name": "Price", "type": "n" },
        { "column": "D", "name": "Quantity", "type": "n" },
        { "column": "E", "name": "Category", "type": "s" },
        { "column": "F", "name": "Last Updated", "type": "d" }
      ],
      "columnTypes": [
        {
          "column": "A",
          "headerName": "SKU",
          "detectedTypes": ["string"],
          "primaryType": "string",
          "nullable": false,
          "sampleValues": ["SKU001", "SKU002", "SKU003"]
        }
      ],
      "mergedCells": [],
      "sampleData": [
        ["SKU001", "Nike Air Max", 150, 25, "Shoes", "2024-01-10"],
        ["SKU002", "Adidas Stan Smith", 120, 30, "Shoes", "2024-01-11"]
      ]
    }
  ]
}
```

## Best Practices

### 1. Parsing Options

```javascript
// Đọc với options tối ưu
const workbook = XLSX.readFile(filePath, {
  cellDates: true,      // Chuyển date codes thành Date objects
  cellFormula: true,    // Giữ formulas
  cellStyles: false,    // Bỏ qua styles để tăng performance
  sheetRows: 1000,      // Giới hạn rows nếu file lớn
  dense: true           // Memory-efficient cho large files
});
```

### 2. Error Handling

```javascript
function safeReadExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    return { success: true, workbook };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      suggestion: error.message.includes('password') 
        ? 'File có thể bị password protect'
        : 'Kiểm tra file path và format'
    };
  }
}
```

### 3. Large File Handling

```javascript
// Streaming cho file lớn với ExcelJS
const ExcelJS = require('exceljs');

async function streamLargeFile(filePath) {
  const workbook = new ExcelJS.stream.xlsx.WorkbookReader(filePath);
  
  for await (const worksheetReader of workbook) {
    for await (const row of worksheetReader) {
      // Process row by row - không load toàn bộ vào memory
      console.log(row.values);
    }
  }
}
```

### 4. Type Detection Patterns

| Pattern | Type | Example |
|---------|------|---------|
| `/^\d{4}-\d{2}-\d{2}/` | date | 2024-01-15 |
| `/^\d+$/` | integer | 12345 |
| `/^\d+\.\d+$/` | decimal | 123.45 |
| `/^[A-Z]{2,3}\d+$/` | sku/code | SKU001 |
| `/^[\w.]+@[\w.]+$/` | email | user@example.com |
| `/^https?:\/\//` | url | https://example.com |

## Quick Reference

### Common Tasks

**Đọc nhanh sang JSON:**
```javascript
const data = XLSX.utils.sheet_to_json(
  XLSX.readFile('file.xlsx').Sheets['Sheet1']
);
```

**Lấy headers:**
```javascript
const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
```

**Đếm rows:**
```javascript
const range = XLSX.utils.decode_range(sheet['!ref']);
const rowCount = range.e.r - range.s.r + 1;
```

**Kiểm tra cell value:**
```javascript
const cellValue = sheet['A1'] ? sheet['A1'].v : null;
```

### Cell Types (SheetJS)

| Type Code | Meaning |
|-----------|---------|
| `s` | String |
| `n` | Number |
| `b` | Boolean |
| `d` | Date |
| `e` | Error |

## Troubleshooting

### File không đọc được
- Kiểm tra file path (dùng absolute path)
- Kiểm tra file có bị password protect không
- Thử đổi encoding với option `codepage`

### Data bị lỗi format
- Enable `cellDates: true` cho date columns
- Check `raw: true` option để lấy raw values

### Memory issues với large files
- Dùng `sheetRows` để giới hạn rows
- Sử dụng streaming API của ExcelJS
- Enable `dense: true` mode

## Integration với Project

Khi user cung cấp file Excel, agent nên:

1. **Đọc và phân tích** cấu trúc file
2. **Trích xuất template** với headers và data types
3. **Trình bày summary** cho user review
4. **Đề xuất** TypeScript interfaces hoặc validation schemas nếu cần

```typescript
// Ví dụ generated interface từ template
interface ProductRow {
  sku: string;
  productName: string;
  price: number;
  quantity: number;
  category: string;
  lastUpdated: Date;
}
```
