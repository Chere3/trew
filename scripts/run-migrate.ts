#!/usr/bin/env bun
/**
 * Script to run node-pg-migrate with proper SSL configuration
 * This script handles self-signed certificates for remote PostgreSQL databases
 */

// Set NODE_TLS_REJECT_UNAUTHORIZED to 0 to allow self-signed certificates
// This is only for the migration process
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { execSync } from "child_process";

const command = process.argv[2] || "up";
const extraArgs = process.argv.slice(3);

console.log(`Running node-pg-migrate ${command} with SSL certificate verification disabled...`);
console.log("Note: This is safe for migrations but ensure your database connection is secure.\n");

try {
  const args = ["node-pg-migrate", command, ...extraArgs];
  execSync(`npx ${args.join(" ")}`, {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
    },
  });
  console.log(`\n✅ Migration ${command} completed successfully!`);
} catch (error: any) {
  console.error(`\n❌ Migration ${command} failed`);
  process.exit(error.status || 1);
}
