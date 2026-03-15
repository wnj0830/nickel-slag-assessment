import * as XLSX from 'xlsx';
import type { RawDataRow, DataField, FieldStatistics, FieldMapping, ProcessedDataRow } from '../types';

export type { DataField, FieldMapping, FieldStatistics, ProcessedDataRow, RawDataRow };

export interface ParsedData {
  headers: string[];
  rows: RawDataRow[];
  totalRows: number;
}

export interface FieldSuggestion {
  field: string;
  suggestedMapping: string;
  confidence: number;
}

const FIELD_MAPPINGS: Record<string, string[]> = {
  particleSize: ['粒径', 'particle', 'diameter', 'size', 'd', '粒径mm', '颗粒粒径'],
  stressLevel: ['围压', 'stress', 'sigma', 'confining', '应力', '侧压力'],
  loadingRate: ['速率', 'rate', 'speed', '加载速率', '应变速率'],
  moistureContent: ['含水率', 'moisture', 'water', '湿度', 'mc'],
  compactionDegree: ['压实度', 'compaction', 'density', '压实', '密实度'],
  slagContent: ['镍铁渣', 'slag', '掺量', '含量', 'nickel', 'ferro'],
  cyclicTimes: ['循环次数', 'cycle', 'times', 'N', '加载次数', '循环加载次数'],
  resilientModulus: ['回弹模量', 'resilient', 'Mr', '模量', '弹性模量'],
  particleBreakage: ['破碎率', 'breakage', '破碎', 'particle', '颗粒破碎'],
};

const FIELD_UNITS: Record<string, string> = {
  particleSize: 'mm',
  stressLevel: 'kPa',
  loadingRate: 'mm/min',
  moistureContent: '%',
  compactionDegree: '%',
  slagContent: '%',
  cyclicTimes: '次',
  resilientModulus: 'MPa',
  particleBreakage: '%',
};

export function parseExcelFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' }) as RawDataRow[];
        
        const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
        
        resolve({
          headers,
          rows: jsonData,
          totalRows: jsonData.length,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

export function parseCsvFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) {
          reject(new Error('文件为空'));
          return;
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const rows: RawDataRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: RawDataRow = {};
          headers.forEach((header, idx) => {
            const value = values[idx];
            const numValue = parseFloat(value);
            row[header] = isNaN(numValue) ? value : numValue;
          });
          rows.push(row);
        }
        
        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
}

export function detectFieldType(values: any[]): 'number' | 'string' | 'date' {
  const validValues = values.filter(v => v !== '' && v !== null && v !== undefined);
  
  if (validValues.length === 0) return 'string';
  
  const numberCount = validValues.filter(v => !isNaN(parseFloat(String(v)))).length;
  
  if (numberCount / validValues.length > 0.8) {
    return 'number';
  }
  
  const datePattern = /^\d{4}[-/]\d{2}[-/]\d{2}|^\d{2}[-/]\d{2}[-/]\d{4}/;
  const dateCount = validValues.filter(v => datePattern.test(String(v))).length;
  
  if (dateCount / validValues.length > 0.8) {
    return 'date';
  }
  
  return 'string';
}

export function calculateFieldStatistics(values: number[]): FieldStatistics {
  const validValues = values.filter(v => !isNaN(v));
  
  if (validValues.length === 0) {
    return { min: 0, max: 0, mean: 0, std: 0, count: 0 };
  }
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length;
  const std = Math.sqrt(variance);
  
  return { min, max, mean, std, count: validValues.length };
}

export function analyzeFields(headers: string[], rows: RawDataRow[]): DataField[] {
  return headers.map(header => {
    const values = rows.map(row => row[header]);
    const type = detectFieldType(values);
    const numericValues = values.map(v => parseFloat(String(v))).filter(v => !isNaN(v));
    
    const field: DataField = {
      key: header,
      label: header,
      type,
      unit: FIELD_UNITS[header] || undefined,
    };
    
    if (type === 'number' && numericValues.length > 0) {
      field.statistics = calculateFieldStatistics(numericValues);
    }
    
    return field;
  });
}

export function suggestFieldMappings(headers: string[]): FieldSuggestion[] {
  return headers.map(header => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z\u4e00-\u9fa5]/g, '');
    
    let bestMatch = '';
    let highestScore = 0;
    
    for (const [targetField, keywords] of Object.entries(FIELD_MAPPINGS)) {
      for (const keyword of keywords) {
        const normalizedKeyword = keyword.toLowerCase().replace(/[^a-z\u4e00-\u9fa5]/g, '');
        if (normalizedHeader.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedHeader)) {
          const score = Math.min(normalizedHeader.length, normalizedKeyword.length) / Math.max(normalizedHeader.length, normalizedKeyword.length);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = targetField;
          }
        }
      }
    }
    
    return {
      field: header,
      suggestedMapping: bestMatch,
      confidence: highestScore,
    };
  });
}

export function getAvailableTargetFields(): { key: string; label: string; unit?: string }[] {
  return [
    { key: 'particleSize', label: '颗粒粒径', unit: 'mm' },
    { key: 'stressLevel', label: '围压/应力水平', unit: 'kPa' },
    { key: 'loadingRate', label: '加载速率', unit: 'mm/min' },
    { key: 'moistureContent', label: '含水率', unit: '%' },
    { key: 'compactionDegree', label: '压实度', unit: '%' },
    { key: 'slagContent', label: '镍铁渣掺量', unit: '%' },
    { key: 'cyclicTimes', label: '循环加载次数', unit: '次' },
    { key: 'resilientModulus', label: '回弹模量', unit: 'MPa' },
    { key: 'particleBreakage', label: '颗粒破碎率', unit: '%' },
    { key: 'ignore', label: '忽略此字段', unit: undefined },
  ];
}

export function applyFieldMappings(
  rows: RawDataRow[],
  mappings: FieldMapping[]
): ProcessedDataRow[] {
  return rows.map(row => {
    const processedRow: ProcessedDataRow = {};
    
    for (const mapping of mappings) {
      if (mapping.targetField === 'ignore') continue;
      
      let value = row[mapping.sourceField];
      
      if (typeof value === 'string') {
        value = parseFloat(value);
      }
      
      if (isNaN(value as number)) continue;
      
      let finalValue = value as number;
      
      switch (mapping.transform) {
        case 'log':
          finalValue = Math.log(finalValue + 1);
          break;
        case 'sqrt':
          finalValue = Math.sqrt(finalValue);
          break;
        case 'normalize':
          break;
      }
      
      processedRow[mapping.targetField] = finalValue;
    }
    
    return processedRow;
  }).filter(row => Object.keys(row).length > 0);
}

export function validateProcessedData(rows: ProcessedDataRow[]): {
  valid: boolean;
  issues: string[];
  completeness: number;
} {
  const requiredFields = ['particleSize', 'stressLevel', 'moistureContent', 'compactionDegree'];
  
  const issues: string[] = [];
  let validCount = 0;
  
  for (const row of rows) {
    let rowValid = true;
    
    for (const field of requiredFields) {
      if (row[field] === undefined || row[field] === null || isNaN(row[field]!)) {
        rowValid = false;
        break;
      }
    }
    
    if (rowValid) validCount++;
  }
  
  if (validCount === 0) {
    issues.push('没有找到包含所有必需字段的有效数据行');
  }
  
  const completeness = rows.length > 0 ? (validCount / rows.length) * 100 : 0;
  
  return {
    valid: validCount > 0,
    issues,
    completeness,
  };
}
