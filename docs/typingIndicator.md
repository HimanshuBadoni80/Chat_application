# Implementation Guide: Typing Indicator (Hybrid Architecture)

This guide covers the complete implementation of the high-performance Typing Indicator feature. It utilizes a **Hybrid Throttle + Debounce** strategy on the sender side, and a **Fallback Timeout** strategy on the receiver side to guarantee zero "zombie" typing indicators while keeping React renders strictly isolated via Zustand selectors.

---

## 1. Fix the Hook (`hooks/useTypingEmitter.ts`)
The hybrid emitter logic is flawless, but there is one bug in the `onKeyStroke` function where it mistakenly sends a `"stop"` status instead of `"start"`.

**Change:**
```typescript
  const onKeyStroke = useCallback(() => {
    if (
      !isTypingRef.current ||
      Date.now() - lastEmitRef.current > TYPING_THROTTLE_MS
    ) {
      ws.send(
        JSON.stringify({
          type: "TYPING_INDICATOR",
          receiverId,
          conversationId,
          // CHANGE: This was previously "stop"
          typingStatus: "start", 
        }),
      );
      // ...
```

---

## 2. Update the Store Types (`lib/store/chatStore/Socket/socket.types.ts`)
Add the `typingStatuses` (for React rendering) and `typingTimers` (for background timeout tracking) to the interface.

**Change:**
```typescript
export interface socketSlice {
  // ... existing fields ...
  typingStatuses: Record<string, boolean>;
  typingTimers: Record<string, NodeJS.Timeout>;
  // ... existing methods ...
}
```

---

## 3. Implement Receiver Logic (`lib/store/chatStore/Socket/socketSlice.ts`)
Set the initial states and handle the incoming WebSocket packets with the fallback timer logic.

**Change 1 - Initial State:**
```typescript
  socket: null,
  status: "idle",
  typingStatuses: {},
  typingTimers: {},
  // ...
```

**Change 2 - The Switch Case:**
```typescript
        case "TYPING_INDICATOR": {
          // Note: The payload validation schema in message.schema.ts might need updating 
          // to accept "typingStatus" ("start" | "stop") if it doesn't already!
          const { conversationId, typingStatus } = validation.data.payload;

          // 1. Clear existing timer if it exists
          const existingTimer = get().typingTimers[conversationId];
          if (existingTimer) clearTimeout(existingTimer);

          if (typingStatus === "start") {
            // 2. Add to the active Set (Triggers React re-render)
            set((state) => ({
              typingStatuses: { ...state.typingStatuses, [conversationId]: true },
            }));

            // 3. Set the new 5-second fallback timer
            const newTimer = setTimeout(() => {
              set((state) => ({
                typingStatuses: { ...state.typingStatuses, [conversationId]: false },
              }));
            }, 5000);

            // 4. Save the timer in the background map
            get().typingTimers[conversationId] = newTimer;

          } else if (typingStatus === "stop") {
            // 5. Explicit stop received -> Remove from Set immediately
            set((state) => ({
              typingStatuses: { ...state.typingStatuses, [conversationId]: false },
            }));
          }
          break;
        }
```

---

## 4. Connect the Sender UI (`components/chat/window/MessageInput.tsx`)
The `MessageInput` needs the hook to fire on keystrokes. It also needs the `receiverId` passed down as a prop so the WebSocket server knows who to route the packet to.

**Changes:**
1. Add `receiverId` to the props interface.
2. Grab the socket from Zustand and initialize the hook.
3. Attach `onKeyStroke` to the input element.

```tsx
import { useTypingEmitter } from "@/hooks/useTypingEmitter";

export default function MessageInput({
  id,
  receiverId, // NEW PROP
  isDraft = false,
  disabled = false,
}: {
  id: string;
  receiverId: string; // NEW PROP
  isDraft?: boolean;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const socket = useChatStore((state) => state.socket);

  // Initialize the hook!
  const { onKeyStroke } = useTypingEmitter(id, receiverId, socket!);

  // ... existing useEffects ...

  return (
    // ...
        <input
          ref={inputRef}
          type="text"
          onInput={onKeyStroke} // ATTACH THE EVENT HERE!
          placeholder="Type a message..."
          disabled={disabled}
          className="..."
        />
    // ...
  )
}
```

