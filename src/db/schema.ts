import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  iconLight: text("icon_light"), // Base64 image data URL for light mode
  iconDark: text("icon_dark"), // Base64 image data URL for dark mode
  images: text("images", { mode: "json" }).$type<string[]>(), // Array of base64 image data URLs (screenshots)
  techStack: text("tech_stack", { mode: "json" }).$type<string[]>(),
  githubRepo: text("github_repo"),
  projectLink: text("project_link"), // Deployed project URL
  githubStats: text("github_stats", { mode: "json" }).$type<{
    stars?: number;
    forks?: number;
    firstCommit?: string;
    lastCommit?: string;
    commitCount?: number;
    openIssues?: number;
    language?: string;
    defaultBranch?: string;
  }>(),
  startDate: text("start_date"),
  lastModified: text("last_modified"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Settings table to store user preferences and GitHub token
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
