import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export type CameraPresetKey = 'hero' | 'front' | 'angle45' | 'side' | 'back' | 'top';

export interface Pants3DSpec {
  id: string;
  name: string;
  kind: string;
  frontImage: string;
  backImage: string;
  primaryColor: string;
  accentColor: string;
}

interface StudioProfile {
  bgHex: number;
  rimHex: number;
  plinthAccentHex: number;
  heroCam: [number, number, number];
}

const STUDIO_PROFILES: Record<string, StudioProfile> = {
  b1: {
    bgHex: 0x071108,
    rimHex: 0x9bd08a,
    plinthAccentHex: 0x7e9a64,
    heroCam: [0.56, 1.06, 2.42],
  },
  b2: {
    bgHex: 0x08090c,
    rimHex: 0xc8d3dc,
    plinthAccentHex: 0x8a949e,
    heroCam: [-0.46, 1.0, 2.46],
  },
  b3: {
    bgHex: 0x070d0f,
    rimHex: 0x8fb8c2,
    plinthAccentHex: 0x7a9aa4,
    heroCam: [0.6, 1.05, 2.48],
  },
  b4: {
    bgHex: 0x070e07,
    rimHex: 0x8ad16e,
    plinthAccentHex: 0x7e9a64,
    heroCam: [-0.68, 1.02, 2.42],
  },
  b5: {
    bgHex: 0x100e0a,
    rimHex: 0xefe6ce,
    plinthAccentHex: 0xd3c9ac,
    heroCam: [0.36, 1.06, 2.46],
  },
  b6: {
    bgHex: 0x060a12,
    rimHex: 0x7fa9dc,
    plinthAccentHex: 0x5e84b5,
    heroCam: [0.5, 0.98, 2.46],
  },
};

const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  bgHex: 0x071007,
  rimHex: 0x9bd08a,
  plinthAccentHex: 0x9bd08a,
  heroCam: [0, 1.04, 2.46],
};

interface ModelCalibration {
  frontWaistSkipRatio: number;
  backWaistSkipRatio: number;
  crotchOffsetRatio: number;
  roughness: number;
  sheen: number;
  weaveKind: 'denim' | 'ripstop' | 'canvas';
  liningColor: number;
  seamTintHex?: [number, number, number];
}

const MODEL_CALIBRATIONS: Record<string, ModelCalibration> = {
  b1: {
    frontWaistSkipRatio: 0.015,
    backWaistSkipRatio: 0.01,
    crotchOffsetRatio: 0.0,
    roughness: 0.88,
    sheen: 0.2,
    weaveKind: 'canvas',
    liningColor: 0x20271b,
  },
  b2: {
    frontWaistSkipRatio: 0.092,
    backWaistSkipRatio: 0.012,
    crotchOffsetRatio: 0.0,
    roughness: 0.8,
    sheen: 0.22,
    weaveKind: 'denim',
    liningColor: 0x111214,
  },
  b3: {
    frontWaistSkipRatio: 0.012,
    backWaistSkipRatio: 0.01,
    crotchOffsetRatio: 0.0,
    roughness: 0.56,
    sheen: 0.45,
    weaveKind: 'ripstop',
    liningColor: 0x22292b,
  },
  b4: {
    frontWaistSkipRatio: 0.025,
    backWaistSkipRatio: 0.01,
    crotchOffsetRatio: 0.0,
    roughness: 0.87,
    sheen: 0.18,
    weaveKind: 'canvas',
    liningColor: 0x121412,
    seamTintHex: [130, 158, 108],
  },
  b5: {
    frontWaistSkipRatio: 0.014,
    backWaistSkipRatio: 0.01,
    crotchOffsetRatio: 0.0,
    roughness: 0.84,
    sheen: 0.3,
    weaveKind: 'canvas',
    liningColor: 0x9b927d,
  },
  b6: {
    frontWaistSkipRatio: 0.082,
    backWaistSkipRatio: 0.012,
    crotchOffsetRatio: 0.0,
    roughness: 0.78,
    sheen: 0.24,
    weaveKind: 'denim',
    liningColor: 0x1b2738,
  },
};

interface Pants3DViewerProps {
  spec: Pants3DSpec;
  autoSpin: boolean;
  presetRequest: { key: CameraPresetKey; seq: number } | null;
  zoomStepRequest: { delta: number; seq: number } | null;
  onUserOrbitStart?: () => void;
  onTelemetryChange?: (azimuthDeg: number, zoomRatio: number) => void;
}

interface MaskData {
  pixels: Uint8ClampedArray;
  width: number;
  height: number;
  topY: number;
  botY: number;
  crotchY: number;
  midX: number;
  wholeBounds: Array<[number, number]>;
  leftLegBounds: Array<[number, number]>;
  rightLegBounds: Array<[number, number]>;
}

interface BakedGarmentCacheEntry {
  frontMask: MaskData;
  atlasCanvas: HTMLCanvasElement;
}

const garmentCache = new Map<string, BakedGarmentCacheEntry>();
const weaveCanvasCache = new Map<string, { bump: HTMLCanvasElement; normal: HTMLCanvasElement }>();
let sharedShadowCanvas: HTMLCanvasElement | null = null;

const _targetVec = new THREE.Vector3(0, 0.94, 0);
const _offsetVec = new THREE.Vector3();

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function extractGarmentMask(
  img: HTMLImageElement,
  removeWhiteBg: boolean,
  isLightGarment: boolean
): MaskData {
  const W = 480;
  const H = 600;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }

  ctx.clearRect(0, 0, W, H);
  const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * scale;
  const dh = img.naturalHeight * scale;
  const dx = (W - dw) * 0.5;
  const dy = (H - dh) * 0.5;
  ctx.drawImage(img, dx, dy, dw, dh);

  const imgData = ctx.getImageData(0, 0, W, H);
  const data = imgData.data;

  if (removeWhiteBg) {
    const visited = new Uint8Array(W * H);
    const queue = new Int32Array(W * H);
    let head = 0;
    let tail = 0;

    const minLuma = isLightGarment ? 242 : 228;
    const maxChroma = isLightGarment ? 14 : 26;

    const isBackdrop = (idx4: number) => {
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      return r > minLuma && g > minLuma && b > minLuma && maxC - minC < maxChroma;
    };

    const enqueue = (x: number, y: number) => {
      const p = y * W + x;
      if (visited[p] || !isBackdrop(p * 4)) return;
      visited[p] = 1;
      data[p * 4 + 3] = 0;
      queue[tail++] = p;
    };

    for (let x = 0; x < W; x++) {
      enqueue(x, 0);
      enqueue(x, H - 1);
    }
    for (let y = 0; y < H; y++) {
      enqueue(0, y);
      enqueue(W - 1, y);
    }

    while (head < tail) {
      const p = queue[head++];
      const x = p % W;
      const y = (p - x) / W;
      if (x > 0) enqueue(x - 1, y);
      if (x < W - 1) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y < H - 1) enqueue(x, y + 1);
    }

    // 2-pass halo trim around silhouette boundary
    const trimThreshold = isLightGarment ? 236 : 206;
    for (let pass = 0; pass < 2; pass++) {
      const trimMask = new Uint8Array(W * H);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const p = y * W + x;
          if (data[p * 4 + 3] > 0) {
            if (
              data[(p - 1) * 4 + 3] === 0 ||
              data[(p + 1) * 4 + 3] === 0 ||
              data[(p - W) * 4 + 3] === 0 ||
              data[(p + W) * 4 + 3] === 0
            ) {
              const idx4 = p * 4;
              if (
                data[idx4] > trimThreshold &&
                data[idx4 + 1] > trimThreshold &&
                data[idx4 + 2] > trimThreshold
              ) {
                trimMask[p] = 1;
              }
            }
          }
        }
      }
      for (let p = 0; p < W * H; p++) {
        if (trimMask[p]) data[p * 4 + 3] = 0;
      }
    }
  }

  let topY = H - 1;
  let botY = 0;
  const wholeBounds: Array<[number, number]> = new Array(H);

  let weightedX = 0;
  let totalOpaque = 0;

  for (let y = 0; y < H; y++) {
    let minX = W;
    let maxX = -1;
    let count = 0;
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        count++;
        weightedX += x;
        totalOpaque++;
      }
    }
    if (count > 16) {
      if (y < topY) topY = y;
      if (y > botY) botY = y;
      wholeBounds[y] = [minX, maxX];
    } else {
      wholeBounds[y] = [Math.round(W * 0.25), Math.round(W * 0.75)];
    }
  }

  if (botY <= topY + 30) {
    topY = Math.round(H * 0.08);
    botY = Math.round(H * 0.92);
  }

  const midX = totalOpaque > 0 ? Math.round(weightedX / totalOpaque) : Math.round(W * 0.5);
  const garmentH = botY - topY;

  let crotchY = Math.round(topY + garmentH * 0.4);
  const searchStart = Math.round(topY + garmentH * 0.26);
  const searchEnd = Math.round(topY + garmentH * 0.54);
  for (let y = searchStart; y <= searchEnd; y++) {
    const [rMin, rMax] = wholeBounds[y];
    const centerGap =
      data[(y * W + midX) * 4 + 3] < 48 &&
      data[(y * W + midX - 4) * 4 + 3] < 48 &&
      data[(y * W + midX + 4) * 4 + 3] < 48;
    if (centerGap && rMin < midX - 20 && rMax > midX + 20) {
      crotchY = y;
      break;
    }
  }

  const leftLegBounds: Array<[number, number]> = new Array(H);
  const rightLegBounds: Array<[number, number]> = new Array(H);

  for (let y = 0; y < H; y++) {
    let lMin = W;
    let lMax = -1;
    let rMin = W;
    let rMax = -1;
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4 + 3] > 60) {
        if (x < midX) {
          if (x < lMin) lMin = x;
          if (x > lMax) lMax = x;
        } else {
          if (x < rMin) rMin = x;
          if (x > rMax) rMax = x;
        }
      }
    }
    if (lMax <= lMin + 8) {
      lMin = wholeBounds[y][0];
      lMax = midX - 4;
    }
    if (rMax <= rMin + 8) {
      rMin = midX + 4;
      rMax = wholeBounds[y][1];
    }
    leftLegBounds[y] = [lMin, lMax];
    rightLegBounds[y] = [rMin, rMax];
  }

  return {
    pixels: data,
    width: W,
    height: H,
    topY,
    botY,
    crotchY,
    midX,
    wholeBounds,
    leftLegBounds,
    rightLegBounds,
  };
}

