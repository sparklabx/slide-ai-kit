// Builds one deck that exercises every template, once per bundled theme:
//   node examples/demo.mjs  →  out/demo-default.pptx, out/demo-nodus.pptx
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDeck } from "../src/index.mjs";
import defaultTheme from "../themes/default/theme.mjs";
import nodus from "../themes/nodus/theme.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "out");
const screen = join(HERE, "assets", "screen.png");

const deck = [
  { t: "title", title: "A deck built\nfrom a spec", subtitle: "Every template in slide-ai-kit, rendered with one theme", meta: "Demo · slide-ai-kit" },
  { t: "bullets", title: "Why declarative decks", lead: "The spec is the source; the layout is the kit's job.", items: [
    { h: "Consistent:", t: " every slide sits on the same grid with the theme's colours and fonts." },
    { h: "Checked:", t: " the validator rejects overflowing slides before anything is written." },
    { h: "Re-runnable:", t: " edit the script and rebuild; no hand-placed boxes to drift." },
    "Works with any AI agent that can run Node.js.",
  ] },
  { t: "cards", title: "Cards for parallel ideas", items: [
    { title: "Plan", desc: "Outline one message per slide before building." },
    { title: "Build", desc: "Declare slides as plain objects and call buildDeck." },
    { title: "Render", desc: "Convert to PDF and look at every page." },
    { title: "Fix", desc: "Split crowded slides; never shrink text to fit." },
    { title: "Theme", desc: "Swap colours, fonts and logos in one file." },
    { title: "Ship", desc: "Deliver the .pptx and the .pdf." },
  ] },
  { t: "section", kicker: "01", title: "Data and structure", desc: "KPIs, tables, timelines and architecture." },
  { t: "kpi", title: "Numbers that matter", kpis: [{ value: "17", label: "Templates" }, { value: "2", label: "Bundled themes" }, { value: "1", label: "Dependency" }], note: "Illustrative figures." },
  { t: "goal", eyebrow: "Goal", statement: "Any team can produce an on-brand deck in minutes, from a script.", sub: "Brand rules live in the theme, not in each deck.", targets: [{ value: "< 5 min", label: "first deck" }, { value: "0", label: "hand-placed boxes" }] },
  { t: "table", title: "Tables with fixed column widths", columns: [{ name: "Template", w: 2.6 }, { name: "Use it for", w: 5.6 }, { name: "Limit", w: 3.73 }], rows: [
    ["bullets", "A short list of points", "≤ 6 items"], ["cards", "Parallel ideas", "3–6 cards"], ["timeline", "Ordered steps", "3–5 steps"], ["screen", "A screenshot with notes", "≤ 4 points"],
  ] },
  { t: "timeline", title: "A timeline of steps", steps: [
    { title: "Plan", desc: "Story first." }, { title: "Build", desc: "Spec to .pptx." }, { title: "Render", desc: "PDF self-check." }, { title: "Ship", desc: "Hand over." },
  ] },
  { t: "flow", title: "A one-row flow", lead: "From spec to deck.", steps: [
    { title: "Spec", desc: "Array of slides" }, { title: "Validate", desc: "Limits and fields" }, { title: "Render", desc: "pptxgenjs" }, { title: "Review", desc: "PDF pages" },
  ] },
  { t: "stack", title: "A layered stack", layers: [
    { name: "Your build script", detail: "the deck spec" }, { name: "Templates", detail: "fixed-grid layouts" }, { name: "Theme", detail: "colours, fonts, logos" }, { name: "pptxgenjs", detail: "writes the .pptx" },
  ], side: { title: "Cross-cutting", items: ["Validator", "Render to PDF", "Agent skill"] } },
  { t: "planes", title: "Two boxes and a link", lead: "For architectures with a clear boundary.", left: { kicker: "LEFT", title: "Service A", items: ["Owns the API", "Stores metadata"] }, right: { kicker: "RIGHT", title: "Service B", items: ["Runs the workloads", "Keeps the data"] }, arrow: "one outbound\nconnection" },
  { t: "twoCol", title: "Two columns", left: { title: "Before", items: ["Hand-built slides", "Inconsistent styling", "Hard to update"] }, right: { title: "After", items: ["Generated from a spec", "One theme everywhere", "Edit and re-run"] } },
  { t: "tracks", title: "Two tracks per phase", tech: { items: ["Set up the build", "Add templates"] }, biz: { items: ["Agree the brand", "Collect content"] }, sync: ["Weekly review"] },
  { t: "gantt", title: "A Gantt chart", periods: ["W1", "W2", "W3", "W4"], rows: [
    { name: "Theme", track: "tech", start: 1, span: 2, label: "colours + logos" }, { name: "Content", track: "biz", start: 2, span: 2, label: "outline" }, { name: "Review", track: "both", start: 4, span: 1, label: "sign-off" },
  ] },
  { t: "section", kicker: "02", title: "Screens", desc: "Screenshots with notes, and a hero shot." },
  { t: "screen", title: "A screenshot with key points", image: screen, points: [
    { h: "Sized by aspect", t: "The image keeps its proportions inside the slide grid." }, { h: "Framed", t: "A light border and shadow lift it off the page." }, { h: "Annotated", t: "Up to four points on the right." },
  ] },
  { t: "hero", title: "A hero screenshot", subtitle: "One large image on the dark background.", image: screen },
  { t: "closing", title: "Thank you", subtitle: "slide-ai-kit", contact: "github.com/sparklabx/slide-ai-kit" },
];

mkdirSync(OUT, { recursive: true });
for (const [name, theme] of [["default", defaultTheme], ["nodus", nodus]]) {
  console.log(await buildDeck(deck, join(OUT, `demo-${name}.pptx`), { theme }));
}
