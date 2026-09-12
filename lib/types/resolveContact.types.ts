import type { ChatConversation } from "@/lib/validation/conversation.schema";

export type contactToBeResolved =
  | {
      kind: "existing";
      conversation: ChatConversation;
    }
  | {
      kind: "draft";
    };
