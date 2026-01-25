import { db } from "../lib/db";

console.log("Running migration: Add token_usage table...");

try {
    // Check if table already exists
    const tableInfo = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='token_usage'
    `).get() as { name: string } | undefined;

    if (tableInfo) {
        console.log("token_usage table already exists, skipping creation.");
    } else {
        // Create token_usage table
        db.prepare(`
            CREATE TABLE token_usage (
                id TEXT PRIMARY KEY,
                messageId TEXT NOT NULL,
                chatId TEXT NOT NULL,
                userId TEXT NOT NULL,
                model TEXT NOT NULL,
                provider TEXT NOT NULL,
                promptTokens INTEGER NOT NULL DEFAULT 0,
                completionTokens INTEGER NOT NULL DEFAULT 0,
                totalTokens INTEGER NOT NULL DEFAULT 0,
                cachedTokens INTEGER DEFAULT 0,
                reasoningTokens INTEGER DEFAULT 0,
                cost REAL DEFAULT 0,
                latency INTEGER,
                createdAt INTEGER NOT NULL,
                FOREIGN KEY (messageId) REFERENCES message(id) ON DELETE CASCADE,
                FOREIGN KEY (chatId) REFERENCES chat(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
            )
        `).run();

        console.log("Created token_usage table.");
    }

    // Create indexes for efficient queries
    const indexes = [
        { name: "idx_token_usage_userId", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_userId ON token_usage(userId)" },
        { name: "idx_token_usage_chatId", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_chatId ON token_usage(chatId)" },
        { name: "idx_token_usage_messageId", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_messageId ON token_usage(messageId)" },
        { name: "idx_token_usage_model", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model)" },
        { name: "idx_token_usage_createdAt", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_createdAt ON token_usage(createdAt)" },
        { name: "idx_token_usage_userId_createdAt", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_userId_createdAt ON token_usage(userId, createdAt)" },
        { name: "idx_token_usage_chatId_createdAt", sql: "CREATE INDEX IF NOT EXISTS idx_token_usage_chatId_createdAt ON token_usage(chatId, createdAt)" },
    ];

    for (const index of indexes) {
        try {
            db.prepare(index.sql).run();
            console.log(`Created index: ${index.name}`);
        } catch (error: any) {
            if (!error.message.includes("already exists")) {
                console.error(`Failed to create index ${index.name}:`, error);
            }
        }
    }

    console.log("Migration completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
}
