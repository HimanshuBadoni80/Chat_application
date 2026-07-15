import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type EmptyContactCardProps ={
  onAddContact: () => void;
}
export default function EmptyContactCard(props:EmptyContactCardProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <h2>No Contacts yet</h2>
      <Button
        variant="outline"
        className="flex items-center justify-center gap-0.5 pl-[12] pr-[20] bg-primary hover:bg-muted hover:text-muted-foreground cursor-pointer"
        onClick={() => props.onAddContact()}
        aria-label="Start a new chat"
      >
        <Plus />
        Add Contact
      </Button>
    </div>
  );
}