let _sr = 0;
let _sg = 0;
let _sb = 0;

function sampleFabricPixelZeroAlloc(
  mask: MaskData,
  y: number,
  normX: number,
  bounds: [number, number]
): void {
  const cy = Math.max(mask.topY, Math.min(mask.botY, Math.round(y)));
  const [bMin, bMax] = bounds;
  const span = Math.max(12, bMax - bMin);
  // Safe inward inset eliminates 100% of cutout edge halos
  const inset = Math.min(span * 0.085, 6);
  const minSafe = bMin + inset;
  const maxSafe = bMax - inset;
  let cx = Math.round(minSafe + Math.max(0, Math.min(1, normX)) * Math.max(1, maxSafe - minSafe));
  cx = Math.max(0, Math.min(mask.width - 1, cx));

  const idx = (cy * mask.width + cx) * 4;
  if (mask.pixels[idx + 3] >= 200) {
    _sr = mask.pixels[idx];
    _sg = mask.pixels[idx + 1];
    _sb = mask.pixels[idx + 2];
    return;
  }

  const sliceMid = Math.round((bMin + bMax) * 0.5);
  const step = cx < sliceMid ? 1 : -1;
  for (let k = 1; k < span; k++) {
    const sx = cx + step * k;
    if (sx < 0 || sx >= mask.width) break;
    const sIdx = (cy * mask.width + sx) * 4;
    if (mask.pixels[sIdx + 3] >= 200) {
      _sr = mask.pixels[sIdx];
      _sg = mask.pixels[sIdx + 1];
      _sb = mask.pixels[sIdx + 2];
      return;
    }
  }
  const mIdx = (cy * mask.width + Math.max(0, Math.min(mask.width - 1, sliceMid))) * 4;
  _sr = mask.pixels[mIdx];
  _sg = mask.pixels[mIdx + 1];
  _sb = mask.pixels[mIdx + 2];
}

