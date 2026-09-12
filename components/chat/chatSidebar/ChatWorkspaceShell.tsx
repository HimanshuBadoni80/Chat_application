"use client";

import ChatUiProvider from "../chatUiProvider";
import ResponsiveChatLayout from "@/components/screenLayouts/responsiveChatLayout";
export default function ChatWorkspaceShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatUiProvider>
      <ResponsiveChatLayout>{children}</ResponsiveChatLayout>
    </ChatUiProvider>
  );
}
