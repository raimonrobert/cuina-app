// Generadores de SVG del plano y alzados. Portados fielmente del prototipo.
// En vez de onclick inline, los elementos clicables llevan data-el / data-loc;
// el contenedor React delega el click (ver PlanoCanvas).

import { ELS, APER, SUB_LOCS, SC, KW, KH } from "./planData";
import type { Item, Location, SelEl } from "./types";

export interface DrawResult {
  width: number;
  height: number;
  html: string;
}

interface Ctx {
  items: Item[];
  locations: Location[];
  selEl: SelEl | null;
}

const locCount = (items: Item[], locId: string | null | undefined) =>
  locId ? items.filter((i) => i.locId === locId).length : 0;

const subCount = (items: Item[], ids: string[]) =>
  ids.reduce((acc, id) => acc + locCount(items, id), 0);

const getLocItems = (items: Item[], locId: string) =>
  items.filter((i) => i.locId === locId);

// ── PLANTA ──
export function drawPlanta(ctx: Ctx): DrawResult {
  const { items, selEl } = ctx;
  const P = 50,
    W = Math.round(KW * SC),
    H = Math.round(KH * SC),
    ox = P,
    oy = P;
  let s = "";
  s += `<rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="#222018"/>`;
  for (let gx = 0; gx <= KW; gx += 0.5) {
    const px = ox + Math.round(gx * SC);
    s += `<line x1="${px}" y1="${oy}" x2="${px}" y2="${oy + H}" stroke="#2a2820" stroke-width=".5"/>`;
  }
  for (let gy = 0; gy <= KH; gy += 0.5) {
    const py = oy + Math.round(gy * SC);
    s += `<line x1="${ox}" y1="${py}" x2="${ox + W}" y2="${py}" stroke="#2a2820" stroke-width=".5"/>`;
  }
  const W8 = 8;
  s += `<rect x="${ox}" y="${oy}" width="${W}" height="${W8}" fill="#5a5248"/>`;
  s += `<rect x="${ox + W - W8}" y="${oy}" width="${W8}" height="${H}" fill="#5a5248"/>`;
  s += `<rect x="${ox}" y="${oy + H - W8}" width="${W}" height="${W8}" fill="#5a5248"/>`;
  s += `<line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy + H}" stroke="#4a4438" stroke-width="2" stroke-dasharray="8,5"/>`;
  APER.forEach((ap) => {
    if (ap.side === "south") {
      const ax = ox + Math.round(ap.x * SC),
        aw = Math.round(ap.len * SC);
      s += `<rect x="${ax}" y="${oy + H - W8}" width="${aw}" height="${W8}" fill="#3a6a8a"/>`;
      s += `<text x="${ax + aw / 2}" y="${oy + H + 14}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="#4a8aaa">${ap.lbl}</text>`;
    } else {
      const ay = oy + Math.round(ap.x * SC),
        al = Math.round(ap.len * SC);
      s += `<rect x="${ox + W - W8}" y="${ay}" width="${W8}" height="${al}" fill="${ap.type === "door" ? "#3a6a5a" : "#3a6a8a"}"/>`;
      if (ap.type === "door")
        s += `<path d="M ${ox + W - W8} ${ay} Q ${ox + W - 50} ${ay} ${ox + W - 50} ${ay + al}" fill="none" stroke="#3a6a5a" stroke-width="1" stroke-dasharray="4,3"/>`;
    }
  });
  ELS.forEach((el) => {
    const ex = ox + Math.round(el.x * SC),
      ey = oy + Math.round(el.y * SC),
      ew = Math.round(el.w * SC),
      ed = Math.round(el.d * SC);
    const isSel = !!selEl && selEl.id === el.id,
      isVoid = el.type === "void";
    if (isVoid) {
      s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${ed}" fill="${el.color}" stroke="#3a3530" stroke-width=".5" stroke-dasharray="4,3" opacity=".4" rx="1"/>`;
      return;
    }
    const subIds = SUB_LOCS[el.id];
    const cnt = subIds ? subCount(items, subIds) : locCount(items, el.locId);
    s += `<g data-el="${el.id}" style="cursor:pointer">`;
    s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${ed}" fill="${el.color}" stroke="${isSel ? "#c8a050" : "#000"}" stroke-width="${isSel ? 2.5 : 1}" rx="1"/>`;
    if (el.type === "sink") {
      const cw = Math.round(ew * 0.35),
        ch = Math.round(ed * 0.55),
        cy2 = ey + Math.round(ed * 0.2);
      s += `<rect x="${ex + 4}" y="${cy2}" width="${cw}" height="${ch}" fill="#2a4a5a" rx="2"/>`;
      s += `<rect x="${ex + ew - cw - 4}" y="${cy2}" width="${cw}" height="${ch}" fill="#2a4a5a" rx="2"/>`;
    } else if (el.type === "island") {
      s += `<line x1="${ex + 4}" y1="${ey + ed / 2}" x2="${ex + ew - 4}" y2="${ey + ed / 2}" stroke="#7a6040" stroke-width="1"/>`;
      if (el.id === "isla-izq") {
        const pw = Math.round(ew * 0.8),
          ph = Math.round(ed * 0.45),
          px2 = ex + Math.round(ew * 0.1),
          py2 = ey + 4;
        s += `<rect x="${px2}" y="${py2}" width="${pw}" height="${ph}" fill="#222" rx="2"/>`;
        [
          [0.25, 0.35],
          [0.55, 0.35],
          [0.25, 0.72],
          [0.55, 0.72],
        ].forEach(([fx, fy]) => {
          s += `<circle cx="${px2 + Math.round(pw * fx)}" cy="${py2 + Math.round(ph * fy)}" r="5" fill="none" stroke="#c04020" stroke-width="1.2"/>`;
        });
      }
    }
    const fs = ew < 50 ? 7 : ew < 70 ? 8 : 9;
    s += `<text x="${ex + ew / 2}" y="${ey + ed / 2 + fs / 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="${fs}" font-weight="600" fill="${isSel ? "#e0b860" : "#d0c0a0"}" pointer-events="none">${el.name}</text>`;
    if (cnt > 0) {
      s += `<circle cx="${ex + ew - 7}" cy="${ey + 7}" r="7" fill="${isSel ? "#c8a050" : "#5a4030"}"/>`;
      s += `<text x="${ex + ew - 7}" y="${ey + 10}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" font-weight="600" fill="#e8d0a0" pointer-events="none">${cnt}</text>`;
    }
    s += `</g>`;
  });
  const cc = "#6a6050",
    ct = "#8a8070";
  s += `<line x1="${ox}" y1="${oy - 20}" x2="${ox + W}" y2="${oy - 20}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<line x1="${ox}" y1="${oy - 25}" x2="${ox}" y2="${oy - 15}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<line x1="${ox + W}" y1="${oy - 25}" x2="${ox + W}" y2="${oy - 15}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<text x="${ox + W / 2}" y="${oy - 23}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="${ct}">5,30 m</text>`;
  s += `<line x1="${ox + W + 20}" y1="${oy}" x2="${ox + W + 20}" y2="${oy + H}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<line x1="${ox + W + 15}" y1="${oy}" x2="${ox + W + 25}" y2="${oy}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<line x1="${ox + W + 15}" y1="${oy + H}" x2="${ox + W + 25}" y2="${oy + H}" stroke="${cc}" stroke-width=".8"/>`;
  s += `<text x="${ox + W + 32}" y="${oy + H / 2}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="${ct}" transform="rotate(90,${ox + W + 32},${oy + H / 2})">3,50 m</text>`;
  s += `<text x="${ox - 5}" y="${oy + H / 2}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#5a5048" transform="rotate(-90,${ox - 5},${oy + H / 2})">SALÓN</text>`;
  s += `<text x="${ox + W / 2}" y="${oy + H + 28}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#5a5048">BALCÓN</text>`;
  s += `<text x="${ox + W + 42}" y="${oy + H / 2}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#5a5048" transform="rotate(90,${ox + W + 42},${oy + H / 2})">TERRAZA</text>`;
  return { width: W + P * 2, height: H + P * 2, html: s };
}

