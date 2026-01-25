import { db } from "../lib/db";

console.log("Adding attachments column to message table...");

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(message)").all() as Array<{
        cid: number;
        name: string;
        type: string;
        notnull: number;
        dflt_value: any;
        pk: number;
    }>;

    const hasAttachmentsColumn = tableInfo.some(col => col.name === 'attachments');

    if (hasAttachmentsColumn) {
        console.log("Attachments column already exists, skipping migration.");
    } else {
        // Add attachments column to store JSON array of attachment objects
        db.prepare(`
            ALTER TABLE message 
            ADD COLUMN attachments TEXT
        `).run();

        console.log("Successfully added attachments column!");
    }
} catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
}
