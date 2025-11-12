import { defineConfig, env } from "prisma/config";
import { config as dotenvConfig } from "dotenv";
import * as path from "path";

// Load environment variables from .env file in the Server directory
dotenvConfig({ path: path.join(__dirname, ".env") });

export default defineConfig({
  schema: path.join(__dirname, "prisma/schema.prisma"),
  migrations: {
    path: path.join(__dirname, "prisma/migrations"),
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
