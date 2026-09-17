import { sql } from "@/lib/db";
import type { Location, Item } from "@/lib/types";

export const dynamic = "force-dynamic";

interface ReplaceAllBody {
  locations: Location[];
  categories: string[];
  items: Item[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReplaceAllBody;
    const locations = body.locations ?? [];
    const categories = body.categories ?? [];
    const items = body.items ?? [];

    await sql.transaction((tx) => [
      // Borrar en orden seguro respecto a la FK items.loc_id -> locations.id
      tx`delete from items`,
      tx`delete from locations`,
      tx`delete from categories`,

      tx`
        insert into locations (id, name, "desc", w, d, h)
        select * from unnest(
          ${locations.map((l) => l.id)}::text[],
          ${locations.map((l) => l.name)}::text[],
          ${locations.map((l) => l.desc ?? "")}::text[],
          ${locations.map((l) => l.w)}::numeric[],
          ${locations.map((l) => l.d)}::numeric[],
          ${locations.map((l) => l.h)}::numeric[]
        )
      `,
      tx`
        insert into categories (name)
        select * from unnest(${categories}::text[])
      `,
      tx`
        insert into items (id, name, cat, loc_id, freq, notes)
        select * from unnest(
          ${items.map((i) => i.id)}::bigint[],
          ${items.map((i) => i.name)}::text[],
          ${items.map((i) => i.cat)}::text[],
          ${items.map((i) => i.locId || null)}::text[],
          ${items.map((i) => i.freq || "")}::text[],
          ${items.map((i) => i.notes ?? "")}::text[]
        )
      `,
      tx`select setval(pg_get_serial_sequence('items','id'), coalesce((select max(id) from items), 1))`,
      tx`select setval(pg_get_serial_sequence('categories','id'), coalesce((select max(id) from categories), 1))`,
    ]);

    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al restaurar datos";
    return Response.json({ error: msg }, { status: 500 });
  }
}
