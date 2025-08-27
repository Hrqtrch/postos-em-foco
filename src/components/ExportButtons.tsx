import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';
import { ExcelRow, NearestNeighbor } from '@/types/excel-data';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportButtonsProps {
  data: ExcelRow[];
  nearestNeighbors: NearestNeighbor[];
  summaryMetrics: {
    totalPostos: number;
    totalColetas: number;
    totalChamados: number;
    avgNearestDistance: number;
  };
}

export function ExportButtons({ data, nearestNeighbors, summaryMetrics }: ExportButtonsProps) {
  const exportToExcel = async () => {
    try {
      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Aba 1: Dados principais
      const wsData = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, wsData, 'Dados Principais');
      
      // Aba 2: Vizinhos mais próximos
      const neighborsData = nearestNeighbors.map(n => ({
        'Posto': n.posto,
        'Mais Próximo': n.nearest,
        'Distância (km)': n.distance.toFixed(2),
        'Lote': n.lote,
        'Porte': n.porte,
        'Tempo Haversine (min)': n.haversineTime || 0,
        'Tempo OSRM (min)': n.osrmTime || 0
      }));
      const wsNeighbors = XLSX.utils.json_to_sheet(neighborsData);
      XLSX.utils.book_append_sheet(wb, wsNeighbors, 'Vizinhos Mais Próximos');
      
      // Aba 3: Métricas resumo
      const metricsData = [
        { 'Métrica': 'Total de Postos', 'Valor': summaryMetrics.totalPostos },
        { 'Métrica': 'Total de Coletas', 'Valor': summaryMetrics.totalColetas },
        { 'Métrica': 'Chamados Hardware', 'Valor': summaryMetrics.totalChamados },
        { 'Métrica': 'Distância Média Vizinhos (km)', 'Valor': summaryMetrics.avgNearestDistance.toFixed(2) }
      ];
      const wsMetrics = XLSX.utils.json_to_sheet(metricsData);
      XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas Resumo');
      
      // Salvar arquivo
      XLSX.writeFile(wb, `dashboard-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Exportação concluída!",
        description: "Arquivo Excel baixado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao gerar arquivo Excel.",
        variant: "destructive"
      });
    }
  };

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.height;
      let yPosition = 20;

      // Título
      pdf.setFontSize(20);
      pdf.text('Dashboard - Relatório Completo', 20, yPosition);
      yPosition += 15;

      // Data
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition);
      yPosition += 15;

      // Métricas resumo
      pdf.setFontSize(14);
      pdf.text('Métricas Resumo', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      const metrics = [
        `Total de Postos: ${summaryMetrics.totalPostos}`,
        `Total de Coletas: ${summaryMetrics.totalColetas.toLocaleString('pt-BR')}`,
        `Chamados Hardware: ${summaryMetrics.totalChamados.toLocaleString('pt-BR')}`,
        `Distância Média Vizinhos: ${summaryMetrics.avgNearestDistance.toFixed(2)} km`
      ];

      metrics.forEach(metric => {
        pdf.text(metric, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Capturar screenshot do dashboard
      const dashboardElement = document.querySelector('.dashboard-container');
      if (dashboardElement) {
        const canvas = await html2canvas(dashboardElement as HTMLElement, {
          scale: 0.5,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Verificar se precisa de nova página
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
      }

      pdf.save(`dashboard-export-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Exportação concluída!",
        description: "Arquivo PDF baixado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao gerar arquivo PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        className="flex items-center gap-2"
      >
        <Table className="w-4 h-4" />
        Exportar Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Exportar PDF
      </Button>
    </div>
  );
}