import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./utils/connectDB";

dotenv.config();

const start = async () => {
  await connectDB();

  // Use the PORT provided by the environment when available (Render, Heroku, etc.).
  // Fallback to 5001 for local development when PORT is not set.
  const configuredPort = Number(process.env.PORT ?? "5001");
  const port = configuredPort;

  const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Please free it and retry.`
      );
    } else {
      console.error("Server failed to start:", error);
    }
    process.exit(1);
  });
};

start();
