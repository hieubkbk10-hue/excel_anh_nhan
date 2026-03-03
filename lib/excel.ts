import * as XLSX from 'xlsx';
import { ExcelChartSpec, ExcelData, ExcelTextConfig, SignedContractRow } from '../types';
import { EXCEL_CHART_SPECS, EXCEL_FILE_URL, HD_Thucte_SHEET, DT_Thucte_SHEET } from './excel-spec';

export async function loadExcelData(): Promise<ExcelData> {
  const excelUrl = EXCEL_FILE_URL.trim();
  if (!excelUrl) {
    throw new Error('Thiếu cấu hình đường dẫn file Excel');
  }
  const workbook = await loadWorkbook(excelUrl);
  const charts = buildCharts(workbook, EXCEL_CHART_SPECS);
  const texts = buildTexts(EXCEL_CHART_SPECS);
  const contractsSigned = buildSignedContracts(workbook, HD_Thucte_SHEET);
  const revenuesSigned = buildSignedContracts(workbook, DT_Thucte_SHEET);
  return { charts, texts, contractsSigned, revenuesSigned };
}

async function loadWorkbook(url: string): Promise<XLSX.WorkBook> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải file Excel: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  return XLSX.read(buffer, { type: 'array' });
}

function buildCharts(workbook: XLSX.WorkBook, specs: ExcelChartSpec[]): ExcelData['charts'] {
  const charts = {} as ExcelData['charts'];
  for (const spec of specs) {
    charts[spec.id] = evaluateChart(spec, workbook);
  }
  return charts;
}

function buildTexts(specs: ExcelChartSpec[]): ExcelData['texts'] {
  const texts = {} as ExcelData['texts'];
  for (const spec of specs) {
    const resolved: Record<string, string> = {};
    if (spec.texts) {
      for (const [key, config] of Object.entries(spec.texts)) {
        resolved[key] = resolveText(config);
      }
    }
    texts[spec.id] = resolved;
  }
  return texts;
}

function buildSignedContracts(workbook: XLSX.WorkBook, sheetName: string): SignedContractRow[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const sheetRange = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    range: { s: { r: 1, c: 0 }, e: { r: sheetRange.e.r, c: 5 } },
    defval: '',
    raw: false
  });

  return rows
    .map((row) => {
      const [group, customer, contractNo, content, value, contractDate] = row ?? [];
      const normalizedGroup = String(group ?? '').trim();
      const normalizedCustomer = String(customer ?? '').trim();
      const normalizedContractNo = String(contractNo ?? '').trim();
      const normalizedContent = String(content ?? '').trim();
      return {
        group: normalizedGroup,
        customer: normalizedCustomer,
        contractNo: normalizedContractNo,
        content: normalizedContent,
        value: toNumber(value),
        contractDate: formatExcelDateToDDMMYYYY(contractDate)
      };
    })
    .filter((row) => row.group || row.customer || row.contractNo || row.content || row.value || row.contractDate);
}

function evaluateChart(spec: ExcelChartSpec, workbook: XLSX.WorkBook): Record<string, number> {
  const sheetName = spec.sheet ?? workbook.SheetNames[0];
  const metrics: Record<string, number> = {};

  for (const [key, expression] of Object.entries(spec.metrics)) {
    metrics[key] = evaluateExpression(expression, workbook, sheetName);
  }

  return metrics;
}

type Token =
  | { type: 'number'; value: string }
  | { type: 'cell'; value: string }
  | { type: 'operator'; value: string }
  | { type: 'paren'; value: '(' | ')' };

