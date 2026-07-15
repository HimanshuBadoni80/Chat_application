import { ApiResponse } from "@/lib/types/api";

export type ContactListItem = {
    _id: string;
    user : {
        _id: string;
        uid: string;
        username:string | null;
    } | null;
    createdAt: string;
};

export type ContactsResponse = ApiResponse<ContactListItem[]>;

export interface ContactSlice {
    // data
    contacts: ContactListItem[];
    isLoadingContacts: boolean;
    contactsError: string | null;

    // methods
    fetchContacts: () => Promise<void>;
    upsertContact: (contact: ContactListItem) => void;
    removeContactLocally: (contactId: string) => void;

}