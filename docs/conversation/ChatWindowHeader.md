## ChatWindow Header

**displays**
1. **Name** — same priority as conversationItem:
   - Nickname (if saved as contact, via `contactLookup`)
   - Username (if not a contact, user exists)
   - Nickname (if contact exists but user is deleted)
   - "Deleted user" (not a contact, user is deleted)
   - "Unknown user" (fallback)
2. **uid** — the other user's shareable ID, shown as secondary text

**deleted user state**
If the other participant's `user === null`:
- Show name with a "Deleted account" badge
- Disable `MessageInput` (hide or grey out with tooltip "This user's account has been deleted")

**mobile-specific**
- Show a back button (left arrow) on the left side of the header
- Back button navigates to `/chat` (returns to sidebar view on mobile)

**desktop-specific**
- No back button needed (sidebar is always visible)
