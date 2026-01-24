import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";
import { projects } from "./schema";
import * as schema from "./schema";

// Create database connection for seeding (without Electron)
const dbPath = join(process.cwd(), "data", "wtf.db");
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log("🌱 Seeding database...");
  console.log("Database path:", dbPath);

  const sampleProjects = [
    {
      name: "WTF - What To Finish",
      description:
        "A desktop app to track all my projects in one place. Built with Electron, React, and Elysia.js",
      icon: "🚀",
      techStack: [
        "Electron",
        "React",
        "TypeScript",
        "Elysia.js",
        "Drizzle ORM",
      ],
      githubRepo: "https://github.com/yourusername/wtf",
      startDate: "2026-01-15",
    },
    {
      name: "Portfolio Website",
      description:
        "My personal portfolio website showcasing my projects and skills",
      icon: "💼",
      techStack: ["Next.js", "Tailwind CSS", "TypeScript"],
      githubRepo: "https://github.com/yourusername/portfolio",
      startDate: "2025-12-01",
    },
    {
      name: "Chat App",
      description: "Real-time chat application with WebSocket support",
      icon: "💬",
      techStack: ["React", "Node.js", "Socket.io", "MongoDB"],
      githubRepo: "https://github.com/yourusername/chat-app",
      startDate: "2025-11-20",
    },
    {
      name: "Task Manager API",
      description: "RESTful API for managing tasks and projects",
      icon: "📋",
      techStack: ["Express", "PostgreSQL", "TypeScript", "Prisma"],
      startDate: "2025-10-15",
    },
    {
      name: "Weather Dashboard",
      description:
        "Beautiful weather dashboard with forecasts and historical data",
      icon: "🌤️",
      techStack: ["Vue.js", "Vite", "Chart.js"],
      githubRepo: "https://github.com/yourusername/weather-dashboard",
      startDate: "2026-01-01",
    },
  ];

  for (const project of sampleProjects) {
    await db.insert(projects).values(project);
    console.log(`✅ Added project: ${project.name}`);
  }

  console.log("✨ Seeding complete!");
  sqlite.close();
}

seed()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
