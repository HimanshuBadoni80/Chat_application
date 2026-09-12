import { Schema, Types, Document, model, models } from "mongoose";
import type { IMessage } from "./message";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  directKey?: string;
  lastMessage?: Types.ObjectId;
  isGroup: boolean;
  hiddenFor: Types.ObjectId[];
  clearedAt: Map<string, Date>;
  createdAt: Date;
  updatedAt: Date;
}

// Plain populated/lean data consumed by toConversationDTO(). It deliberately
// does not extend Mongoose Document because .lean() returns plain objects.
export type reducedIConversation = {
  _id: Types.ObjectId;
  participants: {
    _id: Types.ObjectId;
    uid: string;
    username: string | null;
    isDeleted: boolean;
  }[];
  lastMessage: {
    _id: Types.ObjectId;
    tempId: string;
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    messageType: IMessage["messageType"];
    status: IMessage["status"];
    createdAt: Date;
  } | null;
  clearedAt: Map<string, Date> | Record<string, Date>;
  createdAt: Date;
};





const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    directKey: {
      type: String,
      required: function (this: IConversation) {
        return !this.isGroup;
      },
    },
    lastMessage: {
      type: Types.ObjectId,
      ref: "Message",
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    hiddenFor: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    clearedAt: {
      type: Map,
      of: Date,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  },
);

ConversationSchema.pre("validate", function () {
  const conversation = this as IConversation;

  if (conversation.isGroup) {
    conversation.directKey = undefined;
    return;
  }

  if (conversation.participants.length !== 2) {
    conversation.invalidate(
      "participants",
      "A direct conversation must have exactly two participants.",
    );
    return;
  }

  const participantsIds = conversation.participants
    .map((participantId) => participantId.toString())
    .sort();

  if (participantsIds[0] === participantsIds[1]) {
    conversation.invalidate(
      "participants",
      "A direct conversation needs two different participants.",
    );
    return;
  }

  conversation.directKey = participantsIds.join(":");
});

// This is a unique multikey index. It indexes each participant separately,
// which would prevent a user from belonging to more than one conversation.
// ConversationSchema.index({ participants: 1 }, { unique: true });

// Only direct conversations receive a canonical key made from their two sorted
// participant IDs. The database can therefore enforce one direct chat per pair
// without placing any uniqueness constraint on group conversations.
ConversationSchema.index(
  { directKey: 1 },
  {
    unique: true,
    partialFilterExpression: { isGroup: false },
  },
);

const Conversation =
  models.Conversation ||
  model<IConversation>("Conversation", ConversationSchema);

export default Conversation;

// to-do → if hiddenFor.length === 2 remove the conversation from db
