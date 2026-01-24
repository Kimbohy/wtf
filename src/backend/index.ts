import { Elysia } from "elysia";
import { projectRoutes } from "./routes/projects";

export const app = new Elysia({ prefix: "/api" })
  .use(projectRoutes)
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .listen(3000);

export type App = typeof app;

console.log(
  `🦊 Elysia backend is running at ${app.server?.hostname}:${app.server?.port}`,
);
