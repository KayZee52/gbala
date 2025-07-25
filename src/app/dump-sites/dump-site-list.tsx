"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDumpSites, wasteTypes } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { MapPin, Recycle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DumpSiteList({ onFilterChange, currentFilter }: { onFilterChange: (filter: string) => void, currentFilter: string }) {

  const filteredSites = mockDumpSites.filter(site => 
    currentFilter === 'all' || site.acceptedWaste.includes(currentFilter)
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSites.map(site => (
          <Card key={site.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="w-5 h-5 text-primary"/>
                {site.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 pt-2">
                <MapPin className="w-4 h-4" /> {site.address}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Phone className="w-4 h-4" /> 
                <a href={`tel:${site.phone}`} className="hover:underline">{site.phone}</a>
              </div>
              <div className="space-y-2 mb-4">
                <h4 className="font-semibold">Accepts:</h4>
                <div className="flex flex-wrap gap-2">
                  {site.acceptedWaste.map(type => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
               <Button variant="outline" className="w-full" asChild>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${site.location.lat},${site.location.lng}`} target="_blank" rel="noopener noreferrer">
                    Get Directions
                  </a>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredSites.length === 0 && (
         <div className="text-center py-16 text-muted-foreground">
            <p>No dump sites found for the selected filter.</p>
         </div>
      )}
    </div>
  );
}
