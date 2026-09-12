**it utilizes the same component as the desktop layout, just a different wrapper**

*structure*
1. ChatSideBarPanel is the default screen (full width, no resizable panels).
2. When a conversation or contact item is tapped, navigate to `/chat/[id]` or `/chat/new/[contactId]` — the chat window renders full-screen, replacing the sidebar.
3. ChatWindow header shows a back button (left arrow) that navigates to `/chat`, returning to the sidebar.
4. Context menus are triggered by long-press instead of right-click.
5. Rest of the behaviour stays the same as Desktop.

*implementation*
- No Sheet needed. Use route-based full-page navigation.
- `/chat` (no conversationId) → show `ChatSideBarPanel` full-screen.
- `/chat/[conversationId]` → show `ChatWindow` full-screen, hide sidebar.
- The `ResponsiveChatLayout` conditionally renders based on `useIsMobile()`:
  - Desktop: resizable side-by-side panels (current behavior)
  - Mobile: only `children` when a conversation is active, only sidebar when on `/chat`