import { betterAuth } from "better-auth";
import { db as database } from "./db";

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
