"use client";

import { useMemo, type MouseEvent } from "react";
import { useStore } from "@/store/useStore";
import { drawView } from "@/lib/svg";
import type { ViewKey } from "@/lib/types";

const VIEWS: { key: ViewKey; label: string; opt: string }[] = [
  { key: "planta", label: "Planta", opt: "⊞ Planta" },
  { key: "alzado-muebles", label: "Alzado muebles", opt: "▭ Alzado muebles" },
  { key: "alzado-isla", label: "Alzado isla", opt: "▭ Alzado isla" },
  { key: "alzado-esq", label: "Alzado esquinero", opt: "▭ Alzado esquinero" },
];

export default function PlanoCanvas({ isMobile }: { isMobile: boolean }) {
  const curView = useStore((s) => s.curView);
  const setView = useStore((s) => s.setView);
  const items = useStore((s) => s.items);
  const locations = useStore((s) => s.locations);
  const selEl = useStore((s) => s.selEl);
  const selectElement = useStore((s) => s.selectElement);
  const selectByLoc = useStore((s) => s.selectByLoc);

  const draw = useMemo(
    () => drawView(curView, { items, locations, selEl }),
    [curView, items, locations, selEl]
  );

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    const g = target.closest("[data-loc],[data-el]");
    if (!g) return;
    const loc = g.getAttribute("data-loc");
    const el = g.getAttribute("data-el");
    if (loc) selectByLoc(loc);
    else if (el) selectElement(el);
  };

  return (
    <div className="canvas-area">
      <div className="view-selector">
        {isMobile ? (
          <select
            className="vsel"
            value={curView}
            onChange={(e) => setView(e.target.value as ViewKey)}
          >
            {VIEWS.map((v) => (
              <option key={v.key} value={v.key}>
                {v.opt}
              </option>
            ))}
          </select>
        ) : (
          VIEWS.map((v) => (
            <button
              key={v.key}
              className={`vbtn ${curView === v.key ? "on" : ""}`}
              onClick={() => setView(v.key)}
            >
              {v.label}
            </button>
          ))
        )}
      </div>
      <div className="svg-scroll" onClick={onClick}>
        <svg
          width={draw.width}
          height={draw.height}
          viewBox={`0 0 ${draw.width} ${draw.height}`}
          dangerouslySetInnerHTML={{ __html: draw.html }}
        />
      </div>
    </div>
  );
}
