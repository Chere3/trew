import { db } from "../lib/db";

console.log("Running migrations for archive/soft-delete...");

try {
    // Add archivedAt column
    try {
        db.prepare("ALTER TABLE chat ADD COLUMN archivedAt INTEGER").run();
        console.log("Added archivedAt column");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            throw error;
        }
        console.log("archivedAt column already exists");
    }

    // Add deletedAt column
    try {
        db.prepare("ALTER TABLE chat ADD COLUMN deletedAt INTEGER").run();
        console.log("Added deletedAt column");
    } catch (error: any) {
        if (!error.message.includes("duplicate column name")) {
            throw error;
        }
        console.log("deletedAt column already exists");
    }

    console.log("Migrations completed successfully!");
} catch (error) {
    console.error("Migration failed:", error);
}
