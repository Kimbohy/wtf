import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import techList, { getTechByName, techTypeLabels } from "../lib/tech-list";
import type { TechType } from "../lib/tech-list";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Plus,
  Github,
  Calendar,
  Search,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  Edit,
  FolderKanban,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubRepo: "",
    icon: "",
    iconType: "emoji" as "emoji" | "svg" | "image",
    techStack: [] as string[],
    images: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid");

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

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        description: project.description || "",
        githubRepo: project.githubRepo || "",
        icon: project.icon || "",
        iconType: (project.iconType as "emoji" | "svg" | "image") || "emoji",
        techStack: project.techStack || [],
        images: project.images || [],
        startDate: project.startDate || new Date().toISOString().split("T")[0],
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        githubRepo: "",
        icon: "",
        iconType: "emoji",
        techStack: [],
        images: [],
        startDate: new Date().toISOString().split("T")[0],
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        githubRepo: formData.githubRepo || undefined,
        icon: formData.icon || undefined,
        iconType: formData.iconType || undefined,
        techStack:
          formData.techStack.length > 0 ? formData.techStack : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        startDate: formData.startDate || undefined,
      };

      if (editingProject) {
        await api.api.projects({ id: editingProject.id }).put(projectData);
      } else {
        await api.api.projects.post(projectData);
      }

      setIsDialogOpen(false);
      await loadProjects();
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setSaving(false);
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

  const handleTechToggle = (techName: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(techName)
        ? prev.techStack.filter((t) => t !== techName)
        : [...prev.techStack, techName],
    }));
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
    if (!project.icon) {
      return (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          <FolderKanban className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

    if (project.iconType === "emoji") {
      return (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
          {project.icon}
        </div>
      );
    }

    if (project.iconType === "image" || project.iconType === "svg") {
      return (
        <Avatar className="h-12 w-12 rounded-lg">
          <AvatarImage src={project.icon} alt={project.name} />
          <AvatarFallback className="rounded-lg">
            {project.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop-style Header/Toolbar */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger>
                  <Button size="sm" onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Edit Project" : "Create New Project"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProject
                        ? "Update your project information"
                        : "Add a new project to your workspace"}
                    </DialogDescription>
                  </DialogHeader>

                  <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="grid gap-6 py-4">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">
                          Basic Information
                        </h3>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">
                              Project Name{" "}
                              <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              placeholder="My Awesome Project"
                            />
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                              id="description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                              placeholder="A brief description of your project"
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="icon">Project Icon</Label>
                              <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    icon: e.target.value,
                                  })
                                }
                                placeholder="🚀 or /path/to/icon.svg"
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="startDate">Start Date</Label>
                              <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    startDate: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>

                          <div className="grid gap-2">
                            <Label htmlFor="githubRepo">
                              GitHub Repository
                            </Label>
                            <Input
                              id="githubRepo"
                              type="url"
                              value={formData.githubRepo}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  githubRepo: e.target.value,
                                })
                              }
                              placeholder="https://github.com/username/repo"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Tech Stack */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Tech Stack</h3>
                          <Badge variant="secondary">
                            {formData.techStack.length} selected
                          </Badge>
                        </div>

                        <Tabs defaultValue="language" className="w-full">
                          <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="language">
                              Languages
                            </TabsTrigger>
                            <TabsTrigger value="framework">
                              Frameworks
                            </TabsTrigger>
                            <TabsTrigger value="database">
                              Databases
                            </TabsTrigger>
                            <TabsTrigger value="library">Libraries</TabsTrigger>
                            <TabsTrigger value="tools">Tools</TabsTrigger>
                            <TabsTrigger value="auth">Auth</TabsTrigger>
                          </TabsList>
                          {(Object.keys(techTypeLabels) as TechType[]).map(
                            (type) => (
                              <TabsContent
                                key={type}
                                value={type}
                                className="mt-4"
                              >
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    {techList
                                      .filter((tech) => tech.type === type)
                                      .map((tech) => (
                                        <div
                                          key={tech.tech}
                                          className="flex items-center space-x-2"
                                        >
                                          <Checkbox
                                            id={`tech-${tech.tech}`}
                                            checked={formData.techStack.includes(
                                              tech.tech,
                                            )}
                                            onCheckedChange={() =>
                                              handleTechToggle(tech.tech)
                                            }
                                          />
                                          <Label
                                            htmlFor={`tech-${tech.tech}`}
                                            className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                                          >
                                            <i
                                              className={`${tech.icon} text-lg`}
                                            />
                                            {tech.name}
                                          </Label>
                                        </div>
                                      ))}
                                  </div>
                                </ScrollArea>
                              </TabsContent>
                            ),
                          )}
                        </Tabs>
                      </div>

                      {/* Selected Tech Stack Preview */}
                      {formData.techStack.length > 0 && (
                        <div className="space-y-2">
                          <Label>Selected Technologies</Label>
                          <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/50">
                            {formData.techStack.map((techName) => {
                              const tech = getTechByName(techName);
                              return tech ? (
                                <Badge
                                  key={tech.tech}
                                  variant="secondary"
                                  className="gap-1.5"
                                >
                                  <i className={`${tech.icon} text-sm`} />
                                  {tech.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProject}
                      disabled={!formData.name || saving}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          {editingProject ? "Update Project" : "Create Project"}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
                <Button onClick={() => handleOpenDialog()}>
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
                    className="group flex flex-col hover:shadow-lg transition-all duration-200 hover:border-primary/50"
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
                                      <i className={`${tech.icon} text-base`} />
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
                            >
                              <a
                                href={project.githubRepo}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Github className="h-4 w-4" />
                              </a>
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
                            onClick={() => handleOpenDialog(project)}
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
                            onClick={() => handleDeleteProject(project.id)}
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
      </div>
    </TooltipProvider>
  );
}

export default App;
