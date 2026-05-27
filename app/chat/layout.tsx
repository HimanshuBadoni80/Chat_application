import GetSession from "@/lib/getSession";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import StoreInitializer from "@/components/StoreInitializer";
import type { updatedClientSession } from "@/lib/types/Conversation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ConversationList from "@/components/chat/sidebar/ConversationList";
import ChatConnectionManager from "@/components/chat/ChatConnectionManager";
import { Toaster } from "react-hot-toast";
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session: updatedClientSession = await GetSession();

  if (!session) {
    const headerList = await headers();
    const currentRoute = headerList.get("x-url") || "/chat"; // header from proxy.ts
    redirect(`/login?from=${encodeURIComponent(currentRoute)}&reason=expired`);
  }

  // check for new user without the username( null value). return a different component asking to set username.
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <StoreInitializer user={session?.user} />
      <ChatConnectionManager />
      <div className="w-14  border-r-4">sbar</div>
      <ResizablePanelGroup orientation="horizontal">
        {/* chat-list  */}
        <ResizablePanel defaultSize="50%" className="flex-1 h-full">
          <ConversationList />
        </ResizablePanel>
        <ResizableHandle className="w-1" disableDoubleClick />
        {/* chat-window */}
        <ResizablePanel
          defaultSize="50%"
          className="flex-1 h-full"
          maxSize="75%"
          minSize="50%"
        >
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          removeDelay: 1000,
          style: {
            background: "#363636",
            color: "#fff",
          },

          // Default options for specific types
          success: {
            duration: 3000,
            iconTheme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      />
    </div>
  );
}
