/**
 * CarbonLoom — Industrial ASCII & Pixel Art Engine
 * Authentic SCADA / Terminal Aesthetic with Multi-Scene Carbon Emission Narratives
 *
 * Distinct Industrial Scenes:
 * 1. "hero": Baseload Thermal Energy & High-Pressure Steam Boiler House (Twin tall stacks on flanks, boiler drums)
 * 2. "threat": Emergency Diesel Generator Farm & Gas Flare Boom (Rolling soot, flaring combustion flame)
 * 3. "stenter" / "dyeing": Fabric Finishing Stenter Ovens & Chemical Wet Scrubbers (Sawtooth sheds, impeller fans, steam vapor rings)
 * 4. "steam-leak" / "boiler": Forensic Line 04 Steam Trap Blow-By (High-velocity steam blast; stops live when repaired!)
 * 5. "cogen" / "power": Combined Heat & Power (CHP) Gas Turbine & Silencer Exhaust (Laminar thermal mirage heat shimmer)
 * 6. "cluster": Gazipur Industrial Apparel Megaplex Panorama (3-tier depth, 5 staggered regional stacks, 33kV pylons)
 * 7. "scada" / "terminal": Sensor Telemetry Matrix & Edge Gateway Bus (Digital pulse bit streams & CT sensors)
 * 8. "solar-clean": Decarbonized Modern Green Plant (Rooftop solar PV arrays, electric heat pumps, net-zero visual)
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
  name: string;
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
  let windX = 0.18;
  let targetWindX = 0.18;
  let isRepaired = false;

  const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Monospace character cell dimensions
  const charW = 9;
  const charH = 14;
  let cols = 0;
  let rows = 0;

  // Stacks strategically placed in open visual corridors
  const stacks: Stack[] = getStacksForVariant(variant);
  const particles: SmokeParticle[] = [];
  const maxParticles = reducedMotion ? 0 : (variant === "hero" ? 180 : variant === "threat" ? 140 : 120);

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

    let vy = -(0.70 + Math.random() * 0.70);
    let vx = (Math.random() - 0.5) * 0.30;
    let maxLife = 140 + Math.random() * 100;

    if (s.kind === "soot") {
      // Heavy diesel soot hangs lower and moves more horizontally
      vy = -(0.35 + Math.random() * 0.45);
      vx = (Math.random() - 0.2) * 0.8;
      maxLife = 180 + Math.random() * 100;
    } else if (s.kind === "blast") {
      // High-velocity steam trap leak blowout
      vy = -(1.2 + Math.random() * 1.4);
      vx = (Math.random() - 0.3) * 1.5;
      maxLife = 90 + Math.random() * 60;
    } else if (s.kind === "steam") {
      // Fast vapor plume
      vy = -(0.85 + Math.random() * 0.90);
      maxLife = 110 + Math.random() * 70;
    } else if (s.kind === "shimmer") {
      // Laminar heat mirage
      vy = -(0.50 + Math.random() * 0.40);
      vx = (Math.random() - 0.5) * 0.20;
      maxLife = 100 + Math.random() * 50;
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
    for (let step = 0; step < 120; step++) {
      for (let i = 0; i < stacks.length; i++) {
        if (stacks[i].active && Math.random() < 0.34) {
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

  // Distinct glyph sets
  const glyphsCarbonCore = ["@", "&", "8", "%", "#", "▓"];
  const glyphsCarbonMid = ["#", "%", "S", "O", "*", "▒"];
  const glyphsCarbonDrift = ["o", "*", "~", "≈", "░", "°"];

  const glyphsSootCore = ["█", "▓", "▓", "▒", "#", "@"];
  const glyphsSootMid = ["▓", "▒", "░", "%", "#", "S"];
  const glyphsSootDrift = ["▒", "░", "°", "·", "·"];

  const glyphsSteamCore = ["O", "0", "o", "©", "░", "▒"];
  const glyphsSteamMid = ["o", "*", "~", "°", "░"];
  const glyphsSteamDrift = ["~", "≈", "·", "°", " "];

  const glyphsBlast = [">", "»", "@", "%", "8", "*", "!", "#"];
  const glyphsShimmer = ["~", "≈", "∫", "≀", "·", "~"];
  const glyphsTelemetry = ["0", "1", "f", "a", "7", "x", "e", "●", "*"];

  // Draw Procedural Carbon Plumes
  const drawAsciiPlumes = (ctx: CanvasRenderingContext2D, time: number) => {
    if (!reducedMotion && particles.length < maxParticles) {
      for (let i = 0; i < stacks.length; i++) {
        const rate = stacks[i].kind === "blast" && isRepaired ? 0.02 : 0.32;
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

      // Physics
      const wobble = Math.sin(time * 0.003 + p.seed) * 0.35;
      p.x += p.vx + wobble + windX * (0.8 + progress * 2.0);
      p.y += p.vy * (1 - progress * 0.30);

      // Snap to character matrix
      const renderCol = Math.round(p.x / charW);
      const renderRow = Math.round(p.y / charH);
      const renderX = renderCol * charW;
      const renderY = renderRow * charH;

      // In Hero: soft corridor mask - if smoke enters left headline/subhead zone, dim it heavily
      let textMaskDim = 1.0;
      if (variant === "hero" && renderX > w * 0.08 && renderX < w * 0.50 && renderY < h * 0.70) {
        textMaskDim = 0.25; // Heavily dim any stray smoke in the reading box
      }

      let char = "·";
      let color = "rgba(120, 125, 140, 0.15)";

      if (p.kind === "soot") {
        // Heavy diesel soot
        if (progress < 0.30) {
          char = glyphsSootCore[Math.floor(p.seed * 7) % glyphsSootCore.length];
          color = `rgba(35, 38, 48, ${0.75 * textMaskDim})`;
        } else if (progress < 0.65) {
          char = glyphsSootMid[Math.floor(p.seed * 11) % glyphsSootMid.length];
          color = `rgba(50, 55, 68, ${0.45 * (1 - progress) * textMaskDim})`;
        } else {
          char = glyphsSootDrift[Math.floor(p.seed * 5) % glyphsSootDrift.length];
          color = `rgba(70, 75, 90, ${0.20 * (1 - progress) * textMaskDim})`;
        }
      } else if (p.kind === "steam") {
        // Stenter & Scrubber wet steam
        if (progress < 0.35) {
          char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
          color = `rgba(215, 230, 245, ${0.55 * textMaskDim})`;
        } else if (progress < 0.70) {
          char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
          color = `rgba(180, 200, 220, ${0.30 * textMaskDim})`;
        } else {
          char = glyphsSteamDrift[Math.floor(p.seed * 5) % glyphsSteamDrift.length];
          color = `rgba(140, 160, 185, ${0.12 * textMaskDim})`;
        }
      } else if (p.kind === "blast") {
        // High-pressure steam leak
        if (isRepaired) {
          char = "·";
          color = `rgba(140, 170, 200, ${0.10 * (1 - progress)})`;
        } else {
          if (progress < 0.25) {
            char = glyphsBlast[Math.floor((p.seed + time * 0.05) * 7) % glyphsBlast.length];
            color = `rgba(245, 158, 11, ${0.85 * textMaskDim})`; // Hot thermal core
          } else if (progress < 0.60) {
            char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
            color = `rgba(230, 240, 255, ${0.65 * textMaskDim})`; // White pressurized steam
          } else {
            char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
            color = `rgba(160, 180, 205, ${0.25 * textMaskDim})`;
          }
        }
      } else if (p.kind === "shimmer") {
        // Laminar heat mirage
        char = glyphsShimmer[Math.floor((p.seed + time * 0.02) * 5) % glyphsShimmer.length];
        const alpha = 0.22 * Math.sin(progress * Math.PI) * textMaskDim;
        color = `rgba(180, 215, 255, ${alpha})`;
      } else if (p.kind === "telemetry") {
        // Digital pulse bit stream
        char = glyphsTelemetry[Math.floor((p.seed + time * 0.08) * 11) % glyphsTelemetry.length];
        const alpha = 0.65 * (1 - progress) * textMaskDim;
        color = (p.seed > 50) ? `rgba(16, 185, 129, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
      } else if (p.kind === "clean") {
        // Net zero condensed puff
        char = progress < 0.4 ? "°" : "·";
        color = `rgba(200, 215, 230, ${0.18 * (1 - progress) * textMaskDim})`;
      } else {
        // Standard baseload thermal carbon plume
        if (progress < 0.18) {
          char = glyphsCarbonCore[Math.floor(p.seed * 7) % glyphsCarbonCore.length];
          color = `rgba(245, 158, 11, ${0.72 * textMaskDim})`;
        } else if (progress < 0.50) {
          char = glyphsCarbonMid[Math.floor(p.seed * 9) % glyphsCarbonMid.length];
          color = `rgba(195, 200, 215, ${0.42 * textMaskDim})`;
        } else if (progress < 0.82) {
          char = glyphsCarbonDrift[Math.floor(p.seed * 11) % glyphsCarbonDrift.length];
          color = `rgba(140, 145, 160, ${0.22 * textMaskDim})`;
        } else {
          char = "·";
          color = `rgba(90, 95, 110, ${0.12 * textMaskDim})`;
        }
      }

      ctx.fillStyle = color;
      ctx.fillText(char, renderX, renderY);
    }
  };

  // Helper to draw standard chimney
  const drawChimney = (s: Stack, baseRow: number, time: number) => {
    const stackCol = Math.round(s.relX * cols);
    const topRow = baseRow - s.heightRows;

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
  // SCENE 1: HERO — Baseload Thermal Energy & High-Pressure Steam Boiler House
  // Stacks strictly on flanks (0.02, 0.52, 0.94); clear reading corridor in center-left!
  // =========================================================================
  const drawHeroScene = (baseRow: number, time: number) => {
    const baseY = baseRow * charH;

    // Distant background boiler facility (Faint ░░)
    ctx.fillStyle = "rgba(35, 42, 58, 0.35)";
    for (let c = 0; c < cols; c++) {
      // Keep left text zone clear of tall shapes
      if (c > cols * 0.06 && c < cols * 0.48) continue;
      for (let r = baseRow - 6; r <= baseRow; r++) {
        ctx.fillText(r === baseRow - 6 ? "▄" : "░", c * charW, r * charH);
      }
    }

    // Heavy Horizontal Boiler Drum Units (Center and Right Flank)
    const drumStart = Math.floor(cols * 0.56);
    const drumEnd = Math.floor(cols * 0.88);
    for (let c = drumStart; c < drumEnd; c++) {
      const isHeader = (c - drumStart) % 8 === 0;
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText("═", c * charW, (baseRow - 5) * charH);
      if (isHeader) {
        ctx.fillText("╤", c * charW, (baseRow - 5) * charH);
        ctx.fillText("│", c * charW, (baseRow - 4) * charH);
        ctx.fillText("│", c * charW, (baseRow - 3) * charH);
      }
      for (let r = baseRow - 3; r <= baseRow; r++) {
        ctx.fillStyle = isHeader ? "rgba(255, 255, 255, 0.25)" : "rgba(18, 22, 30, 0.88)";
        ctx.fillText(isHeader ? "║" : "█", c * charW, r * charH);
      }
    }

    // Steam Boiler Drum Labels in ASCII
    const labelX = Math.floor(cols * 0.62) * charW;
    ctx.fillStyle = "rgba(245, 158, 11, 0.55)";
    ctx.fillText("[BOILER 01: 8.2 BAR]", labelX, (baseRow - 2) * charH);

    // Stacks (Flanks only: 0.02, 0.52, 0.94)
    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 2: THREAT — Emergency Diesel Generator Farm & Gas Flare Boom
  // Caterpillar skid gensets with louvers + towering flaring stack on right
  // =========================================================================
  const drawThreatScene = (baseRow: number, time: number) => {
    // Ground level
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let c = 0; c < cols; c++) ctx.fillText("═", c * charW, (baseRow + 1) * charH);

    // 3 Containerized Diesel Gensets [GEN-01], [GEN-02], [GEN-03]
    const gensets = [
      { start: Math.floor(cols * 0.03), width: 14, name: "GEN-01 450kVA" },
      { start: Math.floor(cols * 0.15), width: 14, name: "GEN-02 600kVA" },
      { start: Math.floor(cols * 0.27), width: 14, name: "GEN-03 800kVA" }
    ];

    gensets.forEach((g) => {
      const topR = baseRow - 6;
      for (let c = g.start; c < g.start + g.width; c++) {
        for (let r = topR; r <= baseRow; r++) {
          if (r === topR) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
            ctx.fillText("▄", c * charW, r * charH);
          } else if (c === g.start || c === g.start + g.width - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillText("║", c * charW, r * charH);
          } else if (r === baseRow - 4) {
            // Louver grilles
            ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
            ctx.fillText("≡", c * charW, r * charH);
          } else if (r === baseRow - 2 && (c - g.start) % 3 === 0) {
            ctx.fillStyle = "rgba(245, 158, 11, 0.70)";
            ctx.fillText("■", c * charW, r * charH); // Status LEDs
          } else {
            ctx.fillStyle = "rgba(22, 26, 36, 0.92)";
            ctx.fillText("█", c * charW, r * charH);
          }
        }
      }
      // Exhaust pipes rising from gensets
      const exhC = g.start + 2;
      for (let r = topR - 4; r < topR; r++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
        ctx.fillText("│", exhC * charW, r * charH);
      }
    });

    // Angled Industrial Flare Stack on Far Right (relX: 0.88)
    const flareCol = Math.floor(cols * 0.88);
    const flareTop = baseRow - 18;
    for (let r = flareTop; r <= baseRow; r++) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText(r % 2 === 0 ? "╱" : "╲", flareCol * charW, r * charH);
      ctx.fillText("│", (flareCol + 1) * charW, r * charH);
    }

    // Active Flare Combustion Flame Crown
    const flameFlicker = (Math.sin(time * 0.02) + Math.cos(time * 0.035)) * 0.5;
    const flameHeight = Math.floor(3 + flameFlicker * 2);
    for (let f = 1; f <= flameHeight; f++) {
      ctx.fillStyle = f === 1 ? "rgba(255, 240, 150, 0.95)" : (f === 2 ? "rgba(249, 115, 22, 0.85)" : "rgba(239, 68, 68, 0.75)");
      ctx.fillText(f === 1 ? "▲" : (f === 2 ? "*" : "░"), (flareCol + 1) * charW, (flareTop - f) * charH);
      if (f > 1) {
        ctx.fillText("~", flareCol * charW, (flareTop - f) * charH);
      }
    }

    // Stacks
    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 3: STENTER / DYEING — Fabric Stenter Drying Ovens & Wet Gas Scrubbers
  // Continuous sawtooth drying oven shed with rotating impellers & scrubber tower
  // =========================================================================
  const drawStenterScene = (baseRow: number, time: number) => {
    // Sawtooth fabric drying shed
    const toothCount = 5;
    const toothWidth = Math.floor(cols * 0.40);
    const step = Math.floor(toothWidth / toothCount);

    for (let t = 0; t < toothCount; t++) {
      const startC = Math.floor(cols * 0.04) + t * step;
      const peakRow = baseRow - 7;
      for (let r = 0; r < 7; r++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText("╱", (startC + r) * charW, (baseRow - r) * charH);
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillText("│", (startC + 7) * charW, peakRow * charH);

      // Rotating roof impeller exhaust fan at each sawtooth apex
      const fanPhase = Math.floor((time * 0.015 + t) % 4);
      const fanGlyphs = ["✣", "✕", "+", "×"];
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.fillText(fanGlyphs[fanPhase], (startC + 4) * charW, (peakRow - 1) * charH);
    }

    // Fabric Entry Slot Guide
    ctx.fillStyle = "rgba(245, 158, 11, 0.65)";
    ctx.fillText("═══[FABRIC FEED: 80m/min]═══", Math.floor(cols * 0.08) * charW, (baseRow - 1) * charH);

    // Conical Wet Venturi Scrubber Tower on Right (relX: 0.92)
    const scrubCol = Math.floor(cols * 0.92);
    const scrubH = 16;
    for (let dy = 0; dy < scrubH; dy++) {
      const r = baseRow - dy;
      const coneW = dy < 4 ? 3 : (dy > 12 ? 2 : 4);
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.fillText("[", (scrubCol - coneW) * charW, r * charH);
      ctx.fillText("]", (scrubCol + coneW) * charW, r * charH);
      for (let fillC = scrubCol - coneW + 1; fillC < scrubCol + coneW; fillC++) {
        ctx.fillStyle = "rgba(14, 24, 38, 0.92)";
        ctx.fillText(dy % 3 === 0 ? "▒" : "█", fillC * charW, r * charH);
      }
    }

    // Scrubber recirculating wash pump
    ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
    ctx.fillText("(PUMP-04)", (scrubCol - 4) * charW, (baseRow - 2) * charH);

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 4: STEAM LEAK / FORENSICS — Line 04 High-Pressure Steam Trap Blow-By
  // Forensic technical piping diagram with live interactive repair toggle
  // =========================================================================
  const drawSteamLeakScene = (baseRow: number, time: number) => {
    const pipeRow = baseRow - 8;
    const pipeY = pipeRow * charH;

    // Main 8-Bar Superheated Steam Header running across
    ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
    for (let c = Math.floor(cols * 0.10); c < Math.floor(cols * 0.90); c++) {
      ctx.fillText("═", c * charW, pipeY);
      ctx.fillText("═", c * charW, pipeY + charH * 2);
    }

    // Pipe Insulation Cladding & Flanged Spool Pieces
    const flangedCols = [
      Math.floor(cols * 0.22),
      Math.floor(cols * 0.40),
      Math.floor(cols * 0.58),
      Math.floor(cols * 0.76)
    ];
    flangedCols.forEach((fc) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fillText("║", fc * charW, pipeY);
      ctx.fillText("║", fc * charW, pipeY + charH);
      ctx.fillText("║", fc * charW, pipeY + charH * 2);
    });

    // Technical Schematic Labels
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillText("STEAM HEADER 04 [DIN EN 12952]", Math.floor(cols * 0.12) * charW, pipeY - charH);

    // Live Pressure Gauge
    const gaugeCol = Math.floor(cols * 0.32);
    ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.90)" : "rgba(239, 68, 68, 0.90)";
    ctx.fillText(isRepaired ? "( P: 4.1 bar - NOMINAL )" : "( P: 8.2 bar - BLOW-BY ALERT )", gaugeCol * charW, pipeY - charH);

    // Steam Trap #01 Assembly Orifice (relX: 0.58)
    const trapCol = Math.floor(cols * 0.58);
    const trapRow = pipeRow + 3;

    // Trap bypass loop
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillText("│", trapCol * charW, pipeY + charH * 3);
    ctx.fillText("│", trapCol * charW, pipeY + charH * 4);
    ctx.fillText("⧖", trapCol * charW, pipeY + charH * 5); // Isolation valve

    // Trap housing
    ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.85)" : "rgba(245, 158, 11, 0.90)";
    ctx.fillText(isRepaired ? "[TRAP-01: SEALED / REPAIRED]" : "[TRAP-01: 18.4 tCO2e/mo LEAK]", (trapCol - 10) * charW, (trapRow + 4) * charH);

    // If leaking: violent horizontal blowout arrows
    if (!isRepaired) {
      const blastFlicker = Math.floor((time * 0.05) % 3);
      ctx.fillStyle = "rgba(245, 158, 11, 0.95)";
      ctx.fillText("»»»»» BLOWOUT »»»»»", (trapCol + 2) * charW, pipeY + charH * 3);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 5: COGEN / POWER — Combined Heat & Power (CHP) Gas Turbine & Silencer
  // Acoustic turbine enclosure, HRSG casing & optical thermal mirage heat shimmer
  // =========================================================================
  const drawCogenScene = (baseRow: number, time: number) => {
    // Ground
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let c = 0; c < cols; c++) ctx.fillText("═", c * charW, (baseRow + 1) * charH);

    // Gas Turbine Enclosure (Left / Center)
    const turbStart = Math.floor(cols * 0.12);
    const turbWidth = Math.floor(cols * 0.35);
    const turbHeight = 9;

    for (let c = turbStart; c < turbStart + turbWidth; c++) {
      for (let r = baseRow - turbHeight; r <= baseRow; r++) {
        if (r === baseRow - turbHeight) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
          ctx.fillText("▀", c * charW, r * charH);
        } else if (c === turbStart || c === turbStart + turbWidth - 1) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
          ctx.fillText("║", c * charW, r * charH);
        } else if (r === baseRow - 6 && (c - turbStart) % 4 === 0) {
          // Acoustic air intake louvers
          ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
          ctx.fillText("≡", c * charW, r * charH);
        } else if (r === baseRow - 3 && (c - turbStart) % 5 === 0) {
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.fillText("●", c * charW, r * charH); // ZK meter node LEDs
        } else {
          ctx.fillStyle = "rgba(18, 22, 32, 0.94)";
          ctx.fillText("█", c * charW, r * charH);
        }
      }
    }

    ctx.fillStyle = "rgba(56, 189, 248, 0.70)";
    ctx.fillText("[LM2500 AERODERIVATIVE COGEN]", (turbStart + 4) * charW, (baseRow - 4) * charH);
    ctx.fillStyle = "rgba(16, 185, 129, 0.80)";
    ctx.fillText("[ZK-TELEMETRY HARNESS: ONLINE]", (turbStart + 4) * charW, (baseRow - 2) * charH);

    // Heat Recovery Steam Generator (HRSG) Transition Duct
    const hrsgStart = turbStart + turbWidth;
    const hrsgEnd = Math.floor(cols * 0.70);
    for (let c = hrsgStart; c < hrsgEnd; c++) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.fillText("═", c * charW, (baseRow - 5) * charH);
      ctx.fillText("═", c * charW, (baseRow - 1) * charH);
      if (c % 4 === 0) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.45)";
        ctx.fillText("▒", c * charW, (baseRow - 3) * charH);
      }
    }

    // Wide Exhaust Silencer Stack on Right (relX: 0.88)
    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 6: CLUSTER — Gazipur Industrial RMG Megaplex Panorama
  // 3-tier deep perspective: distant mills, 5 staggered stacks, 33kV pylons
  // =========================================================================
  const drawClusterScene = (baseRow: number, time: number) => {
    // 1. Distant Mills Silhouette (Layer 1: ░░)
    ctx.fillStyle = "rgba(32, 38, 52, 0.40)";
    for (let c = 0; c < cols; c++) {
      const hillH = 4 + Math.round(Math.sin(c * 0.12) * 3);
      for (let r = baseRow - hillH; r <= baseRow; r++) {
        ctx.fillText(r === baseRow - hillH ? "▄" : "░", c * charW, r * charH);
      }
    }

    // 2. Midground Spinning Halls & Weaving Sheds
    ctx.fillStyle = "rgba(22, 26, 36, 0.85)";
    for (let c = Math.floor(cols * 0.10); c < Math.floor(cols * 0.90); c++) {
      if (c % 6 === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
        ctx.fillText("╱", c * charW, (baseRow - 5) * charH);
      }
      for (let r = baseRow - 4; r <= baseRow; r++) {
        const isWin = r === baseRow - 2 && c % 4 === 0;
        ctx.fillStyle = isWin ? "rgba(245, 158, 11, 0.65)" : "rgba(16, 20, 28, 0.92)";
        ctx.fillText(isWin ? "■" : "█", c * charW, r * charH);
      }
    }

    // 3. Foreground 33kV Electrical Grid Transmission Pylons
    const pylonCols = [Math.floor(cols * 0.36), Math.floor(cols * 0.65)];
    pylonCols.forEach((pc) => {
      const pTop = baseRow - 12;
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      ctx.fillText("/▲\\", (pc - 1) * charW, pTop * charH);
      for (let r = pTop + 1; r <= baseRow; r++) {
        ctx.fillText(r % 2 === 0 ? "/│\\" : "|║|", (pc - 1) * charW, r * charH);
      }
      // Power line conductors
      for (let c = 0; c < cols; c++) {
        if (c % 3 === 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
          ctx.fillText("·", c * charW, (pTop + 2) * charH);
        }
      }
    });

    // 5 Staggered Chimneys across horizon
    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 7: SCADA — Sensor Telemetry Matrix & Edge Gateway Bus
  // Edge gateway racks, CT sensor clamps & digital pulse bit streams
  // =========================================================================
  const drawScadaScene = (baseRow: number, time: number) => {
    // Rack Cabinets
    const racks = [
      { col: Math.floor(cols * 0.08), name: "MODBUS-RTU GW" },
      { col: Math.floor(cols * 0.48), name: "ESP32 CT CLAMP" },
      { col: Math.floor(cols * 0.82), name: "GROTH16 PROVER" }
    ];

    racks.forEach((rk) => {
      const topR = baseRow - 9;
      for (let c = rk.col; c < rk.col + 14; c++) {
        for (let r = topR; r <= baseRow; r++) {
          if (r === topR || r === baseRow) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
            ctx.fillText("═", c * charW, r * charH);
          } else if (c === rk.col || c === rk.col + 13) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillText("║", c * charW, r * charH);
          } else if (r === baseRow - 7) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
            ctx.fillText("●", c * charW, r * charH); // Activity LEDs
          } else {
            ctx.fillStyle = "rgba(14, 18, 26, 0.94)";
            ctx.fillText("░", c * charW, r * charH);
          }
        }
      }
      ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
      ctx.fillText(`[${rk.name}]`, (rk.col + 1) * charW, (baseRow - 4) * charH);
    });

    // Bus lines connecting racks
    const busY = (baseRow - 3) * charH;
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let c = 0; c < cols; c++) {
      ctx.fillText(c % 6 === 0 ? "╤" : "═", c * charW, busY);
    }

    stacks.forEach((s) => drawChimney(s, baseRow, time));
  };

  // =========================================================================
  // SCENE 8: SOLAR CLEAN — Decarbonized Modern Green Plant (Net-Zero Transition)
  // Rooftop solar PV arrays, electric heat pumps, clean condensed puffs
  // =========================================================================
  const drawSolarCleanScene = (baseRow: number, time: number) => {
    // Sawtooth building with Rooftop Solar PV Panels
    const shedStart = Math.floor(cols * 0.10);
    const shedEnd = Math.floor(cols * 0.90);

    for (let c = shedStart; c < shedEnd; c++) {
      // 23° Angled Solar PV Arrays
      if (c % 8 < 6) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
        ctx.fillText("[====]", c * charW, (baseRow - 7) * charH);
        ctx.fillStyle = "rgba(16, 185, 129, 0.55)";
        ctx.fillText("╱", c * charW, (baseRow - 6) * charH);
      }
      for (let r = baseRow - 5; r <= baseRow; r++) {
        const isWin = r === baseRow - 3 && c % 5 === 0;
        ctx.fillStyle = isWin ? "rgba(220, 240, 255, 0.85)" : "rgba(18, 24, 34, 0.92)";
        ctx.fillText(isWin ? "▣" : "█", c * charW, r * charH);
      }
    }

    ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
    ctx.fillText("[ROOFTOP SOLAR PV: 1.2 MWp · ZERO CARBON EMISSION]", Math.floor(cols * 0.28) * charW, (baseRow - 2) * charH);

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

    // Hero: Atmospheric dark veil behind left text reading zone
    if (variant === "hero") {
      const textVignette = ctx.createRadialGradient(w * 0.25, h * 0.40, 20, w * 0.25, h * 0.40, w * 0.45);
      textVignette.addColorStop(0, "rgba(7, 7, 9, 0.82)");
      textVignette.addColorStop(0.70, "rgba(7, 7, 9, 0.45)");
      textVignette.addColorStop(1, "rgba(7, 7, 9, 0)");
      ctx.fillStyle = textVignette;
      ctx.fillRect(0, 0, w * 0.65, h);
    }

    // Monospace font styling
    ctx.font = `11px "Geist Mono", ui-monospace, Menlo, monospace`;
    ctx.textBaseline = "middle";

    // 1. Draw Rising Dynamic Plumes (Behind chimneys and structures)
    drawAsciiPlumes(ctx, time);

    // 2. Draw Distinct Architectural Industrial Scene
    drawScene(time);

    rafId = requestAnimationFrame(render);
  };

  const onPointerMove = (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    targetWindX = ((mouseX / window.innerWidth) - 0.45) * 1.0;
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

// Stacks strategically placed in open visual corridors to clear paragraph text
function getStacksForVariant(variant: SkylineVariant): Stack[] {
  switch (variant) {
    case "hero":
      // Stacks strictly on flanks and center gap - ZERO collision with hero paragraph or metrics!
      return [
        { relX: 0.02, heightRows: 17, widthCols: 3, active: true, beacon: true, name: "Boiler 01 Primary (Left Flank)", kind: "carbon" },
        { relX: 0.52, heightRows: 16, widthCols: 3, active: true, beacon: true, name: "Inter-Column Gap Riser", kind: "carbon" },
        { relX: 0.94, heightRows: 19, widthCols: 4, active: true, beacon: true, name: "Right Flank Header", kind: "carbon" },
        { relX: 0.98, heightRows: 14, widthCols: 2, active: true, beacon: false, name: "Far Right Stack", kind: "carbon" }
      ];

    case "threat":
      return [
        { relX: 0.05, heightRows: 11, widthCols: 2, active: true, beacon: false, name: "Diesel Genset 01 Exhaust", kind: "soot" },
        { relX: 0.17, heightRows: 11, widthCols: 2, active: true, beacon: false, name: "Diesel Genset 02 Exhaust", kind: "soot" },
        { relX: 0.88, heightRows: 19, widthCols: 3, active: true, beacon: true, name: "Refinery Flare Stack", kind: "soot" }
      ];

    case "stenter":
    case "dyeing":
      return [
        { relX: 0.03, heightRows: 13, widthCols: 2, active: true, beacon: false, name: "Stenter Chamber #01", kind: "steam" },
        { relX: 0.52, heightRows: 14, widthCols: 3, active: true, beacon: false, name: "Stenter Chamber #04", kind: "steam" },
        { relX: 0.92, heightRows: 20, widthCols: 4, active: true, beacon: true, name: "Venturi Wet Scrubber", kind: "steam" }
      ];

    case "steam-leak":
    case "boiler":
      return [
        { relX: 0.58, heightRows: 12, widthCols: 2, active: true, beacon: false, name: "Line 04 Steam Trap Blowout", kind: "blast" },
        { relX: 0.03, heightRows: 16, widthCols: 3, active: true, beacon: true, name: "Header Relief Exhaust", kind: "steam" },
        { relX: 0.94, heightRows: 17, widthCols: 3, active: true, beacon: true, name: "Condensate Vent", kind: "steam" }
      ];

    case "cogen":
    case "power":
    case "spinning":
      return [
        { relX: 0.04, heightRows: 14, widthCols: 3, active: true, beacon: false, name: "Air Intake Header", kind: "shimmer" },
        { relX: 0.88, heightRows: 22, widthCols: 5, active: true, beacon: true, name: "HRSG Acoustic Silencer", kind: "shimmer" }
      ];

    case "cluster":
      return [
        { relX: 0.04, heightRows: 18, widthCols: 3, active: true, beacon: true, name: "Apex Spinning Stack", kind: "carbon" },
        { relX: 0.22, heightRows: 14, widthCols: 3, active: true, beacon: false, name: "DBL Boiler Flue", kind: "steam" },
        { relX: 0.52, heightRows: 20, widthCols: 4, active: true, beacon: true, name: "Gazipur Central Cogeneration", kind: "carbon" },
        { relX: 0.76, heightRows: 15, widthCols: 3, active: true, beacon: false, name: "Viyellatex Dyehouse Riser", kind: "steam" },
        { relX: 0.94, heightRows: 22, widthCols: 4, active: true, beacon: true, name: "Regional Power Hub", kind: "carbon" }
      ];

    case "scada":
    case "terminal":
      return [
        { relX: 0.03, heightRows: 15, widthCols: 2, active: true, beacon: false, name: "Telemetry Pylon West", kind: "telemetry" },
        { relX: 0.95, heightRows: 16, widthCols: 2, active: true, beacon: false, name: "Telemetry Pylon East", kind: "telemetry" }
      ];

    case "solar-clean":
      return [
        { relX: 0.03, heightRows: 12, widthCols: 2, active: true, beacon: false, name: "Heat Pump Vent West", kind: "clean" },
        { relX: 0.95, heightRows: 12, widthCols: 2, active: true, beacon: false, name: "Heat Pump Vent East", kind: "clean" }
      ];

    default:
      return [
        { relX: 0.02, heightRows: 17, widthCols: 3, active: true, beacon: true, name: "Stack 01", kind: "carbon" },
        { relX: 0.94, heightRows: 18, widthCols: 4, active: true, beacon: true, name: "Stack 02", kind: "carbon" }
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
