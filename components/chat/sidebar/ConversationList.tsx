"use client";
// import { useChatStore, ChatStore } from "@/lib/useChatStore";
// import { boolean } from "zod";
// import { useShallow } from "zustand/shallow";
import { useParams } from "next/navigation";
import ConversationItem from "./ConversationItem";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

// FUTURE ADD FRIENDS:
// Render the AddFriendsPanel from ./AddFriendsPanel here, above the conversation
// list. This should be visible for both old users and new users so everyone has
// a stable place to search/add contacts and start a new conversation.

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
// const avatar = (username: string = "Unknown"): string => {
//   if (!username) return "??";

//   return username
//     .split(/\s+/) // Splits by any amount of whitespace
//     .filter(boolean) // Removes empty strings
//     .map((word) => word[0].toUpperCase())
//     .join("")
//     .slice(0, 2);
// };

// const selectConversationPreviews = (
//   state: ChatStore,
//   activeConversationId?: string,
// ) => {
//   const currentUser = state.user?.uid;

//   return state.conversations
//     .map((conv) => {
//       const contact = conv.participants.find((p) => p.uid !== currentUser);

//       // if undefined
//       const displayName = contact?.username ?? "Unknown user";

//       // lastMessage
//       const lastMsg = conv.lastMessage;
//       const isSentByMe = lastMsg?.senderId === currentUser;
//       return {
//         id: conv._id.toString(),
//         avatar: avatar(displayName),
//         contactName: displayName,
//         content: lastMsg?.content ?? "No new messages",
//         createdAt: lastMsg?.createdAt ?? conv.createdAt.toString(), // for sorting the list
//         status: isSentByMe ? (lastMsg?.status ?? "sent") : null,
//         unreadCount: 0,
//         isOnline: false,
//         isTyping: false,
//         isActive: conv._id.toString() === activeConversationId,
//       };
//     })
//     .sort(
//       (a, b) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//     );
// };

export default function ConversationList() {
  const params = useParams<{ conversationId?: string }>();
  // it is a naviagation hook subscribed to the App router state
  const activeConversationId = params.conversationId;
  // const chatlist = useChatStore(
  //   useShallow((state) =>
  //     selectConversationPreviews(state, activeConversationId),
  //   ),
  // );

  const chatlist: ConversationPreview[] = [
    {
      id: "fake-conversation-1",
      avatar: "AS",
      contactName: "Aarav Sharma",
      content: "Can you send the notes from yesterday?",
      createdAt: "2026-06-18T10:52:00.000Z",
      status: "read",
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isActive: activeConversationId === "fake-conversation-1",
    },
    {
      id: "fake-conversation-2",
      avatar: "MR",
      contactName: "Maya Rao",
      content: "Typing a longer message so we can test truncation nicely.",
      createdAt: "2026-06-18T10:18:00.000Z",
      status: "pending",
      unreadCount: 3,
      isOnline: false,
      isTyping: true,
      isActive: activeConversationId === "fake-conversation-2",
    },
    {
      id: "fake-conversation-3",
      avatar: "NK",
      contactName: "Nikhil Kapoor",
      content: "Perfect, see you at 6.",
      createdAt: "2026-06-18T08:00:00.000Z",
      status: "delivered",
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isActive: activeConversationId === "fake-conversation-3",
    },
    {
      id: "fake-conversation-4",
      avatar: "NK",
      contactName: "Nikhil Kapoor",
      content: "Perfect, see you at 6.",
      createdAt: "2026-06-18T08:00:00.000Z",
      status: "delivered",
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isActive: activeConversationId === "fake-conversation-4",
    },
    {
      id: "fake-conversation-5",
      avatar: "NK",
      contactName: "Nikhil Kapoor",
      content: "Perfect, see you at 6.",
      createdAt: "2026-06-18T08:00:00.000Z",
      status: "delivered",
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isActive: activeConversationId === "fake-conversation-5",
    },
  ];

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background text-foreground">
      <div className="w-full border-b">
        <h1 className="w-full px-4 pt-4 pb-2 text-2xl font-medium text-left ">
          Chats...
        </h1>
        <div className="px-4 py-2">
          <InputGroup className="w-full">
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className="w-full flex flex-col items-center scrollbar-thin overflow-auto scroll-smooth ">
        {chatlist.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </div>

      {/* FUTURE ADD FRIENDS ENTRY:
          Place <AddFriendsPanel /> here before mapping conversations.
          Old users: this acts as the always-available "add/start chat" control.
          New users: this is still visible even when chatlist is empty. */}

      {/* FUTURE EMPTY STATE:
          When chatlist.length === 0, render a small empty-state message below
          AddFriendsPanel instead of only showing a blank sidebar. */}
    </div>
  );
}

// i may need to create a contact list like a phone book.
// it will keep the history, overall manage the contacts.
