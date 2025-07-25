

"use client";

import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Plus, Trash, Droplets, Recycle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { renderToStaticMarkup } from 'react-dom/server';


// Hack to fix marker icon issue with webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

interface Report {
  id: number;
  location: Location;
  description: string;
}

interface Zone {
  id: number;
  location: Location;
  name: string;
}

interface DumpSite {
    id: number;
    location: Location;
    name: string;
}

export interface MapComponentProps {
  reports: Report[];
  floodZones: Zone[];
  dumpSites: DumpSite[];
}

const createIcon = (icon: React.ReactElement, color: string) => {
    return L.divIcon({
        html: `<div class="p-2 rounded-full shadow-lg flex items-center justify-center" style="background-color: ${color};">${renderToStaticMarkup(icon)}</div>`,
        className: 'bg-transparent border-0',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
};

const reportIcon = createIcon(<Trash className="w-4 h-4 text-white" />, '#f43f5e'); // red-500
const floodIcon = createIcon(<Droplets className="w-4 h-4 text-white" />, '#3b82f6'); // blue-500
const dumpSiteIcon = createIcon(<Recycle className="w-4 h-4 text-white" />, '#8b5cf6'); // violet-500


const userIcon = L.divIcon({
    html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

// This component handles map view updates without re-rendering the container
function MapUpdater({ userPosition }: { userPosition: Location | null }) {
    const map = useMap();
    useEffect(() => {
        if (userPosition) {
            map.flyTo([userPosition.lat, userPosition.lng], 13);
        }
    }, [userPosition, map]);
    return null;
}

function ReportWasteButton() {
    const map = useMap();
    const router = useRouter();

    const handleReportClick = () => {
        map.locate().on('locationfound', function (e) {
            const { lat, lng } = e.latlng;
            
            const newReportMarker = L.marker(e.latlng, { icon: userIcon }).addTo(map);

            const container = document.createElement('div');
            container.className = "space-y-2";
            
            const p = document.createElement('p');
            p.textContent = "Report waste at this location?";
            p.className = "font-semibold";
            
            const button = document.createElement('button');
            button.className = "bg-primary text-primary-foreground p-2 rounded-md w-full inline-block text-center no-underline text-sm";
            button.textContent = 'Confirm Location';
            button.onclick = (e) => {
                e.preventDefault();
                router.push(`/report-waste?lat=${lat}&lng=${lng}`);
            };

            container.appendChild(p);
            container.appendChild(button);

            newReportMarker.bindPopup(container).openPopup();
        });
    };

    return (
        <Button 
            className="absolute bottom-4 right-4 z-[1000] rounded-full h-14 w-14 shadow-lg"
            onClick={handleReportClick}
            aria-label="Report Waste"
        >
            <Plus className="h-6 w-6" />
        </Button>
    )
}

export function MapComponent({ reports, floodZones, dumpSites }: MapComponentProps) {
  const [userPosition, setUserPosition] = useState<Location | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    // Default to Liberia if geolocation fails or is denied
    const defaultPosition = { lat: 6.3150, lng: -10.8048 };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location, defaulting to Liberia:", error.message);
          setUserPosition(defaultPosition);
        },
        {
          enableHighAccuracy: true,
        }
      );
    } else {
        console.log("Geolocation not supported, defaulting to Liberia.");
        setUserPosition(defaultPosition);
    }
  }, []);

  if (!isMounted) {
    return (
      <Card className="w-full h-[60vh] p-0 overflow-hidden rounded-lg shadow-lg">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  const showReportButton = reports.length > 0 || (reports.length === 0 && floodZones.length === 0 && dumpSites.length === 0);


  return (
    <Card className="w-full h-full p-0 overflow-hidden rounded-lg shadow-lg relative min-h-[400px]">
        <MapContainer 
            center={[6.3150, -10.8048]} // Start with a default center in Liberia
            zoom={12} 
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            maxZoom={18}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Dark Mode">
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Street Map">
                 <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Satellite View">
                <TileLayer
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    maxZoom={18}
                />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {userPosition && (
              <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
                  <Popup>Your approximate location</Popup>
              </Marker>
          )}
          {reports.map((report) => (
            <Marker key={`report-${report.id}`} position={[report.location.lat, report.location.lng]} icon={reportIcon}>
              <Popup>{report.description}</Popup>
            </Marker>
          ))}
          {floodZones.map((zone) => (
             <Marker key={`zone-${zone.id}`} position={[zone.location.lat, zone.location.lng]} icon={floodIcon}>
              <Popup>{zone.name}</Popup>
            </Marker>
          ))}
          {dumpSites.map((site) => (
             <Marker key={`dump-site-${site.id}`} position={[site.location.lat, site.location.lng]} icon={dumpSiteIcon}>
              <Popup>{site.name}</Popup>
            </Marker>
          ))}
          <MapUpdater userPosition={userPosition} />
          {showReportButton && <ReportWasteButton />}
        </MapContainer>
    </Card>
  );
}
