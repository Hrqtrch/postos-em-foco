import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface ExcelUploadProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
  error?: string | null;
}

export function ExcelUpload({ onFileSelect, loading = false, error }: ExcelUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card className={cn(
        "dashboard-elevated border-2 border-dashed transition-all duration-300",
        dragActive && "border-primary bg-primary/5",
        !dragActive && "border-muted-foreground/25 hover:border-primary/50"
      )}>
        <CardContent className="p-8">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="text-center space-y-4"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Upload do Arquivo Excel</h3>
              <p className="text-muted-foreground">
                Arraste e solte seu arquivo .xlsx aqui ou clique para selecionar
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="default"
                size="lg"
                disabled={loading}
                className="relative"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {loading ? 'Processando...' : 'Selecionar Arquivo'}
              </Button>
              
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInput}
                className="hidden"
                disabled={loading}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Formatos aceitos: .xlsx, .xls</p>
              <p>Colunas obrigatórias: POSTO, ESTADO, UF, PAIS, LOTE, PORTE, CHAMADOS HARDWARE, QTDE. KIT, TOTAL DE COLETAS, LATITUDE, LONGITUDE</p>
              <p>Nota: SUBREGIAO pode conter células vazias</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}