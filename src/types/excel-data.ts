export interface ExcelRow {
  POSTO: string;
  ESTADO: string;
  UF: string;
  PAIS: string;
  LOTE: string;
  PORTE: string;
  SUBREGIAO: string;
  'CHAMADOS HARDWARE': number;
  'QTDE. KIT': number;
  'TOTAL DE COLETAS': number;
  LATITUDE: number;
  LONGITUDE: number;
}

export interface FilterState {
  cidade1: string;
  cidade2: string;
  uf: string[];
  lote: string[];
  porte: string[];
  subregiao: string[];
  posto: string;
  radiusMin: number;
  radiusMax: number;
}

export interface DistanceData {
  haversine: number;
  osrm: number | null;
  loading: boolean;
}

export interface NearestNeighbor {
  posto: string;
  nearest: string;
  distance: number;
  lote: string;
  porte: string;
  osrmDistance?: number;
  haversineTime?: number; // em minutos
  osrmTime?: number; // em minutos
}

export interface NeighborInRadius {
  posto: string;
  targetPosto: string;
  distance: number;
  lote: string;
  porte: string;
  osrmDistance?: number;
  haversineTime?: number;
  osrmTime?: number;
}