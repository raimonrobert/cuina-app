"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
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
      const [locRes, catRes, itemRes] = await Promise.all([
        supabase.from("locations").select("id,name,desc,w,d,h").order("name"),
        supabase.from("categories").select("name").order("id"),
        supabase.from("items").select("id,name,cat,loc_id,freq,notes").order("id"),
      ]);
      if (locRes.error) throw locRes.error;
      if (catRes.error) throw catRes.error;
      if (itemRes.error) throw itemRes.error;
      set({
        locations: (locRes.data as Location[]) || [],
        categories: ((catRes.data as { name: string }[]) || []).map((c) => c.name),
        items: ((itemRes.data as ItemRow[]) || []).map(rowToItem),
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
    const { error } = await supabase.from("locations").update(patch).eq("id", sel.locId);
    if (error) {
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
      loc_id: data.locId || null,
      freq: data.freq || "",
      notes: data.notes.trim(),
    };
    if (id != null) {
      const { error } = await supabase.from("items").update(payload).eq("id", id);
      if (error) return get().showToast("Error al guardar", "r");
      set({
        items: get().items.map((it) =>
          it.id === id ? { ...it, name: payload.name, cat: payload.cat, locId: payload.loc_id, freq: payload.freq as Freq, notes: payload.notes } : it
        ),
      });
      get().showToast("Actualizado ✓", "g");
    } else {
      const { data: row, error } = await supabase
        .from("items")
        .insert(payload)
        .select("id,name,cat,loc_id,freq,notes")
        .single();
      if (error || !row) return get().showToast("Error al añadir", "r");
      set({ items: [...get().items, rowToItem(row as ItemRow)] });
      get().showToast("Añadido ✓", "g");
    }
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) return get().showToast("Error al eliminar", "r");
    set({ items: get().items.filter((it) => it.id !== id) });
    get().showToast("Eliminado", "r");
  },

  saveLocation: async (data, id) => {
    if (id) {
      const { error } = await supabase
        .from("locations")
        .update({ name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h })
        .eq("id", id);
      if (error) return get().showToast("Error al guardar", "r");
      set({
        locations: get().locations.map((l) =>
          l.id === id ? { ...l, name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h } : l
        ),
      });
    } else {
      const newId = "loc_" + Date.now();
      const { data: row, error } = await supabase
        .from("locations")
        .insert({ id: newId, name: data.name.trim(), desc: data.desc.trim(), w: data.w, d: data.d, h: data.h })
        .select("id,name,desc,w,d,h")
        .single();
      if (error || !row) return get().showToast("Error al crear", "r");
      set({ locations: [...get().locations, row as Location].sort((a, b) => a.name.localeCompare(b.name)) });
    }
    get().showToast("Guardado ✓", "g");
  },

  deleteLocation: async (id) => {
    const { error } = await supabase.from("locations").delete().eq("id", id);
    if (error) return get().showToast("Error al eliminar", "r");
    set({
      locations: get().locations.filter((l) => l.id !== id),
      items: get().items.map((it) => (it.locId === id ? { ...it, locId: null } : it)),
    });
    get().showToast("Eliminado", "r");
  },

  replaceAll: async (data) => {
    try {
      // Borrar en orden seguro respecto a la FK items.loc_id -> locations.id
      let res = await supabase.from("items").delete().neq("id", -1);
      if (res.error) throw res.error;
      res = await supabase.from("locations").delete().neq("id", "__none__");
      if (res.error) throw res.error;
      res = await supabase.from("categories").delete().neq("id", -1);
      if (res.error) throw res.error;

      if (data.locations.length) {
        res = await supabase.from("locations").insert(
          data.locations.map((l) => ({ id: l.id, name: l.name, desc: l.desc, w: l.w, d: l.d, h: l.h }))
        );
        if (res.error) throw res.error;
      }
      if (data.categories.length) {
        res = await supabase.from("categories").insert(data.categories.map((name) => ({ name })));
        if (res.error) throw res.error;
      }
      if (data.items.length) {
        res = await supabase.from("items").insert(
          data.items.map((it) => ({
            id: it.id,
            name: it.name,
            cat: it.cat,
            loc_id: it.locId || null,
            freq: it.freq || "",
            notes: it.notes || "",
          }))
        );
        if (res.error) throw res.error;
      }
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
