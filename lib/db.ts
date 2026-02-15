import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Parse connection string to handle SSL properly
let connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString.replace(/^postgres:\/\//, "https://"));

// Normalize deprecated SSL modes to silence warnings
// For self-signed certificates (sslmode=require), use libpq compatibility mode
// For other deprecated modes, normalize to 'verify-full'
const sslMode = url.searchParams.get("sslmode");
if (sslMode === "require") {
  // For self-signed certificates, use libpq compatibility to silence warning
  // while maintaining current behavior with rejectUnauthorized: false
  url.searchParams.set("uselibpqcompat", "true");
  url.searchParams.set("sslmode", "require");
  connectionString = url.toString().replace(/^https:\/\//, "postgres://");
} else if (sslMode === "prefer" || sslMode === "verify-ca") {
  // For other deprecated modes, normalize to 'verify-full'
  url.searchParams.set("sslmode", "verify-full");
  connectionString = url.toString().replace(/^https:\/\//, "postgres://");
}

// Configure SSL for self-signed certificates
// When sslmode is 'require', we need to disable certificate verification
const finalSslMode = url.searchParams.get("sslmode");
const needsSelfSignedConfig = finalSslMode === "require" || 
                              connectionString.includes("sslmode=require");
const sslConfig = needsSelfSignedConfig
  ? { rejectUnauthorized: false }
  : undefined;

const poolMax = Number(
  process.env.PG_POOL_MAX ?? (process.env.NODE_ENV === "production" ? 10 : 5)
);
const poolMin = Number(process.env.PG_POOL_MIN ?? 0);

function createPool() {
  return new Pool({
    connectionString,
    ssl: sslConfig,
    // Connection pool optimization
    // NOTE: In dev, Next/Turbopack can reload modules and create multiple pools.
    // Keep these conservative to avoid exhausting managed Postgres connection limits.
    max: Number.isFinite(poolMax) ? poolMax : 5,
    min: Number.isFinite(poolMin) ? poolMin : 0,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    statement_timeout: 30000,
    query_timeout: 30000,
  });
}

declare global {
  var __trewPgPool: Pool | undefined;
}

export const db = globalThis.__trewPgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  globalThis.__trewPgPool = db;
}

// Handle pool errors
db.on("error", (err: Error) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  // Don't exit process in production - log and continue
  if (process.env.NODE_ENV === "production") {
    console.error("Pool error in production, continuing...");
  } else {
    process.exit(-1);
  }
});

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await db.query("SELECT 1 as health");
    return result.rows[0]?.health === 1;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
