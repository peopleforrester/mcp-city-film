// ABOUTME: Reads box and zone geometry out of the site's Mermaid-rendered architecture SVG, in the SVG's own units.
// ABOUTME: Pure functions, so the camera targets of the architecture video can be tested without the network.

const num = (s) => parseFloat(s);

/** Boxes keyed by Mermaid node id (G, R, ...) and zones keyed by subgraph id (DEV, TOOL, ...). */
export function parseDiagram(svg) {
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/);
  if (!vb) throw new Error("no viewBox in the diagram");
  const nodes = {};
  for (const m of svg.matchAll(/<g class="node[^"]*" id="[^"]*-flowchart-([A-Za-z0-9]+)-\d+"[^>]*transform="translate\(([-\d.]+), ?([-\d.]+)\)">(.*?)<\/g>/gs)) {
    const [, id, cx, cy, inner] = m;
    const rect = inner.match(/<rect class="[^"]*label-container[^"]*"[^>]*x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/);
    if (rect) {
      nodes[id] = { x: num(cx) + num(rect[1]), y: num(cy) + num(rect[2]), w: num(rect[3]), h: num(rect[4]) };
      continue;
    }
    // A cylinder is drawn from its top-left corner and shifted by half its size to center it.
    const path = inner.match(/class="[^"]*label-container[^"]*"[^>]*transform="translate\(([-\d.]+), ?([-\d.]+)\)"/);
    if (path) nodes[id] = { x: num(cx) + num(path[1]), y: num(cy) + num(path[2]), w: -2 * num(path[1]), h: -2 * num(path[2]) };
  }
  const zones = {};
  for (const m of svg.matchAll(/<g class="cluster[^"]*" id="[^"]*?-([A-Z]+)"[^>]*><rect[^>]*x="([-\d.]+)" y="([-\d.]+)" width="([-\d.]+)" height="([-\d.]+)"/g)) {
    zones[m[1]] = { x: num(m[2]), y: num(m[3]), w: num(m[4]), h: num(m[5]) };
  }
  return { width: num(vb[3]), height: num(vb[4]), nodes, zones };
}

/** The smallest box around all of `boxes`. */
export function unionBox(boxes) {
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return { x, y, w: Math.max(...boxes.map((b) => b.x + b.w)) - x, h: Math.max(...boxes.map((b) => b.y + b.h)) - y };
}
