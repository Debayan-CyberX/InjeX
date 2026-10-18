import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type VisualState = {
  running: boolean;
  paused: boolean;
  reduced: boolean;
  toggle: () => void;
  backdrop: RefObject<HTMLCanvasElement | null>;
};
const VisualContext = createContext<VisualState | null>(null);

export function VisualSystem({ children }: { children: ReactNode }) {
  const backdrop = useRef<HTMLCanvasElement | null>(null);
  const [paused, setPaused] = useState(() => {
    try {
      return localStorage.getItem("injex-visual-motion") === "off";
    } catch {
      return false;
    }
  });
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = () => setReduced(media.matches);
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener("change", preference);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", preference);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const toggle = () =>
    setPaused((value) => {
      try {
        localStorage.setItem("injex-visual-motion", value ? "on" : "off");
      } catch {}
      return !value;
    });
  return (
    <VisualContext.Provider
      value={{
        running: !paused && !reduced && visible,
        paused,
        reduced,
        toggle,
        backdrop,
      }}
    >
      {children}
    </VisualContext.Provider>
  );
}

export function useVisuals() {
  const context = useContext(VisualContext);
  if (!context) throw new Error("Visuals require VisualSystem");
  return context;
}

/** Time advances only while visible and playing. Animation never updates React state. */
export function useVisualLoop(
  draw: RefObject<((time: number) => void) | null>,
  active: boolean,
  ready: boolean,
  fps = 30,
) {
  const elapsed = useRef(0);
  useEffect(() => {
    if (!active || !ready) return;
    let frame = 0;
    let previous = 0;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!previous) previous = now;
      if (now - previous < 1000 / fps) return;
      elapsed.current += Math.min((now - previous) / 1000, 0.1);
      previous = now;
      draw.current?.(elapsed.current);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, ready, fps, draw]);
}

export function useInView(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "40px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}
