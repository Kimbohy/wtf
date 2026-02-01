import { useTheme } from "../../components/theme-provider";
import { IconUploadCard } from "../../components/project/IconUploadCard";
import { TechStackSelector } from "../../components/project/TechStackSelector";
import { ProjectImagesUpload } from "../../components/project/ProjectImagesUpload";
import { RepoSearchDialog } from "../../components/project/RepoSearchDialog";
import { LoadingSpinner } from "../../components/shared/LoadingSpinner";
import { GitHubAuthDialog } from "../../components/shared/GitHubAuthDialog";

import { useProjectForm } from "./hooks/useProjectForm";
import { FormHeader } from "./components/FormHeader";
import { ProjectBasicInfoCard } from "./components/ProjectBasicInfoCard";
import { ProjectDetailsCard } from "./components/ProjectDetailsCard";

export function ProjectFormPage() {
  const { theme } = useTheme();
  const {
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
    handleSaveProject,
    handleTechToggle,
    handleIconUpload,
    handleIconDrag,
    handleIconDrop,
    handleImagesDrag,
    handleImagesDrop,
    handleImagesUpload,
    removeImage,
    handleIconDelete,
    handleCopyIcon,
    handleSelectRepo,
    handleFetchGithubInfo,
    checkGithubConnection,
    navigate,
  } = useProjectForm(theme);

  if (loading) {
    return <LoadingSpinner message="Loading project..." />;
  }

  const handleFormChange = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-background">
      <FormHeader
        isEditing={isEditing}
        saving={saving}
        canSave={!!formData.name}
        onNavigateBack={() => navigate("/")}
        onSave={handleSaveProject}
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

          <ProjectBasicInfoCard
            formData={formData}
            onChange={handleFormChange}
          />

          <ProjectDetailsCard
            formData={formData}
            onChange={handleFormChange}
            isEditing={isEditing}
            githubConnected={githubConnected}
            fetchingGithub={fetchingGithub}
            hasSuccessfulFetch={hasSuccessfulFetch}
            onGithubAuthOpen={() => setGithubAuthOpen(true)}
            onRepoSearchOpen={() => setRepoSearchOpen(true)}
            onFetchGithubInfo={handleFetchGithubInfo}
          />

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
