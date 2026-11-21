// ABOUTME: The rules that turn Slides API JSON into deck.json: EMU to pixels, colors, fills, text runs, placeholder inheritance, layout names.
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

  const layouts = new Map(pres.layouts.map((l) => [l.objectId, l]));

  /** The name the deck shows for the layout a slide is built on, such as "Title and body". */
  function layoutName(slide) {
    const id = slide.slideProperties?.layoutObjectId;
    const name = layouts.get(id)?.layoutProperties?.displayName;
    if (!name) throw new Error(`${slide.objectId}: layout ${id} has no name`);
    return name;
  }

  return { W, H, K, PT, color, solid, len, box, inherited, textRuns, background, layoutName };
}

/**
 * Each slide's frames on one recording, from the second each slide comes up and the recording's length.
 * Slide boundaries are rounded to whole frames, so the frames add up to the recording exactly.
 */
export function framesFromCues(starts, end, fps) {
  if (starts[0] !== 0) throw new Error(`the first slide must start at 0, not ${starts[0]}`);
  starts.forEach((s, i) => {
    if (i > 0 && !(s > starts[i - 1])) throw new Error(`slide ${i + 1} starts at ${s}, not after slide ${i} at ${starts[i - 1]}`);
  });
  if (!(end > starts.at(-1))) throw new Error(`the recording ends at ${end}, before the last slide starts at ${starts.at(-1)}`);
  const edges = [...starts.map((s) => Math.round(s * fps)), Math.ceil(end * fps)];
  const frames = starts.map((_, i) => edges[i + 1] - edges[i]);
  frames.forEach((f, i) => {
    if (f < 1) throw new Error(`slide ${i + 1} is up for less than a frame`);
  });
  return frames;
}

// MPEG Layer III tables, keyed by the header's two version bits: 3 is MPEG-1, 2 is MPEG-2, 0 is MPEG-2.5.
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
const KBPS_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const KBPS_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

/**
 * An MP3's length in seconds, from its bytes: the samples in every Layer III frame after the ID3v2 tag, as ffprobe counts them.
 * A Xing or Info frame at the start describes the file and holds no audio, so it is not counted.
 * Bytes that are not MPEG Layer III frames, such as text before the tag, are refused rather than skipped.
 */
export function mp3Seconds(bytes) {
  const text = (at, n) => String.fromCharCode(...bytes.subarray(at, at + n));
  let i = 0;
  if (text(0, 3) === "ID3") i = 10 + ((bytes[6] << 21) | (bytes[7] << 14) | (bytes[8] << 7) | bytes[9]) + (bytes[5] & 0x10 ? 10 : 0);
  let samples = 0;
  let rate = 0;
  for (let first = true; i < bytes.length; first = false) {
    if (bytes.length - i === 128 && text(i, 3) === "TAG") break; // an ID3v1 tag closes the file
    if (bytes.length - i < 4 || bytes[i] !== 0xff || (bytes[i + 1] & 0xe0) !== 0xe0) throw new Error(`no MPEG audio frame at byte ${i}`);
    const version = (bytes[i + 1] >> 3) & 3;
    const layer3 = ((bytes[i + 1] >> 1) & 3) === 1;
    const kbps = (version === 3 ? KBPS_V1 : KBPS_V2)[bytes[i + 2] >> 4];
    const r = RATES[version]?.[(bytes[i + 2] >> 2) & 3];
    if (!layer3 || !kbps || !r) throw new Error(`the frame at byte ${i} is not an MPEG Layer III frame this reads`);
    if (rate && r !== rate) throw new Error(`the sample rate changes from ${rate} to ${r} Hz at byte ${i}`);
    rate = r;
    const perFrame = version === 3 ? 1152 : 576;
    if (first) {
      const mono = bytes[i + 3] >> 6 === 3;
      const side = 4 + (bytes[i + 1] & 1 ? 0 : 2) + (version === 3 ? (mono ? 17 : 32) : mono ? 9 : 17);
      if (!["Xing", "Info"].includes(text(i + side, 4))) samples += perFrame;
    } else samples += perFrame;
    i += Math.floor(((perFrame / 8) * kbps * 1000) / r) + ((bytes[i + 2] >> 1) & 1);
  }
  if (!rate) throw new Error("no MPEG audio frames");
  return samples / rate;
}

/**
 * The one shift, in seconds, that moves every cue after the title slide from one recording of the delivery onto another.
 * Both lists are `{ at, says }` on the cues' 0.01 s grid; the title slide stays at 0 on both, because each recording starts it.
 * Throws if the lists are not the same slides or if any cue moves by a different amount from slide 2's.
 */
export function cueOffset(from, to) {
  if (from.length !== to.length) throw new Error(`the recordings have ${from.length} and ${to.length} cues`);
  from.forEach((f, i) => {
    if (f.says !== to[i].says) throw new Error(`slide ${i + 1} says "${f.says}" on one recording and "${to[i].says}" on the other`);
  });
  if (from[0].at !== 0 || to[0].at !== 0) throw new Error(`the title slide must start at 0 on both recordings, not ${from[0].at} and ${to[0].at}`);
  const cs = (s) => Math.round(s * 100);
  const shift = cs(to[1].at) - cs(from[1].at);
  to.forEach((t, i) => {
    const moved = cs(t.at) - cs(from[i].at);
    if (i > 0 && moved !== shift) throw new Error(`slide ${i + 1} moves by ${moved / 100} s, not by ${shift / 100} s like slide 2`);
  });
  return shift / 100;
}

/**
 * The timing.json that `npm run deck:cues` writes: the cues' track, and each slide's frames from its cue, with its clip kept.
 * `length` is the track's measured length in seconds, which must match the cues' `end` to 0.05 s.
 */
export function timingFromCues(cues, timing, length, fps) {
  if (cues.slides.length !== timing.slides.length) throw new Error(`cues.json has ${cues.slides.length} slides, timing.json ${timing.slides.length}`);
  if (Math.abs(length - cues.end) > 0.05) throw new Error(`${cues.track} is ${length} s long, but cues.json says it ends at ${cues.end} s`);
  const frames = framesFromCues(cues.slides.map((s) => s.at), cues.end, fps);
  return { track: cues.track, slides: timing.slides.map((s, i) => ({ ...s, frames: frames[i] })) };
}
