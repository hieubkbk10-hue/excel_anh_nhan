# Excel Skill Examples

## Example 1: Basic File Reading

**User request**: "Đọc file inventory.xlsx và cho tôi biết cấu trúc của nó"

**Agent workflow**:

```javascript
const XLSX = require('xlsx');

// 1. Đọc file
const workbook = XLSX.readFile('inventory.xlsx');

// 2. Lấy thông tin cơ bản
const info = {
  sheets: workbook.SheetNames,
  sheetCount: workbook.SheetNames.length
};

// 3. Phân tích từng sheet
workbook.SheetNames.forEach(name => {
  const sheet = workbook.Sheets[name];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
  
  console.log(`Sheet: ${name}`);
  console.log(`- Range: ${sheet['!ref']}`);
  console.log(`- Rows: ${range.e.r + 1}`);
  console.log(`- Headers: ${headers.join(', ')}`);
});
```

**Output cho user**:
```
File: inventory.xlsx
Số sheets: 2

Sheet 1: Products
- Range: A1:F150
- Số dòng: 150
- Headers: SKU, Name, Price, Quantity, Category, Updated

Sheet 2: Categories  
- Range: A1:C10
- Số dòng: 10
- Headers: ID, Name, Description
```

---

## Example 2: Template Extraction

**User request**: "Trích xuất template từ file orders.xlsx để tạo TypeScript interface"

**Agent workflow**:

```javascript
const XLSX = require('xlsx');

const workbook = XLSX.readFile('orders.xlsx');
const sheet = workbook.Sheets['Orders'];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Headers
const headers = data[0];
const sampleRows = data.slice(1, 6);

// Analyze types
const analysis = headers.map((header, i) => {
  const values = sampleRows.map(row => row[i]).filter(Boolean);
  const types = [...new Set(values.map(v => typeof v))];
  
  return {
    name: header,
    type: types[0] || 'unknown',
    samples: values.slice(0, 2)
  };
});

// Generate interface
const interfaceCode = `
interface Order {
${analysis.map(col => `  ${toCamelCase(col.name)}: ${mapType(col.type)};`).join('\n')}
}
`;
```

**Output cho user**:
```typescript
interface Order {
  orderId: string;
  customerName: string;
  productSku: string;
  quantity: number;
  totalPrice: number;
  orderDate: Date;
  status: string;
}
```

---

## Example 3: Data Validation Analysis

**User request**: "Phân tích file và tìm các vấn đề về dữ liệu"

**Agent workflow**:

```javascript
const XLSX = require('xlsx');

function analyzeDataQuality(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  const issues = [];
  const headers = Object.keys(data[0] || {});
  
  headers.forEach(header => {
    const values = data.map(row => row[header]);
    
    // Check nulls
    const nullCount = values.filter(v => v === null || v === undefined).length;
    if (nullCount > 0) {
      issues.push({
        column: header,
        issue: 'null_values',
        count: nullCount,
        percentage: (nullCount / values.length * 100).toFixed(1) + '%'
      });
    }
    
    // Check duplicates
    const uniqueCount = new Set(values).size;
    if (uniqueCount < values.length * 0.5) {
      issues.push({
        column: header,
        issue: 'high_duplicates',
        uniqueRatio: (uniqueCount / values.length * 100).toFixed(1) + '%'
      });
    }
    
    // Check mixed types
    const types = [...new Set(values.map(v => typeof v))];
    if (types.length > 2) { // Allow null + one type
      issues.push({
        column: header,
        issue: 'mixed_types',
        types: types
      });
    }
  });
  
  return issues;
}
```

**Output cho user**:
```
Data Quality Report - products.xlsx

Issues found: 3

1. Column: Description
   - Issue: null_values
   - Count: 15 (10% of rows)

2. Column: Category
   - Issue: high_duplicates
   - Unique ratio: 3.3% (only 5 unique values)

3. Column: Price
   - Issue: mixed_types
   - Types detected: number, string, undefined

Recommendations:
- Fill missing Description values
- Consider normalizing Category to separate table
- Clean Price column - convert strings to numbers
```

---

## Example 4: Multi-sheet Relationship Detection

**User request**: "Phân tích mối quan hệ giữa các sheets trong file database.xlsx"

**Agent workflow**:

