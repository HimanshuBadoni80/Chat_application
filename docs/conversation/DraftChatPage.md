## Draft Chat Page — `/chat/new/[contactId]`

**purpose**
Allows the user to send a first message to a contact they have no existing conversation with.
This page is shown when `resolve-contact` returns `kind: "draft"`.

**route**
`/chat/new/[contactId]` — `contactId` is the contact document `_id`.

**page load**
1. Look up the contact from `contactUiData` using `contactId`.
2. If contact not found or contact is deleted → show error state, do not render input.

**UI**
Same layout as `ChatWindow`:
- Header: shows contact nickname + username
- Message stream: empty (no history)
- Message input: enabled, same component as existing `MessageInput`

**send behaviour (Optimistic & Zustand Architecture)**
1. User types a message and hits send.
2. The UI calls a global Zustand action `sendFirstMessage(contactId, content)`.
3. The UI disables the `MessageInput` (preventing rapid-fire race conditions).
4. `sendFirstMessage` logic:
   - Generate a `tempId` (UUID) if new, or reuse if retrying.
   - Create an optimistic message with `status: "pending"`.
   - Save it to the global store under a pseudo-key: `messages["draft:<contactId>"]`.
   - Call `/api/messages/send` with `kind: "new"`.
5. On API success:
   - If the `draft` key still exists (meaning no WebSocket collision happened), move the message to `messages[conversation._id]` and delete the `draft` key.
   - If the `draft` key is missing (WebSocket beat the API), just update the message status to `"sent"` inside `messages[conversation._id]`.
   - Call `upsertConversation`.
   - UI detects `contactLookup` change and auto-redirects to `/chat/[conversation._id]`.
6. On API error:
   - Update the optimistic message `status: "failed"`.
   - The user can use the "Retry" button.

**retry UI**
- A failed message renders in the stream with a red "!" icon.
- A "Retry" button appears next to it.
- Clicking Retry re-calls `sendFirstMessage(contactId)` without `content`. The action pulls the existing text from `messages["draft:<contactId>"]` and retries the API call.

**edge cases (WebSocket Collisions)**
If the user is on `/chat/new/[contactId]` and the receiver sends a message first (triggering WS `NEW_CONVERSATION_MESSAGE`):
- **Subcase 1 (Empty Input):** Safe to route. `contactLookup` updates, triggering redirect to `/chat/[conversation._id]`.
- **Subcase 2 (Mid-typing):** Input is stored in Zustand (`draftInputs[contactId]`). When WS fires, the store copies the text to `draftInputs[conversationId]`. The redirect happens, and the new page flawlessly loads the typed text.
- **Subcase 3 (API in flight):** WS creates the conversation. The WS handler proactively looks for `messages["draft:<contactId>"]` and instantly moves the pending message into `messages[conversation._id]`. The redirect happens, and the UI shows both messages immediately. The API response finishes a second later and marks the pending message as `"sent"`.


