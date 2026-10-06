// ABOUTME: Pulls the keynote deck from the Slides API into src/deck/deck.json and its images into public/deck/.
// ABOUTME: Needs SLIDES_ACCESS_TOKEN; geometry is converted from EMU to 1920-wide pixels, styles are resolved against the master.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { createDeckModel } from "./deck-model.mjs";

const DECK = process.env.DECK_ID ?? "1kPEQ80oGdeE74VrZbXx5qHeyak8R3EuSB0hfF2RsDvg";
const token = process.env.SLIDES_ACCESS_TOKEN;
if (!token) throw new Error("SLIDES_ACCESS_TOKEN is not set");

const res = await fetch(`https://slides.googleapis.com/v1/presentations/${DECK}`, { headers: { Authorization: `Bearer ${token}` } });
if (!res.ok) throw new Error(`presentation: ${res.status} ${await res.text()}`);
const pres = await res.json();

const { solid, len, box, inherited, textRuns, background, W, H, PT } = createDeckModel(pres);
const master = pres.masters[0];

mkdirSync(new URL("../public/deck/", import.meta.url), { recursive: true });
const saved = new Map();

async function image(url) {
  if (saved.has(url)) return saved.get(url);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`image ${r.status} ${url.slice(0, 80)}`);
  const bytes = Buffer.from(await r.arrayBuffer());
  const ext = (r.headers.get("content-type") ?? "image/png").includes("jpeg") ? "jpg" : (r.headers.get("content-type") ?? "").includes("gif") ? "gif" : "png";
  const name = `deck/${createHash("sha1").update(bytes).digest("hex").slice(0, 16)}.${ext}`;
  const out = new URL(`../public/${name}`, import.meta.url);
  if (!existsSync(out)) writeFileSync(out, bytes);
  saved.set(url, name);
  return name;
}

async function element(e, layer) {
  const b = box(e);
  if (e.shape) {
    const sp = e.shape.shapeProperties ?? {};
    const o = sp.outline;
    const base = inherited(e);
    return {
      id: e.objectId,
      layer,
      kind: "shape",
      shape: e.shape.shapeType,
      ...b,
      fill: solid(sp.shapeBackgroundFill),
      outline: o && o.propertyState !== "NOT_RENDERED" && o.outlineFill ? { ...solid(o.outlineFill), weight: len(o.weight) || PT, dash: o.dashStyle ?? "SOLID" } : null,
      valign: sp.contentAlignment ?? base.valign ?? "TOP",
      paragraphs: textRuns(e.shape.text, base),
    };
  }
  if (e.image) {
    const c = e.image.imageProperties?.cropProperties ?? {};
    return { id: e.objectId, layer, kind: "image", ...b, src: await image(e.image.contentUrl), crop: { l: c.leftOffset ?? 0, r: c.rightOffset ?? 0, t: c.topOffset ?? 0, b: c.bottomOffset ?? 0 } };
  }
  if (e.line) {
    const lp = e.line.lineProperties ?? {};
    return { id: e.objectId, layer, kind: "line", ...b, stroke: solid(lp.lineFill), weight: len(lp.weight) || PT, dash: lp.dashStyle ?? "SOLID", arrow: lp.endArrow ?? "NONE" };
  }
  return null;
}


const layouts = Object.fromEntries(pres.layouts.map((l) => [l.objectId, l]));
const notesOf = (s) => {
  const id = s.slideProperties?.notesPage?.notesProperties?.speakerNotesObjectId;
  const shape = s.slideProperties?.notesPage?.pageElements?.find((e) => e.objectId === id);
  return (shape?.shape?.text?.textElements ?? []).map((t) => t.textRun?.content ?? "").join("").trim();
};

const slides = [];
const live = pres.slides.filter((s) => !s.slideProperties?.isSkipped);
for (const [i, s] of live.entries()) {
  const layout = layouts[s.slideProperties.layoutObjectId];
  const els = [];
  // Layout decoration (logos, bars) sits behind the slide; layout placeholders are only prompts and never render.
  for (const e of layout?.pageElements ?? []) if (!e.shape?.placeholder) els.push(await element(e, "layout"));
  for (const e of s.pageElements ?? []) els.push(await element(e, "slide"));
  slides.push({ id: s.objectId, number: i + 1, background: background(s) ?? background(layout) ?? background(master) ?? "#ffffff", notes: notesOf(s), elements: els.filter(Boolean) });
  process.stdout.write(`\rslide ${i + 1}/${live.length}`);
}
process.stdout.write("\n");

writeFileSync(new URL("../src/deck/deck.json", import.meta.url), JSON.stringify({ id: DECK, title: pres.title, width: W, height: H, slides }, null, 1) + "\n");
console.log(`${slides.length} slides, ${saved.size} images, ${W}x${H}`);
