const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  generateSerialBatch,
  appendIssuedSerials,
  getSerialSecret,
} = require("./lib/serial.cjs");

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

function loadEnv() {
  const root = path.join(__dirname, "..");
  const candidates = [
    path.join(root, ".env.local"),
    path.join(root, ".env"),
    path.join(__dirname, ".env"),
  ];
  if (app.isPackaged) {
    candidates.unshift(path.join(process.resourcesPath, ".env"));
    candidates.unshift(path.join(app.getPath("userData"), ".env"));
  }
  for (const file of candidates) loadEnvFile(file);
}

function monetixaRoot() {
  if (app.isPackaged) {
    // Junto al AppImage / carpeta del usuario
    return process.env.MONETIXA_ROOT?.trim() || app.getPath("userData");
  }
  return path.join(__dirname, "..");
}

function registryPath() {
  if (process.env.ISSUED_SERIALS_PATH?.trim()) {
    return process.env.ISSUED_SERIALS_PATH.trim();
  }
  return path.join(monetixaRoot(), "data", "issued-serials.json");
}

function createWindow() {
  loadEnv();

  const win = new BrowserWindow({
    width: 920,
    height: 780,
    minWidth: 720,
    minHeight: 640,
    title: "Monetixa Serial Admin",
    backgroundColor: "#07141a",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, "src", "index.html"));
}

ipcMain.handle("generate-serials", async (_event, payload) => {
  try {
    loadEnv();
    if (!getSerialSecret()) {
      return {
        ok: false,
        error:
          "Falta SERIAL_SECRET. Configúralo en .env.local de Monetixa (mismo valor).",
      };
    }
    const serials = generateSerialBatch(payload.count, payload.plan || "PRO");
    return { ok: true, serials };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});

ipcMain.handle("export-serials", async (_event, payload) => {
  try {
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: "Exportar seriales",
      defaultPath: `monetixa-serials-${Date.now()}.txt`,
      filters: [{ name: "Texto", extensions: ["txt"] }],
    });
    if (canceled || !filePath) return { ok: false, canceled: true };

    const header = [
      `# Monetixa Seriales`,
      `# Fecha: ${new Date().toISOString()}`,
      `# Plan: ${payload.plan || "PRO"}`,
      `# Nota: ${payload.note || "-"}`,
      "",
    ].join("\n");
    fs.writeFileSync(filePath, header + payload.serials.join("\n") + "\n", "utf8");
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});

ipcMain.handle("save-registry", async (_event, payload) => {
  try {
    loadEnv();
    const file = registryPath();
    const registry = appendIssuedSerials(
      file,
      payload.serials,
      payload.note,
      payload.plan,
    );
    return { ok: true, path: file, total: registry.serials.length };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
