"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { FREQL } from "@/lib/planData";

export default function UbicacionesView() {
  const locations = useStore((s) => s.locations);
  const items = useStore((s) => s.items);
  const openLocationModal = useStore((s) => s.openLocationModal);
  const openItemModal = useStore((s) => s.openItemModal);
  const deleteLocation = useStore((s) => s.deleteLocation);

  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const onDelete = (id: string, name: string) => {
    const cnt = items.filter((i) => i.locId === id).length;
    if (
      window.confirm(
        `¿Eliminar "${name}"?${cnt > 0 ? ` (${cnt} items quedarán sin ubicar)` : ""}`
      )
    )
      deleteLocation(id);
  };

  return (
    <div className="ubi-view">
      <div className="pg-hdr">
        <div>
          <div className="pg-title">Ubicaciones</div>
        </div>
        <div className="hdr-acts">
          <button className="btn pri" onClick={() => openLocationModal()}>
            + Nueva
          </button>
        </div>
      </div>

      {locations.map((loc) => {
        const its = items.filter((i) => i.locId === loc.id);
        const dims = [
          loc.w ? loc.w + "m" : null,
          loc.d ? loc.d + "m" : null,
          loc.h ? loc.h + "m alt." : null,
        ]
          .filter(Boolean)
          .join(" · ");
        const isOpen = open.has(loc.id);
        return (
          <div className="ubi-card" key={loc.id}>
            <div className="ubi-card-hdr" onClick={() => toggle(loc.id)}>
              <span className="ubi-card-name">{loc.name}</span>
              <span className="ubi-card-cnt">
                {its.length} items{dims ? " · " + dims : ""}
              </span>
            </div>
            {isOpen && (
              <div>
                {its.length === 0 ? (
                  <div className="ubi-empty">Sin items asignados</div>
                ) : (
                  its.map((it) => (
                    <div key={it.id} className="ubi-item" onClick={() => openItemModal(it.id)}>
                      <div className="ubi-dot" />
                      <span>{it.name}</span>
                      <span className="ubi-item-freq">{FREQL[it.freq || ""]}</span>
                    </div>
                  ))
                )}
                <div className="ubi-acts">
                  <button className="btn sm" onClick={() => openLocationModal(loc.id)}>
                    Editar
                  </button>
                  <button className="btn sm dan" onClick={() => onDelete(loc.id, loc.name)}>
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
