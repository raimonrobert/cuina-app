"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { Freq } from "@/lib/types";

function ItemModal({ id }: { id: number | null }) {
  const items = useStore((s) => s.items);
  const categories = useStore((s) => s.categories);
  const locations = useStore((s) => s.locations);
  const saveItem = useStore((s) => s.saveItem);
  const deleteItem = useStore((s) => s.deleteItem);
  const closeModal = useStore((s) => s.closeModal);
  const showToast = useStore((s) => s.showToast);

  const editing = id != null ? items.find((i) => i.id === id) ?? null : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [cat, setCat] = useState(editing?.cat ?? "");
  const [locId, setLocId] = useState(editing?.locId ?? "");
  const [freq, setFreq] = useState<Freq>(editing?.freq ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const onSave = async () => {
    if (!name.trim()) return showToast("Nombre obligatorio", "r");
    if (!cat) return showToast("Selecciona categoría", "r");
    await saveItem({ name, cat, locId, freq, notes }, editing ? editing.id : null);
    closeModal();
  };

  const onDelete = async () => {
    if (!editing) return;
    if (!window.confirm(`¿Eliminar "${editing.name}"?`)) return;
    await deleteItem(editing.id);
    closeModal();
  };

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal">
        <div className="modal-hdr">
          <span className="modal-title">{editing ? "Editar" : "Nuevo elemento"}</span>
          <button className="modal-x" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-body">
          <div className="fg">
            <label>Nombre *</label>
            <input className="fi" value={name} placeholder="Nombre" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="frow">
            <div className="fg">
              <label>Categoría *</label>
              <select className="fs" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="">— selec. —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="fg">
              <label>Ubicación</label>
              <select className="fs" value={locId ?? ""} onChange={(e) => setLocId(e.target.value)}>
                <option value="">— sin definir —</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="fg">
            <label>Frecuencia</label>
            <select className="fs" value={freq} onChange={(e) => setFreq(e.target.value as Freq)}>
              <option value="">— sin definir —</option>
              <option value="diario">● A diario</option>
              <option value="semanal">◑ Semanal</option>
              <option value="ocasional">○ Ocasional</option>
            </select>
          </div>
          <div className="fg">
            <label>Notas</label>
            <textarea className="ft" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="modal-foot">
          {editing && (
            <button className="btn dan" style={{ marginRight: "auto" }} onClick={onDelete}>
              ✕ Eliminar
            </button>
          )}
          <button className="btn" onClick={closeModal}>Cancelar</button>
          <button className="btn pri" onClick={onSave}>✓ {editing ? "Guardar" : "Añadir"}</button>
        </div>
      </div>
    </div>
  );
}

function LocationModal({ id }: { id: string | null }) {
  const locations = useStore((s) => s.locations);
  const saveLocation = useStore((s) => s.saveLocation);
  const closeModal = useStore((s) => s.closeModal);
  const showToast = useStore((s) => s.showToast);

  const editing = id ? locations.find((l) => l.id === id) ?? null : null;

  const [name, setName] = useState(editing?.name ?? "");
  const [desc, setDesc] = useState(editing?.desc ?? "");
  const [w, setW] = useState(editing?.w != null ? String(editing.w) : "");
  const [d, setD] = useState(editing?.d != null ? String(editing.d) : "");
  const [h, setH] = useState(editing?.h != null ? String(editing.h) : "");

  const onSave = async () => {
    if (!name.trim()) return showToast("Nombre obligatorio", "r");
    await saveLocation(
      {
        name,
        desc,
        w: parseFloat(w) || null,
        d: parseFloat(d) || null,
        h: parseFloat(h) || null,
      },
      editing ? editing.id : null
    );
    closeModal();
  };

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <div className="modal">
        <div className="modal-hdr">
          <span className="modal-title">{editing ? "Editar ubicación" : "Nueva ubicación"}</span>
          <button className="modal-x" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-body">
          <div className="fg">
            <label>Nombre *</label>
            <input className="fi" value={name} placeholder="Nombre" onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="fg">
            <label>Descripción</label>
            <input className="fi" value={desc} placeholder="Descripción" onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="frow">
            <div className="fg">
              <label>Ancho (m)</label>
              <input className="fi" type="number" step="0.05" value={w} onChange={(e) => setW(e.target.value)} />
            </div>
            <div className="fg">
              <label>Fondo (m)</label>
              <input className="fi" type="number" step="0.05" value={d} onChange={(e) => setD(e.target.value)} />
            </div>
            <div className="fg">
              <label>Alto (m)</label>
              <input className="fi" type="number" step="0.05" value={h} onChange={(e) => setH(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={closeModal}>Cancelar</button>
          <button className="btn pri" onClick={onSave}>✓ Guardar</button>
        </div>
      </div>
    </div>
  );
}

export default function Modals() {
  const modal = useStore((s) => s.modal);
  if (modal.kind === "item") return <ItemModal id={(modal.id as number) ?? null} />;
  if (modal.kind === "location") return <LocationModal id={(modal.id as string) ?? null} />;
  return null;
}
