import { useEffect, useRef, useState } from "react";
import { createSurface } from "../../lib/visuals/surface";
import { silverFlow } from "../../lib/visuals/silver-flow";
import { useVisualLoop, useVisuals } from "./VisualSystem";

export default function SilverBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<((time: number) => void) | null>(null);
  const { running, backdrop } = useVisuals();
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useVisualLoop(draw, running, ready, 24);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return;
    const surface = createSurface(target, silverFlow, true);
    if (!surface) return;
    const { gl, uniform } = surface;
    backdrop.current = target;
    let time = 0;
    let pointerX = 0,
      pointerY = 0;
    const render = (next: number) => {
      time = next;
      gl.uniform2f(uniform("u_resolution"), target.width, target.height);
      gl.uniform2f(uniform("u_pointer"), pointerX, pointerY);
      gl.uniform1f(uniform("u_time"), time);
      surface.draw();
    };
    draw.current = render;
    const resize = () => {
      const scale = Math.min(1, 1100 / innerWidth, 800 / innerHeight);
      target.width = Math.max(1, Math.round(innerWidth * scale));
      target.height = Math.max(1, Math.round(innerHeight * scale));
      render(time);
    };
    const pointer = (event: PointerEvent) => {
      pointerX = event.clientX / innerWidth - 0.5;
      pointerY = event.clientY / innerHeight - 0.5;
    };
    const lost = (event: Event) => {
      event.preventDefault();
      target.dataset.rendered = "false";
      setReady(false);
    };
    const restored = () => setGeneration((v) => v + 1);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    target.addEventListener("webglcontextlost", lost);
    target.addEventListener("webglcontextrestored", restored);
    resize();
    target.dataset.rendered = "true";
    setReady(true);
    return () => {
      setReady(false);
      draw.current = null;
      backdrop.current = null;
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
      target.removeEventListener("webglcontextlost", lost);
      target.removeEventListener("webglcontextrestored", restored);
      surface.dispose();
    };
  }, [backdrop, generation]);
  return (
    <div className="silver-atmosphere" aria-hidden="true">
      <canvas ref={canvas} className="silver-flow-canvas" />
    </div>
  );
}
