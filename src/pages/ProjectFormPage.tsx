import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Project } from "../db/schema";
import techList, { getTechByName, techTypeLabels } from "../lib/tech-list";
import type { TechType } from "../lib/tech-list";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import {
  ArrowLeft,
  Save,
  X,
  Loader2,
  FolderKanban,
  Upload,
  ImagePlus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { ThemeToggle } from "../components/theme-toggle";
import { cn } from "../lib/utils";

export function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const iconInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubRepo: "",
    icon: "",
    techStack: [] as string[],
    images: [] as string[],
    startDate: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [iconDragActive, setIconDragActive] = useState(false);
  const [imagesDragActive, setImagesDragActive] = useState(false);

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
          icon: project.icon || "",
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
        icon: formData.icon || undefined,
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
    setFormData((prev) => ({ ...prev, icon: dataUrl }));
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
            <h1 className="text-lg font-semibold truncate">
              {isEditing ? "Edit Project" : "New Project"}
            </h1>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
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
                <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
              ) : (
                <Save className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">
                {isEditing ? "Update" : "Create"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content - Bento Grid Layout */}
      <main className="container max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-6 lg:grid-cols-8 auto-rows-min">
          {/* Project Icon - Compact */}
          <Card className="md:col-span-2 lg:col-span-2">
            <CardContent className="p-4">
              <input
                ref={iconInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleIconUpload(e.target.files)}
                className="hidden"
              />

              {formData.icon ? (
                <div className="relative group">
                  <div className="aspect-square w-full rounded-lg overflow-hidden border-2 border-dashed border-muted bg-muted/30">
                    <img
                      src={formData.icon}
                      alt="Project icon"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-lg">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => iconInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, icon: "" }))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={handleIconDrag}
                  onDragLeave={handleIconDrag}
                  onDragOver={handleIconDrag}
                  onDrop={handleIconDrop}
                  onClick={() => iconInputRef.current?.click()}
                  className={cn(
                    "aspect-square w-full rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                    "flex flex-col items-center justify-center gap-1 text-muted-foreground",
                    "hover:border-primary/50 hover:bg-muted/30",
                    iconDragActive && "border-primary bg-primary/5",
                  )}
                >
                  <Upload className="h-6 w-6" />
                  <span className="text-xs font-medium">Icon</span>
                </div>
              )}
            </CardContent>
          </Card>

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

          {/* Tech Stack - Wide */}
          <Card className="md:col-span-6 lg:col-span-5">
            <CardHeader className="px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Tech Stack</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {formData.techStack.length} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <Tabs defaultValue="language" className="w-full">
                <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0">
                  {(Object.keys(techTypeLabels) as TechType[]).map((type) => (
                    <TabsTrigger
                      key={type}
                      value={type}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-2.5 py-1 text-xs"
                    >
                      {techTypeLabels[type]}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {(Object.keys(techTypeLabels) as TechType[]).map((type) => (
                  <TabsContent key={type} value={type} className="mt-3">
                    <ScrollArea className="h-36 rounded-md border">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1 p-2">
                        {techList
                          .filter((tech) => tech.type === type)
                          .map((tech) => (
                            <label
                              key={tech.tech}
                              className={cn(
                                "flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                                "hover:bg-muted/50",
                                formData.techStack.includes(tech.tech) &&
                                  "bg-primary/10 hover:bg-primary/15",
                              )}
                            >
                              <Checkbox
                                checked={formData.techStack.includes(tech.tech)}
                                onCheckedChange={() =>
                                  handleTechToggle(tech.tech)
                                }
                                className="shrink-0 h-3.5 w-3.5"
                              />
                              <img
                                src={tech.icon}
                                alt={tech.name}
                                className="h-3.5 w-3.5 shrink-0"
                              />
                              <span className="text-xs truncate">
                                {tech.name}
                              </span>
                            </label>
                          ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>

              {/* Selected Preview */}
              {formData.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2 border-t">
                  {formData.techStack.map((techName) => {
                    const tech = getTechByName(techName);
                    return tech ? (
                      <Badge
                        key={tech.tech}
                        variant="secondary"
                        className="gap-1 cursor-pointer hover:bg-destructive/20 text-xs py-0.5 h-6"
                        onClick={() => handleTechToggle(tech.tech)}
                      >
                        <img
                          src={tech.icon}
                          alt={tech.name}
                          className="h-3 w-3"
                        />
                        {tech.name}
                        <X className="h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Images - Wide */}
          <Card className="md:col-span-6 lg:col-span-3">
            <CardHeader className="px-4 py-3">
              <CardTitle className="text-sm">Project Images</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-3">
              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImagesUpload(e.target.files)}
                className="hidden"
              />

              {/* Drop Zone - Compact */}
              <div
                onDragEnter={handleImagesDrag}
                onDragLeave={handleImagesDrag}
                onDragOver={handleImagesDrag}
                onDrop={handleImagesDrop}
                onClick={() => imagesInputRef.current?.click()}
                className={cn(
                  "w-full h-20 rounded-md border-2 border-dashed cursor-pointer transition-colors",
                  "flex items-center justify-center gap-2 text-muted-foreground",
                  "hover:border-primary/50 hover:bg-muted/30",
                  imagesDragActive && "border-primary bg-primary/5",
                )}
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs font-medium">Add images</span>
              </div>

              {/* Image Grid - Compact */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative group aspect-video rounded-md overflow-hidden border bg-muted/30"
                    >
                      <img
                        src={image}
                        alt={`Project image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="h-7 w-7"
                          onClick={() => removeImage(index)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  No images added
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