```javascript
function detectRelationships(workbook) {
  const sheets = {};
  
  // Extract headers from all sheets
  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] || [];
    sheets[name] = headers.map(h => h?.toLowerCase());
  });
  
  const relationships = [];
  const sheetNames = Object.keys(sheets);
  
  // Find matching patterns
  for (let i = 0; i < sheetNames.length; i++) {
    for (let j = i + 1; j < sheetNames.length; j++) {
      const sheet1 = sheetNames[i];
      const sheet2 = sheetNames[j];
      
      sheets[sheet1].forEach(col1 => {
        sheets[sheet2].forEach(col2 => {
          if (col1 && col2) {
            // Check for FK pattern: table_id or tableId
            if (col1.includes(sheet2.toLowerCase()) || 
                col2.includes(sheet1.toLowerCase())) {
              relationships.push({
                from: sheet1,
                to: sheet2,
                type: 'foreign_key',
                columns: [col1, col2]
              });
            }
            // Check for exact match
            if (col1 === col2 && col1.includes('id')) {
              relationships.push({
                from: sheet1,
                to: sheet2,
                type: 'potential_join',
                column: col1
              });
            }
          }
        });
      });
    }
  }
  
  return relationships;
}
```

**Output cho user**:
```
Relationship Analysis - database.xlsx

Detected Relationships:

1. Orders → Customers
   - Type: Foreign Key
   - Orders.customer_id → Customers.id

2. OrderItems → Orders
   - Type: Foreign Key  
   - OrderItems.order_id → Orders.id

3. OrderItems → Products
   - Type: Foreign Key
   - OrderItems.product_id → Products.id

4. Products → Categories
   - Type: Foreign Key
   - Products.category_id → Categories.id

Suggested ERD:
Categories ──< Products ──< OrderItems >── Orders >── Customers
```

---

## Example 5: Generate Zod Schema from Template

**User request**: "Tạo Zod validation schema từ file Excel template"

**Agent workflow**:

```javascript
function generateZodSchema(template) {
  const sheet = template.sheets[0];
  
  let schema = `import { z } from 'zod';\n\n`;
  schema += `export const ${toPascalCase(sheet.name)}Schema = z.object({\n`;
  
  sheet.columnAnalysis.forEach(col => {
    const name = toCamelCase(col.headerName);
    const zodType = mapToZod(col);
    schema += `  ${name}: ${zodType},\n`;
  });
  
  schema += `});\n\n`;
  schema += `export type ${toPascalCase(sheet.name)} = z.infer<typeof ${toPascalCase(sheet.name)}Schema>;\n`;
  
  return schema;
}

function mapToZod(col) {
  const { suggestedType, nullable, patterns, typeAnalysis } = col;
  let zodType = '';
  
  switch (suggestedType) {
    case 'number':
      zodType = 'z.number()';
      if (typeAnalysis.primary === 'integer') {
        zodType += '.int()';
      }
      break;
    case 'string':
      zodType = 'z.string()';
      if (typeAnalysis.primary === 'email') {
        zodType += '.email()';
      } else if (typeAnalysis.primary === 'url') {
        zodType += '.url()';
      } else if (patterns?.maxLength) {
        zodType += `.max(${patterns.maxLength})`;
      }
      break;
    case 'boolean':
      zodType = 'z.boolean()';
      break;
    case 'Date':
      zodType = 'z.date()';
      break;
    default:
      zodType = 'z.unknown()';
  }
  
  if (nullable) {
    zodType += '.nullable()';
  }
  
  return zodType;
}
```

**Output cho user**:
```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  sku: z.string().max(10),
  name: z.string().max(100),
  price: z.number(),
  quantity: z.number().int(),
  category: z.string(),
  email: z.string().email().nullable(),
  website: z.string().url().nullable(),
  active: z.boolean(),
});

export type Product = z.infer<typeof ProductSchema>;
```

---

## Quick Commands Reference

| Task | Command/Code |
|------|--------------|
| Read file | `XLSX.readFile('file.xlsx')` |
| Get sheet names | `workbook.SheetNames` |
| Get sheet data | `XLSX.utils.sheet_to_json(sheet)` |
| Get headers | `sheet_to_json(sheet, {header: 1})[0]` |
| Get range | `sheet['!ref']` |
| Count rows | `decode_range(sheet['!ref']).e.r + 1` |
| Get cell value | `sheet['A1']?.v` |
| Get cell type | `sheet['A1']?.t` |
