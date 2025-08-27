import { parseExcelFile } from './excel-parser';
import { ExcelRow } from '@/types/excel-data';

const GITHUB_URL = 'https://raw.githubusercontent.com/Hrqtrch/BASE-MAPA-PPT/refs/heads/main/Pasta1.xlsx';

export async function loadDataFromGithub(): Promise<ExcelRow[]> {
  try {
    const response = await fetch(GITHUB_URL, {
      mode: 'cors',
      cache: 'no-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar dados: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const file = new File([arrayBuffer], 'Pasta1.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    
    return await parseExcelFile(file);
  } catch (error) {
    console.error('Erro ao carregar dados do GitHub:', error);
    throw new Error('Falha ao carregar dados do GitHub. Verifique sua conexão.');
  }
}