// ── ALZADO MUEBLES ──
export function drawAlzMuebles(ctx: Ctx): DrawResult {
  const { items, selEl } = ctx;
  const SX = 85,
    SY = 90,
    P = 50,
    W = Math.round(4.8 * SX),
    FH = Math.round(2.5 * SY),
    ox = P,
    oy = P;
  const ENC = Math.round((2.5 - 0.9) * SY);
  let s = "",
    cx = ox;
  s += `<rect x="${ox}" y="${oy}" width="${W}" height="${FH}" fill="#1e1c18"/>`;
  s += `<rect x="${ox - 10}" y="${oy + FH}" width="${W + 20}" height="6" fill="#5a5248"/>`;
  const mods = [
    { id: "arm", locId: "arm", w: 0.6, type: "column", color: "#7a5830", lbl: "Despensa" },
    { id: "nev", locId: "nev", w: 0.7, type: "fridge", color: "#4a5a68", lbl: "Nevera" },
    { id: "m1", locId: "m1-arr", w: 0.9, type: "drawers3", color: "#6a5030", lbl: "Prep." },
    { id: "freg", locId: "freg", w: 0.7, type: "sink", color: "#3a5a6a", lbl: "Freg." },
    { id: "lvj", locId: "lvj", w: 0.6, type: "dishwasher", color: "#4a5a68", lbl: "LVJ" },
    { id: "hor", locId: "hor-hue", w: 0.6, type: "oven", color: "#5a4a3a", lbl: "Horno" },
    { id: "esc", locId: "esc", w: 0.7, type: "broom", color: "#4a4a3a", lbl: "Escob." },
  ];
  mods.forEach((mod) => {
    const mw = Math.round(mod.w * SX),
      lowH = FH - ENC,
      encY = oy + ENC;
    const isSel = !!selEl && selEl.id === mod.id,
      sk = isSel ? "#c8a050" : "#000",
      sw = isSel ? 2.5 : 1;
    s += `<g data-el="${mod.id}" style="cursor:pointer">`;
    if (mod.type === "column") {
      s += `<rect x="${cx}" y="${oy}" width="${mw}" height="${FH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}" rx="1"/>`;
      [0.2, 0.4, 0.6, 0.8].forEach(
        (f) => (s += `<line x1="${cx + 4}" y1="${oy + FH * f}" x2="${cx + mw - 4}" y2="${oy + FH * f}" stroke="#9a7040" stroke-width=".8"/>`)
      );
      [0.1, 0.3, 0.5, 0.7, 0.9].forEach(
        (f) => (s += `<circle cx="${cx + mw - 8}" cy="${oy + FH * f}" r="2.5" fill="#9a7040"/>`)
      );
    } else if (mod.type === "fridge") {
      s += `<rect x="${cx}" y="${oy}" width="${mw}" height="${FH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}" rx="1"/>`;
      s += `<line x1="${cx + 4}" y1="${oy + FH * 0.55}" x2="${cx + mw - 4}" y2="${oy + FH * 0.55}" stroke="#5a6a78" stroke-width="1"/>`;
    } else if (mod.type === "drawers3") {
      const c1 = Math.round(lowH * 0.28),
        c2 = Math.round(lowH * 0.35),
        c3 = lowH - c1 - c2;
      const cajs = [
        { h: c1, locId: "m1-arr", lbl: "utensilios" },
        { h: c2, locId: "m1-med", lbl: "trapos" },
        { h: c3, locId: "m1-aba", lbl: "tuppers" },
      ];
      let yy = encY;
      cajs.forEach((c) => {
        const isC = !!selEl && selEl.locId === c.locId;
        s += `<g data-loc="${c.locId}" style="cursor:pointer">`;
        s += `<rect x="${cx}" y="${yy}" width="${mw}" height="${c.h}" fill="${mod.color}" stroke="${isC ? "#c8a050" : sk}" stroke-width="${isC ? 2.5 : sw}"/>`;
        s += `<circle cx="${cx + mw / 2}" cy="${yy + c.h / 2}" r="3" fill="#9a7040"/>`;
        s += `<text x="${cx + mw / 2}" y="${yy + c.h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#c0a070" pointer-events="none">${c.lbl}</text>`;
        s += `</g>`;
        yy += c.h;
      });
      const eY = oy + Math.round((2.5 - 1.5) * SY);
      s += `<rect x="${cx}" y="${eY}" width="${Math.round(2.2 * SX)}" height="5" fill="#9a7040" rx="1"/>`;
      s += `<text x="${cx + Math.round(1.1 * SX)}" y="${eY - 4}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#8a7050" pointer-events="none">— estante 150cm —</text>`;
    } else if (mod.type === "sink") {
      s += `<rect x="${cx}" y="${encY}" width="${mw}" height="${lowH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}"/>`;
      const fw = Math.round(mw * 0.35),
        fh = 12;
      s += `<rect x="${cx + 4}" y="${encY - fh - 2}" width="${fw}" height="${fh}" rx="2" fill="#2a4a5a" stroke="#3a6a8a"/>`;
      s += `<rect x="${cx + mw - fw - 4}" y="${encY - fh - 2}" width="${fw}" height="${fh}" rx="2" fill="#2a4a5a" stroke="#3a6a8a"/>`;
      s += `<text x="${cx + mw / 2}" y="${encY + lowH * 0.28}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#6a9aaa" pointer-events="none">🗑 orgánica</text>`;
      s += `<text x="${cx + mw / 2}" y="${encY + lowH * 0.72}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#6a9aaa" pointer-events="none">🗑 resto</text>`;
    } else if (mod.type === "dishwasher") {
      s += `<rect x="${cx}" y="${encY}" width="${mw}" height="${lowH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}"/>`;
      s += `<rect x="${cx + 4}" y="${encY + 4}" width="${mw - 8}" height="${lowH - 8}" rx="2" fill="#3a4a58"/>`;
      s += `<text x="${cx + mw / 2}" y="${encY + lowH / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#8a9aaa" pointer-events="none">apoyo</text>`;
    } else if (mod.type === "oven") {
      s += `<rect x="${cx}" y="${oy}" width="${mw}" height="${FH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}" rx="1"/>`;
      const hH = Math.round(FH * 0.28),
        pH = 14,
        oH = Math.round(FH * 0.22),
        c1h = Math.round((FH - hH - pH - oH) * 0.5),
        c2h = FH - hH - pH - oH - c1h;
      s += `<rect x="${cx}" y="${oy}" width="${mw}" height="${hH}" fill="#2a2520"/>`;
      s += `<text x="${cx + mw / 2}" y="${oy + hH / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#5a5048" pointer-events="none">pendiente</text>`;
      s += `<rect x="${cx}" y="${oy + hH}" width="${mw}" height="${pH}" fill="#6a6050"/>`;
      s += `<rect x="${cx}" y="${oy + hH + pH}" width="${mw}" height="${oH}" fill="#3a3028"/>`;
      s += `<rect x="${cx + 4}" y="${oy + hH + pH + 4}" width="${mw - 8}" height="${oH - 8}" rx="1" fill="#222"/>`;
      s += `<text x="${cx + mw / 2}" y="${oy + hH + pH + oH / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#8a7060" pointer-events="none">HORNO</text>`;
      const isC1 = !!selEl && selEl.locId === "hor-aba1",
        isC2 = !!selEl && selEl.locId === "hor-aba2";
      s += `<g data-loc="hor-aba1" style="cursor:pointer"><rect x="${cx}" y="${oy + hH + pH + oH}" width="${mw}" height="${c1h}" fill="${mod.color}" stroke="${isC1 ? "#c8a050" : sk}" stroke-width="${isC1 ? 2.5 : sw}"/>`;
      s += `<text x="${cx + mw / 2}" y="${oy + hH + pH + oH + c1h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#c0a070" pointer-events="none">pendiente</text></g>`;
      s += `<g data-loc="hor-aba2" style="cursor:pointer"><rect x="${cx}" y="${oy + hH + pH + oH + c1h}" width="${mw}" height="${c2h}" fill="${mod.color}" stroke="${isC2 ? "#c8a050" : sk}" stroke-width="${isC2 ? 2.5 : sw}"/>`;
      s += `<text x="${cx + mw / 2}" y="${oy + hH + pH + oH + c1h + c2h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#c0a070" pointer-events="none">bandejas</text></g>`;
    } else if (mod.type === "broom") {
      s += `<rect x="${cx}" y="${oy}" width="${mw}" height="${FH}" fill="${mod.color}" stroke="${sk}" stroke-width="${sw}" rx="1"/>`;
      s += `<line x1="${cx + 4}" y1="${oy + FH * 0.5}" x2="${cx + mw - 4}" y2="${oy + FH * 0.5}" stroke="#5a5040" stroke-width="1" stroke-dasharray="3,2"/>`;
      s += `<text x="${cx + mw / 2}" y="${oy + FH * 0.72}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#8a8070" pointer-events="none">♻</text>`;
    }
    if (!["column", "fridge", "oven", "broom"].includes(mod.type))
      s += `<rect x="${cx}" y="${oy + ENC - 5}" width="${mw}" height="5" fill="#c0b090"/>`;
    const subIdsAlz = SUB_LOCS[mod.id];
    const cnt = subIdsAlz ? subCount(items, subIdsAlz) : locCount(items, mod.locId);
    if (cnt > 0) {
      s += `<circle cx="${cx + mw - 8}" cy="${oy + 8}" r="8" fill="${isSel ? "#c8a050" : "#5a4030"}"/>`;
      s += `<text x="${cx + mw - 8}" y="${oy + 11}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" font-weight="600" fill="#e8d0a0" pointer-events="none">${cnt}</text>`;
    }
    s += `<text x="${cx + mw / 2}" y="${oy + FH + 16}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#8a8070" pointer-events="none">${mod.lbl}</text>`;
    s += `</g>`;
    cx += mw;
  });
  s += `<line x1="${ox}" y1="${oy + FH + 40}" x2="${ox + W}" y2="${oy + FH + 40}" stroke="#6a6050" stroke-width=".8"/>`;
  s += `<line x1="${ox}" y1="${oy + FH + 36}" x2="${ox}" y2="${oy + FH + 44}" stroke="#6a6050" stroke-width=".8"/>`;
  s += `<line x1="${ox + W}" y1="${oy + FH + 36}" x2="${ox + W}" y2="${oy + FH + 44}" stroke="#6a6050" stroke-width=".8"/>`;
  s += `<text x="${ox + W / 2}" y="${oy + FH + 54}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="#8a8070">4,80 m</text>`;
  return { width: W + P * 2, height: FH + P * 2 + 55, html: s };
}

