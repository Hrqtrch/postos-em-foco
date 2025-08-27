import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, ArrowLeftRight, Trash2, Filter } from 'lucide-react';
import { ExcelRow, FilterState } from '@/types/excel-data';

interface FilterControlsProps {
  data: ExcelRow[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSwapCities: () => void;
  onClearSelection: () => void;
}

export function FilterControls({ 
  data, 
  filters, 
  onFiltersChange, 
  onSwapCities, 
  onClearSelection 
}: FilterControlsProps) {
  const uniquePostos = [...new Set(data.map(row => row.POSTO))].sort();
  const uniqueUFs = [...new Set(data.map(row => row.UF))].sort();
  const uniqueLotes = [...new Set(data.map(row => row.LOTE))].sort();
  const uniquePortes = [...new Set(data.map(row => row.PORTE))].sort();
  const uniqueSubregioes = [...new Set(data.map(row => row.SUBREGIAO))].sort();

  const handleMultiSelectChange = (key: keyof FilterState, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [key]: newValues
    });
  };

  const removeMultiSelectValue = (key: keyof FilterState, value: string) => {
    const currentValues = filters[key] as string[];
    onFiltersChange({
      ...filters,
      [key]: currentValues.filter(v => v !== value)
    });
  };

  return (
    <Card className="dashboard-elevated shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtros obrigatórios */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Cidades para Análise</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade 1</label>
              <Select 
                value={filters.cidade1} 
                onValueChange={(value) => onFiltersChange({ ...filters, cidade1: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a primeira cidade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {uniquePostos.map(posto => (
                    <SelectItem key={posto} value={posto}>{posto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade 2</label>
              <Select 
                value={filters.cidade2} 
                onValueChange={(value) => onFiltersChange({ ...filters, cidade2: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a segunda cidade" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {uniquePostos.map(posto => (
                    <SelectItem key={posto} value={posto}>{posto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSwapCities}
              disabled={!filters.cidade1 || !filters.cidade2}
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Inverter Cidades
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearSelection}
              disabled={!filters.cidade1 && !filters.cidade2}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Seleção
            </Button>
          </div>
        </div>

        {/* Filtros opcionais */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">Filtros Adicionais</h4>
          
          {/* UF */}
          <div className="space-y-2">
            <label className="text-sm font-medium">UF</label>
            <Select onValueChange={(value) => handleMultiSelectChange('uf', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar UF" />
              </SelectTrigger>
              <SelectContent>
                {uniqueUFs.map(uf => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.uf.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.uf.map(uf => (
                  <Badge key={uf} variant="secondary" className="text-xs">
                    {uf}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeMultiSelectValue('uf', uf)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* LOTE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lote</label>
            <Select onValueChange={(value) => handleMultiSelectChange('lote', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar Lote" />
              </SelectTrigger>
              <SelectContent>
                {uniqueLotes.map(lote => (
                  <SelectItem key={lote} value={lote}>{lote}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.lote.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.lote.map(lote => (
                  <Badge key={lote} variant="secondary" className="text-xs">
                    {lote}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeMultiSelectValue('lote', lote)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* PORTE */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Porte</label>
            <Select onValueChange={(value) => handleMultiSelectChange('porte', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar Porte" />
              </SelectTrigger>
              <SelectContent>
                {uniquePortes.map(porte => (
                  <SelectItem key={porte} value={porte}>{porte}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.porte.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.porte.map(porte => (
                  <Badge key={porte} variant="secondary" className="text-xs">
                    {porte}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeMultiSelectValue('porte', porte)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* SUBREGIAO */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sub-região</label>
            <Select onValueChange={(value) => handleMultiSelectChange('subregiao', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Adicionar Sub-região" />
              </SelectTrigger>
              <SelectContent>
                {uniqueSubregioes.map(subregiao => (
                  <SelectItem key={subregiao} value={subregiao}>{subregiao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.subregiao.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.subregiao.map(subregiao => (
                  <Badge key={subregiao} variant="secondary" className="text-xs">
                    {subregiao}
                    <X 
                      className="w-3 h-3 ml-1 cursor-pointer" 
                      onClick={() => removeMultiSelectValue('subregiao', subregiao)} 
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}