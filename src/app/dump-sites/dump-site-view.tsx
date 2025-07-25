"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DumpSiteList from './dump-site-list';
import DashboardMap from '@/components/dashboard-map';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { wasteTypes } from '@/lib/data';

type ViewMode = 'list' | 'map';

export default function DumpSiteView() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter');
  
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [wasteFilter, setWasteFilter] = useState(initialFilter || 'all');

  useEffect(() => {
    // This allows the filter to be updated if the user navigates
    // back to this page with a new filter in the URL.
    const newFilter = searchParams.get('filter');
    if (newFilter && newFilter !== wasteFilter) {
      setWasteFilter(newFilter);
    }
  }, [searchParams, wasteFilter]);

  return (
    <div className="flex-grow flex flex-col space-y-4">
      <Card className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
            <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
            >
                <List className="mr-2 h-4 w-4" />
                List View
            </Button>
            <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                onClick={() => setViewMode('map')}
            >
                <Map className="mr-2 h-4 w-4" />
                Map View
            </Button>
        </div>
        
        <Select value={wasteFilter} onValueChange={setWasteFilter}>
            <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Filter by waste type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Waste Types</SelectItem>
                {wasteTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </Card>
      
      <div className="flex-grow">
        {viewMode === 'list' ? (
          <DumpSiteList onFilterChange={setWasteFilter} currentFilter={wasteFilter} />
        ) : (
          <div className="h-full w-full">
            <DashboardMap view="dumpsites" />
          </div>
        )}
      </div>
    </div>
  );
}
