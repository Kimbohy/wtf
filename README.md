# WTF - What To Finish

**WTF** stands for **WTF To Finish** - a modern Electron-based desktop application to track and manage all your projects in one centralized place.

## 🎯 Project Overview

WTF is designed to help developers organize and monitor their various projects by displaying:

- Project names and descriptions
- Technology stack/tech used
- Project icons
- Start dates
- Last modification dates
- GitHub repository links
- GitHub statistics (stars, forks, last commit, open issues)

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** (with base-ui) - Component library

### Backend

- **Elysia.js** - Fast web framework for Bun/Node.js
- **Eden Treaty** - End-to-end type safety between frontend and backend
- **Node.js** - Runtime (for Electron compatibility)

### Database

- **Drizzle ORM** - Type-safe SQL toolkit
- **better-sqlite3** - Local SQLite database

### Desktop

- **Electron** - Cross-platform desktop framework
- **electron-builder** - Package and build

### Package Manager

- **pnpm** - Fast, disk space efficient package manager

## 📁 Project Structure

\`\`\`
wtf/
├── src/
│ ├── backend/ # Elysia.js backend server
│ │ ├── index.ts # Main server entry
│ │ └── routes/ # API routes
│ │ └── projects.ts
│ ├── db/ # Database schemas and config
│ │ ├── index.ts # Database connection
│ │ └── schema.ts # Drizzle ORM schemas
│ ├── electron/ # Electron main process
│ │ ├── main.ts # Main process entry
│ │ └── preload.ts # Preload script
│ ├── renderer/ # React frontend
│ │ ├── App.tsx # Main React component
│ │ ├── main.tsx # React entry point
│ │ └── index.css # Global styles
│ ├── lib/ # Shared utilities
│ │ └── api.ts # Eden Treaty API client
│ └── types/ # TypeScript type definitions
│ └── electron.d.ts # Electron type declarations
├── drizzle/ # Database migrations
├── dist/ # Vite build output
├── dist-electron/ # Compiled Electron files
├── release/ # Electron Builder output
├── drizzle.config.ts # Drizzle ORM configuration
├── package.json
├── tsconfig.json # Base TypeScript config
├── tsconfig.electron.json # Electron TypeScript config
├── tsconfig.backend.json # Backend TypeScript config
├── vite.config.ts # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── postcss.config.js # PostCSS configuration
\`\`\`

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10 or higher)

### Installation

\`\`\`bash

# Install dependencies

pnpm install

# Generate database schema

pnpm db:generate

# Push schema to database

pnpm db:push
\`\`\`

### Development

\`\`\`bash

# Run the web development server only (Vite)

pnpm dev

# Run the full Electron app with backend

pnpm dev:electron
\`\`\`

The backend API will run on \`http://localhost:3000\` and the frontend on \`http://localhost:5173\`.

### Database Management

\`\`\`bash

# Generate migrations from schema changes

pnpm db:generate

# Push schema changes to database

pnpm db:push

# Open Drizzle Studio (database GUI)

pnpm db:studio
\`\`\`

### Building for Production

\`\`\`bash

# Build the application

pnpm build

# Build without packaging (for testing)

pnpm build:dir
\`\`\`

The built application will be in the \`release/\` directory.

## 📊 Features

### Current Features

- Display all projects in a clean grid layout
- Show project details (name, description, tech stack)
- Display start dates
- Link to GitHub repositories

### Planned Features

- [ ] Add new projects via UI
- [ ] Edit existing projects
- [ ] Delete projects
- [ ] Fetch GitHub statistics automatically
- [ ] Track last modification dates from GitHub API
- [ ] Search and filter projects
- [ ] Sort projects by various criteria
- [ ] Export/Import projects data
- [ ] Dark/Light theme toggle
- [ ] Project status indicators
- [ ] Integration with more Git providers (GitLab, Bitbucket)

## 🔧 Configuration

### Database

The SQLite database is stored in the user data directory:

- **Linux**: \`~/.config/wtf/wtf.db\`
- **macOS**: \`~/Library/Application Support/wtf/wtf.db\`
- **Windows**: \`%APPDATA%/wtf/wtf.db\`

### API Endpoints

All API endpoints are prefixed with \`/api\`:

- \`GET /api/health\` - Health check
- \`GET /api/projects\` - Get all projects
- \`GET /api/projects/:id\` - Get a specific project
- \`POST /api/projects\` - Create a new project
- \`PUT /api/projects/:id\` - Update a project
- \`DELETE /api/projects/:id\` - Delete a project

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

---

Built with ❤️ using Electron, React, Elysia.js, and Drizzle ORM
