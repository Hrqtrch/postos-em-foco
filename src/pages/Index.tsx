import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ExcelUpload } from '@/components/ExcelUpload';
import { FilterControls } from '@/components/FilterControls';
import { MetricCard } from '@/components/MetricCard';
import { DashboardMap } from '@/components/DashboardMap';
import { NearestNeighborsTable } from '@/components/NearestNeighborsTable';
import { ChartsGrid } from '@/components/ChartsGrid';
import { parseExcelFile } from '@/utils/excel-parser';
import { haversineDistance, getOSRMDistance } from '@/utils/distance';
import { ExcelRow, FilterState, DistanceData, NearestNeighbor } from '@/types/excel-data';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Building2, 
  BarChart3, 
  Zap, 
  Route,
  Ruler,
  Calculator,
  TrendingDown
} from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<ExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    cidade1: '',
    cidade2: '',
    uf: [],
    lote: [],
    porte: [],
    subregiao: []
  });

  const [distanceData, setDistanceData] = useState<DistanceData>({
    haversine: 0,
    osrm: null,
    loading: false
  });

  // Dados filtrados
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.uf.length > 0 && !filters.uf.includes(row.UF)) return false;
      if (filters.lote.length > 0 && !filters.lote.includes(row.LOTE)) return false;
      if (filters.porte.length > 0 && !filters.porte.includes(row.PORTE)) return false;
      if (filters.subregiao.length > 0 && !filters.subregiao.includes(row.SUBREGIAO)) return false;
      return true;
    });
  }, [data, filters]);

  // Calcular vizinhos mais próximos
  const nearestNeighbors = useMemo((): NearestNeighbor[] => {
    if (filteredData.length < 2) return [];

    return filteredData.map(current => {
      let nearest = '';
      let minDistance = Infinity;

      filteredData.forEach(other => {
        if (current.POSTO !== other.POSTO) {
          const distance = haversineDistance(
            current.LATITUDE, current.LONGITUDE,
            other.LATITUDE, other.LONGITUDE
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearest = other.POSTO;
          }
        }
      });

      return {
        posto: current.POSTO,
        nearest,
        distance: minDistance
      };
    });
  }, [filteredData]);

  // Métricas resumo
  const summaryMetrics = useMemo(() => {
    const totalPostos = new Set(filteredData.map(row => row.POSTO)).size;
    const totalColetas = filteredData.reduce((sum, row) => sum + row['TOTAL DE COLETAS'], 0);
    const totalChamados = filteredData.reduce((sum, row) => sum + row['CHAMADOS HARDWARE'], 0);
    const avgNearestDistance = nearestNeighbors.length > 0 
      ? nearestNeighbors.reduce((sum, n) => sum + n.distance, 0) / nearestNeighbors.length 
      : 0;

    return {
      totalPostos,
      totalColetas,
      totalChamados,
      avgNearestDistance
    };
  }, [filteredData, nearestNeighbors]);

  // Calcular distâncias entre cidades selecionadas
  useEffect(() => {
    if (!filters.cidade1 || !filters.cidade2) {
      setDistanceData({ haversine: 0, osrm: null, loading: false });
      return;
    }

    const city1 = data.find(row => row.POSTO === filters.cidade1);
    const city2 = data.find(row => row.POSTO === filters.cidade2);

    if (!city1 || !city2) return;

    // Calcular Haversine
    const haversineKm = haversineDistance(
      city1.LATITUDE, city1.LONGITUDE,
      city2.LATITUDE, city2.LONGITUDE
    );

    setDistanceData(prev => ({ ...prev, haversine: haversineKm, loading: true }));

    // Calcular OSRM (opcional)
    getOSRMDistance(city1.LATITUDE, city1.LONGITUDE, city2.LATITUDE, city2.LONGITUDE)
      .then(osrmKm => {
        setDistanceData(prev => ({ ...prev, osrm: osrmKm, loading: false }));
      })
      .catch(() => {
        setDistanceData(prev => ({ ...prev, osrm: null, loading: false }));
      });
  }, [filters.cidade1, filters.cidade2, data]);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      setFilters({
        cidade1: '',
        cidade2: '',
        uf: [],
        lote: [],
        porte: [],
        subregiao: []
      });
      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${parsedData.length} registros importados.`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao processar arquivo';
      setError(errorMessage);
      toast({
        title: "Erro ao processar arquivo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCities = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      cidade1: prev.cidade2,
      cidade2: prev.cidade1
    }));
  }, []);

  const handleClearSelection = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      cidade1: '',
      cidade2: ''
    }));
  }, []);

  const handleMarkerClick = useCallback((posto: string) => {
    setFilters(prev => {
      if (!prev.cidade1) {
        return { ...prev, cidade1: posto };
      } else if (!prev.cidade2 && prev.cidade1 !== posto) {
        return { ...prev, cidade2: posto };
      } else {
        // Se ambas estão preenchidas, substituir cidade1
        return { ...prev, cidade1: posto, cidade2: '' };
      }
    });
  }, []);

  // Se não há dados, mostrar upload
  if (data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ExcelUpload 
          onFileSelect={handleFileSelect}
          loading={loading}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            Painel Interativo de Análise
          </h1>
          <p className="text-muted-foreground">
            Dashboard para análise de dados geográficos e métricas operacionais
          </p>
        </div>

        {/* Cartões Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total de Postos"
            value={summaryMetrics.totalPostos}
            icon={<Building2 />}
            variant="primary"
          />
          <MetricCard
            title="Total de Coletas"
            value={summaryMetrics.totalColetas.toLocaleString('pt-BR')}
            icon={<BarChart3 />}
            variant="accent"
          />
          <MetricCard
            title="Chamados Hardware"
            value={summaryMetrics.totalChamados.toLocaleString('pt-BR')}
            icon={<Zap />}
            variant="warning"
          />
          <MetricCard
            title="Distância Média Vizinhos"
            value={`${summaryMetrics.avgNearestDistance.toFixed(2)} km`}
            icon={<TrendingDown />}
          />
        </div>

        {/* Seção Principal - Mapa e Filtros */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Mapa */}
          <div className="xl:col-span-3 space-y-4">
            <div className="h-[500px]">
              <DashboardMap
                data={filteredData}
                selectedCity1={filters.cidade1}
                selectedCity2={filters.cidade2}
                onMarkerClick={handleMarkerClick}
              />
            </div>
            
            {/* Cartões de Distância */}
            {(filters.cidade1 && filters.cidade2) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MetricCard
                  title="Distância Haversine"
                  value={`${distanceData.haversine.toFixed(2)} km`}
                  subtitle={`${filters.cidade1} ↔ ${filters.cidade2}`}
                  icon={<Ruler />}
                  variant="accent"
                />
                <MetricCard
                  title="Distância OSRM (Rota)"
                  value={distanceData.osrm ? `${distanceData.osrm.toFixed(2)} km` : '—'}
                  subtitle={distanceData.loading ? 'Calculando...' : 'Via estradas'}
                  icon={<Route />}
                  loading={distanceData.loading}
                />
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="xl:col-span-1">
            <FilterControls
              data={data}
              filters={filters}
              onFiltersChange={setFilters}
              onSwapCities={handleSwapCities}
              onClearSelection={handleClearSelection}
            />
          </div>
        </div>

        {/* Gráficos */}
        <ChartsGrid 
          data={filteredData}
          nearestNeighbors={nearestNeighbors}
          loading={loading}
        />

        {/* Tabela de Vizinhos */}
        <NearestNeighborsTable 
          data={nearestNeighbors}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Index;