---

## 5. Pass the `receiverId` Prop
Because we added `receiverId` to `MessageInput`, you must update where it is imported.

**In `components/chat/window/ChatWindow.tsx`:**
```tsx
      ) : (
        <MessageInput 
           id={conversationId} 
           receiverId={contactData.targetUserId} 
        />
      )}
```

**In `components/chat/window/DraftChatWindow.tsx`:**
```tsx
      ) : (
        <MessageInput 
           id={contactId} 
           receiverId={contactData.targetUserId} 
           isDraft={true} 
           disabled={false} 
        />
      )}
```

---

## 6. Update the Sidebar UI (`components/chat/chatSidebar/Tabs/chats/ConversationItem.tsx`)
Read the status from Zustand. Zustand guarantees only this specific item re-renders.

**Changes:**
```tsx
  // Add this to the top of the component:
  const isTyping = useChatStore((state) => state.typingStatuses[conversation.id]);

  // Update the rendering block:
  <span className="text-sm text-muted-foreground truncate w-full text-left">
    {isTyping ? (
      <span className="text-primary font-medium italic">Typing...</span>
    ) : conversation.isDraft ? (
      <span className="text-primary font-medium mr-1">Draft:</span>
    ) : null}

    {!isTyping && (conversation.content || <span className="italic">No messages yet</span>)}
  </span>
```

---

## 7. Update the Header UI (`ChatWindow.tsx` & `DraftChatWindow.tsx`)
Show the typing status inside the chat window so the user doesn't have to look at the sidebar!

**Changes:**
```tsx
  // Add this to the top of ChatWindow.tsx:
  const isTyping = useChatStore((state) => state.typingStatuses[conversationId]);
  
  // (Or in DraftChatWindow.tsx, use `draft:${contactId}` or `contactId` depending on how your WS emits it)

  // Update the header block:
  <div className="flex flex-col flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold truncate">{contactData.contactName}</h2>
      {contactData.isDeleted && (
        <Badge variant="secondary" className="shrink-0 text-xs">Deleted account</Badge>
      )}
    </div>
    
    {/* NEW TYPING LOGIC HERE */}
    {isTyping ? (
      <p className="text-sm text-primary font-medium italic">Typing...</p>
    ) : contactData.uid ? (
      <p className="text-sm text-muted-foreground truncate">{contactData.uid}</p>
    ) : null}
    
  </div>
```

---

## 8. Update the Validation Schema (`lib/validation/message.schema.ts`)
The `SocketMessageSchema` currently expects an `isTyping: boolean`, but our hook and WebSocket server will be sending and receiving a `typingStatus: "start" | "stop"` string!

**Change:**
Find the `TYPING_INDICATOR` object inside `SocketMessageSchema` and update it:
```typescript
  z.object({
    type: z.literal("TYPING_INDICATOR"),
    conversationId: z.string(),
    typingStatus: z.enum(["start", "stop"]),
  }),
```

---

## 9. Important Correction to `socketSlice.ts` Guide
Since the hook sends `conversationId` and `typingStatus` at the root level of the JSON (there is no `payload` wrapper), the switch case in `socketSlice.ts` should extract them directly from `validation.data`, not `validation.data.payload`!

**Correction for Step 3:**
```typescript
        case "TYPING_INDICATOR": {
          // Extract directly from validation.data, NOT payload!
          const { conversationId, typingStatus } = validation.data;

          const existingTimer = get().typingTimers[conversationId];
          if (existingTimer) clearTimeout(existingTimer);
          // ... rest of logic remains identical ...
```
