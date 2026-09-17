import { sql } from "@/lib/db";
import type { ItemRow, Location } from "@/lib/types";

export const dynamic = "force-dynamic";

// El driver de Neon devuelve `numeric` y `bigint` como string (para no
// perder precisión). Supabase/PostgREST los devolvía como number: hay que
// convertirlos aquí para no romper el contrato que espera el store.
const toNum = (v: unknown): number | null =>
  v === null || v === undefined ? null : Number(v);

export async function GET() {
  try {
    const [locRows, catRows, itemRows] = await Promise.all([
      sql`select id, name, "desc", w, d, h from locations order by name`,
      sql`select name from categories order by id`,
      sql`select id, name, cat, loc_id, freq, notes from items order by id`,
    ]);

    const locations: Location[] = (locRows as Record<string, unknown>[]).map((r) => ({
      id: r.id as string,
      name: r.name as string,
      desc: r.desc as string,
      w: toNum(r.w),
      d: toNum(r.d),
      h: toNum(r.h),
    }));

    const items: ItemRow[] = (itemRows as Record<string, unknown>[]).map((r) => ({
      id: Number(r.id),
      name: r.name as string,
      cat: r.cat as string,
      loc_id: r.loc_id as string | null,
      freq: r.freq as string | null,
      notes: r.notes as string | null,
    }));

    return Response.json({
      locations,
      categories: (catRows as { name: string }[]).map((c) => c.name),
      items,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al cargar datos";
    return Response.json({ error: msg }, { status: 500 });
  }
}
