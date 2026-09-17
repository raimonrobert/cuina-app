"use client";

import { create } from "zustand";
import { ELS, SUB_LOCS, PARENT_EL } from "@/lib/planData";
import type { Item, ItemRow, Location, SelEl, ViewKey, Freq } from "@/lib/types";

type Panel = "plano" | "inventario" | "ubicaciones";
type MobScreen = "plano" | "detail" | "browse" | "list";
type Filter = "all" | "ok" | "no";
type SbMode = "cat" | "loc";
type BrowseMode = "cat" | "loc";

interface ToastState {
  msg: string;
  type: "" | "g" | "r";
  seq: number;
}

interface ItemInput {
  name: string;
  cat: string;
  locId: string;
  freq: Freq;
  notes: string;
}

interface LocationInput {
  name: string;
  desc: string;
  w: number | null;
  d: number | null;
  h: number | null;
}

interface Store {
  // datos
  locations: Location[];
  categories: string[];
  items: Item[];
  loaded: boolean;
  loadError: string | null;
  load: () => Promise<void>;

  // navegación principal
  panel: Panel;
  setPanel: (p: Panel) => void;

  // navegación móvil
  mobScreen: MobScreen;
  browseMode: BrowseMode;
  mobGo: (dest: "plano" | "ubicaciones" | "cats" | "lista" | "add") => void;
  browseSelect: (type: "cat" | "loc", value: string) => void;

  // plano
  curView: ViewKey;
  selEl: SelEl | null;
  navHistory: SelEl[];
  setView: (v: ViewKey) => void;
  selectElement: (id: string) => void;
  selectByLoc: (locId: string) => void;
  goBack: () => void;
  clearSel: () => void;
  applyEdit: (name: string, w: number, d: number, h: number) => Promise<void>;

  // inventario
  sbMode: SbMode;
  filter: Filter;
  filterCat: string;
  filterLoc: string;
  search: string;
  setSbMode: (m: SbMode) => void;
  setFilter: (f: Filter) => void;
  setFilterCat: (c: string) => void;
  setFilterLoc: (id: string) => void;
  setSearch: (q: string) => void;

  // CRUD
  saveItem: (data: ItemInput, id: number | null) => Promise<void>;
  deleteItem: (id: number) => Promise<void>;
  saveLocation: (data: LocationInput, id: string | null) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;

  // backup / restauración (reemplazo masivo)
  replaceAll: (data: { locations: Location[]; categories: string[]; items: Item[] }) => Promise<boolean>;

  // modales
  modal: { kind: "item" | "location" | null; id: number | string | null };
  openItemModal: (id?: number | null) => void;
  openLocationModal: (id?: string | null) => void;
  closeModal: () => void;

  // toast
  toast: ToastState;
  showToast: (msg: string, type?: "" | "g" | "r") => void;
}

const rowToItem = (r: ItemRow): Item => ({
  id: r.id,
  name: r.name,
  cat: r.cat,
  locId: r.loc_id,
  freq: (r.freq || "") as Freq,
  notes: r.notes || "",
});

const isMob = () => typeof window !== "undefined" && window.innerWidth <= 640;

