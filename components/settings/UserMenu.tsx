"use client";

import { LogOutIcon, UserIcon, UserCog2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { useChatStore } from "@/lib/store/chatStore/useChatStore";

import { LogoutAlertDialog } from "./LogoutAlertDialog";
import { SettingsDialog } from "./SettingsDialog";
import { ThemeSubMenu } from "./ThemeSubMenu";
import { useState } from "react";

type SettingsSection = "profile" | "account";

type ActiveOverlay =
  | { type: "settings"; section: SettingsSection }
  | {
      type: "logout";
    }
  | null;

function menuAvatar(username?: string | null): string {
  const parts =
    username
      ?.trim()
      .split(/[_\s]+/)
      .filter(Boolean) ?? [];

  if (parts.length === 0) return "Y";

  const selectedParts =
    parts.length === 1 ? parts : [parts[0], parts[parts.length - 1]];

  return selectedParts
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default function UserMenu() {
  const username = useChatStore((state) => state.user?.username) ?? "You";
  const avatar = menuAvatar(username);

  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay>(null);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="rounded-full cursor-pointer"
          >
            {avatar}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                setActiveOverlay({
                  type: "settings",
                  section: "account",
                });
              }}
            >
              <UserCog2Icon />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                setActiveOverlay({
                  type: "settings",
                  section: "profile",
                });
              }}
            >
              <UserIcon />
              Profile
            </DropdownMenuItem>

            <ThemeSubMenu />

            <DropdownMenuSeparator className="bg-primary/40" />
            <DropdownMenuItem
              className="text-red-700 cursor-pointer "
              onSelect={() =>
                setActiveOverlay({
                  type: "logout",
                })
              }
            >
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeOverlay?.type === "logout" && (
        <LogoutAlertDialog
          open
          onOpenChange={(open) => {
            if (!open) setActiveOverlay(null);
          }}
        />
      )}

      {activeOverlay?.type === "settings" && (
        <SettingsDialog
          open
          section={activeOverlay.section}
          onOpenChange={(open) => {
            if (!open) setActiveOverlay(null);
          }}
        />
      )}
      {/* <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} /> */}
    </>
  );
}
