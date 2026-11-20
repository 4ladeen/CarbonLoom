import { hwfHex, hwfRadius, hwfStep, hwfWarmth, hwfFitSize } from "../components/ui/halftone-wordmark-footer";

export interface HalftoneEngineOptions {
  wordmark?: string;
  dotGap?: number;
  radius?: number;
  crop?: number;
  grain?: number;
  interactive?: boolean;
  fontFamily?: string;
  fontWeight?: number;
  palette?: {
    background: string;
    ink: string;
    warm: string;
  };
}

export function createHalftoneEngine(container: HTMLElement, canvas: HTMLCanvasElement, userOpts: HalftoneEngineOptions = {}) {
  const opts = {
    wordmark: userOpts.wordmark || "carbonloom",
    dotGap: userOpts.dotGap || 6,
    radius: userOpts.radius || 85,
    crop: userOpts.crop !== undefined ? userOpts.crop : 0.22,
    grain: userOpts.grain !== undefined ? userOpts.grain : 0.45,
    interactive: userOpts.interactive !== false,
    fontFamily: userOpts.fontFamily || '"Geist", "Inter", "Helvetica Neue", Arial, sans-serif',
    fontWeight: userOpts.fontWeight || 800,
    palette: userOpts.palette || {
      background: "#070709",
      ink: "#e9e4da",
      warm: "#10b981"
    }
  };

  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy: () => {} };

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let px = -1e5;
  let py = -1e5;
  let raf = 0;
  let visible = true;
  let awake = true;
  let ring = { x: 0, y: 0, t: -1 };
  let dots = new Float32Array(0);
  let count = 0;
  let grainTile: HTMLCanvasElement | null = null;
  const ink = hwfHex(opts.palette.ink) || [233, 228, 218];
  const warm = hwfHex(opts.palette.warm) || [16, 185, 129];

  const layout = () => {
    const rect = container.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    const mask = document.createElement("canvas");
    mask.width = w;
    mask.height = h;
    const m = mask.getContext("2d", { willReadFrequently: true });
    if (!m) return;

    m.font = opts.fontWeight + " 100px " + opts.fontFamily;
    const word = opts.wordmark || " ";
    const fit = hwfFitSize(m.measureText(word).width, w * 1.02);
    m.font = opts.fontWeight + " " + fit + "px " + opts.fontFamily;
    const box = m.measureText(word);
    const cap = box.actualBoundingBoxAscent || fit * 0.72;
    const c = Math.max(0, Math.min(0.6, opts.crop));
    m.fillStyle = "#000";
    m.textBaseline = "alphabetic";
    m.fillText(word, (w - box.width) / 2, h + cap * c);
    const img = m.getImageData(0, 0, w, h).data;

    const gap = Math.max(3, opts.dotGap);
    const cols = Math.ceil(w / gap);
    const rows = Math.ceil(h / gap);
    const tmp: number[] = [];
    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        let sum = 0;
        for (let sy = 0; sy < 3; sy++) {
          for (let sx = 0; sx < 3; sx++) {
            const x = Math.min(w - 1, Math.floor(gx * gap + ((sx + 0.5) * gap) / 3));
            const y = Math.min(h - 1, Math.floor(gy * gap + ((sy + 0.5) * gap) / 3));
            sum += img[(y * w + x) * 4 + 3];
          }
        }
        const cov = sum / (9 * 255);
        if (cov < 0.06) continue;
        const hx = gx * gap + gap / 2;
        const hy = gy * gap + gap / 2;
        tmp.push(hx, hy, 0, 0, hx, hy, hwfRadius(cov, gap));
      }
    }
    dots = new Float32Array(tmp);
    count = tmp.length / 7;

    grainTile = document.createElement("canvas");
    grainTile.width = 256;
    grainTile.height = 256;
    const g = grainTile.getContext("2d");
    if (g) {
      const id = g.createImageData(256, 256);
      for (let i = 0; i < id.data.length; i += 4) {
        const v = Math.random() * 255;
        id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
        id.data[i + 3] = Math.random() < 0.5 ? 0 : 255;
      }
      g.putImageData(id, 0, 0);
    }
    awake = true;
  };

  const draw = (now: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = opts.palette.background;
    ctx.fillRect(0, 0, w, h);

    const r = opts.interactive && !reduced ? Math.max(0, opts.radius) : 0;
    const ringAge = ring.t < 0 ? 1e9 : now - ring.t;
    const ringR = ringAge * 0.9;
    let moving = false;

    for (let i = 0; i < count; i++) {
      const j = i * 7;
      let x = dots[j];
      let y = dots[j + 1];
      let vx = dots[j + 2];
      let vy = dots[j + 3];
      const hx = dots[j + 4];
      const hy = dots[j + 5];

      if (!reduced) {
        if (ringAge < 900) {
          const dx = hx - ring.x;
          const dy = hy - ring.y;
          const d = Math.sqrt(dx * dx + dy * dy) + 0.001;
          const band = 1 - Math.min(1, Math.abs(d - ringR) / 26);
          if (band > 0) {
            const f = band * 3.2 * (1 - ringAge / 900);
            vx += (dx / d) * f;
            vy += (dy / d) * f;
          }
        }
        const s = hwfStep(x, y, vx, vy, hx, hy, px, py, r);
        x = s[0];
        y = s[1];
        vx = s[2];
        vy = s[3];
        if (Math.abs(vx) + Math.abs(vy) > 0.02 || Math.abs(x - hx) + Math.abs(y - hy) > 0.05) {
          moving = true;
        } else {
          x = hx;
          y = hy;
          vx = 0;
          vy = 0;
        }
        dots[j] = x;
        dots[j + 1] = y;
        dots[j + 2] = vx;
        dots[j + 3] = vy;
      }

      const k = hwfWarmth(x, y, hx, hy, 28);
      ctx.fillStyle =
        k > 0.02
          ? "rgb(" +
            Math.round(ink[0] + (warm[0] - ink[0]) * k) + "," +
            Math.round(ink[1] + (warm[1] - ink[1]) * k) + "," +
            Math.round(ink[2] + (warm[2] - ink[2]) * k) + ")"
          : opts.palette.ink;
      ctx.beginPath();
      ctx.arc(x, y, dots[j + 6], 0, 6.2832);
      ctx.fill();
    }

    if (grainTile && opts.grain > 0) {
      ctx.globalAlpha = Math.min(1, opts.grain) * 0.09;
      ctx.globalCompositeOperation = "overlay";
      const pattern = ctx.createPattern(grainTile, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    awake = moving || ringAge < 900 || px > -1e4;
  };

  const loop = (now: number) => {
    raf = 0;
    if (!visible) return;
    draw(now);
    if (awake) raf = requestAnimationFrame(loop);
  };

  const wake = () => {
    awake = true;
    if (!raf && visible) raf = requestAnimationFrame(loop);
  };

  const toLocal = (e: PointerEvent) => {
    const b = canvas.getBoundingClientRect();
    return [e.clientX - b.left, e.clientY - b.top];
  };

  const onMove = (e: PointerEvent) => {
    if (!opts.interactive) return;
    const p = toLocal(e);
    px = p[0];
    py = p[1];
    wake();
  };

  const onLeave = () => {
    px = -1e5;
    py = -1e5;
    wake();
  };

  const onDown = (e: PointerEvent) => {
    if (!opts.interactive || reduced) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    const p = toLocal(e);
    ring = { x: p[0], y: p[1], t: performance.now() };
    wake();
  };

  layout();
  draw(performance.now());
  wake();

  container.addEventListener("pointermove", onMove);
  container.addEventListener("pointerleave", onLeave);
  container.addEventListener("pointerdown", onDown);

  const ro = new ResizeObserver(() => {
    layout();
    wake();
  });
  ro.observe(container);

  const io = new IntersectionObserver((entries) => {
    visible = entries[0] ? entries[0].isIntersecting : true;
    if (visible) wake();
  });
  io.observe(container);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      layout();
      wake();
    });
  }

  return {
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("pointerdown", onDown);
    }
  };
}

// Auto-initialize on footer element if canvas is present
if (typeof window !== "undefined") {
  (window as any).createHalftoneEngine = createHalftoneEngine;

  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".site-footer, .hwf-root, footer") as HTMLElement;
    if (!footer) return;

    let canvas = footer.querySelector("canvas.hwf-canvas") as HTMLCanvasElement;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "hwf-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "0";
      footer.style.position = "relative";
      footer.style.overflow = "hidden";
      footer.insertBefore(canvas, footer.firstChild);
    }

    createHalftoneEngine(footer, canvas, {
      wordmark: "carbonloom",
      dotGap: 6,
      radius: 85,
      crop: 0.18,
      grain: 0.4,
      palette: {
        background: "#070709",
        ink: "rgba(244, 244, 246, 0.45)",
        warm: "#10b981"
      }
    });
  });
}
