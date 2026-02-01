import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Separator } from "../components/ui/separator";
import { Plus, Search, FolderKanban } from "lucide-react";
import { ProjectCard } from "../components/project/ProjectCard";
import { PageHeader } from "../components/shared/PageHeader";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

export function ProjectListPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleDeleteProject = async (id: number) => {
    // todo: change the confirm dialog to the shadcn one
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await api.api.projects({ id }).delete();
        await loadProjects();
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack?.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <>
      <PageHeader
        leftContent={
          <>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5" />
              <h1 className="text-lg font-semibold">WTF</h1>
            </div>
            <Separator orientation="vertical" className="mx-4 h-6" />
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </>
        }
        rightContent={
          <Button size="sm" onClick={() => navigate("/projects/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        }
      />

      <main className="container mx-auto p-6">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
              <FolderKanban className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {searchQuery
                ? "Try adjusting your search query to find what you're looking for"
                : "Get started by creating your first project and tracking your development journey"}
            </p>
            {!searchQuery && (
              <Button onClick={() => navigate("/projects/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  My Projects
                </h2>
                <p className="text-sm text-muted-foreground">
                  {filteredProjects.length}{" "}
                  {filteredProjects.length === 1 ? "project" : "projects"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
