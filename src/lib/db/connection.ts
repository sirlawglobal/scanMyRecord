import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const cached = globalThis.mongooseCache ??= {
  conn: null,
  promise: null,
};

export function hasValidMongoUri() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    return false;
  }

  const normalized = uri.toLowerCase();

  return !normalized.includes("replace-with-") && !normalized.includes("your-mongodb-atlas");
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!hasValidMongoUri()) {
    throw new Error("MONGODB_URI is not defined or still contains a placeholder value");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI as string).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}