// Unified 1024x1024 High-Resolution Texture Atlas:
// Top region   (px: 0..1023, py: 0..500)    -> Pelvis & Waistband
// Bottom-Left  (px: 0..495,  py: 524..1023) -> Left Leg
// Bottom-Right (px: 528..1023, py: 524..1023) -> Right Leg
function bakeUnifiedGarmentAtlas(
  frontMask: MaskData,
  backMask: MaskData,
  calib: ModelCalibration
): HTMLCanvasElement {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Atlas canvas failed');

  const out = ctx.createImageData(S, S);
  const dst = out.data;

  const frontH = Math.max(20, frontMask.botY - frontMask.topY);
  const backH = Math.max(20, backMask.botY - backMask.topY);

  const frontWaistY = frontMask.topY + frontH * calib.frontWaistSkipRatio;
  const backWaistY = backMask.topY + backH * calib.backWaistSkipRatio;

  const paintRegion = (
    part: 'pelvis' | 'leftLeg' | 'rightLeg',
    x0: number,
    x1: number,
    y0: number,
    y1: number
  ) => {
    const rw = x1 - x0;
    const rh = y1 - y0;

    const fTop = part === 'pelvis' ? frontWaistY : frontMask.crotchY - 6;
    const fBot = part === 'pelvis' ? frontMask.crotchY + 6 : frontMask.botY - 2;
    const bTop = part === 'pelvis' ? backWaistY : backMask.crotchY - 6;
    const bBot = part === 'pelvis' ? backMask.crotchY + 6 : backMask.botY - 2;

    for (let py = y0; py <= y1; py++) {
      const vNorm = (py - y0) / rh; // 0 at top -> 1 at bottom
      const fy = fTop + vNorm * Math.max(1, fBot - fTop);
      const by = bTop + vNorm * Math.max(1, bBot - bTop);

      const fyInt = Math.max(frontMask.topY, Math.min(frontMask.botY, Math.round(fy)));
      const byInt = Math.max(backMask.topY, Math.min(backMask.botY, Math.round(by)));

      const fBounds =
        part === 'pelvis'
          ? frontMask.wholeBounds[fyInt]
          : part === 'leftLeg'
            ? frontMask.leftLegBounds[fyInt]
            : frontMask.rightLegBounds[fyInt];

      const bBounds =
        part === 'pelvis'
          ? backMask.wholeBounds[byInt]
          : part === 'leftLeg'
            ? backMask.rightLegBounds[byInt]
            : backMask.leftLegBounds[byInt];

      for (let px = x0; px <= x1; px++) {
        const u = (px - x0) / rw;
        const theta =
          part === 'pelvis'
            ? u * Math.PI * 2
            : part === 'rightLeg'
              ? -Math.PI * 0.5 + u * Math.PI * 2
              : Math.PI * 0.5 - u * Math.PI * 2;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        // Crisp seam blend (+/- 10 deg instead of wide blurry crossfade)
        const frontWeight = smoothstep(-0.17, 0.17, cosT);
        const fxNorm = 0.5 + 0.47 * sinT;
        const bxNorm = 0.5 - 0.47 * sinT;

        sampleFabricPixelZeroAlloc(frontMask, fy, fxNorm, fBounds);
        const fr = _sr;
        const fg = _sg;
        const fb = _sb;

        sampleFabricPixelZeroAlloc(backMask, by, bxNorm, bBounds);
        const br = _sr;
        const bg = _sg;
        const bb = _sb;

        let r = fr * frontWeight + br * (1 - frontWeight);
        let g = fg * frontWeight + bg * (1 - frontWeight);
        let b = fb * frontWeight + bb * (1 - frontWeight);

        // Subtle side seam micro-groove & optional contrast stitching (b4 sage outseam)
        const absCos = Math.abs(cosT);
        if (absCos < 0.055) {
          const seamDepth = 1 - (1 - absCos / 0.055) * 0.14;
          r *= seamDepth;
          g *= seamDepth;
          b *= seamDepth;
          if (calib.seamTintHex && absCos < 0.018 && py % 5 < 3) {
            r = calib.seamTintHex[0];
            g = calib.seamTintHex[1];
            b = calib.seamTintHex[2];
          }
        }

        const oIdx = (py * S + px) * 4;
        dst[oIdx] = Math.max(0, Math.min(255, Math.round(r)));
        dst[oIdx + 1] = Math.max(0, Math.min(255, Math.round(g)));
        dst[oIdx + 2] = Math.max(0, Math.min(255, Math.round(b)));
        dst[oIdx + 3] = 255;
      }
    }
  };

  paintRegion('pelvis', 0, 1023, 0, 500);
  paintRegion('leftLeg', 0, 495, 524, 1023);
  paintRegion('rightLeg', 528, 1023, 524, 1023);

  // Fill padding gutters by repeating border pixels so mipmaps never bleed black
  for (let py = 501; py <= 523; py++) {
    const srcRow = py < 512 ? 500 : 524;
    for (let px = 0; px < S; px++) {
      const sIdx = (srcRow * S + px) * 4;
      const dIdx = (py * S + px) * 4;
      dst[dIdx] = dst[sIdx];
      dst[dIdx + 1] = dst[sIdx + 1];
      dst[dIdx + 2] = dst[sIdx + 2];
      dst[dIdx + 3] = 255;
    }
  }
  for (let py = 524; py < S; py++) {
    for (let px = 496; px <= 527; px++) {
      const srcCol = px < 512 ? 495 : 528;
      const sIdx = (py * S + srcCol) * 4;
      const dIdx = (py * S + px) * 4;
      dst[dIdx] = dst[sIdx];
      dst[dIdx + 1] = dst[sIdx + 1];
      dst[dIdx + 2] = dst[sIdx + 2];
      dst[dIdx + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
  return canvas;
}

async function getOrBuildGarmentAssets(spec: Pants3DSpec): Promise<BakedGarmentCacheEntry> {
  const cached = garmentCache.get(spec.id);
  if (cached) return cached;

  const calib = MODEL_CALIBRATIONS[spec.id] ?? MODEL_CALIBRATIONS.b1;
  const isLight = spec.id === 'b5';

  const [frontImg, backImg] = await Promise.all([
    loadHtmlImage(spec.frontImage),
    loadHtmlImage(spec.backImage),
  ]);

  const frontMask = extractGarmentMask(frontImg, false, isLight);
  const backMask = extractGarmentMask(backImg, true, isLight);
  const atlasCanvas = bakeUnifiedGarmentAtlas(frontMask, backMask, calib);

  const entry: BakedGarmentCacheEntry = {
    frontMask,
    atlasCanvas,
  };
  garmentCache.set(spec.id, entry);
  return entry;
}

function getFabricMaps(weaveKind: 'denim' | 'ripstop' | 'canvas'): {
  bump: HTMLCanvasElement;
  normal: HTMLCanvasElement;
} {
  const existing = weaveCanvasCache.get(weaveKind);
  if (existing) return existing;

  const S = 256;
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = S;
  bumpCanvas.height = S;
  const bCtx = bumpCanvas.getContext('2d')!;
  const bData = bCtx.createImageData(S, S);
  const bd = bData.data;

  const heightField = new Float32Array(S * S);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let h = 0.5;
      if (weaveKind === 'ripstop') {
        const gridX = x % 10 === 0 || x % 10 === 1 ? 0.28 : 0;
        const gridY = y % 10 === 0 || y % 10 === 1 ? 0.28 : 0;
        const fine = (((x + y) & 1) * 2 - 1) * 0.05;
        h = 0.45 + Math.max(gridX, gridY) + fine;
      } else if (weaveKind === 'denim') {
        // Authentic 3x1 right-hand diagonal twill + subtle slub yarn
        const diag = (x + y * 2) % 6;
        const twill = diag < 4 ? 0.16 : -0.18;
        const slub = Math.sin(x * 0.55) * 0.04 + Math.cos(y * 0.35) * 0.04;
        const grain = ((((x * 29 + y * 13) % 17) - 8) / 8) * 0.05;
        h = 0.5 + twill + slub + grain;
      } else {
        const warp = Math.sin(x * 1.55) * 0.09;
        const weft = Math.cos(y * 1.55) * 0.09;
        const grain = ((((x * 37 + y * 17) % 19) - 9) / 9) * 0.06;
        h = 0.5 + warp + weft + grain;
      }
      const clamped = Math.max(0, Math.min(1, h));
      heightField[y * S + x] = clamped;
      const c = Math.round(clamped * 255);
      const idx = (y * S + x) * 4;
      bd[idx] = c;
      bd[idx + 1] = c;
      bd[idx + 2] = c;
      bd[idx + 3] = 255;
    }
  }
  bCtx.putImageData(bData, 0, 0);

  // Convert heightField -> RGB Tangent-Space Normal Map
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = S;
  normalCanvas.height = S;
  const nCtx = normalCanvas.getContext('2d')!;
  const nData = nCtx.createImageData(S, S);
  const nd = nData.data;
  const strength = weaveKind === 'denim' ? 2.4 : weaveKind === 'ripstop' ? 2.1 : 1.7;

  for (let y = 0; y < S; y++) {
    const ym = (y - 1 + S) % S;
    const yp = (y + 1) % S;
    for (let x = 0; x < S; x++) {
      const xm = (x - 1 + S) % S;
      const xp = (x + 1) % S;
      const dx = (heightField[y * S + xp] - heightField[y * S + xm]) * strength;
      const dy = (heightField[yp * S + x] - heightField[ym * S + x]) * strength;
      const nz = 1.0;
      const invLen = 1 / Math.sqrt(dx * dx + dy * dy + nz * nz);
      const idx = (y * S + x) * 4;
      nd[idx] = Math.round(((-dx * invLen) * 0.5 + 0.5) * 255);
      nd[idx + 1] = Math.round(((-dy * invLen) * 0.5 + 0.5) * 255);
      nd[idx + 2] = Math.round(((nz * invLen) * 0.5 + 0.5) * 255);
      nd[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nData, 0, 0);

  const pair = { bump: bumpCanvas, normal: normalCanvas };
  weaveCanvasCache.set(weaveKind, pair);
  return pair;
}

function createWovenTagTexture(label: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0D170C';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = '#9BD08A';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 240, 80);
  ctx.fillStyle = '#E3DCC3';
  ctx.font = 'bold 34px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 128, 49);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function getContactShadowTexture(): THREE.CanvasTexture {
  if (!sharedShadowCanvas) {
    const S = 256;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(S / 2, S / 2, 10, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.78)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.36)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);
    sharedShadowCanvas = canvas;
  }
  const tex = new THREE.CanvasTexture(sharedShadowCanvas);
  tex.needsUpdate = true;
  return tex;
}

function weldCoincidentNormals(geo: THREE.BufferGeometry, vertexCountToWeld: number): void {
  const posAttr = geo.attributes.position as THREE.BufferAttribute;
  const normAttr = geo.attributes.normal as THREE.BufferAttribute;
  const buckets = new Map<string, number[]>();

  for (let i = 0; i < vertexCountToWeld; i++) {
    const kx = Math.round(posAttr.getX(i) * 2000);
    const ky = Math.round(posAttr.getY(i) * 2000);
    const kz = Math.round(posAttr.getZ(i) * 2000);
    const key = `${kx},${ky},${kz}`;
    let list = buckets.get(key);
    if (!list) {
      list = [];
      buckets.set(key, list);
    }
    list.push(i);
  }

  buckets.forEach((indices) => {
    if (indices.length < 2) return;
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let k = 0; k < indices.length; k++) {
      const idx = indices[k];
      nx += normAttr.getX(idx);
      ny += normAttr.getY(idx);
      nz += normAttr.getZ(idx);
    }
    const len = Math.hypot(nx, ny, nz);
    if (len < 1e-6) return;
    nx /= len;
    ny /= len;
    nz /= len;
    for (let k = 0; k < indices.length; k++) {
      normAttr.setXYZ(indices[k], nx, ny, nz);
    }
  });
  normAttr.needsUpdate = true;
}

interface UnifiedTrouserMetrics {
  waistRx: number;
  waistRz: number;
  waistY: number;
  crotchY: number;
  leftLegCxAtKnee: number;
  rightLegCxAtKnee: number;
  legRxAtKnee: number;
  legRzAtKnee: number;
  hemY: number;
  leftLegCxAtHem: number;
  rightLegCxAtHem: number;
  legRxAtHem: number;
}

