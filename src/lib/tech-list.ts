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
  icon: string; // Simple Devicon class name
}

const techList: Tech[] = [
  {
    tech: "angular",
    name: "Angular",
    desc: "A JavaScript framework for building web applications.",
    link: "https://angular.dev/",
    type: "framework",
    icon: "devicon-angular-plain",
  },
  {
    tech: "bash",
    name: "Bash",
    desc: "A Unix shell and command language.",
    link: "https://www.gnu.org/software/bash/",
    type: "tools",
    icon: "devicon-bash-plain",
  },
  {
    tech: "better-auth",
    name: "Better Auth",
    desc: "An authentication library for TypeScript.",
    link: "https://www.better-auth.com/",
    type: "auth",
    icon: "devicon-typescript-plain", // Fallback
  },
  {
    tech: "bun",
    name: "Bun",
    desc: "A fast all-in-one JavaScript runtime.",
    link: "https://bun.sh/",
    type: "framework",
    icon: "devicon-bun-plain",
  },
  {
    tech: "c",
    name: "C",
    desc: "A general-purpose programming language.",
    link: "https://en.wikipedia.org/wiki/C_(programming_language)",
    type: "language",
    icon: "devicon-c-plain",
  },
  {
    tech: "chartjs",
    name: "Chart.js",
    desc: "A simple and flexible JavaScript charting library",
    link: "https://www.chartjs.org/",
    type: "library",
    icon: "devicon-javascript-plain", // Fallback
  },
  {
    tech: "csharp",
    name: "C#",
    desc: "A modern, object-oriented programming language developed by Microsoft.",
    link: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    type: "language",
    icon: "devicon-csharp-plain",
  },
  {
    tech: "cpp",
    name: "C++",
    desc: "A general-purpose programming language with performance in mind.",
    link: "https://en.cppreference.com/w/",
    type: "language",
    icon: "devicon-cplusplus-plain",
  },
  {
    tech: "css",
    name: "CSS",
    desc: "Style sheet language used for describing the presentation of a document.",
    link: "https://developer.mozilla.org/en-US/docs/Web/CSS",
    type: "language",
    icon: "devicon-css3-plain",
  },
  {
    tech: "elysia",
    name: "Elysia",
    desc: "A web framework for building fast and scalable applications.",
    link: "https://elysiajs.com/",
    type: "framework",
    icon: "devicon-typescript-plain", // Fallback
  },
  {
    tech: "express",
    name: "Express",
    desc: "Fast, unopinionated, minimalist web framework for Node.js.",
    link: "https://expressjs.com/",
    type: "framework",
    icon: "devicon-express-original",
  },
  {
    tech: "figma",
    name: "Figma",
    desc: "A web-based design tool for UI/UX collaboration.",
    link: "https://www.figma.com/",
    type: "tools",
    icon: "devicon-figma-plain",
  },
  {
    tech: "git",
    name: "Git",
    desc: "A distributed version-control system for tracking changes.",
    link: "https://git-scm.com/",
    type: "tools",
    icon: "devicon-git-plain",
  },
  {
    tech: "github",
    name: "GitHub",
    desc: "A platform for hosting and reviewing code, managing projects, and building software.",
    link: "https://github.com/",
    type: "tools",
    icon: "devicon-github-original",
  },
  {
    tech: "html",
    name: "HTML",
    desc: "The standard markup language for documents designed to be displayed in a web browser.",
    link: "https://developer.mozilla.org/en-US/docs/Web/HTML",
    type: "language",
    icon: "devicon-html5-plain",
  },
  {
    tech: "java",
    name: "Java",
    desc: "A class-based, object-oriented programming language.",
    link: "https://www.java.com/",
    type: "language",
    icon: "devicon-java-plain",
  },
  {
    tech: "javascript",
    name: "JavaScript",
    desc: "A high-level, often just-in-time compiled, and multi-paradigm programming language.",
    link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    type: "language",
    icon: "devicon-javascript-plain",
  },
  {
    tech: "lucide",
    name: "Lucide",
    desc: "A simple, consistent icon library.",
    link: "https://lucide.dev/",
    type: "library",
    icon: "devicon-react-original", // Fallback
  },
  {
    tech: "mongodb",
    name: "MongoDB",
    desc: "A document-oriented NoSQL database.",
    link: "https://www.mongodb.com/",
    type: "database",
    icon: "devicon-mongodb-plain",
  },
  {
    tech: "motion",
    name: "Motion",
    desc: "A production-grade animation library for the web.",
    link: "https://motion.dev/",
    type: "library",
    icon: "devicon-react-original", // Fallback
  },
  {
    tech: "mysql",
    name: "MySQL",
    desc: "An open-source relational database management system.",
    link: "https://www.mysql.com/",
    type: "database",
    icon: "devicon-mysql-plain",
  },
  {
    tech: "nestjs",
    name: "NestJS",
    desc: "A progressive Node.js framework for building efficient, reliable and scalable server-side applications.",
    link: "https://nestjs.com/",
    type: "framework",
    icon: "devicon-nestjs-original",
  },
  {
    tech: "nextAuth",
    name: "NextAuth.js",
    desc: "Authentication for Next.js applications.",
    link: "https://next-auth.js.org/",
    type: "auth",
    icon: "devicon-nextjs-plain",
  },
  {
    tech: "nextjs",
    name: "Next.js",
    desc: "The React framework for production.",
    link: "https://nextjs.org/",
    type: "framework",
    icon: "devicon-nextjs-plain",
  },
  {
    tech: "nodejs",
    name: "Node.js",
    desc: "A JavaScript runtime built on Chrome's V8 JavaScript engine.",
    link: "https://nodejs.org/",
    type: "framework",
    icon: "devicon-nodejs-plain",
  },
  {
    tech: "nuqs",
    name: "Nuqs",
    desc: "Type-safe search params state manager for React.",
    link: "https://nuqs.dev/",
    type: "library",
    icon: "devicon-react-original", // Fallback
  },
  {
    tech: "php",
    name: "PHP",
    desc: "A popular general-purpose scripting language especially suited to web development.",
    link: "https://www.php.net/",
    type: "language",
    icon: "devicon-php-plain",
  },
  {
    tech: "pnpm",
    name: "pnpm",
    desc: "A fast, disk space efficient package manager.",
    link: "https://pnpm.io/",
    type: "tools",
    icon: "devicon-pnpm-plain",
  },
  {
    tech: "postgreSQL",
    name: "PostgreSQL",
    desc: "A powerful, open source object-relational database system.",
    link: "https://www.postgresql.org/",
    type: "database",
    icon: "devicon-postgresql-plain",
  },
  {
    tech: "powershell",
    name: "PowerShell",
    desc: "A task automation and configuration management framework from Microsoft.",
    link: "https://learn.microsoft.com/powershell/",
    type: "tools",
    icon: "devicon-powershell-plain",
  },
  {
    tech: "prisma",
    name: "Prisma ORM",
    desc: "A next-generation ORM for Node.js and TypeScript.",
    link: "https://www.prisma.io/docs/orm",
    type: "database",
    icon: "devicon-prisma-original",
  },
  {
    tech: "react",
    name: "React",
    desc: "A JavaScript library for building user interfaces.",
    link: "https://react.dev/",
    type: "library",
    icon: "devicon-react-original",
  },
  {
    tech: "redis",
    name: "Redis",
    desc: "An in-memory data structure store used as a database, cache and message broker.",
    link: "https://redis.io/",
    type: "database",
    icon: "devicon-redis-plain",
  },
  {
    tech: "shadcn-ui",
    name: "shadcn/ui",
    desc: "A component library for building user interfaces.",
    link: "https://ui.shadcn.com/",
    type: "library",
    icon: "devicon-react-original", // Fallback
  },
  {
    tech: "socket.io",
    name: "Socket.IO",
    desc: "A library that enables low-latency, bidirectional and event-based communication.",
    link: "https://socket.io/",
    type: "library",
    icon: "devicon-socketio-original",
  },
  {
    tech: "tailwindcss",
    name: "Tailwind CSS",
    desc: "A utility-first CSS framework for rapidly building custom user interfaces.",
    link: "https://tailwindcss.com/",
    type: "library",
    icon: "devicon-tailwindcss-original",
  },
  {
    tech: "typescript",
    name: "TypeScript",
    desc: "A typed superset of JavaScript that makes JavaScript my favorite language.",
    link: "https://www.typescriptlang.org/",
    type: "language",
    icon: "devicon-typescript-plain",
  },
  {
    tech: "webrtc",
    name: "WebRTC",
    desc: "An open framework for the web that enables Real-Time Communications (RTC).",
    link: "https://webrtc.org/",
    type: "library",
    icon: "devicon-javascript-plain", // Fallback
  },
  {
    tech: "dotnet",
    name: ".NET",
    desc: "A free, open-source, cross-platform framework for building modern apps and powerful cloud services.",
    link: "https://dotnet.microsoft.com/",
    type: "framework",
    icon: "devicon-dotnetcore-plain",
  },
  {
    tech: "yarn",
    name: "Yarn",
    desc: "A fast, reliable, and secure dependency management tool.",
    link: "https://yarnpkg.com/",
    type: "tools",
    icon: "devicon-yarn-plain",
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
