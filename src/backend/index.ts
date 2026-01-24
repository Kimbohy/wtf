import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { projectRoutes } from "./routes/projects";

export const app = new Elysia({
  adapter: node(),
})
  .use(cors())
  .get("/api/health", () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }))
  .group("/api", (app) => app.use(projectRoutes))
  .listen(3000);

export type App = typeof app;

console.log(`🦊 Elysia backend is running at http://localhost:3000`);
