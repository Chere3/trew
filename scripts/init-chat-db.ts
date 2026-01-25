import { db } from "../lib/db";

console.log("Running migrations...");

try {
    // Create chat table
    db.prepare(`
    CREATE TABLE IF NOT EXISTS chat (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT,
      createdAt INTEGER,
      updatedAt INTEGER,
      FOREIGN KEY (userId) REFERENCES user(id)
    )
  `).run();

    // Create message table
    db.prepare(`
    CREATE TABLE IF NOT EXISTS message (
      id TEXT PRIMARY KEY,
      chatId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      model TEXT,
      createdAt INTEGER,
      FOREIGN KEY (chatId) REFERENCES chat(id) ON DELETE CASCADE
    )
  `).run();

    console.log("Migrations completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
}
