// slide-ai-kit templates: fixed-grid slide layouts on pptxgenjs (16:9, inches).
// Every colour, font and logo comes from the active theme (useTheme); nothing brand-specific lives here.
import { readFileSync } from "node:fs";

export const PAGE = { w: 13.33, h: 7.5 };
const M = 0.7;
// Active theme state — filled by useTheme(); templates read these at render time.
export const T = {};
export const RAMP = [];
export const LOGO = { word: null, wordWhite: null, mark: null, markWhite: null };
export const BRAND = { name: "", footer: "", mark: false, sectionLogo: true };

/** Activate a theme: { name, colors, ramp, fonts: {head, body}, logos, footer, brand }. */
export function useTheme(theme) {
  for (const k of Object.keys(T)) delete T[k];
  Object.assign(T, theme.colors, { head: theme.fonts?.head ?? "Arial", body: theme.fonts?.body ?? "Arial" });
  RAMP.splice(0, RAMP.length, ...(theme.ramp?.length ? theme.ramp : [T.dark, T.primary]));
  Object.assign(LOGO, { word: null, wordWhite: null, mark: null, markWhite: null }, theme.logos);
  Object.assign(BRAND, { name: theme.name ?? "", footer: theme.footer ?? "", mark: false, sectionLogo: true }, theme.brand);
}

// Image logo when the theme has one, else the brand name as text (so a logo-less theme still reads).
const addLogo = (slide, L, x, y, w, color = T.white, size = 18) => {
  if (L) slide.addImage({ path: L.path, x, y, w, h: w / L.aspect });
  else if (BRAND.name) slide.addText(BRAND.name, { x, y, w, h: size / 40, fontFace: T.head, fontSize: size, bold: true, color, valign: "top" });
};
const ramp = (i) => RAMP[i % RAMP.length];

// ---- shared chrome for content slides (light background) ----
function chrome(slide, page) {
  addLogo(slide, LOGO.word, PAGE.w - M - 1.25, 0.36, 1.25, T.dark, 14);
  slide.addShape("rect", { x: M, y: 7.02, w: PAGE.w - 2 * M, h: 0.012, fill: { color: T.line } });
  slide.addText(BRAND.footer, { x: M, y: 7.06, w: 8.5, h: 0.3, fontFace: T.body, fontSize: 8, color: T.muted });
  if (page != null) slide.addText(`${page}`, { x: PAGE.w - M - 3, y: 7.06, w: 3, h: 0.3, align: "right", fontFace: T.body, fontSize: 8, color: T.muted });
}
function heading(slide, title) {
  const fs = title.length > 46 ? 21 : title.length > 38 ? 23 : 25;   // shrink so long titles stay on one line
  slide.addText(title, { x: M, y: 0.68, w: PAGE.w - 2 * M - 3.1, h: 0.8, fontFace: T.head, fontSize: fs, bold: true, color: T.ink, valign: "top", lineSpacingMultiple: 1.0 });
  slide.addShape("rect", { x: M, y: 1.52, w: 0.9, h: 0.08, fill: { color: T.primary } });
}
const bulletRuns = (items, { size = 15, color = T.ink } = {}) =>
  items.map((t) => {
    const [a, b] = typeof t === "object" ? [t.h, t.t] : [null, t];
    return a
      ? { text: `${a}  `, options: { bold: true, color: T.ink, bullet: { code: "2022", indent: 16 }, breakLine: false, fontSize: size } }
      : { text: b ?? a, options: { color, bullet: { code: "2022", indent: 16 }, breakLine: true, fontSize: size } };
  });
