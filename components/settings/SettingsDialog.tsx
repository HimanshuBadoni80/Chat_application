import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AccountSection } from "./sections/account/AccountSection";
import { ProfileSection } from "./sections/Profile/ProfileSection";


// for now this renders only  ProfileSection.tsx and AccountSection.tsx

type SettingsDialogProps = {
    open: boolean;
    onOpenChange: (open:boolean) => void;
    section: "profile" | "account";
}

export function SettingsDialog(props : SettingsDialogProps ) {
    return (
        <Dialog open = {props.open} onOpenChange={props.onOpenChange} >
            <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{props.section === "profile" ? "Profile settings" : "Account settings"}</DialogTitle>
                    </DialogHeader>
                    <div>
                        {props.section === "account" && <AccountSection/>}
                        {props.section === "profile" && <ProfileSection/>}
                    </div>
                  </DialogContent>
        </Dialog>
    )
}