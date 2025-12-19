
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Business } from '../types';
import { Maximize2, X, Navigation, Layers } from 'lucide-react';

interface Map3DProps {
  businesses: Business[];
  zoom?: number;
  onBusinessSelect: (b: Business) => void;
  selectedId?: string;
  idKey: string;
}

const Map3D: React.FC<Map3DProps> = ({ businesses, zoom, onBusinessSelect, selectedId, idKey }) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapMode, setMapMode] = useState<'hybrid' | 'streets'>('hybrid');
  
  const prevIdsRef = useRef<string>('');

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [22.15, -100.98],
      zoom: zoom || 13,
      zoomControl: false,
      attributionControl: false
    });

    // 1. Capa de Satélite Base
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
    
    // 2. Capa Híbrida: Calles, Nombres de Vías y Límites (Visible sobre satélite)
    const labelLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        opacity: 1,
        zIndex: 1000
    });

    // 3. Capa de Transporte Detallada (Añade calles que a veces faltan en la híbrida estándar)
    const transportLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        opacity: 0.8,
        zIndex: 900
    });

    satelliteLayer.addTo(map);
    transportLayer.addTo(map);
    labelLayer.addTo(map);

    markersGroupRef.current = L.featureGroup().addTo(map);
    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    const currentIds = businesses.map(b => b.id).join(',');
    group.clearLayers();

    businesses.forEach(business => {
      const isSelected = selectedId === business.id;
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-white border-4 ${isSelected ? 'border-mex-pink scale-125 radar-active' : 'border-white/40'} shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500">
              <img src="${business.logo}" class="w-full h-full object-contain p-1" />
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([business.x, business.y], { icon: customIcon })
        .on('click', () => onBusinessSelect(business));
      
      group.addLayer(marker);
    });

    if (businesses.length > 0 && (currentIds !== prevIdsRef.current || selectedId)) {
      prevIdsRef.current = currentIds;
      
      if (selectedId) {
        const selected = businesses.find(b => b.id === selectedId);
        if (selected) map.flyTo([selected.x, selected.y], 17, { duration: 1.5 });
      } else {
        const bounds = group.getBounds();
        map.flyToBounds(bounds, { padding: [60, 60], duration: 2, easeLinearity: 0.25 });
      }
    }
  }, [businesses, selectedId]);

  useEffect(() => {
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 400);
  }, [isExpanded]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const centerMap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mapRef.current && markersGroupRef.current && businesses.length > 0) {
      mapRef.current.flyToBounds(markersGroupRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className={`relative transition-all duration-500 ease-in-out bg-slate-900 ${isExpanded ? 'fixed inset-0 z-[2000]' : 'w-full h-full rounded-[32px] overflow-hidden border border-mex-pink/20'}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute top-4 right-4 flex flex-col gap-3 z-[2100]">
        <button onClick={toggleExpand} className={`p-3 backdrop-blur-md rounded-2xl shadow-2xl transition-all ${isExpanded ? 'bg-red-500 text-white' : 'bg-slate-950/80 text-white hover:bg-mex-pink'}`}>
          {isExpanded ? <X size={20} /> : <Maximize2 size={20} />}
        </button>
        <button onClick={centerMap} className="p-3 bg-slate-950/80 backdrop-blur-md text-white rounded-2xl shadow-2xl hover:bg-white hover:text-slate-900 transition-all">
          <Navigation size={20} />
        </button>
      </div>

      <div className="absolute bottom-6 left-6 z-[2100] bg-slate-950/90 backdrop-blur-xl p-4 rounded-2xl border border-mex-pink/30 shadow-2xl">
        <p className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-mex-pink rounded-full animate-pulse"></span> {isExpanded ? 'Sistema Maestro Charlitron: Calles y Relieve Activos' : 'Radar Industrial v3.1'}
        </p>
      </div>
    </div>
  );
};

export default Map3D;
