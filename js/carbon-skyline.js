"use strict";
var CarbonSkyline = (() => {
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

  // scripts/carbon-skyline.ts
  var carbon_skyline_exports = {};
  __export(carbon_skyline_exports, {
    initCarbonSkyline: () => initCarbonSkyline
  });
  function initCarbonSkyline(container, variant = "hero") {
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
    let windX = 0.15;
    let targetWindX = 0.15;
    const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stacks = getStacksForVariant(variant);
    const particles = [];
    const maxParticles = reducedMotion ? 0 : 200;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const horizon = h * 0.94;
      stacks.forEach((s) => {
        s.topY = horizon - s.height;
      });
    };
    const spawnParticle = (stackIdx) => {
      const s = stacks[stackIdx];
      const spawnX = s.relX * w + s.width / 2 + (Math.random() - 0.5) * 6;
      const spawnY = s.topY + 1;
      const maxLife = 160 + Math.random() * 120;
      particles.push({
        x: spawnX,
        y: spawnY,
        vx: (Math.random() - 0.5) * 0.38,
        vy: -(0.75 + Math.random() * 0.75),
        size: 6 + Math.random() * 4,
        maxSize: 42 + Math.random() * 28,
        alpha: 0.02,
        maxAlpha: 0.28 + Math.random() * 0.14,
        life: 0,
        maxLife,
        wobbleSpeed: 0.016 + Math.random() * 0.022,
        wobbleAmp: 0.45 + Math.random() * 0.55,
        seed: Math.random() * 100,
        stackId: stackIdx
      });
    };
    const preSeedParticles = () => {
      if (reducedMotion) return;
      for (let step = 0; step < 180; step++) {
        for (let i = 0; i < stacks.length; i++) {
          if (stacks[i].active && Math.random() < 0.38) {
            spawnParticle(i);
          }
        }
        for (let p of particles) {
          p.life += 1;
          p.y += p.vy;
          p.x += p.vx + windX;
        }
      }
    };
    const drawPlumes = (ctx2, time) => {
      if (!reducedMotion && particles.length < maxParticles) {
        for (let i = 0; i < stacks.length; i++) {
          if (stacks[i].active && Math.random() < 0.38) {
            spawnParticle(i);
          }
        }
      }
      windX += (targetWindX - windX) * 0.025;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }
        p.y += p.vy * (1 - progress * 0.35);
        const wobble = Math.sin(time * p.wobbleSpeed + p.seed) * p.wobbleAmp;
        p.x += p.vx + wobble + windX * (0.9 + progress * 2.2);
        const currentSize = p.size + (p.maxSize - p.size) * Math.pow(progress, 0.72);
        let currentAlpha = 0;
        if (progress < 0.12) {
          currentAlpha = progress / 0.12 * p.maxAlpha;
        } else {
          currentAlpha = p.maxAlpha * Math.pow(1 - progress, 1.3);
        }
        const grad = ctx2.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize);
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
        ctx2.fillStyle = grad;
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx2.fill();
      }
    };
    const render = (time) => {
      rafId = 0;
      if (!isVisible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const bgAtmosphere = ctx.createLinearGradient(0, 0, 0, h);
      bgAtmosphere.addColorStop(0, "rgba(7, 7, 9, 0)");
      bgAtmosphere.addColorStop(0.65, "rgba(14, 16, 22, 0.45)");
      bgAtmosphere.addColorStop(0.92, "rgba(18, 21, 28, 0.7)");
      bgAtmosphere.addColorStop(1, "rgba(7, 7, 9, 0.95)");
      ctx.fillStyle = bgAtmosphere;
      ctx.fillRect(0, 0, w, h);
      drawPlumes(ctx, time);
      drawSkylineVariant(ctx, w, h, time, variant, stacks);
      rafId = requestAnimationFrame(render);
    };
    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetWindX = (mouseX / window.innerWidth - 0.45) * 1.1;
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
          { relX: 0.08, topY: 0, width: 14, height: 185, active: true, beacon: true, name: "Boiler 01 Primary" },
          { relX: 0.22, topY: 0, width: 10, height: 140, active: true, beacon: false, name: "Stenter 01 Exhaust" },
          { relX: 0.38, topY: 0, width: 12, height: 165, active: true, beacon: true, name: "Stenter 02 Finishing" },
          { relX: 0.72, topY: 0, width: 18, height: 220, active: true, beacon: true, name: "Thermal Oil Header" },
          { relX: 0.9, topY: 0, width: 14, height: 175, active: true, beacon: true, name: "Central Heat Plant" }
        ];
      case "dyeing":
        return [
          { relX: 0.1, topY: 0, width: 14, height: 240, active: true, beacon: true, name: "Dyeing Stenter #01" },
          { relX: 0.3, topY: 0, width: 16, height: 280, active: true, beacon: true, name: "Steam Drying Oven #02" },
          { relX: 0.68, topY: 0, width: 12, height: 220, active: true, beacon: false, name: "Bleaching Line Exhaust" },
          { relX: 0.88, topY: 0, width: 18, height: 290, active: true, beacon: true, name: "Central Scrubber Stack" }
        ];
      case "power":
        return [
          { relX: 0.08, topY: 0, width: 18, height: 270, active: true, beacon: true, name: "Gas Turbine Exhaust 1" },
          { relX: 0.34, topY: 0, width: 20, height: 310, active: true, beacon: true, name: "Co-Gen Heat Recovery" },
          { relX: 0.65, topY: 0, width: 16, height: 240, active: true, beacon: false, name: "Thermal Flue Header" },
          { relX: 0.92, topY: 0, width: 18, height: 280, active: true, beacon: true, name: "DESCO Substation Plant" }
        ];
      case "boiler":
        return [
          { relX: 0.16, topY: 0, width: 14, height: 220, active: true, beacon: false, name: "Boiler 02 Secondary" },
          { relX: 0.82, topY: 0, width: 18, height: 290, active: true, beacon: true, name: "Boiler 01 Primary (Monitored)" }
        ];
      case "spinning":
        return [
          { relX: 0.12, topY: 0, width: 12, height: 230, active: true, beacon: false, name: "Spinning Mill Shed Exhaust" },
          { relX: 0.38, topY: 0, width: 16, height: 270, active: true, beacon: true, name: "HVAC Central Riser" },
          { relX: 0.64, topY: 0, width: 14, height: 240, active: true, beacon: false, name: "Weaving Shed Dust Filter" },
          { relX: 0.88, topY: 0, width: 16, height: 260, active: true, beacon: true, name: "Lab Thermal Exhaust" }
        ];
      case "cluster":
        return [
          { relX: 0.06, topY: 0, width: 14, height: 230, active: true, beacon: true, name: "Apex Padma Mill #1" },
          { relX: 0.24, topY: 0, width: 16, height: 270, active: true, beacon: true, name: "DBL Cluster Stack" },
          { relX: 0.5, topY: 0, width: 12, height: 210, active: true, beacon: false, name: "Turag Dyeing Line" },
          { relX: 0.74, topY: 0, width: 18, height: 300, active: true, beacon: true, name: "Gazipur Central Boiler" },
          { relX: 0.92, topY: 0, width: 14, height: 240, active: true, beacon: false, name: "Savar EPZ Header" }
        ];
      case "terminal":
      default:
        return [
          { relX: 0.12, topY: 0, width: 14, height: 220, active: true, beacon: false, name: "Dispatch Terminal Vent" },
          { relX: 0.56, topY: 0, width: 18, height: 280, active: true, beacon: true, name: "Central Logistics Exhaust" },
          { relX: 0.86, topY: 0, width: 16, height: 250, active: true, beacon: true, name: "Container Yard Boiler" }
        ];
    }
  }
  function drawSkylineVariant(ctx, w, h, time, variant, stacks) {
    const horizon = h * 0.94;
    ctx.fillStyle = "rgba(16, 18, 24, 0.75)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(0, horizon - 70);
    ctx.lineTo(w * 0.08, horizon - 70);
    ctx.lineTo(w * 0.16, horizon - 110);
    ctx.lineTo(w * 0.22, horizon - 75);
    ctx.lineTo(w * 0.35, horizon - 95);
    ctx.lineTo(w * 0.48, horizon - 70);
    ctx.lineTo(w * 0.62, horizon - 115);
    ctx.lineTo(w * 0.75, horizon - 145);
    ctx.lineTo(w * 0.88, horizon - 90);
    ctx.lineTo(w, horizon - 75);
    ctx.lineTo(w, horizon);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const ctX = variant === "power" ? w * 0.22 : w * 0.52;
    const ctTop = horizon - 105;
    ctx.fillStyle = "rgba(14, 16, 21, 0.85)";
    ctx.beginPath();
    ctx.moveTo(ctX - 35, horizon);
    ctx.quadraticCurveTo(ctX - 18, horizon - 55, ctX - 22, ctTop);
    ctx.lineTo(ctX + 22, ctTop);
    ctx.quadraticCurveTo(ctX + 18, horizon - 55, ctX + 35, horizon);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.stroke();
    ctx.fillStyle = "rgba(11, 13, 17, 0.96)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, horizon);
    let curX = 0;
    ctx.lineTo(curX, horizon - 45);
    const toothCount = variant === "spinning" ? 6 : 4;
    const toothSpan = w * 0.18 / toothCount;
    for (let i = 0; i < toothCount; i++) {
      curX += toothSpan * 0.75;
      ctx.lineTo(curX, horizon - 85);
      curX += toothSpan * 0.25;
      ctx.lineTo(curX, horizon - 45);
    }
    stacks.forEach((s) => {
      const sx = s.relX * w;
      ctx.lineTo(sx - 18, horizon - 60);
      ctx.lineTo(sx - 18, s.topY + 45);
      ctx.lineTo(sx, s.topY);
      ctx.lineTo(sx + s.width, s.topY);
      ctx.lineTo(sx + s.width + 16, s.topY + 45);
      ctx.lineTo(sx + s.width + 28, horizon - 60);
      ctx.lineTo(sx + s.width + 55, horizon - 50);
    });
    ctx.lineTo(w, horizon - 50);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    const windowColor = "rgba(245, 158, 11, 0.18)";
    const windowWhite = "rgba(220, 230, 245, 0.14)";
    curX = 0;
    for (let i = 0; i < toothCount; i++) {
      const toothApex = curX + toothSpan * 0.75;
      const toothBase = curX + toothSpan;
      ctx.fillStyle = windowColor;
      ctx.beginPath();
      ctx.moveTo(toothApex, horizon - 82);
      ctx.lineTo(toothBase, horizon - 48);
      ctx.lineTo(toothApex, horizon - 48);
      ctx.closePath();
      ctx.fill();
      curX += toothSpan;
    }
    const winHallX = w * 0.44;
    for (let wy = horizon - 85; wy <= horizon - 62; wy += 8) {
      for (let wx = winHallX; wx < winHallX + w * 0.09; wx += 10) {
        ctx.fillStyle = (wx + wy) % 2 === 0 ? windowWhite : windowColor;
        ctx.fillRect(wx, wy, 6, 5);
      }
    }
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (stacks.length >= 2) {
      const sA = stacks[0];
      const sB = stacks[1];
      const sAx = sA.relX * w + sA.width + 28;
      const sBx = sB.relX * w - 18;
      ctx.moveTo(sAx, horizon - 52);
      ctx.lineTo(sBx, horizon - 52);
      ctx.moveTo(sAx, horizon - 46);
      ctx.lineTo(sBx, horizon - 46);
    }
    ctx.stroke();
    stacks.forEach((s) => {
      const sx = s.relX * w;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      for (let y = s.topY + 22; y < horizon - 25; y += 26) {
        ctx.beginPath();
        ctx.moveTo(sx - 3, y);
        ctx.lineTo(sx + s.width + 3, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.moveTo(sx + 3, s.topY + 14);
      ctx.lineTo(sx + 3, horizon - 20);
      ctx.stroke();
    });
    const beaconPulse = (Math.sin(time * 35e-4) + 1) * 0.5;
    stacks.forEach((s) => {
      if (s.beacon) {
        const bx = s.relX * w + s.width / 2;
        const by = s.topY - 2;
        const haloGrad = ctx.createRadialGradient(bx, by, 0, bx, by, 9);
        haloGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * beaconPulse})`);
        haloGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(bx, by, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 120, 120, ${0.75 + 0.25 * beaconPulse})`;
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(w, horizon);
    ctx.stroke();
  }
  if (typeof window !== "undefined") {
    window.initCarbonSkyline = initCarbonSkyline;
    const autoInitSkyline = () => {
      const hero = document.querySelector(".hero-section");
      if (hero && !hero._skylineInit) {
        hero._skylineInit = true;
        window.carbonSkylineInstance = initCarbonSkyline(hero, "hero");
      }
      const macro = document.getElementById("macro-threat");
      if (macro && !macro._skylineInit) {
        macro._skylineInit = true;
        initCarbonSkyline(macro, "dyeing");
      }
      const pipeline = document.getElementById("pipeline");
      if (pipeline && !pipeline._skylineInit) {
        pipeline._skylineInit = true;
        initCarbonSkyline(pipeline, "power");
      }
      const forensics = document.getElementById("forensics");
      if (forensics && !forensics._skylineInit) {
        forensics._skylineInit = true;
        window.forensicsSkylineInstance = initCarbonSkyline(forensics, "boiler");
      }
      const secrecy = document.getElementById("secrecy");
      if (secrecy && !secrecy._skylineInit) {
        secrecy._skylineInit = true;
        initCarbonSkyline(secrecy, "spinning");
      }
      const pilots = document.getElementById("pilots");
      if (pilots && !pilots._skylineInit) {
        pilots._skylineInit = true;
        initCarbonSkyline(pilots, "cluster");
      }
      const modules = document.getElementById("modules");
      if (modules && !modules._skylineInit) {
        modules._skylineInit = true;
        initCarbonSkyline(modules, "terminal");
      }
      const customBgs = document.querySelectorAll(".carbon-skyline-bg");
      customBgs.forEach((el) => {
        if (!el._skylineInit) {
          el._skylineInit = true;
          const v = el.getAttribute("data-skyline") || "cluster";
          initCarbonSkyline(el, v);
        }
      });
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoInitSkyline);
    } else {
      autoInitSkyline();
    }
  }
  return __toCommonJS(carbon_skyline_exports);
})();
