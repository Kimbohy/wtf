import { useState, useEffect } from "react";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
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
import { Plus, Github, Calendar, Search, Loader2 } from "lucide-react";

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
    techStack: "",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);

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
        techStack: project.techStack?.join(", ") || "",
        startDate: project.startDate || new Date().toISOString().split("T")[0],
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        description: "",
        githubRepo: "",
        icon: "",
        techStack: "",
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
        techStack: formData.techStack
          ? formData.techStack.split(",").map((tech) => tech.trim())
          : undefined,
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

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack?.some((tech) =>
        tech.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
  );

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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">WTF - What To Finish</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track all your projects in one place
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProject
                      ? "Update your project information"
                      : "Add a new project to your dashboard"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">
                      Project Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="My Awesome Project"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="icon">Icon (Emoji)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) =>
                        setFormData({ ...formData, icon: e.target.value })
                      }
                      placeholder="🚀"
                      maxLength={2}
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

                  <div className="grid gap-2">
                    <Label htmlFor="githubRepo">GitHub Repository URL</Label>
                    <Input
                      id="githubRepo"
                      type="url"
                      value={formData.githubRepo}
                      onChange={(e) =>
                        setFormData({ ...formData, githubRepo: e.target.value })
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="techStack">
                      Tech Stack (comma-separated)
                    </Label>
                    <Input
                      id="techStack"
                      value={formData.techStack}
                      onChange={(e) =>
                        setFormData({ ...formData, techStack: e.target.value })
                      }
                      placeholder="React, TypeScript, Node.js"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                </div>

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
                      "Save Project"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold">
              {searchQuery ? "No projects found" : "No projects yet"}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "Start by adding your first project"}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    {project.icon && (
                      <div className="text-4xl shrink-0">{project.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{project.name}</CardTitle>
                      {project.startDate && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Started{" "}
                          {new Date(project.startDate).toLocaleDateString()}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.description}
                    </p>
                  )}

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.techStack.map((tech, index) => (
                        <Badge key={index} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex gap-2 flex-wrap">
                  {project.githubRepo && (
                    <a
                      href={project.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(project)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
