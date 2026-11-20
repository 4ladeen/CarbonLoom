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
  function initCarbonSkyline(container) {
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
    const stacks = [
      { relX: 0.08, topY: 0, width: 14, height: 165, active: true, beacon: true, name: "Boiler 01 Primary" },
      { relX: 0.22, topY: 0, width: 10, height: 120, active: true, beacon: false, name: "Stenter 01 Exhaust" },
      { relX: 0.38, topY: 0, width: 12, height: 145, active: true, beacon: true, name: "Stenter 02 Finishing" },
      { relX: 0.72, topY: 0, width: 18, height: 195, active: true, beacon: true, name: "Thermal Oil Header" },
      { relX: 0.9, topY: 0, width: 14, height: 155, active: true, beacon: true, name: "Central Heat Plant" }
    ];
    const particles = [];
    const maxParticles = reducedMotion ? 0 : 220;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const horizon = h * 0.91;
      stacks.forEach((s) => {
        s.topY = horizon - s.height;
      });
    };
    const spawnParticle = (stackIdx) => {
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
    const preSeedParticles = () => {
      if (reducedMotion) return;
      for (let step = 0; step < 180; step++) {
        for (let i = 0; i < stacks.length; i++) {
          if (stacks[i].active && Math.random() < 0.35) {
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
    const drawSkyline = (ctx2, time) => {
      const horizon = h * 0.91;
      ctx2.fillStyle = "rgba(16, 18, 24, 0.75)";
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.moveTo(0, horizon);
      ctx2.lineTo(0, horizon - 55);
      ctx2.lineTo(w * 0.06, horizon - 55);
      ctx2.lineTo(w * 0.14, horizon - 85);
      ctx2.lineTo(w * 0.17, horizon - 85);
      ctx2.lineTo(w * 0.25, horizon - 50);
      ctx2.lineTo(w * 0.32, horizon - 70);
      ctx2.lineTo(w * 0.46, horizon - 70);
      ctx2.lineTo(w * 0.52, horizon - 45);
      ctx2.lineTo(w * 0.64, horizon - 90);
      ctx2.lineTo(w * 0.7, horizon - 90);
      ctx2.lineTo(w * 0.78, horizon - 110);
      ctx2.lineTo(w * 0.85, horizon - 65);
      ctx2.lineTo(w * 0.94, horizon - 75);
      ctx2.lineTo(w, horizon - 50);
      ctx2.lineTo(w, horizon);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      const ctX = w * 0.55;
      const ctBase = horizon;
      const ctTop = horizon - 75;
      const ctW1 = 28;
      const ctW2 = 18;
      ctx2.fillStyle = "rgba(14, 16, 21, 0.85)";
      ctx2.beginPath();
      ctx2.moveTo(ctX - ctW1, ctBase);
      ctx2.quadraticCurveTo(ctX - ctW2 * 0.7, horizon - 40, ctX - ctW2, ctTop);
      ctx2.lineTo(ctX + ctW2, ctTop);
      ctx2.quadraticCurveTo(ctX + ctW2 * 0.7, horizon - 40, ctX + ctW1, ctBase);
      ctx2.closePath();
      ctx2.fill();
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx2.stroke();
      ctx2.fillStyle = "rgba(11, 13, 17, 0.96)";
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.09)";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.moveTo(0, h);
      ctx2.lineTo(0, horizon);
      let curX = 0;
      ctx2.lineTo(curX, horizon - 35);
      const toothCount = 4;
      const toothStep = w * 0.16 / toothCount;
      for (let i = 0; i < toothCount; i++) {
        curX += toothStep * 0.75;
        ctx2.lineTo(curX, horizon - 65);
        curX += toothStep * 0.25;
        ctx2.lineTo(curX, horizon - 35);
      }
      const s0 = stacks[0];
      const s0X = s0.relX * w;
      ctx2.lineTo(s0X - 14, horizon - 45);
      ctx2.lineTo(s0X - 14, s0.topY + 35);
      ctx2.lineTo(s0X, s0.topY);
      ctx2.lineTo(s0X + s0.width, s0.topY);
      ctx2.lineTo(s0X + s0.width + 12, s0.topY + 35);
      ctx2.lineTo(s0X + s0.width + 24, horizon - 45);
      const s1 = stacks[1];
      const s1X = s1.relX * w;
      ctx2.lineTo(s1X - 10, horizon - 45);
      ctx2.lineTo(s1X - 6, s1.topY + 25);
      ctx2.lineTo(s1X, s1.topY);
      ctx2.lineTo(s1X + s1.width, s1.topY);
      ctx2.lineTo(s1X + s1.width + 8, s1.topY + 25);
      ctx2.lineTo(s1X + s1.width + 16, horizon - 40);
      ctx2.lineTo(w * 0.3, horizon - 40);
      ctx2.lineTo(w * 0.3, horizon - 55);
      ctx2.lineTo(w * 0.35, horizon - 55);
      ctx2.lineTo(w * 0.35, horizon - 40);
      const s2 = stacks[2];
      const s2X = s2.relX * w;
      ctx2.lineTo(s2X - 10, horizon - 40);
      ctx2.lineTo(s2X, s2.topY);
      ctx2.lineTo(s2X + s2.width, s2.topY);
      ctx2.lineTo(s2X + s2.width + 10, horizon - 40);
      ctx2.lineTo(w * 0.44, horizon - 40);
      ctx2.lineTo(w * 0.44, horizon - 75);
      ctx2.lineTo(w * 0.52, horizon - 75);
      ctx2.lineTo(w * 0.52, horizon - 50);
      ctx2.lineTo(w * 0.65, horizon - 50);
      const s3 = stacks[3];
      const s3X = s3.relX * w;
      ctx2.lineTo(s3X - 25, horizon - 55);
      ctx2.lineTo(s3X - 25, s3.topY + 50);
      ctx2.lineTo(s3X, s3.topY);
      ctx2.lineTo(s3X + s3.width, s3.topY);
      ctx2.lineTo(s3X + s3.width + 18, s3.topY + 50);
      ctx2.lineTo(s3X + s3.width + 32, horizon - 55);
      const s4 = stacks[4];
      const s4X = s4.relX * w;
      ctx2.lineTo(s4X - 16, horizon - 48);
      ctx2.lineTo(s4X, s4.topY);
      ctx2.lineTo(s4X + s4.width, s4.topY);
      ctx2.lineTo(s4X + s4.width + 14, horizon - 48);
      ctx2.lineTo(w, horizon - 40);
      ctx2.lineTo(w, h);
      ctx2.closePath();
      ctx2.fill();
      ctx2.stroke();
      const windowColors = [
        "rgba(245, 158, 11, 0.18)",
        // warm tungsten
        "rgba(220, 230, 245, 0.14)",
        // clean inspection white
        "rgba(16, 185, 129, 0.14)"
        // control room emerald
      ];
      const labX1 = w * 0.45;
      const labX2 = w * 0.51;
      for (let wy = horizon - 70; wy <= horizon - 55; wy += 7) {
        for (let wx = labX1; wx < labX2; wx += 9) {
          ctx2.fillStyle = (wx + wy) % 2 === 0 ? windowColors[1] : windowColors[0];
          ctx2.fillRect(wx, wy, 5, 4);
        }
      }
      curX = 0;
      for (let i = 0; i < toothCount; i++) {
        const toothApex = curX + toothStep * 0.75;
        const toothBase = curX + toothStep;
        ctx2.fillStyle = windowColors[0];
        ctx2.beginPath();
        ctx2.moveTo(toothApex, horizon - 63);
        ctx2.lineTo(toothBase, horizon - 37);
        ctx2.lineTo(toothApex, horizon - 37);
        ctx2.closePath();
        ctx2.fill();
        curX += toothStep;
      }
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx2.lineWidth = 1;
      ctx2.beginPath();
      ctx2.moveTo(s0X + s0.width + 24, horizon - 40);
      ctx2.lineTo(s1X - 10, horizon - 40);
      ctx2.moveTo(s0X + s0.width + 24, horizon - 36);
      ctx2.lineTo(s1X - 10, horizon - 36);
      const pipeSpan = s1X - 10 - (s0X + s0.width + 24);
      for (let px = s0X + s0.width + 45; px < s1X - 20; px += 35) {
        ctx2.moveTo(px, horizon - 36);
        ctx2.lineTo(px, horizon);
      }
      ctx2.stroke();
      stacks.forEach((s) => {
        const sx = s.relX * w;
        ctx2.strokeStyle = "rgba(255, 255, 255, 0.08)";
        for (let y = s.topY + 18; y < horizon - 20; y += 22) {
          ctx2.beginPath();
          ctx2.moveTo(sx - 2, y);
          ctx2.lineTo(sx + s.width + 2, y);
          ctx2.stroke();
        }
        ctx2.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx2.beginPath();
        ctx2.moveTo(sx + 2, s.topY + 12);
        ctx2.lineTo(sx + 2, horizon - 15);
        ctx2.stroke();
      });
      const beaconPulse = (Math.sin(time * 35e-4) + 1) * 0.5;
      stacks.forEach((s) => {
        if (s.beacon) {
          const bx = s.relX * w + s.width / 2;
          const by = s.topY - 2;
          const haloGrad = ctx2.createRadialGradient(bx, by, 0, bx, by, 8);
          haloGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 * beaconPulse})`);
          haloGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
          ctx2.fillStyle = haloGrad;
          ctx2.beginPath();
          ctx2.arc(bx, by, 8, 0, Math.PI * 2);
          ctx2.fill();
          ctx2.fillStyle = `rgba(255, 120, 120, ${0.75 + 0.25 * beaconPulse})`;
          ctx2.beginPath();
          ctx2.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx2.fill();
        }
      });
      ctx2.strokeStyle = "rgba(255, 255, 255, 0.11)";
      ctx2.beginPath();
      ctx2.moveTo(0, horizon);
      ctx2.lineTo(w, horizon);
      ctx2.stroke();
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
      drawSkyline(ctx, time);
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
  if (typeof window !== "undefined") {
    window.initCarbonSkyline = initCarbonSkyline;
    const autoInit = () => {
      const hero = document.querySelector(".hero-section");
      if (hero && !window.carbonSkylineInstance) {
        window.carbonSkylineInstance = initCarbonSkyline(hero);
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", autoInit);
    } else {
      autoInit();
    }
  }
  return __toCommonJS(carbon_skyline_exports);
})();
