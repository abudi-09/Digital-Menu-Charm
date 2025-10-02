import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./utils/connectDB";

dotenv.config();

const start = async () => {
  await connectDB();

  const configuredPort = Number(process.env.PORT ?? "5000");
  const port = 5000;

  if (configuredPort && configuredPort !== port) {
    console.warn(
      `Configured PORT (${configuredPort}) differs from required port ${port}. Using ${port} to keep backend and frontend aligned.`
    );
  }

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
