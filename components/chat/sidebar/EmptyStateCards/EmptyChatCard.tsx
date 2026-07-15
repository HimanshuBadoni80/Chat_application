
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type EmptyChatCardProps =  {
  onCLick : () => void;
}

export default function EmptyChatCard(props:EmptyChatCardProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2>No chats yet</h2>
      <Button
        variant="outline"
        className="flex items-center justify-center gap-0.5 pl-[12] pr-[20] bg-primary hover:bg-muted hover:text-muted-foreground cursor-pointer"
        onClick={() => props.onCLick()}
        aria-label="Start a new chat"
      >
        Start a conversation
        <ArrowRight />
      </Button>
    </div>
  );
}
