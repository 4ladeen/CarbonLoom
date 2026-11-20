/**
 * CarbonLoom — ASCII & Pixel Art Industrial Factory & Carbon Smoke Engine
 * Pure Retro-Industrial SCADA Aesthetic (Teenage Engineering / DEC VT220 / Cyberpunk)
 * 
 * Features:
 * - Rich ASCII & Pixel Art factory architecture: sawtooth sheds, brick boiler houses,
 *   pipe manifolds, cooling towers, and illuminated night-shift window grids.
 * - Procedural ASCII smoke clusters that billow and expand organically as they rise.
 * - Thermal color envelope: warm combustion embers (#f59e0b) -> slate smoke -> dissolving particulate.
 * - Perfectly framed stack locations: far left, central corridor, and far right flanks
 *   to ensure zero collision with typography while providing dense atmosphere.
 * - Real-time wind vector responding to mouse movement.
 * - Interactive decarbonization: Boiler 01 smoke halts when steam trap is repaired.
 */

export interface AsciiSkylineOptions {
  variant?: "hero" | "dyeing" | "power" | "boiler" | "spinning" | "cluster" | "terminal";
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  seed: number;
  stackId: number;
}

interface Stack {
  relX: number;     // fractional width (0.0 to 1.0)
  heightRows: number; // height in character rows
  widthCols: number;  // width in character columns
  active: boolean;
  beacon: boolean;
  name: string;
}

