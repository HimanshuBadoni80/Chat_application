"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export function CopyToClipboardButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button 
      type="button" 
      variant={copied ? "default" : "outline"}
      size="sm" 
      onClick={handleCopy}
      className={`h-8 rounded-lg px-3 text-xs transition-all shrink-0 ${
        copied 
          ? "bg-green-500 hover:bg-green-600 text-white border-transparent" 
          : "hover:bg-primary/10 hover:text-primary hover:border-primary/30"
      }`}
    >
      {copied ? (
        <span className="flex items-center gap-1.5">
          <Check className="h-3.5 w-3.5" />
          Copied
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          Copy
        </span>
      )}
    </Button>
  );
}
