import { useEffect, useRef, useState } from "react";
import {
  ACESFilmicToneMapping,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  EquirectangularReflectionMapping,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";
import { useInView, useVisualLoop, useVisuals } from "./VisualSystem";

const SEGMENTS = 144;
const SIDES = 48;

/** A closed, continuously deforming ribbon: the mesh and its normals change every frame. */
export default function ChromeSculpture() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const draw = useRef<((time: number) => void) | null>(null);
  const { running } = useVisuals();
  const visible = useInView(root);
  const interactive = useRef(running && visible);
  useEffect(() => {
    interactive.current = running && visible;
  }, [running, visible]);
  const [ready, setReady] = useState(false);
  const [generation, setGeneration] = useState(0);
  useVisualLoop(draw, running && visible, ready, 30);
  useEffect(() => {
    const target = canvas.current;
    const host = root.current;
    if (!target || !host) return;
    // Keep the original image as the static fallback when WebGL2 is unavailable.
    const context = target.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    if (!context) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas: target,
        context,
        alpha: true,
        antialias: true,
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(
      Math.min(devicePixelRatio, innerWidth < 768 ? 1.2 : 1.5),
    );
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    const scene = new Scene();
    const camera = new PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0, 8.4);

    // A local photographic studio environment: no HDR download or third-party network request.
    const studio = document.createElement("canvas");
    studio.width = 1024;
    studio.height = 512;
    const ctx = studio.getContext("2d")!;
    ctx.fillStyle = "#10151c";
    ctx.fillRect(0, 0, 1024, 512);
    const boxes = [
      [80, 50, 85, 375],
      [340, 30, 180, 155],
      [660, 0, 42, 512],
      [805, 165, 155, 120],
    ];
    for (const [x, y, width, height] of boxes) {
      const light = ctx.createLinearGradient(x, 0, x + width, 0);
      light.addColorStop(0, "#76818d");
      light.addColorStop(0.14, "#ffffff");
      light.addColorStop(0.82, "#f3f6fc");
      light.addColorStop(1, "#87929e");
      ctx.fillStyle = light;
      ctx.fillRect(x, y, width, height);
    }
    const source = new CanvasTexture(studio);
    source.mapping = EquirectangularReflectionMapping;
    source.colorSpace = SRGBColorSpace;
    const pmrem = new PMREMGenerator(renderer);
    const environment = pmrem.fromEquirectangular(source);
    scene.environment = environment.texture;
    source.dispose();
    pmrem.dispose();

    const geometry = new BufferGeometry();
    const positions = new Float32Array((SEGMENTS + 1) * (SIDES + 1) * 3);
    const attribute = new BufferAttribute(positions, 3).setUsage(
      DynamicDrawUsage,
    );
    geometry.setAttribute("position", attribute);
    const indices: number[] = [];
    for (let u = 0; u < SEGMENTS; u++)
      for (let v = 0; v < SIDES; v++) {
        const a = u * (SIDES + 1) + v,
          b = a + SIDES + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    geometry.setIndex(indices);
    const material = new MeshPhysicalMaterial({
      color: new Color("#e5e9ed"),
      metalness: 1,
      roughness: 0.13,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      envMapIntensity: 1.6,
      side: DoubleSide,
    });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const fill = new DirectionalLight(0xcbd8ed, 1);
    fill.position.set(4, -2, 3);
    scene.add(fill);
    let time = 0;
    let pointerX = 0,
      pointerY = 0;
    let followX = 0,
      followY = 0;
    let hover = 0,
      hoverTarget = 0;
    let hoverAngle = 0,
      targetAngle = 0;
    let pointerInside = false,
      needsPick = false,
      dragging = false;
    let orbitX = 0,
      orbitY = 0,
      previousX = 0,
      previousY = 0;
    const hero = host.closest<HTMLElement>(".void-hero") || host;
    const coordinates = new Vector2(3, 3);
    const raycaster = new Raycaster();
    const pick = () => {
      needsPick = false;
      if (!interactive.current || !pointerInside) {
        hoverTarget = 0;
        hero.dataset.sculptureHover = "false";
        return false;
      }
      mesh.updateMatrixWorld(true);
      geometry.computeBoundingSphere();
      raycaster.setFromCamera(coordinates, camera);
      const hit = raycaster.intersectObject(mesh, false)[0];
      hoverTarget = hit ? 1 : 0;
      hero.dataset.sculptureHover = hit ? "true" : "false";
      if (hit) {
        const point = mesh.worldToLocal(hit.point);
        targetAngle = Math.atan2(point.y / 0.92, point.x);
      }
      return Boolean(hit);
    };
    const render = (next: number) => {
      if (context.isContextLost()) return;
      time = next;
      if (!dragging && (needsPick || hoverTarget > 0)) pick();
      hover += (hoverTarget - hover) * 0.12;
      followX += (pointerX - followX) * 0.1;
      followY += (pointerY - followY) * 0.1;
      hoverAngle +=
        Math.atan2(
          Math.sin(targetAngle - hoverAngle),
          Math.cos(targetAngle - hoverAngle),
        ) * 0.12;
      let offset = 0;
      for (let i = 0; i <= SEGMENTS; i++) {
        const u = (i / SEGMENTS) * Math.PI * 2;
        const distance = Math.atan2(
          Math.sin(u - hoverAngle),
          Math.cos(u - hoverAngle),
        );
        const influence = hover * Math.exp(-distance * distance * 2.3);
        const radius =
          1.48 +
          0.22 * Math.sin(2 * u + time * 0.24) +
          0.1 * Math.cos(3 * u - time * 0.17) +
          influence * 0.22;
        const twist =
          u +
          0.52 * Math.sin(time * 0.19) +
          0.2 * Math.sin(2 * u - time * 0.13) +
          influence * 0.65;
        const thickness =
          0.48 + 0.11 * Math.sin(3 * u + time * 0.23) + influence * 0.1;
        const cos = Math.cos(u),
          sin = Math.sin(u),
          ct = Math.cos(twist),
          st = Math.sin(twist);
        for (let j = 0; j <= SIDES; j++) {
          const v = (j / SIDES) * Math.PI * 2;
          const a = Math.cos(v) * thickness,
            b = Math.sin(v) * (0.68 + 0.08 * Math.cos(u - time * 0.2));
          const radial = a * ct - b * st;
          positions[offset++] = (radius + radial) * cos;
          positions[offset++] = (radius + radial) * sin * 0.92;
          positions[offset++] =
            0.33 * Math.sin(2 * u + time * 0.21) +
            a * st +
            b * ct +
            influence * 0.28;
        }
      }
      attribute.needsUpdate = true;
      geometry.computeVertexNormals();
      // The parametric surface duplicates its wrap vertices. Average the normals
      // at both seams so polished reflections stay continuous as the mesh morphs.
      const normals = geometry.getAttribute("normal");
      const stitch = (a: number, b: number) => {
        const x = normals.getX(a) + normals.getX(b);
        const y = normals.getY(a) + normals.getY(b);
        const z = normals.getZ(a) + normals.getZ(b);
        const length = Math.hypot(x, y, z) || 1;
        normals.setXYZ(a, x / length, y / length, z / length);
        normals.setXYZ(b, x / length, y / length, z / length);
      };
      for (let i = 0; i <= SEGMENTS; i++)
        stitch(i * (SIDES + 1), i * (SIDES + 1) + SIDES);
      for (let j = 0; j <= SIDES; j++) stitch(j, SEGMENTS * (SIDES + 1) + j);
      mesh.rotation.set(
        0.3 + Math.sin(time * 0.11) * 0.16 + followY * hover * 0.38 + orbitY,
        -0.4 + Math.sin(time * 0.09) * 0.38 + followX * hover * 0.55 + orbitX,
        -0.43 + Math.sin(time * 0.08) * 0.14,
      );
      mesh.position.y = 0.04 + Math.sin(time * 0.18) * 0.08;
      material.roughness = 0.13 - hover * 0.035;
      renderer.render(scene, camera);
      target.dataset.time = time.toFixed(3);
      target.dataset.hover = hover.toFixed(3);
      target.dataset.orbit = `${orbitX.toFixed(3)},${orbitY.toFixed(3)}`;
    };
    draw.current = render;
    const resize = () => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      render(time);
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (!interactive.current) return;
      if (dragging) {
        orbitX += (event.clientX - previousX) * 0.008;
        orbitY = Math.max(
          -1.1,
          Math.min(1.1, orbitY + (event.clientY - previousY) * 0.008),
        );
      }
      previousX = event.clientX;
      previousY = event.clientY;
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const onControl =
        event.target instanceof Element &&
        Boolean(
          event.target.closest(
            "a,button,input,textarea,select,summary,[role='tab']",
          ),
        );
      pointerInside = x >= 0 && x <= 1 && y >= 0 && y <= 1 && !onControl;
      coordinates.set(x * 2 - 1, 1 - y * 2);
      pointerX = Math.max(-1, Math.min(1, coordinates.x));
      pointerY = Math.max(-1, Math.min(1, coordinates.y));
      needsPick = true;
    };
    const press = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        !interactive.current ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen")
      )
        return;
      pointer(event);
      if (!pick()) return;
      dragging = true;
      hero.dataset.sculptureDrag = "true";
      event.preventDefault();
    };
    const release = () => {
      dragging = false;
      hero.dataset.sculptureDrag = "false";
      needsPick = true;
    };
    const leave = () => {
      pointerInside = false;
      if (!dragging) hoverTarget = 0;
      hero.dataset.sculptureHover = "false";
    };
    const blur = () => {
      release();
      leave();
    };
    const lost = (event: Event) => {
      event.preventDefault();
      host.dataset.rendered = "false";
      setReady(false);
    };
    const restored = () => setGeneration((value) => value + 1);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("pointerdown", press);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", blur);
    window.addEventListener("blur", blur);
    hero.addEventListener("pointerleave", leave);
    target.addEventListener("webglcontextlost", lost);
    target.addEventListener("webglcontextrestored", restored);
    resize();
    host.dataset.rendered = "true";
    setReady(true);
    return () => {
      setReady(false);
      draw.current = null;
      observer.disconnect();
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", blur);
      window.removeEventListener("blur", blur);
      hero.removeEventListener("pointerleave", leave);
      delete hero.dataset.sculptureHover;
      delete hero.dataset.sculptureDrag;
      target.removeEventListener("webglcontextlost", lost);
      target.removeEventListener("webglcontextrestored", restored);
      geometry.dispose();
      material.dispose();
      environment.dispose();
      renderer.dispose();
      if (!host.isConnected) renderer.forceContextLoss();
    };
  }, [generation]);
  return (
    <div className="chrome-scene" ref={root} aria-hidden="true">
      <img
        src={`${import.meta.env.BASE_URL}images/void-chrome.webp`}
        alt=""
        width="1536"
        height="1024"
        fetchPriority="high"
      />
      <canvas ref={canvas} className="chrome-canvas" />
    </div>
  );
}