export function initAsciiSkyline(container: HTMLElement, options: AsciiSkylineOptions = {}) {
  const variant = options.variant || "hero";

  const canvas = document.createElement("canvas");
  canvas.className = "carbon-ascii-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";

  container.style.position = "relative";
  container.insertBefore(canvas, container.firstChild);

  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy: () => {}, setStackEmission: () => {} };

  let w = 0;
  let h = 0;
  let dpr = 1;
  let rafId = 0;
  let isVisible = true;
  let mouseX = -1000;
  let mouseY = -1000;
  let windX = 0.22;
  let targetWindX = 0.22;

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Monospace character cell dimensions
  const charW = 9;
  const charH = 14;
  let cols = 0;
  let rows = 0;

  // Stacks strategically placed in open visual corridors
  const stacks: Stack[] = getStacksForVariant(variant);
  const particles: SmokeParticle[] = [];
  const maxParticles = reducedMotion ? 0 : (variant === "hero" ? 220 : 160);

  const resize = () => {
    const rect = container.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    cols = Math.ceil(w / charW);
    rows = Math.ceil(h / charH);
  };

  const spawnSmokeParticle = (stackIdx: number) => {
    const s = stacks[stackIdx];
    const stackCol = Math.round(s.relX * cols);
    const spawnX = (stackCol + s.widthCols / 2) * charW + (Math.random() - 0.5) * 4;
    const baseRow = rows - 2;
    const spawnY = (baseRow - s.heightRows) * charH;

    particles.push({
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(0.75 + Math.random() * 0.75),
      life: 0,
      maxLife: 150 + Math.random() * 110,
      seed: Math.random() * 100,
      stackId: stackIdx
    });
  };

  const preSeedParticles = () => {
    if (reducedMotion) return;
    for (let step = 0; step < 160; step++) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.38) {
          spawnSmokeParticle(i);
        }
      }
      for (let p of particles) {
        p.life += 1;
        p.y += p.vy;
        p.x += p.vx + windX * 1.2;
      }
    }
  };

  // Smoke characters by density & combustion stage
  const glyphsCore = ["@", "&", "8", "%", "#", "▓"];
  const glyphsMid = ["#", "%", "S", "O", "*", "▒"];
  const glyphsDrift = ["o", "*", "~", "≈", "░", "°"];
  const glyphsFaint = [".", "·", "°", " "];

  // Draw procedural ASCII smoke clusters
  const drawAsciiSmoke = (ctx: CanvasRenderingContext2D, time: number) => {
    if (!reducedMotion && particles.length < maxParticles) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.36) {
          spawnSmokeParticle(i);
        }
      }
    }

    windX += (targetWindX - windX) * 0.02;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      const progress = p.life / p.maxLife;
      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      // Physics: buoyant rise slows as cloud expands; turbulence wobble; wind
      p.y += p.vy * (1 - progress * 0.35);
      const wobble = Math.sin(time * 0.018 + p.seed) * 0.55;
      p.x += p.vx + wobble + windX * (0.9 + progress * 2.4);

      const targetCol = Math.floor(p.x / charW);
      const targetRow = Math.floor(p.y / charH);
      const renderX = targetCol * charW;
      const renderY = targetRow * charH;

      // Color and glyph selection based on combustion envelope
      let char = "";
      let color = "";

      if (progress < 0.16) {
        char = glyphsCore[Math.floor(p.seed * 7) % glyphsCore.length];
        const alpha = Math.min(1, progress / 0.10) * 0.85;
        color = `rgba(245, 158, 11, ${alpha})`; // Amber hot core
      } else if (progress < 0.50) {
        char = glyphsMid[Math.floor(p.seed * 9) % glyphsMid.length];
        const alpha = (1 - (progress - 0.16) / 0.34) * 0.45 + 0.22;
        color = `rgba(185, 190, 205, ${alpha})`; // Slate graphite smoke
      } else if (progress < 0.82) {
        char = glyphsDrift[Math.floor(p.seed * 11) % glyphsDrift.length];
        const alpha = (1 - (progress - 0.50) / 0.32) * 0.24;
        color = `rgba(135, 140, 155, ${alpha})`; // Diffuse particulate
      } else {
        char = glyphsFaint[Math.floor(p.seed * 5) % glyphsFaint.length];
        const alpha = (1 - (progress - 0.82) / 0.18) * 0.14;
        color = `rgba(90, 95, 110, ${alpha})`;
      }

      ctx.fillStyle = color;
      ctx.fillText(char, renderX, renderY);

      // Expansion: as smoke ascends, it spreads into organic neighboring puff cells
      if (progress > 0.22) {
        const spreadCols = progress > 0.55 ? 2 : 1;
        const sideChar = glyphsDrift[(Math.floor(p.seed * 3) + 1) % glyphsDrift.length];
        const sideAlpha = 0.20 * (1 - progress);
        ctx.fillStyle = `rgba(155, 160, 175, ${sideAlpha})`;
        ctx.fillText(sideChar, renderX - spreadCols * charW, renderY + (p.seed > 50 ? 3 : -3));
        ctx.fillText(sideChar, renderX + spreadCols * charW, renderY);
      }
    }
  };

  // Draw architectural ASCII & Pixel Art Factory Complex
  const drawAsciiFactory = (ctx: CanvasRenderingContext2D, time: number) => {
    const baseRow = rows - 2;
    const baseY = baseRow * charH;

    // Ground baseline
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    for (let c = 0; c < cols; c++) {
      ctx.fillText(c % 4 === 0 ? "╧" : "═", c * charW, baseY + charH);
    }

    // 1. Distant Background Mill Silhouettes (Faint Shade: ░░)
    ctx.fillStyle = "rgba(45, 52, 68, 0.4)";
    const bgHills = [
      { start: 0, end: Math.floor(cols * 0.25), h: 8 },
      { start: Math.floor(cols * 0.30), end: Math.floor(cols * 0.55), h: 10 },
      { start: Math.floor(cols * 0.60), end: Math.floor(cols * 0.85), h: 9 },
      { start: Math.floor(cols * 0.88), end: cols, h: 7 }
    ];
    bgHills.forEach((b) => {
      for (let c = b.start; c < b.end; c++) {
        for (let r = baseRow - b.h; r <= baseRow; r++) {
          if (r === baseRow - b.h) {
            ctx.fillText("▄", c * charW, r * charH);
          } else {
            ctx.fillText("░", c * charW, r * charH);
          }
        }
      }
    });

    // 2. Sawtooth Weaving Shed Roofs (Classic Industrial Architecture: ╱│╱│╱│)
    const toothCount = 4;
    const toothWidth = Math.min(24, Math.floor(cols * 0.18));
    const step = Math.floor(toothWidth / toothCount);
    for (let t = 0; t < toothCount; t++) {
      const startC = t * step;
      const peakRow = baseRow - 6;
      for (let r = 0; r < 6; r++) {
        const c = startC + r;
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText("╱", c * charW, (baseRow - r) * charH);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillText("│", (startC + 6) * charW, peakRow * charH);

      // Lit clerestory windows inside sawtooth peak
      ctx.fillStyle = "rgba(245, 158, 11, 0.55)";
      ctx.fillText("▣", (startC + 4) * charW, (baseRow - 3) * charH);
    }

    // Sawtooth building masonry base
    for (let c = 0; c < toothWidth; c++) {
      for (let r = baseRow - 2; r <= baseRow; r++) {
        ctx.fillStyle = "rgba(22, 26, 36, 0.92)";
        ctx.fillText("█", c * charW, r * charH);
      }
    }

    // 3. Central Production Hall & Testing Laboratories
    const hallStart = Math.floor(cols * 0.44);
    const hallEnd = Math.floor(cols * 0.60);
    const hallHeight = 8;
    for (let c = hallStart; c < hallEnd; c++) {
      for (let r = baseRow - hallHeight; r <= baseRow; r++) {
        if (r === baseRow - hallHeight) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
          ctx.fillText("▀", c * charW, r * charH);
        } else if (c === hallStart || c === hallEnd - 1) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillText("║", c * charW, r * charH);
        } else {
          // Double-deck illuminated window grid (night-shift manufacturing)
          const isWindow = (r === baseRow - 5 || r === baseRow - 2) && (c % 3 === 0);
          if (isWindow) {
            ctx.fillStyle = (c % 6 === 0) ? "rgba(245, 158, 11, 0.75)" : "rgba(220, 235, 255, 0.65)";
            ctx.fillText("■", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(18, 22, 30, 0.9)";
            ctx.fillText("▒", c * charW, r * charH);
          }
        }
      }
    }

    // 4. Hyperbolic Cooling Tower Silhouette
    const ctCenter = Math.floor(cols * 0.26);
    const ctH = 10;
    for (let dy = 0; dy < ctH; dy++) {
      const r = baseRow - dy;
      const halfW = Math.round(2 + Math.pow((dy - 5) / 2.8, 2));
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      ctx.fillText("(", (ctCenter - halfW) * charW, r * charH);
      ctx.fillText(")", (ctCenter + halfW) * charW, r * charH);
      for (let fillC = ctCenter - halfW + 1; fillC < ctCenter + halfW; fillC++) {
        ctx.fillStyle = "rgba(16, 20, 28, 0.85)";
        ctx.fillText("░", fillC * charW, r * charH);
      }
    }

    // 5. Overhead Steam Pipe Bridge Networks
    const pipeStart = toothWidth;
    const pipeEnd = hallStart;
    const pipeY = (baseRow - 4) * charH;
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let c = pipeStart; c < pipeEnd; c++) {
      ctx.fillText(c % 6 === 0 ? "╤" : "═", c * charW, pipeY);
      if (c % 6 === 0) {
        ctx.fillText("│", c * charW, pipeY + charH);
        ctx.fillText("│", c * charW, pipeY + charH * 2);
      }
    }

    // 6. Chimney Smokestacks with Brick Stiffening Rings & Beacons
    stacks.forEach((s) => {
      const stackCol = Math.round(s.relX * cols);
      const topRow = baseRow - s.heightRows;

      // Chimney column body
      for (let r = topRow; r <= baseRow; r++) {
        const isRim = r === topRow;
        const isBand = (r - topRow) % 4 === 0;

        for (let wOff = 0; wOff < s.widthCols; wOff++) {
          const c = stackCol + wOff;
          if (isRim) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillText("▄", c * charW, r * charH);
          } else if (isBand) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
            ctx.fillText("▓", c * charW, r * charH);
          } else if (wOff === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillText("│", c * charW, r * charH);
          } else if (wOff === s.widthCols - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillText("│", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(20, 24, 34, 0.94)";
            ctx.fillText("█", c * charW, r * charH);
          }
        }
      }

      // Flashing Aircraft Beacon LED atop chimney summit
      if (s.beacon) {
        const beaconPulse = (Math.sin(time * 0.004) + 1) * 0.5;
        const beaconC = stackCol + Math.floor(s.widthCols / 2);
        const beaconY = (topRow - 1) * charH;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.45 + 0.55 * beaconPulse})`;
        ctx.fillText("●", beaconC * charW, beaconY);
      }
    });
  };

  const render = (time: number) => {
    rafId = 0;
    if (!isVisible) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Deep obsidian ambient background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(7, 7, 9, 0)");
    bg.addColorStop(0.60, "rgba(10, 12, 18, 0.45)");
    bg.addColorStop(0.90, "rgba(14, 16, 24, 0.85)");
    bg.addColorStop(1, "rgba(7, 7, 9, 0.98)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Monospace font styling
    ctx.font = `11px "Geist Mono", ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";

    // 1. Draw Rising ASCII Carbon Plumes (Behind chimneys)
    drawAsciiSmoke(ctx, time);

    // 2. Draw Architectural ASCII Factory Skyline
    drawAsciiFactory(ctx, time);

    rafId = requestAnimationFrame(render);
  };

  const onPointerMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetWindX = ((mouseX / window.innerWidth) - 0.45) * 1.2;
  };

  resize();
  preSeedParticles();
  rafId = requestAnimationFrame(render);

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const io = new IntersectionObserver((entries) => {
    isVisible = entries[0]?.isIntersecting ?? true;
    if (isVisible && !rafId) {
      rafId = requestAnimationFrame(render);
    }
  });
  io.observe(container);

  return {
    destroy: () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      io.disconnect();
      canvas.remove();
    },
    setStackEmission: (stackIndex: number, active: boolean) => {
      if (stacks[stackIndex]) {
        stacks[stackIndex].active = active;
      }
    }
  };
}

