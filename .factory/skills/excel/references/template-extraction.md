# Template Extraction Reference

## Overview

Template extraction là quá trình phân tích file Excel để hiểu:
- Cấu trúc (headers, columns)
- Data types của mỗi column
- Validation rules (nếu có)
- Relationships giữa các sheets

## Complete Template Extractor

```javascript
const XLSX = require('xlsx');

class ExcelTemplateExtractor {
  constructor(filePath) {
    this.filePath = filePath;
    this.workbook = null;
    this.template = null;
  }

  extract() {
    this.workbook = XLSX.readFile(this.filePath, {
      cellDates: true,
      cellFormula: true,
      cellStyles: false
    });

    this.template = {
      fileName: this.filePath,
      extractedAt: new Date().toISOString(),
      sheets: this.workbook.SheetNames.map(name => this.extractSheet(name)),
      relationships: this.detectRelationships()
    };

    return this.template;
  }

  extractSheet(sheetName) {
    const sheet = this.workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    const headers = this.extractHeaders(rawData[0], sheet, range);
    const sampleData = rawData.slice(1, 11); // 10 sample rows
    const columnAnalysis = this.analyzeColumns(headers, sampleData);

    return {
      name: sheetName,
      range: sheet['!ref'],
      dimensions: {
        rows: range.e.r - range.s.r + 1,
        columns: range.e.c - range.s.c + 1
      },
      headers,
      columnAnalysis,
      mergedCells: this.extractMerges(sheet),
      dataValidation: this.extractValidation(sheet),
      sampleData: sampleData.slice(0, 3)
    };
  }

  extractHeaders(headerRow, sheet, range) {
    if (!headerRow) return [];
    
    return headerRow.map((value, index) => {
      const col = XLSX.utils.encode_col(index);
      const cellRef = `${col}1`;
      const cell = sheet[cellRef];
      
      return {
        index,
        column: col,
        name: value || `Column_${col}`,
        originalName: value,
        cellType: cell ? cell.t : null,
        isEmpty: !value
      };
    });
  }

  analyzeColumns(headers, sampleData) {
    return headers.map((header, colIndex) => {
      const values = sampleData
        .map(row => row[colIndex])
        .filter(v => v !== undefined && v !== null && v !== '');

      const analysis = {
        column: header.column,
        headerName: header.name,
        stats: {
          totalSamples: sampleData.length,
          nonEmptyCount: values.length,
          emptyCount: sampleData.length - values.length,
          uniqueCount: new Set(values).size
        },
        typeAnalysis: this.analyzeTypes(values),
        patterns: this.detectPatterns(values),
        sampleValues: values.slice(0, 5)
      };

      analysis.suggestedType = this.suggestType(analysis);
      analysis.nullable = analysis.stats.emptyCount > 0;

      return analysis;
    });
  }

  analyzeTypes(values) {
    const types = values.map(v => this.detectType(v));
    const typeCounts = {};
    
    types.forEach(t => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    return {
      detected: Object.keys(typeCounts),
      distribution: typeCounts,
      primary: this.getMostCommon(typeCounts),
      isConsistent: Object.keys(typeCounts).length === 1
    };
  }

  detectType(value) {
    if (value === null || value === undefined) return 'null';
    if (value instanceof Date) return 'date';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'decimal';
    }
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string') {
      return this.detectStringType(value);
    }
    return 'unknown';
  }

  detectStringType(value) {
    const patterns = [
      { type: 'email', regex: /^[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}$/ },
      { type: 'url', regex: /^https?:\/\/.+/ },
      { type: 'phone', regex: /^[\d\s\-+()]{8,}$/ },
      { type: 'date-iso', regex: /^\d{4}-\d{2}-\d{2}/ },
      { type: 'date-vn', regex: /^\d{2}\/\d{2}\/\d{4}/ },
      { type: 'time', regex: /^\d{2}:\d{2}(:\d{2})?/ },
      { type: 'currency', regex: /^[\$€£¥₫]?\s?[\d,]+(\.\d{2})?$/ },
      { type: 'percentage', regex: /^\d+(\.\d+)?%$/ },
      { type: 'sku', regex: /^[A-Z]{2,4}[-_]?\d{3,}$/i },
      { type: 'uuid', regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
      { type: 'numeric-string', regex: /^\d+$/ },
      { type: 'decimal-string', regex: /^\d+\.\d+$/ }
    ];

    for (const { type, regex } of patterns) {
      if (regex.test(value.trim())) return type;
    }
    
    return 'string';
  }

  detectPatterns(values) {
    const stringValues = values.filter(v => typeof v === 'string');
    if (stringValues.length === 0) return null;

    return {
      minLength: Math.min(...stringValues.map(s => s.length)),
      maxLength: Math.max(...stringValues.map(s => s.length)),
      avgLength: stringValues.reduce((a, b) => a + b.length, 0) / stringValues.length,
      hasUpperCase: stringValues.some(s => /[A-Z]/.test(s)),
      hasLowerCase: stringValues.some(s => /[a-z]/.test(s)),
      hasNumbers: stringValues.some(s => /\d/.test(s)),
      hasSpecialChars: stringValues.some(s => /[^a-zA-Z0-9\s]/.test(s))
    };
  }

  suggestType(analysis) {
    const { typeAnalysis, patterns } = analysis;
    const primary = typeAnalysis.primary;

    // Map to TypeScript types
    const typeMap = {
      'integer': 'number',
      'decimal': 'number',
      'numeric-string': 'string', // Keep as string if stored as string
      'decimal-string': 'string',
      'date': 'Date',
      'date-iso': 'string', // ISO date string
      'date-vn': 'string',
      'boolean': 'boolean',
      'email': 'string',
      'url': 'string',
      'phone': 'string',
      'currency': 'number',
      'percentage': 'number',
      'sku': 'string',
      'uuid': 'string',
      'string': 'string',
      'null': 'null',
      'unknown': 'unknown'
    };

    return typeMap[primary] || 'string';
  }

  extractMerges(sheet) {
    const merges = sheet['!merges'] || [];
    return merges.map(merge => ({
      range: XLSX.utils.encode_range(merge),
      start: { row: merge.s.r + 1, col: XLSX.utils.encode_col(merge.s.c) },
      end: { row: merge.e.r + 1, col: XLSX.utils.encode_col(merge.e.c) }
    }));
  }

  extractValidation(sheet) {
    // Data validation extraction (if available)
    return sheet['!dataValidation'] || [];
  }

  detectRelationships() {
    // Detect potential foreign key relationships between sheets
    const relationships = [];
    const sheets = this.template?.sheets || [];

    for (let i = 0; i < sheets.length; i++) {
      for (let j = i + 1; j < sheets.length; j++) {
        const sheet1 = sheets[i];
        const sheet2 = sheets[j];
        
        // Check for matching column names
        sheet1.headers.forEach(h1 => {
          sheet2.headers.forEach(h2 => {
            if (h1.name && h2.name && 
                (h1.name.toLowerCase().includes(h2.name.toLowerCase()) ||
                 h2.name.toLowerCase().includes(h1.name.toLowerCase()))) {
              relationships.push({
                sheet1: sheet1.name,
                column1: h1.name,
                sheet2: sheet2.name,
                column2: h2.name,
                type: 'potential-reference'
              });
            }
          });
        });
      }
    }

    return relationships;
  }

  getMostCommon(counts) {
    let max = 0;
    let result = null;
    for (const [key, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        result = key;
      }
    }
    return result;
  }

  // Generate TypeScript interface from template
  generateInterface(sheetIndex = 0) {
    const sheet = this.template.sheets[sheetIndex];
    if (!sheet) return null;

    const interfaceName = this.toPascalCase(sheet.name);
    let code = `interface ${interfaceName} {\n`;

    sheet.columnAnalysis.forEach(col => {
      const propName = this.toCamelCase(col.headerName);
      const type = col.suggestedType;
      const nullable = col.nullable ? ' | null' : '';
      code += `  ${propName}: ${type}${nullable};\n`;
    });

    code += '}\n';
    return code;
  }

  toPascalCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^(.)/, m => m.toUpperCase());
  }

  toCamelCase(str) {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^(.)/, m => m.toLowerCase());
  }
}

// Usage
const extractor = new ExcelTemplateExtractor('file.xlsx');
const template = extractor.extract();
console.log(JSON.stringify(template, null, 2));

// Generate TypeScript interface
const interface = extractor.generateInterface(0);
console.log(interface);
```

## Output Example

```json
{
  "fileName": "products.xlsx",
  "extractedAt": "2024-01-15T10:30:00.000Z",
  "sheets": [
    {
      "name": "Products",
      "range": "A1:G150",
      "dimensions": { "rows": 150, "columns": 7 },
      "headers": [
        { "index": 0, "column": "A", "name": "SKU", "cellType": "s" },
        { "index": 1, "column": "B", "name": "Name", "cellType": "s" },
        { "index": 2, "column": "C", "name": "Price", "cellType": "n" },
        { "index": 3, "column": "D", "name": "Stock", "cellType": "n" },
        { "index": 4, "column": "E", "name": "Category", "cellType": "s" },
        { "index": 5, "column": "F", "name": "Created At", "cellType": "d" },
        { "index": 6, "column": "G", "name": "Active", "cellType": "b" }
      ],
      "columnAnalysis": [
        {
          "column": "A",
          "headerName": "SKU",
          "stats": { "totalSamples": 10, "nonEmptyCount": 10, "uniqueCount": 10 },
          "typeAnalysis": {
            "detected": ["sku"],
            "distribution": { "sku": 10 },
            "primary": "sku",
            "isConsistent": true
          },
          "suggestedType": "string",
          "nullable": false,
          "sampleValues": ["PRD-001", "PRD-002", "PRD-003"]
        }
      ],
      "mergedCells": [],
      "dataValidation": [],
      "sampleData": [
        ["PRD-001", "Nike Air Max", 1500000, 25, "Shoes", "2024-01-10", true]
      ]
    }
  ],
  "relationships": []
}
```

## Generated TypeScript Interface

```typescript
interface Products {
  sku: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  active: boolean;
}
```
