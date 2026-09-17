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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const rows = await sql`
      update items set
        name = ${body.name},
        cat = ${body.cat},
        loc_id = ${body.locId || null},
        freq = ${body.freq || ""},
        notes = ${body.notes ?? ""}
      where id = ${id}
      returning id, name, cat, loc_id, freq, notes
    `;
    if (rows.length === 0) {
      return Response.json({ error: "Item no encontrado" }, { status: 404 });
    }
    return Response.json({ item: toItemRow(rows[0] as Record<string, unknown>) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al guardar";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`delete from items where id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar";
    return Response.json({ error: msg }, { status: 500 });
  }
}
