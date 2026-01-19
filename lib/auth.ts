import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import path from "path";

// Initialize SQLite database
const dbPath = path.join(process.cwd(), "sqlite.db");
const database = new Database(dbPath);

export const auth = betterAuth({
  database,
  emailAndPassword: {
    enabled: true,
  },
  // Add social providers here if needed
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
});
