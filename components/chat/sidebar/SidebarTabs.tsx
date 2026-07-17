import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmptyChatCard from "./EmptyStateCards/EmptyChatCard";
import { useState } from "react";
import EmptyContactCard from "./EmptyStateCards/EmptyContactCard";
import type { ConversationPreview } from "./ChatSideBar";
import ConversationItem from "./ConversationItem";
import { ContactPreview } from "@/lib/store/chatStore/contact/contact.types";

type SidebarTab = "chats" | "contacts";

type SidebarTabsProps = {
  value: SidebarTab;
  onValueChange: (value: SidebarTab) => void;
  conversationList: ConversationPreview[];
  isLoadingConversations: boolean;
  contactList: ContactPreview[];
  isLoadingContacts: boolean;
  onAddContact: () => void;
  //   onBrowseContacts: () => void;
  //   onSelectContact: (contact: ContactPreview) => void;
};

export default function SidebarTabs({
  value,
  onValueChange,
  conversationList,
  contactList,
  isLoadingConversations,
  isLoadingContacts,
  onAddContact,
  //   onBrowseContacts,
  //   onSelectContact,
}: SidebarTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(nextValue) => onValueChange(nextValue as SidebarTab)}
    >
      <TabsList variant="line">
        <TabsTrigger value="chats">Chats</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
      </TabsList>
      <TabsContent value="chats">
        <div className="w-full flex flex-col items-center scrollbar-thin overflow-auto scroll-smooth ">
          {!isLoadingConversations && conversationList.length === 0 ? (
            <EmptyChatCard onGoToContact={onValueChange} />
          ) : (
            conversationList.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
              />
            ))
          )}
        </div>
      </TabsContent>
      <TabsContent value="contacts">
        contact items, or “No contacts yet” state
        <EmptyContactCard onAddContact={onAddContact} />
      </TabsContent>
    </Tabs>
  );
}
