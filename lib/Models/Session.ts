import { Schema, model, models, Document } from "mongoose";

export interface ClientSession extends Document {
  sessionToken: string;
  user: Schema.Types.ObjectId;
  expiresAt: Date;
  valid: boolean;
  userAgent: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ClientSession>(
  {
    sessionToken: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    valid: {
      type: Boolean,
      default: true,
    },
    userAgent: String,
    ip: String,
  },
  {
    timestamps: true,
  },
);

SessionSchema.index({ sessionToken: 1 }, { unique: true });
/* 
in the context of a TTL (Time To Live) index, { expireAfterSeconds: 0 } is the "trigger" that tells MongoDB exactly when to delete a document.

Normally, expireAfterSeconds is used to say: "Delete this 3600 seconds (1 hour) after it was created." However, when you set it to 0, the logic changes slightly. It tells MongoDB:
    "Delete this document the very second the clock hits the date stored in the expiresAt field."
How it works behind the scenes
-The Target Field: MongoDB watches the field you indexed (in your case, expiresAt).

-The Calculation: It performs this math: expiresAt + expireAfterSeconds.

-The Result: Since your value is 0, the math is simply expiresAt + 0.

-The Cleanup: MongoDB runs a background "Janitor" thread every 60 seconds. It looks for any document where the expiresAt timestamp is in the past and wipes it out.
*/
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = models.Session || model<ClientSession>("Session",SessionSchema);

export default Session;