// ── ALZADO ISLA ──
export function drawAlzIsla(ctx: Ctx): DrawResult {
  const { selEl } = ctx;
  const SX = 120,
    SY = 100,
    P = 40,
    W = Math.round(2.1 * SX),
    H = Math.round(0.9 * SY),
    ox = P,
    oy = P;
  const ENC = 4,
    bH = H - ENC,
    c1 = Math.round(bH * 0.28),
    c2 = Math.round(bH * 0.35),
    c3 = bH - c1 - c2,
    cw = Math.round(0.9 * SX);
  let s = "";
  s += `<text x="${ox + W / 2}" y="${oy - 12}" text-anchor="middle" font-family="Playfair Display" font-size="11" font-style="italic" fill="#c8a050">Isla — lado muebles</text>`;
  s += `<rect x="${ox}" y="${oy}" width="${W}" height="${ENC}" fill="#c0b090"/>`;
  const izq = [
    { h: c1, locId: "isla-izq-arr", lbl: "especias" },
    { h: c2, locId: "isla-izq-med", lbl: "sartenes" },
    { h: c3, locId: "isla-izq-aba", lbl: "ollas" },
  ];
  let yy = oy + ENC;
  izq.forEach((c) => {
    const isSel = !!selEl && selEl.locId === c.locId;
    s += `<g data-loc="${c.locId}" style="cursor:pointer"><rect x="${ox}" y="${yy}" width="${cw}" height="${c.h}" fill="#5a4028" stroke="${isSel ? "#c8a050" : "#3a2818"}" stroke-width="${isSel ? 2.5 : 1}"/><circle cx="${ox + cw / 2}" cy="${yy + c.h / 2}" r="3" fill="#9a7040"/><text x="${ox + cw / 2}" y="${yy + c.h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#c0a070" pointer-events="none">${c.lbl}</text></g>`;
    yy += c.h;
  });
  const der = [
    { h: c1, locId: "isla-der-arr", lbl: "cubiertos" },
    { h: c2, locId: "isla-der-med", lbl: "platos·tazas" },
    { h: c3, locId: "isla-der-aba", lbl: "vasos·copas" },
  ];
  yy = oy + ENC;
  der.forEach((c) => {
    const isSel = !!selEl && selEl.locId === c.locId;
    s += `<g data-loc="${c.locId}" style="cursor:pointer"><rect x="${ox + cw}" y="${yy}" width="${cw}" height="${c.h}" fill="#5a4028" stroke="${isSel ? "#c8a050" : "#3a2818"}" stroke-width="${isSel ? 2.5 : 1}"/><circle cx="${ox + cw + cw / 2}" cy="${yy + c.h / 2}" r="3" fill="#9a7040"/><text x="${ox + cw + cw / 2}" y="${yy + c.h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#c0a070" pointer-events="none">${c.lbl}</text></g>`;
    yy += c.h;
  });
  s += `<line x1="${ox + cw}" y1="${oy}" x2="${ox + cw}" y2="${oy + H}" stroke="#2a1808" stroke-width="2"/>`;
  s += `<text x="${ox + cw / 2}" y="${oy + H + 18}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#8a8070">Cajón izq. 0,90m</text>`;
  s += `<text x="${ox + cw + cw / 2}" y="${oy + H + 18}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#8a8070">Cajón der. 0,90m</text>`;
  const oy2 = oy + H + 45,
    vH = Math.round(0.35 * SY);
  s += `<text x="${ox + W / 2}" y="${oy2 - 10}" text-anchor="middle" font-family="Playfair Display" font-size="11" font-style="italic" fill="#c8a050">Isla — lado balcón</text>`;
  s += `<rect x="${ox}" y="${oy2}" width="${W}" height="${ENC}" fill="#c0b090"/>`;
  s += `<rect x="${ox}" y="${oy2 + ENC}" width="${W}" height="${vH}" fill="#3a2e20" stroke="#2a2018" stroke-dasharray="6,3" rx="1"/>`;
  s += `<text x="${ox + W / 2}" y="${oy2 + ENC + vH / 2 + 5}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="#6a6050">voladizo 35cm — taburetes</text>`;
  const sp = Math.round(W / 3);
  [sp * 0.5, sp * 1.5, sp * 2.5].forEach((sx) => {
    s += `<rect x="${ox + sx - 20}" y="${oy2 + ENC + vH + 6}" width="40" height="50" fill="#2a2018" stroke="#4a3828" rx="3"/>`;
  });
  return { width: W + P * 2, height: oy2 + ENC + vH + 65, html: s };
}

