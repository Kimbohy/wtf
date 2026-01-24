import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { app } from "electron";
import * as schema from "./schema";

// Get user data path for database
const userDataPath = app?.getPath("userData") || "./data";
const dbPath = join(userDataPath, "wtf.db");

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
export function initDb() {
  // Drizzle will create tables on first run
  console.log("Database initialized at:", dbPath);
}
