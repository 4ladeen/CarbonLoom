/**
 * CarbonLoom — Industrial ASCII & Pixel Art Engine
 * Authentic SCADA / Terminal Aesthetic with Multi-Scene Carbon Emission Narratives
 *
 * Strict Architectural Layout Law:
 * - The left reading corridor (x = 6% to 54%) is 100% clear of any building silhouettes,
 *   walls, or stacks. Typography and paragraphs always sit on deep, clean, unobstructed obsidian black.
 * - All industrial structures (boilers, generators, stenters, turbines, racks, flare booms)
 *   are positioned on the Right Half (x = 55% to 98%) or far outer margins.
 * - Absolutely ZERO readable text, words, labels, or tags in the background.
 */

export type SkylineVariant =
  | "hero"
  | "threat"
  | "dyeing"
  | "stenter"
  | "power"
  | "boiler"
  | "steam-leak"
  | "spinning"
  | "cogen"
  | "cluster"
  | "terminal"
  | "scada"
  | "solar-clean";

export interface AsciiSkylineOptions {
  variant?: SkylineVariant;
  charSize?: number;
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
  kind?: "carbon" | "soot" | "steam" | "blast" | "shimmer" | "telemetry" | "clean";
}

interface Stack {
  relX: number;       // horizontal ratio (0.0 to 1.0)
  heightRows: number; // height in character rows
  widthCols: number;  // width in character columns
  active: boolean;
  beacon: boolean;
  kind?: "carbon" | "soot" | "steam" | "blast" | "shimmer" | "telemetry" | "clean";
}

