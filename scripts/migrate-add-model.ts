
import { db } from "../lib/db";

console.log("Running migration: add model column to message table...");

try {
    // Check if column exists first to avoid error
    const tableInfo = db.prepare("PRAGMA table_info(message)").all() as any[];
    const hasModelColumn = tableInfo.some(col => col.name === "model");

    if (!hasModelColumn) {
        db.prepare("ALTER TABLE message ADD COLUMN model TEXT").run();
        console.log("Added 'model' column to 'message' table.");
    } else {
        console.log("'model' column already exists in 'message' table.");
    }

    console.log("Migration completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
}
