"use strict";
var CarbonAsciiSkyline = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // scripts/carbon-ascii.ts
  var carbon_ascii_exports = {};
  __export(carbon_ascii_exports, {
    initAsciiSkyline: () => initAsciiSkyline
  });
  function initAsciiSkyline(container, options = {}) {
    let rawVariant = options.variant || "hero";
    if (rawVariant === "dyeing") rawVariant = "stenter";
    if (rawVariant === "power" || rawVariant === "spinning") rawVariant = "cogen";
    if (rawVariant === "boiler") rawVariant = "steam-leak";
    if (rawVariant === "terminal") rawVariant = "scada";
    const variant = rawVariant;
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
    if (!ctx) return { destroy: () => {
    }, setStackEmission: () => {
    } };
    let w = 0;
    let h = 0;
    let dpr = 1;
    let rafId = 0;
    let isVisible = true;
    let mouseX = -1e3;
    let mouseY = -1e3;
    let windX = 0.18;
    let targetWindX = 0.18;
    let isRepaired = false;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const charW = 9;
    const charH = 14;
    let cols = 0;
    let rows = 0;
    const stacks = getStacksForVariant(variant);
    const particles = [];
    const maxParticles = reducedMotion ? 0 : variant === "hero" ? 180 : variant === "threat" ? 140 : 120;
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
    const spawnSmokeParticle = (stackIdx) => {
      const s = stacks[stackIdx];
      if (!s || !s.active) return;
      const stackCol = Math.round(s.relX * cols);
      const spawnX = (stackCol + s.widthCols / 2) * charW + (Math.random() - 0.5) * 4;
      const baseRow = rows - 2;
      const spawnY = (baseRow - s.heightRows) * charH;
      let vy = -(0.7 + Math.random() * 0.7);
      let vx = (Math.random() - 0.5) * 0.3;
      let maxLife = 140 + Math.random() * 100;
      if (s.kind === "soot") {
        vy = -(0.35 + Math.random() * 0.45);
        vx = (Math.random() - 0.2) * 0.8;
        maxLife = 180 + Math.random() * 100;
      } else if (s.kind === "blast") {
        vy = -(1.2 + Math.random() * 1.4);
        vx = (Math.random() - 0.3) * 1.5;
        maxLife = 90 + Math.random() * 60;
      } else if (s.kind === "steam") {
        vy = -(0.85 + Math.random() * 0.9);
        maxLife = 110 + Math.random() * 70;
      } else if (s.kind === "shimmer") {
        vy = -(0.5 + Math.random() * 0.4);
        vx = (Math.random() - 0.5) * 0.2;
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
    const glyphsCarbonCore = ["@", "&", "8", "%", "#", "\u2593"];
    const glyphsCarbonMid = ["#", "%", "S", "O", "*", "\u2592"];
    const glyphsCarbonDrift = ["o", "*", "~", "\u2248", "\u2591", "\xB0"];
    const glyphsSootCore = ["\u2588", "\u2593", "\u2593", "\u2592", "#", "@"];
    const glyphsSootMid = ["\u2593", "\u2592", "\u2591", "%", "#", "S"];
    const glyphsSootDrift = ["\u2592", "\u2591", "\xB0", "\xB7", "\xB7"];
    const glyphsSteamCore = ["O", "0", "o", "\xA9", "\u2591", "\u2592"];
    const glyphsSteamMid = ["o", "*", "~", "\xB0", "\u2591"];
    const glyphsSteamDrift = ["~", "\u2248", "\xB7", "\xB0", " "];
    const glyphsBlast = [">", "\xBB", "@", "%", "8", "*", "!", "#"];
    const glyphsShimmer = ["~", "\u2248", "\u222B", "\u2240", "\xB7", "~"];
    const glyphsTelemetry = ["\u25CF", "\u25A0", "\u25B2", "\u25C6", "*", "+", "\xB7", "\u2591"];
    const drawAsciiPlumes = (ctx2, time) => {
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
        const wobble = Math.sin(time * 3e-3 + p.seed) * 0.35;
        p.x += p.vx + wobble + windX * (0.8 + progress * 2);
        p.y += p.vy * (1 - progress * 0.3);
        const renderCol = Math.round(p.x / charW);
        const renderRow = Math.round(p.y / charH);
        const renderX = renderCol * charW;
        const renderY = renderRow * charH;
        let textMaskDim = 1;
        if (variant === "hero" && renderX > w * 0.08 && renderX < w * 0.5 && renderY < h * 0.7) {
          textMaskDim = 0.25;
        }
        let char = "\xB7";
        let color = "rgba(120, 125, 140, 0.15)";
        if (p.kind === "soot") {
          if (progress < 0.3) {
            char = glyphsSootCore[Math.floor(p.seed * 7) % glyphsSootCore.length];
            color = `rgba(35, 38, 48, ${0.75 * textMaskDim})`;
          } else if (progress < 0.65) {
            char = glyphsSootMid[Math.floor(p.seed * 11) % glyphsSootMid.length];
            color = `rgba(50, 55, 68, ${0.45 * (1 - progress) * textMaskDim})`;
          } else {
            char = glyphsSootDrift[Math.floor(p.seed * 5) % glyphsSootDrift.length];
            color = `rgba(70, 75, 90, ${0.2 * (1 - progress) * textMaskDim})`;
          }
        } else if (p.kind === "steam") {
          if (progress < 0.35) {
            char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
            color = `rgba(215, 230, 245, ${0.55 * textMaskDim})`;
          } else if (progress < 0.7) {
            char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
            color = `rgba(180, 200, 220, ${0.3 * textMaskDim})`;
          } else {
            char = glyphsSteamDrift[Math.floor(p.seed * 5) % glyphsSteamDrift.length];
            color = `rgba(140, 160, 185, ${0.12 * textMaskDim})`;
          }
        } else if (p.kind === "blast") {
          if (isRepaired) {
            char = "\xB7";
            color = `rgba(140, 170, 200, ${0.1 * (1 - progress)})`;
          } else {
            if (progress < 0.25) {
              char = glyphsBlast[Math.floor((p.seed + time * 0.05) * 7) % glyphsBlast.length];
              color = `rgba(245, 158, 11, ${0.85 * textMaskDim})`;
            } else if (progress < 0.6) {
              char = glyphsSteamCore[Math.floor(p.seed * 7) % glyphsSteamCore.length];
              color = `rgba(230, 240, 255, ${0.65 * textMaskDim})`;
            } else {
              char = glyphsSteamMid[Math.floor(p.seed * 9) % glyphsSteamMid.length];
              color = `rgba(160, 180, 205, ${0.25 * textMaskDim})`;
            }
          }
        } else if (p.kind === "shimmer") {
          char = glyphsShimmer[Math.floor((p.seed + time * 0.02) * 5) % glyphsShimmer.length];
          const alpha = 0.22 * Math.sin(progress * Math.PI) * textMaskDim;
          color = `rgba(180, 215, 255, ${alpha})`;
        } else if (p.kind === "telemetry") {
          char = glyphsTelemetry[Math.floor((p.seed + time * 0.08) * 11) % glyphsTelemetry.length];
          const alpha = 0.65 * (1 - progress) * textMaskDim;
          color = p.seed > 50 ? `rgba(16, 185, 129, ${alpha})` : `rgba(56, 189, 248, ${alpha})`;
        } else if (p.kind === "clean") {
          char = progress < 0.4 ? "\xB0" : "\xB7";
          color = `rgba(200, 215, 230, ${0.18 * (1 - progress) * textMaskDim})`;
        } else {
          if (progress < 0.18) {
            char = glyphsCarbonCore[Math.floor(p.seed * 7) % glyphsCarbonCore.length];
            color = `rgba(245, 158, 11, ${0.72 * textMaskDim})`;
          } else if (progress < 0.5) {
            char = glyphsCarbonMid[Math.floor(p.seed * 9) % glyphsCarbonMid.length];
            color = `rgba(195, 200, 215, ${0.42 * textMaskDim})`;
          } else if (progress < 0.82) {
            char = glyphsCarbonDrift[Math.floor(p.seed * 11) % glyphsCarbonDrift.length];
            color = `rgba(140, 145, 160, ${0.22 * textMaskDim})`;
          } else {
            char = "\xB7";
            color = `rgba(90, 95, 110, ${0.12 * textMaskDim})`;
          }
        }
        ctx2.fillStyle = color;
        ctx2.fillText(char, renderX, renderY);
      }
    };
    const drawChimney = (s, baseRow, time) => {
      const stackCol = Math.round(s.relX * cols);
      const topRow = baseRow - s.heightRows;
      for (let r = topRow; r <= baseRow; r++) {
        const isRim = r === topRow;
        const isBand = (r - topRow) % 4 === 0;
        for (let wOff = 0; wOff < s.widthCols; wOff++) {
          const c = stackCol + wOff;
          if (isRim) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.40)";
            ctx.fillText("\u2584", c * charW, r * charH);
          } else if (isBand) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillText("\u2593", c * charW, r * charH);
          } else if (wOff === 0 || wOff === s.widthCols - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
            ctx.fillText("\u2502", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(20, 24, 34, 0.90)";
            ctx.fillText("\u2588", c * charW, r * charH);
          }
        }
      }
      if (s.beacon) {
        const beaconPulse = (Math.sin(time * 4e-3) + 1) * 0.5;
        const beaconC = stackCol + Math.floor(s.widthCols / 2);
        const beaconY = (topRow - 1) * charH;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.45 + 0.55 * beaconPulse})`;
        ctx.fillText("\u25CF", beaconC * charW, beaconY);
      }
    };
    const drawHeroScene = (baseRow, time) => {
      const baseY = baseRow * charH;
      ctx.fillStyle = "rgba(35, 42, 58, 0.35)";
      for (let c = 0; c < cols; c++) {
        if (c > cols * 0.06 && c < cols * 0.48) continue;
        for (let r = baseRow - 6; r <= baseRow; r++) {
          ctx.fillText(r === baseRow - 6 ? "\u2584" : "\u2591", c * charW, r * charH);
        }
      }
      const drumStart = Math.floor(cols * 0.56);
      const drumEnd = Math.floor(cols * 0.88);
      for (let c = drumStart; c < drumEnd; c++) {
        const isHeader = (c - drumStart) % 8 === 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText("\u2550", c * charW, (baseRow - 5) * charH);
        if (isHeader) {
          ctx.fillText("\u2564", c * charW, (baseRow - 5) * charH);
          ctx.fillText("\u2502", c * charW, (baseRow - 4) * charH);
          ctx.fillText("\u2502", c * charW, (baseRow - 3) * charH);
        }
        for (let r = baseRow - 3; r <= baseRow; r++) {
          ctx.fillStyle = isHeader ? "rgba(255, 255, 255, 0.25)" : "rgba(18, 22, 30, 0.88)";
          ctx.fillText(isHeader ? "\u2551" : "\u2588", c * charW, r * charH);
        }
      }
      const portholeStart = Math.floor(cols * 0.62);
      for (let c = portholeStart; c < Math.min(cols - 2, portholeStart + 16); c += 4) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.45)";
        ctx.fillText("\u25A3", c * charW, (baseRow - 2) * charH);
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawThreatScene = (baseRow, time) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      for (let c = 0; c < cols; c++) ctx.fillText("\u2550", c * charW, (baseRow + 1) * charH);
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
              ctx.fillText("\u2584", c * charW, r * charH);
            } else if (c === g.start || c === g.start + g.width - 1) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
              ctx.fillText("\u2551", c * charW, r * charH);
            } else if (r === baseRow - 4) {
              ctx.fillStyle = "rgba(239, 68, 68, 0.55)";
              ctx.fillText("\u2261", c * charW, r * charH);
            } else if (r === baseRow - 2 && (c - g.start) % 3 === 0) {
              ctx.fillStyle = "rgba(245, 158, 11, 0.70)";
              ctx.fillText("\u25A0", c * charW, r * charH);
            } else {
              ctx.fillStyle = "rgba(22, 26, 36, 0.92)";
              ctx.fillText("\u2588", c * charW, r * charH);
            }
          }
        }
        const exhC = g.start + 2;
        for (let r = topR - 4; r < topR; r++) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
          ctx.fillText("\u2502", exhC * charW, r * charH);
        }
      });
      const flareCol = Math.floor(cols * 0.88);
      const flareTop = baseRow - 18;
      for (let r = flareTop; r <= baseRow; r++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillText(r % 2 === 0 ? "\u2571" : "\u2572", flareCol * charW, r * charH);
        ctx.fillText("\u2502", (flareCol + 1) * charW, r * charH);
      }
      const flameFlicker = (Math.sin(time * 0.02) + Math.cos(time * 0.035)) * 0.5;
      const flameHeight = Math.floor(3 + flameFlicker * 2);
      for (let f = 1; f <= flameHeight; f++) {
        ctx.fillStyle = f === 1 ? "rgba(255, 240, 150, 0.95)" : f === 2 ? "rgba(249, 115, 22, 0.85)" : "rgba(239, 68, 68, 0.75)";
        ctx.fillText(f === 1 ? "\u25B2" : f === 2 ? "*" : "\u2591", (flareCol + 1) * charW, (flareTop - f) * charH);
        if (f > 1) {
          ctx.fillText("~", flareCol * charW, (flareTop - f) * charH);
        }
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawStenterScene = (baseRow, time) => {
      const toothCount = 5;
      const toothWidth = Math.floor(cols * 0.4);
      const step = Math.floor(toothWidth / toothCount);
      for (let t = 0; t < toothCount; t++) {
        const startC = Math.floor(cols * 0.04) + t * step;
        const peakRow = baseRow - 7;
        for (let r = 0; r < 7; r++) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.fillText("\u2571", (startC + r) * charW, (baseRow - r) * charH);
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillText("\u2502", (startC + 7) * charW, peakRow * charH);
        const fanPhase = Math.floor((time * 0.015 + t) % 4);
        const fanGlyphs = ["\u2723", "\u2715", "+", "\xD7"];
        ctx.fillStyle = "rgba(56, 189, 248, 0.75)";
        ctx.fillText(fanGlyphs[fanPhase], (startC + 4) * charW, (peakRow - 1) * charH);
      }
      for (let c = Math.floor(cols * 0.08); c < Math.floor(cols * 0.4); c++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillText(c % 4 === 0 ? "o" : "\u2550", c * charW, (baseRow - 1) * charH);
      }
      const scrubCol = Math.floor(cols * 0.92);
      const scrubH = 16;
      for (let dy = 0; dy < scrubH; dy++) {
        const r = baseRow - dy;
        const coneW = dy < 4 ? 3 : dy > 12 ? 2 : 4;
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillText("[", (scrubCol - coneW) * charW, r * charH);
        ctx.fillText("]", (scrubCol + coneW) * charW, r * charH);
        for (let fillC = scrubCol - coneW + 1; fillC < scrubCol + coneW; fillC++) {
          ctx.fillStyle = "rgba(14, 24, 38, 0.92)";
          ctx.fillText(dy % 3 === 0 ? "\u2592" : "\u2588", fillC * charW, r * charH);
        }
      }
      ctx.fillStyle = "rgba(56, 189, 248, 0.50)";
      ctx.fillText("\u25A0\u25A0", (scrubCol - 3) * charW, (baseRow - 2) * charH);
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawSteamLeakScene = (baseRow, time) => {
      const pipeRow = baseRow - 8;
      const pipeY = pipeRow * charH;
      ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
      for (let c = Math.floor(cols * 0.1); c < Math.floor(cols * 0.9); c++) {
        ctx.fillText("\u2550", c * charW, pipeY);
        ctx.fillText("\u2550", c * charW, pipeY + charH * 2);
      }
      const flangedCols = [
        Math.floor(cols * 0.22),
        Math.floor(cols * 0.4),
        Math.floor(cols * 0.58),
        Math.floor(cols * 0.76)
      ];
      flangedCols.forEach((fc) => {
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillText("\u2551", fc * charW, pipeY);
        ctx.fillText("\u2551", fc * charW, pipeY + charH);
        ctx.fillText("\u2551", fc * charW, pipeY + charH * 2);
      });
      const gaugeCol = Math.floor(cols * 0.32);
      ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.85)" : "rgba(239, 68, 68, 0.85)";
      ctx.fillText(isRepaired ? "(\u25CB\u2500)" : "(\u25CF\u2197)", gaugeCol * charW, pipeY - charH);
      const trapCol = Math.floor(cols * 0.58);
      const trapRow = pipeRow + 3;
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillText("\u2502", trapCol * charW, pipeY + charH * 3);
      ctx.fillText("\u2502", trapCol * charW, pipeY + charH * 4);
      ctx.fillText("\u29D6", trapCol * charW, pipeY + charH * 5);
      ctx.fillStyle = isRepaired ? "rgba(16, 185, 129, 0.85)" : "rgba(245, 158, 11, 0.90)";
      ctx.fillText(isRepaired ? "[\u25A0]" : "[\u2591]", trapCol * charW, (trapRow + 4) * charH);
      if (!isRepaired) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.90)";
        ctx.fillText("\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB", (trapCol + 2) * charW, pipeY + charH * 3);
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawCogenScene = (baseRow, time) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      for (let c = 0; c < cols; c++) ctx.fillText("\u2550", c * charW, (baseRow + 1) * charH);
      const turbStart = Math.floor(cols * 0.12);
      const turbWidth = Math.floor(cols * 0.35);
      const turbHeight = 9;
      for (let c = turbStart; c < turbStart + turbWidth; c++) {
        for (let r = baseRow - turbHeight; r <= baseRow; r++) {
          if (r === baseRow - turbHeight) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
            ctx.fillText("\u2580", c * charW, r * charH);
          } else if (c === turbStart || c === turbStart + turbWidth - 1) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillText("\u2551", c * charW, r * charH);
          } else if (r === baseRow - 6 && (c - turbStart) % 4 === 0) {
            ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
            ctx.fillText("\u2261", c * charW, r * charH);
          } else if (r === baseRow - 3 && (c - turbStart) % 5 === 0) {
            ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
            ctx.fillText("\u25CF", c * charW, r * charH);
          } else {
            ctx.fillStyle = "rgba(18, 22, 32, 0.94)";
            ctx.fillText("\u2588", c * charW, r * charH);
          }
        }
      }
      for (let c = turbStart + 4; c < turbStart + turbWidth - 4; c += 2) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.fillText("\u2261", c * charW, (baseRow - 4) * charH);
      }
      for (let c = turbStart + 4; c < turbStart + turbWidth - 4; c += 3) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.70)";
        ctx.fillText("\u25CF", c * charW, (baseRow - 2) * charH);
      }
      const hrsgStart = turbStart + turbWidth;
      const hrsgEnd = Math.floor(cols * 0.7);
      for (let c = hrsgStart; c < hrsgEnd; c++) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillText("\u2550", c * charW, (baseRow - 5) * charH);
        ctx.fillText("\u2550", c * charW, (baseRow - 1) * charH);
        if (c % 4 === 0) {
          ctx.fillStyle = "rgba(245, 158, 11, 0.45)";
          ctx.fillText("\u2592", c * charW, (baseRow - 3) * charH);
        }
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawClusterScene = (baseRow, time) => {
      ctx.fillStyle = "rgba(32, 38, 52, 0.40)";
      for (let c = 0; c < cols; c++) {
        const hillH = 4 + Math.round(Math.sin(c * 0.12) * 3);
        for (let r = baseRow - hillH; r <= baseRow; r++) {
          ctx.fillText(r === baseRow - hillH ? "\u2584" : "\u2591", c * charW, r * charH);
        }
      }
      ctx.fillStyle = "rgba(22, 26, 36, 0.85)";
      for (let c = Math.floor(cols * 0.1); c < Math.floor(cols * 0.9); c++) {
        if (c % 6 === 0) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
          ctx.fillText("\u2571", c * charW, (baseRow - 5) * charH);
        }
        for (let r = baseRow - 4; r <= baseRow; r++) {
          const isWin = r === baseRow - 2 && c % 4 === 0;
          ctx.fillStyle = isWin ? "rgba(245, 158, 11, 0.65)" : "rgba(16, 20, 28, 0.92)";
          ctx.fillText(isWin ? "\u25A0" : "\u2588", c * charW, r * charH);
        }
      }
      const pylonCols = [Math.floor(cols * 0.36), Math.floor(cols * 0.65)];
      pylonCols.forEach((pc) => {
        const pTop = baseRow - 12;
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillText("/\u25B2\\", (pc - 1) * charW, pTop * charH);
        for (let r = pTop + 1; r <= baseRow; r++) {
          ctx.fillText(r % 2 === 0 ? "/\u2502\\" : "|\u2551|", (pc - 1) * charW, r * charH);
        }
        for (let c = 0; c < cols; c++) {
          if (c % 3 === 0) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
            ctx.fillText("\xB7", c * charW, (pTop + 2) * charH);
          }
        }
      });
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawScadaScene = (baseRow, time) => {
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
              ctx.fillText("\u2550", c * charW, r * charH);
            } else if (c === rk.col || c === rk.col + 13) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
              ctx.fillText("\u2551", c * charW, r * charH);
            } else if (r === baseRow - 7) {
              ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
              ctx.fillText("\u25CF", c * charW, r * charH);
            } else {
              ctx.fillStyle = "rgba(14, 18, 26, 0.94)";
              ctx.fillText("\u2591", c * charW, r * charH);
            }
          }
        }
        for (let c = rk.col + 2; c < rk.col + 12; c += 2) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
          ctx.fillText("\u25A0", c * charW, (baseRow - 4) * charH);
        }
      });
      const busY = (baseRow - 3) * charH;
      ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
      for (let c = 0; c < cols; c++) {
        ctx.fillText(c % 6 === 0 ? "\u2564" : "\u2550", c * charW, busY);
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawSolarCleanScene = (baseRow, time) => {
      const shedStart = Math.floor(cols * 0.1);
      const shedEnd = Math.floor(cols * 0.9);
      for (let c = shedStart; c < shedEnd; c++) {
        if (c % 8 < 6) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
          ctx.fillText("[====]", c * charW, (baseRow - 7) * charH);
          ctx.fillStyle = "rgba(16, 185, 129, 0.55)";
          ctx.fillText("\u2571", c * charW, (baseRow - 6) * charH);
        }
        for (let r = baseRow - 5; r <= baseRow; r++) {
          const isWin = r === baseRow - 3 && c % 5 === 0;
          ctx.fillStyle = isWin ? "rgba(220, 240, 255, 0.85)" : "rgba(18, 24, 34, 0.92)";
          ctx.fillText(isWin ? "\u25A3" : "\u2588", c * charW, r * charH);
        }
      }
      stacks.forEach((s) => drawChimney(s, baseRow, time));
    };
    const drawScene = (time) => {
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
    const render = (time) => {
      rafId = 0;
      if (!isVisible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "rgba(7, 7, 9, 0)");
      bg.addColorStop(0.55, "rgba(9, 11, 16, 0.35)");
      bg.addColorStop(0.85, "rgba(12, 15, 22, 0.75)");
      bg.addColorStop(1, "rgba(7, 7, 9, 0.98)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      if (variant === "hero") {
        const textVignette = ctx.createRadialGradient(w * 0.25, h * 0.4, 20, w * 0.25, h * 0.4, w * 0.45);
        textVignette.addColorStop(0, "rgba(7, 7, 9, 0.82)");
        textVignette.addColorStop(0.7, "rgba(7, 7, 9, 0.45)");
        textVignette.addColorStop(1, "rgba(7, 7, 9, 0)");
        ctx.fillStyle = textVignette;
        ctx.fillRect(0, 0, w * 0.65, h);
      }
      ctx.font = `11px "Geist Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = "middle";
      drawAsciiPlumes(ctx, time);
      drawScene(time);
      rafId = requestAnimationFrame(render);
    };
    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetWindX = (mouseX / window.innerWidth - 0.45) * 1;
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
      setStackEmission: (stackIndex, active) => {
        if (stacks[stackIndex]) {
          stacks[stackIndex].active = active;
        }
      },
      setRepaired: (repaired) => {
        isRepaired = repaired;
        if (stacks[0]) {
          stacks[0].active = !repaired;
        }
      }
    };
  }
  function getStacksForVariant(variant) {
    switch (variant) {
      case "hero":
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
  if (typeof window !== "undefined") {
    window.initAsciiSkyline = initAsciiSkyline;
    window.initCarbonSkyline = initAsciiSkyline;
    const autoInitAscii = () => {
      const hero = document.querySelector(".hero-section");
      if (hero && !hero._asciiInit) {
        hero._asciiInit = true;
        window.carbonSkylineInstance = initAsciiSkyline(hero, { variant: "hero" });
      }
      const macro = document.getElementById("macro-threat");
      if (macro && !macro._asciiInit) {
        macro._asciiInit = true;
        initAsciiSkyline(macro, { variant: "threat" });
      }
      const pipeline = document.getElementById("pipeline");
      if (pipeline && !pipeline._asciiInit) {
        pipeline._asciiInit = true;
        initAsciiSkyline(pipeline, { variant: "stenter" });
      }
      const forensics = document.getElementById("forensics");
      if (forensics && !forensics._asciiInit) {
        forensics._asciiInit = true;
        window.forensicsSkylineInstance = initAsciiSkyline(forensics, { variant: "steam-leak" });
      }
      const secrecy = document.getElementById("secrecy");
      if (secrecy && !secrecy._asciiInit) {
        secrecy._asciiInit = true;
        initAsciiSkyline(secrecy, { variant: "cogen" });
      }
      const pilots = document.getElementById("pilots");
      if (pilots && !pilots._asciiInit) {
        pilots._asciiInit = true;
        initAsciiSkyline(pilots, { variant: "cluster" });
      }
      const modules = document.getElementById("modules");
      if (modules && !modules._asciiInit) {
        modules._asciiInit = true;
        initAsciiSkyline(modules, { variant: "scada" });
      }
      const customBgs = document.querySelectorAll(".carbon-skyline-bg");
      customBgs.forEach((el) => {
        if (!el._asciiInit) {
          el._asciiInit = true;
          const v = el.getAttribute("data-skyline") || "cluster";
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
  return __toCommonJS(carbon_ascii_exports);
})();
