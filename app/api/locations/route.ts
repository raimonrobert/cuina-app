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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = "loc_" + Date.now();
    const rows = await sql`
      insert into locations (id, name, "desc", w, d, h)
      values (${id}, ${body.name}, ${body.desc ?? ""}, ${body.w}, ${body.d}, ${body.h})
      returning id, name, "desc", w, d, h
    `;
    return Response.json({ location: toLocation(rows[0] as Record<string, unknown>) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error al crear";
    return Response.json({ error: msg }, { status: 500 });
  }
}
