export const EDITOR_HEIGHT_MIN = 240;
export const EDITOR_HEIGHT_MAX = 500;
export const EDITOR_HEIGHT_MAX_COMPACT = 420;

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
