const { dialog, app } = require("electron");
const { autoUpdater } = require("electron-updater");
const https = require("https");
const http = require("http");

/**
 * Auto-actualización visible (no silenciosa).
 * - Revisa cada pocos minutos con la app abierta
 * - Pregunta al usuario antes de descargar
 * - Muestra progreso en la barra de título / taskbar
 * - Pide reiniciar al terminar
 */
function setupAutoUpdater(getMainWindow, onBeforeQuitAndInstall) {
  if (!app.isPackaged) {
    console.log("[updater] Modo desarrollo — updates desactivados");
    return;
  }

  const feedUrl = (process.env.UPDATE_FEED_URL || "").trim().replace(/\/$/, "");
  if (!feedUrl) {
    console.log(
      "[updater] UPDATE_FEED_URL no configurada. Configúrala en .env para habilitar updates.",
    );
    return;
  }

  const isLinuxDir =
    process.platform === "linux" && !process.env.APPIMAGE;

  if (isLinuxDir) {
    console.log(
      "[updater] No es AppImage (start-linux.sh). Usando aviso de descarga manual.",
    );
    setTimeout(() => checkManualLinuxUpdate(feedUrl, getMainWindow), 5_000);
    setInterval(
      () => checkManualLinuxUpdate(feedUrl, getMainWindow),
      2 * 60 * 1000,
    );
    return;
  }

  // El usuario decide cuándo descargar; no en silencio.
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.forceDevUpdateConfig = false;

  try {
    autoUpdater.setFeedURL({
      provider: "generic",
      url: feedUrl,
    });
  } catch (err) {
    console.error("[updater] setFeedURL error:", err);
    return;
  }

  let checking = false;
  let downloading = false;
  let promptOpen = false;
  let offeredVersion = null;
  let deferredUntil = 0;
  const baseTitle = () =>
    process.env.NEXT_PUBLIC_APP_NAME || app.getName() || "Monetixa";

  function withWindow(fn) {
    const win = getMainWindow?.();
    if (win && !win.isDestroyed()) return fn(win);
    return null;
  }

  function setDownloadProgress(pct) {
    withWindow((win) => {
      const p = Math.max(0, Math.min(1, pct / 100));
      win.setProgressBar(p);
      win.setTitle(`${baseTitle()} — Descargando actualización ${Math.round(pct)}%`);
    });
  }

  function clearDownloadProgress() {
    withWindow((win) => {
      win.setProgressBar(-1);
      win.setTitle(baseTitle());
    });
  }

  autoUpdater.on("checking-for-update", () => {
    console.log("[updater] Buscando actualizaciones…");
  });

  autoUpdater.on("update-available", async (info) => {
    console.log("[updater] Disponible:", info.version);
    if (downloading || promptOpen) return;
    if (offeredVersion === info.version && Date.now() < deferredUntil) {
      console.log("[updater] Usuario pospuso", info.version);
      return;
    }

    promptOpen = true;
    offeredVersion = info.version;
    try {
      const win = getMainWindow?.();
      const opts = {
        type: "info",
        title: "Actualización disponible",
        message: `Hay una nueva versión: ${info.version}`,
        detail:
          `Versión instalada: ${app.getVersion()}\n\n` +
          "Puedes descargarla ahora. Verás el progreso en la barra de título de la ventana.",
        buttons: ["Descargar ahora", "Más tarde"],
        defaultId: 0,
        cancelId: 1,
        noLink: true,
      };
      const result =
        win && !win.isDestroyed()
          ? await dialog.showMessageBox(win, opts)
          : await dialog.showMessageBox(opts);

      if (result.response === 0) {
        downloading = true;
        setDownloadProgress(0);
        try {
          await autoUpdater.downloadUpdate();
        } catch (err) {
          downloading = false;
          clearDownloadProgress();
          console.error("[updater] downloadUpdate:", err?.message || err);
          await showError(
            getMainWindow,
            "No se pudo descargar la actualización",
            String(err?.message || err),
          );
        }
      } else {
        // Reintentar aviso en 10 minutos
        deferredUntil = Date.now() + 10 * 60 * 1000;
      }
    } finally {
      promptOpen = false;
    }
  });

  autoUpdater.on("update-not-available", () => {
    console.log("[updater] Ya estás en la última versión");
  });

  autoUpdater.on("error", async (err) => {
    console.error("[updater] Error:", err?.message || err);
    if (downloading) {
      downloading = false;
      clearDownloadProgress();
      await showError(
        getMainWindow,
        "Error de actualización",
        String(err?.message || err),
      );
    }
  });

  autoUpdater.on("download-progress", (p) => {
    const pct = Math.round(p.percent || 0);
    console.log(`[updater] Descargando… ${pct}%`);
    setDownloadProgress(pct);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    console.log("[updater] Descargada:", info.version);
    downloading = false;
    clearDownloadProgress();

    const win = getMainWindow?.();
    const opts = {
      type: "info",
      title: "Actualización lista",
      message: `Monetixa ${info.version} se descargó correctamente`,
      detail:
        "Para aplicar la actualización hay que reiniciar la aplicación ahora.",
      buttons: ["Reiniciar e instalar"],
      defaultId: 0,
      noLink: true,
    };

    try {
      if (win && !win.isDestroyed()) {
        await dialog.showMessageBox(win, opts);
      } else {
        await dialog.showMessageBox(opts);
      }
    } catch {
      /* ignore */
    }

    try {
      onBeforeQuitAndInstall?.();
    } catch {
      /* ignore */
    }
    setImmediate(() => {
      autoUpdater.quitAndInstall(false, true);
    });
  });

  const check = () => {
    if (checking || downloading || promptOpen) return;
    if (Date.now() < deferredUntil) return;
    checking = true;
    autoUpdater
      .checkForUpdates()
      .catch((err) => {
        console.error("[updater] checkForUpdates:", err?.message || err);
      })
      .finally(() => {
        checking = false;
      });
  };

  // Primera revisión pronto; luego cada 2 minutos con la app abierta
  setTimeout(check, 5_000);
  setInterval(check, 2 * 60 * 1000);

  // Al volver a enfocar la ventana, revisar otra vez
  app.on("browser-window-focus", () => {
    setTimeout(check, 1_000);
  });
}

