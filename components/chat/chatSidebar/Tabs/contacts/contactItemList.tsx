import { useChatStore } from "@/lib/store/chatStore/store";
import EmptyContactCard from "./EmptyContactCard";
import { ContactListItem } from "./contactItem";

export function ContactItemList() {
  const isLoadingContacts = useChatStore((state) => state.isLoadingContacts);
  const contactUiData = useChatStore((state) => state.contactUiData);

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto">
      {!isLoadingContacts && contactUiData.length === 0 ? (
        <div className="h-full flex items-center justify-center p-4">
          <EmptyContactCard />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          {contactUiData.map((contact) => (
            <ContactListItem key={contact.id} contact={contact} />
          ))}
        </div>
      )}
    </div>
  );
}
