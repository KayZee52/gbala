"use client";

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, HardHat, ChevronsUpDown } from 'lucide-react';

const roles = [
    { id: 'citizen', label: 'Citizen', icon: User },
    { id: 'volunteer', label: 'Volunteer', icon: HardHat },
    { id: 'recycler', label: 'Recycler', icon: Shield },
    { id: 'admin', label: 'Admin', icon: Shield },
];

export function UserNav() {
  const [role, setRole] = useState('citizen');
  const CurrentRoleIcon = roles.find(r => r.id === role)?.icon || User;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between h-12">
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="text-left">
                    <p className="text-sm font-medium">Demo User</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Demo User</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
            <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
            {roles.map(r => (
                <DropdownMenuRadioItem key={r.id} value={r.id} className="capitalize flex items-center gap-2">
                    <r.icon className="w-4 h-4 text-muted-foreground" />
                    <span>{r.label}</span>
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
