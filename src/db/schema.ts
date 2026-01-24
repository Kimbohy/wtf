import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  techStack: text("tech_stack", { mode: "json" }).$type<string[]>(),
  githubRepo: text("github_repo"),
  githubStats: text("github_stats", { mode: "json" }).$type<{
    stars?: number;
    forks?: number;
    lastCommit?: string;
    openIssues?: number;
  }>(),
  startDate: text("start_date"),
  lastModified: text("last_modified"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
