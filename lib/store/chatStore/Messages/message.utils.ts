import type { ChatMessage } from "@/lib/validation/message.schema";

export function mergeAndDedupe(
  existing: ChatMessage[],
  incoming: ChatMessage[],
): ChatMessage[] {
  // initiate a new map
  const map = new Map<string, ChatMessage>();

  const findKey = (msg: ChatMessage) => {
    for (const [key, value] of map.entries()) {
      const msgId = '_id' in msg ? msg._id : null;
      const valueId = '_id' in value ? value._id : null;
      
      if (msgId && valueId === msgId) return key;
      if (value.tempId && value.tempId === msg.tempId) return key;
    }
    return null;
  };

  // merge new and existing
  [...existing, ...incoming].forEach((msg) => {
    // check if alreay in the map
    const matchKey = findKey(msg);

    const bestId = "_id" in msg ? msg._id : msg.tempId;

    if (matchKey) {
      const existingMessage = map.get(matchKey);
      const updated = {
        ...existingMessage,
        ...msg,
      } as ChatMessage;
      if (matchKey !== bestId) {
        map.delete(matchKey);
      }
      map.set(bestId, updated);
    } else {
      // new message
      map.set(bestId, msg);
    }
  });

  // create array from the map
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function hasRedirectTo(data: unknown): data is { redirectTo: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "redirectTo" in data &&
    typeof (data as { redirectTo?: unknown }).redirectTo === "string"
  );
}
