"use client";

import { Palette } from "lucide-react";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

export function ThemeSubMenu() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Palette />
        Theme
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem 
          className={`cursor-pointer ${theme === 'light' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setTheme("light")}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`cursor-pointer ${theme === 'dark' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setTheme("dark")}
        >
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`cursor-pointer ${theme === 'system' ? 'bg-accent text-accent-foreground' : ''}`}
          onClick={() => setTheme("system")}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