export const useStore = create<Store>((set, get) => ({
  locations: [],
  categories: [],
  items: [],
  loaded: false,
  loadError: null,

  load: async () => {
    try {
      const res = await fetch("/api/data");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Error al cargar datos");
      set({
        locations: (body.locations as Location[]) || [],
        categories: (body.categories as string[]) || [],
        items: ((body.items as ItemRow[]) || []).map(rowToItem),
        loaded: true,
        loadError: null,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cargar datos";
      set({ loaded: true, loadError: msg });
    }
  },

  panel: "plano",
  setPanel: (p) => set({ panel: p }),

  mobScreen: "plano",
  browseMode: "cat",
  mobGo: (dest) => {
    if (dest === "plano") set({ mobScreen: "plano" });
    else if (dest === "ubicaciones") set({ mobScreen: "browse", browseMode: "loc" });
    else if (dest === "cats") set({ mobScreen: "browse", browseMode: "cat" });
    else if (dest === "lista") set({ mobScreen: "list" });
    else if (dest === "add") get().openItemModal();
  },
  browseSelect: (type, value) => {
    if (type === "cat") set({ filterCat: value, filterLoc: "" });
    else set({ filterLoc: value, filterCat: "" });
    set({ mobScreen: "list" });
  },

  curView: "planta",
  selEl: null,
  navHistory: [],
  setView: (v) => set({ curView: v }),

  selectElement: (id) => {
    const el = ELS.find((e) => e.id === id);
    if (!el || el.type === "void") return;
    const hasSubs = !!SUB_LOCS[el.id];
    let sel: SelEl;
    if (hasSubs) {
      sel = { id: el.id, name: el.name, locId: el.locId, w: el.w, d: el.d, h: el.h, desc: "" };
    } else {
      const loc = get().locations.find((l) => l.id === el.locId);
      sel = loc
        ? { id: el.id, name: loc.name, locId: loc.id, w: loc.w, d: loc.d, h: loc.h, desc: loc.desc }
        : { id: el.id, name: el.name, locId: el.locId, w: el.w, d: el.d, h: el.h, desc: "" };
    }
    set({ selEl: sel, navHistory: [], mobScreen: isMob() ? "detail" : get().mobScreen });
  },

  selectByLoc: (locId) => {
    const loc = get().locations.find((l) => l.id === locId);
    if (!loc) return;
    const parentId = PARENT_EL[locId];
    const cur = get().selEl;
    const hist = [...get().navHistory];
    // Si veníamos del detalle del módulo padre, lo guardamos para "Volver".
    if (parentId && cur && cur.id === parentId) hist.push(cur);
    const sel: SelEl = {
      id: "_" + locId,
      name: loc.name,
      locId,
      w: loc.w,
      d: loc.d,
      h: loc.h,
      desc: loc.desc,
    };
    set({ selEl: sel, navHistory: hist, mobScreen: isMob() ? "detail" : get().mobScreen });
  },

  goBack: () => {
    const hist = [...get().navHistory];
    if (hist.length > 0) {
      const prev = hist.pop()!;
      set({ selEl: prev, navHistory: hist });
    } else {
      set({ selEl: null, mobScreen: isMob() ? "plano" : get().mobScreen });
    }
  },

  clearSel: () =>
    set({ selEl: null, navHistory: [], mobScreen: isMob() ? "plano" : get().mobScreen }),

  applyEdit: async (name, w, d, h) => {
    const sel = get().selEl;
    if (!sel || !sel.locId) return;
    const loc = get().locations.find((l) => l.id === sel.locId);
    if (!loc) return;
    const patch: Partial<Location> = {};
    if (name.trim()) patch.name = name.trim();
    if (w) patch.w = w;
    if (d) patch.d = d;
    if (h) patch.h = h;
    const res = await fetch(`/api/locations/${sel.locId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      get().showToast("Error al guardar", "r");
      return;
    }
    const locations = get().locations.map((l) =>
      l.id === sel.locId ? { ...l, ...patch } : l
    );
    const newSel: SelEl = {
      ...sel,
      name: patch.name ?? sel.name,
      w: patch.w ?? sel.w,
      d: patch.d ?? sel.d,
      h: patch.h ?? sel.h,
    };
    set({ locations, selEl: newSel });
    get().showToast("Guardado ✓", "g");
  },

  sbMode: "cat",
  filter: "all",
  filterCat: "",
  filterLoc: "",
  search: "",
  setSbMode: (m) => set({ sbMode: m, filterCat: "", filterLoc: "" }),
  setFilter: (f) => set({ filter: f }),
  setFilterCat: (c) => set({ filterCat: get().filterCat === c ? "" : c, filterLoc: "" }),
  setFilterLoc: (id) => set({ filterLoc: get().filterLoc === id ? "" : id, filterCat: "" }),
  setSearch: (q) => set({ search: q }),

  saveItem: async (data, id) => {
    const payload = {
      name: data.name.trim(),
      cat: data.cat,
      locId: data.locId || null,
      freq: data.freq || "",
      notes: data.notes.trim(),
    };
    if (id != null) {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return get().showToast("Error al guardar", "r");
      set({
        items: get().items.map((it) =>
          it.id === id ? { ...it, name: payload.name, cat: payload.cat, locId: payload.locId, freq: payload.freq as Freq, notes: payload.notes } : it
        ),
      });
      get().showToast("Actualizado ✓", "g");
    } else {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.item) return get().showToast("Error al añadir", "r");
      set({ items: [...get().items, rowToItem(body.item as ItemRow)] });
      get().showToast("Añadido ✓", "g");
    }
  },

  deleteItem: async (id) => {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) return get().showToast("Error al eliminar", "r");
    set({ items: get().items.filter((it) => it.id !== id) });
    get().showToast("Eliminado", "r");
  },

  saveLocation: async (data, id) => {
    if (id) {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h }),
      });
      if (!res.ok) return get().showToast("Error al guardar", "r");
      set({
        locations: get().locations.map((l) =>
          l.id === id ? { ...l, name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h } : l
        ),
      });
    } else {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.location) return get().showToast("Error al crear", "r");
      set({ locations: [...get().locations, body.location as Location].sort((a, b) => a.name.localeCompare(b.name)) });
    }
    get().showToast("Guardado ✓", "g");
  },

  deleteLocation: async (id) => {
    const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
    if (!res.ok) return get().showToast("Error al eliminar", "r");
    set({
      locations: get().locations.filter((l) => l.id !== id),
      items: get().items.map((it) => (it.locId === id ? { ...it, locId: null } : it)),
    });
    get().showToast("Eliminado", "r");
  },

  replaceAll: async (data) => {
    try {
      const res = await fetch("/api/replace-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("replace-all failed");
      await get().load();
      return true;
    } catch {
      get().showToast("Error al restaurar datos", "r");
      return false;
    }
  },

  modal: { kind: null, id: null },
  openItemModal: (id = null) => set({ modal: { kind: "item", id: id ?? null } }),
  openLocationModal: (id = null) => set({ modal: { kind: "location", id: id ?? null } }),
  closeModal: () => set({ modal: { kind: null, id: null } }),

  toast: { msg: "", type: "", seq: 0 },
  showToast: (msg, type = "") => set({ toast: { msg, type, seq: get().toast.seq + 1 } }),
}));
