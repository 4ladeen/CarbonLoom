import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";

// Inject required global styles for shader canvas and ripples
if (typeof document !== "undefined") {
  const styleId = "shader-canvas-style-exploded";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .shader-container-exploded canvas {
        width: 100% !important;
        height: 100% !important;
        display: block !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        border-radius: 100px !important;
      }
      @keyframes ripple-animation {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0.6;
        }
        100% {
          transform: translate(-50%, -50%) scale(4);
          opacity: 0;
        }
      }
      .liquid-metal-btn-wrap {
        position: relative;
        display: inline-block;
        perspective: 1000px;
        perspective-origin: 50% 50%;
        vertical-align: middle;
      }
      .liquid-metal-btn-chassis {
        position: relative;
        transform-style: preserve-3d;
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease;
      }
    `;
    document.head.appendChild(style);
  }
}

let rippleCounter = 0;

export function mountLiquidMetalButton(element: HTMLElement, options: {
  label?: string;
  viewMode?: "text" | "icon";
  onClick?: () => void;
  width?: number;
  height?: number;
} = {}) {
  const viewMode = options.viewMode || (element.getAttribute("data-view-mode") as any) || "text";
  const label = options.label || element.getAttribute("data-label") || element.textContent?.trim() || "Action";
  const isIcon = viewMode === "icon";

  const width = options.width || (isIcon ? 46 : Math.max(142, label.length * 9 + 48));
  const height = options.height || 46;
  const innerWidth = width - 4;
  const innerHeight = height - 4;

  element.innerHTML = `
    <div class="liquid-metal-btn-wrap" style="width: ${width}px; height: ${height}px;">
      <div class="liquid-metal-btn-chassis" style="width: ${width}px; height: ${height}px;">
        <!-- Foreground Label / Icon (Z = 20px) -->
        <div class="liquid-fg" style="position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; display: flex; align-items: center; justify-content: center; gap: 6px; transform-style: preserve-3d; transform: translateZ(20px); z-index: 30; pointer-events: none;">
          ${isIcon ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.5));">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/>
              <path d="M19 17v4"/>
              <path d="M3 5h4"/>
              <path d="M17 19h4"/>
            </svg>
          ` : `
            <span style="font-size: 13.5px; color: #8e8f96; font-weight: 500; text-shadow: 0px 1px 2px rgba(0,0,0,0.7); white-space: nowrap; font-family: var(--font-sans, inherit);">
              ${label}
            </span>
          `}
        </div>

        <!-- Middle Gradient Layer (Z = 10px) -->
        <div class="liquid-mid" style="position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; transform-style: preserve-3d; transform: translateZ(10px); z-index: 20;">
          <div class="liquid-mid-inner" style="width: ${innerWidth}px; height: ${innerHeight}px; margin: 2px; border-radius: 100px; background: linear-gradient(180deg, #1b1d26 0%, #070709 100%); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255, 255, 255, 0.08);"></div>
        </div>

        <!-- Bottom WebGL Shader Canvas Layer (Z = 0px) -->
        <div class="liquid-base" style="position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; transform-style: preserve-3d; transform: translateZ(0px); z-index: 10;">
          <div class="liquid-base-outer" style="height: ${height}px; width: ${width}px; border-radius: 100px; box-shadow: 0px 0px 0px 1px rgba(0,0,0,0.4), 0px 12px 24px rgba(0,0,0,0.5); background: rgb(0 0 0 / 0);">
            <div class="shader-mount-host shader-container-exploded" style="border-radius: 100px; overflow: hidden; position: relative; width: ${width}px; height: ${height}px;"></div>
          </div>
        </div>

        <!-- Interactive Click Layer (Z = 25px) -->
        <button type="button" class="liquid-click-trigger" style="position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px; background: transparent; border: none; cursor: pointer; outline: none; z-index: 40; transform-style: preserve-3d; transform: translateZ(25px); overflow: hidden; border-radius: 100px;" aria-label="${label}">
        </button>
      </div>
    </div>
  `;

  const host = element.querySelector(".shader-mount-host") as HTMLDivElement;
  const trigger = element.querySelector(".liquid-click-trigger") as HTMLButtonElement;
  const midInner = element.querySelector(".liquid-mid-inner") as HTMLDivElement;
  const chassis = element.querySelector(".liquid-metal-btn-chassis") as HTMLDivElement;
  const mid = element.querySelector(".liquid-mid") as HTMLDivElement;
  const base = element.querySelector(".liquid-base") as HTMLDivElement;

  let shaderMount: any = null;

  try {
    if (host) {
      shaderMount = new ShaderMount(
        host,
        liquidMetalFragmentShader,
        {
          u_repetition: 4,
          u_softness: 0.5,
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0,
          u_contour: 0,
          u_angle: 45,
          u_scale: 8,
          u_shape: 1,
          u_offsetX: 0.1,
          u_offsetY: -0.1,
        },
        undefined,
        0.6
      );
    }
  } catch (err) {
    console.warn("[LiquidMetalButton] Shader initialization skipped (fallback applied):", err);
  }

  // Hover interactions
  trigger.addEventListener("mouseenter", () => {
    shaderMount?.setSpeed?.(1);
  });

  trigger.addEventListener("mouseleave", () => {
    shaderMount?.setSpeed?.(0.6);
    mid.style.transform = "translateZ(10px) translateY(0) scale(1)";
    base.style.transform = "translateZ(0px) translateY(0) scale(1)";
    midInner.style.boxShadow = "none";
  });

  trigger.addEventListener("mousedown", () => {
    mid.style.transform = "translateZ(10px) translateY(1px) scale(0.98)";
    base.style.transform = "translateZ(0px) translateY(1px) scale(0.98)";
    midInner.style.boxShadow = "inset 0px 2px 4px rgba(0, 0, 0, 0.6), inset 0px 1px 2px rgba(0, 0, 0, 0.4)";
  });

  trigger.addEventListener("mouseup", () => {
    mid.style.transform = "translateZ(10px) translateY(0) scale(1)";
    base.style.transform = "translateZ(0px) translateY(0) scale(1)";
    midInner.style.boxShadow = "none";
  });

  // Click ripple and burst
  trigger.addEventListener("click", (e: MouseEvent) => {
    if (shaderMount?.setSpeed) {
      shaderMount.setSpeed(2.4);
      setTimeout(() => {
        shaderMount.setSpeed(0.6);
      }, 350);
    }

    const rect = trigger.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement("span");
    ripple.id = "ripple-" + rippleCounter++;
    ripple.style.position = "absolute";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = "20px";
    ripple.style.height = "20px";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(255, 255, 255, 0) 70%)";
    ripple.style.pointerEvents = "none";
    ripple.style.animation = "ripple-animation 0.6s ease-out";
    trigger.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    if (options.onClick) {
      options.onClick();
    }
  });

  return {
    destroy: () => {
      shaderMount?.destroy?.();
    }
  };
}

// Auto-scan DOM on load
if (typeof window !== "undefined") {
  (window as any).mountLiquidMetalButton = mountLiquidMetalButton;

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-liquid-metal]").forEach((el) => {
      mountLiquidMetalButton(el as HTMLElement);
    });
  });
}
