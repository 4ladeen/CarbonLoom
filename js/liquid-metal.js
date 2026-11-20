"use strict";
var LiquidMetal = (() => {
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

  // scripts/liquid-metal-enhancer.ts
  var liquid_metal_enhancer_exports = {};
  __export(liquid_metal_enhancer_exports, {
    mountLiquidMetalButton: () => mountLiquidMetalButton
  });

  // node_modules/@paper-design/shaders/dist/vertex-shader.js
  var vertexShaderSource = `#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;

  // node_modules/@paper-design/shaders/dist/shader-mount.js
  var DEFAULT_MAX_PIXEL_COUNT = 1920 * 1080 * 4;
  var ShaderMount = class {
    parentElement;
    canvasElement;
    gl;
    program = null;
    uniformLocations = {};
    /** The fragment shader that we are using */
    fragmentShader;
    /** Stores the RAF for the render loop */
    rafId = null;
    /** Time of the last rendered frame */
    lastRenderTime = 0;
    /** Total time that we have played any animation, passed as a uniform to the shader for time-based VFX */
    currentFrame = 0;
    /** The speed that we progress through animation time (multiplies by delta time every update). Allows negatives to play in reverse. If set to 0, rAF will stop entirely so static shaders have no recurring performance costs */
    speed = 0;
    /** Actual speed used that accounts for visibility: we pause the shader if the tab is hidden or the element out of the viewport */
    currentSpeed = 0;
    /** Uniforms that are provided by the user for the specific shader being mounted (not including uniforms that this Mount adds, like time and resolution) */
    providedUniforms;
    /** Names of the uniforms that should have mipmaps generated for them */
    mipmaps = [];
    /** Just a sanity check to make sure frames don't run after we're disposed */
    hasBeenDisposed = false;
    /** If the resolution of the canvas has changed since the last render */
    resolutionChanged = true;
    /** Store textures that are provided by the user */
    textures = /* @__PURE__ */ new Map();
    minPixelRatio;
    maxPixelCount;
    isSafari = isSafari();
    uniformCache = {};
    textureUnitMap = /* @__PURE__ */ new Map();
    ownerDocument;
    constructor(parentElement, fragmentShader, uniforms, webGlContextAttributes, speed = 0, frame = 0, minPixelRatio = 2, maxPixelCount = DEFAULT_MAX_PIXEL_COUNT, mipmaps = []) {
      if (parentElement?.nodeType === 1) {
        this.parentElement = parentElement;
      } else {
        throw new Error("Paper Shaders: parent element must be an HTMLElement");
      }
      this.ownerDocument = parentElement.ownerDocument;
      if (!this.ownerDocument.querySelector("style[data-paper-shader]")) {
        const styleElement = this.ownerDocument.createElement("style");
        styleElement.innerHTML = defaultStyle;
        styleElement.setAttribute("data-paper-shader", "");
        this.ownerDocument.head.prepend(styleElement);
      }
      const canvasElement = this.ownerDocument.createElement("canvas");
      this.canvasElement = canvasElement;
      this.parentElement.prepend(canvasElement);
      this.fragmentShader = fragmentShader;
      this.providedUniforms = uniforms;
      this.mipmaps = mipmaps;
      this.currentFrame = frame;
      this.minPixelRatio = minPixelRatio;
      this.maxPixelCount = maxPixelCount;
      const gl = canvasElement.getContext("webgl2", {
        antialias: false,
        depth: false,
        stencil: false,
        ...webGlContextAttributes
      });
      if (!gl) {
        throw new Error("Paper Shaders: WebGL is not supported in this browser");
      }
      this.gl = gl;
      this.initProgram();
      this.setupPositionAttribute();
      this.setupUniforms();
      this.setUniformValues(this.providedUniforms);
      this.setupResizeObserver();
      visualViewport?.addEventListener("resize", this.handleVisualViewportChange);
      this.setupIntersectionObserver();
      this.setSpeed(speed);
      this.parentElement.setAttribute("data-paper-shader", "");
      this.parentElement.paperShaderMount = this;
      this.ownerDocument.addEventListener("visibilitychange", this.handleDocumentVisibilityChange);
    }
    initProgram = () => {
      const program = createProgram(this.gl, vertexShaderSource, this.fragmentShader);
      if (!program) return;
      this.program = program;
      this.gl.useProgram(program);
    };
    setupPositionAttribute = () => {
      const positionAttributeLocation = this.gl.getAttribLocation(this.program, "a_position");
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
      this.gl.enableVertexAttribArray(positionAttributeLocation);
      this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
    };
    setupUniforms = () => {
      const uniformLocations = {
        u_time: this.gl.getUniformLocation(this.program, "u_time"),
        u_pixelRatio: this.gl.getUniformLocation(this.program, "u_pixelRatio"),
        u_resolution: this.gl.getUniformLocation(this.program, "u_resolution")
      };
      Object.entries(this.providedUniforms).forEach(([key, value]) => {
        uniformLocations[key] = this.gl.getUniformLocation(this.program, key);
        if (value instanceof HTMLImageElement) {
          const aspectRatioUniformName = `${key}AspectRatio`;
          uniformLocations[aspectRatioUniformName] = this.gl.getUniformLocation(this.program, aspectRatioUniformName);
        }
      });
      this.uniformLocations = uniformLocations;
    };
    /**
     * The scale that we should render at.
     * - Used to target 2x rendering even on 1x screens for better antialiasing
     * - Prevents the virtual resolution from going beyond the maximum resolution
     * - Accounts for the page zoom level so we render in physical device pixels rather than CSS pixels
     */
    renderScale = 1;
    parentWidth = 0;
    parentHeight = 0;
    parentDevicePixelWidth = 0;
    parentDevicePixelHeight = 0;
    devicePixelsSupported = false;
    intersectionObserver = null;
    isInViewport = true;
    resizeObserver = null;
    setupResizeObserver = () => {
      this.resizeObserver = new ResizeObserver(([entry]) => {
        if (entry?.borderBoxSize[0]) {
          const physicalPixelSize = entry.devicePixelContentBoxSize?.[0];
          if (physicalPixelSize !== void 0) {
            this.devicePixelsSupported = true;
            this.parentDevicePixelWidth = physicalPixelSize.inlineSize;
            this.parentDevicePixelHeight = physicalPixelSize.blockSize;
          }
          this.parentWidth = entry.borderBoxSize[0].inlineSize;
          this.parentHeight = entry.borderBoxSize[0].blockSize;
        }
        this.handleResize();
      });
      this.resizeObserver.observe(this.parentElement);
    };
    setupIntersectionObserver = () => {
      const view = this.ownerDocument.defaultView;
      if (!view?.IntersectionObserver) return;
      this.intersectionObserver = new view.IntersectionObserver(([entry]) => {
        this.isInViewport = entry?.isIntersecting ?? true;
        this.updateCurrentSpeed();
      });
      this.intersectionObserver.observe(this.parentElement);
    };
    // Visual viewport resize handler, mainly used to react to browser zoom changes.
    // Resize observer by itself does not react to pinch zoom, and although it usually
    // reacts to classic browser zoom, it's not guaranteed in edge cases.
    // Since timing between visual viewport changes and resize observer is complex
    // and because we'd like to know the device pixel sizes of elements, we just restart
    // the observer to get a guaranteed fresh callback regardless if it would have triggered or not.
    handleVisualViewportChange = () => {
      this.resizeObserver?.disconnect();
      this.setupResizeObserver();
    };
    /** Resize handler for when the container div changes size or the max pixel count changes and we want to resize our canvas to match */
    handleResize = () => {
      let targetPixelWidth = 0;
      let targetPixelHeight = 0;
      const dpr = Math.max(1, window.devicePixelRatio);
      const pinchZoom = visualViewport?.scale ?? 1;
      if (this.devicePixelsSupported) {
        const scaleToMeetMinPixelRatio = Math.max(1, this.minPixelRatio / dpr);
        targetPixelWidth = this.parentDevicePixelWidth * scaleToMeetMinPixelRatio * pinchZoom;
        targetPixelHeight = this.parentDevicePixelHeight * scaleToMeetMinPixelRatio * pinchZoom;
      } else {
        let targetRenderScale = Math.max(dpr, this.minPixelRatio) * pinchZoom;
        if (this.isSafari) {
          const zoomLevel = bestGuessBrowserZoom(this.ownerDocument);
          targetRenderScale *= Math.max(1, zoomLevel);
        }
        targetPixelWidth = Math.round(this.parentWidth) * targetRenderScale;
        targetPixelHeight = Math.round(this.parentHeight) * targetRenderScale;
      }
      const maxPixelCountHeadroom = Math.sqrt(this.maxPixelCount) / Math.sqrt(targetPixelWidth * targetPixelHeight);
      const scaleToMeetMaxPixelCount = Math.min(1, maxPixelCountHeadroom);
      const newWidth = Math.round(targetPixelWidth * scaleToMeetMaxPixelCount);
      const newHeight = Math.round(targetPixelHeight * scaleToMeetMaxPixelCount);
      const newRenderScale = newWidth / Math.round(this.parentWidth);
      if (this.canvasElement.width !== newWidth || this.canvasElement.height !== newHeight || this.renderScale !== newRenderScale) {
        this.renderScale = newRenderScale;
        this.canvasElement.width = newWidth;
        this.canvasElement.height = newHeight;
        this.resolutionChanged = true;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.render(performance.now());
      }
    };
    render = (currentTime) => {
      if (this.hasBeenDisposed) return;
      if (this.program === null) {
        console.warn("Tried to render before program or gl was initialized");
        return;
      }
      const dt = currentTime - this.lastRenderTime;
      this.lastRenderTime = currentTime;
      if (this.currentSpeed !== 0) {
        this.currentFrame += dt * this.currentSpeed;
      }
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      this.gl.uniform1f(this.uniformLocations.u_time, this.currentFrame * 1e-3);
      if (this.resolutionChanged) {
        this.gl.uniform2f(this.uniformLocations.u_resolution, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.uniform1f(this.uniformLocations.u_pixelRatio, this.renderScale);
        this.resolutionChanged = false;
      }
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
      if (this.currentSpeed !== 0) {
        this.requestRender();
      } else {
        this.rafId = null;
      }
    };
    requestRender = () => {
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
      }
      this.rafId = requestAnimationFrame(this.render);
    };
    /** Creates a texture from an image and sets it into a uniform value */
    setTextureUniform = (uniformName, image) => {
      if (!image.complete || image.naturalWidth === 0) {
        throw new Error(`Paper Shaders: image for uniform ${uniformName} must be fully loaded`);
      }
      const existingTexture = this.textures.get(uniformName);
      if (existingTexture) {
        this.gl.deleteTexture(existingTexture);
      }
      if (!this.textureUnitMap.has(uniformName)) {
        this.textureUnitMap.set(uniformName, this.textureUnitMap.size);
      }
      const textureUnit = this.textureUnitMap.get(uniformName);
      this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
      const texture = this.gl.createTexture();
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      if (this.mipmaps.includes(uniformName)) {
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
      }
      const error = this.gl.getError();
      if (error !== this.gl.NO_ERROR || texture === null) {
        console.error("Paper Shaders: WebGL error when uploading texture:", error);
        return;
      }
      this.textures.set(uniformName, texture);
      const location = this.uniformLocations[uniformName];
      if (location) {
        this.gl.uniform1i(location, textureUnit);
        const aspectRatioUniformName = `${uniformName}AspectRatio`;
        const aspectRatioLocation = this.uniformLocations[aspectRatioUniformName];
        if (aspectRatioLocation) {
          const aspectRatio = image.naturalWidth / image.naturalHeight;
          this.gl.uniform1f(aspectRatioLocation, aspectRatio);
        }
      }
    };
    /** Utility: recursive equality test for all the uniforms */
    areUniformValuesEqual = (a, b) => {
      if (a === b) return true;
      if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
        return a.every((val, i) => this.areUniformValuesEqual(val, b[i]));
      }
      return false;
    };
    /** Sets the provided uniform values into the WebGL program, can be a partial list of uniforms that have changed */
    setUniformValues = (updatedUniforms) => {
      Object.entries(updatedUniforms).forEach(([key, value]) => {
        let cacheValue = value;
        if (value instanceof HTMLImageElement) {
          cacheValue = `${value.src.slice(0, 200)}|${value.naturalWidth}x${value.naturalHeight}`;
        }
        if (this.areUniformValuesEqual(this.uniformCache[key], cacheValue)) return;
        this.uniformCache[key] = cacheValue;
        const location = this.uniformLocations[key];
        if (!location) {
          console.warn(`Uniform location for ${key} not found`);
          return;
        }
        if (value instanceof HTMLImageElement) {
          this.setTextureUniform(key, value);
        } else if (Array.isArray(value)) {
          let flatArray = null;
          let valueLength = null;
          if (value[0] !== void 0 && Array.isArray(value[0])) {
            const firstChildLength = value[0].length;
            if (value.every((arr) => arr.length === firstChildLength)) {
              flatArray = value.flat();
              valueLength = firstChildLength;
            } else {
              console.warn(`All child arrays must be the same length for ${key}`);
              return;
            }
          } else {
            flatArray = value;
            valueLength = flatArray.length;
          }
          switch (valueLength) {
            case 2:
              this.gl.uniform2fv(location, flatArray);
              break;
            case 3:
              this.gl.uniform3fv(location, flatArray);
              break;
            case 4:
              this.gl.uniform4fv(location, flatArray);
              break;
            case 9:
              this.gl.uniformMatrix3fv(location, false, flatArray);
              break;
            case 16:
              this.gl.uniformMatrix4fv(location, false, flatArray);
              break;
            default:
              console.warn(`Unsupported uniform array length: ${valueLength}`);
          }
        } else if (typeof value === "number") {
          this.gl.uniform1f(location, value);
        } else if (typeof value === "boolean") {
          this.gl.uniform1i(location, value ? 1 : 0);
        } else {
          console.warn(`Unsupported uniform type for ${key}: ${typeof value}`);
        }
      });
    };
    /** Gets the current total animation time from 0ms */
    getCurrentFrame = () => {
      return this.currentFrame;
    };
    /** Set a frame to get a deterministic result, frames are literally just milliseconds from zero since the animation started */
    setFrame = (newFrame) => {
      this.currentFrame = newFrame;
      this.lastRenderTime = performance.now();
      this.renderUnlessAnimating();
    };
    /** Set an animation speed (or 0 to stop animation) */
    setSpeed = (newSpeed = 1) => {
      this.speed = newSpeed;
      this.updateCurrentSpeed();
    };
    /** Apply the target speed, pausing (0) while the tab is hidden or the element is out of the viewport */
    updateCurrentSpeed = () => {
      this.setCurrentSpeed(this.ownerDocument.hidden || !this.isInViewport ? 0 : this.speed);
    };
    setCurrentSpeed = (newSpeed) => {
      this.currentSpeed = newSpeed;
      if (this.rafId === null && newSpeed !== 0) {
        this.lastRenderTime = performance.now();
        this.rafId = requestAnimationFrame(this.render);
      }
      if (this.rafId !== null && newSpeed === 0) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    };
    /** Set the maximum pixel count for the shader, this will limit the number of pixels that will be rendered */
    setMaxPixelCount = (newMaxPixelCount = DEFAULT_MAX_PIXEL_COUNT) => {
      this.maxPixelCount = newMaxPixelCount;
      this.handleResize();
    };
    /** Set the minimum pixel ratio for the shader */
    setMinPixelRatio = (newMinPixelRatio = 2) => {
      this.minPixelRatio = newMinPixelRatio;
      this.handleResize();
    };
    /** Update the uniforms that are provided by the outside shader, can be a partial set with only the uniforms that have changed */
    setUniforms = (newUniforms) => {
      this.setUniformValues(newUniforms);
      this.providedUniforms = { ...this.providedUniforms, ...newUniforms };
      this.renderUnlessAnimating();
    };
    /** Render right away only when the rAF loop isn't running */
    renderUnlessAnimating = () => {
      if (this.rafId === null) {
        this.render(performance.now());
      }
    };
    handleDocumentVisibilityChange = () => {
      this.updateCurrentSpeed();
    };
    /** Dispose of the shader mount, cleaning up all of the WebGL resources */
    dispose = () => {
      this.hasBeenDisposed = true;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.gl && this.program) {
        this.textures.forEach((texture) => {
          this.gl.deleteTexture(texture);
        });
        this.textures.clear();
        this.gl.deleteProgram(this.program);
        this.program = null;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.getError();
      }
      this.gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
        this.intersectionObserver = null;
      }
      visualViewport?.removeEventListener("resize", this.handleVisualViewportChange);
      this.ownerDocument.removeEventListener("visibilitychange", this.handleDocumentVisibilityChange);
      this.uniformLocations = {};
      this.canvasElement.remove();
      delete this.parentElement.paperShaderMount;
    };
  };
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function createProgram(gl, vertexShaderSource2, fragmentShaderSource) {
    const format = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT);
    const precision = format ? format.precision : null;
    if (precision && precision < 23) {
      vertexShaderSource2 = vertexShaderSource2.replace(/precision\s+(lowp|mediump)\s+float;/g, "precision highp float;");
      fragmentShaderSource = fragmentShaderSource.replace(/precision\s+(lowp|mediump)\s+float/g, "precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g, "$1 highp $3");
    }
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource2);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return null;
    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return null;
    }
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return program;
  }
  var defaultStyle = `@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;
  function isSafari() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
  }
  function bestGuessBrowserZoom(doc) {
    const viewportScale = visualViewport?.scale ?? 1;
    const viewportWidth = visualViewport?.width ?? window.innerWidth;
    const scrollbarWidth = window.innerWidth - doc.documentElement.clientWidth;
    const innerWidth = viewportScale * viewportWidth + scrollbarWidth;
    const ratio = outerWidth / innerWidth;
    const zoomPercentageRounded = Math.round(100 * ratio);
    if (zoomPercentageRounded % 5 === 0) {
      return zoomPercentageRounded / 100;
    }
    if (zoomPercentageRounded === 33) {
      return 1 / 3;
    }
    if (zoomPercentageRounded === 67) {
      return 2 / 3;
    }
    if (zoomPercentageRounded === 133) {
      return 4 / 3;
    }
    return ratio;
  }

  // node_modules/@paper-design/shaders/dist/shader-utils.js
  var declarePI = `
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;
  var rotation2 = `
vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
`;
  var colorBandingFix = `
  color += 1. / 256. * (fract(sin(dot(.014 * gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453123) - .5);
`;
  var simplexNoise = `
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

  // node_modules/@paper-design/shaders/dist/shaders/liquid-metal.js
  var liquidMetalFragmentShader = `#version 300 es
precision mediump float;

uniform sampler2D u_image;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec4 u_colorBack;
uniform vec4 u_colorTint;

uniform float u_softness;
uniform float u_repetition;
uniform float u_shiftRed;
uniform float u_shiftBlue;
uniform float u_distortion;
uniform float u_contour;
uniform float u_angle;

uniform float u_shape;
uniform bool u_isImage;

in vec2 v_objectUV;
in vec2 v_responsiveUV;
in vec2 v_responsiveBoxGivenSize;
in vec2 v_imageUV;

out vec4 fragColor;

${declarePI}
${rotation2}
${simplexNoise}

float getColorChanges(float c1, float c2, float stripe_p, vec3 w, float blur, float bump, float tint) {

  float ch = mix(c2, c1, smoothstep(.0, 2. * blur, stripe_p));

  float border = w[0];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  if (u_isImage == true) {
    bump = smoothstep(.2, .8, bump);
  }
  border = w[0] + .4 * (1. - bump) * w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + .5 * (1. - bump) * w[1];
  ch = mix(ch, c2, smoothstep(border, border + 2. * blur, stripe_p));

  border = w[0] + w[1];
  ch = mix(ch, c1, smoothstep(border, border + 2. * blur, stripe_p));

  float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
  float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
  ch = mix(ch, gradient, smoothstep(border, border + .5 * blur, stripe_p));

  // Tint color is applied with color burn blending
  ch = mix(ch, 1. - min(1., (1. - ch) / max(tint, 0.0001)), u_colorTint.a);
  return ch;
}

float getImgFrame(vec2 uv, float th) {
  float frame = 1.;
  frame *= smoothstep(0., th, uv.y);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.y);
  frame *= smoothstep(0., th, uv.x);
  frame *= 1.0 - smoothstep(1. - th, 1., uv.x);
  return frame;
}

float blurEdge3x3(sampler2D tex, vec2 uv, vec2 dudx, vec2 dudy, float radius, float centerSample) {
  vec2 texel = 1.0 / vec2(textureSize(tex, 0));
  vec2 r = radius * texel;

  float w1 = 1.0, w2 = 2.0, w4 = 4.0;
  float norm = 16.0;
  float sum = w4 * centerSample;

  sum += w2 * textureGrad(tex, uv + vec2(0.0, -r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(0.0, r.y), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(-r.x, 0.0), dudx, dudy).r;
  sum += w2 * textureGrad(tex, uv + vec2(r.x, 0.0), dudx, dudy).r;

  sum += w1 * textureGrad(tex, uv + vec2(-r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, -r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(-r.x, r.y), dudx, dudy).r;
  sum += w1 * textureGrad(tex, uv + vec2(r.x, r.y), dudx, dudy).r;

  return sum / norm;
}

float lst(float edge0, float edge1, float x) {
  return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

void main() {

  const float firstFrameOffset = 2.8;
  float t = .3 * (u_time + firstFrameOffset);

  vec2 uv = v_imageUV;
  vec2 dudx = dFdx(v_imageUV);
  vec2 dudy = dFdy(v_imageUV);
  vec4 img = textureGrad(u_image, uv, dudx, dudy);

  if (u_isImage == false) {
    uv = v_objectUV + .5;
    uv.y = 1. - uv.y;
  }

  float cycleWidth = u_repetition;
  float edge = 0.;
  float contOffset = 1.;

  vec2 rotatedUV = uv - vec2(.5);
  float angle = (-u_angle + 70.) * PI / 180.;
  float cosA = cos(angle);
  float sinA = sin(angle);
  rotatedUV = vec2(
  rotatedUV.x * cosA - rotatedUV.y * sinA,
  rotatedUV.x * sinA + rotatedUV.y * cosA
  ) + vec2(.5);

  // u_contour is applied in 2 separate ranges:
  // - 0 to .4 sets the edge hardness, saturated above .4 (both branches below)
  // - .5 to 1 warps the stripes direction along the edges, inactive below .5 (see u_contour range 2)
  if (u_isImage == true) {
    float edgeRaw = img.r;
    edge = blurEdge3x3(u_image, uv, dudx, dudy, 6., edgeRaw);
    edge = pow(edge, 1.6);
    edge *= mix(0.0, 1.0, smoothstep(0.0, 0.4, u_contour));
  } else {
    if (u_shape < 1.) {
      // full-fill on canvas
      vec2 borderUV = v_responsiveUV + .5;
      float ratio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
      vec2 mask = min(borderUV, 1. - borderUV);
      vec2 pixel_thickness = min(250. / v_responsiveBoxGivenSize, vec2(.5));
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);

      uv = v_responsiveUV;
      if (ratio > 1.) {
        uv.y /= ratio;
      } else {
        uv.x *= ratio;
      }
      uv += .5;
      uv.y = 1. - uv.y;

      cycleWidth *= 2.;
      contOffset = 1.5;

    } else if (u_shape < 2.) {
      // circle
      vec2 shapeUV = uv - .5;
      shapeUV *= .67;
      edge = pow(clamp(3. * length(shapeUV), 0., 1.), 18.);
    } else if (u_shape < 3.) {
      // daisy
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.68;

      float r = length(shapeUV) * 2.;
      float a = atan(shapeUV.y, shapeUV.x) + .2;
      r *= (1. + .05 * sin(3. * a + 2. * t));
      float f = abs(cos(a * 3.));
      edge = smoothstep(f, f + .7, r);
      edge *= edge;

      uv *= .8;
      cycleWidth *= 1.6;

    } else if (u_shape < 4.) {
      // diamond
      vec2 shapeUV = uv - .5;
      shapeUV = rotate(shapeUV, .25 * PI);
      shapeUV *= 1.42;
      shapeUV += .5;
      vec2 mask = min(shapeUV, 1. - shapeUV);
      vec2 pixel_thickness = vec2(.15);
      float maskX = smoothstep(0.0, pixel_thickness.x, mask.x);
      float maskY = smoothstep(0.0, pixel_thickness.y, mask.y);
      maskX = pow(maskX, .25);
      maskY = pow(maskY, .25);
      edge = clamp(1. - maskX * maskY, 0., 1.);
    } else if (u_shape < 5.) {
      // metaballs
      vec2 shapeUV = uv - .5;
      shapeUV *= 1.3;
      edge = 0.;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float speed = 1.5 + 2./3. * sin(fi * 12.345);
        float angle = -fi * 1.5;
        vec2 dir1 = vec2(cos(angle), sin(angle));
        vec2 dir2 = vec2(cos(angle + 1.57), sin(angle + 1.));
        vec2 traj = .4 * (dir1 * sin(t * speed + fi * 1.23) + dir2 * cos(t * (speed * 0.7) + fi * 2.17));
        float d = length(shapeUV + traj);
        edge += pow(1.0 - clamp(d, 0.0, 1.0), 4.0);
      }
      edge = 1. - smoothstep(.65, .9, edge);
      edge = pow(edge, 4.);
    }

    edge = mix(smoothstep(.9 - 2. * fwidth(edge), .9, edge), edge, smoothstep(0.0, 0.4, u_contour));

  }

  float opacity = 0.;
  if (u_isImage == true) {
    opacity = img.g;
    float frame = getImgFrame(v_imageUV, 0.);
    opacity *= frame;
  } else {
    opacity = 1. - smoothstep(.9 - 2. * fwidth(edge), .9, edge);
    if (u_shape < 2.) {
      edge = 1.2 * edge;
    } else if (u_shape < 5.) {
      edge = 1.8 * pow(edge, 1.5);
    }
  }

  float diagBLtoTR = rotatedUV.x - rotatedUV.y;
  float diagTLtoBR = rotatedUV.x + rotatedUV.y;

  vec3 color = vec3(0.);
  vec3 color1 = vec3(.98, 0.98, 1.);
  vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, diagTLtoBR));

  vec2 grad_uv = uv - .5;

  float dist = length(grad_uv + vec2(0., .2 * diagBLtoTR));
  grad_uv = rotate(grad_uv, (.25 - .2 * diagBLtoTR) * PI);
  float direction = grad_uv.x;

  float bump = pow(1.8 * dist, 1.2);
  bump = 1. - bump;
  bump *= pow(uv.y, .3);


  float thin_strip_1_ratio = .12 / cycleWidth * (1. - .4 * bump);
  float thin_strip_2_ratio = .07 / cycleWidth * (1. + .4 * bump);
  float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);

  float thin_strip_1_width = cycleWidth * thin_strip_1_ratio;
  float thin_strip_2_width = cycleWidth * thin_strip_2_ratio;

  float noise = snoise(uv - t);

  edge += (1. - edge) * u_distortion * noise;

  direction += diagBLtoTR;
  float contour = 0.;
  direction -= 2. * noise * diagBLtoTR * (smoothstep(0., 1., edge) * (1.0 - smoothstep(0., 1., edge)));
  // u_contour range 2
  direction *= mix(1., 1. - edge, smoothstep(.5, 1., u_contour));
  direction -= 1.7 * edge * smoothstep(.5, 1., u_contour);
  direction += .2 * pow(u_contour, 4.) * (1.0 - smoothstep(0., 1., edge));

  bump *= clamp(pow(uv.y, .1), .3, 1.);
  direction *= (.1 + (1.1 - edge) * bump);

  direction *= (.4 + .6 * (1.0 - smoothstep(.5, 1., edge)));
  direction += .18 * (smoothstep(.1, .2, uv.y) * (1.0 - smoothstep(.2, .4, uv.y)));
  direction += .03 * (smoothstep(.1, .2, 1. - uv.y) * (1.0 - smoothstep(.2, .4, 1. - uv.y)));

  direction *= (.5 + .5 * pow(uv.y, 2.));
  direction *= cycleWidth;
  direction -= t;


  float colorDispersion = (1. - bump);
  colorDispersion = clamp(colorDispersion, 0., 1.);
  float dispersionRed = colorDispersion;
  dispersionRed += .03 * bump * noise;
  dispersionRed += 5. * (smoothstep(-.1, .2, uv.y) * (1.0 - smoothstep(.1, .5, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, 1., bump)));
  dispersionRed -= diagBLtoTR;

  float dispersionBlue = colorDispersion;
  dispersionBlue *= 1.3;
  dispersionBlue += (smoothstep(0., .4, uv.y) * (1.0 - smoothstep(.1, .8, uv.y))) * (smoothstep(.4, .6, bump) * (1.0 - smoothstep(.4, .8, bump)));
  dispersionBlue -= .2 * edge;

  dispersionRed *= (u_shiftRed / 20.);
  dispersionBlue *= (u_shiftBlue / 20.);

  float blur = 0.;
  float rExtraBlur = 0.;
  float gExtraBlur = 0.;
  if (u_isImage == true) {
    float softness = 0.05 * u_softness;
    blur = softness + .5 * smoothstep(1., 10., u_repetition) * smoothstep(.0, 1., edge);
    float smallCanvasT = 1.0 - smoothstep(100., 500., min(u_resolution.x, u_resolution.y));
    blur += smallCanvasT * smoothstep(.0, 1., edge);
    rExtraBlur = softness * (0.05 + .1 * (u_shiftRed / 20.) * bump);
    gExtraBlur = softness * 0.05 / max(0.001, abs(1. - diagBLtoTR));
  } else {
    blur = u_softness / 15. + .3 * contour;
  }

  vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
  w[1] -= .02 * smoothstep(.0, 1., edge + bump);
  float stripe_r = fract(direction + dispersionRed);
  float r = getColorChanges(color1.r, color2.r, stripe_r, w, blur + fwidth(stripe_r) + rExtraBlur, bump, u_colorTint.r);
  float stripe_g = fract(direction);
  float g = getColorChanges(color1.g, color2.g, stripe_g, w, blur + fwidth(stripe_g) + gExtraBlur, bump, u_colorTint.g);
  float stripe_b = fract(direction - dispersionBlue);
  float b = getColorChanges(color1.b, color2.b, stripe_b, w, blur + fwidth(stripe_b), bump, u_colorTint.b);

  color = vec3(r, g, b);
  color *= opacity;

  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  color = color + bgColor * (1. - opacity);
  opacity = opacity + u_colorBack.a * (1. - opacity);

  ${colorBandingFix}

  fragColor = vec4(color, opacity);
}
`;

  // scripts/liquid-metal-enhancer.ts
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
  var rippleCounter = 0;
  function mountLiquidMetalButton(element, options = {}) {
    const viewMode = options.viewMode || element.getAttribute("data-view-mode") || "text";
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
    const host = element.querySelector(".shader-mount-host");
    const trigger = element.querySelector(".liquid-click-trigger");
    const midInner = element.querySelector(".liquid-mid-inner");
    const chassis = element.querySelector(".liquid-metal-btn-chassis");
    const mid = element.querySelector(".liquid-mid");
    const base = element.querySelector(".liquid-base");
    let shaderMount = null;
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
            u_offsetY: -0.1
          },
          void 0,
          0.6
        );
      }
    } catch (err) {
      console.warn("[LiquidMetalButton] Shader initialization skipped (fallback applied):", err);
    }
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
    trigger.addEventListener("click", (e) => {
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
  if (typeof window !== "undefined") {
    window.mountLiquidMetalButton = mountLiquidMetalButton;
    document.addEventListener("DOMContentLoaded", () => {
      document.querySelectorAll("[data-liquid-metal]").forEach((el) => {
        mountLiquidMetalButton(el);
      });
    });
  }
  return __toCommonJS(liquid_metal_enhancer_exports);
})();
