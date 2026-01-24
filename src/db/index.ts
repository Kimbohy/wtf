import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import * as schema from "./schema";

// Get user data path for database
// Use different paths depending on environment
let dbPath: string;

// Check if running in Electron
const isElectron = typeof process !== "undefined" && process.versions?.electron;

if (isElectron) {
  // Dynamic import for Electron app
  const { app } = await import("electron");
  const userDataPath = app?.getPath("userData") || "./data";
  dbPath = join(userDataPath, "wtf.db");
} else {
  // For standalone backend (dev mode)
  dbPath = join(process.cwd(), "data", "wtf.db");
}

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
export function initDb() {
  // Drizzle will create tables on first run
  console.log("Database initialized at:", dbPath);
}