function evaluateExpression(
  expression: string,
  workbook: XLSX.WorkBook,
  defaultSheetName: string
): number {
  const normalized = expression.replace(/\s+/g, '').replace(/\$/g, '');
  if (!normalized) return 0;
  if (/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  const tokens = tokenizeExpression(normalized);
  if (!tokens.length) return 0;

  const rpn = toRpn(tokens);
  return evaluateRpn(rpn, workbook, defaultSheetName);
}

function tokenizeExpression(expression: string): Token[] {
  const rawTokens = expression.match(/[A-Za-z]{1,3}\d+|\d+(?:\.\d+)?|[()+\-*/]/g);
  if (!rawTokens) return [];

  const tokens: Token[] = [];
  let prevType: 'start' | 'operator' | 'paren-open' | 'value' = 'start';

  for (const raw of rawTokens) {
    if (raw === '(') {
      tokens.push({ type: 'paren', value: '(' });
      prevType = 'paren-open';
      continue;
    }
    if (raw === ')') {
      tokens.push({ type: 'paren', value: ')' });
      prevType = 'value';
      continue;
    }

    if (['+', '-', '*', '/'].includes(raw)) {
      if (raw === '-' && (prevType === 'start' || prevType === 'operator' || prevType === 'paren-open')) {
        tokens.push({ type: 'number', value: '0' });
      }
      tokens.push({ type: 'operator', value: raw });
      prevType = 'operator';
      continue;
    }

    if (/^\d/.test(raw)) {
      tokens.push({ type: 'number', value: raw });
    } else {
      tokens.push({ type: 'cell', value: raw });
    }
    prevType = 'value';
  }

  return tokens;
}

function toRpn(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const operators: Token[] = [];
  const precedence: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

  for (const token of tokens) {
    if (token.type === 'number' || token.type === 'cell') {
      output.push(token);
      continue;
    }
    if (token.type === 'operator') {
      while (operators.length) {
        const last = operators[operators.length - 1];
        if (last.type !== 'operator') break;
        if (precedence[last.value] >= precedence[token.value]) {
          output.push(operators.pop() as Token);
          continue;
        }
        break;
      }
      operators.push(token);
      continue;
    }
    if (token.type === 'paren' && token.value === '(') {
      operators.push(token);
      continue;
    }
    if (token.type === 'paren' && token.value === ')') {
      while (operators.length) {
        const last = operators.pop() as Token;
        if (last.type === 'paren' && last.value === '(') {
          break;
        }
        output.push(last);
      }
    }
  }

  while (operators.length) {
    output.push(operators.pop() as Token);
  }

  return output;
}

function evaluateRpn(tokens: Token[], workbook: XLSX.WorkBook, defaultSheetName: string): number {
  const stack: number[] = [];

  for (const token of tokens) {
    if (token.type === 'number') {
      stack.push(Number(token.value));
      continue;
    }
    if (token.type === 'cell') {
      stack.push(getCellValue(token.value, workbook, defaultSheetName));
      continue;
    }
    if (token.type === 'operator') {
      const right = stack.pop() ?? 0;
      const left = stack.pop() ?? 0;
      switch (token.value) {
        case '+':
          stack.push(left + right);
          break;
        case '-':
          stack.push(left - right);
          break;
        case '*':
          stack.push(left * right);
          break;
        case '/':
          stack.push(right === 0 ? 0 : left / right);
          break;
      }
    }
  }

  return stack.pop() ?? 0;
}

function getCellValue(
  reference: string,
  workbook: XLSX.WorkBook,
  defaultSheetName: string
): number {
  const [sheetName, address] = resolveReference(reference, defaultSheetName);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !address) return 0;
  const cell = sheet[address];
  return toNumber(cell?.v);
}

function resolveText(config: ExcelTextConfig): string {
  if (typeof config === 'string') return config;
  if (config.value) return config.value;
  if (config.fallback) return config.fallback;
  return '';
}

function resolveReference(reference: string, defaultSheetName: string): [string, string] {
  if (reference.includes('!')) {
    const [sheetName, cellAddress] = reference.split('!');
    return [sheetName || defaultSheetName, cellAddress ?? ''];
  }
  return [defaultSheetName, reference];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatExcelDateToDDMMYYYY(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return '';
    return formatDateParts(parsed.d, parsed.m, parsed.y);
  }

  const raw = String(value ?? '').trim();
  if (!raw) return '';
  const normalized = raw.replace(/-/g, '/');
  const parts = normalized.split('/').map((part) => part.trim()).filter(Boolean);
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const month = Number(parts[1]);
    let year = Number(parts[2]);
    if (year < 100) year += 2000;
    if (Number.isFinite(day) && Number.isFinite(month) && Number.isFinite(year)) {
      return formatDateParts(day, month, year);
    }
  }

  return raw;
}

function formatDateParts(day: number, month: number, year: number): string {
  const safeDay = Math.max(1, day);
  const safeMonth = Math.max(1, month);
  const safeYear = Math.max(0, year);
  const paddedDay = String(safeDay).padStart(2, '0');
  const paddedMonth = String(safeMonth).padStart(2, '0');
  return `${paddedDay}/${paddedMonth}/${safeYear}`;
}
