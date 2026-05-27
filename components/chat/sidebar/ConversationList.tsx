"use client";
import { useChatStore, ChatStore } from "@/lib/useChatStore";
import { boolean } from "zod";
import { useShallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import ConversationItem from "./ConversationItem";

export interface ConversationPreview {
  id: string; // Always include the ID for React keys!
  avatar: string;
  contactName: string;
  content: string;
  createdAt: string;
  status: "sent" | "delivered" | "read" | "pending" | null;
  unreadCount: number;
  isOnline: boolean;
  isTyping: boolean;
  isActive: boolean;
}

// avatar logic
const avatar = (username: string = "Unknown"): string => {
  if (!username) return "??";

  return username
    .split(/\s+/) // Splits by any amount of whitespace
    .filter(boolean) // Removes empty strings
    .map((word) => word[0].toUpperCase())
    .join("")
    .slice(0, 2);
};

const selectConversationPreviews = (
  state: ChatStore,
  activeConversationId?: string,
) => {
  const currentUser = state.user?.uid;

  return state.conversations
    .map((conv) => {
      const contact = conv.participants.find((p) => p.uid !== currentUser);

      // if undefined
      const displayName = contact?.username ?? "Unknown user";

      // lastMessage
      const lastMsg = conv.lastMessage;
      const isSentByMe = lastMsg?.senderId === currentUser;
      return {
        id: conv._id.toString(),
        avatar: avatar(displayName),
        contactName: displayName,
        content: lastMsg?.content ?? "No new messages",
        createdAt: lastMsg?.createdAt ?? conv.createdAt.toString(), // for sorting the list
        status: isSentByMe ? (lastMsg?.status ?? "sent") : null,
        unreadCount: 0,
        isOnline: false,
        isTyping: false,
        isActive: conv._id.toString() === activeConversationId,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

export default function ConversationList() {
  const params = useParams<{ conversationId?: string }>();
  // it is a naviagation hook subscribed to the App router state
  const activeConversationId = params.conversationId;
  const chatlist = useChatStore(
    useShallow((state) =>
      selectConversationPreviews(state, activeConversationId),
    ),
  );

  return (
    <div className="w-full ">
      {chatlist.map((conversation) => (
        <ConversationItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

// i may need to create a contact list like a phone book.
// it will keep the history, overall manage the contacts.
