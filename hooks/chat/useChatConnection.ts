import { useChatStore } from "@/lib/useChatStore";
import toast from "react-hot-toast";
import { useEffect } from "react";

// it is a custom react hook,
// A custom hook is just a function that starts with the word "use". This tells React: "Hey, I’m going to use your internal tools (like useState or useEffect) inside this function."

export function useChatConnection() {
  const { user, connect, disconnect, unifiedSyncUtility } = useChatStore();
  const userId = user?._id;

  // if there is a user, we should have a connection
  // if no user, logout , kills the connection

  useEffect(() => {
    if (userId) {
      connect(userId);
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Environment Listeners (Zombie Tabs & Network)
  /* issue? Modern browsers (especially Chrome and Safari) aggressively throttle or "freeze" JavaScript execution in background tabs to save battery.
  The Problem: When a user switches back to chat tab after an hour, the socket might be dead, or worse, it might "burst" 50 missed messages at once, crashing the UI.
   */
  useEffect(() => {
    if (!userId) return;

    // toasthandler
    const runSyncWithToast = async (reason: string) => {
      // trigger the loading toast
      const toastId = toast.loading(`Reconnecting... ${reason} `);

      const result = await unifiedSyncUtility(userId);

      if (result.success) {
        toast.success(result.message, { id: toastId });
      } else {
        toast.error(result.message, { id: toastId });
      }
    };

    async function handleOffline() {
      toast.error("You are offline. Waiting for network...", {
        duration: 4000,
      });
    }

    async function handleOnline() {
      await runSyncWithToast("Network restored");
    }

    async function handleVisibilityChange() {
      if (document.hidden) {
        // set departure time in session storage
        sessionStorage.setItem("away_since", Date.now().toString());
      } else {
        const awaySince = sessionStorage.getItem("away_since");
        if (awaySince) {
          const isGreater = Date.now() - new Date(awaySince).getTime() > 30000;
          if (isGreater) {
            await runSyncWithToast("Welcome back");
          }
          sessionStorage.removeItem("away_since");
        }
      }
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userId,unifiedSyncUtility]);
}
