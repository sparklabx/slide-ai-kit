import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildDeck, validate, TEMPLATES } from "../src/index.mjs";
import { S } from "../src/templates.mjs";
import nodus from "../themes/nodus/theme.mjs";

test("every template has a contract and a renderer", () => {
  for (const name of Object.keys(TEMPLATES)) assert.equal(typeof S[name], "function", name);
  for (const name of Object.keys(S)) assert.ok(TEMPLATES[name], `${name} has no contract`);
});

test("validator reports unknown templates, missing fields and overflow", () => {
  const r = validate([
    { t: "nope" },
    { t: "bullets", title: "x".repeat(80), items: Array(8).fill("i") },
    { t: "cards", title: "c", items: [{ title: "a" }] },
    { t: "screen", title: "s", image: "/no/such.png" },
  ]);
  assert.equal(r.ok, false);
  for (const msg of ["unknown template", "8 items", "title over 70", "cards need 3–6", "image not found"])
    assert.ok(r.errors.some((e) => e.includes(msg)), msg);
});

test("buildDeck refuses an invalid deck before writing anything", async () => {
  const out = join(mkdtempSync(join(tmpdir(), "slide-ai-")), "bad.pptx");
  await assert.rejects(buildDeck([{ t: "bullets", title: "t" }], out), /missing "items"/);
  assert.equal(existsSync(out), false);
});

test("buildDeck writes a .pptx with the default and a branded theme", async () => {
  const dir = mkdtempSync(join(tmpdir(), "slide-ai-"));
  const deck = [{ t: "title", title: "Hi" }, { t: "bullets", title: "Points", items: ["a", { h: "b:", t: " c" }] }, { t: "closing", title: "Bye" }];
  for (const [name, opts] of [["default", {}], ["nodus", { theme: nodus }]]) {
    const r = await buildDeck(deck, join(dir, `${name}.pptx`), opts);
    assert.equal(r.slides, 3);
    assert.ok(statSync(r.path).size > 20_000, `${name}: file too small`);
  }
});

test("theme logo files exist", () => {
  for (const L of Object.values(nodus.logos)) assert.ok(existsSync(L.path), L.path);
});
