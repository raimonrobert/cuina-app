// Geometría fija del plano de la cocina (no se edita desde la UI, no va a BD).
// Portado del prototipo cocina_app_v2.html.

export const SC = 90; // escala planta: 1m = 90px
export const KW = 5.3; // ancho cocina (m)
export const KH = 3.5; // alto cocina (m)

export type ElType =
  | "column"
  | "fridge"
  | "drawers"
  | "sink"
  | "dishwasher"
  | "oven"
  | "broom"
  | "island"
  | "module"
  | "void";

export interface PlanEl {
  id: string;
  name: string;
  locId: string | null;
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  type: ElType;
  color: string;
}

export const ELS: PlanEl[] = [
  { id: "arm", name: "Despensa", locId: "arm", x: 0.5, y: 0, w: 0.6, d: 0.6, h: 2.5, type: "column", color: "#7a5830" },
  { id: "nev", name: "Nevera", locId: "nev", x: 1.1, y: 0, w: 0.7, d: 0.6, h: 2, type: "fridge", color: "#4a5a68" },
  { id: "m1", name: "Prep.", locId: "m1-arr", x: 1.8, y: 0, w: 0.9, d: 0.6, h: 0.9, type: "drawers", color: "#6a5030" },
  { id: "freg", name: "Fregadero", locId: "freg", x: 2.7, y: 0, w: 0.7, d: 0.6, h: 0.9, type: "sink", color: "#3a5a6a" },
  { id: "lvj", name: "LVJ", locId: "lvj", x: 3.4, y: 0, w: 0.6, d: 0.6, h: 0.9, type: "dishwasher", color: "#4a5a68" },
  { id: "hor", name: "Horno", locId: "hor-hue", x: 4, y: 0, w: 0.6, d: 0.6, h: 2.5, type: "oven", color: "#5a4a3a" },
  { id: "esc", name: "Escobero", locId: "esc", x: 4.6, y: 0, w: 0.7, d: 0.6, h: 2.5, type: "broom", color: "#4a4a3a" },
  { id: "isla-izq", name: "Isla Izq", locId: "isla-izq-arr", x: 1.85, y: 1.65, w: 0.9, d: 0.6, h: 0.9, type: "island", color: "#5a4028" },
  { id: "isla-der", name: "Isla Der", locId: "isla-der-arr", x: 2.75, y: 1.65, w: 0.9, d: 0.6, h: 0.9, type: "island", color: "#5a4028" },
  { id: "esq", name: "Electrodom.", locId: "esq-mes", x: 4.9, y: 2.6, w: 0.4, d: 1, h: 0.9, type: "module", color: "#6a5030" },
  { id: "vb", name: "", locId: null, x: 1.85, y: 2.25, w: 2.1, d: 0.35, h: 0.35, type: "void", color: "#3a3020" },
  { id: "vt", name: "", locId: null, x: 3.65, y: 1.65, w: 0.3, d: 0.95, h: 0.35, type: "void", color: "#3a3020" },
];

export interface Apertura {
  type: "window" | "door";
  side: "south" | "east";
  x: number;
  len: number;
  lbl: string;
}

export const APER: Apertura[] = [
  { type: "window", side: "south", x: 1.35, len: 2.1, lbl: "Ventana balcón 2,1m" },
  { type: "window", side: "east", x: 1.1, len: 1.4, lbl: "Ventana terraza 1,4m" },
  { type: "door", side: "east", x: 2.5, len: 0.8, lbl: "Puerta terraza" },
];

// Elementos con sub-ubicaciones. Esquinero con 3 secciones (decisión de diseño).
export const SUB_LOCS: Record<string, string[]> = {
  "isla-izq": ["isla-izq-arr", "isla-izq-med", "isla-izq-aba"],
  "isla-der": ["isla-der-arr", "isla-der-med", "isla-der-aba"],
  m1: ["m1-arr", "m1-med", "m1-aba"],
  hor: ["hor-hue", "hor-aba1", "hor-aba2"],
  esq: ["esq-arr", "esq-mes", "esq-aba"],
};

// Mapa inverso: locId de sub-ubicación -> id del elemento padre.
export const PARENT_EL: Record<string, string> = {};
Object.entries(SUB_LOCS).forEach(([parentId, childIds]) => {
  childIds.forEach((cid) => {
    PARENT_EL[cid] = parentId;
  });
});

export const FREQC: Record<string, string> = {
  diario: "#5a9a6a",
  semanal: "#c8a050",
  ocasional: "#6a6050",
  "": "#4a4438",
};

export const FREQL: Record<string, string> = {
  diario: "● Diario",
  semanal: "◑ Semanal",
  ocasional: "○ Ocas.",
  "": "—",
};

// Etiqueta de frecuencia para el panel de detalle (sin guion para vacío).
export const FREQ_DETAIL: Record<string, string> = {
  diario: "● Diario",
  semanal: "◑ Semanal",
  ocasional: "○ Ocas.",
  "": "",
};