// items are "text" or {h: "Bold label:", t: " the rest"}
function addBullets(slide, items, box, opt = {}) {
  const runs = [];
  for (const t of items) {
    if (typeof t === "object") {
      runs.push({ text: t.h + " ", options: { bold: true, color: T.ink, fontSize: opt.size ?? 15, bullet: { code: "2022", indent: 16 } } });
      runs.push({ text: t.t, options: { color: opt.color ?? T.muted, fontSize: opt.size ?? 15, breakLine: true } });
    } else {
      runs.push({ text: t, options: { color: opt.color ?? T.ink, fontSize: opt.size ?? 15, bullet: { code: "2022", indent: 16 }, breakLine: true } });
    }
  }
  slide.addText(runs, { ...box, fontFace: T.body, valign: "top", lineSpacingMultiple: opt.ls ?? 1.4 });
}

export const S = {
  title(slide, c) {
    slide.background = { color: T.dark };
    slide.addShape("rect", { x: PAGE.w - 0.22, y: 0, w: 0.22, h: PAGE.h, fill: { color: T.primary } });
    slide.addShape("rect", { x: PAGE.w - 0.30, y: 0, w: 0.08, h: PAGE.h, fill: { color: T.accent } });
    if (BRAND.mark && LOGO.markWhite && LOGO.wordWhite) { addLogo(slide, LOGO.markWhite, M, 0.55, 1.0); addLogo(slide, LOGO.wordWhite, M + 1.18, 0.55 + (1.0 / LOGO.markWhite.aspect - 2.4 / LOGO.wordWhite.aspect) / 2, 2.4); }
    else if (LOGO.wordWhite) addLogo(slide, LOGO.wordWhite, M, 0.7, 2.4);
    else addLogo(slide, null, M, 0.7, 8, T.white, 30);
    slide.addShape("rect", { x: M, y: 2.95, w: 1.35, h: 0.12, fill: { color: T.accent } });
    slide.addText(c.title, { x: M, y: 3.2, w: PAGE.w - 2 * M - 0.6, h: 2.0, fontFace: T.head, fontSize: 40, bold: true, color: T.white, valign: "top", lineSpacingMultiple: 1.02 });
    if (c.subtitle) slide.addText(c.subtitle, { x: M, y: 5.35, w: PAGE.w - 2 * M - 2.2, h: 0.9, fontFace: T.body, fontSize: 17, color: T.softInk, valign: "top", lineSpacingMultiple: 1.2 });
    if (c.meta) slide.addText(c.meta, { x: M, y: 6.78, w: 8, h: 0.4, fontFace: T.body, fontSize: 11, color: T.muted });
  },

  section(slide, c) {
    slide.background = { color: T.dark };
    slide.addShape("rect", { x: 0, y: 0, w: 0.18, h: PAGE.h, fill: { color: T.primary } });
    if (BRAND.sectionLogo && LOGO.wordWhite) addLogo(slide, LOGO.wordWhite, PAGE.w - M - 1.5, 0.55, 1.5);
    if (c.kicker) slide.addText(String(c.kicker), { x: M, y: 1.5, w: 5, h: 1.9, fontFace: T.head, fontSize: 96, bold: true, color: T.accent });
    slide.addShape("rect", { x: M + 0.04, y: 3.75, w: 1.3, h: 0.1, fill: { color: T.primary } });
    slide.addText(c.title, { x: M, y: 3.95, w: PAGE.w - 2 * M, h: 1.5, fontFace: T.head, fontSize: 33, bold: true, color: T.white, valign: "top", lineSpacingMultiple: 1.02 });
    if (c.desc) slide.addText(c.desc, { x: M, y: 5.45, w: PAGE.w - 2 * M - 1.5, h: 1.2, fontFace: T.body, fontSize: 14, color: T.softInk, valign: "top", lineSpacingMultiple: 1.3 });
  },

  bullets(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    let y = 1.85;
    if (c.lead) { slide.addText(c.lead, { x: M, y, w: PAGE.w - 2 * M, h: 0.7, fontFace: T.body, fontSize: 14, italic: true, color: T.primaryDeep, valign: "top", lineSpacingMultiple: 1.2 }); y += 0.85; }
    addBullets(slide, c.items, { x: M, y, w: PAGE.w - 2 * M, h: 6.6 - y }, { size: c.size ?? 15 });
    chrome(slide, page);
  },

  twoCol(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const colW = (PAGE.w - 2 * M - 0.5) / 2, y0 = 1.85, h = 4.75, headH = 0.62;
    [[c.left, M, 0], [c.right, M + colW + 0.5, 1]].forEach(([col, x, i]) => {
      slide.addShape("roundRect", { x, y: y0, w: colW, h, rectRadius: 0.06, fill: { color: T.soft }, line: { color: T.line, width: 1 } });
      slide.addShape("rect", { x, y: y0, w: colW, h: headH, fill: { color: ramp(i === 0 ? 0 : 2) } });
      slide.addText(col.title, { x: x + 0.25, y: y0, w: colW - 0.5, h: headH, valign: "middle", fontFace: T.head, fontSize: 16, bold: true, color: T.white });
      addBullets(slide, col.items, { x: x + 0.3, y: y0 + headH + 0.3, w: colW - 0.6, h: h - headH - 0.5 }, { size: 17, ls: 1.6 });
    });
    chrome(slide, page);
  },

  cards(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const n = c.items.length, cols = n <= 3 ? n : n === 4 ? 2 : 3, rows = Math.ceil(n / cols);
    const gap = 0.35, w = (PAGE.w - 2 * M - gap * (cols - 1)) / cols;
    const areaY = 1.8, areaH = 5.0, h = (areaH - gap * (rows - 1)) / rows;
    c.items.forEach((it, i) => {
      const x = M + (i % cols) * (w + gap), y = areaY + Math.floor(i / cols) * (h + gap);
      slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.05, fill: { color: T.soft }, line: { color: T.line, width: 1 } });
      slide.addShape("rect", { x, y, w, h: 0.11, fill: { color: ramp(i) } });
      slide.addText(it.title, { x: x + 0.28, y: y + 0.28, w: w - 0.56, h: 0.7, fontFace: T.head, fontSize: 14.5, bold: true, color: T.ink, valign: "top", lineSpacingMultiple: 1.0 });
      if (it.desc) slide.addText(it.desc, { x: x + 0.28, y: y + 0.95, w: w - 0.56, h: h - 1.1, fontFace: T.body, fontSize: 11.5, color: T.muted, valign: "top", lineSpacingMultiple: 1.2 });
    });
    chrome(slide, page);
  },

  kpi(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const n = c.kpis.length, gap = 0.45, w = (PAGE.w - 2 * M - gap * (n - 1)) / n;
    const y0 = 2.3, h = 3.0;
    c.kpis.forEach((k, i) => {
      const x = M + i * (w + gap);
      slide.addShape("roundRect", { x, y: y0, w, h, rectRadius: 0.06, fill: { color: T.soft }, line: { color: T.line, width: 1 } });
      slide.addShape("rect", { x, y: y0, w, h: 0.12, fill: { color: ramp(i) } });
      slide.addText(String(k.value), { x, y: y0 + 0.6, w, h: 1.1, align: "center", fontFace: T.head, fontSize: 40, bold: true, color: ramp(i) });
      slide.addText(k.label, { x: x + 0.25, y: y0 + 1.8, w: w - 0.5, h: 1.0, align: "center", fontFace: T.body, fontSize: 13, bold: true, color: T.ink, valign: "top", lineSpacingMultiple: 1.15 });
    });
    if (c.note) slide.addText(c.note, { x: M, y: y0 + h + 0.35, w: PAGE.w - 2 * M, h: 0.5, align: "center", fontFace: T.body, fontSize: 11, italic: true, color: T.muted });
    chrome(slide, page);
  },

  timeline(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const n = c.steps.length, w = (PAGE.w - 2 * M) / n, cy = 2.95, r = 0.42;
    slide.addShape("rect", { x: M + w / 2, y: cy - 0.015, w: PAGE.w - 2 * M - w, h: 0.03, fill: { color: T.line } });
    c.steps.forEach((st, i) => {
      const cx = M + w * i + w / 2;
      slide.addShape("ellipse", { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: ramp(i) } });
      slide.addText(String(i + 1), { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, align: "center", valign: "middle", fontFace: T.head, fontSize: 20, bold: true, color: T.white });
      slide.addText(st.title, { x: cx - w / 2 + 0.12, y: cy + 0.65, w: w - 0.24, h: 0.85, align: "center", fontFace: T.head, fontSize: 13.5, bold: true, color: T.ink, valign: "top", lineSpacingMultiple: 1.05 });
      if (st.desc) slide.addText(st.desc, { x: cx - w / 2 + 0.12, y: cy + 1.5, w: w - 0.24, h: 2.4, align: "center", fontFace: T.body, fontSize: 10.5, color: T.muted, valign: "top", lineSpacingMultiple: 1.15 });
    });
    chrome(slide, page);
  },

  // kiến trúc phân tầng: các band ngang chảy trên→dưới, side rail dọc cho lớp xuyên suốt
  stack(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const hasSide = !!c.side;
    const bandW = hasSide ? 8.55 : PAGE.w - 2 * M;
    const n = c.layers.length, areaY = 1.8, areaH = 5.0, gap = 0.26;
    const bandH = (areaH - gap * (n - 1)) / n;
    c.layers.forEach((L, i) => {
      const y = areaY + i * (bandH + gap);
      slide.addShape("rect", { x: M, y, w: bandW, h: bandH, fill: { color: ramp(i) } });
      slide.addText(L.name, { x: M + 0.3, y, w: bandW * 0.4, h: bandH, fontFace: T.head, fontSize: 14.5, bold: true, color: T.white, valign: "middle" });
      if (L.detail) slide.addText(L.detail, { x: M + bandW * 0.42, y, w: bandW * 0.55, h: bandH, fontFace: T.body, fontSize: 11, color: T.white, valign: "middle", align: "right" });
    });
    if (hasSide) {
      const x = M + bandW + 0.35, w = PAGE.w - M - x;
      slide.addShape("rect", { x, y: areaY, w, h: areaH, fill: { color: T.ink } });
      slide.addText(c.side.title, { x: x + 0.2, y: areaY + 0.2, w: w - 0.4, h: 0.9, fontFace: T.head, fontSize: 13, bold: true, color: T.primary, valign: "top", lineSpacingMultiple: 1.05 });
      slide.addText((c.side.items ?? []).map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 10 }, breakLine: true } })),
        { x: x + 0.2, y: areaY + 1.15, w: w - 0.4, h: areaH - 1.35, fontFace: T.body, fontSize: 11, color: T.white, lineSpacingMultiple: 1.45, valign: "top" });
    }
    chrome(slide, page);
  },

  // one-row pipeline: chips joined by arrows, a caption under each chip
  flow(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    if (c.lead) slide.addText(c.lead, { x: M, y: 1.75, w: PAGE.w - 2 * M, h: 0.5, fontFace: T.body, fontSize: 13, italic: true, color: T.primaryDeep });
    const m = c.steps.length, y0 = 3.0, chipH = 0.95, arrowW = 0.5;
    const availW = PAGE.w - 2 * M, chipW = (availW - arrowW * (m - 1)) / m;
    c.steps.forEach((st, j) => {
      const x = M + j * (chipW + arrowW);
      slide.addShape("roundRect", { x, y: y0, w: chipW, h: chipH, rectRadius: 0.08, fill: { color: ramp(j) } });
      slide.addText(st.title, { x: x + 0.1, y: y0, w: chipW - 0.2, h: chipH, align: "center", valign: "middle", fontFace: T.head, fontSize: 13, bold: true, color: T.white });
      if (st.desc) slide.addText(st.desc, { x: x, y: y0 + chipH + 0.2, w: chipW, h: 1.6, align: "center", fontFace: T.body, fontSize: 10.5, color: T.muted, valign: "top", lineSpacingMultiple: 1.2 });
      if (j < m - 1) slide.addText("→", { x: x + chipW - 0.05, y: y0, w: arrowW + 0.1, h: chipH, align: "center", valign: "middle", fontFace: T.body, fontSize: 22, bold: true, color: T.muted });
    });
    chrome(slide, page);
  },

  table(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    if (c.lead) slide.addText(c.lead, { x: M, y: 1.62, w: PAGE.w - 2 * M, h: 0.4, fontFace: T.body, fontSize: 12, italic: true, color: T.primaryDeep });
    const y = c.lead ? 2.05 : 1.75;
    const header = c.columns.map((col) => ({ text: col.name, options: { fill: { color: T.ink }, color: T.white, bold: true, fontSize: 12, valign: "middle", align: col.align ?? "left" } }));
    const body = c.rows.map((row, ri) =>
      row.map((cell, ci) => ({
        text: String(cell),
        options: { fill: { color: ri % 2 ? T.soft : T.white }, color: T.ink, fontSize: c.fontSize ?? 11, valign: "middle", align: c.columns[ci].align ?? "left" },
      }))
    );
    slide.addTable([header, ...body], {
      x: M, y, w: PAGE.w - 2 * M, colW: c.columns.map((col) => col.w),
      border: { type: "solid", pt: 0.75, color: T.line }, fontFace: T.body,
      rowH: c.rowH ?? 0.4, margin: [4, 6, 4, 6], valign: "middle", autoPage: false,
    });
    chrome(slide, page);
  },

  // goal slide: one big statement + up to 4 measurable targets
  goal(slide, c, page) {
    slide.background = { color: T.paper };
    slide.addText(String(c.eyebrow ?? "GOAL").toUpperCase(), { x: M, y: 0.85, w: PAGE.w - 2 * M - 1.5, h: 0.4, fontFace: T.head, fontSize: 14, bold: true, color: T.primary, charSpacing: 2 });
    slide.addShape("rect", { x: M, y: 1.4, w: 1.2, h: 0.1, fill: { color: T.accent } });
    slide.addText(c.statement, { x: M, y: 1.7, w: PAGE.w - 2 * M - 0.8, h: 2.4, fontFace: T.head, fontSize: 29, bold: true, color: T.ink, valign: "top", lineSpacingMultiple: 1.12 });
    if (c.sub) slide.addText(c.sub, { x: M, y: 4.25, w: PAGE.w - 2 * M - 0.8, h: 0.8, fontFace: T.body, fontSize: 15, italic: true, color: T.muted, valign: "top", lineSpacingMultiple: 1.25 });
    const ts = c.targets ?? [];
    if (ts.length) {
      const gap = 0.45, w = (PAGE.w - 2 * M - gap * (ts.length - 1)) / ts.length, y0 = 5.15, h = 1.4;
      ts.forEach((k, i) => {
        const x = M + i * (w + gap);
        slide.addShape("roundRect", { x, y: y0, w, h, rectRadius: 0.06, fill: { color: T.soft }, line: { color: T.line, width: 1 } });
        slide.addShape("rect", { x, y: y0, w, h: 0.11, fill: { color: ramp(i) } });
        slide.addText(String(k.value), { x: x + 0.22, y: y0 + 0.28, w: w - 0.44, h: 0.6, fontFace: T.head, fontSize: 26, bold: true, color: ramp(i) });
        slide.addText(k.label, { x: x + 0.24, y: y0 + 0.9, w: w - 0.48, h: 0.45, fontFace: T.body, fontSize: 12, color: T.ink, valign: "top", lineSpacingMultiple: 1.1 });
      });
    }
    chrome(slide, page);
  },

  // hai khối Kỹ thuật ↔ Kinh doanh + dải "Phối hợp" phía dưới — mỗi slide = một giai đoạn
  tracks(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const colW = (PAGE.w - 2 * M - 0.5) / 2, y0 = 1.8, h = 3.35, headH = 0.55;
    const cols = [
      [c.tech, M, T.primary, T.white, c.tech.label ?? "TECHNICAL"],
      [c.biz, M + colW + 0.5, T.accent, T.ink, c.biz.label ?? "BUSINESS"],
    ];
    for (const [col, x, hc, tc, label] of cols) {
      slide.addShape("roundRect", { x, y: y0, w: colW, h, rectRadius: 0.06, fill: { color: T.soft }, line: { color: T.line, width: 1 } });
      slide.addShape("rect", { x, y: y0, w: colW, h: headH, fill: { color: hc } });
      slide.addText(label, { x: x + 0.25, y: y0, w: colW - 0.5, h: headH, valign: "middle", fontFace: T.head, fontSize: 13.5, bold: true, color: tc, charSpacing: 1 });
      addBullets(slide, col.items, { x: x + 0.3, y: y0 + headH + 0.18, w: colW - 0.6, h: h - headH - 0.35 }, { size: 12.5, ls: 1.3, color: T.ink });
    }
    const sy = y0 + h + 0.2, sh = 1.4;
    slide.addShape("rect", { x: M, y: sy, w: PAGE.w - 2 * M, h: sh, fill: { color: T.ink } });
    slide.addShape("rect", { x: M, y: sy, w: 0.12, h: sh, fill: { color: T.accent } });
    slide.addText(c.syncTitle ?? "COORDINATION", { x: M + 0.35, y: sy + 0.12, w: 8, h: 0.35, fontFace: T.head, fontSize: 12.5, bold: true, color: T.accent, charSpacing: 1 });
    slide.addText((c.sync ?? []).map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true } })),
      { x: M + 0.35, y: sy + 0.52, w: PAGE.w - 2 * M - 0.7, h: sh - 0.62, fontFace: T.body, fontSize: 12, color: T.white, valign: "top", lineSpacingMultiple: 1.25 });
    chrome(slide, page);
  },

  // Gantt: rows = workstreams, columns = periods; bars coloured by track (tech/biz/both)
  gantt(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const leg = [[c.legend?.tech ?? "Technical", T.primary], [c.legend?.biz ?? "Business", T.accent], [c.legend?.both ?? "Joint", T.ink]];
    let lx = PAGE.w - M - 5.4;
    for (const [lb, cl] of leg) {
      slide.addShape("rect", { x: lx, y: 1.62, w: 0.25, h: 0.18, fill: { color: cl } });
      slide.addText(lb, { x: lx + 0.32, y: 1.55, w: 1.4, h: 0.34, valign: "middle", fontFace: T.body, fontSize: 10.5, color: T.ink });
      lx += 1.8;
    }
    const labelW = 3.4, gx = M + labelW, gw = PAGE.w - M - gx;
    const n = c.periods.length, cw = gw / n;
    const headY = 2.1, rowsY = 2.55, rowsBottom = 6.7, rowsH = rowsBottom - rowsY;
    const rows = c.rows, rh = rowsH / rows.length;
    c.periods.forEach((pr, i) => {
      const x = gx + i * cw;
      slide.addShape("rect", { x, y: headY, w: cw - 0.03, h: 0.38, fill: { color: T.panel } });
      slide.addText(pr, { x, y: headY, w: cw, h: 0.38, align: "center", valign: "middle", fontFace: T.head, fontSize: 10, bold: true, color: T.ink });
      slide.addShape("rect", { x, y: rowsY, w: 0.008, h: rowsH, fill: { color: T.line } });
    });
    slide.addShape("rect", { x: gx + n * cw, y: rowsY, w: 0.008, h: rowsH, fill: { color: T.line } });
    rows.forEach((r, i) => {
      const y = rowsY + i * rh;
      if (i % 2) slide.addShape("rect", { x: M, y, w: PAGE.w - 2 * M, h: rh, fill: { color: T.soft } });
      slide.addText(r.name, { x: M + 0.1, y, w: labelW - 0.2, h: rh, valign: "middle", fontFace: T.body, fontSize: 11, bold: true, color: T.ink });
      const color = r.track === "biz" ? T.accent : r.track === "both" ? T.ink : T.primary;
      const tcol = r.track === "biz" ? T.ink : T.white;
      const bx = gx + (r.start - 1) * cw + 0.06, bw = r.span * cw - 0.12, by = y + rh * 0.2, bh = rh * 0.6;
      slide.addShape("roundRect", { x: bx, y: by, w: bw, h: bh, rectRadius: 0.05, fill: { color } });
      if (r.label) slide.addText(r.label, { x: bx + 0.08, y: by, w: bw - 0.16, h: bh, valign: "middle", fontFace: T.body, fontSize: 9.5, bold: true, color: tcol });
    });
    chrome(slide, page);
  },

  // screenshot + up to 4 key points on the right; image sized by its own aspect (PNG header)
  screen(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    const buf = readFileSync(c.image), iw = buf.readUInt32BE(16), ih = buf.readUInt32BE(20);
    const hasSide = !!(c.points && c.points.length);
    const top = c.lead ? 2.25 : 1.78, maxH = 6.9 - top, maxW = hasSide ? 8.6 : PAGE.w - 2 * M;
    if (c.lead) slide.addText(c.lead, { x: M, y: 1.72, w: PAGE.w - 2 * M, h: 0.5, fontFace: T.body, fontSize: 13, color: T.muted, valign: "top" });
    let w = maxW, h = w * ih / iw; if (h > maxH) { h = maxH; w = h * iw / ih; }
    const x = M, y = top;
    slide.addShape("roundRect", { x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08, rectRadius: 0.04, fill: { color: T.white }, line: { color: T.line, width: 1 }, shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "000000", opacity: 0.12 } });
    slide.addImage({ path: c.image, x, y, w, h });
    if (hasSide) {
      const sx = x + w + 0.45, sw = PAGE.w - M - sx;
      let yy = top + 0.05;
      const ph = Math.min(1.25, (maxH - 0.05) / c.points.length);
      c.points.forEach((pt, i) => {
        slide.addShape("rect", { x: sx, y: yy + 0.04, w: 0.07, h: ph - 0.25, fill: { color: i % 2 ? T.dark : T.primary } });
        slide.addText(pt.h, { x: sx + 0.2, y: yy, w: sw - 0.2, h: 0.36, fontFace: T.head, fontSize: 12.5, bold: true, color: T.ink, valign: "top" });
        slide.addText(pt.t, { x: sx + 0.2, y: yy + 0.36, w: sw - 0.2, h: ph - 0.45, fontFace: T.body, fontSize: 10.5, color: T.muted, valign: "top", lineSpacingMultiple: 1.15 });
        yy += ph;
      });
    }
    chrome(slide, page);
  },

  // two planes: control plane (left) <- agent dials out <- data plane in the customer's cloud (right)
  planes(slide, c, page) {
    slide.background = { color: T.paper };
    heading(slide, c.title);
    if (c.lead) slide.addText(c.lead, { x: M, y: 1.72, w: PAGE.w - 2 * M, h: 0.5, fontFace: T.body, fontSize: 13, color: T.muted });
    const y0 = 2.35, h = 4.4, mid = 1.9, bw = (PAGE.w - 2 * M - mid) / 2;
    const box = (b, x, fill, tc) => {
      slide.addShape("roundRect", { x, y: y0, w: bw, h, rectRadius: 0.06, fill: { color: fill }, line: { color: fill === T.paper ? T.line : fill, width: 1 } });
      slide.addText(b.kicker ?? "", { x: x + 0.3, y: y0 + 0.2, w: bw - 0.6, h: 0.3, fontFace: T.head, fontSize: 10, bold: true, color: tc === T.white ? T.accent : T.primaryDeep, charSpacing: 1.5 });
      slide.addText(b.title, { x: x + 0.3, y: y0 + 0.5, w: bw - 0.6, h: 0.5, fontFace: T.head, fontSize: 18, bold: true, color: tc });
      const items = b.items.map((t) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: true } }));
      slide.addText(items, { x: x + 0.3, y: y0 + 1.1, w: bw - 0.6, h: h - 1.3, fontFace: T.body, fontSize: 12, color: tc === T.white ? T.softInk : T.ink, valign: "top", lineSpacingMultiple: 1.35 });
    };
    box(c.left, M, T.soft, T.ink);
    box(c.right, M + bw + mid, T.dark, T.white);
    const ax = M + bw + 0.15, aw = mid - 0.3, ay = y0 + h / 2 - 0.6;
    slide.addText("◀───────", { x: ax, y: ay, w: aw, h: 0.5, align: "center", fontFace: T.body, fontSize: 16, color: T.primary, bold: true });
    slide.addText(c.arrow ?? "", { x: ax, y: ay + 0.5, w: aw, h: 1.2, align: "center", fontFace: T.body, fontSize: 10, color: T.muted, valign: "top" });
    chrome(slide, page);
  },

  // product overview: navy slide, one big full-app screenshot under a short title
  hero(slide, c) {
    slide.background = { color: T.dark };
    if (LOGO.wordWhite) addLogo(slide, LOGO.wordWhite, PAGE.w - M - 1.25, 0.36, 1.25);
    slide.addText(c.title, { x: M, y: 0.32, w: PAGE.w - 2 * M - 2, h: 0.6, fontFace: T.head, fontSize: 24, bold: true, color: T.white, valign: "top" });
    if (c.subtitle) slide.addText(c.subtitle, { x: M, y: 0.9, w: PAGE.w - 2 * M - 2, h: 0.4, fontFace: T.body, fontSize: 13, color: T.softInk, valign: "top" });
    const buf = readFileSync(c.image), iw = buf.readUInt32BE(16), ih = buf.readUInt32BE(20);
    const top = 1.5, maxH = PAGE.h - top - 0.3; let w = PAGE.w - 2 * M, h = w * ih / iw; if (h > maxH) { h = maxH; w = h * iw / ih; }
    const x = (PAGE.w - w) / 2;
    slide.addShape("roundRect", { x: x - 0.05, y: top - 0.05, w: w + 0.1, h: h + 0.1, rectRadius: 0.05, fill: { color: T.white }, shadow: { type: "outer", blur: 12, offset: 3, angle: 90, color: "000000", opacity: 0.35 } });
    slide.addImage({ path: c.image, x, y: top, w, h });
  },

  closing(slide, c) {
    slide.background = { color: T.dark };
    slide.addShape("rect", { x: 0, y: 0, w: 0.18, h: PAGE.h, fill: { color: T.primary } });
    slide.addShape("rect", { x: PAGE.w - 0.18, y: 0, w: 0.18, h: PAGE.h, fill: { color: T.accent } });
    if (BRAND.mark && LOGO.markWhite && LOGO.wordWhite) { addLogo(slide, LOGO.markWhite, (PAGE.w - 1.3) / 2, 0.9, 1.3); addLogo(slide, LOGO.wordWhite, (PAGE.w - 2.6) / 2, 2.35, 2.6); }
    else if (LOGO.wordWhite) addLogo(slide, LOGO.wordWhite, (PAGE.w - 3.0) / 2, 1.6, 3.0);
    else if (BRAND.name) slide.addText(BRAND.name, { x: M, y: 1.9, w: PAGE.w - 2 * M, h: 1.0, align: "center", fontFace: T.head, fontSize: 40, bold: true, color: T.white });
    slide.addText(c.title, { x: M, y: 3.4, w: PAGE.w - 2 * M, h: 1.2, align: "center", fontFace: T.head, fontSize: 38, bold: true, color: T.white });
    if (c.subtitle) slide.addText(c.subtitle, { x: M, y: 4.6, w: PAGE.w - 2 * M, h: 0.8, align: "center", fontFace: T.body, fontSize: 16, color: T.softInk, valign: "top", lineSpacingMultiple: 1.25 });
    if (c.contact) slide.addText(c.contact, { x: M, y: 5.75, w: PAGE.w - 2 * M, h: 0.5, align: "center", fontFace: T.body, fontSize: 14, color: T.softInk });
  },
};
