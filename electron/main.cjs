const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");
const fs = require("fs");
const { setupAutoUpdater } = require("./updater.cjs");

const PORT = Number(process.env.MONETIXA_PORT || 3847);
let serverProcess = null;
let mainWindow = null;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function loadAppEnv() {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), ".env"),
    path.join(__dirname, "..", ".env.local"),
    path.join(__dirname, "..", ".env"),
  ];
  if (app.isPackaged) {
    candidates.unshift(path.join(process.resourcesPath, ".env"));
    candidates.unshift(path.join(app.getPath("userData"), ".env"));
  }
  for (const file of candidates) loadEnvFile(file);
}

function waitForServer(url, attempts = 80) {
  return new Promise((resolve, reject) => {
    let left = attempts;
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        left -= 1;
        if (left <= 0) {
          reject(new Error("El servidor local no arrancó a tiempo."));
        } else setTimeout(tick, 400);
      });
    };
    tick();
  });
}

function resolveStandaloneDir() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "standalone");
  }
  return path.join(__dirname, "..", ".next", "standalone");
}

function startStandaloneServer() {
  const standaloneDir = resolveStandaloneDir();
  const serverJs = path.join(standaloneDir, "server.js");

  if (!fs.existsSync(serverJs)) {
    throw new Error(
      `No se encontró server.js en ${standaloneDir}. Ejecuta: npm run build`,
    );
  }

  const env = {
    ...process.env,
    PORT: String(PORT),
    HOSTNAME: "127.0.0.1",
    NODE_ENV: "production",
    ELECTRON_RUN_AS_NODE: "1",
  };

  serverProcess = spawn(process.execPath, [serverJs], {
    cwd: standaloneDir,
    env,
    stdio: "inherit",
  });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error("Servidor Next salió con código", code);
    }
  });

  return `http://127.0.0.1:${PORT}`;
}

async function createWindow() {
  loadAppEnv();

  const isDev = !app.isPackaged && process.env.ELECTRON_DEV === "1";
  let url;

  if (isDev) {
    url = process.env.ELECTRON_START_URL || "http://127.0.0.1:3000";
  } else {
    url = startStandaloneServer();
    await waitForServer(url);
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 680,
    title: process.env.NEXT_PUBLIC_APP_NAME || "Monetixa",
    backgroundColor: "#0b1c24",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  await mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Updates solo en builds empaquetados
  setupAutoUpdater(
    () => mainWindow,
    () => cleanup(),
  );
}

function cleanup() {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
    serverProcess = null;
  }
}

app.whenReady().then(createWindow).catch((err) => {
  console.error(err);
  app.quit();
});

app.on("window-all-closed", () => {
  cleanup();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", cleanup);

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch(console.error);
  }
});
