import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Admin } from "../src/models/Admin";

const DEFAULT_ADMIN = {
  username: "superadmin",
  email: "admin@grandvista.com",
  password: "Admin@123",
  role: "admin" as const,
};

const ensureEnv = () => {
  const hasUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!hasUri) {
    throw new Error(
      "Missing required env variable: set MONGODB_URI or MONGO_URI"
    );
  }
};

const buildMongoUri = () => {
  const uri = process.env.MONGODB_URI ?? process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGODB_URI or MONGO_URI must be provided");
  }
  const dbName = process.env.DB_NAME;

  if (uri.includes("/")) {
    // Append dbName only if not already specified
    const hasDbName = uri.split("/").slice(3).join("/").length > 0;
    if (hasDbName || !dbName) {
      return uri;
    }
    return `${uri}/${dbName}`;
  }

  if (!dbName) {
    throw new Error(
      "DB_NAME must be provided when the Mongo URI has no database name"
    );
  }

  return `${uri}/${dbName}`;
};

const seedAdmin = async () => {
  ensureEnv();

  const mongoUri = buildMongoUri();
  console.info(`Connecting to MongoDB at ${mongoUri}`);

  await mongoose.connect(mongoUri);
  console.info("Connected to MongoDB");

  try {
    const existing = await Admin.findOne({ email: DEFAULT_ADMIN.email })
      .select("+password")
      .exec();

    if (existing) {
      console.info("Admin already exists. Updating password...");
      existing.password = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
      await existing.save();
      console.info("Admin password updated successfully");
      return;
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

    await Admin.create({
      username: DEFAULT_ADMIN.username,
      email: DEFAULT_ADMIN.email,
      password: hashedPassword,
      role: DEFAULT_ADMIN.role,
    });

    console.info("Admin user created successfully");
  } catch (error) {
    console.error("Failed to seed admin user", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.info("MongoDB connection closed");
  }
};

seedAdmin().catch((error) => {
  console.error("Unexpected error", error);
  process.exit(1);
});
