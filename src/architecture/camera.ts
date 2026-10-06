// ABOUTME: The architecture video's camera: which part of the diagram fills the frame, and where a box lands on screen.
// ABOUTME: Geometry is in pixels of the site's PNG; the frame is the video's size.

export type Box = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };
/** The image point at the center of the frame, and how many screen pixels one image pixel takes. */
export type Camera = { zoom: number; cx: number; cy: number };

/**
 * The camera that frames `box`: zoomed so the box fills `fill` of the frame, never closer than
 * `maxZoom` and never further out than the whole diagram, and moved back from the diagram's edges
 * so no empty space shows on an axis the diagram covers.
 */
export function frameFor(box: Box, image: Size, view: Size, { fill = 0.45, maxZoom = 1 }: { fill?: number; maxZoom?: number } = {}): Camera {
  const whole = Math.min(view.w / image.w, view.h / image.h);
  const zoom = Math.max(whole, Math.min(maxZoom, (fill * view.w) / box.w, (fill * view.h) / box.h));
  const clamp = (c: number, imageLen: number, viewLen: number) => {
    const half = viewLen / 2 / zoom;
    return imageLen * zoom <= viewLen ? imageLen / 2 : Math.min(imageLen - half, Math.max(half, c));
  };
  return { zoom, cx: clamp(box.x + box.w / 2, image.w, view.w), cy: clamp(box.y + box.h / 2, image.h, view.h) };
}

/** Where an image-space box appears in the frame. */
export function onScreen(box: Box, cam: Camera, view: Size): Box {
  return { x: (box.x - cam.cx) * cam.zoom + view.w / 2, y: (box.y - cam.cy) * cam.zoom + view.h / 2, w: box.w * cam.zoom, h: box.h * cam.zoom };
}

/** A camera part way from `a` to `b`; zoom moves on a log scale so a zoom out and back in feel even. */
export function between(a: Camera, b: Camera, t: number): Camera {
  return { zoom: Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t), cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t };
}
