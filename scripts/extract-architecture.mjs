// ABOUTME: Pulls the site's architecture diagram at a pinned commit: the PNG the page shows, and box geometry from its SVG.
// ABOUTME: Writes public/architecture/architecture.png and src/architecture/diagram.json; set SITE_COMMIT to move the pin.
import { mkdirSync, writeFileSync } from "node:fs";
import { parseDiagram } from "./architecture-model.mjs";

const REPO = "peopleforrester/mcp-city";
const COMMIT = process.env.SITE_COMMIT ?? "e93506e";
const raw = (path) => `https://raw.githubusercontent.com/${REPO}/${COMMIT}/${path}`;

async function get(path) {
  const r = await fetch(raw(path));
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r;
}

const svg = await (await get("public/architecture/architecture.svg")).text();
const png = Buffer.from(await (await get("public/architecture/architecture.png")).arrayBuffer());
const diagram = parseDiagram(svg);
// The PNG is the same diagram rasterized wider; its pixel size comes from the IHDR chunk.
const image = { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };

mkdirSync(new URL("../public/architecture/", import.meta.url), { recursive: true });
mkdirSync(new URL("../src/architecture/", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/architecture/architecture.png", import.meta.url), png);
writeFileSync(new URL("../src/architecture/diagram.json", import.meta.url), JSON.stringify({ source: { repo: REPO, commit: COMMIT }, image, ...diagram }, null, 1) + "\n");
console.log(`${Object.keys(diagram.nodes).length} boxes, ${Object.keys(diagram.zones).length} zones, ${diagram.width}x${diagram.height} svg, ${image.width}x${image.height} png`);
