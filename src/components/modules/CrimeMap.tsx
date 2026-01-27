import { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { CrimeIncident, PatrolUnit, MapBounds, CrimeType } from '@/types/crime';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Car, Layers } from 'lucide-react';
import { format } from 'date-fns';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Crime type icons and colors
const crimeConfig: Record<CrimeType, { color: string; shape: 'triangle' | 'square' | 'circle' }> = {
  MURDER: { color: '#ef4444', shape: 'triangle' },
  ASSAULT: { color: '#f97316', shape: 'triangle' },
  ROBBERY: { color: '#eab308', shape: 'square' },
  BURGLARY: { color: '#f59e0b', shape: 'square' },
  THEFT: { color: '#f59e0b', shape: 'square' },
  VEHICLE_THEFT: { color: '#f59e0b', shape: 'square' },
  CYBER: { color: '#3b82f6', shape: 'circle' },
  FRAUD: { color: '#6366f1', shape: 'circle' },
  VANDALISM: { color: '#a855f7', shape: 'circle' },
  DRUG_OFFENSE: { color: '#22c55e', shape: 'circle' },
  OTHER: { color: '#64748b', shape: 'circle' },
};

function createCrimeIcon(type: CrimeType): L.DivIcon {
  const config = crimeConfig[type];
  
  let svg: string;
  if (config.shape === 'triangle') {
    svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${config.color}">
      <polygon points="12,3 22,21 2,21" stroke="#fff" stroke-width="1"/>
    </svg>`;
  } else if (config.shape === 'square') {
    svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${config.color}">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="#fff" stroke-width="1"/>
    </svg>`;
  } else {
    svg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${config.color}">
      <circle cx="12" cy="12" r="8" stroke="#fff" stroke-width="1"/>
    </svg>`;
  }
  
  return L.divIcon({
    html: svg,
    className: 'custom-crime-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createPatrolIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width: 32px; height: 32px; background: hsl(217, 91%, 60%); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
      </svg>
    </div>`,
    className: 'patrol-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

interface MapControllerProps {
  bounds: MapBounds;
  incidents: CrimeIncident[];
  showHeatmap: boolean;
  showPins: boolean;
}

function MapController({ bounds, incidents, showHeatmap, showPins }: MapControllerProps) {
  const map = useMap();
  const markerClusterRef = useRef<any>(null);
  const heatLayerRef = useRef<any>(null);

  // Update map view when bounds change
  useEffect(() => {
    map.setView(bounds.center, bounds.zoom);
  }, [map, bounds]);

  // Marker cluster layer
  useEffect(() => {
    if (markerClusterRef.current) {
      map.removeLayer(markerClusterRef.current);
    }

    if (showPins) {
      markerClusterRef.current = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      incidents.forEach((incident) => {
        const marker = L.marker([incident.latitude, incident.longitude], {
          icon: createCrimeIcon(incident.type),
        });

        marker.bindPopup(`
          <div style="min-width: 200px;">
            <div style="font-weight: 600; color: hsl(210, 40%, 98%);">${incident.id}</div>
            <div style="font-size: 12px; color: hsl(215, 20%, 65%); margin-top: 4px;">
              <strong>Type:</strong> ${incident.type.replace('_', ' ')}<br/>
              <strong>Date:</strong> ${format(incident.dateTime, 'PPp')}<br/>
              <strong>Status:</strong> <span style="color: ${incident.status === 'OPEN' ? 'hsl(0, 84%, 60%)' : 'hsl(142, 71%, 45%)'}">${incident.status}</span>
            </div>
          </div>
        `);

        markerClusterRef.current.addLayer(marker);
      });

      map.addLayer(markerClusterRef.current);
    }

    return () => {
      if (markerClusterRef.current) {
        map.removeLayer(markerClusterRef.current);
      }
    };
  }, [map, incidents, showPins]);

  // Heatmap layer
  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (showHeatmap) {
      const heatData = incidents.map((inc) => [inc.latitude, inc.longitude, 0.5]);
      heatLayerRef.current = (L as any).heatLayer(heatData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
          0.0: '#10b981',
          0.3: '#f59e0b',
          0.6: '#f97316',
          1.0: '#ef4444',
        },
      });
      map.addLayer(heatLayerRef.current);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, incidents, showHeatmap]);

  return null;
}

interface CrimeMapProps {
  incidents: CrimeIncident[];
  patrolUnits: PatrolUnit[];
  mapBounds: MapBounds;
}

export function CrimeMap({ incidents, patrolUnits, mapBounds }: CrimeMapProps) {
  const [showPins, setShowPins] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showPatrol, setShowPatrol] = useState(true);

  const patrolIcon = useMemo(() => createPatrolIcon(), []);

  return (
    <div className="relative h-full w-full">
      {/* Layer Controls */}
      <div className="absolute top-4 right-4 z-[1000] glass-card p-4 space-y-4 min-w-[200px]">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Layers className="w-4 h-4" />
          Layer Controls
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pins" className="text-sm">Pin Map</Label>
            <Switch id="pins" checked={showPins} onCheckedChange={setShowPins} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="heatmap" className="text-sm">Heatmap</Label>
            <Switch id="heatmap" checked={showHeatmap} onCheckedChange={setShowHeatmap} />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="patrol" className="text-sm">Patrol Units</Label>
            <Switch id="patrol" checked={showPatrol} onCheckedChange={setShowPatrol} />
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground">Legend</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-destructive" />
              <span className="text-muted-foreground">Violent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-warning" />
              <span className="text-muted-foreground">Property</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Cyber/Other</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Patrol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card px-4 py-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{incidents.length}</span> incidents
          </span>
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{patrolUnits.filter(u => u.status !== 'OFF_DUTY').length}</span> active units
          </span>
        </div>
      </div>

      <MapContainer
        center={mapBounds.center}
        zoom={mapBounds.zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController
          bounds={mapBounds}
          incidents={incidents}
          showHeatmap={showHeatmap}
          showPins={showPins}
        />

        {showPatrol && patrolUnits.map((unit) => (
          <Marker
            key={unit.id}
            position={[unit.latitude, unit.longitude]}
            icon={patrolIcon}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <div style={{ fontWeight: 600, color: 'hsl(210, 40%, 98%)' }}>{unit.name}</div>
                <div style={{ fontSize: '12px', color: 'hsl(215, 20%, 65%)', marginTop: '4px' }}>
                  Status: <span style={{ color: unit.status === 'AVAILABLE' ? 'hsl(142, 71%, 45%)' : unit.status === 'RESPONDING' ? 'hsl(38, 92%, 50%)' : 'inherit' }}>{unit.status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
