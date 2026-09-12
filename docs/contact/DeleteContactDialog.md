## DeleteContactDialog

**trigger**
Opened by the contact context menu's "Delete contact" action.

**state needed**
`contactId` of the contact to delete.
Passed via `ChatUiProvider` — the context menu calls `openDeleteContact(contactId)`.

**dialog content**
- Title: "Delete contact?"
- Body: "This contact will be removed from your list. Your conversation history will not be affected."
- Actions: "Cancel" (secondary) | "Delete" (destructive)

**on confirm**
1. Call `DELETE /api/contacts/[contactId]` _(does not exist yet — needs to be created)_
2. On success:
   - Call `removeContactLocally(contactId)` (already exists in contactSlice)
   - Close dialog
   - `toast.success("Contact deleted")`
3. On error:
   - `hasSessionExpired` check
   - `toast.error(extractErrorMessage(...))`
   - Keep dialog open

**backend behaviour (to be built)**
Hard-delete the contact document. No soft-delete needed — contacts are user-owned and have no shared state.
