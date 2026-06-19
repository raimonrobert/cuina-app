"use client";

import { useStore } from "@/store/useStore";
import DataMenu from "./DataMenu";

export default function InventorySidebar() {
  const items = useStore((s) => s.items);
  const categories = useStore((s) => s.categories);
  const locations = useStore((s) => s.locations);
  const sbMode = useStore((s) => s.sbMode);
  const setSbMode = useStore((s) => s.setSbMode);
  const filterCat = useStore((s) => s.filterCat);
  const filterLoc = useStore((s) => s.filterLoc);
  const setFilterCat = useStore((s) => s.setFilterCat);
  const setFilterLoc = useStore((s) => s.setFilterLoc);

  const ok = items.filter((i) => i.locId).length;
  const tot = items.length;
  const pct = tot ? Math.round((ok / tot) * 100) : 0;

  return (
    <aside className="inv-side">
      <div className="inv-logo">
        Gestor Inventario
        <br />
        de Cocina
      </div>
      <div className="stats">
        <div className="stat-row">
          <span>Ubicados</span>
          <span className="stat-val g">{ok}</span>
        </div>
        <div className="stat-row">
          <span>Pendientes</span>
          <span className="stat-val y">{tot - ok}</span>
        </div>
        <div className="stat-row">
          <span>Total</span>
          <span className="stat-val">{tot}</span>
        </div>
        <div className="prog">
          <div className="prog-fill" style={{ width: pct + "%" }} />
        </div>
      </div>
      <div className="sb-toggle">
        <button className={`sbtbtn ${sbMode === "cat" ? "on" : ""}`} onClick={() => setSbMode("cat")}>
          Categ.
        </button>
        <button className={`sbtbtn ${sbMode === "loc" ? "on" : ""}`} onClick={() => setSbMode("loc")}>
          Ubic.
        </button>
      </div>
      <div className="nav-list">
        {sbMode === "cat"
          ? categories.map((c) => {
              const cnt = items.filter((i) => i.cat === c).length;
              return (
                <button
                  key={c}
                  className={`nav-item ${filterCat === c ? "on" : ""}`}
                  onClick={() => setFilterCat(c)}
                >
                  <span className="nav-item-label">{c}</span>
                  <span className="nav-cnt">{cnt}</span>
                </button>
              );
            })
          : locations.map((l) => {
              const cnt = items.filter((i) => i.locId === l.id).length;
              return (
                <button
                  key={l.id}
                  className={`nav-item ${filterLoc === l.id ? "on" : ""}`}
                  onClick={() => setFilterLoc(l.id)}
                >
                  <span className="nav-item-label" style={{ fontSize: ".75rem" }}>
                    {l.name}
                  </span>
                  <span className="nav-cnt">{cnt}</span>
                </button>
              );
            })}
      </div>
      <DataMenu />
    </aside>
  );
}