export function initAsciiSkyline(container: HTMLElement, options: AsciiSkylineOptions = {}) {
  // Normalize alias variants
  let rawVariant = options.variant || "hero";
  if (rawVariant === "dyeing") rawVariant = "stenter";
  if (rawVariant === "power" || rawVariant === "spinning") rawVariant = "cogen";
  if (rawVariant === "boiler") rawVariant = "steam-leak";
  if (rawVariant === "terminal") rawVariant = "scada";
  const variant: SkylineVariant = rawVariant;

  const canvas = document.createElement("canvas");
  canvas.className = "carbon-ascii-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.position = "absolute";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
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
  let windX = 0.16;
  let targetWindX = 0.16;
  let isRepaired = false;

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Monospace character cell dimensions
  const charW = 9;
  const charH = 14;
  let cols = 0;
  let rows = 0;

  // Stacks strategically placed on the right side and far flanks
  const stacks: Stack[] = getStacksForVariant(variant);
  const particles: SmokeParticle[] = [];
  const maxParticles = reducedMotion ? 0 : (variant === "hero" ? 160 : 120);

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
    if (!s || !s.active) return;

    const stackCol = Math.round(s.relX * cols);
    const spawnX = (stackCol + s.widthCols / 2) * charW + (Math.random() - 0.5) * 4;
    const baseRow = rows - 2;
    const spawnY = (baseRow - s.heightRows) * charH;

    let vy = -(0.70 + Math.random() * 0.65);
    let vx = (Math.random() - 0.4) * 0.30;
    let maxLife = 140 + Math.random() * 90;

    if (s.kind === "soot") {
      vy = -(0.40 + Math.random() * 0.45);
      vx = (Math.random() - 0.2) * 0.70;
      maxLife = 160 + Math.random() * 80;
    } else if (s.kind === "blast") {
      vy = -(1.1 + Math.random() * 1.3);
      vx = (Math.random() - 0.2) * 1.2;
      maxLife = 80 + Math.random() * 50;
    } else if (s.kind === "steam") {
      vy = -(0.80 + Math.random() * 0.85);
      maxLife = 100 + Math.random() * 60;
    } else if (s.kind === "shimmer") {
      vy = -(0.50 + Math.random() * 0.35);
      vx = (Math.random() - 0.5) * 0.15;
      maxLife = 90 + Math.random() * 40;
    }

    particles.push({
      x: spawnX,
      y: spawnY,
      vx,
      vy,
      life: 0,
      maxLife,
      seed: Math.random() * 100,
      stackId: stackIdx,
      kind: s.kind || "carbon"
    });
  };

  const preSeedParticles = () => {
    if (reducedMotion) return;
    for (let step = 0; step < 110; step++) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.32) {
          spawnSmokeParticle(i);
        }
      }
      for (const p of particles) {
        p.life += 1;
        p.y += p.vy;
        p.x += p.vx + windX * 1.1;
      }
    }
  };

  // Purely non-alphanumeric glyph sets (no letters, no words)
  const glyphsCarbonCore = ["@", "&", "8", "%", "#", "▓"];
  const glyphsCarbonMid = ["#", "%", "*", "▒", "░"];
  const glyphsCarbonDrift = ["*", "~", "≈", "░", "°"];

  const glyphsSootCore = ["█", "▓", "▓", "▒", "#", "@"];
  const glyphsSootMid = ["▓", "▒", "░", "%", "#"];
  const glyphsSootDrift = ["▒", "░", "°", "·", "·"];

  const glyphsSteamCore = ["o", "°", "░", "▒", "○"];
  const glyphsSteamMid = ["o", "*", "~", "°", "░"];
  const glyphsSteamDrift = ["~", "≈", "·", "°", " "];

  const glyphsBlast = [">", "»", "@", "%", "8", "*", "#"];
  const glyphsShimmer = ["~", "≈", "∫", "≀", "·", "~"];
  const glyphsTelemetry = ["●", "■", "▲", "◆", "*", "+", "·", "░"];

  // Draw Procedural Plumes
  const drawAsciiPlumes = (ctx: CanvasRenderingContext2D, time: number) => {
    if (!reducedMotion && particles.length < maxParticles) {
      for (let i = 0; i < stacks.length; i++) {
        const rate = stacks[i].kind === "blast" && isRepaired ? 0.02 : 0.30;
        if (stacks[i].active && Math.random() < rate) {
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

      const wobble = Math.sin(time * 0.003 + p.seed) * 0.30;
      p.x += p.vx + wobble + windX * (0.8 + progress * 2.0);
      p.y += p.vy * (1 - progress * 0.30);

      const renderCol = Math.round(p.x / charW);
      const renderRow = Math.round(p.y / charH);
      const renderX = renderCol * charW;
      const renderY = renderRow * charH;

      // Absolute Protection:
      // Typography corridor is strictly 100% smoke-free across all devices!
      // Never render smoke particles in the left 72% of the viewport.
      if (renderX < w * 0.72) {
        continue;
      }
      // On mobile/compact viewports (cols < 90), suppress any smoke in the upper 80% to protect stacked text
      const isMobile = cols < 80;
      if (cols < 90 && renderY < h * 0.80) {
        continue;
      }

      let char = "·";
      let color = "rgba(120, 125, 140, 0.15)";

      if (p.kind === "soot") {
        if (progress < 0.30) {
          char = glyphsSootCore[Math.floor(p.seed * 7) % glyphsSootCore.length];
          color = "rgba(35, 38, 48, 0.75)";
        } else if (progress < 0.65) {
          char = glyphsSootMid[Math.floor(p.seed * 11) % glyphsSootMid.length];
          color = `rgba(50, 55, 68, ${0.45 * (1 - progress)})`;
        } else {
          char = glyphsSootDrift[Math.floor(p.seed * 5) % glyphsSootDrift.length];
          color = `rgba(70, 75, 90, ${0.18 * (1 - progress)})`;
        }
      } else if (p.kind === "steam") {
        if (progress < 0.35) {
          char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
          color = "rgba(215, 230, 245, 0.52)";
        } else if (progress < 0.70) {
          char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
          color = "rgba(180, 200, 220, 0.28)";
        } else {
          char = glyphsSteamDrift[Math.floor(p.seed * 5) % glyphsSteamDrift.length];
          color = "rgba(140, 160, 185, 0.12)";
        }
      } else if (p.kind === "blast") {
        if (isRepaired) {
          char = "·";
          color = `rgba(140, 170, 200, ${0.08 * (1 - progress)})`;
        } else {
          if (progress < 0.25) {
            char = glyphsBlast[Math.floor((p.seed + time * 0.05) * 7) % glyphsBlast.length];
            color = "rgba(245, 158, 11, 0.85)";
          } else if (progress < 0.60) {
            char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
            color = "rgba(230, 240, 255, 0.60)";
          } else {
            char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
            color = "rgba(160, 180, 205, 0.22)";
          }
        }
      } else if (p.kind === "shimmer") {
        char = glyphsShimmer[Math.floor((p.seed + time * 0.02) * 5) % glyphsShimmer.length];
        const alpha = 0.22 * Math.sin(progress * Math.PI);
        color = `rgba(180, 215, 255, ${alpha})`;
      } else if (p.kind === "telemetry") {
        char = glyphsTelemetry[Math.floor((p.seed + time * 0.08) * 11) % glyphsTelemetry.length];
        const alpha = 0.65 * (1 - progress);
        color = (p.seed > 50) ? `rgba(16, 185, 129, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
      } else if (p.kind === "clean") {
        char = progress < 0.4 ? "°" : "·";
        color = `rgba(200, 215, 230, ${0.16 * (1 - progress)})`;
      } else {
        if (progress < 0.18) {
          char = glyphsCarbonCore[Math.floor(p.seed * 7) % glyphsCarbonCore.length];
          color = "rgba(245, 158, 11, 0.70)";
        } else if (progress < 0.50) {
          char = glyphsCarbonMid[Math.floor(p.seed * 9) % glyphsCarbonMid.length];
          color = "rgba(195, 200, 215, 0.40)";
        } else if (progress < 0.82) {
          char = glyphsCarbonDrift[Math.floor(p.seed * 11) % glyphsCarbonDrift.length];
          color = "rgba(140, 145, 160, 0.20)";
        } else {
          char = "·";
          color = "rgba(90, 95, 110, 0.10)";
        }
      }

      ctx.fillStyle = color;
      ctx.fillText(char, renderX, renderY);
    }
  };

  // Helper to draw standard chimney
  const drawChimney = (s: Stack, baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const stackCol = Math.round(s.relX * cols);
    const heightRows = isMobile ? Math.min(s.heightRows, 6) : s.heightRows;
    const topRow = baseRow - heightRows;

    for (let r = topRow; r <= baseRow; r++) {
      const isRim = r === topRow;
      const isBand = (r - topRow) % 4 === 0;

      for (let wOff = 0; wOff < s.widthCols; wOff++) {
        const c = stackCol + wOff;
        if (isRim) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.40)";
          ctx.fillText("▄", c * charW, r * charH);
        } else if (isBand) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
          ctx.fillText("▓", c * charW, r * charH);
        } else if (wOff === 0 || wOff === s.widthCols - 1) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
          ctx.fillText("│", c * charW, r * charH);
        } else {
          ctx.fillStyle = "rgba(20, 24, 34, 0.90)";
          ctx.fillText("█", c * charW, r * charH);
        }
      }
    }

    if (s.beacon) {
      const beaconPulse = (Math.sin(time * 0.004) + 1) * 0.5;
      const beaconC = stackCol + Math.floor(s.widthCols / 2);
      const beaconY = (topRow - 1) * charH;
      ctx.fillStyle = `rgba(239, 68, 68, ${0.45 + 0.55 * beaconPulse})`;
      ctx.fillText("●", beaconC * charW, beaconY);
    }
  };

  // =========================================================================
  // SCENE 1: HERO — Baseload Thermal Energy & Boiler Plant (Far Right Flank)
  // Left reading corridor (0.00 - 0.74) is 100% clear sky!
  // =========================================================================
  const drawHeroScene = (baseRow: number, time: number) => {
    // Boiler Drums placed strictly on the Far Right Flank (cols * 0.76 to 0.98)
    const isMobile = cols < 80;
    const drumStart = Math.floor(cols * (isMobile ? 0.82 : 0.76));
    const drumEnd = Math.floor(cols * 0.98);
    for (let c = drumStart; c < drumEnd; c++) {
      const isHeader = (c - drumStart) % 8 === 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.fillText("═", c * charW, (baseRow - 5) * charH);
      if (isHeader) {
        ctx.fillText("╤", c * charW, (baseRow - 5) * charH);
        ctx.fillText("│", c * charW, (baseRow - 4) * charH);
        ctx.fillText("│", c * charW, (baseRow - 3) * charH);
      }
      for (let r = baseRow - 3; r <= baseRow; r++) {
        ctx.fillStyle = isHeader ? "rgba(255, 255, 255, 0.18)" : "rgba(18, 22, 30, 0.88)";
        ctx.fillText(isHeader ? "║" : "█", c * charW, r * charH);
      }
    }

    // Boiler portholes (pure geometry, zero text)
    const portholeStart = Math.floor(cols * (isMobile ? 0.84 : 0.80));
    for (let c = portholeStart; c < Math.min(cols - 2, portholeStart + 12); c += 4) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.35)";
      ctx.fillText("▣", c * charW, (baseRow - 2) * charH);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 2: THREAT — Emergency Diesel Generator Farm & Flare (Far Right Only)
  // Left reading corridor is 100% clear sky!
  // =========================================================================
  const drawThreatScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const gensets = isMobile
      ? [{ start: Math.floor(cols * 0.82), width: Math.floor(cols * 0.16) }]
      : [
          { start: Math.floor(cols * 0.76), width: 7 },
          { start: Math.floor(cols * 0.85), width: 7 },
          { start: Math.floor(cols * 0.94), width: 5 }
        ];

    gensets.forEach((g) => {
      const topR = baseRow - (isMobile ? 3 : 6);
      for (let c = g.start; c < g.start + g.width; c++) {
        for (let r = topR; r <= baseRow; r++) {
          if (r === topR) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillText("▄", c * charW, r * charH);
          } else if (c === g.start || c === g.start + g.width - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.fillText("║", c * charW, r * charH);
          } else if (r === baseRow - 4 && !isMobile) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.50)";
            ctx.fillText("≡", c * charW, r * charH);
          } else if (r === baseRow - 2 && (c - g.start) % 3 === 0) {
            ctx.fillStyle = "rgba(245, 158, 11, 0.65)";
            ctx.fillText("■", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(22, 26, 36, 0.90)";
            ctx.fillText("█", c * charW, r * charH);
          }
        }
      }
      if (!isMobile) {
        const exhC = g.start + 2;
        for (let r = topR - 4; r < topR; r++) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
          ctx.fillText("│", exhC * charW, r * charH);
        }
      }
    });

    // Angled Flare Stack on Far Right (relX: 0.96)
    const flareCol = Math.floor(cols * 0.96);
    const flareTop = baseRow - (isMobile ? 7 : 18);
    for (let r = flareTop; r <= baseRow; r++) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText(r % 2 === 0 ? "╱" : "╲", flareCol * charW, r * charH);
      ctx.fillText("│", (flareCol + 1) * charW, r * charH);
    }

    // Active Flare Flame Crown
    const flameFlicker = (Math.sin(time * 0.02) + Math.cos(time * 0.035)) * 0.5;
    const flameHeight = Math.floor(3 + flameFlicker * 2);
    for (let f = 1; f <= flameHeight; f++) {
      ctx.fillStyle = f === 1 ? "rgba(255, 240, 150, 0.90)" : (f === 2 ? "rgba(249, 115, 22, 0.80)" : "rgba(239, 68, 68, 0.70)");
      ctx.fillText(f === 1 ? "▲" : (f === 2 ? "*" : "░"), (flareCol + 1) * charW, (flareTop - f) * charH);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 3: STENTER / DYEING — Fabric Drying Ovens & Scrubber (Far Right Flank)
  // Left reading corridor is 100% clear sky!
  // =========================================================================
  const drawStenterScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const toothCount = isMobile ? 2 : 3;
    const toothWidth = Math.floor(cols * (isMobile ? 0.16 : 0.20));
    const step = Math.floor(toothWidth / toothCount);
    const startBase = Math.floor(cols * (isMobile ? 0.82 : 0.76));

    for (let t = 0; t < toothCount; t++) {
      const startC = startBase + t * step;
      const peakRow = baseRow - (isMobile ? 3 : 6);
      for (let r = 0; r < (isMobile ? 3 : 6); r++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillText("╱", (startC + r) * charW, (baseRow - r) * charH);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText("│", (startC + (isMobile ? 3 : 6)) * charW, peakRow * charH);

      const fanPhase = Math.floor((time * 0.015 + t) % 4);
      const fanGlyphs = ["✣", "✕", "+", "×"];
      ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
      ctx.fillText(fanGlyphs[fanPhase], (startC + (isMobile ? 2 : 3)) * charW, (peakRow - 1) * charH);
    }

    // Conical Scrubber Tower on Right (relX: 0.97)
    const scrubCol = Math.floor(cols * 0.97);
    const scrubH = isMobile ? 6 : 12;
    for (let dy = 0; dy < scrubH; dy++) {
      const r = baseRow - dy;
      const coneW = dy < 3 ? 2 : (dy > 9 ? 1 : 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
      ctx.fillText("[", (scrubCol - coneW) * charW, r * charH);
      ctx.fillText("]", (scrubCol + coneW) * charW, r * charH);
      for (let fillC = scrubCol - coneW + 1; fillC < scrubCol + coneW; fillC++) {
        ctx.fillStyle = "rgba(14, 24, 38, 0.90)";
        ctx.fillText(dy % 3 === 0 ? "▒" : "█", fillC * charW, r * charH);
      }
    }

    ctx.fillStyle = "rgba(56, 189, 248, 0.40)";
    ctx.fillText("■■", (scrubCol - 2) * charW, (baseRow - 2) * charH);

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 4: STEAM LEAK / FORENSICS — Line 04 Trap Blow-By (Far Right Flank)
  // Left reading corridor is 100% clear sky!
  // =========================================================================
  const drawSteamLeakScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const pipeRow = baseRow - (isMobile ? 3 : 5);
    const pipeY = pipeRow * charH;

    // Steam pipe runs strictly on Far Right Flank (cols * 0.76 to 0.96)
    const pipeStart = Math.floor(cols * (isMobile ? 0.82 : 0.76));
    const pipeEnd = Math.floor(cols * 0.96);
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    for (let c = pipeStart; c < pipeEnd; c++) {
      ctx.fillText("═", c * charW, pipeY);
      ctx.fillText("═", c * charW, pipeY + charH * 2);
    }

    const flangedCols = isMobile
      ? [Math.floor(cols * 0.84), Math.floor(cols * 0.92)]
      : [Math.floor(cols * 0.78), Math.floor(cols * 0.86), Math.floor(cols * 0.94)];
    flangedCols.forEach((fc) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillText("║", fc * charW, pipeY);
      ctx.fillText("║", fc * charW, pipeY + charH);
      ctx.fillText("║", fc * charW, pipeY + charH * 2);
    });

    // Analog Dial Gauge
    const gaugeCol = Math.floor(cols * (isMobile ? 0.84 : 0.79));
    ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)";
    ctx.fillText(isRepaired ? "(○─)" : "(●↗)", gaugeCol * charW, pipeY - charH);

    // Trap Body & Orifice
    const trapCol = Math.floor(cols * (isMobile ? 0.90 : 0.87));
    ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.80)" : "rgba(245, 158, 11, 0.85)";
    ctx.fillText(isRepaired ? "[■]" : "[░]", trapCol * charW, pipeY + charH);

    if (!isRepaired) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
      ctx.fillText(isMobile ? "»»»»" : "»»»»»»", (trapCol + 2) * charW, pipeY + charH);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 5: COGEN / POWER — Gas Turbine & Silencer (Far Right Flank)
  // Left reading corridor (0.00 - 0.76) is 100% clear sky!
  // This guarantees zero collision with architecture.html and secrecy section!
  // =========================================================================
  const drawCogenScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const turbHeight = isMobile ? 3 : 5;
    const turbStart = Math.floor(cols * (isMobile ? 0.82 : 0.76));
    const turbWidth = Math.floor(cols * (isMobile ? 0.16 : 0.20));

    for (let c = turbStart; c < turbStart + turbWidth; c++) {
      for (let r = baseRow - turbHeight; r <= baseRow; r++) {
        if (r === baseRow - turbHeight) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
          ctx.fillText("▀", c * charW, r * charH);
        } else if (c === turbStart || c === turbStart + turbWidth - 1) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.fillText("║", c * charW, r * charH);
        } else if (r === baseRow - 4 && !isMobile && (c - turbStart) % 3 === 0) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.50)";
          ctx.fillText("≡", c * charW, r * charH);
        } else if (r === baseRow - 2 && (c - turbStart) % 4 === 0) {
          ctx.fillStyle = "rgba(16, 185, 129, 0.75)";
          ctx.fillText("●", c * charW, r * charH);
        } else {
          ctx.fillStyle = "rgba(18, 22, 32, 0.92)";
          ctx.fillText("█", c * charW, r * charH);
        }
      }
    }

    // Ventilation louvers & LED array (pure geometry, zero text)
    if (!isMobile) {
      for (let c = turbStart + 2; c < turbStart + turbWidth - 2; c += 2) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
        ctx.fillText("≡", c * charW, (baseRow - 3) * charH);
      }
    }
    for (let c = turbStart + 2; c < turbStart + turbWidth - 2; c += 3) {
      ctx.fillStyle = "rgba(16, 185, 129, 0.60)";
      ctx.fillText("●", c * charW, (baseRow - 1) * charH);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 6: CLUSTER — Gazipur RMG Megaplex Panorama (Far Right Flank)
  // Left reading corridor is 100% clear sky!
  // =========================================================================
  const drawClusterScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const millStart = Math.floor(cols * (isMobile ? 0.80 : 0.76));
    // Distant background mill silhouette (Far Right only)
    ctx.fillStyle = "rgba(32, 38, 52, 0.35)";
    for (let c = millStart; c < cols; c++) {
      const hillH = (isMobile ? 2 : 4) + Math.round(Math.sin(c * 0.14) * (isMobile ? 1 : 3));
      for (let r = baseRow - hillH; r <= baseRow; r++) {
        ctx.fillText(r === baseRow - hillH ? "▄" : "░", c * charW, r * charH);
      }
    }

    // Midground sheds on right
    ctx.fillStyle = "rgba(22, 26, 36, 0.80)";
    for (let c = millStart + 2; c < cols; c++) {
      if (c % 6 === 0 && !isMobile) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillText("╱", c * charW, (baseRow - 5) * charH);
      }
      for (let r = baseRow - (isMobile ? 2 : 4); r <= baseRow; r++) {
        const isWin = r === baseRow - 2 && c % 4 === 0;
        ctx.fillStyle = isWin ? "rgba(245, 158, 11, 0.60)" : "rgba(16, 20, 28, 0.90)";
        ctx.fillText(isWin ? "■" : "█", c * charW, r * charH);
      }
    }

    // Foreground 33kV Pylons on right
    const pylonCols = isMobile ? [Math.floor(cols * 0.92)] : [Math.floor(cols * 0.84), Math.floor(cols * 0.94)];
    pylonCols.forEach((pc) => {
      const pTop = baseRow - (isMobile ? 5 : 10);
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText("/▲\\", (pc - 1) * charW, pTop * charH);
      for (let r = pTop + 1; r <= baseRow; r++) {
        ctx.fillText(r % 2 === 0 ? "/│\\" : "|║|", (pc - 1) * charW, r * charH);
      }
    });

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 7: SCADA — Sensor Telemetry Racks (Far Right Only)
  // Left reading corridor is 100% clear sky!
  // =========================================================================
  const drawScadaScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    const racks = isMobile
      ? [{ col: Math.floor(cols * 0.84) }]
      : [
          { col: Math.floor(cols * 0.78) },
          { col: Math.floor(cols * 0.88) }
        ];

    racks.forEach((rk) => {
      const topR = baseRow - (isMobile ? 4 : 9);
      const rackWidth = isMobile ? 8 : 12;
      for (let c = rk.col; c < rk.col + rackWidth; c++) {
        for (let r = topR; r <= baseRow; r++) {
          if (r === topR || r === baseRow) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillText("═", c * charW, r * charH);
          } else if (c === rk.col || c === rk.col + rackWidth - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.fillText("║", c * charW, r * charH);
          } else if (r === baseRow - (isMobile ? 2 : 7)) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.80)";
            ctx.fillText("●", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(14, 18, 26, 0.92)";
            ctx.fillText("░", c * charW, r * charH);
          }
        }
      }
      if (!isMobile) {
        for (let c = rk.col + 2; c < rk.col + 10; c += 2) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
          ctx.fillText("■", c * charW, (baseRow - 4) * charH);
        }
      }
    });

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 8: SOLAR CLEAN — Decarbonized Plant (Flanks Only)
  // Center corridor (0.22 to 0.78) is 100% clear for centered text!
  // =========================================================================
  const drawSolarCleanScene = (baseRow: number, time: number) => {
    const isMobile = cols < 80;
    // On mobile, only right flank
    if (!isMobile) {
      // Left Wing Solar Array (cols * 0.02 to 0.18)
      for (let c = Math.floor(cols * 0.02); c < Math.floor(cols * 0.18); c++) {
        if (c % 7 < 5) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.60)";
          ctx.fillText("[====]", c * charW, (baseRow - 7) * charH);
          ctx.fillStyle = "rgba(16, 185, 129, 0.50)";
          ctx.fillText("╱", c * charW, (baseRow - 6) * charH);
        }
        for (let r = baseRow - 5; r <= baseRow; r++) {
          ctx.fillStyle = "rgba(18, 24, 34, 0.90)";
          ctx.fillText("█", c * charW, r * charH);
        }
      }
    }

    // Right Wing Solar Array (cols * 0.80 to 0.98)
    const rightStart = Math.floor(cols * (isMobile ? 0.70 : 0.80));
    for (let c = rightStart; c < Math.floor(cols * 0.98); c++) {
      if (c % 7 < 5 && !isMobile) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.60)";
        ctx.fillText("[====]", c * charW, (baseRow - 7) * charH);
        ctx.fillStyle = "rgba(16, 185, 129, 0.50)";
        ctx.fillText("╱", c * charW, (baseRow - 6) * charH);
      }
      for (let r = baseRow - (isMobile ? 3 : 5); r <= baseRow; r++) {
        ctx.fillStyle = "rgba(18, 24, 34, 0.90)";
        ctx.fillText("█", c * charW, r * charH);
      }
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // Master Scene Dispatcher
  const drawScene = (time: number) => {
    const baseRow = rows - 2;

    switch (variant) {
      case "hero":
        drawHeroScene(baseRow, time);
        break;
      case "threat":
        drawThreatScene(baseRow, time);
        break;
      case "stenter":
      case "dyeing":
        drawStenterScene(baseRow, time);
        break;
      case "steam-leak":
      case "boiler":
        drawSteamLeakScene(baseRow, time);
        break;
      case "cogen":
      case "power":
      case "spinning":
        drawCogenScene(baseRow, time);
        break;
      case "cluster":
        drawClusterScene(baseRow, time);
        break;
      case "scada":
      case "terminal":
        drawScadaScene(baseRow, time);
        break;
      case "solar-clean":
        drawSolarCleanScene(baseRow, time);
        break;
      default:
        drawHeroScene(baseRow, time);
    }
  };

  const render = (time: number) => {
    rafId = 0;
    if (!isVisible) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Deep obsidian ambient background
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "rgba(7, 7, 9, 0)");
    bg.addColorStop(0.55, "rgba(9, 11, 16, 0.35)");
    bg.addColorStop(0.85, "rgba(12, 15, 22, 0.75)");
    bg.addColorStop(1, "rgba(7, 7, 9, 0.98)");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Monospace font styling
    ctx.font = `11px "Geist Mono", ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";

    // 1. Draw Rising Dynamic Plumes
    drawAsciiPlumes(ctx, time);

    // 2. Draw Distinct Architectural Industrial Scene (Right Half only)
    drawScene(time);

    rafId = requestAnimationFrame(render);
  };

  const onPointerMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Wind always blows eastward (away from typography corridor)
    const normalizedX = (mouseX / window.innerWidth) - 0.5;
    targetWindX = Math.max(0.14, 0.22 + normalizedX * 0.22);
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
    },
    setRepaired: (repaired: boolean) => {
      isRepaired = repaired;
      if (stacks[0]) {
        stacks[0].active = !repaired;
      }
    }
  };
}

// Stacks placed strictly on the far right flank (relX >= 0.78)
function getStacksForVariant(variant: SkylineVariant): Stack[] {
  switch (variant) {
    case "hero":
      return [
        { relX: 0.82, heightRows: 17, widthCols: 3, active: true, beacon: true, kind: "carbon" },
        { relX: 0.88, heightRows: 19, widthCols: 3, active: true, beacon: false, kind: "carbon" },
        { relX: 0.94, heightRows: 21, widthCols: 4, active: true, beacon: true, kind: "carbon" },
        { relX: 0.98, heightRows: 15, widthCols: 2, active: true, beacon: false, kind: "carbon" }
      ];

    case "threat":
      return [
        { relX: 0.78, heightRows: 12, widthCols: 2, active: true, beacon: false, kind: "soot" },
        { relX: 0.88, heightRows: 14, widthCols: 2, active: true, beacon: false, kind: "soot" },
        { relX: 0.96, heightRows: 18, widthCols: 3, active: true, beacon: true, kind: "soot" }
      ];

    case "stenter":
    case "dyeing":
      return [
        { relX: 0.78, heightRows: 13, widthCols: 2, active: true, beacon: false, kind: "steam" },
        { relX: 0.88, heightRows: 14, widthCols: 3, active: true, beacon: false, kind: "steam" },
        { relX: 0.96, heightRows: 18, widthCols: 3, active: true, beacon: true, kind: "steam" }
      ];

    case "steam-leak":
    case "boiler":
      return [
        { relX: 0.84, heightRows: 12, widthCols: 2, active: true, beacon: false, kind: "blast" },
        { relX: 0.96, heightRows: 16, widthCols: 3, active: true, beacon: true, kind: "steam" }
      ];

    case "cogen":
    case "power":
    case "spinning":
      return [
        { relX: 0.94, heightRows: 14, widthCols: 4, active: true, beacon: true, kind: "shimmer" }
      ];

    case "cluster":
      return [
        { relX: 0.78, heightRows: 15, widthCols: 3, active: true, beacon: false, kind: "steam" },
        { relX: 0.88, heightRows: 17, widthCols: 3, active: true, beacon: true, kind: "carbon" },
        { relX: 0.96, heightRows: 20, widthCols: 4, active: true, beacon: true, kind: "carbon" }
      ];

    case "scada":
    case "terminal":
      return [
        { relX: 0.94, heightRows: 15, widthCols: 2, active: true, beacon: false, kind: "telemetry" },
        { relX: 0.98, heightRows: 16, widthCols: 2, active: true, beacon: false, kind: "telemetry" }
      ];

    case "solar-clean":
      return [
        { relX: 0.95, heightRows: 12, widthCols: 2, active: true, beacon: false, kind: "clean" }
      ];

    default:
      return [
        { relX: 0.88, heightRows: 16, widthCols: 3, active: true, beacon: true, kind: "carbon" },
        { relX: 0.96, heightRows: 18, widthCols: 4, active: true, beacon: true, kind: "carbon" }
      ];
  }
}

// Auto-initialize on sections and backgrounds
if (typeof window !== "undefined") {
  (window as any).initAsciiSkyline = initAsciiSkyline;
  (window as any).initCarbonSkyline = initAsciiSkyline;

  const autoInitAscii = () => {
    // 1. Hero Section: Baseload Thermal Boiler House
    const hero = document.querySelector(".hero-section") as HTMLElement;
    if (hero && !(hero as any)._asciiInit) {
      (hero as any)._asciiInit = true;
      (window as any).carbonSkylineInstance = initAsciiSkyline(hero, { variant: "hero" });
    }

    // 2. Macro Threat: Emergency Diesel Generator Farm & Flaring
    const macro = document.getElementById("macro-threat");
    if (macro && !(macro as any)._asciiInit) {
      (macro as any)._asciiInit = true;
      initAsciiSkyline(macro, { variant: "threat" });
    }

    // 3. Pipeline: Continuous Stenter Drying Ovens & Wet Gas Scrubbers
    const pipeline = document.getElementById("pipeline");
    if (pipeline && !(pipeline as any)._asciiInit) {
      (pipeline as any)._asciiInit = true;
      initAsciiSkyline(pipeline, { variant: "stenter" });
    }

    // 4. Forensics: Steam Header Line 04 Trap Blow-By
    const forensics = document.getElementById("forensics");
    if (forensics && !(forensics as any)._asciiInit) {
      (forensics as any)._asciiInit = true;
      (window as any).forensicsSkylineInstance = initAsciiSkyline(forensics, { variant: "steam-leak" });
    }

    // 5. Secrecy: CHP Gas Turbine & Clean Laminar Mirage
    const secrecy = document.getElementById("secrecy");
    if (secrecy && !(secrecy as any)._asciiInit) {
      (secrecy as any)._asciiInit = true;
      initAsciiSkyline(secrecy, { variant: "cogen" });
    }

    // 6. Pilots: Gazipur Industrial Megaplex Panorama
    const pilots = document.getElementById("pilots");
    if (pilots && !(pilots as any)._asciiInit) {
      (pilots as any)._asciiInit = true;
      initAsciiSkyline(pilots, { variant: "cluster" });
    }

    // 7. Modules: Industrial SCADA Telemetry & Sensor Bus Matrix
    const modules = document.getElementById("modules");
    if (modules && !(modules as any)._asciiInit) {
      (modules as any)._asciiInit = true;
      initAsciiSkyline(modules, { variant: "scada" });
    }

    // Custom backgrounds on subpages
    const customBgs = document.querySelectorAll<HTMLElement>(".carbon-skyline-bg");
    customBgs.forEach((el) => {
      if (!(el as any)._asciiInit) {
        (el as any)._asciiInit = true;
        const v = (el.getAttribute("data-skyline") || "cluster") as SkylineVariant;
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
