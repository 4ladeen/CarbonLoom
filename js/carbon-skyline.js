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
    let windX = 0.22;
    let targetWindX = 0.22;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const charW = 9;
    const charH = 14;
    let cols = 0;
    let rows = 0;
    const stacks = getStacksForVariant(variant);
    const particles = [];
    const maxParticles = reducedMotion ? 0 : variant === "hero" ? 220 : 160;
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
    const glyphsCore = ["@", "&", "8", "%", "#", "\u2593"];
    const glyphsMid = ["#", "%", "S", "O", "*", "\u2592"];
    const glyphsDrift = ["o", "*", "~", "\u2248", "\u2591", "\xB0"];
    const glyphsFaint = [".", "\xB7", "\xB0", " "];
    const drawAsciiSmoke = (ctx2, time) => {
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
        p.y += p.vy * (1 - progress * 0.35);
        const wobble = Math.sin(time * 0.018 + p.seed) * 0.55;
        p.x += p.vx + wobble + windX * (0.9 + progress * 2.4);
        const targetCol = Math.floor(p.x / charW);
        const targetRow = Math.floor(p.y / charH);
        const renderX = targetCol * charW;
        const renderY = targetRow * charH;
        let char = "";
        let color = "";
        if (progress < 0.16) {
          char = glyphsCore[Math.floor(p.seed * 7) % glyphsCore.length];
          const alpha = Math.min(1, progress / 0.1) * 0.85;
          color = `rgba(245, 158, 11, ${alpha})`;
        } else if (progress < 0.5) {
          char = glyphsMid[Math.floor(p.seed * 9) % glyphsMid.length];
          const alpha = (1 - (progress - 0.16) / 0.34) * 0.45 + 0.22;
          color = `rgba(185, 190, 205, ${alpha})`;
        } else if (progress < 0.82) {
          char = glyphsDrift[Math.floor(p.seed * 11) % glyphsDrift.length];
          const alpha = (1 - (progress - 0.5) / 0.32) * 0.24;
          color = `rgba(135, 140, 155, ${alpha})`;
        } else {
          char = glyphsFaint[Math.floor(p.seed * 5) % glyphsFaint.length];
          const alpha = (1 - (progress - 0.82) / 0.18) * 0.14;
          color = `rgba(90, 95, 110, ${alpha})`;
        }
        ctx2.fillStyle = color;
        ctx2.fillText(char, renderX, renderY);
        if (progress > 0.22) {
          const spreadCols = progress > 0.55 ? 2 : 1;
          const sideChar = glyphsDrift[(Math.floor(p.seed * 3) + 1) % glyphsDrift.length];
          const sideAlpha = 0.2 * (1 - progress);
          ctx2.fillStyle = `rgba(155, 160, 175, ${sideAlpha})`;
          ctx2.fillText(sideChar, renderX - spreadCols * charW, renderY + (p.seed > 50 ? 3 : -3));
          ctx2.fillText(sideChar, renderX + spreadCols * charW, renderY);
        }
      }
    };
    const drawAsciiFactory = (ctx2, time) => {
      const baseRow = rows - 2;
      const baseY = baseRow * charH;
      ctx2.fillStyle = "rgba(255, 255, 255, 0.16)";
      for (let c = 0; c < cols; c++) {
        ctx2.fillText(c % 4 === 0 ? "\u2567" : "\u2550", c * charW, baseY + charH);
      }
      ctx2.fillStyle = "rgba(45, 52, 68, 0.4)";
      const bgHills = [
        { start: 0, end: Math.floor(cols * 0.25), h: 8 },
        { start: Math.floor(cols * 0.3), end: Math.floor(cols * 0.55), h: 10 },
        { start: Math.floor(cols * 0.6), end: Math.floor(cols * 0.85), h: 9 },
        { start: Math.floor(cols * 0.88), end: cols, h: 7 }
      ];
      bgHills.forEach((b) => {
        for (let c = b.start; c < b.end; c++) {
          for (let r = baseRow - b.h; r <= baseRow; r++) {
            if (r === baseRow - b.h) {
              ctx2.fillText("\u2584", c * charW, r * charH);
            } else {
              ctx2.fillText("\u2591", c * charW, r * charH);
            }
          }
        }
      });
      const toothCount = 4;
      const toothWidth = Math.min(24, Math.floor(cols * 0.18));
      const step = Math.floor(toothWidth / toothCount);
      for (let t = 0; t < toothCount; t++) {
        const startC = t * step;
        const peakRow = baseRow - 6;
        for (let r = 0; r < 6; r++) {
          const c = startC + r;
          ctx2.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx2.fillText("\u2571", c * charW, (baseRow - r) * charH);
        }
        ctx2.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx2.fillText("\u2502", (startC + 6) * charW, peakRow * charH);
        ctx2.fillStyle = "rgba(245, 158, 11, 0.55)";
        ctx2.fillText("\u25A3", (startC + 4) * charW, (baseRow - 3) * charH);
      }
      for (let c = 0; c < toothWidth; c++) {
        for (let r = baseRow - 2; r <= baseRow; r++) {
          ctx2.fillStyle = "rgba(22, 26, 36, 0.92)";
          ctx2.fillText("\u2588", c * charW, r * charH);
        }
      }
      const hallStart = Math.floor(cols * 0.44);
      const hallEnd = Math.floor(cols * 0.6);
      const hallHeight = 8;
      for (let c = hallStart; c < hallEnd; c++) {
        for (let r = baseRow - hallHeight; r <= baseRow; r++) {
          if (r === baseRow - hallHeight) {
            ctx2.fillStyle = "rgba(255, 255, 255, 0.24)";
            ctx2.fillText("\u2580", c * charW, r * charH);
          } else if (c === hallStart || c === hallEnd - 1) {
            ctx2.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx2.fillText("\u2551", c * charW, r * charH);
          } else {
            const isWindow = (r === baseRow - 5 || r === baseRow - 2) && c % 3 === 0;
            if (isWindow) {
              ctx2.fillStyle = c % 6 === 0 ? "rgba(245, 158, 11, 0.75)" : "rgba(220, 235, 255, 0.65)";
              ctx2.fillText("\u25A0", c * charW, r * charH);
            } else {
              ctx2.fillStyle = "rgba(18, 22, 30, 0.9)";
              ctx2.fillText("\u2592", c * charW, r * charH);
            }
          }
        }
      }
      const ctCenter = Math.floor(cols * 0.26);
      const ctH = 10;
      for (let dy = 0; dy < ctH; dy++) {
        const r = baseRow - dy;
        const halfW = Math.round(2 + Math.pow((dy - 5) / 2.8, 2));
        ctx2.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx2.fillText("(", (ctCenter - halfW) * charW, r * charH);
        ctx2.fillText(")", (ctCenter + halfW) * charW, r * charH);
        for (let fillC = ctCenter - halfW + 1; fillC < ctCenter + halfW; fillC++) {
          ctx2.fillStyle = "rgba(16, 20, 28, 0.85)";
          ctx2.fillText("\u2591", fillC * charW, r * charH);
        }
      }
      const pipeStart = toothWidth;
      const pipeEnd = hallStart;
      const pipeY = (baseRow - 4) * charH;
      ctx2.fillStyle = "rgba(255, 255, 255, 0.18)";
      for (let c = pipeStart; c < pipeEnd; c++) {
        ctx2.fillText(c % 6 === 0 ? "\u2564" : "\u2550", c * charW, pipeY);
        if (c % 6 === 0) {
          ctx2.fillText("\u2502", c * charW, pipeY + charH);
          ctx2.fillText("\u2502", c * charW, pipeY + charH * 2);
        }
      }
      stacks.forEach((s) => {
        const stackCol = Math.round(s.relX * cols);
        const topRow = baseRow - s.heightRows;
        for (let r = topRow; r <= baseRow; r++) {
          const isRim = r === topRow;
          const isBand = (r - topRow) % 4 === 0;
          for (let wOff = 0; wOff < s.widthCols; wOff++) {
            const c = stackCol + wOff;
            if (isRim) {
              ctx2.fillStyle = "rgba(255, 255, 255, 0.45)";
              ctx2.fillText("\u2584", c * charW, r * charH);
            } else if (isBand) {
              ctx2.fillStyle = "rgba(255, 255, 255, 0.32)";
              ctx2.fillText("\u2593", c * charW, r * charH);
            } else if (wOff === 0) {
              ctx2.fillStyle = "rgba(255, 255, 255, 0.25)";
              ctx2.fillText("\u2502", c * charW, r * charH);
            } else if (wOff === s.widthCols - 1) {
              ctx2.fillStyle = "rgba(255, 255, 255, 0.25)";
              ctx2.fillText("\u2502", c * charW, r * charH);
            } else {
              ctx2.fillStyle = "rgba(20, 24, 34, 0.94)";
              ctx2.fillText("\u2588", c * charW, r * charH);
            }
          }
        }
        if (s.beacon) {
          const beaconPulse = (Math.sin(time * 4e-3) + 1) * 0.5;
          const beaconC = stackCol + Math.floor(s.widthCols / 2);
          const beaconY = (topRow - 1) * charH;
          ctx2.fillStyle = `rgba(239, 68, 68, ${0.45 + 0.55 * beaconPulse})`;
          ctx2.fillText("\u25CF", beaconC * charW, beaconY);
        }
      });
    };
    const render = (time) => {
      rafId = 0;
      if (!isVisible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "rgba(7, 7, 9, 0)");
      bg.addColorStop(0.6, "rgba(10, 12, 18, 0.45)");
      bg.addColorStop(0.9, "rgba(14, 16, 24, 0.85)");
      bg.addColorStop(1, "rgba(7, 7, 9, 0.98)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `11px "Geist Mono", ui-monospace, Menlo, monospace`;
      ctx.textBaseline = "middle";
      drawAsciiSmoke(ctx, time);
      drawAsciiFactory(ctx, time);
      rafId = requestAnimationFrame(render);
    };
    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetWindX = (mouseX / window.innerWidth - 0.45) * 1.2;
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
      }
    };
  }
  function getStacksForVariant(variant) {
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
          { relX: 0.4, heightRows: 21, widthCols: 4, active: true, beacon: true, name: "Central Logistics Exhaust" },
          { relX: 0.9, heightRows: 19, widthCols: 3, active: true, beacon: true, name: "Container Yard Boiler" }
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
        initAsciiSkyline(macro, { variant: "dyeing" });
      }
      const pipeline = document.getElementById("pipeline");
      if (pipeline && !pipeline._asciiInit) {
        pipeline._asciiInit = true;
        initAsciiSkyline(pipeline, { variant: "power" });
      }
      const forensics = document.getElementById("forensics");
      if (forensics && !forensics._asciiInit) {
        forensics._asciiInit = true;
        window.forensicsSkylineInstance = initAsciiSkyline(forensics, { variant: "boiler" });
      }
      const secrecy = document.getElementById("secrecy");
      if (secrecy && !secrecy._asciiInit) {
        secrecy._asciiInit = true;
        initAsciiSkyline(secrecy, { variant: "spinning" });
      }
      const pilots = document.getElementById("pilots");
      if (pilots && !pilots._asciiInit) {
        pilots._asciiInit = true;
        initAsciiSkyline(pilots, { variant: "cluster" });
      }
      const modules = document.getElementById("modules");
      if (modules && !modules._asciiInit) {
        modules._asciiInit = true;
        initAsciiSkyline(modules, { variant: "terminal" });
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
