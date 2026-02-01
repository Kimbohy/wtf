import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join, dirname } from "path";
import * as schema from "./schema.js";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get user data path for database
// Use different paths depending on environment
let dbPath: string;
let migrationsFolder: string;

// Check if running in Electron
const isElectron = typeof process !== "undefined" && process.versions?.electron;

if (isElectron) {
  // Dynamic import for Electron app
  const { app } = await import("electron");
  const userDataPath = app?.getPath("userData") || "./data";

  // Ensure the directory exists
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true });
  }

  dbPath = join(userDataPath, "wtf.db");
  // In packaged app, drizzle folder is at the root of resources/app
  migrationsFolder = join(__dirname, "..", "..", "drizzle");
} else {
  // For standalone backend (dev mode)
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
  dbPath = join(dataDir, "wtf.db");
  migrationsFolder = join(process.cwd(), "drizzle");
}

console.log("Database path:", dbPath);

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
export function initDb() {
  try {
    console.log("Migrations folder:", migrationsFolder);
    // Run migrations
    migrate(db, { migrationsFolder });
    console.log("Database initialized and migrations applied at:", dbPath);
  } catch (error) {
    console.error("Database initialization error:", error);
    // If migrations fail, just log and continue
    console.log("Database initialized (no migrations) at:", dbPath);
  }
}
