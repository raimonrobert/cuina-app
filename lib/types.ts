// Tipos del dominio de la app de cocina.

export interface Location {
  id: string;
  name: string;
  desc: string;
  w: number | null;
  d: number | null;
  h: number | null;
}

export interface Item {
  id: number;
  name: string;
  cat: string;
  locId: string | null; // null = pendiente (sin ubicar)
  freq: Freq;
  notes: string;
}

export type Freq = "" | "diario" | "semanal" | "ocasional";

export type ViewKey = "planta" | "alzado-muebles" | "alzado-isla" | "alzado-esq";

// Elemento seleccionado en el plano. Puede ser un módulo del plano (ELS)
// o una sub-ubicación concreta (sintética, con id "_<locId>").
export interface SelEl {
  id: string;
  name: string;
  locId: string | null;
  w?: number | null;
  d?: number | null;
  h?: number | null;
  desc?: string;
}

// Fila tal cual viene de Supabase (snake_case en items).
export interface ItemRow {
  id: number;
  name: string;
  cat: string;
  loc_id: string | null;
  freq: string | null;
  notes: string | null;
}
