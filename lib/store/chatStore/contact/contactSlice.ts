import { StateCreator } from "zustand";
import type { ChatStore } from "../store";
import {
  ContactSlice,
  ContactsResponse,
  ContactListItem,
} from "./contact.types";
import apiFetch from "@/lib/utils/fetchWrapper";
import {
  hasSessionExpired,
  extractErrorMessage,
} from "@/lib/utils/handleStoreErrors";
import {
  createContactSchema,
  extractZodError,
} from "@/lib/validation/contact.schema";
import type { ApiResponse } from "@/lib/types/apiResponse";

const CONTACTS_STALE_TIME = 2 * 60 * 1000;

export const createContactSlice: StateCreator<
  ChatStore,
  [],
  [],
  ContactSlice
> = (set, get) => ({
  contacts: [],
  contactUiData: [],
  contactLookup: new Map<string, string>(),
  isLoadingContacts: false,
  contactsError: null,
  contactsFetchedAt: null,

  createContact: async (input) => {
    const validation = createContactSchema.safeParse(input);
    if (!validation.success) {
      throw extractZodError(validation.error);
    }

    try {
      const response = await apiFetch<ApiResponse<ContactListItem>>(
        "/api/contacts/createContact",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validation.data),
        },
      );

      if (!response.success) {
        throw response;
      }

      if (!response.data) {
        throw new Error(
          "Contact was added, but no contact details were returned",
        );
      }

      get().upsertContact(response.data);
      get().setContactUi();
      return response.data;
    } catch (error) {
      if (hasSessionExpired(error, get().disconnect)) return null;
      throw error;
    }
  },
  fetchContacts: async (options) => {
    const { force = false } = options ?? {};

    if (get().isLoadingContacts) return;

    if (!force && get().contactsFetchedAt) {
      const age = Date.now() - get().contactsFetchedAt!;
      if (age < CONTACTS_STALE_TIME) return;
    }

    set({
      isLoadingContacts: true,
      contactsError: null,
    });

    try {
      const response = await apiFetch<ContactsResponse>(
        "/api/contacts/fetchContacts",
      );

      if (!response.success) {
        throw response;
      }
      set({
        contacts: response.data ?? [],
        contactsFetchedAt: Date.now(),
      });

      get().setContactLookup();
      get().setContactUi();
    } catch (error) {
      if (hasSessionExpired(error, get().disconnect)) return;
      set({
        contactsError: extractErrorMessage(error, "Unable to load contacts."),
      });
    } finally {
      set({ isLoadingContacts: false });
    }
  },
  setContactLookup: () => {
    const lookupMap = new Map<string, string>();
    get().contacts.forEach((con) => {
      lookupMap.set(con.targetUserId, con.nickname);
    });
    set({ contactLookup: lookupMap });
    // Whenever contact lookup changes, update conversation UI names
    if (get().setConversationUi) {
      get().setConversationUi();
    }
  },
  setContactUi: () => {
    const { contacts, conversationLookup } = get();

    const contactUiData = contacts.map((contact) => {
      const entry = conversationLookup.get(contact.targetUserId);
      const isDeleted = contact.user === null || (entry?.isDeleted ?? false);

      return {
        id: contact.id,
        targetUserId: contact.targetUserId,
        nickname: contact.nickname,
        username: contact.user?.username ?? null,
        uid: contact.user?.uid ?? null,
        isDeleted,
        href: entry ? `/chat/${entry.conversationId}` : undefined,
        hasConversation: !!entry,
        createdAt: contact.createdAt,
      };
    });

    set({ contactUiData });
  },
  upsertContact: (incomingContact) => {
    // update if exists else insert.
    set((state) => {
      const exists = state.contacts.some(
        (contact) => contact.id === incomingContact.id,
      );

      return {
        contacts: exists
          ? state.contacts.map((contact) =>
              contact.id === incomingContact.id ? incomingContact : contact,
            )
          : [incomingContact, ...state.contacts],
      };
    });
    get().setContactLookup();
    get().setContactUi();
  },
  removeContactLocally: (contactId) => {
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== contactId),
    }));
    get().setContactLookup();
    get().setContactUi();
  },
});

// to-DO
// contact lookup

// fix the add contact logic- add nickname field.  front and backend.
// change the seed data- add new contact fields.
// first message logic.
