"use client";

import { useStore } from "@/store/useStore";

export default function MobBrowse() {
  const browseMode = useStore((s) => s.browseMode);
  const items = useStore((s) => s.items);
  const categories = useStore((s) => s.categories);
  const locations = useStore((s) => s.locations);
  const browseSelect = useStore((s) => s.browseSelect);
  const openItemModal = useStore((s) => s.openItemModal);

  const cards =
    browseMode === "cat"
      ? categories.map((c) => ({
          key: c,
          name: c,
          cnt: items.filter((i) => i.cat === c).length,
          onClick: () => browseSelect("cat", c),
        }))
      : locations.map((l) => ({
          key: l.id,
          name: l.name,
          cnt: items.filter((i) => i.locId === l.id).length,
          onClick: () => browseSelect("loc", l.id),
        }));

  return (
    <div className="mob-browse">
      <div className="mob-browse-top">
        <span className="mob-browse-title">
          {browseMode === "cat" ? "Categorías" : "Ubicaciones"}
        </span>
        <button className="btn pri sm" onClick={() => openItemModal()}>
          + Añadir
        </button>
      </div>
      <div className="mob-browse-list">
        {cards.map((c) => (
          <div className="mob-browse-card" key={c.key} onClick={c.onClick}>
            <span className="mob-browse-card-name">{c.name}</span>
            <div className="mob-browse-card-right">
              <span className={`mob-browse-card-cnt ${c.cnt > 0 ? "has" : ""}`}>{c.cnt}</span>
              <span className="mob-browse-card-arr">›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
