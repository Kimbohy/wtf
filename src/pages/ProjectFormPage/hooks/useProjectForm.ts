import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import type { Project } from "../../../db/schema";
import { toast } from "sonner";

// Helper to get the actual resolved theme
export const getResolvedTheme = (theme: string): "light" | "dark" => {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return theme as "light" | "dark";
};

export interface ProjectFormData {
  name: string;
  description: string;
  githubRepos: string[];
  projectLink: string;
  iconLight: string;
  iconDark: string;
  techStack: string[];
  images: string[];
  startDate: string;
  githubStats?: {
    stars?: number;
    forks?: number;
    firstCommit?: string;
    lastCommit?: string;
    commitCount?: number;
    openIssues?: number;
    language?: string;
    defaultBranch?: string;
  };
}

export function useProjectForm(theme: string) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    description: "",
    githubRepos: [""],
    projectLink: "",
    iconLight: "",
    iconDark: "",
    techStack: [],
    images: [],
    startDate: new Date().toISOString().split("T")[0],
    githubStats: undefined,
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
    setFormData((prev) => {
      // Find the first empty repo slot or add to the end
      const emptyIndex = prev.githubRepos.findIndex(
        (repo) => repo.trim() === "",
      );
      let newRepos: string[];

      if (emptyIndex !== -1) {
        // Replace the first empty slot
        newRepos = [...prev.githubRepos];
        newRepos[emptyIndex] = repoUrl;
      } else {
        // Add to the end if no empty slots
        newRepos = [...prev.githubRepos, repoUrl];
      }

      return { ...prev, githubRepos: newRepos };
    });

    // Automatically fetch repo info after selection with the URL
    // Pass the URL directly to avoid state update timing issues
    setTimeout(() => {
      handleFetchGithubInfoForUrl(repoUrl);
    }, 100);
  };

  const handleFetchGithubInfoForUrl = async (specificUrl?: string) => {
    // If a specific URL is provided, use it; otherwise use all repos from form
    const reposToFetch = specificUrl
      ? [specificUrl]
      : formData.githubRepos.filter((url) => url.trim() !== "");

    if (reposToFetch.length === 0) {
      toast.warning("Please provide at least one GitHub repository URL.");
      return;
    }

    setFetchingGithub(true);
    try {
      // Fetch data for all valid repositories
      const fetchPromises = reposToFetch.map(async (url) => {
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
      }

      const successfulResults = results.filter((r) => r.data);

      if (successfulResults.length === 0) {
        return;
      }

      // Aggregate stats from all repositories
      // Start with existing stats if we're fetching a specific URL (adding to existing repos)
      let totalStars = specificUrl ? formData.githubStats?.stars || 0 : 0;
      let totalForks = specificUrl ? formData.githubStats?.forks || 0 : 0;
      let totalCommitCount = specificUrl
        ? formData.githubStats?.commitCount || 0
        : 0;
      let totalOpenIssues = specificUrl
        ? formData.githubStats?.openIssues || 0
        : 0;
      let earliestCommit: string | null = specificUrl
        ? formData.githubStats?.firstCommit || null
        : null;
      let latestCommit: string | null = specificUrl
        ? formData.githubStats?.lastCommit || null
        : null;
      const languages = new Set<string>();

      // Add existing languages if we're adding to existing repos
      if (specificUrl && formData.githubStats?.language) {
        formData.githubStats.language
          .split(", ")
          .forEach((lang) => languages.add(lang));
      }

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

  // Wrapper function that calls handleFetchGithubInfoForUrl without a specific URL
  const handleFetchGithubInfo = async () => {
    await handleFetchGithubInfoForUrl();
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

  return {
    // State
    isEditing,
    loading,
    saving,
    formData,
    setFormData,
    iconDragActive,
    imagesDragActive,
    iconPreviewMode,
    setIconPreviewMode,
    githubAuthOpen,
    setGithubAuthOpen,
    repoSearchOpen,
    setRepoSearchOpen,
    fetchingGithub,
    githubConnected,
    hasSuccessfulFetch,
    // Handlers
    handleSaveProject,
    handleTechToggle,
    handleIconUpload,
    handleImagesUpload,
    handleIconDrag,
    handleIconDrop,
    handleImagesDrag,
    handleImagesDrop,
    removeImage,
    handleIconDelete,
    handleCopyIcon,
    handleSelectRepo,
    handleFetchGithubInfo,
    checkGithubConnection,
    navigate,
  };
}