async function showError(getMainWindow, message, detail) {
  const win = getMainWindow?.();
  const opts = {
    type: "error",
    title: "Monetixa",
    message,
    detail,
    buttons: ["OK"],
  };
  try {
    if (win && !win.isDestroyed()) await dialog.showMessageBox(win, opts);
    else await dialog.showMessageBox(opts);
  } catch {
    /* ignore */
  }
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(url, { timeout: 20000 }, (res) => {
      if (
        res.statusCode >= 300 &&
        res.statusCode < 400 &&
        res.headers.location
      ) {
        fetchText(res.headers.location).then(resolve, reject);
        res.resume();
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} al pedir ${url}`));
        res.resume();
        return;
      }
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (c) => {
        data += c;
      });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout al pedir feed"));
    });
  });
}

function parseFeedVersion(yml) {
  const m = String(yml).match(/^version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)/m);
  return m ? m[1] : null;
}

function parseFeedPath(yml) {
  const m = String(yml).match(/^path:\s*['"]?([^\s'"]+)/m);
  if (m) return m[1];
  const u = String(yml).match(/url:\s*['"]?([^\s'"]+\.AppImage)/m);
  return u ? u[1] : null;
}

function isRemoteNewer(remote, local) {
  const parts = (v) =>
    String(v)
      .split(".")
      .map((n) => Number(n) || 0);
  const a = parts(remote);
  const b = parts(local);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

let manualPromptShown = false;

async function checkManualLinuxUpdate(feedUrl, getMainWindow) {
  try {
    console.log("[updater] Buscando actualizaciones (manual)…");
    const yml = await fetchText(`${feedUrl}/latest-linux.yml`);
    const remote = parseFeedVersion(yml);
    const file = parseFeedPath(yml);
    const local = app.getVersion();
    if (!remote) {
      console.log("[updater] No se pudo leer version del feed");
      return;
    }
    console.log(`[updater] Local ${local} · remoto ${remote}`);
    if (!isRemoteNewer(remote, local)) {
      console.log("[updater] Ya estás en la última versión");
      return;
    }
    if (manualPromptShown) return;
    manualPromptShown = true;

    const downloadUrl = file
      ? `${feedUrl}/${encodeURIComponent(file).replace(/%2F/g, "/")}`
      : feedUrl;

    const { shell } = require("electron");
    const win = getMainWindow?.();
    const opts = {
      type: "info",
      title: "Actualización disponible",
      message: `Hay una nueva versión: ${remote}`,
      detail:
        "Esta copia se abrió con start-linux.sh (sin AppImage), así que la instalación automática no está disponible.\n\n" +
        "Opciones:\n" +
        "1) Abrir descarga del AppImage nuevo\n" +
        "2) O ejecuta siempre Monetixa-*.AppImage para auto-update completo",
      buttons: ["Descargar AppImage", "Más tarde"],
      defaultId: 0,
      cancelId: 1,
    };

    const result =
      win && !win.isDestroyed()
        ? await dialog.showMessageBox(win, opts)
        : await dialog.showMessageBox(opts);

    if (result.response === 0) {
      await shell.openExternal(downloadUrl);
    }
  } catch (err) {
    console.error("[updater] check manual:", err?.message || err);
  }
}

module.exports = { setupAutoUpdater };
