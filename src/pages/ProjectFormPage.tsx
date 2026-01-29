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
    githubRepos: [""] as string[],
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
          githubRepos:
            project.githubRepos && project.githubRepos.length > 0
              ? project.githubRepos
              : [""],
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
    setFormData((prev) => ({ ...prev, githubRepos: [repoUrl] }));
    // Automatically fetch repo info after selection with the URL
    setTimeout(() => {
      handleFetchGithubInfo();
    }, 300);
  };

  const handleFetchGithubInfo = async () => {
    const validRepos = formData.githubRepos.filter((url) => url.trim() !== "");
    if (validRepos.length === 0) {
      toast.warning("Please provide at least one GitHub repository URL.");
      return;
    }

    setFetchingGithub(true);
    try {
      // Fetch data for all valid repositories
      const fetchPromises = validRepos.map(async (url) => {
        const response = await fetch(
          "http://localhost:3000/api/github/fetch-repo",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
          return { url, error: data.error };
        }
        return { url, data };
      });

      const results = await Promise.all(fetchPromises);

      // Check for errors
      const errors = results.filter((r) => r.error);
      if (errors.length > 0) {
        if (errors.some((e) => e.error.includes("404")) && !githubConnected) {
          toast.warning(
            "Some repositories might be private. Please connect GitHub to access them.",
          );
          setTimeout(() => setGithubAuthOpen(true), 1500);
        } else {
          toast.error("Failed to fetch some repositories", {
            description: errors.map((e) => e.error).join(", "),
          });
        }
        // Continue with successful fetches
      }

      const successfulResults = results.filter((r) => r.data);

      if (successfulResults.length === 0) {
        return;
      }

      // Aggregate stats from all repositories
      let totalStars = 0;
      let totalForks = 0;
      let totalCommitCount = 0;
      let totalOpenIssues = 0;
      let earliestCommit: string | null = null;
      let latestCommit: string | null = null;
      const languages = new Set<string>();

      successfulResults.forEach(({ data }) => {
        totalStars += data.stars || 0;
        totalForks += data.forks || 0;
        totalCommitCount += data.commitCount || 0;
        totalOpenIssues += data.openIssues || 0;

        if (data.firstCommit) {
          if (
            !earliestCommit ||
            new Date(data.firstCommit) < new Date(earliestCommit)
          ) {
            earliestCommit = data.firstCommit;
          }
        }

        if (data.lastCommit) {
          if (
            !latestCommit ||
            new Date(data.lastCommit) > new Date(latestCommit)
          ) {
            latestCommit = data.lastCommit;
          }
        }

        if (data.language) {
          languages.add(data.language);
        }
      });

      // Update form with aggregated data
      setFormData((prev) => {
        const firstRepo = successfulResults[0].data;
        return {
          ...prev,
          name:
            prev.name ||
            firstRepo.name.charAt(0).toUpperCase() + firstRepo.name.slice(1),
          description: prev.description || firstRepo.description || "",
          startDate: earliestCommit
            ? new Date(earliestCommit).toISOString().split("T")[0]
            : prev.startDate,
          techStack: [
            ...prev.techStack,
            ...Array.from(languages).filter(
              (lang) => !prev.techStack.includes(lang),
            ),
          ],
          githubStats: {
            stars: totalStars,
            forks: totalForks,
            firstCommit: earliestCommit || undefined,
            lastCommit: latestCommit || undefined,
            commitCount: totalCommitCount,
            openIssues: totalOpenIssues,
            language: Array.from(languages).join(", "),
            defaultBranch: successfulResults[0].data.defaultBranch,
          },
        };
      });

      setHasSuccessfulFetch(true);

      toast.success(
        `Fetched ${successfulResults.length} ${successfulResults.length === 1 ? "repository" : "repositories"}`,
        {
          description: `${totalStars} stars · ${totalCommitCount} commits`,
        },
      );
    } catch (error: any) {
      toast.error("Failed to fetch repositories", {
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
      const validRepos = formData.githubRepos.filter(
        (url) => url.trim() !== "",
      );
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        githubRepos: validRepos.length > 0 ? validRepos : undefined,
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
                  <Label className="text-xs">GitHub Repositories</Label>
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
                <div className="space-y-2">
                  {formData.githubRepos.map((repo, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <ButtonGroup key={index} className="w-full">
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
                          type="url"
                          value={repo}
                          onChange={(e) => {
                            const newRepos = [...formData.githubRepos];
                            newRepos[index] = e.target.value;
                            setFormData({ ...formData, githubRepos: newRepos });
                          }}
                          placeholder="https://github.com/..."
                          className={`h-9 ${!isEditing ? "rounded-none border-l-0" : "rounded-r-none"}`}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0 rounded-none border-l-0"
                          onClick={() => handleFetchGithubInfo()}
                          disabled={!repo.trim() || fetchingGithub}
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
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        disabled={formData.githubRepos.length === 1}
                        onClick={() => {
                          if (formData.githubRepos.length === 1) {
                            // If only one repo, clear it instead of removing
                            setFormData({ ...formData, githubRepos: [""] });
                          } else {
                            const newRepos = formData.githubRepos.filter(
                              (_, i) => i !== index,
                            );
                            setFormData({ ...formData, githubRepos: newRepos });
                          }
                        }}
                        title="Remove repository"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9"
                    disabled={
                      formData.githubRepos[
                        formData.githubRepos.length - 1
                      ].trim() === ""
                    }
                    onClick={() => {
                      setFormData({
                        ...formData,
                        githubRepos: [...formData.githubRepos, ""],
                      });
                    }}
                  >
                    + Add Repository
                  </Button>
                </div>
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
