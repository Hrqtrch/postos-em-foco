import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Search, MapPin, Target } from 'lucide-react';
import { NearestNeighbor, NeighborInRadius, ExcelRow } from '@/types/excel-data';
import { haversineDistance } from '@/utils/distance';
import { RadiusFilter } from './RadiusFilter';

interface NearestNeighborsTableProps {
  data: NearestNeighbor[];
  allData: ExcelRow[];
  loading?: boolean;
}

export function NearestNeighborsTable({ data, allData, loading = false }: NearestNeighborsTableProps) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPosto, setSelectedPosto] = useState<string>('');
  const [radiusMin, setRadiusMin] = useState(0);
  const [radiusMax, setRadiusMax] = useState(100);
  const [showRadiusMode, setShowRadiusMode] = useState(false);
  const itemsPerPage = 10;

  // Dados para modo raio dinâmico
  const radiusNeighbors = React.useMemo((): NeighborInRadius[] => {
    if (!selectedPosto || !showRadiusMode) return [];
    
    const centerPost = allData.find(row => row.POSTO === selectedPosto);
    if (!centerPost) return [];

    return allData
      .filter(row => row.POSTO !== selectedPosto)
      .map(row => {
        const distance = haversineDistance(
          centerPost.LATITUDE, centerPost.LONGITUDE,
          row.LATITUDE, row.LONGITUDE
        );
        const haversineTime = Math.round((distance / 60) * 60); // 60 km/h média
        
        return {
          posto: row.POSTO,
          targetPosto: selectedPosto,
          distance,
          lote: row.LOTE,
          porte: row.PORTE,
          haversineTime
        };
      })
      .filter(item => item.distance >= radiusMin && item.distance <= radiusMax)
      .sort((a, b) => a.distance - b.distance);
  }, [selectedPosto, allData, radiusMin, radiusMax, showRadiusMode]);

  // Dados para exibição (modo normal ou raio)
  const displayData = showRadiusMode ? radiusNeighbors : data;
  
  const filteredData = displayData.filter(item => {
    if (showRadiusMode) {
      const radiusItem = item as NeighborInRadius;
      return radiusItem.posto.toLowerCase().includes(search.toLowerCase());
    } else {
      const neighborItem = item as NearestNeighbor;
      return neighborItem.posto.toLowerCase().includes(search.toLowerCase()) ||
             neighborItem.nearest.toLowerCase().includes(search.toLowerCase());
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, showRadiusMode]);

  const handleRadiusChange = (min: number, max: number) => {
    setRadiusMin(min);
    setRadiusMax(max);
  };

  const handlePostoSelect = (posto: string) => {
    setSelectedPosto(posto);
    setShowRadiusMode(true);
  };

  const toggleMode = () => {
    setShowRadiusMode(!showRadiusMode);
    if (!showRadiusMode) {
      setSelectedPosto('');
    }
  };

  if (loading) {
    return (
      <Card className="dashboard-elevated shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Vizinhos Mais Próximos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-muted/20 rounded animate-pulse" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtro de Raio - apenas quando necessário */}
      {showRadiusMode && (
        <RadiusFilter
          minRadius={radiusMin}
          maxRadius={radiusMax}
          onRadiusChange={handleRadiusChange}
          selectedPosto={selectedPosto}
        />
      )}

      <Card className="dashboard-elevated shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {showRadiusMode ? <Target className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              {showRadiusMode ? 'Postos no Raio Selecionado' : 'Vizinhos Mais Próximos'}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
            >
              {showRadiusMode ? 'Modo Normal' : 'Modo Raio'}
            </Button>
          </div>
          {showRadiusMode && (
            <p className="text-sm text-muted-foreground">
              Mostrando postos de {radiusMin}km a {radiusMax}km de distância de {selectedPosto}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por posto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posto</TableHead>
                  {!showRadiusMode && <TableHead>Mais Próximo</TableHead>}
                  <TableHead>Lote</TableHead>
                  <TableHead>Porte</TableHead>
                  <TableHead className="text-right">Distância (km)</TableHead>
                  <TableHead className="text-right">Tempo Haversine (min)</TableHead>
                  <TableHead className="text-right">Tempo OSRM (min)</TableHead>
                  {!showRadiusMode && <TableHead className="text-center">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showRadiusMode ? 6 : 8} className="text-center py-8 text-muted-foreground">
                      {search ? 'Nenhum resultado encontrado' : 'Nenhum dado disponível'}
                      {showRadiusMode && !selectedPosto && (
                        <div className="mt-2 text-sm">
                          Selecione um posto para ver postos no raio selecionado
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item, index) => {
                    if (showRadiusMode) {
                      const radiusItem = item as NeighborInRadius;
                      return (
                        <TableRow key={`${radiusItem.posto}-${index}`}>
                          <TableCell className="font-medium">{radiusItem.posto}</TableCell>
                          <TableCell>{radiusItem.lote}</TableCell>
                          <TableCell>{radiusItem.porte}</TableCell>
                          <TableCell className="text-right font-mono">
                            {radiusItem.distance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {radiusItem.haversineTime || 0}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {radiusItem.osrmTime || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    } else {
                      const neighborItem = item as NearestNeighbor;
                      return (
                        <TableRow key={`${neighborItem.posto}-${index}`}>
                          <TableCell className="font-medium">{neighborItem.posto}</TableCell>
                          <TableCell>{neighborItem.nearest}</TableCell>
                          <TableCell>{neighborItem.lote}</TableCell>
                          <TableCell>{neighborItem.porte}</TableCell>
                          <TableCell className="text-right font-mono">
                            {neighborItem.distance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {neighborItem.haversineTime || 0}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {neighborItem.osrmTime || '—'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePostoSelect(neighborItem.posto)}
                              className="h-8 px-2"
                            >
                              Ver Raio
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length} registros
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}