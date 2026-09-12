import type { ChatMessage } from "@/lib/validation/message.schema";

export interface historyProps {
  hasReachedTop: boolean;
  isFetchingHistory: boolean;
  historyError: string | null;
};


export interface DraftInput {
  text: string;
  createdAt: string;
}

export interface messageSlice {
    // data
    messageError: string | null;
    historyError: string | null;
    messages: Record<string, ChatMessage[]>;
    draftInputs: Record<string, DraftInput>;
    lastSyncedAt: string | null;
    isSyncingMessages: boolean;
    isLoadingMessages: boolean;
    historyStateByConversation: Record<string, historyProps>;

    // methods
    addMessage: (conversationId: string, message: ChatMessage) => void;
    setMessage: (conversationId: string, message: ChatMessage[]) => void;
    sendMessage: (conversationId: string, text: string) => Promise<void>;
    sendFirstMessage: (contactId: string, content?: string) => Promise<void>;
    setDraftInput: (id: string, draft: DraftInput | null) => void;
    fetchOlderMessages: (conversationId: string) => Promise<void>;
    unifiedSyncUtility: (userId: string) => Promise<{
    success: boolean;
    message: string;
  }>
}
