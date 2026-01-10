import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// tell typescript , we are adding mongoose preperty to global space
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URL = process.env.MONGODB_URL;

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// initial server start up
if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // return existing connection
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // validate MongoDB URI exists
    if (!MONGODB_URL) {
      throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
      );
    }

    const options = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URL, options).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // reset promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
