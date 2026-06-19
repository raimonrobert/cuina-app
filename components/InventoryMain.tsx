"use client";

import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { FREQC, FREQL } from "@/lib/planData";
import type { Item } from "@/lib/types";

export default function InventoryMain() {
  const items = useStore((s) => s.items);
  const locations = useStore((s) => s.locations);
  const filter = useStore((s) => s.filter);
  const filterCat = useStore((s) => s.filterCat);
  const filterLoc = useStore((s) => s.filterLoc);
  const search = useStore((s) => s.search);
  const setFilter = useStore((s) => s.setFilter);
  const setSearch = useStore((s) => s.setSearch);
  const openItemModal = useStore((s) => s.openItemModal);
  const openLocationModal = useStore((s) => s.openLocationModal);
  const deleteItem = useStore((s) => s.deleteItem);

  const getLoc = (id: string | null) => {
    if (!id) return "";
    const l = locations.find((x) => x.id === id);
    return l ? l.name : id;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((i) => {
      if (filter === "ok" && !i.locId) return false;
      if (filter === "no" && i.locId) return false;
      if (filterCat && i.cat !== filterCat) return false;
      if (filterLoc && i.locId !== filterLoc) return false;
      if (q) {
        return (
          i.name.toLowerCase().includes(q) ||
          i.cat.toLowerCase().includes(q) ||
          getLoc(i.locId).toLowerCase().includes(q)
        );
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, locations, filter, filterCat, filterLoc, search]);

  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    filtered.forEach((i) => {
      const key = filterLoc ? getLoc(i.locId) || "— Sin ubicar —" : i.cat;
      if (!g[key]) g[key] = [];
      g[key].push(i);
    });
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, filterLoc, locations]);

  const onDelete = (it: Item) => {
    if (window.confirm(`¿Eliminar "${it.name}"?`)) deleteItem(it.id);
  };

  return (
    <main className="inv-main">
      <div className="pg-hdr">
        <div>
          <div className="pg-title">Inventario</div>
          <div className="pg-sub">{filtered.length} elementos</div>
        </div>
        <div className="hdr-acts">
          <button className="btn pri" onClick={() => openItemModal()}>
            + Añadir
          </button>
          <button className="btn" onClick={() => openLocationModal()}>
            + Ubicación
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="srch">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className={`chip ${filter === "all" ? "on" : ""}`} onClick={() => setFilter("all")}>
          Todos
        </button>
        <button className={`chip ${filter === "ok" ? "on" : ""}`} onClick={() => setFilter("ok")}>
          Ubicados
        </button>
        <button className={`chip ${filter === "no" ? "on" : ""}`} onClick={() => setFilter("no")}>
          Pendientes
        </button>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="empty-result">Sin resultados</div>
      ) : (
        Object.entries(groups).map(([g, gi]) => {
          const ok = gi.filter((i) => i.locId).length;
          return (
            <div className="tbl-wrap" key={g}>
              <div className="tbl-hdr">
                <span className="tbl-name">{g}</span>
                <span className="tbl-prog">
                  {ok}/{gi.length}
                </span>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Elemento</th>
                    <th>Ubicación</th>
                    <th>Frec.</th>
                    <th>Estado</th>
                    <th style={{ textAlign: "center" }}>⋯</th>
                  </tr>
                </thead>
                <tbody>
                  {gi.map((it) => (
                    <tr key={it.id} onClick={() => openItemModal(it.id)} style={{ cursor: "pointer" }}>
                      <td className="td-name">{it.name}</td>
                      <td className={`td-loc ${it.locId ? "" : "none"}`}>
                        {it.locId ? getLoc(it.locId) : "— sin definir —"}
                      </td>
                      <td style={{ fontSize: ".68rem", color: FREQC[it.freq || ""] }}>
                        {FREQL[it.freq || ""]}
                      </td>
                      <td>
                        <span className={`badge ${it.locId ? "ok" : "no"}`}>
                          {it.locId ? "✓ ubicado" : "? pendiente"}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                        <button
                          className="icon-btn"
                          style={{ color: "#4a7a9a" }}
                          onClick={() => openItemModal(it.id)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        <button
                          className="icon-btn"
                          style={{ color: "#a04040" }}
                          onClick={() => onDelete(it)}
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </main>
  );
}
