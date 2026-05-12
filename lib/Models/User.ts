import { Schema, model, Document, models } from "mongoose";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
// typescript interface for User document

export interface IUser extends Document {
  uid: string;
  username: string;
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
      default: nanoid(),
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

UserSchema.index({ uid: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
// UserSchema.index({verifyTokenExpiry: 1}, {expireAfterSeconds: 36000})

const User = models.User || model<IUser>("User", UserSchema);

export default User;
