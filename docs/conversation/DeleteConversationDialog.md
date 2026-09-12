## DeleteConversationDialog

**trigger**
Opened by the conversation context menu's "Delete" action.

**state needed**
`conversationId` of the conversation to delete.
Passed via `ChatUiProvider` — the context menu calls `openDeleteConversation(conversationId)`.

**dialog content**
- Title: "Delete conversation?"
- Body: "This conversation will be removed from your chat list. The other person can still see it."
- Actions: "Cancel" (secondary) | "Delete" (destructive)

**on confirm**
1. Call `DELETE /api/conversations/[conversationId]` _(does not exist yet — needs to be created)_
2. On success:
   - Remove conversation from `conversations` array locally
   - Rebuild `conversationLookup` → cascades into `setContactUi()`
   - If the deleted conversation is currently active (`pathname === /chat/[deletedId]`), navigate to `/chat`
   - Close dialog
   - `toast.success("Conversation deleted")`
3. On error:
   - `hasSessionExpired` check
   - `toast.error(extractErrorMessage(...))`
   - Keep dialog open

**backend behaviour (to be built)**
The API route should not hard-delete the document. It should add the user's ID to the conversation's `hiddenFor` array.
If both participants are in `hiddenFor`, the conversation can be hard-deleted (or left for a cleanup job).
