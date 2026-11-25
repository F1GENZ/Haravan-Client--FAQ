import { useEffect, useState } from "react";
import { isCompactViewport } from "./editor";

const readViewport = () =>
  typeof window === "undefined"
    ? false
    : isCompactViewport(window.innerWidth, window.innerHeight);

/** Mirrors the sidebar breakpoint (and the short-landscape rule) so a dialog uses the
 * same phone layout as the shell. */
export function useCompactViewport() {
  const [compact, setCompact] = useState(readViewport);

  useEffect(() => {
    const update = () => setCompact(readViewport());
    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return compact;
}
