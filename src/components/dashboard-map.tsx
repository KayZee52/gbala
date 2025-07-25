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
    
    const mapProps: MapComponentProps = {
        reports: view === 'all' || view === 'reports' ? mockWasteReports : [],
        floodZones: view === 'all' || view === 'flood' ? mockFloodZones : [],
        dumpSites: view === 'all' || view === 'dumpsites' ? mockDumpSites : []
    };

    return <MapComponent {...mapProps} />;
}
