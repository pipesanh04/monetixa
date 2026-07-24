const { ipcRenderer } = require("electron");

const countEl = document.getElementById("count");
const planEl = document.getElementById("plan");
const noteEl = document.getElementById("note");
const outputEl = document.getElementById("output");
const countLabel = document.getElementById("countLabel");
const statusEl = document.getElementById("status");

let lastSerials = [];

function setStatus(msg, isError = false) {
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("error", Boolean(isError));
}

document.getElementById("generate").addEventListener("click", async () => {
  setStatus("Generando…");
  try {
    const result = await ipcRenderer.invoke("generate-serials", {
      count: Number(countEl.value || 1),
      plan: planEl.value,
      note: noteEl.value.trim(),
    });
    if (!result.ok) throw new Error(result.error || "Error al generar");
    lastSerials = result.serials;
    outputEl.value = lastSerials.join("\n");
    countLabel.textContent = String(lastSerials.length);
    setStatus(`${lastSerials.length} serial(es) listos. Ya funcionan en Monetixa.`);
  } catch (err) {
    setStatus(err.message || String(err), true);
  }
});

document.getElementById("copy").addEventListener("click", async () => {
  if (!lastSerials.length) {
    setStatus("No hay seriales para copiar.", true);
    return;
  }
  await navigator.clipboard.writeText(lastSerials.join("\n"));
  setStatus("Copiado al portapapeles.");
});

document.getElementById("export").addEventListener("click", async () => {
  if (!lastSerials.length) {
    setStatus("No hay seriales para exportar.", true);
    return;
  }
  const result = await ipcRenderer.invoke("export-serials", {
    serials: lastSerials,
    note: noteEl.value.trim(),
    plan: planEl.value,
  });
  if (!result.ok) {
    if (result.canceled) setStatus("Exportación cancelada.");
    else setStatus(result.error || "No se pudo exportar.", true);
    return;
  }
  setStatus(`Exportado: ${result.path}`);
});

document.getElementById("save").addEventListener("click", async () => {
  if (!lastSerials.length) {
    setStatus("Genera seriales primero.", true);
    return;
  }
  const result = await ipcRenderer.invoke("save-registry", {
    serials: lastSerials,
    note: noteEl.value.trim(),
    plan: planEl.value,
  });
  if (!result.ok) {
    setStatus(result.error || "No se pudo guardar el registro.", true);
    return;
  }
  setStatus(`Guardados en registro (${result.total} en total): ${result.path}`);
});
