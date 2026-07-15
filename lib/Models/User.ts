import { Schema, model, Document, models } from "mongoose";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import Session from "./Session";
import Conversation from "./conversation";
import Message from "./message";
import Contact from "./contact";
// typescript interface for User document
export interface IUser extends Document {
  uid: string;
  username: string | null;
  email: string;
  password: string;
  isVerified: boolean;
  verifyToken?: string;
  verifyTokenExpiry?: Date;
  passwordResetHash?: string;
  passwordResetExpires?: Date;
  resetAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, 6);
const UserSchema = new Schema<IUser>(
  {
    uid: {
      type: String,
      default: () => nanoid(),
    },
    username: {
      type: String,
      trim: true,
      maxlength: 20,
      lowercase: true,
      default: null,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      select: false,
      required: [true, "please provide a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifyToken: {
      type: String,
    },
    verifyTokenExpiry: {
      type: Date,
    },
    passwordResetHash: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
    resetAttempts: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.pre("save", async function () {
  const user = this as IUser;

  // logic for - hash the password
  if (user.isModified("password")) {
    // isNew and isModified are same the first time
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }

  // logic for - if user updates its username
  if (user.isModified("username") && user.username) {
    user.username = user.username.replace(/\s+/g, "_");
  }

  // if user updates its email
  if (user.isModified("email")) {
    user.isVerified = false;

    // generate the token in api routes that handles the "Email Update"
  }
});

UserSchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const dbSession = this.getOptions().session;

    if (!dbSession) {
      throw new Error("User deletion must run inside a transaction");
    }

    const userQuery = this.model.findOne(this.getFilter()).select("_id");

    if (dbSession) {
      userQuery.session(dbSession); // chaining the session
    }

    const user = await userQuery;
    if (!user) return;

    const conversationIds = await Conversation.find({
      participants: user._id,
    })
      .distinct("_id")
      .session(dbSession);

    const ContactIds = await Contact.find({
      ownerId: user._id,
    })
      .distinct("_id")
      .session(dbSession);

    // the session is passed as an option object in the arguments
    await Message.deleteMany(
      { conversationId: { $in: conversationIds } },
      { session: dbSession },
    );

    await Conversation.deleteMany(
      { _id: { $in: conversationIds } },
      { session: dbSession },
    );

    await Contact.deleteMany(
      { _id: { $in: ContactIds } },
      { session: dbSession },
    );

    await Session.deleteMany({ user: user._id }, { session: dbSession });
  },
);

UserSchema.index({ uid: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({verifyTokenExpiry: 1}, {expireAfterSeconds: 36000})

const User = models.User || model<IUser>("User", UserSchema);

export default User;

/* Which operations support middleware?
save
validate
deleteOne
updateOne
find
findOne
findOneAndUpdate
aggregate
init
*/

/* uid: {
      type: String,
      default: () => nanoid(),
    }, 
    
    earlier version

    uid: {
      type: String,
      default: nanoid,
    },

    why the change: function type-> const nanoid: (size?: number | undefined) => string

    the function supports an optional size override.
    Mongoose’s TypeScript definitions for a string default are stricter and expect a factory shaped like: () => string
    so the wrapper () => nanoid()  was needed.
    
    */
