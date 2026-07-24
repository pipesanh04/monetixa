const { dialog, app, shell } = require("electron");
const { autoUpdater } = require("electron-updater");
const https = require("https");
const http = require("http");

/**
 * Auto-actualización vía feed genérico (HTTP/HTTPS).
 * Linux: electron-updater solo actualiza AppImage.
 * Si se corre desde linux-unpacked (start-linux.sh), mostramos aviso + enlace de descarga.
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
      6 * 60 * 60 * 1000,
    );
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
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

  autoUpdater.on("checking-for-update", () => {
    console.log("[updater] Buscando actualizaciones…");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("[updater] Disponible:", info.version);
    const win = getMainWindow?.();
    if (win && !win.isDestroyed()) {
      dialog
        .showMessageBox(win, {
          type: "info",
          title: "Actualización disponible",
          message: `Hay una nueva versión: ${info.version}`,
          detail: "Se descargará en segundo plano. Te avisaremos al terminar.",
          buttons: ["Entendido"],
        })
        .catch(() => {});
    }
  });

  autoUpdater.on("update-not-available", () => {
    console.log("[updater] Ya estás en la última versión");
  });

  autoUpdater.on("error", (err) => {
    console.error("[updater] Error:", err?.message || err);
  });

  autoUpdater.on("download-progress", (p) => {
    const pct = Math.round(p.percent || 0);
    console.log(`[updater] Descargando… ${pct}%`);
  });

  autoUpdater.on("update-downloaded", async (info) => {
    console.log("[updater] Descargada:", info.version);
    const win = getMainWindow?.();
    const opts = {
      type: "info",
      title: "Actualización lista",
      message: `Monetixa ${info.version} está lista para instalar`,
      detail: "La app se reiniciará para aplicar los cambios.",
      buttons: ["Reiniciar ahora", "Más tarde"],
      defaultId: 0,
      cancelId: 1,
    };

    let response = 1;
    try {
      const result =
        win && !win.isDestroyed()
          ? await dialog.showMessageBox(win, opts)
          : await dialog.showMessageBox(opts);
      response = result.response;
    } catch {
      response = 0;
    }

    if (response === 0) {
      try {
        onBeforeQuitAndInstall?.();
      } catch {
        /* ignore */
      }
      setImmediate(() => {
        autoUpdater.quitAndInstall(false, true);
      });
    }
  });

  const check = () => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error("[updater] checkForUpdates:", err?.message || err);
    });
  };

  setTimeout(check, 8_000);
  setInterval(check, 6 * 60 * 60 * 1000);
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
