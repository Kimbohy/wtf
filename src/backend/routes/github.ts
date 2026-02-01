import { Elysia, t } from "elysia";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import nodeFetch from "node-fetch";
import type { RequestInit } from "node-fetch";
import https from "https";

/**
 * GitHub OAuth Routes
 *
 * Setup instructions:
 * 1. Create a GitHub OAuth App at https://github.com/settings/developers
 * 2. Set Authorization callback URL to: http://localhost:3000/api/github/callback
 * 3. Copy Client ID and Client Secret
 * 4. Set environment variables: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
 */

const REDIRECT_URI = "http://localhost:3000/api/github/callback";

// Create HTTPS agent with IPv4 preference to avoid ETIMEDOUT issues
const httpsAgent = new https.Agent({
  family: 4, // Force IPv4
  timeout: 15000,
});

// Type definitions
interface GitHubTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  default_branch: string;
  updated_at: string;
  html_url: string;
  private: boolean;
}

interface GitHubCommit {
  commit: {
    author: {
      date: string;
    };
  };
}

// Use node-fetch with custom agent
async function fetchGitHub(url: string, options: RequestInit = {}) {
  return nodeFetch(url, {
    ...options,
    agent: httpsAgent,
  });
}

export const githubRoutes = new Elysia({ prefix: "/github" })
  /**
   * Get GitHub OAuth authorization URL
   */
  .get("/auth-url", () => {
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

    if (!GITHUB_CLIENT_ID) {
      return {
        error:
          "GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID environment variable.",
      };
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "repo user", // Access to repos (including private) and user info
    });

    return {
      url: `https://github.com/login/oauth/authorize?${params.toString()}`,
    };
  })

  /**
   * OAuth callback endpoint
   */
  .get(
    "/callback",
    async ({ query }) => {
      console.log("[GitHub OAuth] Callback triggered", query);

      const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
      const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

      const { code, error } = query;

      if (error) {
        console.error("[GitHub OAuth] Authorization error:", error);
        return new Response(
          `<html><body><h1>Authorization failed: ${error}</h1><script>window.close()</script></body></html>`,
          { headers: { "Content-Type": "text/html" } },
        );
      }

      if (!code) {
        console.error("[GitHub OAuth] No code provided");
        return new Response(
          "<html><body><h1>Invalid request: No code</h1><script>window.close()</script></body></html>",
          { headers: { "Content-Type": "text/html" } },
        );
      }

      if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        console.error("[GitHub OAuth] Missing client credentials");
        return new Response(
          "<html><body><h1>Server configuration error</h1><script>window.close()</script></body></html>",
          { headers: { "Content-Type": "text/html" } },
        );
      }

      try {
        console.log("[GitHub OAuth] Exchanging code for token...");
        // Exchange code for access token
        const tokenResponse = await fetchGitHub(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: GITHUB_CLIENT_ID,
              client_secret: GITHUB_CLIENT_SECRET,
              code,
              redirect_uri: REDIRECT_URI,
            }),
          },
        );

        const tokenData = (await tokenResponse.json()) as GitHubTokenResponse;
        console.log("[GitHub OAuth] Token response received");

        if (tokenData.error) {
          console.error("[GitHub OAuth] Token error:", tokenData);
          throw new Error(tokenData.error_description || tokenData.error);
        }

        const accessToken = tokenData.access_token;

        if (!accessToken) {
          console.error("[GitHub OAuth] No access token in response");
          throw new Error("No access token received");
        }

        console.log("[GitHub OAuth] Access token received, fetching user...");
        // Get user info
        const userResponse = await fetchGitHub("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        const userData = (await userResponse.json()) as GitHubUser;
        console.log("[GitHub OAuth] User data received:", userData.login);

        // Store token in database
        console.log("[GitHub OAuth] Saving to database...");
        const existingSetting = await db
          .select()
          .from(settings)
          .where(eq(settings.key, "github_token"))
          .get();

        if (existingSetting) {
          db.update(settings)
            .set({
              value: accessToken,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(settings.key, "github_token"))
            .run();
        } else {
          db.insert(settings)
            .values({
              key: "github_token",
              value: accessToken,
            })
            .run();
        }

        // Store user info
        const existingUser = await db
          .select()
          .from(settings)
          .where(eq(settings.key, "github_user"))
          .get();

        const userInfo = JSON.stringify({
          login: userData.login,
          name: userData.name,
          avatar_url: userData.avatar_url,
          email: userData.email,
        });

        if (existingUser) {
          db.update(settings)
            .set({
              value: userInfo,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(settings.key, "github_user"))
            .run();
        } else {
          db.insert(settings)
            .values({
              key: "github_user",
              value: userInfo,
            })
            .run();
        }

        console.log("[GitHub OAuth] Successfully stored credentials");

        return new Response(
          `<html>
            <head>
              <style>
                body { font-family: system-ui; padding: 40px; text-align: center; }
                h1 { color: #22c55e; }
              </style>
            </head>
            <body>
              <h1>✅ GitHub Connected Successfully!</h1>
              <p>Welcome, ${userData.name || userData.login}!</p>
              <p>You can now close this window.</p>
              <script>
                setTimeout(() => window.close(), 2000);
              </script>
            </body>
          </html>`,
          { headers: { "Content-Type": "text/html" } },
        );
      } catch (err: any) {
        console.error("[GitHub OAuth] Error:", err);

        let errorMessage = err.message;
        let errorDetails = "";

        if (err.name === "AbortError") {
          errorMessage = "Request timed out";
          errorDetails =
            "Could not connect to GitHub. This might be due to network/firewall issues.";
        } else if (err.cause?.code === "ETIMEDOUT") {
          errorMessage = "Connection timeout";
          errorDetails =
            "Cannot reach GitHub servers. Please check your network connection and firewall settings.";
        } else if (err.message.includes("fetch failed")) {
          errorMessage = "Network error";
          errorDetails =
            "Cannot connect to GitHub. If you're behind a proxy, you may need to configure HTTP_PROXY environment variable.";
        }

        return new Response(
          `<html>
            <head>
              <style>
                body { font-family: system-ui; padding: 40px; text-align: center; background: #1f2937; color: white; }
                h1 { color: #ef4444; }
                .details { background: #374151; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: left; }
                .help { background: #1e3a8a; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
                code { background: #000; padding: 2px 6px; border-radius: 3px; }
              </style>
            </head>
            <body>
              <h1>❌ Connection Error</h1>
              <p><strong>${errorMessage}</strong></p>
              ${errorDetails ? `<p>${errorDetails}</p>` : ""}
              
              <div class="details">
                <strong>Technical details:</strong><br>
                ${err.stack?.split("\n").slice(0, 3).join("<br>") || err.message}
              </div>
              
              <div class="help">
                <strong>💡 Possible solutions:</strong><br>
                • Check your internet connection<br>
                • Disable VPN/proxy temporarily<br>
                • Check firewall settings<br>
                • If behind a corporate proxy, set <code>HTTP_PROXY</code> environment variable<br>
                • Try again in a few moments
              </div>
              
              <script>setTimeout(() => window.close(), 10000)</script>
            </body>
          </html>`,
          { headers: { "Content-Type": "text/html" } },
        );
      }
    },
    {
      query: t.Object({
        code: t.Optional(t.String()),
        error: t.Optional(t.String()),
      }),
    },
  )

  /**
   * Get GitHub connection status and user info
   */
  .get("/status", async () => {
    const tokenSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "github_token"))
      .get();

    const userSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "github_user"))
      .get();

    if (!tokenSetting?.value) {
      return {
        connected: false,
        user: null,
      };
    }

    const user = userSetting?.value ? JSON.parse(userSetting.value) : null;

    return {
      connected: true,
      user,
    };
  })

  /**
   * Get stored GitHub token
   */
  .get("/token", async () => {
    const tokenSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "github_token"))
      .get();

    return {
      token: tokenSetting?.value || null,
    };
  })

  /**
   * Disconnect GitHub (remove token)
   */
  .delete("/disconnect", async () => {
    db.delete(settings).where(eq(settings.key, "github_token")).run();

    db.delete(settings).where(eq(settings.key, "github_user")).run();

    return {
      success: true,
      message: "GitHub disconnected successfully",
    };
  })

  /**
   * Search user repositories
   */
  .get("/search-repos", async ({ query }) => {
    const { q } = query;

    // Get token
    const tokenSetting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "github_token"))
      .get();

    if (!tokenSetting?.value) {
      return {
        error: "Not authenticated. Please connect your GitHub account first.",
        repos: [],
      };
    }

    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "WTF-App",
      Authorization: `Bearer ${tokenSetting.value}`,
    };

    try {
      // Fetch all user repos (paginated)
      const repos: GitHubRepo[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const response = await fetchGitHub(
          `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`,
          { headers },
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch repositories: ${response.statusText}`,
          );
        }

        const data = (await response.json()) as GitHubRepo[];
        repos.push(...data);

        // If we got less than perPage results, we've reached the end
        if (data.length < perPage) break;
        page++;
      }

      // Filter repos by search query if provided
      let filteredRepos = repos;
      if (q && q.trim()) {
        const searchTerm = q.toLowerCase().trim();
        filteredRepos = repos.filter(
          (repo) =>
            repo.name.toLowerCase().includes(searchTerm) ||
            repo.description?.toLowerCase().includes(searchTerm),
        );
      }

      return {
        repos: filteredRepos.map((repo) => ({
          name: repo.name,
          fullName: `${repo.html_url.split("/").slice(-2).join("/")}`,
          description: repo.description,
          url: repo.html_url,
          private: repo.private,
          language: repo.language,
          stars: repo.stargazers_count,
          updatedAt: repo.updated_at,
        })),
      };
    } catch (err: any) {
      return {
        error: err.message,
        repos: [],
      };
    }
  })

  /**
   * Fetch repository information from GitHub (with commit history)
   */
  .post(
    "/fetch-repo",
    async ({ body }) => {
      const { url } = body as { url: string };

      // Parse GitHub URL
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return {
          error: "Invalid GitHub URL",
        };
      }

      const [, owner, repo] = match;
      const repoName = repo.replace(/\.git$/, "");

      // Get token
      const tokenSetting = await db
        .select()
        .from(settings)
        .where(eq(settings.key, "github_token"))
        .get();

      console.log("[GitHub] Token found:", !!tokenSetting?.value);

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "WTF-App",
      };

      if (tokenSetting?.value) {
        headers.Authorization = `Bearer ${tokenSetting.value}`;
        console.log("[GitHub] Using authenticated request");
      } else {
        console.log("[GitHub] Using unauthenticated request");
      }

      try {
        console.log(`[GitHub] Fetching repo: ${owner}/${repoName}`);
        // Fetch repo info
        const repoResponse = await fetchGitHub(
          `https://api.github.com/repos/${owner}/${repoName}`,
          { headers },
        );

        console.log(`[GitHub] Response status: ${repoResponse.status}`);

        if (!repoResponse.ok) {
          const error = (await repoResponse.json().catch(() => ({}))) as any;
          console.error("[GitHub] Error:", error);
          throw new Error(
            error.message ||
              `Failed to fetch repository: ${repoResponse.statusText}`,
          );
        }

        const repoData = (await repoResponse.json()) as GitHubRepo;

        console.log(`[GitHub] Successfully fetched: ${repoData.name}`);

        // Fetch commit statistics
        // Get total commit count from API
        const commitsResponse = await fetchGitHub(
          `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`,
          { headers },
        );

        let commitCount = 0;
        let firstCommit: string | null = null;
        let lastCommit: string | null = null;

        if (commitsResponse.ok) {
          // Get commit count from Link header
          const linkHeader = commitsResponse.headers.get("Link");
          if (linkHeader) {
            const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (lastPageMatch) {
              commitCount = parseInt(lastPageMatch[1], 10);
            }
          }

          // Get latest commit
          const latestCommits =
            (await commitsResponse.json()) as GitHubCommit[];
          if (latestCommits[0]) {
            lastCommit = latestCommits[0].commit.author.date;
          }

          // Fetch first commit (oldest)
          const firstCommitResponse = await fetchGitHub(
            `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1&sha=${repoData.default_branch}`,
            { headers },
          );

          if (firstCommitResponse.ok) {
            // Get the last page to find the first commit
            const firstCommitLinkHeader =
              firstCommitResponse.headers.get("Link");
            if (firstCommitLinkHeader) {
              const lastPageMatch = firstCommitLinkHeader.match(
                /page=(\d+)>; rel="last"/,
              );
              if (lastPageMatch) {
                const lastPage = parseInt(lastPageMatch[1], 10);
                const oldestCommitsResponse = await fetchGitHub(
                  `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1&page=${lastPage}&sha=${repoData.default_branch}`,
                  { headers },
                );
                if (oldestCommitsResponse.ok) {
                  const oldestCommits =
                    (await oldestCommitsResponse.json()) as GitHubCommit[];
                  if (oldestCommits[0]) {
                    firstCommit = oldestCommits[0].commit.author.date;
                  }
                }
              }
            } else {
              // Single page of commits, first = last
              if (latestCommits[0]) {
                firstCommit = latestCommits[0].commit.author.date;
                commitCount = 1;
              }
            }
          }
        }

        return {
          name: repoData.name,
          description: repoData.description,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          openIssues: repoData.open_issues_count,
          language: repoData.language,
          defaultBranch: repoData.default_branch,
          firstCommit: firstCommit || null,
          lastCommit: lastCommit || repoData.updated_at,
          commitCount: commitCount,
          url: repoData.html_url,
          private: repoData.private,
        };
      } catch (err: any) {
        return {
          error: err.message,
        };
      }
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  );
