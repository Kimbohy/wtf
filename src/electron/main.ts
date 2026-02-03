import { app, BrowserWindow, Menu } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let backendServer: any = null;

const isDev = process.env.NODE_ENV === "development";

// Load environment variables from .env file
function loadEnvFile() {
  try {
    // Check multiple possible locations for .env file
    const envPaths = [
      path.join(process.cwd(), ".env"),
      path.join(app.getPath("userData"), ".env"),
      path.join(__dirname, "..", "..", ".env"),
    ];

    for (const envPath of envPaths) {
      if (existsSync(envPath)) {
        const envContent = readFileSync(envPath, "utf-8");
        envContent.split("\n").forEach((line) => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").trim();
              process.env[key.trim()] = value.replace(/^["']|["']$/g, "");
            }
          }
        });
        console.log("Loaded environment variables from:", envPath);
        return;
      }
    }
    console.log("No .env file found. GitHub OAuth will not be available.");
  } catch (error) {
    console.error("Error loading .env file:", error);
  }
}

async function startBackend() {
  try {
    // Import and start the backend server
    const backendPath = isDev ? "../backend/index.js" : "../backend/index.js";
    const backend = await import(backendPath);
    backendServer = backend.app;
    console.log("Backend server started successfully");
  } catch (error) {
    console.error("Failed to start backend server:", error);
  }
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  loadEnvFile();
  await startBackend();
  await createWindow();
  Menu.setApplicationMenu(null); // Supprime le menu complètement
});

app.on("window-all-closed", () => {
  if (backendServer) {
    try {
      backendServer.stop();
    } catch (error) {
      console.error("Error stopping backend:", error);
    }
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
