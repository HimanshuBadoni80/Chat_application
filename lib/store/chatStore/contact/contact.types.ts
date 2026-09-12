import { ApiResponse } from "@/lib/types/apiResponse";
import type { ContactDto } from "@/lib/Models";

export type ContactListItem = ContactDto;

export type ContactItemData = {
  id: string;
  targetUserId: string;
  nickname: string;
  username: string | null;
  uid: string | null;
  isDeleted: boolean;
  href: string | undefined;
  hasConversation: boolean;
  createdAt: string;
};

// export type ContactPreview = {
//   id: string;
//   user: {
//     id: string;
//     uid: string;
//     username: string | null;
//   } | null;
//   createdAt: string;
// };

// export type ContactPreview = Omit<ContactListItem, "_id" | "user"> & {
//   id: string;
//   user:
//     | (Omit<NonNullable<ContactListItem["user"]>, "_id"> & { id: string })
//     | null;
// };

export type ContactsResponse = ApiResponse<ContactListItem[]>;

export interface ContactSlice {
  // data
  contacts: ContactListItem[];
  contactUiData: ContactItemData[];
  contactLookup: Map<string, string>;
  isLoadingContacts: boolean;
  contactsError: string | null;
  contactsFetchedAt: number | null;

  // methods
  createContact: (input: {
    uid: string;
    nickname: string;
  }) => Promise<ContactListItem | null>;
  fetchContacts: (options?: { force?: boolean }) => Promise<void>;
  setContactLookup: () => void;
  setContactUi: () => void;
  upsertContact: (contact: ContactListItem) => void;
  removeContactLocally: (contactId: string) => void;
}