// ── ALZADO ESQUINERO (3 secciones) ──
export function drawAlzEsq(ctx: Ctx): DrawResult {
  const { items, selEl } = ctx;
  const SX = 140,
    SY = 90,
    P = 40;
  const W = Math.round(1.0 * SX);
  const H = Math.round(2.0 * SY);
  const TW = W + P * 2,
    TH = H + P * 2 + 40;
  const ox = P,
    oy = P;
  let s = "";

  s += `<text x="${ox + W / 2}" y="${oy - 12}" text-anchor="middle" font-family="Playfair Display" font-size="11" font-style="italic" fill="#c8a050">Mueble esquinero — 1,0m × 2,0m alt.</text>`;
  s += `<rect x="${ox}" y="${oy}" width="${W}" height="${H}" fill="#1e1c18"/>`;
  s += `<rect x="${ox - 8}" y="${oy + H}" width="${W + 16}" height="6" fill="#5a5248"/>`;

  // 3 secciones: cajones arriba (0.55), mesada (0.5), cajones abajo (0.9) ≈ 2.0m
  const sections = [
    { locId: "esq-arr", h: Math.round(0.55 * SY), label: "cajones arriba", color: "#6a5030", split: true },
    { locId: "esq-mes", h: Math.round(0.5 * SY), label: "mesada", color: "#8a6838", isMesada: true },
    { locId: "esq-aba", h: Math.round(0.9 * SY), label: "cajones abajo", color: "#6a5030", split: true },
  ];

  let yy = oy;
  sections.forEach((sec) => {
    const isSel = !!selEl && selEl.locId === sec.locId;
    const its = getLocItems(items, sec.locId);
    s += `<g data-loc="${sec.locId}" style="cursor:pointer">`;
    s += `<rect x="${ox}" y="${yy}" width="${W}" height="${sec.h}" fill="${sec.color}" stroke="${isSel ? "#c8a050" : "#3a2818"}" stroke-width="${isSel ? 2.5 : 1}"/>`;

    if (sec.isMesada) {
      s += `<rect x="${ox}" y="${yy}" width="${W}" height="5" fill="#c0b090"/>`;
      s += `<rect x="${ox + 8}" y="${yy + 10}" width="38" height="28" rx="3" fill="#3a3028" stroke="#5a4a38"/>`;
      s += `<text x="${ox + 27}" y="${yy + 28}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#8a8070" pointer-events="none">microondas</text>`;
      s += `<circle cx="${ox + W - 22}" cy="${yy + 20}" r="12" fill="#3a3028" stroke="#5a4a38"/>`;
      s += `<text x="${ox + W - 22}" y="${yy + 24}" text-anchor="middle" font-family="Archivo Narrow" font-size="6" fill="#8a8070" pointer-events="none">caf.</text>`;
      if (its.length > 0) {
        s += `<text x="${ox + W / 2}" y="${yy + sec.h - 8}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#c0a070" pointer-events="none">${its
          .slice(0, 3)
          .map((i) => i.name.split(" ")[0])
          .join(" · ")}</text>`;
      }
    } else {
      // Línea decorativa que sugiere 2 cajones (sigue siendo 1 sección clicable)
      if (sec.split)
        s += `<line x1="${ox + 6}" y1="${yy + sec.h / 2}" x2="${ox + W - 6}" y2="${yy + sec.h / 2}" stroke="#3a2818" stroke-width="1" stroke-dasharray="3,2"/>`;
      s += `<circle cx="${ox + W / 2}" cy="${yy + sec.h / 2}" r="3" fill="#9a7040"/>`;
      if (its.length > 0) {
        s += `<text x="${ox + W / 2}" y="${yy + sec.h / 2 - 8}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#c0a070" pointer-events="none">${its.length} item${its.length > 1 ? "s" : ""}</text>`;
      } else {
        s += `<text x="${ox + W / 2}" y="${yy + sec.h / 2 - 8}" text-anchor="middle" font-family="Archivo Narrow" font-size="7" fill="#5a5040" pointer-events="none">${sec.label}</text>`;
      }
    }

    if (its.length > 0) {
      s += `<circle cx="${ox + W - 8}" cy="${yy + 8}" r="8" fill="${isSel ? "#c8a050" : "#5a4030"}"/>`;
      s += `<text x="${ox + W - 8}" y="${yy + 11}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" font-weight="600" fill="#e8d0a0" pointer-events="none">${its.length}</text>`;
    }

    s += `<line x1="${ox + W + 8}" y1="${yy}" x2="${ox + W + 8}" y2="${yy + sec.h}" stroke="#6a6050" stroke-width="0.8"/>`;
    s += `<line x1="${ox + W + 4}" y1="${yy}" x2="${ox + W + 12}" y2="${yy}" stroke="#6a6050" stroke-width="0.8"/>`;
    s += `<line x1="${ox + W + 4}" y1="${yy + sec.h}" x2="${ox + W + 12}" y2="${yy + sec.h}" stroke="#6a6050" stroke-width="0.8"/>`;
    const hm = sec.h / SY;
    s += `<text x="${ox + W + 22}" y="${yy + sec.h / 2 + 3}" text-anchor="middle" font-family="Archivo Narrow" font-size="8" fill="#8a8070" transform="rotate(90,${ox + W + 22},${yy + sec.h / 2})" pointer-events="none">${hm.toFixed(2)}m</text>`;

    s += `</g>`;
    s += `<line x1="${ox}" y1="${yy + sec.h}" x2="${ox + W}" y2="${yy + sec.h}" stroke="#2a1808" stroke-width="1.5"/>`;
    yy += sec.h;
  });

  s += `<line x1="${ox - 20}" y1="${oy}" x2="${ox - 20}" y2="${oy + H}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<line x1="${ox - 25}" y1="${oy}" x2="${ox - 15}" y2="${oy}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<line x1="${ox - 25}" y1="${oy + H}" x2="${ox - 15}" y2="${oy + H}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<text x="${ox - 32}" y="${oy + H / 2}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="#c0392b" transform="rotate(-90,${ox - 32},${oy + H / 2})">2,0 m</text>`;
  s += `<line x1="${ox}" y1="${oy + H + 20}" x2="${ox + W}" y2="${oy + H + 20}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<line x1="${ox}" y1="${oy + H + 15}" x2="${ox}" y2="${oy + H + 25}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<line x1="${ox + W}" y1="${oy + H + 15}" x2="${ox + W}" y2="${oy + H + 25}" stroke="#c0392b" stroke-width="0.8"/>`;
  s += `<text x="${ox + W / 2}" y="${oy + H + 34}" text-anchor="middle" font-family="Archivo Narrow" font-size="9" fill="#c0392b">1,0 m</text>`;

  return { width: TW + 20, height: TH + 10, html: s };
}

export function drawView(view: string, ctx: Ctx): DrawResult {
  if (view === "planta") return drawPlanta(ctx);
  if (view === "alzado-muebles") return drawAlzMuebles(ctx);
  if (view === "alzado-isla") return drawAlzIsla(ctx);
  return drawAlzEsq(ctx);
}
