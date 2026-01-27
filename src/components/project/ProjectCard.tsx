import { useNavigate } from "react-router-dom";
import type { Project } from "../../db/schema";
import { getTechByName } from "../../lib/tech-list";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  Github,
  Calendar,
  Trash2,
  Edit,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

interface ProjectCardProps {
  project: Project;
  onDelete: (id: number) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();

  const renderProjectIcon = () => {
    const hasIcons = project.iconLight || project.iconDark;

    if (!hasIcons) {
      return (
        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
          <FolderKanban className="h-6 w-6 text-muted-foreground" />
        </div>
      );
    }

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

  return (
    <Card
      className="group flex flex-col hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {renderProjectIcon()}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
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
        {project.projectLink && (
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  if (project.projectLink) {
                    window.open(project.projectLink, "_blank");
                  }
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Visit Project</p>
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
                onDelete(project.id);
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
  );
}
