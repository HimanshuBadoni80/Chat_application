import { useChatStore } from "@/lib/store/chatStore/store";
import { useEffect } from "react";

export function useFreshData() {
  const userId = useChatStore((s) => s.user?._id);
  const fetchConversations = useChatStore((s) => s.fetchConversations);
  const fetchContacts = useChatStore((s) => s.fetchContacts);

  useEffect(() => {
    if (!userId) return;

    // Refetch on Focus
    function handleVisibilityChange() {
      if (!document.hidden) {
        void fetchContacts();
        void fetchConversations();
      }
    }

    // force fetch on reconnection
    function handleOnline() {
      void fetchContacts({ force: true });
      void fetchConversations({ force: true });
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [userId, fetchContacts, fetchConversations]);
}