// Stacks strategically placed in open visual corridors to clear paragraph text
function getStacksForVariant(variant: string): Stack[] {
  switch (variant) {
    case "hero":
      return [
        { relX: 0.02, heightRows: 17, widthCols: 3, active: true, beacon: true, name: "Boiler 01 Primary (Flank)" },
        { relX: 0.39, heightRows: 18, widthCols: 3, active: true, beacon: true, name: "Central Gap Exhaust" },
        { relX: 0.65, heightRows: 14, widthCols: 3, active: true, beacon: false, name: "HUD Mid Riser" },
        { relX: 0.92, heightRows: 20, widthCols: 4, active: true, beacon: true, name: "Right Flank Header" },
        { relX: 0.98, heightRows: 15, widthCols: 2, active: true, beacon: true, name: "Far Right Stack" }
      ];
    case "dyeing":
      return [
        { relX: 0.04, heightRows: 18, widthCols: 3, active: true, beacon: true, name: "Dyeing Stenter #01" },
        { relX: 0.35, heightRows: 21, widthCols: 4, active: true, beacon: true, name: "Steam Drying Oven #02" },
        { relX: 0.68, heightRows: 16, widthCols: 3, active: true, beacon: false, name: "Bleaching Line Exhaust" },
        { relX: 0.92, heightRows: 22, widthCols: 4, active: true, beacon: true, name: "Central Scrubber Stack" }
      ];
    case "power":
      return [
        { relX: 0.04, heightRows: 20, widthCols: 4, active: true, beacon: true, name: "Gas Turbine Exhaust 1" },
        { relX: 0.38, heightRows: 24, widthCols: 4, active: true, beacon: true, name: "Co-Gen Heat Recovery" },
        { relX: 0.66, heightRows: 17, widthCols: 3, active: true, beacon: false, name: "Thermal Flue Header" },
        { relX: 0.92, heightRows: 22, widthCols: 4, active: true, beacon: true, name: "DESCO Substation Plant" }
      ];
    case "boiler":
      return [
        { relX: 0.06, heightRows: 16, widthCols: 3, active: true, beacon: false, name: "Boiler 02 Secondary" },
        { relX: 0.85, heightRows: 23, widthCols: 4, active: true, beacon: true, name: "Boiler 01 Primary (Monitored)" }
      ];
    case "spinning":
      return [
        { relX: 0.04, heightRows: 16, widthCols: 3, active: true, beacon: false, name: "Spinning Mill Shed Exhaust" },
        { relX: 0.38, heightRows: 20, widthCols: 4, active: true, beacon: true, name: "HVAC Central Riser" },
        { relX: 0.66, heightRows: 17, widthCols: 3, active: true, beacon: false, name: "Weaving Shed Dust Filter" },
        { relX: 0.92, heightRows: 19, widthCols: 3, active: true, beacon: true, name: "Lab Thermal Exhaust" }
      ];
    case "cluster":
      return [
        { relX: 0.03, heightRows: 18, widthCols: 3, active: true, beacon: true, name: "Apex Padma Mill #1" },
        { relX: 0.35, heightRows: 21, widthCols: 4, active: true, beacon: true, name: "DBL Cluster Stack" },
        { relX: 0.68, heightRows: 16, widthCols: 3, active: true, beacon: false, name: "Turag Dyeing Line" },
        { relX: 0.92, heightRows: 23, widthCols: 4, active: true, beacon: true, name: "Gazipur Central Boiler" }
      ];
    case "terminal":
    default:
      return [
        { relX: 0.04, heightRows: 16, widthCols: 3, active: true, beacon: false, name: "Dispatch Terminal Vent" },
        { relX: 0.40, heightRows: 21, widthCols: 4, active: true, beacon: true, name: "Central Logistics Exhaust" },
        { relX: 0.90, heightRows: 19, widthCols: 3, active: true, beacon: true, name: "Container Yard Boiler" }
      ];
  }
}

