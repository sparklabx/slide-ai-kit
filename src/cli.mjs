#!/usr/bin/env node
// slide-ai CLI:
//   slide-ai root               kit install dir (import the engine from here)
//   slide-ai templates          slide templates + content contracts
//   slide-ai themes             bundled themes
//   slide-ai workflow           the plan → build → render → look loop, for AI agents
//   slide-ai render <f.pptx>    convert to PDF next to it (LibreOffice) for the visual self-check
import { existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TEMPLATES } from "./deck.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...args] = process.argv.slice(2);
const out = (v) => process.stdout.write(typeof v === "string" ? v + "\n" : JSON.stringify(v, null, 2) + "\n");

function findSoffice() {
  if (process.env.SOFFICE && existsSync(process.env.SOFFICE)) return process.env.SOFFICE;
  try {
    const p = execFileSync("/bin/sh", ["-c", "command -v soffice"], { encoding: "utf8" }).trim();
    if (p) return p;
  } catch { /* not on PATH */ }
  return ["/Applications/LibreOffice.app/Contents/MacOS/soffice", "/usr/bin/soffice", "/usr/local/bin/soffice", "/opt/homebrew/bin/soffice"].find(existsSync) ?? null;
}

const WORKFLOW = `# slide-ai workflow

1. Plan the story first: one message per slide. Cover → sections → content → closing.
   Run \`slide-ai templates\` for what each template takes (and its limits).
2. Write a build script in the user's project (never inside the kit):

   import { buildDeck } from "${ROOT}/src/index.mjs";
   import theme from "${ROOT}/themes/default/theme.mjs";   // or the user's own theme
   await buildDeck([
     { t: "title", title: "…", subtitle: "…" },
     { t: "bullets", title: "…", items: ["…", { h: "Label:", t: " detail" }] },
     { t: "closing", title: "Thank you" },
   ], "/abs/path/deck.pptx", { theme });

   buildDeck validates first — fix every error it reports; split slides, don't shrink text.
3. slide-ai render deck.pptx → deck.pdf. Rasterize pages (e.g. pdftoppm -r 60 -png) and LOOK:
   overflow, empty space, cramped text, cut-off screenshots. Fix and rebuild (~2 rounds).
4. Deliver the .pptx and .pdf. The build script is the history: edit and re-run it, no v2 copies.`;

switch (cmd) {
  case "root": out(ROOT); break;
  case "templates": out(TEMPLATES); break;
  case "themes": out(readdirSync(join(ROOT, "themes")).map((t) => `${t}: ${join(ROOT, "themes", t, "theme.mjs")}`).join("\n")); break;
  case "workflow": out(WORKFLOW); break;
  case "render": {
    const file = args[0];
    if (!file || !existsSync(file)) { console.error(`Usage: slide-ai render <file.pptx>${file ? ` (not found: ${file})` : ""}`); process.exit(1); }
    const soffice = findSoffice();
    if (!soffice) { console.error("LibreOffice not found — install it or set SOFFICE. The .pptx is fine; only the PDF self-check needs it."); process.exit(1); }
    execFileSync(soffice, ["--headless", "--convert-to", "pdf", "--outdir", dirname(file) || ".", file], { stdio: ["ignore", "pipe", "pipe"], timeout: 120000 });
    const pdf = file.replace(/\.pptx$/i, ".pdf");
    if (!existsSync(pdf)) { console.error("Render produced no PDF."); process.exit(1); }
    out({ ok: true, pdf });
    break;
  }
  default:
    out(`slide-ai — build themed .pptx decks from a declarative spec
  root          kit install dir
  templates     slide templates + content contracts
  themes        bundled themes
  workflow      the plan → build → render → look loop
  render <f>    .pptx → .pdf (needs LibreOffice)`);
    process.exit(cmd ? 1 : 0);
}
