
"use client";

import {
  useState,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import AddContactDialog from "./chatSidebar/AddContactDialog";
import DeleteConversationDialog from "./chatSidebar/DeleteConversationDialog";
import DeleteContactDialog from "./chatSidebar/DeleteContactDialog";

type ChatUiContextValue = {
  openAddContact: () => void;
  closeAddContact: () => void;
  openDeleteConversation: (conversationId: string) => void;
  closeDeleteConversation: () => void;
  openDeleteContact: (contactId: string) => void;
  closeDeleteContact: () => void;
};

const ChatUiContext = createContext<ChatUiContextValue | null>(null);

export default function ChatUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // controlled state for AddContactDialog
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const openAddContact = useCallback(() => {
    setAddContactOpen(true);
  }, []);

  const closeAddContact = useCallback(() => {
    setAddContactOpen(false);
  }, []);

  const openDeleteConversation = useCallback((conversationId: string) => {
    setDeleteConversationId(conversationId);
  }, []);

  const closeDeleteConversation = useCallback(() => {
    setDeleteConversationId(null);
  }, []);

  const openDeleteContact = useCallback((contactId: string) => {
    setDeleteContactId(contactId);
  }, []);

  const closeDeleteContact = useCallback(() => {
    setDeleteContactId(null);
  }, []);

  const value = useMemo(
    () => ({
      openAddContact,
      closeAddContact,
      openDeleteConversation,
      closeDeleteConversation,
      openDeleteContact,
      closeDeleteContact,
    }),
    [
      closeAddContact, 
      openAddContact, 
      openDeleteConversation, 
      closeDeleteConversation,
      openDeleteContact,
      closeDeleteContact
    ],
  );

  return (
    <ChatUiContext.Provider value={value}>
      {children}
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
      />
      <DeleteConversationDialog conversationId={deleteConversationId} />
      <DeleteContactDialog contactId={deleteContactId} />
    </ChatUiContext.Provider>
  );
}

export function useChatUi() {
  const context = useContext(ChatUiContext);
  if (!context)
    throw new Error("useChatUi must be used inside ChatUiProvider.");
  return context;
}
