import { sql } from "@/lib/db";
import type { ItemRow } from "@/lib/types";

export const dynamic = "force-dynamic";

function toItemRow(r: Record<string, unknown>): ItemRow {
  return {
    id: Number(r.id),
    name: r.name as string,
    cat: r.cat as string,
    loc_id: r.loc_id as string | null,
    freq: r.freq as string | null,
    notes: r.notes as string | null,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rows = await sql`
      insert into items (name, cat, loc_id, freq, notes)
      values (${body.name}, ${body.cat}, ${body.locId || null}, ${body.freq || ""}, ${body.notes ?? ""})
      returning id, name, cat, loc_id, freq, notes
    `;
    return Response.json({ item: toItemRow(rows[0] as Record<string, unknown>) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al añadir";
    return Response.json({ error: msg }, { status: 500 });
  }
}