// Builds ONE seamless, water-tight, anatomically bifurcated trouser BufferGeometry:
// - Pelvis & waist seamlessly split at the crotch saddle into two independent sculpted legs
// - Vertex-averaged normals across the crotch/hip seam (zero visible seam lines)
// - Built-in waistband thickness lip, inner cuff hem folds, model-specific drapery folds, & vertex AO
function createUnifiedTrouserMesh(
  specId: string,
  frontMask: MaskData
): { outerGeo: THREE.BufferGeometry; liningGeo: THREE.BufferGeometry; metrics: UnifiedTrouserMetrics } {
  const fW = frontMask.width;

  const sampleHalfWidth = (boundsArr: Array<[number, number]>, yStart: number, yEnd: number, t: number) => {
    const y = Math.max(
      frontMask.topY,
      Math.min(frontMask.botY, Math.round(THREE.MathUtils.lerp(yStart, yEnd, 1 - t)))
    );
    const [mn, mx] = boundsArr[y];
    return Math.max(0.08, ((mx - mn) / fW) * 1.15);
  };

  const sampleCenterX = (boundsArr: Array<[number, number]>, yStart: number, yEnd: number, t: number) => {
    const y = Math.max(
      frontMask.topY,
      Math.min(frontMask.botY, Math.round(THREE.MathUtils.lerp(yStart, yEnd, 1 - t)))
    );
    const [mn, mx] = boundsArr[y];
    return (((mn + mx) * 0.5 - frontMask.midX) / fW) * 1.85;
  };

  const yHem = 0.04;
  const ySplit = 1.14;
  const yWaist = 1.84;

  // Compute reference radii at split & waist from mask
  const hipHalfW = sampleHalfWidth(frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 0.25);
  const waistHalfW = sampleHalfWidth(frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 1.0);
  const waistRx = THREE.MathUtils.clamp(waistHalfW * 0.56, 0.25, 0.34);
  const waistRz = waistRx * 0.6;

  // Base leg split radius so outer leg perimeter matches pelvis outer edge cleanly
  const splitLegRx = THREE.MathUtils.clamp(hipHalfW * 0.295, 0.165, 0.205);
  const splitLegRz = splitLegRx * 0.9;
  const splitCrotchHalfZ = 0.044;
  const splitInnerAngle = Math.acos(Math.min(0.97, splitCrotchHalfZ / splitLegRz)); // ~1.29 rad from inner

  // Right leg center at split so innermost point sits right at x = 0
  const splitLegCx = splitLegRx * Math.sin(splitInnerAngle);

  // UV Atlas bounds (match bakeUnifiedGarmentAtlas)
  const pelvisU0 = 0;
  const pelvisU1 = 1;
  const pelvisV0 = 524 / 1024; // wait: flipY = true -> py=0 is uv.y=1, py=500 is uv.y = 1 - 500/1024 = 0.5117
  const pelvisVBottom = 1 - 500 / 1024;
  const pelvisVTop = 1.0;

  const legVBottom = 0.0;
  const legVTop = 1 - 524 / 1024;
  const leftU0 = 0.0;
  const leftU1 = 495 / 1024;
  const rightU0 = 528 / 1024;
  const rightU1 = 1.0;
  void pelvisU0;
  void pelvisU1;
  void pelvisV0;

  // Topology counts
  const outerHalfCols = 28; // right outer 28 + left outer 28 = 56 around pelvis
  const pelvisCols = outerHalfCols * 2; // 56
  const innerArcCols = 10; // inner thigh closure -> 28 + 10 = 38 segments per leg
  const legCols = outerHalfCols + innerArcCols; // 38

  const pelvisRows = 18;
  const legRows = 26;

  // Outer garment vertices & indices
  const posList: number[] = [];
  const uvList: number[] = [];
  const colList: number[] = [];
  const idxList: number[] = [];

  const pushVert = (x: number, y: number, z: number, u: number, v: number, ao: number) => {
    const idx = posList.length / 3;
    posList.push(x, y, z);
    uvList.push(u, v);
    colList.push(ao, ao, ao);
    return idx;
  };

  // Sculpted leg profile modifiers per pant model
  const evalLegRadii = (isLeft: boolean, vLeg: number) => {
    const bounds = isLeft ? frontMask.leftLegBounds : frontMask.rightLegBounds;
    const rawW = sampleHalfWidth(bounds, frontMask.crotchY, frontMask.botY, vLeg);
    const rawCx = sampleCenterX(bounds, frontMask.crotchY, frontMask.botY, vLeg);

    let cutMod = 0;
    let foldScale = 0.022;
    if (specId === 'b2') {
      // Straight baggy 14oz + stepped turned-up cuff ridge at bottom
      cutMod = vLeg < 0.085 && vLeg > 0.01 ? 0.011 * smoothstep(0.01, 0.03, vLeg) : 0;
      foldScale = 0.016;
    } else if (specId === 'b3') {
      // Balloon parachute + knee volume + gathered elastic ankle cinch
      const balloon = Math.sin(vLeg * Math.PI) * 0.034;
      const cinch = vLeg < 0.08 ? -0.042 * (1 - vLeg / 0.08) : 0;
      cutMod = balloon + cinch;
      foldScale = 0.034;
    } else if (specId === 'b4') {
      cutMod = 0.004;
      foldScale = 0.019;
    } else if (specId === 'b5') {
      // Fluid tailored wide-leg taper toward hem
      cutMod = Math.sin(vLeg * Math.PI) * 0.028 - (vLeg < 0.14 ? 0.014 * (1 - vLeg / 0.14) : 0);
      foldScale = 0.024;
    } else if (specId === 'b6') {
      // Wide 90s skate flare + puddle-hem compression at bottom
      cutMod = vLeg < 0.22 ? 0.022 * (1 - vLeg / 0.22) : 0;
      foldScale = 0.028;
    } else {
      // b1 cargo wide leg with slight ankle cinch
      cutMod = vLeg < 0.07 ? -0.014 * (1 - vLeg / 0.07) : 0.006;
      foldScale = 0.022;
    }

    const maskRx = THREE.MathUtils.clamp(rawW * 0.56 + cutMod, 0.135, 0.23);
    // Smoothly blend from splitLegRx at top (vLeg=1) down into maskRx
    const splitBlend = smoothstep(0.76, 1.0, vLeg);
    const rx = THREE.MathUtils.lerp(maskRx, splitLegRx, splitBlend);
    const rz = rx * (specId === 'b3' ? 0.92 : 0.88);

    const targetCx = isLeft
      ? THREE.MathUtils.clamp(rawCx, -0.24, -0.175)
      : THREE.MathUtils.clamp(rawCx, 0.175, 0.24);
    const cx = THREE.MathUtils.lerp(targetCx, isLeft ? -splitLegCx : splitLegCx, splitBlend);

    // Subtle organic forward knee articulation & calf sweep (not a stiff vertical pipe)
    const kneeBend = Math.sin(vLeg * Math.PI) * 0.018 - (vLeg < 0.35 ? (0.35 - vLeg) * 0.03 : 0);

    return { rx, rz, cx, cz: kneeBend, foldScale };
  };

  // Helper returning exact point on the bifurcation boundary (vLeg = 1 / vPelvis = 0)
  // For Right half: alpha in [0..1] (0 = Front Center, 0.5 = Right Outer, 1 = Back Center)
  const evalSplitRingPoint = (side: 1 | -1, alpha: number) => {
    // theta sweeps from Front-Inner to Back-Inner around outer side
    const maxA = Math.PI - (Math.PI * 0.5 - splitInnerAngle);
    const a = THREE.MathUtils.lerp(maxA, -maxA, alpha);
    //Wait: at alpha=0 (Front), we want x=0, z=+splitCrotchHalfZ!
    // Check: let angleFromOuter = THREE.MathUtils.lerp(Math.PI - splitInnerAngle_fromFront?):
    // Let's use explicit angle from +X (outer) for Right leg:
    // At outer (+X): angle = 0 -> cos(0)=1, sin(0)=0 -> x = cx + rx, z = 0
    // At Front-Inner (x=0, z=+splitCrotchHalfZ): angle = +phiEdge where phiEdge = Math.PI - (Math.PI*0.5 - splitInnerAngle)?
    // Wait: cos(phiEdge) = -cx / rx = -sin(splitInnerAngle) = -cos(PI/2 - splitInnerAngle) = cos(PI/2 + splitInnerAngle)!
    const phiEdge = Math.PI * 0.5 + splitInnerAngle; // ~ 2.86 rad
    // Notice sin(phiEdge) = sin(PI/2 + splitInnerAngle) = +cos(splitInnerAngle) = splitCrotchHalfZ / splitLegRz!
    // Wait: at alpha = 0 (Front), angle = +phiEdge -> x = side * (splitLegCx + splitLegRx * cos(+phiEdge)) = 0! z = splitLegRz * sin(+phiEdge) = +splitCrotchHalfZ!
    // At alpha = 0.5 (Outer), angle = 0 -> x = side * (splitLegCx + splitLegRx), z = 0!
    // At alpha = 1.0 (Back), angle = -phiEdge -> x = 0, z = -splitCrotchHalfZ!
    void a;
    const ang = THREE.MathUtils.lerp(phiEdge, -phiEdge, alpha);
    const x = side * (splitLegCx + splitLegRx * Math.cos(ang));
    const z = splitLegRz * Math.sin(ang);
    return { x, z, ang };
  };

  // 1. BUILD PELVIS & WAISTBAND (vPelvis: 0 at crotch split -> 1 at top waistband)
  const pelvisGrid: number[][] = [];
  for (let r = 0; r <= pelvisRows; r++) {
    const v = r / pelvisRows;
    const baseY = THREE.MathUtils.lerp(ySplit, yWaist, v);

    // Sample anatomical waist/hip width from mask
    const w = sampleHalfWidth(frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, v);
    const ovalRx = THREE.MathUtils.clamp(w * 0.56, 0.25, 0.37);
    const ovalRz = ovalRx * (specId === 'b3' ? 0.65 : 0.61);

    // Waistband stepped lip at top 8%
    const waistStep = v > 0.91 ? 0.008 * smoothstep(0.91, 0.96, v) : 0;
    const splitBlend = 1 - smoothstep(0.0, 0.56, v); // 1 at crotch, 0 above hips

    const row: number[] = [];
    for (let c = 0; c <= pelvisCols; c++) {
      const u = c / pelvisCols; // 0 Front -> 0.25 Right -> 0.5 Back -> 0.75 Left -> 1.0 Front
      const phi = u * Math.PI * 2;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      // Realistic back glute/seat fullness & subtle front hip contour
      const seatDepth = cosP < 0 ? 1.18 - 0.1 * v : 1.0;
      let ox = sinP * (ovalRx + waistStep);
      let oz = cosP * (ovalRz + waistStep) * seatDepth;

      // Blend bottom of pelvis cleanly onto the exact figure-8 split boundary
      if (splitBlend > 0) {
        const isRightHalf = c <= outerHalfCols;
        const side: 1 | -1 = isRightHalf ? 1 : -1;
        const alpha = isRightHalf
          ? c / outerHalfCols
          : 1 - (c - outerHalfCols) / outerHalfCols; // Back->Left->Front mirrored to 0 Front..1 Back
        const sp = evalSplitRingPoint(side, alpha);
        ox = THREE.MathUtils.lerp(ox, sp.x, splitBlend);
        oz = THREE.MathUtils.lerp(oz, sp.z, splitBlend);
      }

      // Sculpted model-specific torso folds
      let foldR = 0;
      if (specId === 'b5') {
        // Two deep tailored front pleats per side fading down from waistband
        const pleat1 = Math.exp(-Math.pow((sinP - 0.36) * 9, 2)) + Math.exp(-Math.pow((sinP + 0.36) * 9, 2));
        const pleat2 = Math.exp(-Math.pow((sinP - 0.58) * 10, 2)) + Math.exp(-Math.pow((sinP + 0.58) * 10, 2));
        const frontFactor = smoothstep(0.2, 0.85, cosP);
        const vertEnv = smoothstep(0.05, 0.45, v) * (1 - smoothstep(0.84, 0.96, v));
        foldR += (pleat1 * 0.016 + pleat2 * 0.012) * frontFactor * vertEnv;
      } else {
        foldR +=
          0.01 *
          Math.sin(phi * 5 + v * 6) *
          Math.sin(v * Math.PI) *
          (1 - splitBlend * 0.7);
      }
      ox += sinP * foldR;
      oz += cosP * foldR;

      // Anatomical waistband profile: slightly higher back lumbar, slight front dip
      const waistTilt =
        v > 0.75
          ? ((v - 0.75) / 0.25) * (cosP < 0 ? 0.026 * Math.abs(cosP) : -0.012 * cosP)
          : 0;

      // Crotch center saddle dip on front/back centerline
      const crotchDip =
        v < 0.22 ? -0.032 * Math.pow(Math.abs(cosP), 2.5) * (1 - v / 0.22) : 0;

      // Subtle AO shading: darker inside crotch saddle
      const ao =
        1.0 - 0.22 * Math.pow(Math.abs(cosP), 2.5) * (1 - smoothstep(0.0, 0.28, v));

      const uvY = THREE.MathUtils.lerp(pelvisVBottom, pelvisVTop, v);
      row.push(pushVert(ox, baseY + waistTilt + crotchDip, oz, u, uvY, ao));
    }
    pelvisGrid.push(row);
  }

  for (let r = 0; r < pelvisRows; r++) {
    for (let c = 0; c < pelvisCols; c++) {
      const a = pelvisGrid[r][c];
      const b = pelvisGrid[r][c + 1];
      const d = pelvisGrid[r + 1][c];
      const e = pelvisGrid[r + 1][c + 1];
      idxList.push(a, b, d, b, e, d);
    }
  }

  // 2. BUILD LEFT & RIGHT LEGS seamlessly joined to pelvis split boundary
  const buildLeg = (isLeft: boolean) => {
    const side: 1 | -1 = isLeft ? -1 : 1;
    const u0 = isLeft ? leftU0 : rightU0;
    const u1 = isLeft ? leftU1 : rightU1;
    const phiEdge = Math.PI * 0.5 + splitInnerAngle;
    const halfInnerCols = Math.floor(innerArcCols / 2); // 5

    const legGrid: number[][] = [];
    for (let r = 0; r <= legRows; r++) {
      const vLeg = r / legRows; // 0 hem -> 1 crotch split
      const baseY = THREE.MathUtils.lerp(yHem, ySplit, vLeg);
      const prof = evalLegRadii(isLeft, vLeg);
      const topSplitBlend = smoothstep(0.84, 1.0, vLeg);

      const row: number[] = [];
      for (let c = 0; c <= legCols; c++) {
        let px = 0;
        let pz = 0;
        let py = baseY;

        if (c < halfInnerCols) {
          // Innermost (0.5) -> Front-Inner (1.0)
          const tInner = 0.5 + (c / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = side * (Math.abs(prof.cx) + prof.rx * Math.cos(ang));
          const legZ = prof.cz + prof.rz * Math.sin(ang);

          const spZ = THREE.MathUtils.lerp(-splitCrotchHalfZ, splitCrotchHalfZ, tInner);
          px = THREE.MathUtils.lerp(legX, 0, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, spZ, topSplitBlend);

          const saddleArch = Math.sin(tInner * Math.PI);
          py += -0.032 * smoothstep(0.8, 1.0, vLeg) * (1 - 0.15 * saddleArch);
          if (vLeg > 0.85) {
            py -= 0.014 * saddleArch * smoothstep(0.85, 1.0, vLeg);
          }
        } else if (c <= halfInnerCols + outerHalfCols) {
          // Front-Inner (alpha=0) -> Outer (alpha=0.5) -> Back-Inner (alpha=1)
          const alpha = (c - halfInnerCols) / outerHalfCols;
          const ang = THREE.MathUtils.lerp(phiEdge, -phiEdge, alpha);

          const sp = evalSplitRingPoint(side, alpha);
          const legX = side * (Math.abs(prof.cx) + prof.rx * Math.cos(ang));
          const legZ = prof.cz + prof.rz * Math.sin(ang);

          px = THREE.MathUtils.lerp(legX, sp.x, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, sp.z, topSplitBlend);
          if (vLeg > 0.8) {
            const edgeCenterWeight = Math.pow(Math.abs(alpha - 0.5) * 2, 2.8);
            py += -0.032 * edgeCenterWeight * smoothstep(0.8, 1.0, vLeg);
          }
        } else {
          // Back-Inner (0.0) -> Innermost (0.5)
          const tInner = ((c - halfInnerCols - outerHalfCols) / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = side * (Math.abs(prof.cx) + prof.rx * Math.cos(ang));
          const legZ = prof.cz + prof.rz * Math.sin(ang);

          const spZ = THREE.MathUtils.lerp(-splitCrotchHalfZ, splitCrotchHalfZ, tInner);
          px = THREE.MathUtils.lerp(legX, 0, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, spZ, topSplitBlend);

          const saddleArch = Math.sin(tInner * Math.PI);
          py += -0.032 * smoothstep(0.8, 1.0, vLeg) * (1 - 0.15 * saddleArch);
          if (vLeg > 0.85) {
            py -= 0.014 * saddleArch * smoothstep(0.85, 1.0, vLeg);
          }
        }

        // Monotonic 0..1 uLocal starting & ending on hidden inner thigh seam
        const lx = px - prof.cx;
        const lz = pz - prof.cz;
        const texTheta = Math.atan2(lx, lz);
        let uLocal = 0;
        if (c === 0) {
          uLocal = 0;
        } else if (c === legCols) {
          uLocal = 1;
        } else {
          const raw = isLeft
            ? (Math.PI * 0.5 - texTheta) / (Math.PI * 2)
            : (texTheta + Math.PI * 0.5) / (Math.PI * 2);
          uLocal = ((raw % 1) + 1) % 1;
        }
        const uvX = THREE.MathUtils.lerp(u0, u1, uLocal);
        const uvY = THREE.MathUtils.lerp(legVBottom, legVTop, vLeg);

        // Model-specific sculptural cloth folds on legs
        const outDirX = Math.sin(texTheta);
        const outDirZ = Math.cos(texTheta);
        let disp =
          prof.foldScale *
          (Math.sin(texTheta * 4 + vLeg * 8.5) * 0.55 +
            Math.cos(texTheta * 3 - vLeg * 11) * 0.45) *
          Math.sin(vLeg * Math.PI) *
          (1 - topSplitBlend);

        if (specId === 'b3' && vLeg > 0.4 && vLeg < 0.68) {
          const kneeZone = Math.sin(((vLeg - 0.4) / 0.28) * Math.PI);
          const frontOnly = smoothstep(0.1, 0.8, outDirZ);
          disp += 0.018 * kneeZone * frontOnly * (1 + 0.35 * Math.sin((vLeg - 0.4) * 32));
        } else if (specId === 'b6' && vLeg < 0.26) {
          const stackZone = 1 - vLeg / 0.26;
          disp += 0.018 * stackZone * Math.sin(vLeg * 42 + texTheta * 2);
        } else if (specId === 'b5' && vLeg > 0.42) {
          const frontCrease = Math.exp(-Math.pow(outDirX * 5.5, 2)) * smoothstep(0.4, 0.9, outDirZ);
          disp += 0.01 * frontCrease * (1 - topSplitBlend * 0.4);
        }

        px += outDirX * disp;
        pz += outDirZ * disp;

        // Subtle AO darkening along inner thighs & deep knee/hem folds
        const innerWeight = isLeft ? smoothstep(0.2, 0.95, outDirX) : smoothstep(0.2, 0.95, -outDirX);
        const ao =
          1.0 -
          innerWeight * 0.16 * smoothstep(0.2, 0.95, vLeg) -
          (vLeg > 0.88 ? 0.12 * innerWeight : 0);

        row.push(pushVert(px, py, pz, uvX, uvY, ao));
      }
      legGrid.push(row);
    }

    // Wind triangles strictly outward for Right (+1) vs Left (-1) leg
    for (let r = 0; r < legRows; r++) {
      for (let c = 0; c < legCols; c++) {
        const a = legGrid[r][c];
        const b = legGrid[r][c + 1];
        const d = legGrid[r + 1][c];
        const e = legGrid[r + 1][c + 1];
        if (isLeft) {
          idxList.push(a, d, b, b, d, e);
        } else {
          idxList.push(a, b, d, b, e, d);
        }
      }
    }
  };

  buildLeg(false); // Right Leg
  buildLeg(true); // Left Leg

  const outerGeo = new THREE.BufferGeometry();
  outerGeo.setAttribute('position', new THREE.Float32BufferAttribute(posList, 3));
  outerGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvList, 2));
  outerGeo.setAttribute('color', new THREE.Float32BufferAttribute(colList, 3));
  outerGeo.setIndex(idxList);
  outerGeo.computeVertexNormals();
  weldCoincidentNormals(outerGeo, posList.length / 3);

  // 3. BUILD INNER WAISTBAND LINING + ANKLE CUFF INTERIORS (dedicated tucked cloth interior)
  const linPos: number[] = [];
  const linIdx: number[] = [];
  const topRow = pelvisGrid[pelvisRows];
  const posAttr = outerGeo.attributes.position as THREE.BufferAttribute;

  // Waistband rolled lip folding inside by 0.16
  const waistSteps = [
    { scale: 1.0, yOff: 0.0 },
    { scale: 0.96, yOff: 0.007 },
    { scale: 0.91, yOff: -0.025 },
    { scale: 0.87, yOff: -0.165 },
  ];
  const waistLinGrid: number[][] = [];
  for (let s = 0; s < waistSteps.length; s++) {
    const st = waistSteps[s];
    const row: number[] = [];
    for (let c = 0; c <= pelvisCols; c++) {
      const vIdx = topRow[c];
      const idx = linPos.length / 3;
      linPos.push(
        posAttr.getX(vIdx) * st.scale,
        posAttr.getY(vIdx) + st.yOff,
        posAttr.getZ(vIdx) * st.scale
      );
      row.push(idx);
    }
    waistLinGrid.push(row);
  }
  for (let s = 0; s < waistSteps.length - 1; s++) {
    for (let c = 0; c < pelvisCols; c++) {
      const a = waistLinGrid[s][c];
      const b = waistLinGrid[s][c + 1];
      const d = waistLinGrid[s + 1][c];
      const e = waistLinGrid[s + 1][c + 1];
      linIdx.push(a, b, d, b, e, d);
    }
  }

  // Subtle folded interior ankle cuff rings inside bottom hems
  [false, true].forEach((isLeft) => {
    const prof0 = evalLegRadii(isLeft, 0);
    const hemSteps = [
      { scale: 0.84, y: yHem + 0.06 },
      { scale: 0.94, y: yHem + 0.006 },
      { scale: 0.995, y: yHem },
    ];
    const hGrid: number[][] = [];
    for (let s = 0; s < hemSteps.length; s++) {
      const st = hemSteps[s];
      const row: number[] = [];
      for (let c = 0; c <= 28; c++) {
        const ang = (c / 28) * Math.PI * 2;
        const idx = linPos.length / 3;
        linPos.push(
          prof0.cx + Math.sin(ang) * prof0.rx * st.scale,
          st.y,
          prof0.cz + Math.cos(ang) * prof0.rz * st.scale
        );
        row.push(idx);
      }
      hGrid.push(row);
    }
    for (let s = 0; s < hemSteps.length - 1; s++) {
      for (let c = 0; c < 28; c++) {
        const a = hGrid[s][c];
        const b = hGrid[s][c + 1];
        const d = hGrid[s + 1][c];
        const e = hGrid[s + 1][c + 1];
        linIdx.push(a, b, d, b, e, d);
      }
    }
  });

  const liningGeo = new THREE.BufferGeometry();
  liningGeo.setAttribute('position', new THREE.Float32BufferAttribute(linPos, 3));
  liningGeo.setIndex(linIdx);
  liningGeo.computeVertexNormals();

  const kneeProfL = evalLegRadii(true, 0.45);
  const kneeProfR = evalLegRadii(false, 0.45);
  const hemProfL = evalLegRadii(true, 0.04);
  const hemProfR = evalLegRadii(false, 0.04);

  return {
    outerGeo,
    liningGeo,
    metrics: {
      waistRx,
      waistRz,
      waistY: yWaist,
      crotchY: ySplit,
      leftLegCxAtKnee: kneeProfL.cx,
      rightLegCxAtKnee: kneeProfR.cx,
      legRxAtKnee: kneeProfR.rx,
      legRzAtKnee: kneeProfR.rz,
      hemY: yHem,
      leftLegCxAtHem: hemProfL.cx,
      rightLegCxAtHem: hemProfR.cx,
      legRxAtHem: hemProfR.rx,
    },
  };
}

