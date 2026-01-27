# GitHub OAuth Setup Guide

This guide will walk you through setting up GitHub OAuth for your WTF application, enabling you to fetch information from private repositories.

## Why GitHub OAuth?

- ✅ Access private repository information
- ✅ Auto-fetch repo stats (stars, forks, commits)
- ✅ Higher API rate limits (5000 requests/hour vs 60 requests/hour)
- ✅ No need to manually update project details
- ✅ Track latest commit information automatically

## Step-by-Step Setup

### 1. Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**
4. Fill in the application details:

   | Field                          | Value                                                |
   | ------------------------------ | ---------------------------------------------------- |
   | **Application name**           | WTF - What To Finish (or your choice)                |
   | **Homepage URL**               | `http://localhost:3000`                              |
   | **Application description**    | Optional: "Desktop app to track and manage projects" |
   | **Authorization callback URL** | `http://localhost:3000/api/github/callback`          |

5. Click **"Register application"**

### 2. Get Your Credentials

After creating the OAuth app:

1. You'll see your **Client ID** on the app page
2. Click **"Generate a new client secret"**
3. Copy both the **Client ID** and **Client Secret** (you won't be able to see the secret again!)

### 3. Configure Environment Variables

1. In your project root, copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor and add your credentials:

   ```bash
   GITHUB_CLIENT_ID=your_actual_client_id_here
   GITHUB_CLIENT_SECRET=your_actual_client_secret_here
   ```

3. Save the file

### 4. Restart the Application

If your development server is running, restart it to load the new environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then start it again
pnpm dev
```

## Using GitHub Integration

### Connecting Your Account

1. Open the WTF application
2. Navigate to **Create New Project** or **Edit Project**
3. In the GitHub Repository section, click **"Connect"**
4. A popup window will open asking you to authorize the app
5. Click **"Authorize"** on GitHub
6. The popup will close automatically and you'll see **"Connected"**

### Fetching Repository Information

Once connected, you can:

1. Enter a GitHub repository URL (e.g., `https://github.com/owner/repo`)
2. Click the **refresh icon** button next to the input
3. The app will automatically fetch:
   - Repository name
   - Description
   - Primary language
   - Star count
   - Fork count
   - Latest commit date
   - And more!

### For Private Repositories

Private repositories require authentication:

1. Make sure you've connected your GitHub account (see above)
2. The OAuth token you receive has the `repo` scope, giving access to all your repositories
3. When you fetch a private repo, it will work automatically if you're the owner or have access

### Disconnecting

To disconnect your GitHub account:

1. Click the **"Connect"** button
2. In the dialog, click **"Disconnect GitHub"**
3. Your token will be removed from the database

## Troubleshooting

### "GitHub OAuth is not configured" Error

**Problem**: You see an error saying OAuth is not configured.

**Solution**:

1. Make sure you've created the `.env` file with your credentials
2. Restart the development server
3. Check that the environment variables are loaded:
   ```bash
   echo $GITHUB_CLIENT_ID  # Should show your client ID
   ```

### "Failed to fetch repository: 404" for Public Repos

**Problem**: Can't fetch public repositories.

**Solution**:

- Public repos don't require authentication
- This might be a network issue or the repository doesn't exist
- Check the URL is correct: `https://github.com/owner/repo`

### "Failed to fetch repository: 404" for Private Repos

**Problem**: Can't fetch your private repository.

**Solution**:

1. Make sure you've connected your GitHub account
2. Verify the repository exists and you have access
3. Check that the OAuth app has the `repo` scope

### OAuth Popup Gets Blocked

**Problem**: The authorization popup doesn't open.

**Solution**:

1. Check your browser's popup blocker settings
2. Allow popups from `localhost`
3. Try clicking the Connect button again

### Token Expired or Invalid

**Problem**: Previously connected but now getting 401 errors.

**Solution**:

1. Disconnect and reconnect your GitHub account
2. This will generate a new token

## Security Notes

🔒 **Security Best Practices**:

- ✅ Never commit `.env` file to version control (it's in `.gitignore`)
- ✅ Never share your Client Secret publicly
- ✅ Tokens are stored in the local SQLite database
- ✅ The OAuth popup runs in a separate window for security
- ✅ You can revoke access anytime from [GitHub Settings → Applications](https://github.com/settings/applications)

## Production Deployment

When deploying to production:

1. Update the OAuth app callback URL:
   - Old: `http://localhost:3000/api/github/callback`
   - New: `https://yourdomain.com/api/github/callback`

2. Create a new OAuth app for production (recommended)
3. Use environment-specific credentials
4. Never hardcode credentials in your source code

## API Rate Limits

| Authentication                  | Rate Limit          |
| ------------------------------- | ------------------- |
| **No token** (unauthenticated)  | 60 requests/hour    |
| **OAuth token** (authenticated) | 5,000 requests/hour |

With OAuth, you get **83x more requests** per hour! 🚀

## Need Help?

- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- Check the console logs for detailed error messages

---

**Happy coding!** 🎉
