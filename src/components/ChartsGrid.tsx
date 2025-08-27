import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExcelRow, NearestNeighbor } from '@/types/excel-data';
import { TrendingUp, Zap, Activity } from 'lucide-react';

interface ChartsGridProps {
  data: ExcelRow[];
  nearestNeighbors: NearestNeighbor[];
  loading?: boolean;
}

export function ChartsGrid({ data, nearestNeighbors, loading = false }: ChartsGridProps) {
  // Preparar dados para o gráfico de chamados por POSTO (Top 15)
  const chamadosData = data
    .map(row => ({
      posto: row.POSTO.replace('PPT ', ''), // Simplificar nomes
      chamados: row['CHAMADOS HARDWARE']
    }))
    .sort((a, b) => b.chamados - a.chamados)
    .slice(0, 15);

  // Preparar dados para o gráfico de menores distâncias (Top 10)
  const distancesData = nearestNeighbors
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10)
    .map(item => ({
      posto: item.posto.replace('PPT ', ''),
      distancia: Number(item.distance.toFixed(2))
    }));

  // Preparar dados para coletas por LOTE
  const coletasPorLote = data.reduce((acc, row) => {
    const lote = row.LOTE;
    acc[lote] = (acc[lote] || 0) + row['TOTAL DE COLETAS'];
    return acc;
  }, {} as Record<string, number>);

  const coletasData = Object.entries(coletasPorLote)
    .map(([lote, total]) => ({ lote, coletas: total }))
    .sort((a, b) => b.coletas - a.coletas);

  const LoadingChart = () => (
    <div className="h-80 flex items-center justify-center">
      <div className="space-y-4 w-full">
        <div className="h-6 bg-muted/20 rounded animate-pulse" />
        <div className="h-64 bg-muted/20 rounded animate-pulse" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Chamados Hardware por POSTO */}
      <Card className="dashboard-elevated shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            Top 15 - Chamados Hardware
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chamadosData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="posto" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Bar 
                  dataKey="chamados" 
                  fill="url(#gradientWarning)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradientWarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--warning))" />
                    <stop offset="100%" stopColor="hsl(var(--warning) / 0.7)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top 10 Menores Distâncias */}
      <Card className="dashboard-elevated shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Top 10 - Menores Distâncias
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={distancesData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="posto" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  formatter={(value) => [`${value} km`, 'Distância']}
                />
                <Bar 
                  dataKey="distancia" 
                  fill="url(#gradientAccent)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradientAccent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" />
                    <stop offset="100%" stopColor="hsl(var(--accent) / 0.7)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Coletas por LOTE */}
      <Card className="dashboard-elevated shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Total de Coletas por Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingChart />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={coletasData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="lote" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  formatter={(value) => [value.toLocaleString('pt-BR'), 'Coletas']}
                />
                <Bar 
                  dataKey="coletas" 
                  fill="url(#gradientPrimary)" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="gradientPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.7)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}