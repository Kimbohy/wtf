export type TechType =
  | "language"
  | "framework"
  | "database"
  | "tools"
  | "library"
  | "auth";

export const techTypeLabels: Record<TechType, string> = {
  language: "Languages",
  framework: "Frameworks",
  database: "Databases",
  tools: "Tools",
  library: "Libraries",
  auth: "Authentication",
};

export interface Tech {
  tech: string;
  name: string;
  desc: string;
  link: string;
  type: TechType;
  icon: string; // Path to icon file
}

const techList: Tech[] = [
  {
    tech: "angular",
    name: "Angular",
    desc: "A JavaScript framework for building web applications.",
    link: "https://angular.dev/",
    type: "framework",
    icon: "/src/assets/icons/angular.svg",
  },
  {
    tech: "bash",
    name: "Bash",
    desc: "A Unix shell and command language.",
    link: "https://www.gnu.org/software/bash/",
    type: "tools",
    icon: "/src/assets/icons/bash.svg",
  },
  {
    tech: "better-auth",
    name: "Better Auth",
    desc: "An authentication library for TypeScript.",
    link: "https://www.better-auth.com/",
    type: "auth",
    icon: "/src/assets/icons/better-auth.svg",
  },
  {
    tech: "bun",
    name: "Bun",
    desc: "A fast all-in-one JavaScript runtime.",
    link: "https://bun.sh/",
    type: "framework",
    icon: "/src/assets/icons/bun.svg",
  },
  {
    tech: "c",
    name: "C",
    desc: "A general-purpose programming language.",
    link: "https://en.wikipedia.org/wiki/C_(programming_language)",
    type: "language",
    icon: "/src/assets/icons/c.svg",
  },
  {
    tech: "chartjs",
    name: "Chart.js",
    desc: "A simple and flexible JavaScript charting library",
    link: "https://www.chartjs.org/",
    type: "library",
    icon: "/src/assets/icons/chartjs.svg",
  },
  {
    tech: "csharp",
    name: "C#",
    desc: "A modern, object-oriented programming language developed by Microsoft.",
    link: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    type: "language",
    icon: "/src/assets/icons/csharp.svg",
  },
  {
    tech: "cpp",
    name: "C++",
    desc: "A general-purpose programming language with performance in mind.",
    link: "https://en.cppreference.com/w/",
    type: "language",
    icon: "/src/assets/icons/cpp.svg",
  },
  {
    tech: "css",
    name: "CSS",
    desc: "Style sheet language used for describing the presentation of a document.",
    link: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    type: "language",
    icon: "/src/assets/icons/css.svg",
  },
  {
    tech: "elysia",
    name: "Elysia",
    desc: "A web framework for building fast and scalable applications.",
    link: "https://elysiajs.com/",
    type: "framework",
    icon: "/src/assets/icons/elysia.svg",
  },
  {
    tech: "express",
    name: "Express",
    desc: "Fast, unopinionated, minimalist web framework for Node.js.",
    link: "https://expressjs.com/",
    type: "framework",
    icon: "/src/assets/icons/express.svg",
  },
  {
    tech: "figma",
    name: "Figma",
    desc: "A web-based design tool for UI/UX collaboration.",
    link: "https://www.figma.com/",
    type: "tools",
    icon: "/src/assets/icons/figma.svg",
  },
  {
    tech: "git",
    name: "Git",
    desc: "A distributed version-control system for tracking changes.",
    link: "https://git-scm.com/",
    type: "tools",
    icon: "/src/assets/icons/git.svg",
  },
  {
    tech: "github",
    name: "GitHub",
    desc: "A platform for hosting and reviewing code, managing projects, and building software.",
    link: "https://github.com/",
    type: "tools",
    icon: "/src/assets/icons/github.svg",
  },
  {
    tech: "html",
    name: "HTML",
    desc: "The standard markup language for documents designed to be displayed in a web browser.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    type: "language",
    icon: "/src/assets/icons/html.svg",
  },
  {
    tech: "java",
    name: "Java",
    desc: "A class-based, object-oriented programming language.",
    link: "https://www.java.com/",
    type: "language",
    icon: "/src/assets/icons/java.svg",
  },
  {
    tech: "javascript",
    name: "JavaScript",
    desc: "A high-level, often just-in-time compiled, and multi-paradigm programming language.",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    type: "language",
    icon: "/src/assets/icons/javascript.svg",
  },
  {
    tech: "lucide",
    name: "Lucide",
    desc: "A simple, consistent icon library.",
    link: "https://lucide.dev/",
    type: "library",
    icon: "/src/assets/icons/lucide.svg",
  },
  {
    tech: "mongodb",
    name: "MongoDB",
    desc: "A document-oriented NoSQL database.",
    link: "https://www.mongodb.com/",
    type: "database",
    icon: "/src/assets/icons/mongodb.svg",
  },
  {
    tech: "motion",
    name: "Motion",
    desc: "A production-grade animation library for the web.",
    link: "https://motion.dev/",
    type: "library",
    icon: "/src/assets/icons/motion.svg",
  },
  {
    tech: "mysql",
    name: "MySQL",
    desc: "An open-source relational database management system.",
    link: "https://www.mysql.com/",
    type: "database",
    icon: "/src/assets/icons/mysql.svg",
  },
  {
    tech: "nestjs",
    name: "NestJS",
    desc: "A progressive Node.js framework for building efficient, reliable and scalable server-side applications.",
    link: "https://nestjs.com/",
    type: "framework",
    icon: "/src/assets/icons/nestjs.svg",
  },
  {
    tech: "nextAuth",
    name: "NextAuth.js",
    desc: "Authentication for Next.js applications.",
    link: "https://next-auth.js.org/",
    type: "auth",
    icon: "/src/assets/icons/nextAuth.svg",
  },
  {
    tech: "nextjs",
    name: "Next.js",
    desc: "The React framework for production.",
    link: "https://nextjs.org/",
    type: "framework",
    icon: "/src/assets/icons/nextjs.svg",
  },
  {
    tech: "nodejs",
    name: "Node.js",
    desc: "A JavaScript runtime built on Chrome's V8 JavaScript engine.",
    link: "https://nodejs.org/",
    type: "framework",
    icon: "/src/assets/icons/nodejs.svg",
  },
  {
    tech: "nuqs",
    name: "Nuqs",
    desc: "Type-safe search params state manager for React.",
    link: "https://nuqs.dev/",
    type: "library",
    icon: "/src/assets/icons/nuqs.svg",
  },
  {
    tech: "php",
    name: "PHP",
    desc: "A popular general-purpose scripting language especially suited to web development.",
    link: "https://www.php.net/",
    type: "language",
    icon: "/src/assets/icons/php.svg",
  },
  {
    tech: "pnpm",
    name: "pnpm",
    desc: "A fast, disk space efficient package manager.",
    link: "https://pnpm.io/",
    type: "tools",
    icon: "/src/assets/icons/pnpm.svg",
  },
  {
    tech: "postgreSQL",
    name: "PostgreSQL",
    desc: "A powerful, open source object-relational database system.",
    link: "https://www.postgresql.org/",
    type: "database",
    icon: "/src/assets/icons/postgreSQL.svg",
  },
  {
    tech: "powershell",
    name: "PowerShell",
    desc: "A task automation and configuration management framework from Microsoft.",
    link: "https://learn.microsoft.com/powershell/",
    type: "tools",
    icon: "/src/assets/icons/powershell.svg",
  },
  {
    tech: "prisma",
    name: "Prisma ORM",
    desc: "A next-generation ORM for Node.js and TypeScript.",
    link: "https://www.prisma.io/docs/orm",
    type: "database",
    icon: "/src/assets/icons/prisma.svg",
  },
  {
    tech: "react",
    name: "React",
    desc: "A JavaScript library for building user interfaces.",
    link: "https://react.dev/",
    type: "library",
    icon: "/src/assets/icons/react.svg",
  },
  {
    tech: "redis",
    name: "Redis",
    desc: "An in-memory data structure store used as a database, cache and message broker.",
    link: "https://redis.io/",
    type: "database",
    icon: "/src/assets/icons/redis.svg",
  },
  {
    tech: "shadcn-ui",
    name: "shadcn/ui",
    desc: "A component library for building user interfaces.",
    link: "https://ui.shadcn.com/",
    type: "library",
    icon: "/src/assets/icons/shadcn-ui.svg",
  },
  {
    tech: "socket.io",
    name: "Socket.IO",
    desc: "A library that enables low-latency, bidirectional and event-based communication.",
    link: "https://socket.io/",
    type: "library",
    icon: "/src/assets/icons/socket.io.svg",
  },
  {
    tech: "tailwindcss",
    name: "Tailwind CSS",
    desc: "A utility-first CSS framework for rapidly building custom user interfaces.",
    link: "https://tailwindcss.com/",
    type: "library",
    icon: "/src/assets/icons/tailwindcss.svg",
  },
  {
    tech: "typescript",
    name: "TypeScript",
    desc: "A typed superset of JavaScript that makes JavaScript my favorite language.",
    link: "https://www.typescriptlang.org/",
    type: "language",
    icon: "/src/assets/icons/typescript.svg",
  },
  {
    tech: "webrtc",
    name: "WebRTC",
    desc: "An open framework for the web that enables Real-Time Communications (RTC).",
    link: "https://webrtc.org/",
    type: "library",
    icon: "/src/assets/icons/webrtc.svg",
  },
  {
    tech: "dotnet",
    name: ".NET",
    desc: "A free, open-source, cross-platform framework for building modern apps and powerful cloud services.",
    link: "https://dotnet.microsoft.com/",
    type: "framework",
    icon: "/src/assets/icons/dotnet.svg",
  },
  {
    tech: "yarn",
    name: "Yarn",
    desc: "A fast, reliable, and secure dependency management tool.",
    link: "https://yarnpkg.com/",
    type: "tools",
    icon: "/src/assets/icons/yarn.svg",
  },
];

export default techList;

export function getTechByName(techName: string): Tech | undefined {
  const tech = techList.find((t) => t.tech === techName);
  if (!tech) {
    console.warn(`Tech with name "${techName}" not found.`);
    return undefined;
  }
  return tech;
}

export function getTechsByType(type: TechType): Tech[] {
  return techList.filter((t) => t.type === type);
}

export function getAllTechNames(): string[] {
  return techList.map((t) => t.tech);
}
