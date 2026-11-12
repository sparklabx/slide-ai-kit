// Declare a deck as an array of specs, validate it, render it with the active theme.
//   import { buildDeck } from "slide-ai-kit";
//   await buildDeck([{ t: "title", title: "Hello" }, ...], "/abs/out.pptx", { theme });
import PptxGenJS from "pptxgenjs";
import { existsSync, statSync } from "node:fs";
import { S, PAGE, useTheme } from "./templates.mjs";
import defaultTheme from "../themes/default/theme.mjs";

/** Template contracts: required fields and limits (also printed by `slide-ai templates`). */
export const TEMPLATES = {
  title:    { required: ["title"], optional: ["subtitle", "meta"], note: "dark cover slide; \\n breaks the title" },
  section:  { required: ["title"], optional: ["kicker", "desc"], note: "chapter divider; kicker is a big number or label" },
  bullets:  { required: ["title", "items"], optional: ["lead", "size"], limits: "≤ 6 items; an item is a string or {h, t}" },
  twoCol:   { required: ["title", "left", "right"], note: "each column {title, items}, ~5 items" },
  cards:    { required: ["title", "items"], limits: "3–6 cards {title, desc}" },
  kpi:      { required: ["title", "kpis"], optional: ["note"], limits: "≤ 4 {value, label}" },
  goal:     { required: ["statement"], optional: ["eyebrow", "sub", "targets"], limits: "≤ 4 targets {value, label}" },
  timeline: { required: ["title", "steps"], limits: "3–5 steps {title, desc}" },
  stack:    { required: ["title", "layers"], optional: ["side"], limits: "3–6 layers {name, detail}; side {title, items}" },
  flow:     { required: ["title", "steps"], optional: ["lead"], note: "one-row pipeline joined by arrows" },
  table:    { required: ["title", "columns", "rows"], optional: ["lead", "fontSize", "rowH"], note: "columns [{name, w, align}], widths sum ≈ 11.93" },
  tracks:   { required: ["title", "tech", "biz"], optional: ["sync", "syncTitle"], limits: "≤ 6 items per block, ≤ 3 sync items; block.label overrides the header" },
  gantt:    { required: ["title", "periods", "rows"], optional: ["legend"], note: "rows {name, track: tech|biz|both, start, span, label}" },
  planes:   { required: ["title", "left", "right"], optional: ["lead", "arrow"], note: "two boxes {kicker, title, items} with a labelled link" },
  screen:   { required: ["title", "image"], optional: ["lead", "points"], limits: "PNG image; ≤ 4 points {h, t} on the right" },
  hero:     { required: ["title", "image"], optional: ["subtitle"], note: "dark slide with one large PNG" },
  closing:  { required: ["title"], optional: ["subtitle", "contact"] },
};
const PAGED = new Set(Object.keys(TEMPLATES).filter((t) => !["title", "section", "hero", "closing"].includes(t)));

/** Cheap structural checks — much faster than opening the PPTX to find mistakes. */
export function validate(deck) {
  const errs = [];
  deck.forEach((s, i) => {
    const at = `slide ${i + 1} (${s.t})`;
    const spec = TEMPLATES[s.t];
    if (!spec || !S[s.t]) return errs.push(`${at}: unknown template`);
    for (const f of spec.required) if (s[f] == null) errs.push(`${at}: missing "${f}"`);
    if (s.t === "bullets" && s.items?.length > 6) errs.push(`${at}: ${s.items.length} items (max 6) — split the slide`);
    if (s.t === "cards" && (s.items?.length < 3 || s.items?.length > 6)) errs.push(`${at}: cards need 3–6 items`);
    if (s.t === "kpi" && s.kpis?.length > 4) errs.push(`${at}: ≤ 4 kpis`);
    if (s.t === "timeline" && (s.steps?.length < 3 || s.steps?.length > 5)) errs.push(`${at}: timeline needs 3–5 steps`);
    if (s.t === "stack" && (s.layers?.length < 3 || s.layers?.length > 6)) errs.push(`${at}: stack needs 3–6 layers`);
    if (s.t === "table") for (const r of s.rows ?? []) if (r.length !== s.columns?.length) errs.push(`${at}: row has ${r.length} cells, expected ${s.columns?.length}`);
    if (s.t === "tracks") {
      if ((s.tech?.items?.length ?? 0) > 6 || (s.biz?.items?.length ?? 0) > 6) errs.push(`${at}: ≤ 6 items per block`);
      if ((s.sync?.length ?? 0) > 3) errs.push(`${at}: ≤ 3 sync items`);
    }
    if (s.t === "gantt") for (const r of s.rows ?? []) if (r.start < 1 || r.start + r.span - 1 > s.periods.length) errs.push(`${at}: bar "${r.name}" runs past the timeline`);
    if (s.t === "goal" && (s.targets?.length ?? 0) > 4) errs.push(`${at}: ≤ 4 targets`);
    if ((s.t === "screen" || s.t === "hero") && s.image) {
      if (!existsSync(s.image)) errs.push(`${at}: image not found: ${s.image}`);
      else if (!/\.png$/i.test(s.image)) errs.push(`${at}: image must be a PNG`);
    }
    if (s.t === "screen" && (s.points?.length ?? 0) > 4) errs.push(`${at}: ≤ 4 points`);
    if (typeof s.title === "string" && !["title", "closing"].includes(s.t) && s.title.length > 70) errs.push(`${at}: title over 70 characters`);
  });
  return { ok: errs.length === 0, errors: errs };
}

/** Validate → render each slide with the theme → write the .pptx. Returns { path, slides, kb }. */
export async function buildDeck(deck, outPath, { theme = defaultTheme, title, author, company } = {}) {
  const res = validate(deck);
  if (!res.ok) throw new Error("Deck has errors:\n" + res.errors.map((e) => "  - " + e).join("\n"));
  useTheme(theme);

  const p = new PptxGenJS();
  p.defineLayout({ name: "W16x9", width: PAGE.w, height: PAGE.h });
  p.layout = "W16x9";
  p.title = title ?? theme.name ?? "Deck";
  p.author = author ?? theme.name ?? "";
  p.company = company ?? theme.name ?? "";

  let page = 0;
  for (const s of deck) {
    const slide = p.addSlide();
    const paged = PAGED.has(s.t);
    if (paged) page++;
    S[s.t](slide, s, paged ? page : undefined);
  }
  await p.writeFile({ fileName: outPath });
  if (!existsSync(outPath)) throw new Error("no file written");
  return { path: outPath, slides: deck.length, kb: Math.round(statSync(outPath).size / 1024) };
}
