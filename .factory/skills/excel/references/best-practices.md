# Excel Best Practices Reference

## Library Selection

### SheetJS (xlsx) - Recommended for most cases

**Pros:**
- Lightweight, fast parsing
- Wide format support (.xlsx, .xls, .csv, .ods)
- Works in both Node.js and browser
- Active community, well-documented

**Cons:**
- Basic styling support (Pro version needed for advanced)
- Limited streaming for large files

**Install:**
```bash
npm install xlsx
# Hoặc từ CDN cho production
npm install --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

### ExcelJS - For advanced features

**Pros:**
- Full styling support
- Built-in streaming for large files
- Better TypeScript support
- Image handling

**Cons:**
- Larger bundle size
- Slightly slower parsing

**Install:**
```bash
npm install exceljs
```

### read-excel-file - Lightweight alternative

**Pros:**
- Very small bundle
- Schema validation built-in
- Simple API

**Cons:**
- .xlsx only (no .xls)
- Limited features

**Install:**
```bash
npm install read-excel-file
```

## Performance Optimization

### 1. Limit rows for preview
```javascript
const workbook = XLSX.readFile(path, { sheetRows: 100 });
```

### 2. Dense mode for large files
```javascript
const workbook = XLSX.readFile(path, { dense: true });
```

### 3. Skip unnecessary parsing
```javascript
const workbook = XLSX.readFile(path, {
  cellStyles: false,  // Skip styles
  cellFormula: false, // Skip formulas
  bookVBA: false      // Skip VBA macros
});
```

### 4. Use streaming for very large files (ExcelJS)
```javascript
const workbook = new ExcelJS.stream.xlsx.WorkbookReader(path);
for await (const worksheet of workbook) {
  for await (const row of worksheet) {
    // Process row
  }
}
```

## Common Patterns

### Read specific sheet by name
```javascript
const sheet = workbook.Sheets['MySheet'];
if (!sheet) throw new Error('Sheet not found');
```

### Read specific range
```javascript
const range = { s: { r: 0, c: 0 }, e: { r: 99, c: 5 } }; // A1:F100
const data = XLSX.utils.sheet_to_json(sheet, { range });
```

### Handle merged cells
```javascript
const merges = sheet['!merges'] || [];
merges.forEach(merge => {
  console.log(`Merged: ${XLSX.utils.encode_range(merge)}`);
});
```

### Preserve original formatting
```javascript
const data = XLSX.utils.sheet_to_json(sheet, {
  raw: false,        // Get formatted strings
  dateNF: 'yyyy-mm-dd' // Date format
});
```

## Error Handling Patterns

### Graceful file reading
```javascript
function readExcelSafe(path) {
  if (!fs.existsSync(path)) {
    return { error: 'File not found', path };
  }
  
  try {
    const workbook = XLSX.readFile(path);
    return { success: true, workbook };
  } catch (e) {
    if (e.message.includes('password')) {
      return { error: 'Password protected file' };
    }
    if (e.message.includes('Unsupported')) {
      return { error: 'Unsupported file format' };
    }
    return { error: e.message };
  }
}
```

### Validate sheet structure
```javascript
function validateSheet(sheet, requiredHeaders) {
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
  const missing = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  return { valid: true, headers };
}
```

## Security Considerations

1. **File size limits**: Always limit file size before processing
2. **Sanitize cell values**: Don't trust user input from Excel
3. **Disable macros**: Use `bookVBA: false` option
4. **Validate file type**: Check magic bytes, not just extension

```javascript
function isValidExcel(buffer) {
  // XLSX magic bytes (PK zip signature)
  const xlsx = buffer[0] === 0x50 && buffer[1] === 0x4B;
  // XLS magic bytes (Compound File Binary)
  const xls = buffer[0] === 0xD0 && buffer[1] === 0xCF;
  return xlsx || xls;
}
```

## Resources

- [SheetJS Documentation](https://docs.sheetjs.com/)
- [ExcelJS GitHub](https://github.com/exceljs/exceljs)
- [SheetJS API Reference](https://docs.sheetjs.com/docs/api)
