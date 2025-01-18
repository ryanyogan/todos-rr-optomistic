import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export default defineConfig({
  dialect: "sqlite",
  schema: "./app/drizzle/schema.ts",
  out: "./app/drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
