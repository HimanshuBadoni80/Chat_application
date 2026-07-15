"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import ChatSideBarPanel from "../chat/sidebar/ChatSideBar";
import React from "react";

export default function DesktopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full bg-background text-foreground">
      {/* the workspace */}
      <div className="flex-1 min-w-0 h-full">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize="40%" minSize="35%">
            <ChatSideBarPanel />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="60%" minSize="50%">
            {children}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
