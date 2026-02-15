#!/usr/bin/env bun
/**
 * Script to run better-auth migrations with proper SSL configuration
 * This script handles self-signed certificates for remote PostgreSQL databases
 */

// Set NODE_TLS_REJECT_UNAUTHORIZED to 0 to allow self-signed certificates
// This is only for the migration process
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { spawn } from "child_process";

const command = "npx";
const args = ["@better-auth/cli@latest", "migrate"];

console.log("Running better-auth migrations with SSL certificate verification disabled...");
console.log("Note: This is safe for migrations but ensure your database connection is secure.\n");

const child = spawn(command, args, {
  stdio: "inherit",
  shell: true,
});

child.on("error", (error) => {
  console.error("Error running migration:", error);
  process.exit(1);
});

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(`Migration failed with exit code ${code}`);
    process.exit(code || 1);
  }
  console.log("\n✅ Better-auth migrations completed successfully!");
});
