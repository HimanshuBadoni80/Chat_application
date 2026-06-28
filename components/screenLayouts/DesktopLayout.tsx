"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ConversationList from "../chat/sidebar/ConversationList";
import { MessageSquare, Settings, User } from "lucide-react";
import React from "react";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* navbar */}
      <nav className="w-16 shrink-0 border-r border-border bg-card flex flex-col items-center py-4 gap-4">
        <div className="p-3 bg-primary/15 text-primary rounded-xl cursor-pointer hover:bg-primary/25 transition-colors">
          <MessageSquare size={24} />
        </div>
        <div className="p-3 text-muted rounded-xl cursor-pointer hover:bg-muted/15 hover:text-foreground transition-colors  ">
          <User size={24} />
        </div>
        <div className="p-3 text-muted rounded-xl cursor-pointer hover:bg-muted/15 hover:text-foreground transition-colors">
          <Settings size={24} />
        </div>
      </nav>
      {/* the workspace */}
      <div className="flex-1 min-w-0 h-full">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="40%" minSize="35%" >
            <ConversationList />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="60%" minSize="50%">{children}</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
