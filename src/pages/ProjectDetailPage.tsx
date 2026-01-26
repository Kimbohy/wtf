import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import { getTechByName } from "../lib/tech-list";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  ArrowLeft,
  Github,
  Calendar,
  Loader2,
  Edit,
  Trash2,
  FolderKanban,
  ExternalLink,
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handlePreviousImage = () => {
    if (selectedImageIndex !== null && project?.images) {
      setSelectedImageIndex(
        (selectedImageIndex - 1 + project.images.length) %
          project.images.length,
      );
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && project?.images) {
      setSelectedImageIndex((selectedImageIndex + 1) % project.images.length);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.api.projects({ id: parseInt(id!) }).get();
      if (response.data) {
        setProject(response.data.project as Project);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.api.projects({ id: parseInt(id!) }).delete();
      navigate("/");
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center px-4 gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 min-w-0">
            <FolderKanban className="h-5 w-5 shrink-0" />
            <h1 className="text-lg font-semibold truncate">{project.name}</h1>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${project.id}/edit`)}
            >
              <Edit className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content - Simple Bento Grid */}
      <main className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-12">
          {/* Project Icon */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardContent className="p-6 flex items-center justify-center">
              {project.iconLight || project.iconDark ? (
                <>
                  {/* Light mode - use iconLight or fallback to iconDark */}
                  <img
                    src={(project.iconLight || project.iconDark)!}
                    alt={`${project.name} Icon`}
                    className="w-full h-full max-w-50 max-h-50 rounded-xl object-contain dark:hidden"
                  />
                  {/* Dark mode - use iconDark or fallback to iconLight */}
                  <img
                    src={(project.iconDark || project.iconLight)!}
                    alt={`${project.name} Icon`}
                    className="w-full h-full max-w-50 max-h-50 rounded-xl object-contain hidden dark:block"
                  />
                </>
              ) : (
                <div className="w-full aspect-square rounded-xl bg-muted flex items-center justify-center max-w-50">
                  <FolderKanban className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Name, Description & Start Date */}
          <Card className="md:col-span-4 lg:col-span-5">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
                {project.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {project.startDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Started{" "}
                    {new Date(project.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="md:col-span-6 lg:col-span-5">
            <CardContent className="p-6">
              {project.githubRepo ? (
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center">
                    <Github className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">GitHub Repository</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.githubRepo}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No links available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <Card className="md:col-span-6 lg:col-span-12">
            <CardContent className="p-6">
              {project.techStack && project.techStack.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {project.techStack.map((techName) => {
                    const tech = getTechByName(techName);
                    return tech ? (
                      <a
                        key={tech.tech}
                        href={tech.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border bg-muted/30 hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group"
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="h-6 w-6"
                        />
                        <span className="font-medium">{tech.name}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No technologies specified
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          {project.images && project.images.length > 0 && (
            <Card className="md:col-span-6 lg:col-span-12">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {project.images.map((image, index) => (
                    <div
                      key={index}
                      className="group relative aspect-video rounded-lg overflow-hidden border cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Image Dialog - Enhanced with Navigation */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={(open) => !open && setSelectedImageIndex(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-[80vw]! w-[80vw]! max-h-[95vh]! h-[95vh]! p-0 bg-white/80 border-0! overflow-hidden dark:bg-black/50"
        >
          {/* Close Button */}
          <DialogClose className="absolute right-4 top-4 z-50 rounded-full bg-white/90 backdrop-blur-sm p-2.5 hover:bg-white transition-colors shadow-lg dark:bg-white/80 dark:hover:bg-white">
            <X className="h-5 w-5 text-black" />
          </DialogClose>

          {/* Navigation Buttons */}
          {project?.images &&
            project.images.length > 1 &&
            selectedImageIndex !== null && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePreviousImage}
                  className="absolute left-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white transition-all h-14 w-14 shadow-lg dark:hover:bg-white/80"
                >
                  <ChevronLeft className="h-7 w-7 text-black" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextImage}
                  className="absolute right-6 top-1/2 -translate-y-1/2 z-50 rounded-2xl bg-white/40 backdrop-blur-sm hover:bg-white transition-all h-14 w-14 shadow-lg dark:hover:bg-white/80"
                >
                  <ChevronRight className="h-7 w-7 text-black" />
                </Button>

                {/* Image Counter */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full text-base font-medium text-black shadow-lg">
                  {selectedImageIndex + 1} / {project.images.length}
                </div>
              </>
            )}

          {/* Image Display */}
          {selectedImageIndex !== null && project?.images && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={project.images[selectedImageIndex]}
                alt={`Screenshot ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{project?.name}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                handleDeleteProject();
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
