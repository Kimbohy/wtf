import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import { Button } from "../components/ui/button";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.api.projects.get();
      if (response.data) {
        setProjects(response.data.projects);
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold">WTF - What To Finish</h1>
          <p className="text-muted-foreground mt-2">
            Track all your projects in one place
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Button>Click</Button>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No projects yet</h2>
            <p className="text-muted-foreground">
              Start by adding your first project
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {project.icon && (
                    <div className="text-4xl">{project.icon}</div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-muted-foreground text-sm mb-4">
                        {project.description}
                      </p>
                    )}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.techStack.map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.startDate && (
                      <p className="text-sm text-muted-foreground">
                        Started:{" "}
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    )}
                    {project.githubRepo && (
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline mt-2 inline-block"
                      >
                        View on GitHub →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
