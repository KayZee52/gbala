import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { MainNav } from '@/components/main-nav';
import { UserNav } from '@/components/user-nav';
import { Globe } from 'lucide-react';
import { Button } from './ui/button';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex items-center gap-3 p-3">
             <Button variant="outline" size="icon" className="h-10 w-10 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 hover:text-primary">
                <Globe className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold font-headline">Gbala</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-2 border-b md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-bold font-headline">Gbala</h1>
        </div>
        {children}
      </SidebarInset>
    </>
  );
}
