import { Schema, Types, Document, model, models } from "mongoose";

export interface IContact extends Document {
  ownerId: Types.ObjectId; // the user who saved the contact
  userId: Types.ObjectId; // the person they saved
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    ownerId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ContactSchema.index(
  { ownerId: 1, userId: 1 },
  {
    unique: true,
  },
);

const Contact = models.Contact || model<IContact>("Contact", ContactSchema);

export default Contact;