function createBeveledPocketGeometry(w: number, h: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const r = 0.014;
  shape.moveTo(-w * 0.5 + r, -h * 0.5);
  shape.lineTo(w * 0.5 - r, -h * 0.5);
  shape.quadraticCurveTo(w * 0.5, -h * 0.5, w * 0.5, -h * 0.5 + r);
  shape.lineTo(w * 0.5, h * 0.5 - r);
  shape.quadraticCurveTo(w * 0.5, h * 0.5, w * 0.5 - r, h * 0.5);
  shape.lineTo(-w * 0.5 + r, h * 0.5);
  shape.quadraticCurveTo(-w * 0.5, h * 0.5, -w * 0.5, h * 0.5 - r);
  shape.lineTo(-w * 0.5, -h * 0.5 + r);
  shape.quadraticCurveTo(-w * 0.5, -h * 0.5, -w * 0.5 + r, -h * 0.5);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

export default function Pants3DViewer({
  spec,
  autoSpin,
  presetRequest,
  zoomStepRequest,
  onUserOrbitStart,
  onTelemetryChange,
}: Pants3DViewerProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const profile = STUDIO_PROFILES[spec.id] ?? DEFAULT_STUDIO_PROFILE;

  const autoSpinRef = useRef(autoSpin);
  const onUserOrbitStartRef = useRef(onUserOrbitStart);
  const onTelemetryRef = useRef(onTelemetryChange);
  const presetTargetRef = useRef<THREE.Vector3 | null>(null);
  const zoomTargetDistRef = useRef<number | null>(null);
  const lastTelemetryRef = useRef<{ deg: number; zoom: number; ts: number }>({
    deg: -1,
    zoom: -1,
    ts: 0,
  });

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    onUserOrbitStartRef.current = onUserOrbitStart;
  }, [onUserOrbitStart]);

  useEffect(() => {
    onTelemetryRef.current = onTelemetryChange;
  }, [onTelemetryChange]);

  useEffect(() => {
    if (!presetRequest) return;
    const dist = 2.48;
    switch (presetRequest.key) {
      case 'hero': {
        const p = STUDIO_PROFILES[spec.id] ?? DEFAULT_STUDIO_PROFILE;
        presetTargetRef.current = new THREE.Vector3(...p.heroCam);
        break;
      }
      case 'front':
        presetTargetRef.current = new THREE.Vector3(0, 1.04, dist);
        break;
      case 'angle45':
        presetTargetRef.current = new THREE.Vector3(dist * 0.707, 1.1, dist * 0.707);
        break;
      case 'side':
        presetTargetRef.current = new THREE.Vector3(dist, 1.04, 0.02);
        break;
      case 'back':
        presetTargetRef.current = new THREE.Vector3(0, 1.04, -dist);
        break;
      case 'top':
        presetTargetRef.current = new THREE.Vector3(0, 2.7, 0.92);
        break;
    }
  }, [presetRequest, spec.id]);

  useEffect(() => {
    if (!zoomStepRequest) return;
    zoomTargetDistRef.current = zoomStepRequest.delta;
  }, [zoomStepRequest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    const stageProfile = STUDIO_PROFILES[spec.id] ?? DEFAULT_STUDIO_PROFILE;
    const calib = MODEL_CALIBRATIONS[spec.id] ?? MODEL_CALIBRATIONS.b1;
    const isCached = garmentCache.has(spec.id);
    setIsLoading(!isCached);
    setLoadError(null);
    presetTargetRef.current = null;
    zoomTargetDistRef.current = null;

    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = Math.max(280, container.clientWidth);
    const height = Math.max(320, container.clientHeight);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(stageProfile.bgHex);
    scene.fog = new THREE.FogExp2(stageProfile.bgHex, 0.08);
    scene.environmentIntensity = 0.48;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 30);
    camera.position.set(...stageProfile.heroCam);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(_targetVec);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 1.45;
    controls.maxDistance = 4.2;
    controls.minPolarAngle = 0.22;
    controls.maxPolarAngle = Math.PI * 0.56;
    controls.autoRotate = !isSoftwareGl && autoSpinRef.current;
    controls.autoRotateSpeed = 1.45;

    const handleControlStart = () => {
      presetTargetRef.current = null;
      zoomTargetDistRef.current = null;
      onUserOrbitStartRef.current?.();
    };
    controls.addEventListener('start', handleControlStart);

    // Calibrated 3-point fashion studio lighting
    const hemiLight = new THREE.HemisphereLight(0xdfeadd, 0x151f14, 0.65);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff6e8, 1.45);
    keyLight.position.set(2.5, 4.0, 3.1);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    const d = 1.6;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbed1c4, 0.58);
    fillLight.position.set(-2.9, 2.1, 1.7);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(stageProfile.rimHex, 1.0);
    rimLight.position.set(-1.5, 2.7, -3.2);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [envTex];
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Architectural studio plinth + subtle contact shadow
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0f1510,
      metalness: 0.72,
      roughness: 0.3,
    });
    const plinthRimMat = new THREE.MeshStandardMaterial({
      color: stageProfile.plinthAccentHex,
      metalness: 0.58,
      roughness: 0.25,
      emissive: stageProfile.plinthAccentHex,
      emissiveIntensity: 0.22,
    });
    const plinthGeo = new THREE.CylinderGeometry(0.8, 0.86, 0.04, 64);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.02;
    plinthMesh.receiveShadow = true;
    rootGroup.add(plinthMesh);

    const ringGeo = new THREE.TorusGeometry(0.8, 0.006, 12, 72);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, plinthRimMat);
    ringMesh.position.y = 0.001;
    rootGroup.add(ringMesh);

    const shadowTex = getContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(1.48, 1.48);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.68,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = 0.003;
    rootGroup.add(shadowPlane);

    disposables.push(plinthMat, plinthRimMat, plinthGeo, ringGeo, shadowTex, shadowPlaneGeo, shadowPlaneMat);

    const garmentGroup = new THREE.Group();
    rootGroup.add(garmentGroup);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        gl.flush();
        const poll = () => {
          if (disposed) return;
          const state = gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function reportTelemetry() {
      if (!onTelemetryRef.current) return;
      const now = performance.now();
      if (now - lastTelemetryRef.current.ts < 55) return;
      _offsetVec.copy(camera.position).sub(controls.target);
      const dist = _offsetVec.length();
      const rawDeg = THREE.MathUtils.radToDeg(Math.atan2(_offsetVec.x, _offsetVec.z));
      const normDeg = Math.round(((rawDeg % 360) + 360) % 360);
      const zoomRatio = Number((2.48 / Math.max(0.8, dist)).toFixed(2));
      if (normDeg !== lastTelemetryRef.current.deg || zoomRatio !== lastTelemetryRef.current.zoom) {
        lastTelemetryRef.current = { deg: normDeg, zoom: zoomRatio, ts: now };
        onTelemetryRef.current(normDeg, zoomRatio);
      }
    }

    function tick() {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      let needsMoreFrames = false;

      if (presetTargetRef.current) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, presetTargetRef.current.x, 8, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, presetTargetRef.current.y, 8, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, presetTargetRef.current.z, 8, dt);
        if (camera.position.distanceTo(presetTargetRef.current) < 0.015) {
          camera.position.copy(presetTargetRef.current);
          presetTargetRef.current = null;
        } else {
          needsMoreFrames = true;
        }
      }

      if (zoomTargetDistRef.current !== null) {
        _offsetVec.copy(camera.position).sub(controls.target);
        const currentDist = _offsetVec.length();
        const nextDist = THREE.MathUtils.clamp(currentDist + zoomTargetDistRef.current, 1.45, 4.2);
        _offsetVec.setLength(nextDist);
        camera.position.copy(controls.target).add(_offsetVec);
        zoomTargetDistRef.current = null;
        needsMoreFrames = true;
      }

      controls.autoRotate = !isSoftwareGl && autoSpinRef.current && !presetTargetRef.current;
      const controlsMoved = controls.update();
      if (controls.autoRotate || controlsMoved) {
        needsMoreFrames = true;
      }

      renderer.render(scene, camera);
      reportTelemetry();

      const done = () => {
        renderBusy = false;
        if (disposed) return;
        if (needsMoreFrames || renderDirty) {
          renderDirty = false;
          requestRender();
        }
      };

      if (isSoftwareGl) {
        afterDraw(done);
      } else {
        done();
      }
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(tick);
    }

    controls.addEventListener('change', requestRender);

    const spinInterval = window.setInterval(() => {
      if (!disposed && !isSoftwareGl && autoSpinRef.current) {
        requestRender();
      }
    }, 250);

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(280, container.clientWidth);
      const h = Math.max(320, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', handleResize);

    getOrBuildGarmentAssets(spec)
      .then(({ frontMask, atlasCanvas }) => {
        if (disposed) return;

        const maxAniso = renderer.capabilities.getMaxAnisotropy();

        const atlasTex = new THREE.CanvasTexture(atlasCanvas);
        atlasTex.colorSpace = THREE.SRGBColorSpace;
        atlasTex.wrapS = THREE.RepeatWrapping;
        atlasTex.wrapT = THREE.ClampToEdgeWrapping;
        atlasTex.anisotropy = maxAniso;
        atlasTex.needsUpdate = true;

        const fabricMaps = getFabricMaps(calib.weaveKind);
        const weaveRoughTex = new THREE.CanvasTexture(fabricMaps.bump);
        weaveRoughTex.wrapS = THREE.RepeatWrapping;
        weaveRoughTex.wrapT = THREE.RepeatWrapping;
        weaveRoughTex.repeat.set(14, 18);
        weaveRoughTex.anisotropy = maxAniso;
        weaveRoughTex.needsUpdate = true;

        const weaveNormTex = new THREE.CanvasTexture(fabricMaps.normal);
        weaveNormTex.wrapS = THREE.RepeatWrapping;
        weaveNormTex.wrapT = THREE.RepeatWrapping;
        weaveNormTex.repeat.set(14, 18);
        weaveNormTex.anisotropy = maxAniso;
        weaveNormTex.needsUpdate = true;

        disposables.push(atlasTex, weaveRoughTex, weaveNormTex);

        const garmentMat = new THREE.MeshPhysicalMaterial({
          map: atlasTex,
          normalMap: weaveNormTex,
          normalScale: new THREE.Vector2(0.42, 0.42),
          roughnessMap: weaveRoughTex,
          roughness: calib.roughness,
          metalness: 0.03,
          sheen: calib.sheen,
          sheenRoughness: 0.78,
          sheenColor: new THREE.Color(0xd5e2ce),
          vertexColors: true,
          side: THREE.FrontSide,
        });

        const liningMat = new THREE.MeshStandardMaterial({
          color: calib.liningColor,
          roughness: 0.94,
          metalness: 0.02,
          side: THREE.FrontSide,
        });

        const { outerGeo, liningGeo, metrics } = createUnifiedTrouserMesh(spec.id, frontMask);
        const garmentMesh = new THREE.Mesh(outerGeo, garmentMat);
        garmentMesh.castShadow = true;
        garmentMesh.receiveShadow = true;
        garmentGroup.add(garmentMesh);

        const liningMesh = new THREE.Mesh(liningGeo, liningMat);
        garmentGroup.add(liningMesh);
        disposables.push(garmentMat, liningMat, outerGeo, liningGeo);

        // Woven 000GREEN interior waistband label tucked against inner back lining
        const tagTex = createWovenTagTexture('000GREEN');
        const tagMat = new THREE.MeshStandardMaterial({
          map: tagTex,
          roughness: 0.72,
          metalness: 0.04,
        });
        const tagGeo = new THREE.BoxGeometry(0.105, 0.04, 0.006);
        const tagMesh = new THREE.Mesh(tagGeo, tagMat);
        tagMesh.position.set(0, metrics.waistY - 0.055, -metrics.waistRz * 0.92);
        garmentGroup.add(tagMesh);
        disposables.push(tagTex, tagMat, tagGeo);

        // Tailored Hardware & Model-Specific Contoured Details
        const metalMat = new THREE.MeshStandardMaterial({
          color: spec.id === 'b6' ? 0xd0a25c : spec.id === 'b2' ? 0x9aa4ac : 0x7e8a84,
          metalness: 0.88,
          roughness: 0.24,
        });
        const accentMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(spec.accentColor),
          roughness: 0.82,
          metalness: 0.06,
        });
        const primaryMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(spec.primaryColor),
          roughness: 0.86,
          metalness: 0.04,
        });
        disposables.push(metalMat, accentMat, primaryMat);

        // Front tack button (except elastic-drawstring parachute b3)
        if (spec.id !== 'b3') {
          const btnGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.01, 20);
          btnGeo.rotateX(Math.PI / 2);
          const btnMesh = new THREE.Mesh(btnGeo, spec.id === 'b5' ? primaryMat : metalMat);
          btnMesh.position.set(0.012, metrics.waistY - 0.035, metrics.waistRz + 0.008);
          garmentGroup.add(btnMesh);
          disposables.push(btnGeo);

          // Flush contoured belt loops
          const loopGeo = new THREE.BoxGeometry(0.02, 0.088, 0.014);
          [0.44, 1.48, 2.52, Math.PI, 3.76, 4.8, 5.84].forEach((ang) => {
            const loop = new THREE.Mesh(loopGeo, primaryMat);
            const cosA = Math.cos(ang);
            const lx = Math.sin(ang) * (metrics.waistRx + 0.004);
            const lz = cosA * (metrics.waistRz + 0.004) * (cosA < 0 ? 1.07 : 1);
            loop.position.set(lx, metrics.waistY - 0.036 + (cosA < 0 ? 0.022 : -0.005), lz);
            loop.rotation.y = ang;
            garmentGroup.add(loop);
          });
          disposables.push(loopGeo);
        }

        // Model-specific sculpted silhouette accessories
        if (spec.id === 'b1') {
          // Contoured beveled 3D cargo bellows pockets & flaps hugging outer thigh
          const pocketGeo = createBeveledPocketGeometry(0.18, 0.25, 0.032);
          const flapGeo = createBeveledPocketGeometry(0.19, 0.058, 0.038);
          const snapGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.01, 12);
          snapGeo.rotateZ(Math.PI / 2);

          [-1, 1].forEach((side) => {
            const pX = side * (Math.abs(metrics.rightLegCxAtKnee) + metrics.legRxAtKnee - 0.004);
            const pMesh = new THREE.Mesh(pocketGeo, primaryMat);
            pMesh.position.set(pX, 0.94, 0.012);
            pMesh.rotation.y = side * (Math.PI / 2);
            pMesh.rotation.x = side * 0.04;
            pMesh.castShadow = true;
            garmentGroup.add(pMesh);

            const fMesh = new THREE.Mesh(flapGeo, accentMat);
            fMesh.position.set(pX + side * 0.006, 1.055, 0.012);
            fMesh.rotation.y = side * (Math.PI / 2);
            garmentGroup.add(fMesh);

            [-0.048, 0.048].forEach((zOff) => {
              const sMesh = new THREE.Mesh(snapGeo, metalMat);
              sMesh.position.set(pX + side * 0.026, 1.045, 0.012 + zOff);
              garmentGroup.add(sMesh);
            });
          });
          disposables.push(pocketGeo, flapGeo, snapGeo);
        } else if (spec.id === 'b2') {
          // Matte black leather back-right waist patch + delicate selvedge edge accent
          const patchMat = new THREE.MeshStandardMaterial({
            color: 0x16171a,
            roughness: 0.44,
            metalness: 0.12,
          });
          const patchGeo = createBeveledPocketGeometry(0.125, 0.072, 0.008);
          const patch = new THREE.Mesh(patchGeo, patchMat);
          patch.position.set(0.145, metrics.waistY - 0.03, -metrics.waistRz * 1.04);
          patch.rotation.y = -0.34;
          garmentGroup.add(patch);

          // Crisp pocket corner silver rivets
          const rivetGeo = new THREE.SphereGeometry(0.007, 10, 10);
          [
            [-0.21, 1.67, metrics.waistRz * 0.82],
            [0.21, 1.67, metrics.waistRz * 0.82],
          ].forEach(([rx, ry, rz]) => {
            const riv = new THREE.Mesh(rivetGeo, metalMat);
            riv.position.set(rx, ry, rz);
            garmentGroup.add(riv);
          });
          disposables.push(patchMat, patchGeo, rivetGeo);
        } else if (spec.id === 'b3') {
          // Real 3D curved front waist drawstring cord + ankle toggles flush at hem
          const cordMat = new THREE.MeshStandardMaterial({
            color: 0xc8ccb8,
            roughness: 0.78,
            metalness: 0.04,
          });
          const cordL = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.018, metrics.waistY - 0.025, metrics.waistRz + 0.008),
            new THREE.Vector3(-0.032, metrics.waistY - 0.16, metrics.waistRz + 0.028),
            new THREE.Vector3(-0.028, metrics.waistY - 0.34, metrics.waistRz + 0.022),
          ]);
          const cordR = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.018, metrics.waistY - 0.025, metrics.waistRz + 0.008),
            new THREE.Vector3(0.03, metrics.waistY - 0.18, metrics.waistRz + 0.026),
            new THREE.Vector3(0.026, metrics.waistY - 0.36, metrics.waistRz + 0.02),
          ]);
          const cordLGeo = new THREE.TubeGeometry(cordL, 16, 0.007, 8, false);
          const cordRGeo = new THREE.TubeGeometry(cordR, 16, 0.007, 8, false);
          garmentGroup.add(new THREE.Mesh(cordLGeo, cordMat));
          garmentGroup.add(new THREE.Mesh(cordRGeo, cordMat));

          // Delicate ankle drawcord toggles flush at outer cuffs
          const togGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.022, 10);
          [
            metrics.leftLegCxAtHem - metrics.legRxAtHem - 0.004,
            metrics.rightLegCxAtHem + metrics.legRxAtHem + 0.004,
          ].forEach((tx) => {
            const tog = new THREE.Mesh(togGeo, metalMat);
            tog.position.set(tx, metrics.hemY + 0.018, 0.02);
            garmentGroup.add(tog);
          });
          disposables.push(cordMat, cordLGeo, cordRGeo, togGeo);
        } else if (spec.id === 'b4') {
          // Sage-green curved hammer loop tucked cleanly on back-left thigh
          const hammerCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.31, 1.32, -0.05),
            new THREE.Vector3(-0.375, 1.24, -0.06),
            new THREE.Vector3(-0.315, 1.15, -0.05),
          ]);
          const hammerGeo = new THREE.TubeGeometry(hammerCurve, 14, 0.012, 8, false);
          garmentGroup.add(new THREE.Mesh(hammerGeo, accentMat));

          const rivetGeo = new THREE.SphereGeometry(0.007, 10, 10);
          [
            [-0.21, 1.68, metrics.waistRz * 0.84],
            [0.21, 1.68, metrics.waistRz * 0.84],
          ].forEach(([rx, ry, rz]) => {
            const riv = new THREE.Mesh(rivetGeo, metalMat);
            riv.position.set(rx, ry, rz);
            garmentGroup.add(riv);
          });
          disposables.push(hammerGeo, rivetGeo);
        } else if (spec.id === 'b6') {
          // Copper-brass 5-pocket rivets flush on front & back pockets
          const rivetGeo = new THREE.SphereGeometry(0.008, 10, 10);
          [
            [-0.21, 1.68, metrics.waistRz * 0.84],
            [0.21, 1.68, metrics.waistRz * 0.84],
            [-0.16, 1.56, -metrics.waistRz * 1.04],
            [0.16, 1.56, -metrics.waistRz * 1.04],
          ].forEach(([rx, ry, rz]) => {
            const riv = new THREE.Mesh(rivetGeo, metalMat);
            riv.position.set(rx, ry, rz);
            garmentGroup.add(riv);
          });
          disposables.push(rivetGeo);
        }

        if (!isSoftwareGl) {
          renderer.compile(scene, camera);
        }

        setIsLoading(false);
        requestRender();
      })
      .catch(() => {
        if (!disposed) {
          setLoadError('No se pudo inicializar la vista 3D.');
          setIsLoading(false);
        }
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      clearInterval(spinInterval);
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', requestRender);
      controls.removeEventListener('start', handleControlStart);
      controls.dispose();
      disposables.forEach((item) => {
        try {
          item.dispose();
        } catch {}
      });
      renderer.dispose();
    };
  }, [spec.id, spec.frontImage, spec.backImage, spec.primaryColor, spec.accentColor]);

  return (
    <div
      className="relative w-full h-full min-h-[360px] sm:min-h-[500px]"
      style={{ backgroundColor: `#${profile.bgHex.toString(16).padStart(6, '0')}` }}
    >
      <div ref={mountRef} className="w-full h-full min-h-[360px] sm:min-h-[500px]" />
      {isLoading && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3"
          style={{ backgroundColor: `#${profile.bgHex.toString(16).padStart(6, '0')}` }}
        >
          <div className="w-10 h-10 rounded-full border-2 border-[#4D8046] border-t-[#9BD08A] animate-spin" />
          <span className="text-xs font-mono uppercase tracking-wider text-[#D3C9AC]">
            Construyendo 3D · {spec.name}
          </span>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-[#E88C84]">
          {loadError}
        </div>
      )}
    </div>
  );
}
