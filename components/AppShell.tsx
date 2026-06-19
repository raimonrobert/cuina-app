"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useIsMobile } from "./useIsMobile";
import PlanoCanvas from "./PlanoCanvas";
import PlanoDetail from "./PlanoDetail";
import InventorySidebar from "./InventorySidebar";
import InventoryMain from "./InventoryMain";
import UbicacionesView from "./UbicacionesView";
import MobBrowse from "./MobBrowse";
import Modals from "./Modals";
import Toast from "./Toast";

export default function AppShell() {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  const loaded = useStore((s) => s.loaded);
  const loadError = useStore((s) => s.loadError);
  const load = useStore((s) => s.load);

  const panel = useStore((s) => s.panel);
  const setPanel = useStore((s) => s.setPanel);
  const mobScreen = useStore((s) => s.mobScreen);
  const browseMode = useStore((s) => s.browseMode);
  const mobGo = useStore((s) => s.mobGo);

  useEffect(() => {
    setMounted(true);
    load();
  }, [load]);

  if (!mounted || !loaded) {
    return (
      <div className="loading-screen">
        <div className="loading-title">Gestor Inventario de Cocina</div>
        <div>{loadError ? "" : "Cargando…"}</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-screen">
        <div className="loading-title">No se pudieron cargar los datos</div>
        <div style={{ fontSize: ".8rem", maxWidth: 420 }}>{loadError}</div>
        <button className="btn pri" onClick={() => load()}>
          Reintentar
        </button>
      </div>
    );
  }

  // ── MÓVIL ──
  if (isMobile) {
    const planoTab = mobScreen === "plano" || mobScreen === "detail";
    const ubiTab = mobScreen === "browse" && browseMode === "loc";
    const catsTab = mobScreen === "browse" && browseMode === "cat";
    const listTab = mobScreen === "list";
    return (
      <div className="app">
        <div className="mob-root">
          {mobScreen === "plano" && <PlanoCanvas isMobile />}
          {mobScreen === "detail" && (
            <div className="mob-screen">
              <PlanoDetail />
            </div>
          )}
          {mobScreen === "browse" && <MobBrowse />}
          {mobScreen === "list" && (
            <div className="mob-screen">
              <InventoryMain />
            </div>
          )}
        </div>
        <nav className="mob-bar">
          <div className="mob-bar-inner">
            <button className={`mbt ${planoTab ? "on" : ""}`} onClick={() => mobGo("plano")}>
              <span className="mi">⊞</span>Plano
            </button>
            <button className={`mbt ${ubiTab ? "on" : ""}`} onClick={() => mobGo("ubicaciones")}>
              <span className="mi">◫</span>Ubicaciones
            </button>
            <button className={`mbt ${catsTab ? "on" : ""}`} onClick={() => mobGo("cats")}>
              <span className="mi">☰</span>Categorías
            </button>
            <button className={`mbt ${listTab ? "on" : ""}`} onClick={() => mobGo("lista")}>
              <span className="mi">≡</span>Lista
            </button>
            <button className="mbt" onClick={() => mobGo("add")}>
              <span className="mi">＋</span>Añadir
            </button>
          </div>
        </nav>
        <Toast />
        <Modals />
      </div>
    );
  }

  // ── ESCRITORIO ──
  return (
    <div className="app">
      <nav className="topbar">
        <span className="topbar-title">Gestor Cocina</span>
        <button className={`tbtn ${panel === "plano" ? "on" : ""}`} onClick={() => setPanel("plano")}>
          ⊞ Plano
        </button>
        <button className={`tbtn ${panel === "inventario" ? "on" : ""}`} onClick={() => setPanel("inventario")}>
          ☰ Inventario
        </button>
        <button className={`tbtn ${panel === "ubicaciones" ? "on" : ""}`} onClick={() => setPanel("ubicaciones")}>
          ◫ Ubicaciones
        </button>
      </nav>
      <div className="body">
        {panel === "plano" && (
          <div className="plano-layout">
            <PlanoCanvas isMobile={false} />
            <PlanoDetail />
          </div>
        )}
        {panel === "inventario" && (
          <div className="inv-layout">
            <InventorySidebar />
            <InventoryMain />
          </div>
        )}
        {panel === "ubicaciones" && <UbicacionesView />}
      </div>
      <Toast />
      <Modals />
    </div>
  );
}
