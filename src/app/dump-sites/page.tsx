import { Suspense } from 'react';
import DumpSiteView from './dump-site-view';

function DumpSites() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 h-full flex flex-col">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">Dump Site Locator</h2>
        <p className="text-muted-foreground">
          Find legal dump sites and recycling centers near you.
        </p>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <DumpSiteView />
      </Suspense>
    </div>
  );
}

export default function DumpSitesPage() {
  return <DumpSites />;
}
