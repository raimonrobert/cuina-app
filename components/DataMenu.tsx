"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useStore } from "@/store/useStore";
import { SEED_LOCATIONS, SEED_CATEGORIES, SEED_ITEMS } from "@/lib/seed";

export default function DataMenu() {
  const locations = useStore((s) => s.locations);
  const categories = useStore((s) => s.categories);
  const items = useStore((s) => s.items);
  const replaceAll = useStore((s) => s.replaceAll);
  const showToast = useStore((s) => s.showToast);

  const [exportJson, setExportJson] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const buildJson = () =>
    JSON.stringify(
      {
        locations,
        categories,
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          cat: i.cat,
          locId: i.locId || "",
          freq: i.freq,
          notes: i.notes,
        })),
      },
      null,
      2
    );

  const onExport = () => {
    const json = buildJson();
    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cocina_" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    } catch {
      /* la descarga puede fallar en móvil; queda el modal para copiar */
    }
    setExportJson(json);
  };

  const onImport = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = async (ev) => {
      try {
        const p = JSON.parse(String(ev.target?.result));
        if (!p.items || !p.locations) throw new Error("estructura");
        const ok = await replaceAll({
          locations: p.locations,
          categories: p.categories || SEED_CATEGORIES,
          items: (p.items as { id: number; name: string; cat: string; locId?: string; freq?: string; notes?: string }[]).map((i) => ({
            id: i.id,
            name: i.name,
            cat: i.cat,
            locId: i.locId || null,
            freq: (i.freq || "") as never,
            notes: i.notes || "",
          })),
        });
        if (ok) showToast("Importado ✓", "g");
      } catch {
        showToast("Archivo no válido", "r");
      }
    };
    r.readAsText(f);
    e.target.value = "";
  };

  const onReset = async () => {
    if (!window.confirm("¿Restaurar datos originales? Se sobrescribirán todos los datos actuales.")) return;
    const ok = await replaceAll({
      locations: SEED_LOCATIONS,
      categories: SEED_CATEGORIES,
      items: SEED_ITEMS,
    });
    if (ok) showToast("Restaurado", "g");
  };

  const copy = async () => {
    if (!exportJson) return;
    try {
      await navigator.clipboard.writeText(exportJson);
      showToast("Copiado ✓", "g");
    } catch {
      showToast("No se pudo copiar", "r");
    }
  };

  return (
    <>
      <div className="data-btns">
        <button className="nav-item" onClick={onExport}>
          <span>↓</span> Exportar JSON
        </button>
        <button className="nav-item" onClick={() => fileRef.current?.click()}>
          <span>↑</span> Importar JSON
        </button>
        <button className="nav-item" onClick={onReset}>
          <span>↺</span> Restaurar datos
        </button>
        <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={onImport} />
      </div>

      {exportJson !== null && (
        <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) setExportJson(null); }}>
          <div className="modal">
            <div className="modal-hdr">
              <span className="modal-title">Exportar datos</span>
              <button className="modal-x" onClick={() => setExportJson(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: ".75rem", color: "var(--t2)", marginBottom: ".75rem" }}>
                Se ha descargado el archivo. También puedes copiar este JSON:
              </p>
              <textarea
                readOnly
                value={exportJson}
                style={{
                  width: "100%",
                  height: 180,
                  fontSize: ".6rem",
                  fontFamily: "monospace",
                  background: "var(--s2)",
                  border: "1px solid var(--b1)",
                  color: "var(--t2)",
                  padding: ".5rem",
                  borderRadius: 3,
                }}
              />
            </div>
            <div className="modal-foot">
              <button className="btn pri" onClick={copy}>Copiar todo</button>
              <button className="btn" onClick={() => setExportJson(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
