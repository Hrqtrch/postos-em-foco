import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ExcelRow } from '@/types/excel-data';

// Fix para os ícones do Leaflet no Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DashboardMapProps {
  data: ExcelRow[];
  selectedCity1?: string;
  selectedCity2?: string;
  onMarkerClick?: (posto: string) => void;
}

export function DashboardMap({ data, selectedCity1, selectedCity2, onMarkerClick }: DashboardMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ícones personalizados
  const defaultIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const selectedIcon = L.divIcon({
    className: 'custom-marker-selected',
    html: `<div class="w-8 h-8 bg-accent rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-pulse">
      <div class="w-3 h-3 bg-white rounded-full"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [-14.235, -51.9253], // Centro do Brasil
      zoom: 4,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  // Atualizar marcadores
  useEffect(() => {
    if (!mapRef.current || !markersRef.current || !data.length) return;

    markersRef.current.clearLayers();

    data.forEach((row) => {
      const isSelected = row.POSTO === selectedCity1 || row.POSTO === selectedCity2;
      const icon = isSelected ? selectedIcon : defaultIcon;

      const marker = L.marker([row.LATITUDE, row.LONGITUDE], { icon })
        .bindPopup(`
          <div class="p-3 space-y-2 min-w-[200px]">
            <h3 class="font-semibold text-sm">${row.POSTO}</h3>
            <div class="space-y-1 text-xs">
              <p><span class="font-medium">UF:</span> ${row.UF}</p>
              <p><span class="font-medium">Lote:</span> ${row.LOTE}</p>
              <p><span class="font-medium">Porte:</span> ${row.PORTE}</p>
              <p><span class="font-medium">Chamados Hardware:</span> ${row['CHAMADOS HARDWARE']}</p>
              <p><span class="font-medium">Total Coletas:</span> ${row['TOTAL DE COLETAS']}</p>
            </div>
          </div>
        `, {
          className: 'custom-popup'
        });

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(row.POSTO));
      }

      markersRef.current!.addLayer(marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(row => [row.LATITUDE, row.LONGITUDE]));
      mapRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [data, selectedCity1, selectedCity2, onMarkerClick]);

  // Desenhar linha entre cidades selecionadas
  useEffect(() => {
    if (!mapRef.current) return;

    // Remover linha anterior
    if (routeLineRef.current) {
      mapRef.current.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    if (!selectedCity1 || !selectedCity2) return;

    const city1Data = data.find(row => row.POSTO === selectedCity1);
    const city2Data = data.find(row => row.POSTO === selectedCity2);

    if (city1Data && city2Data) {
      routeLineRef.current = L.polyline([
        [city1Data.LATITUDE, city1Data.LONGITUDE],
        [city2Data.LATITUDE, city2Data.LONGITUDE]
      ], {
        color: 'hsl(142 76% 36%)',
        weight: 3,
        opacity: 0.8,
        dashArray: '10, 5'
      }).addTo(mapRef.current);
    }
  }, [data, selectedCity1, selectedCity2]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden shadow-card">
      <div 
        ref={containerRef} 
        className="absolute inset-0 rounded-lg"
        style={{ background: 'hsl(var(--dashboard-surface))' }}
      />
    </div>
  );
}