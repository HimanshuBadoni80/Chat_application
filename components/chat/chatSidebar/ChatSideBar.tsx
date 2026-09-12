"use client";

import { Search, Plus } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import UserMenu from "@/components/settings/UserMenu";
import { Button } from "@/components/ui/button";
import SidebarTabs from "./Tabs/SidebarTabs";
import { useChatUi } from "../chatUiProvider";

export default function ChatSideBarPanel() {
  const { openAddContact } = useChatUi();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="w-full border-b">
        <div className="flex items-center justify-between">
          <h1 className="w-full px-4 pt-4 pb-2 text-2xl font-medium text-left ">
            Chats...
          </h1>
          <div className=" flex gap-2 px-4">
            <Button
              variant="outline"
              className="flex items-center justify-center gap-0.5 pl-[12] pr-[20] bg-primary hover:bg-muted hover:text-muted-foreground cursor-pointer"
              onClick={openAddContact}
              aria-label="Start a new chat"
            >
              <Plus />
              Add Contact
            </Button>
            <UserMenu />
          </div>
        </div>
        <div className="px-4 py-2">
          <InputGroup className="w-full">
            <InputGroupInput placeholder="Search...     (the feature is coming soon)" />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <SidebarTabs />
    </div>
  );
}

/* 
update- not need this anymore⬇️

it needs onaddContact prop

type ChatSidebarContentProps = {
  onAddContact: () => void;
  onItemNavigate?: () => void;
};

*/
