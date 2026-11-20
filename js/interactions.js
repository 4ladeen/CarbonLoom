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
