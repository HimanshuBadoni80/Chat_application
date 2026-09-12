import { reducedIConversation } from "../Models";
import { toMessageDTO } from "./toMessageDTO";
import type { ConversationDTO } from "../validation/conversation.schema";

function getClearedAt(
  clearedAt: Map<string, Date> | Record<string, Date> | undefined,
  userId: string,
) {
  if (!clearedAt) return undefined;

  return clearedAt instanceof Map ? clearedAt.get(userId) : clearedAt[userId];
}

export function toConversationDTO(
  conv: reducedIConversation,
  userId: string,
): ConversationDTO {
  const clearedAt = getClearedAt(conv.clearedAt, userId);
  const lastMessage = conv.lastMessage
    ? clearedAt && conv.lastMessage.createdAt <= clearedAt
      ? null
      : toMessageDTO(conv.lastMessage)
    : null;

  return {
    _id: conv._id.toString(),
    createdAt: conv.createdAt.toISOString(),
    participants: conv.participants.map((p) => ({
      _id: p._id.toString(),
      user: !p.isDeleted
        ? {
            uid: p.uid,
            username: p.username,
          }
        : null,
    })),
    lastMessage,
  };
}
