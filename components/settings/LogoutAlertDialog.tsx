import { LogOutIcon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import LogoutButton from "../Logout/LogoutButton"

type LogoutAlertDialogProps ={
    open:boolean;
    onOpenChange: (open: boolean) => void;
} 

export function LogoutAlertDialog({open,onOpenChange}:LogoutAlertDialogProps) {
  return (
    <AlertDialog  open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <LogOutIcon className="text-red-700" />
          </AlertDialogMedia>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter> 
          <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
          <LogoutButton/>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
