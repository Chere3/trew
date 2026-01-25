import { db } from "../lib/db";

console.log("Running migration to create user_semantic_memory table...");

try {
    // Create user_semantic_memory table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS user_semantic_memory (
            userId TEXT PRIMARY KEY,
            facts TEXT NOT NULL,
            updatedAt INTEGER NOT NULL,
            FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
        )
    `).run();
    console.log("Created user_semantic_memory table");

    console.log("Migration completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
}
