import { sql } from "@/lib/db";
import type { Location } from "@/lib/types";

export const dynamic = "force-dynamic";

function toLocation(r: Record<string, unknown>): Location {
  return {
    id: r.id as string,
    name: r.name as string,
    desc: r.desc as string,
    w: r.w === null ? null : Number(r.w),
    d: r.d === null ? null : Number(r.d),
    h: r.h === null ? null : Number(r.h),
  };
}

// Actualización parcial: solo se pisan las claves presentes en el body
// (usado tanto por "editar ubicación" -- envía todo -- como por
// "Aplicar medidas" del plano -- envía solo lo cambiado).
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const rows = await sql`
      update locations set
        name = coalesce(${body.name ?? null}, name),
        "desc" = coalesce(${body.desc ?? null}, "desc"),
        w = coalesce(${body.w ?? null}, w),
        d = coalesce(${body.d ?? null}, d),
        h = coalesce(${body.h ?? null}, h)
      where id = ${id}
      returning id, name, "desc", w, d, h
    `;
    if (rows.length === 0) {
      return Response.json({ error: "Ubicación no encontrada" }, { status: 404 });
    }
    return Response.json({ location: toLocation(rows[0] as Record<string, unknown>) });
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
    await sql`delete from locations where id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al eliminar";
    return Response.json({ error: msg }, { status: 500 });
  }
}
