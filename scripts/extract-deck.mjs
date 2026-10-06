// ABOUTME: Pulls the keynote deck from the Slides API into src/deck/deck.json and its images into public/deck/.
// ABOUTME: Needs SLIDES_ACCESS_TOKEN; geometry is converted from EMU to 1920-wide pixels, styles are resolved against the master.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const DECK = process.env.DECK_ID ?? "1kPEQ80oGdeE74VrZbXx5qHeyak8R3EuSB0hfF2RsDvg";
const token = process.env.SLIDES_ACCESS_TOKEN;
if (!token) throw new Error("SLIDES_ACCESS_TOKEN is not set");

const res = await fetch(`https://slides.googleapis.com/v1/presentations/${DECK}`, { headers: { Authorization: `Bearer ${token}` } });
if (!res.ok) throw new Error(`presentation: ${res.status} ${await res.text()}`);
const pres = await res.json();

const W = 1920;
const K = W / pres.pageSize.width.magnitude; // pixels per EMU
const H = Math.round(pres.pageSize.height.magnitude * K);
const PT = 12700 * K; // pixels per point

const master = pres.masters[0];
const scheme = Object.fromEntries((master.pageProperties.colorScheme?.colors ?? []).map((c) => [c.type, c.color]));

/** A Slides color (rgb or theme) as a CSS hex string; a missing channel is zero. */
function color(c) {
  if (!c) return null;
  const rgb = c.rgbColor ?? (c.themeColor ? scheme[c.themeColor] : null) ?? c.opaqueColor?.rgbColor ?? (c.opaqueColor?.themeColor ? scheme[c.opaqueColor.themeColor] : null);
  if (!rgb) return null;
  const h = (v) => Math.round((v ?? 0) * 255).toString(16).padStart(2, "0");
  return `#${h(rgb.red)}${h(rgb.green)}${h(rgb.blue)}`;
}

function solid(fill) {
  if (!fill || fill.propertyState === "NOT_RENDERED" || !fill.solidFill) return null;
  const c = color(fill.solidFill.color);
  return c ? { color: c, alpha: fill.solidFill.alpha ?? 1 } : null;
}

const len = (d) => (d?.magnitude ?? 0) * (d?.unit === "PT" ? PT : K);

function box(e) {
  // The API omits any transform field that is zero, so a missing scale is 0, not 1; only a missing transform is identity.
  const t = e.transform ?? { scaleX: 1, scaleY: 1 };
  const sx = t.scaleX ?? 0;
  const sy = t.scaleY ?? 0;
  const w = (e.size?.width?.magnitude ?? 0) * sx * K;
  const h = (e.size?.height?.magnitude ?? 0) * sy * K;
  return { x: (t.translateX ?? 0) * K, y: (t.translateY ?? 0) * K, w, h };
}

/** Every layout and master element by id, so a placeholder can find the one it inherits from. */
const parents = new Map([...pres.layouts, ...pres.masters].flatMap((page) => (page.pageElements ?? []).map((e) => [e.objectId, e])));

/** The run and paragraph style a placeholder inherits: master first, then layout, each overriding the last. */
function inherited(e) {
  const chain = [];
  for (let cur = e; cur?.shape?.placeholder?.parentObjectId; ) {
    cur = parents.get(cur.shape.placeholder.parentObjectId);
    if (cur) chain.unshift(cur);
  }
  const run = {};
  const para = {};
  let valign;
  for (const p of chain) {
    const els = p.shape?.text?.textElements ?? [];
    Object.assign(run, els.find((t) => t.textRun)?.textRun.style ?? {});
    Object.assign(para, els.find((t) => t.paragraphMarker)?.paragraphMarker.style ?? {});
    valign = p.shape?.shapeProperties?.contentAlignment ?? valign;
  }
  return { run, para, valign };
}

function textRuns(text, base = { run: {}, para: {} }) {
  const paragraphs = [];
  let cur = null;
  for (const t of text?.textElements ?? []) {
    if (t.paragraphMarker) {
      const s = { ...base.para, ...(t.paragraphMarker.style ?? {}) };
      cur = {
        align: s.alignment ?? "START",
        lineSpacing: s.lineSpacing ?? 100,
        spaceAbove: len(s.spaceAbove),
        spaceBelow: len(s.spaceBelow),
        indentStart: len(s.indentStart),
        indentFirstLine: len(s.indentFirstLine),
        bullet: t.paragraphMarker.bullet ? (t.paragraphMarker.bullet.glyph ?? "•") : null,
        runs: [],
      };
      paragraphs.push(cur);
    }
    if (t.textRun && cur) {
      const s = { ...base.run, ...(t.textRun.style ?? {}) };
      cur.runs.push({
        text: t.textRun.content.replace(/\n$/, ""),
        color: color(s.foregroundColor),
        size: s.fontSize ? s.fontSize.magnitude * PT : null,
        bold: !!s.bold,
        italic: !!s.italic,
        underline: !!s.underline,
        font: s.weightedFontFamily?.fontFamily ?? s.fontFamily ?? null,
        weight: s.weightedFontFamily?.weight ?? (s.bold ? 700 : 400),
        baseline: s.baselineOffset ?? "NONE",
      });
    }
  }
  return paragraphs;
}

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

/** A page's own background, blended over the white Slides draws beneath it; null when the page inherits. */
function background(page) {
  const s = solid(page?.pageProperties?.pageBackgroundFill);
  if (!s) return null;
  const mix = (i) => Math.round(parseInt(s.color.slice(i, i + 2), 16) * s.alpha + 255 * (1 - s.alpha)).toString(16).padStart(2, "0");
  return `#${mix(1)}${mix(3)}${mix(5)}`;
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
