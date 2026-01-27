import type { Project } from "../../db/schema";
import { FolderKanban } from "lucide-react";

interface ProjectIconProps {
  project: Project;
  size?: "sm" | "md" | "lg";
}

export function ProjectIcon({ project, size = "md" }: ProjectIconProps) {
  const hasIcons = project.iconLight || project.iconDark;

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "w-full h-full max-w-50 max-h-50",
    lg: "h-24 w-24",
  };

  if (!hasIcons) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-muted flex items-center justify-center`}
      >
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
        alt={`${project.name} Icon`}
        className={`${sizeClasses[size]} rounded-xl object-contain dark:hidden`}
      />
      <img
        src={darkIcon!}
        alt={`${project.name} Icon`}
        className={`${sizeClasses[size]} rounded-xl object-contain hidden dark:block`}
      />
    </>
  );
}
