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

export const db = new Pool({
  connectionString,
  ssl: sslConfig,
  // Connection pool optimization
  max: 20, // Maximum number of clients in the pool (increased from default 10)
  min: 2, // Minimum number of clients to keep in the pool (warm pool)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // Statement timeout (in milliseconds) - queries taking longer than this will be cancelled
  statement_timeout: 30000, // 30 seconds
  // Query timeout (in milliseconds) - alternative approach using application-level timeout
  query_timeout: 30000, // 30 seconds
});

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
