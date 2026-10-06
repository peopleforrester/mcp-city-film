// ABOUTME: The rules that turn Slides API JSON into deck.json: EMU to pixels, colors, fills, text runs, placeholder inheritance.
// ABOUTME: Pure functions over one presentation, so each rule can be tested without the API.

/** Builds the converters for one presentation; geometry comes out in pixels on a 1920-wide page. */
export function createDeckModel(pres) {
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

  /** A page's own background, blended over the white Slides draws beneath it; null when the page inherits. */
  function background(page) {
    const s = solid(page?.pageProperties?.pageBackgroundFill);
    if (!s) return null;
    const mix = (i) => Math.round(parseInt(s.color.slice(i, i + 2), 16) * s.alpha + 255 * (1 - s.alpha)).toString(16).padStart(2, "0");
    return `#${mix(1)}${mix(3)}${mix(5)}`;
  }

  return { W, H, K, PT, color, solid, len, box, inherited, textRuns, background };
}