// Auto-initialize across sections
if (typeof window !== "undefined") {
  (window as any).initAsciiSkyline = initAsciiSkyline;
  (window as any).initCarbonSkyline = initAsciiSkyline;

  const autoInitAscii = () => {
    const hero = document.querySelector(".hero-section") as HTMLElement;
    if (hero && !(hero as any)._asciiInit) {
      (hero as any)._asciiInit = true;
      (window as any).carbonSkylineInstance = initAsciiSkyline(hero, { variant: "hero" });
    }

    const macro = document.getElementById("macro-threat");
    if (macro && !(macro as any)._asciiInit) {
      (macro as any)._asciiInit = true;
      initAsciiSkyline(macro, { variant: "dyeing" });
    }

    const pipeline = document.getElementById("pipeline");
    if (pipeline && !(pipeline as any)._asciiInit) {
      (pipeline as any)._asciiInit = true;
      initAsciiSkyline(pipeline, { variant: "power" });
    }

    const forensics = document.getElementById("forensics");
    if (forensics && !(forensics as any)._asciiInit) {
      (forensics as any)._asciiInit = true;
      (window as any).forensicsSkylineInstance = initAsciiSkyline(forensics, { variant: "boiler" });
    }

    const secrecy = document.getElementById("secrecy");
    if (secrecy && !(secrecy as any)._asciiInit) {
      (secrecy as any)._asciiInit = true;
      initAsciiSkyline(secrecy, { variant: "spinning" });
    }

    const pilots = document.getElementById("pilots");
    if (pilots && !(pilots as any)._asciiInit) {
      (pilots as any)._asciiInit = true;
      initAsciiSkyline(pilots, { variant: "cluster" });
    }

    const modules = document.getElementById("modules");
    if (modules && !(modules as any)._asciiInit) {
      (modules as any)._asciiInit = true;
      initAsciiSkyline(modules, { variant: "terminal" });
    }

    const customBgs = document.querySelectorAll<HTMLElement>(".carbon-skyline-bg");
    customBgs.forEach((el) => {
      if (!(el as any)._asciiInit) {
        (el as any)._asciiInit = true;
        const v = (el.getAttribute("data-skyline") || "cluster") as any;
        initAsciiSkyline(el, { variant: v });
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitAscii);
  } else {
    autoInitAscii();
  }
}
