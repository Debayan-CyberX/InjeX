import { useEffect, useRef, useState } from "react";
import { createSurface } from "../../lib/visuals/surface";
import fragment from "../../lib/visuals/liquid-glass.frag.glsl?raw";
import { useVisualLoop, useVisuals } from "./VisualSystem";

/** InboxIQ's capsule optics, sampling only InjeX's decorative graphite-sage field. */
export default function GlassDockSurface() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<((time: number) => void) | null>(null);
  const { backdrop, running } = useVisuals();
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useVisualLoop(draw, running, ready, 24);
  useEffect(() => {
    const target = canvas.current;
    if (!target?.parentElement) return;
    const surface = createSurface(target, fragment);
    if (!surface) return;
    const { gl, uniform } = surface;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const render = () => {
      const source = backdrop.current;
      if (!source || gl.isContextLost()) return;
      const rect = target.parentElement!.getBoundingClientRect();
      const ratio = Math.min(devicePixelRatio, 1.5);
      const width = Math.round(rect.width * ratio),
        height = Math.round(rect.height * ratio);
      if (target.width !== width || target.height !== height) {
        target.width = width;
        target.height = height;
      }
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.uniform1i(uniform("u_image"), 0);
      gl.uniform2f(uniform("u_resolution"), rect.width, rect.height);
      gl.uniform2f(uniform("u_viewport"), innerWidth, innerHeight);
      gl.uniform2f(uniform("u_position"), rect.left, rect.top);
      gl.uniform1f(uniform("u_light"), 0);
      surface.draw();
    };
    draw.current = render;
    const observer = new ResizeObserver(render);
    observer.observe(target.parentElement);
    const lost = (event: Event) => {
      event.preventDefault();
      setReady(false);
    };
    const restored = () => setGeneration((v) => v + 1);
    target.addEventListener("webglcontextlost", lost);
    target.addEventListener("webglcontextrestored", restored);
    window.addEventListener("resize", render);
    render();
    setReady(true);
    return () => {
      setReady(false);
      draw.current = null;
      observer.disconnect();
      target.removeEventListener("webglcontextlost", lost);
      target.removeEventListener("webglcontextrestored", restored);
      window.removeEventListener("resize", render);
      gl.deleteTexture(texture);
      surface.dispose();
    };
  }, [backdrop, generation]);
  return (
    <canvas ref={canvas} className="glass-dock-optics" aria-hidden="true" />
  );
}
