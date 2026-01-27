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
import { ArrowLeft, Save, X, FolderKanban } from "lucide-react";
import { useTheme } from "../components/theme-provider";
import { IconUploadCard } from "../components/project/IconUploadCard";
import { TechStackSelector } from "../components/project/TechStackSelector";
import { ProjectImagesUpload } from "../components/project/ProjectImagesUpload";
import { PageHeader } from "../components/shared/PageHeader";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

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
    iconLight: "",
    iconDark: "",
    techStack: [] as string[],
    images: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [iconDragActive, setIconDragActive] = useState(false);
  const [imagesDragActive, setImagesDragActive] = useState(false);
  const [iconPreviewMode, setIconPreviewMode] = useState<"light" | "dark">(() =>
    getResolvedTheme(theme),
  );

  useEffect(() => {
    if (isEditing) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await api.api.projects({ id: parseInt(id!) }).get();
      if (response.data) {
        const project = response.data.project as Project;
        setFormData({
          name: project.name,
          description: project.description || "",
          githubRepo: project.githubRepo || "",
          iconLight: project.iconLight || "",
          iconDark: project.iconDark || "",
          techStack: project.techStack || [],
          images: project.images || [],
          startDate:
            project.startDate || new Date().toISOString().split("T")[0],
        });
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async () => {
    setSaving(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        githubRepo: formData.githubRepo || undefined,
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
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="githubRepo" className="text-xs">
                  GitHub Repository
                </Label>
                <Input
                  id="githubRepo"
                  type="url"
                  value={formData.githubRepo}
                  onChange={(e) =>
                    setFormData({ ...formData, githubRepo: e.target.value })
                  }
                  placeholder="https://github.com/..."
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
    </div>
  );
}
