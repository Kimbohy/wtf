/**
 * GitHub API Client
 * Handles GitHub REST API interactions
 */

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  html_url: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

export class GitHubClient {
  private baseUrl = "https://api.github.com";
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `GitHub API error: ${response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Get authenticated user information
   */
  async getUser(): Promise<GitHubUser> {
    return this.request<GitHubUser>("/user");
  }

  /**
   * Get repository information
   * @param owner - Repository owner (username or organization)
   * @param repo - Repository name
   */
  async getRepo(owner: string, repo: string): Promise<GitHubRepo> {
    return this.request<GitHubRepo>(`/repos/${owner}/${repo}`);
  }

  /**
   * Get repository information from URL
   * @param url - GitHub repository URL (https://github.com/owner/repo)
   */
  async getRepoFromUrl(url: string): Promise<GitHubRepo> {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error("Invalid GitHub URL");
    }
    const [, owner, repo] = match;
    return this.getRepo(owner, repo.replace(/\.git$/, ""));
  }

  /**
   * Get commits from a repository
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param options - Query options
   */
  async getCommits(
    owner: string,
    repo: string,
    options: {
      branch?: string;
      per_page?: number;
      page?: number;
    } = {},
  ): Promise<GitHubCommit[]> {
    const params = new URLSearchParams();
    if (options.branch) params.append("sha", options.branch);
    if (options.per_page)
      params.append("per_page", options.per_page.toString());
    if (options.page) params.append("page", options.page.toString());

    const query = params.toString();
    return this.request<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits${query ? `?${query}` : ""}`,
    );
  }

  /**
   * Get latest commit from a repository
   */
  async getLatestCommit(
    owner: string,
    repo: string,
    branch?: string,
  ): Promise<GitHubCommit> {
    const commits = await this.getCommits(owner, repo, {
      branch,
      per_page: 1,
    });
    return commits[0];
  }

  /**
   * Parse owner and repo from GitHub URL
   */
  static parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
    };
  }
}

// Export singleton instance
export const githubClient = new GitHubClient();
