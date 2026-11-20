/**
 * CarbonLoom — Architectural Industrial Factory Skyline & Dynamic Carbon Plume Simulation
 * Top-1% Craft: CAD blueprint factory silhouettes with procedural aerodynamic carbon fumes
 * Linear / Teenage Engineering / Watershed industrial aesthetic
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  seed: number;
  stackId: number;
}

interface Stack {
  relX: number;
  topY: number;
  width: number;
  height: number;
  active: boolean;
  beacon: boolean;
  name: string;
}

export function initCarbonSkyline(container: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.className = "carbon-skyline-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "0";

  container.style.position = "relative";
  // Ensure canvas is placed behind any content
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
  let windX = 0.15; // default gentle eastern drift
  let targetWindX = 0.15;

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 5 Strategic Industrial Stacks across the factory complex
  const stacks: Stack[] = [
    { relX: 0.08, topY: 0, width: 14, height: 165, active: true, beacon: true, name: "Boiler 01 Primary" },
    { relX: 0.22, topY: 0, width: 10, height: 120, active: true, beacon: false, name: "Stenter 01 Exhaust" },
    { relX: 0.38, topY: 0, width: 12, height: 145, active: true, beacon: true, name: "Stenter 02 Finishing" },
    { relX: 0.72, topY: 0, width: 18, height: 195, active: true, beacon: true, name: "Thermal Oil Header" },
    { relX: 0.90, topY: 0, width: 14, height: 155, active: true, beacon: true, name: "Central Heat Plant" }
  ];

  const particles: Particle[] = [];
  const maxParticles = reducedMotion ? 0 : 220;

  const resize = () => {
    const rect = container.getBoundingClientRect();
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    // Horizon line set at 90% of hero height
    const horizon = h * 0.91;
    stacks.forEach((s) => {
      s.topY = horizon - s.height;
    });
  };

  const spawnParticle = (stackIdx: number) => {
    const s = stacks[stackIdx];
    const spawnX = s.relX * w + s.width / 2 + (Math.random() - 0.5) * 5;
    const spawnY = s.topY + 1;

    const maxLife = 160 + Math.random() * 120;
    particles.push({
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.75 + Math.random() * 0.75),
      size: 5 + Math.random() * 4,
      maxSize: 38 + Math.random() * 26,
      alpha: 0.02,
      maxAlpha: 0.26 + Math.random() * 0.14,
      life: 0,
      maxLife,
      wobbleSpeed: 0.016 + Math.random() * 0.022,
      wobbleAmp: 0.45 + Math.random() * 0.55,
      seed: Math.random() * 100,
      stackId: stackIdx
    });
  };

  // Pre-seed some particles so page doesn't start empty
  const preSeedParticles = () => {
    if (reducedMotion) return;
    for (let step = 0; step < 180; step++) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.35) {
          spawnParticle(i);
        }
      }
      // advance simulated particles
      for (let p of particles) {
        p.life += 1;
        p.y += p.vy;
        p.x += p.vx + windX;
      }
    }
  };

  // Draw architectural CAD factory vector silhouettes
  const drawSkyline = (ctx: CanvasRenderingContext2D, time: number) => {
    const horizon = h * 0.91;

    // --- Background Layer 1: Distant Industrial Sheds & Silos ---
    ctx.fillStyle = "rgba(16, 18, 24, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(0, horizon - 55);
    ctx.lineTo(w * 0.06, horizon - 55);
    ctx.lineTo(w * 0.14, horizon - 85);
    ctx.lineTo(w * 0.17, horizon - 85);
    ctx.lineTo(w * 0.25, horizon - 50);
    ctx.lineTo(w * 0.32, horizon - 70);
    ctx.lineTo(w * 0.46, horizon - 70);
    ctx.lineTo(w * 0.52, horizon - 45);
    ctx.lineTo(w * 0.64, horizon - 90);
    ctx.lineTo(w * 0.70, horizon - 90);
    ctx.lineTo(w * 0.78, horizon - 110);
    ctx.lineTo(w * 0.85, horizon - 65);
    ctx.lineTo(w * 0.94, horizon - 75);
    ctx.lineTo(w, horizon - 50);
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Distant Cooling Tower (Left of center, subtle hyperboloid)
    const ctX = w * 0.55;
    const ctBase = horizon;
    const ctTop = horizon - 75;
    const ctW1 = 28;
    const ctW2 = 18;
    ctx.fillStyle = "rgba(14, 16, 21, 0.85)";
    ctx.beginPath();
    ctx.moveTo(ctX - ctW1, ctBase);
    ctx.quadraticCurveTo(ctX - ctW2 * 0.7, horizon - 40, ctX - ctW2, ctTop);
    ctx.lineTo(ctX + ctW2, ctTop);
    ctx.quadraticCurveTo(ctX + ctW2 * 0.7, horizon - 40, ctX + ctW1, ctBase);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.stroke();

    // --- Foreground Layer 2: Main Manufacturing Works & Sawtooth Weaving Sheds ---
    ctx.fillStyle = "rgba(11, 13, 17, 0.96)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, horizon);

    // Left Spinning & Weaving Sheds with Sawtooth Roofs
    let curX = 0;
    ctx.lineTo(curX, horizon - 35);
    const toothCount = 4;
    const toothStep = (w * 0.16) / toothCount;
    for (let i = 0; i < toothCount; i++) {
      curX += toothStep * 0.75;
      ctx.lineTo(curX, horizon - 65);
      curX += toothStep * 0.25;
      ctx.lineTo(curX, horizon - 35);
    }

    // Stack 0: Boiler House 01
    const s0 = stacks[0];
    const s0X = s0.relX * w;
    ctx.lineTo(s0X - 14, horizon - 45);
    ctx.lineTo(s0X - 14, s0.topY + 35);
    ctx.lineTo(s0X, s0.topY);
    ctx.lineTo(s0X + s0.width, s0.topY);
    ctx.lineTo(s0X + s0.width + 12, s0.topY + 35);
    ctx.lineTo(s0X + s0.width + 24, horizon - 45);

    // Mid section to Stack 1 (Stenter Hall)
    const s1 = stacks[1];
    const s1X = s1.relX * w;
    ctx.lineTo(s1X - 10, horizon - 45);
    ctx.lineTo(s1X - 6, s1.topY + 25);
    ctx.lineTo(s1X, s1.topY);
    ctx.lineTo(s1X + s1.width, s1.topY);
    ctx.lineTo(s1X + s1.width + 8, s1.topY + 25);
    ctx.lineTo(s1X + s1.width + 16, horizon - 40);

    // Inter-building gantry
    ctx.lineTo(w * 0.30, horizon - 40);
    ctx.lineTo(w * 0.30, horizon - 55);
    ctx.lineTo(w * 0.35, horizon - 55);
    ctx.lineTo(w * 0.35, horizon - 40);

    // Stack 2: Finishing Stenter 02
    const s2 = stacks[2];
    const s2X = s2.relX * w;
    ctx.lineTo(s2X - 10, horizon - 40);
    ctx.lineTo(s2X, s2.topY);
    ctx.lineTo(s2X + s2.width, s2.topY);
    ctx.lineTo(s2X + s2.width + 10, horizon - 40);

    // Central Multi-story Administration & Laboratory Block
    ctx.lineTo(w * 0.44, horizon - 40);
    ctx.lineTo(w * 0.44, horizon - 75);
    ctx.lineTo(w * 0.52, horizon - 75);
    ctx.lineTo(w * 0.52, horizon - 50);
    ctx.lineTo(w * 0.65, horizon - 50);

    // Stack 3: High-Pressure Thermal Oil & Co-Gen Header (Tallest)
    const s3 = stacks[3];
    const s3X = s3.relX * w;
    ctx.lineTo(s3X - 25, horizon - 55);
    ctx.lineTo(s3X - 25, s3.topY + 50);
    ctx.lineTo(s3X, s3.topY);
    ctx.lineTo(s3X + s3.width, s3.topY);
    ctx.lineTo(s3X + s3.width + 18, s3.topY + 50);
    ctx.lineTo(s3X + s3.width + 32, horizon - 55);

    // Right Industrial Wing & Stack 4
    const s4 = stacks[4];
    const s4X = s4.relX * w;
    ctx.lineTo(s4X - 16, horizon - 48);
    ctx.lineTo(s4X, s4.topY);
    ctx.lineTo(s4X + s4.width, s4.topY);
    ctx.lineTo(s4X + s4.width + 14, horizon - 48);

    ctx.lineTo(w, horizon - 40);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- Architectural Precision Details ---
    // 1. Factory illuminated window bands (Night-shift textile production)
    const windowColors = [
      "rgba(245, 158, 11, 0.18)", // warm tungsten
      "rgba(220, 230, 245, 0.14)", // clean inspection white
      "rgba(16, 185, 129, 0.14)"  // control room emerald
    ];

    // Central Lab Windows
    const labX1 = w * 0.45;
    const labX2 = w * 0.51;
    for (let wy = horizon - 70; wy <= horizon - 55; wy += 7) {
      for (let wx = labX1; wx < labX2; wx += 9) {
        ctx.fillStyle = (wx + wy) % 2 === 0 ? windowColors[1] : windowColors[0];
        ctx.fillRect(wx, wy, 5, 4);
      }
    }

    // Sawtooth Clerestory Windows
    curX = 0;
    for (let i = 0; i < toothCount; i++) {
      const toothApex = curX + toothStep * 0.75;
      const toothBase = curX + toothStep;
      ctx.fillStyle = windowColors[0];
      ctx.beginPath();
      ctx.moveTo(toothApex, horizon - 63);
      ctx.lineTo(toothBase, horizon - 37);
      ctx.lineTo(toothApex, horizon - 37);
      ctx.closePath();
      ctx.fill();
      curX += toothStep;
    }

    // 2. High-pressure steam pipe rack bridges
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    // Pipe bridge from Boiler 01 to Stenter 01
    ctx.moveTo(s0X + s0.width + 24, horizon - 40);
    ctx.lineTo(s1X - 10, horizon - 40);
    ctx.moveTo(s0X + s0.width + 24, horizon - 36);
    ctx.lineTo(s1X - 10, horizon - 36);
    // Vertical supports
    const pipeSpan = (s1X - 10) - (s0X + s0.width + 24);
    for (let px = s0X + s0.width + 45; px < s1X - 20; px += 35) {
      ctx.moveTo(px, horizon - 36);
      ctx.lineTo(px, horizon);
    }
    ctx.stroke();

    // 3. Chimney Thermal Stiffening Rings
    stacks.forEach((s) => {
      const sx = s.relX * w;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      for (let y = s.topY + 18; y < horizon - 20; y += 22) {
        ctx.beginPath();
        ctx.moveTo(sx - 2, y);
        ctx.lineTo(sx + s.width + 2, y);
        ctx.stroke();
      }

      // Vertical Ladder Cage
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.moveTo(sx + 2, s.topY + 12);
      ctx.lineTo(sx + 2, horizon - 15);
      ctx.stroke();
    });

    // 4. Stroboscopic Red/Amber Aircraft Warning Beacons on Chimney Summits
    const beaconPulse = (Math.sin(time * 0.0035) + 1) * 0.5; // slow 1.2s pulse
    stacks.forEach((s) => {
      if (s.beacon) {
        const bx = s.relX * w + s.width / 2;
        const by = s.topY - 2;

        // Halo
        const haloGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 8);
        haloGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * beaconPulse})`);
        haloGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fill();

        // Diode Core
        ctx.fillStyle = `rgba(255, 120, 120, ${0.75 + 0.25 * beaconPulse})`;
        ctx.beginPath();
        ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Baseline Ground Horizon Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
  };

  // Draw procedural fluid carbon fumes / aerodynamic plume dispersion
  const drawPlumes = (ctx: CanvasRenderingContext2D, time: number) => {
    // Spawn particles progressively
    if (!reducedMotion && particles.length < maxParticles) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.38) {
          spawnParticle(i);
        }
      }
    }

    // Smooth wind vector tracking mouse
    windX += (targetWindX - windX) * 0.025;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life++;

      const progress = p.life / p.maxLife;

      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      // Physics: rising buoyancy slows gently as plume expands
      p.y += p.vy * (1 - progress * 0.35);
      // Aerodynamic horizontal sway & wind drift
      const wobble = Math.sin(time * p.wobbleSpeed + p.seed) * p.wobbleAmp;
      p.x += p.vx + wobble + windX * (0.9 + progress * 2.2);

      // Expansion of plume radius
      const currentSize = p.size + (p.maxSize - p.size) * Math.pow(progress, 0.72);

      // Envelope: rises quickly at nozzle, softly fades as smoke dissipates
      let currentAlpha = 0;
      if (progress < 0.12) {
        currentAlpha = (progress / 0.12) * p.maxAlpha;
      } else {
        currentAlpha = p.maxAlpha * Math.pow(1 - progress, 1.3);
      }

      // Draw smoky carbon plume puff with soft radial gradient
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);

      // Near chimney orifice: warm combustion core; rising plume: diffuse slate carbon smoke
      if (progress < 0.22) {
        grad.addColorStop(0, `rgba(245, 158, 11, ${currentAlpha * 0.75})`);
        grad.addColorStop(0.35, `rgba(180, 185, 205, ${currentAlpha * 0.55})`);
        grad.addColorStop(1, "rgba(15, 17, 24, 0)");
      } else if (progress < 0.6) {
        grad.addColorStop(0, `rgba(195, 200, 215, ${currentAlpha * 0.45})`);
        grad.addColorStop(0.5, `rgba(145, 150, 168, ${currentAlpha * 0.25})`);
        grad.addColorStop(1, "rgba(10, 12, 18, 0)");
      } else {
        grad.addColorStop(0, `rgba(165, 170, 185, ${currentAlpha * 0.3})`);
        grad.addColorStop(0.6, `rgba(120, 125, 140, ${currentAlpha * 0.12})`);
        grad.addColorStop(1, "rgba(8, 10, 14, 0)");
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const render = (time: number) => {
    rafId = 0;
    if (!isVisible) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // 1. Subtle atmospheric gradient in background
    const bgAtmosphere = ctx.createLinearGradient(0, 0, 0, h);
    bgAtmosphere.addColorStop(0, "rgba(7, 7, 9, 0)");
    bgAtmosphere.addColorStop(0.65, "rgba(14, 16, 22, 0.45)");
    bgAtmosphere.addColorStop(0.92, "rgba(18, 21, 28, 0.7)");
    bgAtmosphere.addColorStop(1, "rgba(7, 7, 9, 0.95)");
    ctx.fillStyle = bgAtmosphere;
    ctx.fillRect(0, 0, w, h);

    // 2. Rising Carbon Fume Plumes (Behind chimneys so chimney edge silhouettes remain razor-sharp)
    drawPlumes(ctx, time);

    // 3. Architectural Factory Skyline Silhouette
    drawSkyline(ctx, time);

    rafId = requestAnimationFrame(render);
  };

  const onPointerMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Mouse horizontally directs ambient wind velocity (-0.6 to +0.8)
    targetWindX = ((mouseX / window.innerWidth) - 0.45) * 1.1;
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

// Auto-initialize on hero or root background
if (typeof window !== "undefined") {
  (window as any).initCarbonSkyline = initCarbonSkyline;

  const autoInit = () => {
    const hero = document.querySelector(".hero-section") as HTMLElement;
    if (hero && !(window as any).carbonSkylineInstance) {
      (window as any).carbonSkylineInstance = initCarbonSkyline(hero);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
}
