import { Schema, Types, Document, model, models } from "mongoose";

export interface IContact extends Document {
  ownerId: Types.ObjectId; // the user who saved the contact
  userId: Types.ObjectId; // the person they saved
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

// for backend
export type populatedContact = Omit<IContact, "userId" | "updatedAt"> & {
  userId: {
    _id: Types.ObjectId;
    uid: string;
    username: string;
    isDeleted: boolean;
  };
};

/* const contactList = await Contact.find({
      ownerId,
    }).populate("userId", "_id uid username isDeleted")
      .sort({ createdAt: -1 })
      .lean(); */

// for front-end
export type ContactDto = {
  id: string;
  targetUserId: string; // Referenced User ID; remains after soft deletion
  nickname: string;
  user: {
    uid: string;
    username: string;
  } | null;
  createdAt: string;
};

const ContactSchema = new Schema<IContact>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    // toObject: {
    //   transform: function (doc, ret:any) {
    //     delete ret.__v; // Removes the version key
    //     return ret;
    //   },
    // },
  },
);

// compound index—prevent duplicate contacts
ContactSchema.index(
  { ownerId: 1, userId: 1 },
  {
    unique: true,
  },
);

const Contact = models.Contact || model<IContact>("Contact", ContactSchema);

export default Contact;
