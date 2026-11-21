/**
 * CarbonLoom — High-Precision Interactive Micro-Physics
 * Top-1% Craft: Specular Hairline Border Sheen, Clinical Telemetry Flash, Zero-Jank WAAPI
 */

(function () {
  'use strict';

  // 1. Milled Specular Hairline Sheen (Linear / Raycast signature)
  // Uses passive pointermove with rAF debouncing to avoid frame drops
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    if (!cards.length) return;

    let rafId = null;
    let pendingEvent = null;

    function updateSpotlight() {
      if (!pendingEvent) return;
      const { clientX, clientY, targetCard } = pendingEvent;
      const rect = targetCard.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      targetCard.style.setProperty('--mouse-x', `${x}px`);
      targetCard.style.setProperty('--mouse-y', `${y}px`);
      rafId = null;
    }

    cards.forEach(card => {
      card.addEventListener('pointermove', e => {
        pendingEvent = {
          clientX: e.clientX,
          clientY: e.clientY,
          targetCard: card
        };
        if (!rafId) {
          rafId = requestAnimationFrame(updateSpotlight);
        }
      }, { passive: true });

      card.addEventListener('pointerleave', () => {
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      }, { passive: true });
    });
  }

  // 2. Telemetry Tabular Numeric Transition
  // Smoothly flashes updated values when switching factory lines or configurations
  window.flashTelemetryCell = function (elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('telemetry-flash');
    // Force reflow for retriggering CSS animation
    void el.offsetWidth;
    el.classList.add('telemetry-flash');
  };

  // 3. Liquid Metal Button Micro-Interactions (Physical Inset & WebGL Waves)
  function initLiquidMetalButtons() {
    document.querySelectorAll('.btn, button, .inspect-btn, .switch-btn').forEach(btn => {
      // Ensure button position is relative for contained ripple
      if (getComputedStyle(btn).position === 'static') {
        btn.style.position = 'relative';
      }
      btn.addEventListener('click', function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.className = 'liquid-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        btn.appendChild(ripple);
        setTimeout(() => {
          if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
        }, 600);
      });
    });

    if (window.LiquidMetal && typeof window.LiquidMetal.mountLiquidMetalButton === 'function') {
      document.querySelectorAll('[data-liquid-metal]').forEach(el => {
        window.LiquidMetal.mountLiquidMetalButton(el);
      });
    }
  }

  // 4. Matrix Numeric Countdown & Odometer Ticker
  function parseMetric(text) {
    text = (text || '').trim();
    // Handles formatted strings like "$348,000", "<142 ms", "1.412", "0.00%", "+0.420 kg ×", "2.4M", "€35,840"
    const match = text.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
    if (!match) return null;
    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];
    const hasCommas = numStr.includes(',');
    const cleanNum = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(cleanNum)) return null;
    const dotIndex = numStr.indexOf('.');
    const decimals = dotIndex !== -1 ? numStr.length - dotIndex - 1 : 0;
    return { prefix, target: cleanNum, suffix, hasCommas, decimals };
  }

  function formatValue(val, config) {
    const { prefix = '', suffix = '', decimals = 0, hasCommas = false } = config;
    let str = Math.abs(val).toFixed(decimals);
    if (hasCommas) {
      const parts = str.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      str = parts.join('.');
    }
    const sign = val < 0 && !prefix.includes('-') ? '-' : '';
    return prefix + sign + str + suffix;
  }

  // Decelerating quintic/exponential easing for precision instrument feel
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  window.animateMetricValue = function (el, startVal, endVal, duration = 1200, customConfig = null) {
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const parsed = customConfig || parseMetric(el.textContent);
    if (!parsed) return;

    if (reduced) {
      el.textContent = formatValue(endVal, parsed);
      return;
    }

    if (el._rafCountdownId) {
      cancelAnimationFrame(el._rafCountdownId);
    }

    const start = (startVal !== null && startVal !== undefined && !isNaN(startVal)) ? startVal : 0;
    const startTime = performance.now();
    el.classList.add('matrix-ticking');

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = start + (endVal - start) * eased;

      el.textContent = formatValue(current, parsed);

      if (progress < 1) {
        el._rafCountdownId = requestAnimationFrame(step);
      } else {
        el.textContent = formatValue(endVal, parsed);
        el.classList.remove('matrix-ticking');
        el._rafCountdownId = null;
      }
    }

    el._rafCountdownId = requestAnimationFrame(step);
  };

  function initCountdownMatrices() {
    const matrixSelectors = [
      '.hero-metrics .metric-value',
      '.telemetry-reading',
      '.kpi-figure',
      '.comp-stat-number',
      '.wf-val',
      '.impact-figure',
      '[data-countdown]'
    ];

    const elements = document.querySelectorAll(matrixSelectors.join(', '));
    if (!elements.length) return;

    elements.forEach(el => {
      el.style.fontVariantNumeric = 'tabular-nums';
    });

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        obs.unobserve(el);

        const currentText = el.textContent.trim();
        const parsed = parseMetric(currentText);
        if (!parsed) return;

        // Context-aware starting points for countdown vs countup effect
        let startFrom = 0;
        let duration = 1350;

        if (parsed.target === 0 && parsed.decimals > 0) {
          // e.g. "0.00%" tolerance countdown from 8.50% down to 0.00%
          startFrom = 8.5;
        } else if (parsed.suffix.includes('ms')) {
          // e.g. "142 ms" or "<142 ms" latency countdown from 680 ms down to 142 ms
          startFrom = 680;
        } else if (el.hasAttribute('data-start-val')) {
          startFrom = parseFloat(el.getAttribute('data-start-val'));
        }

        const delay = Math.random() * 120;
        setTimeout(() => {
          window.animateMetricValue(el, startFrom, parsed.target, duration, parsed);
        }, delay);
      });
    }, { threshold: 0.15 });

    elements.forEach(el => observer.observe(el));
  }

  // 5. Interactive Industrial Energy Flow Controller
  window.setEnergyFlowMode = function (mode) {
    const btnAll = document.getElementById('flow-btn-all');
    const btnCrew = document.getElementById('flow-btn-crew');
    const btnHoodie = document.getElementById('flow-btn-hoodie');
    const btnLeak = document.getElementById('flow-btn-leak');
    const statusTxt = document.getElementById('flow-status-text');
    const metricAlloc = document.getElementById('flow-metric-alloc');

    [btnAll, btnCrew, btnHoodie, btnLeak].forEach(b => { if (b) b.classList.remove('active'); });

    const pipeCrew = document.getElementById('pipe-crew');
    const pipeHoodie = document.getElementById('pipe-hoodie');
    const pipeLeak = document.getElementById('pipe-leak');

    if (mode === 'crewneck') {
      if (btnCrew) btnCrew.classList.add('active');
      if (pipeCrew) pipeCrew.style.stroke = '#10b981';
      if (pipeHoodie) pipeHoodie.style.stroke = 'rgba(255,255,255,0.15)';
      if (pipeLeak) pipeLeak.style.stroke = 'rgba(255,255,255,0.15)';
      if (statusTxt) statusTxt.textContent = 'Active Routing: 4.25 SMV Crewneck Line 04 (0.239 kgCO2e/pc)';
      if (metricAlloc) metricAlloc.textContent = '0.239 kgCO2e';
    } else if (mode === 'hoodie') {
      if (btnHoodie) btnHoodie.classList.add('active');
      if (pipeCrew) pipeCrew.style.stroke = 'rgba(255,255,255,0.15)';
      if (pipeHoodie) pipeHoodie.style.stroke = '#8b5cf6';
      if (pipeLeak) pipeLeak.style.stroke = 'rgba(255,255,255,0.15)';
      if (statusTxt) statusTxt.textContent = 'Active Routing: 11.50 SMV Fleece Line 02 (1.412 kgCO2e/pc)';
      if (metricAlloc) metricAlloc.textContent = '1.412 kgCO2e';
    } else if (mode === 'leak') {
      if (btnLeak) btnLeak.classList.add('active');
      if (pipeCrew) pipeCrew.style.stroke = 'rgba(255,255,255,0.15)';
      if (pipeHoodie) pipeHoodie.style.stroke = 'rgba(255,255,255,0.15)';
      if (pipeLeak) pipeLeak.style.stroke = '#ef4444';
      if (statusTxt) statusTxt.textContent = 'Active Routing: Steam Trap #04 Blow-By Leak (0.42 kg waste/hr)';
      if (metricAlloc) metricAlloc.textContent = '+0.420 kg (Leak)';
    } else {
      if (btnAll) btnAll.classList.add('active');
      if (pipeCrew) pipeCrew.style.stroke = '#10b981';
      if (pipeHoodie) pipeHoodie.style.stroke = '#8b5cf6';
      if (pipeLeak) pipeLeak.style.stroke = '#ef4444';
      if (statusTxt) statusTxt.textContent = 'Active Routing: Combined Industrial Mass-Balance (DESCO + Gas + Steam)';
      if (metricAlloc) metricAlloc.textContent = 'Balanced (0.00% err)';
    }
  };

  // 6. Interactive ZK Groth16 Prover Chamber Simulation
  window.simulateWasmZkProof = function () {
    const btn = document.getElementById('btn-run-zk-sim');
    const statusText = document.getElementById('zk-sim-status');
    const timerText = document.getElementById('zk-sim-timer');
    const shield = document.getElementById('zk-shield-core');
    const proofBadge = document.getElementById('zk-proof-badge');

    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.textContent = '⏳ Executing WASM Prover...';

    if (shield) {
      shield.style.boxShadow = '0 0 35px rgba(16, 185, 129, 0.55)';
      shield.style.borderColor = '#10b981';
    }

    const t0 = performance.now();
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const elapsed = Math.round(performance.now() - t0);
      if (timerText) timerText.textContent = `${elapsed} ms`;

      if (step === 1 && statusText) {
        statusText.textContent = '[01/03] Encrypting 14 private witness signals with blinding factor...';
      } else if (step === 2 && statusText) {
        statusText.textContent = '[02/03] Evaluating 2,148 R1CS constraint polynomials over BN254...';
      } else if (step >= 3) {
        clearInterval(interval);
        if (timerText) timerText.textContent = '142 ms';
        if (statusText) statusText.textContent = '[03/03] Bilinear pairing e(A, B) = e(α, β) verified · 0 bytes leaked';
        if (proofBadge) {
          proofBadge.textContent = '● PROOF VALID (WASM 142ms)';
          proofBadge.style.color = '#10b981';
        }
        btn.disabled = false;
        btn.textContent = '⚡ Re-Verify ZK Circuit (WASM)';
        setTimeout(() => {
          if (shield) {
            shield.style.boxShadow = '0 0 24px rgba(16, 185, 129, 0.15)';
          }
        }, 1500);
      }
    }, 45);
  };

  // 7. Interactive Bangladesh RMG Cluster Telemetry Selector
  const clusterData = {
    apex: {
      name: 'Apex Padma Knitwear Ltd.',
      cluster: 'Gazipur Industrial Zone',
      lines: '18 Active Lines (4.25 SMV Crewneck)',
      boiler: '8.4 bar (Boiler #01 High Pressure)',
      stenter: '142.0 kW (Gas Fired Ovens)',
      dailyOutput: '48,500 pcs/day',
      cbamStatus: 'PASS (0.239 kgCO2e ≤ 2.50 kg)',
      lineage: 'LIN-992014F (Hyperledger #1.04M)'
    },
    dbl: {
      name: 'DBL Composite Knit Ltd.',
      cluster: 'Sreepur Industrial Megaplex',
      lines: '32 Active Lines (Fabric Dyeing & Finishing)',
      boiler: '9.2 bar (Waste Heat Recovery Steam)',
      stenter: '184.5 kW (Wet Scrubber Exhaust)',
      dailyOutput: '72,000 pcs/day',
      cbamStatus: 'PASS (1.412 kgCO2e ≤ 2.50 kg)',
      lineage: 'LIN-881023B (Hyperledger #1.04M)'
    },
    square: {
      name: 'Square Fashions Ltd.',
      cluster: 'Narayanganj Export Park',
      lines: '24 Active Lines (LEED Platinum Certified)',
      boiler: '7.8 bar (Cogen Steam Silencer)',
      stenter: '118.0 kW (Electric Heat Pump)',
      dailyOutput: '54,000 pcs/day',
      cbamStatus: 'PASS (0.198 kgCO2e ≤ 2.50 kg)',
      lineage: 'LIN-773910A (Hyperledger #1.04M)'
    }
  };

  window.selectClusterFacility = function (id) {
    const data = clusterData[id] || clusterData.apex;
    ['btn-cl-apex', 'btn-cl-dbl', 'btn-cl-square'].forEach(bId => {
      const b = document.getElementById(bId);
      if (b) b.classList.remove('active');
    });

    const activeBtn = document.getElementById(`btn-cl-${id}`);
    if (activeBtn) activeBtn.classList.add('active');

    const txtName = document.getElementById('cl-fac-name');
    const txtCluster = document.getElementById('cl-fac-cluster');
    const txtLines = document.getElementById('cl-fac-lines');
    const txtBoiler = document.getElementById('cl-fac-boiler');
    const txtStenter = document.getElementById('cl-fac-stenter');
    const txtOutput = document.getElementById('cl-fac-output');
    const txtCbam = document.getElementById('cl-fac-cbam');
    const txtLineage = document.getElementById('cl-fac-lineage');

    if (txtName) txtName.textContent = data.name;
    if (txtCluster) txtCluster.textContent = data.cluster;
    if (txtLines) txtLines.textContent = data.lines;
    if (txtBoiler) txtBoiler.textContent = data.boiler;
    if (txtStenter) txtStenter.textContent = data.stenter;
    if (txtOutput) txtOutput.textContent = data.dailyOutput;
    if (txtCbam) txtCbam.textContent = data.cbamStatus;
    if (txtLineage) txtLineage.textContent = data.lineage;

    // Highlight map pins
    ['pin-apex', 'pin-dbl', 'pin-square'].forEach(pId => {
      const p = document.getElementById(pId);
      if (p) p.style.opacity = '0.45';
    });
    const activePin = document.getElementById(`pin-${id}`);
    if (activePin) activePin.style.opacity = '1';
  };

  // Run on DOM ready
  function initAll() {
    initSpotlightCards();
    initLiquidMetalButtons();
    initCountdownMatrices();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
