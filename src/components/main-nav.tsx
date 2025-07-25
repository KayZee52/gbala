"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, LayoutGrid, Recycle, Trash2 } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutGrid, tooltip: 'Dashboard' },
  { href: '/report-waste', label: 'Report Waste', icon: Trash2, tooltip: 'Report Waste' },
  { href: '/dump-sites', label: 'Dump Sites', icon: Recycle, tooltip: 'Dump Sites' },
  { href: '/ai-analysis', label: 'AI Analysis', icon: Bot, tooltip: 'AI Analysis' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              className="justify-start"
              isActive={pathname === link.href}
              tooltip={link.tooltip}
            >
              <Link href={link.href}>
                <link.icon className="w-4 h-4 mr-3" />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
