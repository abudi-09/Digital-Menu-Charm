import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is not defined");
  try {
    await mongoose.connect(uri, {
      dbName: process.env.DB_NAME || "digital-menu-charm",
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    process.exit(1);
  }
};
