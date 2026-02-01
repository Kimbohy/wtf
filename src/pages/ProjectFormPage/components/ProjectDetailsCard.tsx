import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { ButtonGroup } from "../../../components/ui/button-group";
import { Calendar } from "../../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import {
  Github,
  RefreshCw,
  Search,
  Download,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import type { ProjectFormData } from "../hooks/useProjectForm";

interface ProjectDetailsCardProps {
  formData: ProjectFormData;
  onChange: (data: Partial<ProjectFormData>) => void;
  isEditing: boolean;
  githubConnected: boolean;
  fetchingGithub: boolean;
  hasSuccessfulFetch: boolean;
  onGithubAuthOpen: () => void;
  onRepoSearchOpen: () => void;
  onFetchGithubInfo: () => void;
}

export function ProjectDetailsCard({
  formData,
  onChange,
  isEditing,
  githubConnected,
  fetchingGithub,
  hasSuccessfulFetch,
  onGithubAuthOpen,
  onRepoSearchOpen,
  onFetchGithubInfo,
}: ProjectDetailsCardProps) {
  const updateGithubRepo = (index: number, value: string) => {
    const newRepos = [...formData.githubRepos];
    newRepos[index] = value;
    onChange({ githubRepos: newRepos });
  };

  const removeGithubRepo = (index: number) => {
    if (formData.githubRepos.length === 1) {
      onChange({ githubRepos: [""] });
    } else {
      const newRepos = formData.githubRepos.filter((_, i) => i !== index);
      onChange({ githubRepos: newRepos });
    }
  };

  const addGithubRepo = () => {
    onChange({ githubRepos: [...formData.githubRepos, ""] });
  };

  return (
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
                  formData.startDate ? new Date(formData.startDate) : undefined
                }
                onSelect={(date) =>
                  onChange({
                    startDate: date ? date.toISOString().split("T")[0] : "",
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
              onClick={onGithubAuthOpen}
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
                      onClick={onRepoSearchOpen}
                      title="Search repositories"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  )}
                  <Input
                    type="url"
                    value={repo}
                    onChange={(e) => updateGithubRepo(index, e.target.value)}
                    placeholder="https://github.com/..."
                    className={`h-9 ${!isEditing ? "rounded-none border-l-0" : "rounded-r-none"}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0 rounded-none border-l-0"
                    onClick={onFetchGithubInfo}
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
                  onClick={() => removeGithubRepo(index)}
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
                formData.githubRepos[formData.githubRepos.length - 1].trim() ===
                ""
              }
              onClick={addGithubRepo}
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
            onChange={(e) => onChange({ projectLink: e.target.value })}
            placeholder="https://myproject.com"
            className="h-9"
          />
        </div>
      </CardContent>
    </Card>
  );
}
