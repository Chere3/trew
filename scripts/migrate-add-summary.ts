import { db } from "../lib/db";

console.log("Running migration to add summary column to chat table...");

try {
    // Add summary column
    try {
        db.prepare("ALTER TABLE chat ADD COLUMN summary TEXT").run();
        console.log("Added summary column");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            throw error;
        }
        console.log("summary column already exists");
    }

    console.log("Migration completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
}
