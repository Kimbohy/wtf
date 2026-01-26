import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import { getTechByName } from "../lib/tech-list";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { Separator } from "../components/ui/separator";
import {
  Plus,
  Github,
  Calendar,
  Search,
  Loader2,
  Trash2,
  Edit,
  FolderKanban,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

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

  const renderProjectIcon = (project: Project) => {
    const hasIcons = project.iconLight || project.iconDark;

    if (!hasIcons) {
      return (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          <FolderKanban className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    // Use iconLight for light mode, iconDark for dark mode, fallback to whichever exists
    const lightIcon = project.iconLight || project.iconDark;
    const darkIcon = project.iconDark || project.iconLight;

    return (
      <>
        <img
          src={lightIcon!}
          alt={project.name}
          className="h-12 w-12 rounded-lg object-cover dark:hidden"
        />
        <img
          src={darkIcon!}
          alt={project.name}
          className="h-12 w-12 rounded-lg object-cover hidden dark:block"
        />
      </>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center px-4">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button size="sm" onClick={() => navigate("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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
                <Card
                  key={project.id}
                  className="group flex flex-col hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      {renderProjectIcon(project)}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {project.name}
                        </CardTitle>
                        {project.startDate && (
                          <CardDescription className="flex items-center gap-1 text-xs mt-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(project.startDate).toLocaleDateString()}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pb-3">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}

                    {project.techStack && project.techStack.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {project.techStack.slice(0, 6).map((techName) => {
                            const tech = getTechByName(techName);
                            return tech ? (
                              <Tooltip key={tech.tech}>
                                <TooltipTrigger>
                                  <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
                                    <img
                                      src={tech.icon}
                                      alt={tech.name}
                                      className="h-4 w-4"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">{tech.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : null;
                          })}
                          {project.techStack.length > 6 && (
                            <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                              +{project.techStack.length - 6}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-3 border-t">
                    {project.githubRepo && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (project.githubRepo) {
                                window.open(project.githubRepo, "_blank");
                              }
                            }}
                          >
                            <Github className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">View on GitHub</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <div className="flex-1" />
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Edit project</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">Delete project</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
