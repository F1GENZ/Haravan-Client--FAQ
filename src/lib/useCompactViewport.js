import { useEffect, useState } from "react";

export const COMPACT_VIEWPORT_QUERY = "(max-width: 767.98px)";

const mediaMatches = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(COMPACT_VIEWPORT_QUERY).matches;

/** Mirrors the sidebar breakpoint so a dialog uses the same phone layout as the shell. */
export function useCompactViewport() {
  const [compact, setCompact] = useState(mediaMatches);

  useEffect(() => {
    const media = window.matchMedia(COMPACT_VIEWPORT_QUERY);
    const onChange = (event) => setCompact(event.matches);
    setCompact(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return compact;
}
