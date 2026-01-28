import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Save,
  X,
  FolderKanban,
  Github,
  RefreshCw,
  Search,
  Download,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useTheme } from "../components/theme-provider";
import { IconUploadCard } from "../components/project/IconUploadCard";
import { TechStackSelector } from "../components/project/TechStackSelector";
import { ProjectImagesUpload } from "../components/project/ProjectImagesUpload";
import { RepoSearchDialog } from "../components/project/RepoSearchDialog";
import { PageHeader } from "../components/shared/PageHeader";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { GitHubAuthDialog } from "../components/shared/GitHubAuthDialog";
import { ButtonGroup } from "@/components/ui/button-group";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

// Helper to get the actual resolved theme
const getResolvedTheme = (theme: string): "light" | "dark" => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme as "light" | "dark";
};

export function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { theme } = useTheme();

  const [loading, setLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubRepo: "",
    projectLink: "",
    iconLight: "",
    iconDark: "",
    techStack: [] as string[],
    images: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
    githubStats: undefined as
      | {
          stars?: number;
          forks?: number;
          firstCommit?: string;
          lastCommit?: string;
          commitCount?: number;
          openIssues?: number;
          language?: string;
          defaultBranch?: string;
        }
      | undefined,
  });
  const [saving, setSaving] = useState(false);
  const [iconDragActive, setIconDragActive] = useState(false);
  const [imagesDragActive, setImagesDragActive] = useState(false);
  const [iconPreviewMode, setIconPreviewMode] = useState<"light" | "dark">(() =>
    getResolvedTheme(theme),
  );
  const [githubAuthOpen, setGithubAuthOpen] = useState(false);
  const [repoSearchOpen, setRepoSearchOpen] = useState(false);
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [hasSuccessfulFetch, setHasSuccessfulFetch] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadProject();
    }
    checkGithubConnection();
  }, [id]);

  const checkGithubConnection = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/github/status");
      const data = await response.json();
      setGithubConnected(data.connected);
    } catch (error) {
      console.error("Failed to check GitHub connection:", error);
    }
  };

  const loadProject = async () => {
    try {
      const response = await api.api.projects({ id: parseInt(id!) }).get();
      if (response.data) {
        const project = response.data.project as Project;
        setFormData({
          name: project.name,
          description: project.description || "",
          githubRepo: project.githubRepo || "",
          projectLink: project.projectLink || "",
          iconLight: project.iconLight || "",
          iconDark: project.iconDark || "",
          techStack: project.techStack || [],
          images: project.images || [],
          startDate:
            project.startDate || new Date().toISOString().split("T")[0],
          githubStats: project.githubStats || undefined,
        });
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repoUrl: string) => {
    setFormData((prev) => ({ ...prev, githubRepo: repoUrl }));
    // Automatically fetch repo info after selection with the URL
    setTimeout(() => {
      handleFetchGithubInfo(repoUrl);
    }, 300);
  };

  const handleFetchGithubInfo = async (repoUrlOverride?: string) => {
    const urlToFetch = repoUrlOverride || formData.githubRepo;
    if (!urlToFetch) {
      toast.warning("Please provide a GitHub repository URL first.");

      return;
    }

    setFetchingGithub(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/github/fetch-repo",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToFetch }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        if (data.error.includes("404") && !githubConnected) {
          // Might be a private repo
          toast.warning(
            "This might be a private repository. Please connect GitHub to access it.",
          );
          setTimeout(() => setGithubAuthOpen(true), 1500);
        } else {
          toast.error("Failed to fetch repository", {
            description: data.error,
          });
        }
        return;
      }

      // Update form with fetched data
      setFormData((prev) => ({
        ...prev,
        name:
          prev.name || data.name.charAt(0).toUpperCase() + data.name.slice(1),
        description: prev.description || data.description || "",
        startDate: data.firstCommit
          ? new Date(data.firstCommit).toISOString().split("T")[0]
          : prev.startDate,
        techStack:
          data.language && !prev.techStack.includes(data.language)
            ? [...prev.techStack, data.language]
            : prev.techStack,
        githubStats: {
          stars: data.stars,
          forks: data.forks,
          firstCommit: data.firstCommit,
          lastCommit: data.lastCommit,
          commitCount: data.commitCount,
          openIssues: data.openIssues,
          language: data.language,
          defaultBranch: data.defaultBranch,
        },
      }));

      const commitInfo = data.commitCount ? `${data.commitCount} commits` : "";
      const description = [data.language || "N/A", commitInfo]
        .filter(Boolean)
        .join(" · ");

      setHasSuccessfulFetch(true);

      toast.success("Repository information fetched", {
        description: `${data.name} · ${description}`,
      });
    } catch (error: any) {
      toast.error("Failed to fetch repository", {
        description:
          error.message ||
          "Could not connect to GitHub API. Please check your internet connection.",
      });
    } finally {
      setFetchingGithub(false);
    }
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        githubRepo: formData.githubRepo || undefined,
        projectLink: formData.projectLink || undefined,
        githubStats: formData.githubStats || undefined,
        iconLight: formData.iconLight || undefined,
        iconDark: formData.iconDark || undefined,
        techStack:
          formData.techStack.length > 0 ? formData.techStack : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        startDate: formData.startDate || undefined,
      };

      if (isEditing) {
        await api.api.projects({ id: parseInt(id!) }).put(projectData);
      } else {
        await api.api.projects.post(projectData);
      }

      navigate("/");
    } catch (error) {
      console.error("Failed to save project:", error);
    } finally {
      setSaving(false);
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

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleIconUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;
    const dataUrl = await readFileAsDataURL(file);

    // If no icons exist yet, set both to the same image
    if (!formData.iconLight && !formData.iconDark) {
      setFormData((prev) => ({
        ...prev,
        iconLight: dataUrl,
        iconDark: dataUrl,
      }));
    } else {
      // Otherwise, only replace the currently previewed mode
      if (iconPreviewMode === "light") {
        setFormData((prev) => ({ ...prev, iconLight: dataUrl }));
      } else {
        setFormData((prev) => ({ ...prev, iconDark: dataUrl }));
      }
    }
  };

  const handleImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        const dataUrl = await readFileAsDataURL(file);
        newImages.push(dataUrl);
      }
    }
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleIconDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIconDragActive(true);
    } else if (e.type === "dragleave") {
      setIconDragActive(false);
    }
  };

  const handleIconDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIconDragActive(false);
    await handleIconUpload(e.dataTransfer.files);
  };

  const handleImagesDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImagesDragActive(true);
    } else if (e.type === "dragleave") {
      setImagesDragActive(false);
    }
  };

  const handleImagesDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragActive(false);
    await handleImagesUpload(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleIconDelete = (mode: "light" | "dark") => {
    if (mode === "light") {
      setFormData((prev) => ({ ...prev, iconLight: "" }));
    } else {
      setFormData((prev) => ({ ...prev, iconDark: "" }));
    }
  };

  const handleCopyIcon = (fromMode: "light" | "dark") => {
    if (fromMode === "light") {
      setFormData((prev) => ({
        ...prev,
        iconDark: prev.iconLight,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        iconLight: prev.iconDark,
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        leftContent={
          <>
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
              <h1 className="text-lg font-semibold truncate">
                {isEditing ? "Edit Project" : "New Project"}
              </h1>
            </div>
          </>
        }
        rightContent={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              disabled={saving}
              className="hidden sm:flex"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveProject}
              disabled={!formData.name || saving}
            >
              {saving ? (
                <div className="h-4 w-4 sm:mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Save className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">
                {isEditing ? "Update" : "Create"}
              </span>
            </Button>
          </>
        }
      />

      <main className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-8 auto-rows-min">
          <IconUploadCard
            iconLight={formData.iconLight}
            iconDark={formData.iconDark}
            previewMode={iconPreviewMode}
            onPreviewModeChange={setIconPreviewMode}
            onIconUpload={handleIconUpload}
            onIconDelete={handleIconDelete}
            onCopyIcon={handleCopyIcon}
            dragActive={iconDragActive}
            onDragEnter={handleIconDrag}
            onDragLeave={handleIconDrag}
            onDragOver={handleIconDrag}
            onDrop={handleIconDrop}
          />

          {/* Name & Description */}
          <Card className="md:col-span-4 lg:col-span-3">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Project Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Awesome Project"
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Project description..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Start Date & GitHub */}
          <Card className="md:col-span-6 lg:col-span-3">
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        data-empty={!formData.startDate}
                        className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal w-full"
                      />
                    }
                  >
                    <CalendarIcon />
                    {formData.startDate ? (
                      format(new Date(formData.startDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={
                        formData.startDate
                          ? new Date(formData.startDate)
                          : undefined
                      }
                      onSelect={(date) =>
                        setFormData({
                          ...formData,
                          startDate: date
                            ? date.toISOString().split("T")[0]
                            : "",
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="githubRepo" className="text-xs">
                    GitHub Repository
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setGithubAuthOpen(true)}
                  >
                    <Github className="h-3 w-3 mr-1" />
                    {githubConnected ? "Connected" : "Connect"}
                  </Button>
                </div>
                <ButtonGroup className="w-full">
                  {/* TODO: change this to a Input group */}
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-r-none"
                      onClick={() => setRepoSearchOpen(true)}
                      title="Search repositories"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    id="githubRepo"
                    type="url"
                    value={formData.githubRepo}
                    onChange={(e) =>
                      setFormData({ ...formData, githubRepo: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className={`h-9 ${!isEditing ? "rounded-l-none" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-l-none border-l-0"
                    onClick={() => handleFetchGithubInfo()}
                    disabled={!formData.githubRepo || fetchingGithub}
                    title={
                      hasSuccessfulFetch
                        ? "Refresh repository information"
                        : "Fetch repository information"
                    }
                  >
                    {fetchingGithub ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : hasSuccessfulFetch ? (
                      <RefreshCw className="h-4 w-4" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </ButtonGroup>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="projectLink" className="text-xs">
                  Project Link
                </Label>
                <Input
                  id="projectLink"
                  type="url"
                  value={formData.projectLink}
                  onChange={(e) =>
                    setFormData({ ...formData, projectLink: e.target.value })
                  }
                  placeholder="https://myproject.com"
                  className="h-9"
                />
              </div>
            </CardContent>
          </Card>

          <TechStackSelector
            selectedTech={formData.techStack}
            onToggle={handleTechToggle}
          />

          <ProjectImagesUpload
            images={formData.images}
            onUpload={handleImagesUpload}
            onRemove={removeImage}
            dragActive={imagesDragActive}
            onDragEnter={handleImagesDrag}
            onDragLeave={handleImagesDrag}
            onDragOver={handleImagesDrag}
            onDrop={handleImagesDrop}
          />
        </div>
      </main>

      <GitHubAuthDialog
        open={githubAuthOpen}
        onOpenChange={(open) => {
          setGithubAuthOpen(open);
          if (!open) {
            // Refresh connection status when dialog closes
            checkGithubConnection();
          }
        }}
      />

      <RepoSearchDialog
        open={repoSearchOpen}
        onOpenChange={setRepoSearchOpen}
        onSelectRepo={handleSelectRepo}
        isConnected={githubConnected}
        onConnect={() => {
          setRepoSearchOpen(false);
          setGithubAuthOpen(true);
        }}
      />
    </div>
  );
}
