import * as XLSX from 'xlsx';
import { ExcelRow } from '@/types/excel-data';

export function parseExcelFile(file: File): Promise<ExcelRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('Arquivo Excel deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
        }
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        const parsedData: ExcelRow[] = rows.map((row, index) => {
          const rowData: any = {};
          
          headers.forEach((header, colIndex) => {
            rowData[header] = row[colIndex];
          });
          
          // Validar campos obrigatórios (SUBREGIAO pode estar vazia)
          const requiredFields = ['POSTO', 'ESTADO', 'UF', 'PAIS', 'LOTE', 'PORTE', 'CHAMADOS HARDWARE', 'QTDE. KIT', 'TOTAL DE COLETAS', 'LATITUDE', 'LONGITUDE'];
          const optionalFields = ['SUBREGIAO']; // Campos que podem estar vazios
          
          for (const field of requiredFields) {
            if (!(field in rowData) || rowData[field] === undefined || rowData[field] === null || rowData[field] === '') {
              throw new Error(`Campo obrigatório '${field}' não encontrado ou vazio na linha ${index + 2}`);
            }
          }
          
          // Verificar se campos opcionais existem como coluna (mas podem estar vazios)
          for (const field of optionalFields) {
            if (!(field in rowData)) {
              throw new Error(`Campo '${field}' não encontrado na linha ${index + 2}`);
            }
          }
          
          // Converter tipos
          return {
            POSTO: String(rowData.POSTO).trim(),
            ESTADO: String(rowData.ESTADO).trim(),
            UF: String(rowData.UF).trim(),
            PAIS: String(rowData.PAIS).trim(),
            LOTE: String(rowData.LOTE).trim(),
            PORTE: String(rowData.PORTE).trim(),
            SUBREGIAO: rowData.SUBREGIAO ? String(rowData.SUBREGIAO).trim() : '', // Permite vazio
            'CHAMADOS HARDWARE': Number(rowData['CHAMADOS HARDWARE']) || 0,
            'QTDE. KIT': Number(rowData['QTDE. KIT']) || 0,
            'TOTAL DE COLETAS': Number(rowData['TOTAL DE COLETAS']) || 0,
            LATITUDE: Number(String(rowData.LATITUDE).replace(',', '.')),
            LONGITUDE: Number(String(rowData.LONGITUDE).replace(',', '.')),
          };
        });
        
        // Validar se as coordenadas são válidas
        parsedData.forEach((row, index) => {
          if (isNaN(row.LATITUDE) || isNaN(row.LONGITUDE) || 
              row.LATITUDE < -90 || row.LATITUDE > 90 ||
              row.LONGITUDE < -180 || row.LONGITUDE > 180) {
            throw new Error(`Coordenadas inválidas na linha ${index + 2}: LAT=${row.LATITUDE}, LON=${row.LONGITUDE}`);
          }
        });
        
        resolve(parsedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo Excel'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}