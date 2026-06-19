"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { SUB_LOCS, FREQ_DETAIL } from "@/lib/planData";
import type { Item } from "@/lib/types";

export default function PlanoDetail() {
  const selEl = useStore((s) => s.selEl);
  const locations = useStore((s) => s.locations);
  const items = useStore((s) => s.items);
  const selectByLoc = useStore((s) => s.selectByLoc);
  const goBack = useStore((s) => s.goBack);
  const clearSel = useStore((s) => s.clearSel);
  const applyEdit = useStore((s) => s.applyEdit);
  const openItemModal = useStore((s) => s.openItemModal);

  const [name, setName] = useState("");
  const [w, setW] = useState("");
  const [d, setD] = useState("");
  const [h, setH] = useState("");

  // Sincroniza los campos de edición cuando cambia el elemento seleccionado.
  useEffect(() => {
    if (!selEl) return;
    setName(selEl.name ?? "");
    setW(selEl.w ? String(selEl.w) : "");
    setD(selEl.d ? String(selEl.d) : "");
    setH(selEl.h ? String(selEl.h) : "");
  }, [selEl]);

  if (!selEl) {
    return (
      <div className="plano-side">
        <div className="side-hdr">
          <div>
            <div className="side-title">Detalle</div>
            <div className="side-sub">Pulsa un elemento del plano</div>
          </div>
        </div>
        <div className="side-body">
          <div className="side-empty">← Selecciona un elemento</div>
        </div>
      </div>
    );
  }

  const getLocItems = (locId: string): Item[] =>
    items.filter((i) => i.locId === locId);

  const subLocIds = SUB_LOCS[selEl.id];

  const itemRow = (it: Item) => (
    <div key={it.id} className="loc-item" onClick={() => openItemModal(it.id)}>
      <div className="loc-dot" />
      <span>{it.name}</span>
      <span className="loc-item-freq">{FREQ_DETAIL[it.freq] || ""}</span>
    </div>
  );

  return (
    <div className="plano-side">
      <div className="side-hdr">
        <div>
          <div className="side-title">Detalle</div>
          <div className="side-sub">{selEl.name}</div>
        </div>
        <button className="btn sm" onClick={goBack}>
          ← Volver
        </button>
      </div>

      <div className="side-body">
        <div className="el-name">{selEl.name}</div>
        {selEl.desc ? <div className="el-desc">{selEl.desc}</div> : null}
        <div className="dims">
          {selEl.w ? <span className="dim">A: {selEl.w}m</span> : null}
          {selEl.d ? <span className="dim">F: {selEl.d}m</span> : null}
          {selEl.h ? <span className="dim">H: {selEl.h}m</span> : null}
        </div>

        {subLocIds ? (
          subLocIds.map((locId) => {
            const loc = locations.find((l) => l.id === locId);
            if (!loc) return null;
            const its = getLocItems(locId);
            return (
              <div key={locId} className="subloc-card">
                <div className="subloc-hdr" onClick={() => selectByLoc(locId)}>
                  <span className="subloc-name">
                    {loc.name.replace(/.*?—\s*/, "")}
                  </span>
                  <span className="subloc-cnt">{its.length} items</span>
                </div>
                {its.length === 0 ? (
                  <div className="subloc-empty">Sin items</div>
                ) : (
                  its.map(itemRow)
                )}
              </div>
            );
          })
        ) : (
          <>
            <div className="items-title">
              {selEl.locId ? getLocItems(selEl.locId).length : 0} item
              {(selEl.locId ? getLocItems(selEl.locId).length : 0) !== 1 ? "s" : ""}
            </div>
            {selEl.locId && getLocItems(selEl.locId).length > 0 ? (
              getLocItems(selEl.locId).map(itemRow)
            ) : (
              <div className="subloc-empty">Sin items asignados</div>
            )}
          </>
        )}
      </div>

      <div className="edit-sec">
        <div className="edit-lbl">Editar medidas</div>
        <div className="edit-row">
          <span className="edit-label">Nombre</span>
          <input className="edit-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="edit-row">
          <span className="edit-label">Ancho</span>
          <input className="edit-input" type="number" step="0.05" value={w} onChange={(e) => setW(e.target.value)} />
          <span className="unit">m</span>
        </div>
        <div className="edit-row">
          <span className="edit-label">Fondo</span>
          <input className="edit-input" type="number" step="0.05" value={d} onChange={(e) => setD(e.target.value)} />
          <span className="unit">m</span>
        </div>
        <div className="edit-row">
          <span className="edit-label">Alto</span>
          <input className="edit-input" type="number" step="0.05" value={h} onChange={(e) => setH(e.target.value)} />
          <span className="unit">m</span>
        </div>
        <div className="edit-btns">
          <button
            className="btn pri"
            style={{ flex: 1 }}
            onClick={() =>
              applyEdit(name, parseFloat(w) || 0, parseFloat(d) || 0, parseFloat(h) || 0)
            }
          >
            ✓ Aplicar
          </button>
          <button className="btn" onClick={clearSel}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
