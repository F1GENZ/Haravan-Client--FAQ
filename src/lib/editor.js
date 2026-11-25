export const EDITOR_HEIGHT_MIN = 240;
export const EDITOR_HEIGHT_MAX = 500;
export const EDITOR_HEIGHT_MAX_COMPACT = 420;

export const COMPACT_VIEWPORT_MAX_WIDTH = 767;
export const COMPACT_VIEWPORT_MAX_HEIGHT = 599;

/** Phones use the full-screen dialog; so does a short landscape viewport, where the
 * desktop body cap would leave less room than the editor itself needs. */
export function isCompactViewport(width, height) {
  const w = Number(width);
  const h = Number(height);
  return (Number.isFinite(w) && w <= COMPACT_VIEWPORT_MAX_WIDTH) ||
    (Number.isFinite(h) && h <= COMPACT_VIEWPORT_MAX_HEIGHT);
}

/**
 * The dialog body scrolls, so the editor only needs a comfortable share of the viewport:
 * half of it on desktop, 40% on a phone layout, clamped so a short laptop still gets a
 * usable box and a tall monitor does not grow an oversized one.
 */
export function editorHeightFor(viewportHeight, compact = false) {
  const height = Number(viewportHeight) > 0 ? Number(viewportHeight) : 900;
  const cap = compact ? EDITOR_HEIGHT_MAX_COMPACT : EDITOR_HEIGHT_MAX;
  const share = compact ? 0.4 : 0.5;
  return Math.min(cap, Math.max(EDITOR_HEIGHT_MIN, Math.round(height * share)));
}
