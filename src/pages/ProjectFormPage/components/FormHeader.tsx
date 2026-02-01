import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { PageHeader } from "../../../components/shared/PageHeader";
import { ArrowLeft, Save, X, FolderKanban } from "lucide-react";

interface FormHeaderProps {
  isEditing: boolean;
  saving: boolean;
  canSave: boolean;
  onNavigateBack: () => void;
  onSave: () => void;
}

export function FormHeader({
  isEditing,
  saving,
  canSave,
  onNavigateBack,
  onSave,
}: FormHeaderProps) {
  return (
    <PageHeader
      leftContent={
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNavigateBack}
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
            onClick={onNavigateBack}
            disabled={saving}
            className="hidden sm:flex"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={!canSave || saving}>
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
  );
}
