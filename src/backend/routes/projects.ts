import { Elysia, t } from "elysia";
import { db } from "../../db";
import { projects } from "../../db/schema";
import { eq } from "drizzle-orm";

export const projectRoutes = new Elysia({ prefix: "/projects" })
  .get("/", async () => {
    const allProjects = await db.select().from(projects);
    return { projects: allProjects };
  })
  .get("/:id", async ({ params }) => {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(params.id)))
      .limit(1);

    if (project.length === 0) {
      throw new Error("Project not found");
    }

    return { project: project[0] };
  })
  .post(
    "/",
    async ({ body }) => {
      const newProject = await db.insert(projects).values(body).returning();
      return { project: newProject[0] };
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        iconLight: t.Optional(t.String()),
        iconDark: t.Optional(t.String()),
        images: t.Optional(t.Array(t.String())),
        techStack: t.Optional(t.Array(t.String())),
        githubRepo: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
      }),
    },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const updatedProject = await db
        .update(projects)
        .set({ ...body, updatedAt: new Date().toISOString() })
        .where(eq(projects.id, parseInt(params.id)))
        .returning();

      return { project: updatedProject[0] };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        iconLight: t.Optional(t.String()),
        iconDark: t.Optional(t.String()),
        images: t.Optional(t.Array(t.String())),
        techStack: t.Optional(t.Array(t.String())),
        githubRepo: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
      }),
    },
  )
  .delete("/:id", async ({ params }) => {
    await db.delete(projects).where(eq(projects.id, parseInt(params.id)));
    return { success: true };
  });
