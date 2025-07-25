"use client";

import dynamic from "next/dynamic";
import { mockWasteReports, mockFloodZones, mockDumpSites } from "@/lib/data";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import type { MapComponentProps } from "./map-component";


const MapComponent = dynamic(
  () => import('@/components/map-component').then(mod => mod.MapComponent),
  {
    ssr: false,
    loading: () => (
        <Card className="w-full h-[60vh] p-0 overflow-hidden rounded-lg shadow-lg">
            <Skeleton className="w-full h-full" />
        </Card>
    ),
  }
);

interface DashboardMapProps {
    view?: 'all' | 'reports' | 'flood' | 'dumpsites';
}


export default function DashboardMap({ view = 'all' }: DashboardMapProps) {
    
    // Convert mockFloodZones to match Zone interface
    const formattedFloodZones = mockFloodZones.map(zone => ({
        ...zone,
        // Take the first point from polygon as the location
        location: zone.polygon[0],
        // Remove the polygon property since it's not needed anymore
        polygon: undefined
    }));

    const mapProps: MapComponentProps = {
        reports: view === 'all' || view === 'reports' ? mockWasteReports : [],
        floodZones: view === 'all' || view === 'flood' ? formattedFloodZones : [],
        dumpSites: view === 'all' || view === 'dumpsites' ? mockDumpSites : []
    };

    return <MapComponent {...mapProps} />;
}
