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

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlightCards);
  } else {
    initSpotlightCards();
  }
})();
