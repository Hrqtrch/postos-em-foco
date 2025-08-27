import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Target } from 'lucide-react';

interface RadiusFilterProps {
  minRadius: number;
  maxRadius: number;
  onRadiusChange: (min: number, max: number) => void;
  selectedPosto?: string;
}

export function RadiusFilter({ 
  minRadius, 
  maxRadius, 
  onRadiusChange, 
  selectedPosto 
}: RadiusFilterProps) {
  const handleMinChange = (value: number[]) => {
    const newMin = value[0];
    onRadiusChange(newMin, Math.max(newMin, maxRadius));
  };

  const handleMaxChange = (value: number[]) => {
    const newMax = value[0];
    onRadiusChange(Math.min(minRadius, newMax), newMax);
  };

  return (
    <Card className="dashboard-elevated shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Filtro de Raio Dinâmico
        </CardTitle>
        {selectedPosto && (
          <p className="text-sm text-muted-foreground">
            Centro: <span className="font-medium">{selectedPosto}</span>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Raio Mínimo</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {minRadius} km
            </span>
          </div>
          <Slider
            value={[minRadius]}
            onValueChange={handleMinChange}
            max={500}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Raio Máximo</Label>
            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
              {maxRadius} km
            </span>
          </div>
          <Slider
            value={[maxRadius]}
            onValueChange={handleMaxChange}
            max={500}
            step={1}
            className="w-full"
          />
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <p><strong>Como usar:</strong></p>
          <p>• Selecione um posto na tabela abaixo para definir o centro</p>
          <p>• Ajuste os raios para filtrar postos na área desejada</p>
          <p>• A tabela mostrará todos os postos dentro do raio selecionado</p>
        </div>
      </CardContent>
    </Card>
  );
}