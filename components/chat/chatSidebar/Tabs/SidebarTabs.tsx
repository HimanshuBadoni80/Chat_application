// to be edited
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationList from "./chats/conversationList";
import { ContactItemList } from "./contacts/contactItemList";
import { useState } from "react";

type SidebarTab = "chats" | "contacts";

export default function SidebarTabs() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("chats");
  return (
    <Tabs
      value={activeTab}
      onValueChange={(nextValue) => setActiveTab(nextValue as SidebarTab)}
      className="flex flex-col h-full flex-1 overflow-hidden"
    >
      <TabsList variant="line" className="shrink-0">
        <TabsTrigger className="cursor-pointer" value="chats">
          Chats
        </TabsTrigger>
        <TabsTrigger className="cursor-pointer" value="contacts">
          Contacts
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chats" className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-0">
        <ConversationList onGoToContact={setActiveTab} />
      </TabsContent>
      <TabsContent value="contacts" className="flex-1 overflow-hidden data-[state=active]:flex flex-col mt-0">
        <ContactItemList/>
      </TabsContent>
    </Tabs>
  );
}
