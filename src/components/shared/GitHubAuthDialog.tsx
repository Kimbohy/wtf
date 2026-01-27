import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Github, Check, X, Loader2, ExternalLink } from "lucide-react";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

interface GitHubStatusResponse {
  connected: boolean;
  user: GitHubUser | null;
}

interface GitHubAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GitHubAuthDialog({
  open,
  onOpenChange,
}: GitHubAuthDialogProps) {
  const [status, setStatus] = useState<GitHubStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/github/status");
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch GitHub status:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get authorization URL
      const response = await fetch("http://localhost:3000/api/github/auth-url");
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      // Open OAuth window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const authWindow = window.open(
        data.url,
        "GitHub Authorization",
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      // Poll for window close and refresh status
      const pollTimer = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(pollTimer);
          setLoading(false);
          // Refresh status after auth with longer delay to ensure DB commit
          setTimeout(() => fetchStatus(), 1000);
        }
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to connect to GitHub");
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:3000/api/github/disconnect", {
        method: "DELETE",
      });
      await fetchStatus();
    } catch (err: any) {
      setError(err.message || "Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            GitHub Integration
          </DialogTitle>
          <DialogDescription>
            Connect your GitHub account to fetch repository information from
            private repos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              <X className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!status ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : status.connected && status.user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Connected to GitHub
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    You can now fetch data from private repositories
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={status.user.avatar_url}
                    alt={status.user.login}
                  />
                  <AvatarFallback>
                    {status.user.login[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {status.user.name || status.user.login}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{status.user.login}
                  </p>
                  {status.user.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {status.user.email}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Connected
                </Badge>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Disconnect GitHub
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <h4 className="font-medium text-sm">What you'll get:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Access to private repository information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Auto-fetch repo stats (stars, forks, commits)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Track latest commit information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>No need to manually update project details</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                <p className="font-medium mb-1">⚠️ Setup Required</p>
                <p>
                  To use GitHub OAuth, you need to create a GitHub OAuth App and
                  set environment variables. See backend logs for instructions.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs mt-1"
                  onClick={() =>
                    window.open(
                      "https://github.com/settings/developers",
                      "_blank",
                    )
                  }
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Create OAuth App
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={handleConnect}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="h-4 w-4 mr-2" />
                    Connect with GitHub
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
