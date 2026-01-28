import { useState, useEffect } from "react";
import { Search, Loader2, Github, Lock, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

interface Repo {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  private: boolean;
  language: string | null;
  stars: number;
  updatedAt: string;
}

interface RepoSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectRepo: (repoUrl: string) => void;
  isConnected: boolean;
  onConnect: () => void;
}

export function RepoSearchDialog({
  open,
  onOpenChange,
  onSelectRepo,
  isConnected,
  onConnect,
}: RepoSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all repos when dialog opens and user is connected
  useEffect(() => {
    if (open && isConnected) {
      fetchRepos();
    }
  }, [open, isConnected]);

  // Filter repos locally when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRepos(repos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(query) ||
          repo.description?.toLowerCase().includes(query),
      );
      setFilteredRepos(filtered);
    }
  }, [searchQuery, repos]);

  const fetchRepos = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:3000/api/github/search-repos",
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setRepos([]);
      } else {
        setRepos(data.repos || []);
        setFilteredRepos(data.repos || []);
      }
    } catch (err: any) {
      setError("Failed to fetch repositories");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRepo = (repo: Repo) => {
    onSelectRepo(repo.url);
    setSearchQuery(""); // Clear search
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl! max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Search GitHub Repositories
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Select a repository to auto-fill project details"
              : "Connect your GitHub account to search repositories"}
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Button onClick={onConnect} className="w-full max-w-sm">
              <Github className="mr-2 h-4 w-4" />
              Connect GitHub
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <InputGroup>
              <InputGroupAddon>
                <Search className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=""
              />
            </InputGroup>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && filteredRepos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No repositories found"
                  : "No repositories available"}
              </div>
            )}

            {!isLoading && !error && filteredRepos.length > 0 && (
              <ScrollArea className="h-96 rounded-md border">
                <div className="p-2 space-y-2">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.url}
                      onClick={() => handleSelectRepo(repo)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {repo.private ? (
                              <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            ) : (
                              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {repo.name}
                            </span>
                          </div>
                          {repo.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {repo.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {repo.language && (
                              <Badge variant="secondary" className="text-xs">
                                {repo.language}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              ⭐ {repo.stars}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
