import { betterAuth } from "better-auth";
import { db as database } from "./db";

function getBaseURL() {
  // Prefer explicit config.
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;

  // Vercel sets VERCEL_URL without protocol.
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fallback for local/dev or other hosting.
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  return undefined;
}

export const auth = betterAuth({
  database,
  baseURL: getBaseURL(),
  // Vercel preview deployments generate random URLs → whitelist wildcard.
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.vercel.app",
    ...(process.env.NEXT_PUBLIC_APP_URL ? [process.env.NEXT_PUBLIC_APP_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
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
