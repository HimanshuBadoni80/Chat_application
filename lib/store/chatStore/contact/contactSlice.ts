import { StateCreator } from "zustand";
import type { ChatStore } from "../useChatStore";
import { ContactSlice, ContactsResponse } from "./contact.types";
import apiFetch from "@/lib/fetchapi/fetchWrapper";
import { isApiResponse } from "@/lib/types/api";

export const createContactSlice: StateCreator<
  ChatStore & ContactSlice,
  [],
  [],
  ContactSlice
> = (set, get) => ({
  contacts: [],
  isLoadingContacts: false,
  contactsError: null,

  fetchContacts: async () => {
    if (get().isLoadingContacts) return;

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
      });
    } catch (error) {
      if (isApiResponse(error)) {
        if (error.error?.code === "NO_ACTIVE_SESSION") {
          window.location.href =
            error.data &&
            typeof error.data === "object" &&
            "redirecTo" in error.data &&
            typeof error.data.redirecTo === "string"
              ? error.data.redirecTo
              : "/login?reason=session_expired";

          return;
        }
        set({ contactsError: error.message });
      } else {
        set({
          contactsError:
            error instanceof Error ? error.message : "Unable to load contacts.",
        });
      }
    } finally {
      set({ isLoadingContacts: false });
    }
  },
  upsertContact: (incomingContact) => {
    // update if exists else insert.
    set((state) => {
      const exists = state.contacts.some(
        (contact) => contact._id === incomingContact._id,
      );

      return {
        contacts: exists
          ? state.contacts.map((contact) =>
              contact._id === incomingContact._id ? incomingContact : contact,
            )
          : [incomingContact, ...state.contacts],
      };
    });
  },
  removeContactLocally: (contactId) => {
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact._id !== contactId),
    }));
  },
});
