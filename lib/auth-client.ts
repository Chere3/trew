import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL is optional if your auth server is on the same domain
  // baseURL: "http://localhost:3000"
});

// Export commonly used methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
