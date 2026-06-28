import type {
  ClientSession,
  IConversation,
  IMessageBase,
} from "@/lib/Models/index";

import { Types } from "mongoose";

export type updatedClientSession = Omit<ClientSession, "_id" | "user"> & {
  _id: string;
  user: {
    _id: string;
    uid: string;
    username: string | null;
    email: string;
    isVerified: boolean;
  };
};

export interface PopulatedParticipant {
  _id: Types.ObjectId;
  uid: string;
  username: string;
}

export type updatedIConversation = Omit<
  IConversation,
  "_id" | "participants" | "lastMessage" | "createdAt"
> & {
  _id: string;
  participants: {
    _id: string;
    uid: string;
    username: string;
  }[];

  lastMessage: IMessageBase | null;
  createdAt: string;
};
