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
  wallHex: number;
  floorCenterHex: string;
  floorEdgeHex: string;
  columnHex: number;
  rimHex: number;
  plinthHex: number;
  plinthAccentHex: number;
  heroCam: [number, number, number];
}

// Deep, atmospheric 000GREEN architectural studio palettes per pant (moody green contrast, never black)
const STUDIO_PROFILES: Record<string, StudioProfile> = {
  b1: {
    bgHex: 0x0c1d0c,
    wallHex: 0x132b13,
    floorCenterHex: '#1d3c1b',
    floorEdgeHex: '#0a170a',
    columnHex: 0x102510,
    rimHex: 0x90cb7c,
    plinthHex: 0x132613,
    plinthAccentHex: 0x7cb96c,
    heroCam: [0.46, 1.03, 2.46],
  },
  b2: {
    bgHex: 0x0b1c13,
    wallHex: 0x112a1d,
    floorCenterHex: '#193b29',
    floorEdgeHex: '#091710',
    columnHex: 0x0e2318,
    rimHex: 0x98d6b6,
    plinthHex: 0x11241a,
    plinthAccentHex: 0x77b895,
    heroCam: [-0.42, 1.01, 2.46],
  },
  b3: {
    bgHex: 0x0b1d17,
    wallHex: 0x112b22,
    floorCenterHex: '#1a3d31',
    floorEdgeHex: '#091813',
    columnHex: 0x0e241d,
    rimHex: 0x8cc9b3,
    plinthHex: 0x11251f,
    plinthAccentHex: 0x72b09a,
    heroCam: [0.5, 1.03, 2.48],
  },
  b4: {
    bgHex: 0x0e1f0b,
    wallHex: 0x152e12,
    floorCenterHex: '#20411a',
    floorEdgeHex: '#0b1909',
    columnHex: 0x12270f,
    rimHex: 0xb2e695,
    plinthHex: 0x142712,
    plinthAccentHex: 0x7ab461,
    heroCam: [-0.5, 1.02, 2.46],
  },
  b5: {
    bgHex: 0x121f10,
    wallHex: 0x1a2e16,
    floorCenterHex: '#263e20',
    floorEdgeHex: '#0e190c',
    columnHex: 0x162713,
    rimHex: 0xc2d89f,
    plinthHex: 0x182816,
    plinthAccentHex: 0xaab986,
    heroCam: [0.34, 1.03, 2.46],
  },
  b6: {
    bgHex: 0x0a1c17,
    wallHex: 0x102921,
    floorCenterHex: '#183a2f',
    floorEdgeHex: '#081712',
    columnHex: 0x0e231c,
    rimHex: 0x88cbb5,
    plinthHex: 0x10231d,
    plinthAccentHex: 0x6fb19c,
    heroCam: [0.44, 1.01, 2.46],
  },
};

const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  bgHex: 0x0c1d0c,
  wallHex: 0x132b13,
  floorCenterHex: '#1d3c1b',
  floorEdgeHex: '#0a170a',
  columnHex: 0x102510,
  rimHex: 0x90cb7c,
  plinthHex: 0x132613,
  plinthAccentHex: 0x7cb96c,
  heroCam: [0, 1.03, 2.46],
};

interface ModelCalibration {
  frontWaistSkipRatio: number;
  backWaistSkipRatio: number;
  roughness: number;
  sheen: number;
  specularIntensity: number;
  sheenColor: number;
  weaveKind: 'denim' | 'ripstop' | 'canvas';
  liningColor: number;
  pocketBagColor: number;
  cargoBulge: boolean;
  pleatRidges: boolean;
  kneeDarts: boolean;
  cuffStep: boolean;
  puddleHem: boolean;
  doubleKnee: boolean;
  elasticWaist: boolean;
}

const MODEL_CALIBRATIONS: Record<string, ModelCalibration> = {
  b1: {
    frontWaistSkipRatio: 0.012,
    backWaistSkipRatio: 0.006,
    roughness: 0.93,
    sheen: 0.08,
    specularIntensity: 0.14,
    sheenColor: 0x8f9d7d,
    weaveKind: 'canvas',
    liningColor: 0x47523a,
    pocketBagColor: 0xb0aa92,
    cargoBulge: true,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
    doubleKnee: false,
    elasticWaist: false,
  },
  b2: {
    frontWaistSkipRatio: 0.095,
    backWaistSkipRatio: 0.008,
    roughness: 0.89,
    sheen: 0.1,
    specularIntensity: 0.16,
    sheenColor: 0x7f878f,
    weaveKind: 'denim',
    liningColor: 0x41464d,
    pocketBagColor: 0xc2baa7,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: true,
    puddleHem: false,
    doubleKnee: false,
    elasticWaist: false,
  },
  b3: {
    frontWaistSkipRatio: 0.008,
    backWaistSkipRatio: 0.006,
    roughness: 0.72,
    sheen: 0.18,
    specularIntensity: 0.24,
    sheenColor: 0x869793,
    weaveKind: 'ripstop',
    liningColor: 0x3b4446,
    pocketBagColor: 0x576162,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: true,
    cuffStep: false,
    puddleHem: false,
    doubleKnee: false,
    elasticWaist: true,
  },
  b4: {
    frontWaistSkipRatio: 0.016,
    backWaistSkipRatio: 0.006,
    roughness: 0.92,
    sheen: 0.08,
    specularIntensity: 0.14,
    sheenColor: 0x848f7c,
    weaveKind: 'canvas',
    liningColor: 0x363b35,
    pocketBagColor: 0xbfb7a1,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
    doubleKnee: true,
    elasticWaist: false,
  },
  b5: {
    frontWaistSkipRatio: 0.01,
    backWaistSkipRatio: 0.006,
    roughness: 0.9,
    sheen: 0.12,
    specularIntensity: 0.15,
    sheenColor: 0xebe1cc,
    weaveKind: 'canvas',
    liningColor: 0xb7ac94,
    pocketBagColor: 0xded4be,
    cargoBulge: false,
    pleatRidges: true,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
    doubleKnee: false,
    elasticWaist: false,
  },
  b6: {
    frontWaistSkipRatio: 0.086,
    backWaistSkipRatio: 0.008,
    roughness: 0.88,
    sheen: 0.1,
    specularIntensity: 0.16,
    sheenColor: 0x839bb8,
    weaveKind: 'denim',
    liningColor: 0x58687a,
    pocketBagColor: 0xc4bca8,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: true,
    doubleKnee: false,
    elasticWaist: false,
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
  canvas: HTMLCanvasElement;
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
  backMask: MaskData;
}

const garmentCache = new Map<string, BakedGarmentCacheEntry>();
const weaveCanvasCache = new Map<string, HTMLCanvasElement>();
let sharedShadowCanvas: HTMLCanvasElement | null = null;

const _targetVec = new THREE.Vector3(0, 0.94, 0);
const _offsetVec = new THREE.Vector3();

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function superPow(v: number, exp: number): number {
  return Math.sign(v) * Math.pow(Math.abs(v), exp);
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

// Filters out isolated tiny cord loops / drawstring toggles while keeping pockets & main fabric spans
function filterMainGarmentBounds(
  data: Uint8ClampedArray,
  y: number,
  xStart: number,
  xEnd: number,
  W: number
): [number, number, number] {
  const runs: Array<[number, number, number]> = [];
  let inRun = false;
  let rStart = 0;

  for (let x = xStart; x <= xEnd; x++) {
    const opaque = data[(y * W + x) * 4 + 3] > 85;
    if (opaque && !inRun) {
      inRun = true;
      rStart = x;
    } else if (!opaque && inRun) {
      inRun = false;
      runs.push([rStart, x - 1, x - rStart]);
    }
  }
  if (inRun) {
    runs.push([rStart, xEnd, xEnd - rStart + 1]);
  }

  if (runs.length === 0) return [W, -1, 0];

  // Merge runs separated by small stitch gaps <= 7px
  const merged: Array<[number, number, number]> = [runs[0]];
  for (let i = 1; i < runs.length; i++) {
    const prev = merged[merged.length - 1];
    const cur = runs[i];
    if (cur[0] - prev[1] <= 7) {
      prev[1] = cur[1];
      prev[2] = prev[1] - prev[0] + 1;
    } else {
      merged.push([cur[0], cur[1], cur[2]]);
    }
  }

  const maxSpan = merged.reduce((acc, r) => Math.max(acc, r[2]), 0);
  const minKeepSpan = Math.max(20, Math.round(W * 0.022));

  let minX = W;
  let maxX = -1;
  let totalWidth = 0;

  for (let i = 0; i < merged.length; i++) {
    const [a, b, len] = merged[i];
    if (len >= minKeepSpan || (maxSpan < 40 && len >= 10)) {
      if (a < minX) minX = a;
      if (b > maxX) maxX = b;
      totalWidth += len;
    }
  }

  return [minX, maxX, totalWidth];
}

function extractAndDilateCutout(
  img: HTMLImageElement,
  removeWhiteBg: boolean,
  isLightGarment: boolean
): MaskData {
  // High-resolution 960x1200 baking keeps stitching, denim slub, rivets, and fabric weave razor-sharp
  const W = 960;
  const H = 1200;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2D canvas context unavailable');

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

    const minLuma = isLightGarment ? 242 : 226;
    const maxChroma = isLightGarment ? 14 : 28;

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

    // Remove 2px anti-aliased bright halo around white-bg JPG cutouts
    const trimThreshold = isLightGarment ? 236 : 204;
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

  // Record clean main garment silhouette bounds BEFORE edge color dilation
  let topY = H - 1;
  let botY = 0;
  const wholeBounds: Array<[number, number]> = new Array(H);
  let weightedX = 0;
  let totalOpaque = 0;
  const minSubstantiveRowWidth = Math.round(W * 0.08); // filters out thin dangling bottom cord loops

  for (let y = 0; y < H; y++) {
    const [minX, maxX, spanW] = filterMainGarmentBounds(data, y, 0, W - 1, W);
    if (spanW >= minSubstantiveRowWidth && maxX > minX) {
      if (y < topY) topY = y;
      if (y > botY) botY = y;
      wholeBounds[y] = [minX, maxX];
      weightedX += (minX + maxX) * 0.5 * spanW;
      totalOpaque += spanW;
    } else {
      wholeBounds[y] = [Math.round(W * 0.25), Math.round(W * 0.75)];
    }
  }

  if (botY <= topY + 60) {
    topY = Math.round(H * 0.08);
    botY = Math.round(H * 0.92);
  }

  const midX = totalOpaque > 0 ? Math.round(weightedX / totalOpaque) : Math.round(W * 0.5);
  const garmentH = botY - topY;

  let crotchY = Math.round(topY + garmentH * 0.39);
  const searchStart = Math.round(topY + garmentH * 0.25);
  const searchEnd = Math.round(topY + garmentH * 0.54);
  for (let y = searchStart; y <= searchEnd; y++) {
    const [rMin, rMax] = wholeBounds[y];
    const centerGap =
      data[(y * W + midX) * 4 + 3] < 60 &&
      data[(y * W + midX - 8) * 4 + 3] < 60 &&
      data[(y * W + midX + 8) * 4 + 3] < 60;
    if (centerGap && rMin < midX - 36 && rMax > midX + 36) {
      crotchY = y;
      break;
    }
  }

  const leftLegBounds: Array<[number, number]> = new Array(H);
  const rightLegBounds: Array<[number, number]> = new Array(H);

  for (let y = 0; y < H; y++) {
    const [lMinRaw, lMaxRaw, lSpan] = filterMainGarmentBounds(data, y, 0, midX - 1, W);
    const [rMinRaw, rMaxRaw, rSpan] = filterMainGarmentBounds(data, y, midX, W - 1, W);

    let lMin = lMinRaw;
    let lMax = lMaxRaw;
    let rMin = rMinRaw;
    let rMax = rMaxRaw;

    if (lSpan < 16 || lMax <= lMin + 14) {
      lMin = wholeBounds[y][0];
      lMax = midX - 8;
    }
    if (rSpan < 16 || rMax <= rMin + 14) {
      rMin = midX + 8;
      rMax = wholeBounds[y][1];
    }
    leftLegBounds[y] = [lMin, lMax];
    rightLegBounds[y] = [rMin, rMax];
  }

  // Keep a clean copy of original pixels for mask/relief queries
  const cleanPixels = new Uint8ClampedArray(data);

  // Dilate pure garment fabric colors outward by 10px so mipmapping/UV wrap NEVER bleeds white edges
  let valid = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    if (data[p * 4 + 3] >= 200) {
      valid[p] = 1;
      data[p * 4 + 3] = 255;
    } else {
      data[p * 4 + 3] = 0;
    }
  }

  for (let pass = 0; pass < 10; pass++) {
    const nextValid = new Uint8Array(valid);
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const p = y * W + x;
        if (valid[p]) continue;
        let sr = 0;
        let sg = 0;
        let sb = 0;
        let cnt = 0;
        const nIdx = [p - 1, p + 1, p - W, p + W];
        for (let k = 0; k < 4; k++) {
          const np = nIdx[k];
          if (valid[np]) {
            const np4 = np * 4;
            sr += data[np4];
            sg += data[np4 + 1];
            sb += data[np4 + 2];
            cnt++;
          }
        }
        if (cnt > 0) {
          const p4 = p * 4;
          data[p4] = Math.round(sr / cnt);
          data[p4 + 1] = Math.round(sg / cnt);
          data[p4 + 2] = Math.round(sb / cnt);
          data[p4 + 3] = 255;
          nextValid[p] = 1;
        }
      }
    }
    valid = nextValid;
  }

  // Fill remaining exterior pixels with median garment fabric tone
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumN = 0;
  for (let p = 0; p < W * H; p += 17) {
    if (cleanPixels[p * 4 + 3] >= 200) {
      sumR += cleanPixels[p * 4];
      sumG += cleanPixels[p * 4 + 1];
      sumB += cleanPixels[p * 4 + 2];
      sumN++;
    }
  }
  const medR = sumN > 0 ? Math.round(sumR / sumN) : 64;
  const medG = sumN > 0 ? Math.round(sumG / sumN) : 64;
  const medB = sumN > 0 ? Math.round(sumB / sumN) : 64;
  for (let p = 0; p < W * H; p++) {
    if (!valid[p]) {
      const p4 = p * 4;
      data[p4] = medR;
      data[p4 + 1] = medG;
      data[p4 + 2] = medB;
      data[p4 + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  return {
    canvas,
    pixels: cleanPixels,
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

async function getOrBuildGarmentAssets(spec: Pants3DSpec): Promise<BakedGarmentCacheEntry> {
  const cached = garmentCache.get(spec.id);
  if (cached) return cached;

  const isLight = spec.id === 'b5';
  const [frontImg, backImg] = await Promise.all([
    loadHtmlImage(spec.frontImage),
    loadHtmlImage(spec.backImage),
  ]);

  const frontMask = extractAndDilateCutout(frontImg, false, isLight);
  const backMask = extractAndDilateCutout(backImg, true, isLight);

  const entry: BakedGarmentCacheEntry = { frontMask, backMask };
  garmentCache.set(spec.id, entry);
  return entry;
}

function getFabricNormalCanvas(weaveKind: 'denim' | 'ripstop' | 'canvas'): HTMLCanvasElement {
  const existing = weaveCanvasCache.get(weaveKind);
  if (existing) return existing;

  const S = 256;
  const heightField = new Float32Array(S * S);

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let h = 0.5;
      if (weaveKind === 'ripstop') {
        const gridX = x % 10 === 0 || x % 10 === 1 ? 0.2 : 0;
        const gridY = y % 10 === 0 || y % 10 === 1 ? 0.2 : 0;
        h = 0.46 + Math.max(gridX, gridY) + ((((x + y) & 1) * 2 - 1) * 0.035);
      } else if (weaveKind === 'denim') {
        const diag = (x + y * 2) % 6;
        const twill = diag < 4 ? 0.12 : -0.13;
        const slub = Math.sin(x * 0.5) * 0.025 + Math.cos(y * 0.3) * 0.025;
        h = 0.5 + twill + slub;
      } else {
        const warp = Math.sin(x * 1.5) * 0.06;
        const weft = Math.cos(y * 1.5) * 0.06;
        h = 0.5 + warp + weft;
      }
      heightField[y * S + x] = Math.max(0, Math.min(1, h));
    }
  }

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = S;
  normalCanvas.height = S;
  const nCtx = normalCanvas.getContext('2d')!;
  const nData = nCtx.createImageData(S, S);
  const nd = nData.data;
  const strength = weaveKind === 'denim' ? 1.5 : weaveKind === 'ripstop' ? 1.45 : 1.15;

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

  weaveCanvasCache.set(weaveKind, normalCanvas);
  return normalCanvas;
}

function createStudioFloorTexture(centerHex: string, edgeHex: string): THREE.CanvasTexture {
  const S = 512;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(S / 2, S / 2, 18, S / 2, S / 2, S / 2);
  grad.addColorStop(0, centerHex);
  grad.addColorStop(0.45, centerHex);
  grad.addColorStop(1, edgeHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(211, 201, 172, 0.08)';
  ctx.lineWidth = 2;
  [105, 165, 225].forEach((r) => {
    ctx.beginPath();
    ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
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
    grad.addColorStop(0, 'rgba(6, 16, 6, 0.72)');
    grad.addColorStop(0.55, 'rgba(6, 16, 6, 0.32)');
    grad.addColorStop(1, 'rgba(6, 16, 6, 0)');
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
  tagPos: [number, number, number];
}

// Tailored 1:1 Photo-Matched 3D Trouser Builder:
// - Uses clean superellipse garment cross-section matching invisible-mannequin studio drape (no game-like sausage blobs)
// - Reads BOTH Front and Back photo silhouettes cleanly (ignoring dangling cord loops)
// - Angle-compensated UVs prevent horizontal pixel smearing on side seams
// - Sealed double-sided opaque interior (pelvis, sealed crotch bridge, inside legs, cuffs, & front pocket bags)
function createPhotoMatchedTrouserMesh(
  specId: string,
  frontMask: MaskData,
  backMask: MaskData,
  calib: ModelCalibration
): { outerGeo: THREE.BufferGeometry; liningGeo: THREE.BufferGeometry; metrics: UnifiedTrouserMetrics } {
  const fW = frontMask.width;
  const fH = frontMask.height;
  const bW = backMask.width;
  const bH = backMask.height;

  const yHem = 0.04;
  const yWaist = 1.84;
  const worldGarmentH = yWaist - yHem; // 1.80

  const frontGarmentPixH = Math.max(60, frontMask.botY - frontMask.topY);
  const backGarmentPixH = Math.max(60, backMask.botY - backMask.topY);
  const pixelToWorld = worldGarmentH / frontGarmentPixH;

  // Exact crotch split height from front cutout photo
  const crotchRatioFromBot = THREE.MathUtils.clamp(
    (frontMask.botY - frontMask.crotchY) / frontGarmentPixH,
    0.45,
    0.66
  );
  const ySplit = yHem + worldGarmentH * crotchRatioFromBot;

  const sampleSpanAndCx = (
    mask: MaskData,
    boundsArr: Array<[number, number]>,
    yStart: number,
    yEnd: number,
    tFromBottom: number // 0 = yEnd (bottom), 1 = yStart (top)
  ) => {
    const py = Math.max(
      mask.topY,
      Math.min(mask.botY, Math.round(THREE.MathUtils.lerp(yStart, yEnd, 1 - tFromBottom)))
    );
    let mnSum = 0;
    let mxSum = 0;
    let cnt = 0;
    for (let dy = -3; dy <= 3; dy++) {
      const sy = Math.max(mask.topY, Math.min(mask.botY, py + dy));
      mnSum += boundsArr[sy][0];
      mxSum += boundsArr[sy][1];
      cnt++;
    }
    const mn = mnSum / cnt;
    const mx = mxSum / cnt;
    const pScale = worldGarmentH / Math.max(60, mask.botY - mask.topY);
    const rx = Math.max(0.06, (mx - mn) * 0.5 * pScale);
    const cx = ((mn + mx) * 0.5 - mask.midX) * pScale;
    return { mn, mx, rx, cx, py };
  };

  // Sample front waist & hip (using backMask for waist width when front photo shows open collar)
  const frontWaistCheckV = calib.frontWaistSkipRatio > 0.05 ? 0.88 : 0.96;
  const waistF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, frontWaistCheckV);
  const waistB = sampleSpanAndCx(backMask, backMask.wholeBounds, backMask.topY, backMask.crotchY, 0.96);
  const hipF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 0.12);

  const waistRx = THREE.MathUtils.lerp(waistF.rx, waistB.rx, 0.35);
  const waistRz = waistRx * 0.62;

  // Bifurcation geometry matching exact hip proportions
  const splitLegRx = Math.max(0.12, hipF.rx * 0.515);
  const splitLegRz = splitLegRx * 0.82;
  const splitCrotchHalfZ = 0.038;
  const splitInnerAngle = Math.acos(Math.min(0.97, splitCrotchHalfZ / splitLegRz));
  const splitLegCx = splitLegRx * Math.sin(splitInnerAngle);

  const outerHalfCols = 36;
  const pelvisCols = outerHalfCols * 2; // 72
  const innerArcCols = 12;
  const legCols = outerHalfCols + innerArcCols; // 48
  const pelvisRows = 26;
  const legRows = 38;

  const posList: number[] = [];
  const uvFrontList: number[] = [];
  const uvBackList: number[] = [];
  const aoList: number[] = [];
  const idxList: number[] = [];

  const pushVert = (
    x: number,
    y: number,
    z: number,
    uF: number,
    vF: number,
    uB: number,
    vB: number,
    ao = 1.0
  ) => {
    const idx = posList.length / 3;
    posList.push(x, y, z);
    uvFrontList.push(uF, vF);
    uvBackList.push(uB, vB);
    aoList.push(ao, ao, ao);
    return idx;
  };

  const phiEdge = Math.PI * 0.5 + splitInnerAngle;
  const evalSplitRingPoint = (side: 1 | -1, alpha: number) => {
    const ang = THREE.MathUtils.lerp(phiEdge, -phiEdge, alpha);
    const x = side * (splitLegCx + splitLegRx * Math.cos(ang));
    const z = splitLegRz * Math.sin(ang);
    return { x, z };
  };

  // Angle-compensated horizontal sample ratio: stays 1:1 on front/back faces while preventing side-seam texture smearing
  const evalAngleCompensatedRatio = (nxSin: number, nzCos: number): number => {
    const ang = Math.atan2(nxSin, nzCos); // -PI..PI, 0 = front (+Z)
    if (Math.abs(ang) <= Math.PI * 0.5) {
      return THREE.MathUtils.lerp(nxSin, ang / (Math.PI * 0.5), 0.22);
    }
    return Math.sign(nxSin || 1) * 0.99;
  };

  // Compute Front & Back UVs for Pelvis directly from photo bounds
  const computePelvisUVs = (x: number, sinP: number, cosP: number, vPelvis: number) => {
    // For open-waist photos (b2/b6), bowl curve skips interior back collar cleanly at front center while climbing to side waistband
    const fWorldApproxNx = THREE.MathUtils.clamp(sinP, -1, 1);
    const bowlFactor = calib.frontWaistSkipRatio > 0.05 ? 1.0 - 0.78 * fWorldApproxNx * fWorldApproxNx : 1.0;
    const fTop =
      frontMask.topY +
      frontGarmentPixH * calib.frontWaistSkipRatio * smoothstep(-0.08, 0.7, cosP) * bowlFactor;
    const bTop = backMask.topY + backGarmentPixH * calib.backWaistSkipRatio;
    const fY = THREE.MathUtils.lerp(frontMask.crotchY + 4, fTop, vPelvis);
    const bY = THREE.MathUtils.lerp(backMask.crotchY + 4, bTop, vPelvis);

    const fRow = Math.max(frontMask.topY, Math.min(frontMask.botY, Math.round(fY)));
    const bRow = Math.max(backMask.topY, Math.min(backMask.botY, Math.round(bY)));
    const [fMin, fMax] = frontMask.wholeBounds[fRow];
    const [bMin, bMax] = backMask.wholeBounds[bRow];

    const fSpan = Math.max(16, fMax - fMin);
    const bSpan = Math.max(16, bMax - bMin);
    const fMid = (fMin + fMax) * 0.5;
    const bMid = (bMin + bMax) * 0.5;

    const fWorldHalf = fSpan * 0.5 * pixelToWorld;
    const nxGeom = THREE.MathUtils.clamp(x / Math.max(0.05, fWorldHalf), -1, 1);

    const uRatioF = evalAngleCompensatedRatio(nxGeom, cosP);
    const uRatioB = evalAngleCompensatedRatio(nxGeom, -cosP);

    const fPx = fMid + uRatioF * (fSpan * 0.488);
    const bPx = bMid - uRatioB * (bSpan * 0.488);

    return {
      uF: THREE.MathUtils.clamp(fPx / fW, 0.002, 0.998),
      vF: 1.0 - THREE.MathUtils.clamp(fY / fH, 0.002, 0.998),
      uB: THREE.MathUtils.clamp(bPx / bW, 0.002, 0.998),
      vB: 1.0 - THREE.MathUtils.clamp(bY / bH, 0.002, 0.998),
    };
  };

  // 1. PELVIS & WAIST TRUNK (vPelvis: 0 crotch -> 1 waist)
  const pelvisGrid: number[][] = [];
  for (let r = 0; r <= pelvisRows; r++) {
    const v = r / pelvisRows;
    const baseY = THREE.MathUtils.lerp(ySplit, yWaist, v);

    const sliceF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, v);
    const sliceB = sampleSpanAndCx(backMask, backMask.wholeBounds, backMask.topY, backMask.crotchY, v);
    const ovalRx = THREE.MathUtils.lerp(sliceF.rx, sliceB.rx, 0.22);
    const ovalRz = ovalRx * 0.62;
    const splitBlend = 1 - smoothstep(0.0, 0.5, v);

    const row: number[] = [];
    for (let c = 0; c <= pelvisCols; c++) {
      const u = c / pelvisCols;
      const phi = u * Math.PI * 2;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      // Tailored superellipse cross-section keeps front & back flat-draped like the studio photos
      const sSinP = superPow(sinP, 0.88);
      const sCosP = superPow(cosP, 0.88);
      const seatDepth = cosP < 0 ? 1.12 - 0.06 * v : 1.0;

      let ox = sliceF.cx * (1 - splitBlend) + sSinP * ovalRx;
      let oz = sCosP * ovalRz * seatDepth;

      if (splitBlend > 0) {
        const isRightHalf = c <= outerHalfCols;
        const side: 1 | -1 = isRightHalf ? 1 : -1;
        const alpha = isRightHalf ? c / outerHalfCols : 1 - (c - outerHalfCols) / outerHalfCols;
        const sp = evalSplitRingPoint(side, alpha);
        ox = THREE.MathUtils.lerp(ox, sp.x, splitBlend);
        oz = THREE.MathUtils.lerp(oz, sp.z, splitBlend);
      }

      const { uF, vF, uB, vB } = computePelvisUVs(ox, sinP, cosP, v);

      // Clean, strictly photo-aligned structural shaping (zero fake blobs)
      let relief = 0;
      let pelvisAO = 1.0;

      if (v > 0.925) {
        relief += 0.004 * smoothstep(0.925, 0.96, v);
      }

      if (calib.pleatRidges && cosP > 0.35) {
        const p1 = Math.exp(-Math.pow((sinP - 0.32) * 10, 2)) + Math.exp(-Math.pow((sinP + 0.32) * 10, 2));
        const p2 = Math.exp(-Math.pow((sinP - 0.56) * 11, 2)) + Math.exp(-Math.pow((sinP + 0.56) * 11, 2));
        relief += (p1 * 0.011 + p2 * 0.008) * smoothstep(0.35, 0.85, cosP) * smoothstep(0.05, 0.35, v);
      }
      ox += sinP * relief;
      oz += cosP * relief;

      const frontDip = calib.frontWaistSkipRatio > 0.05 ? -0.018 : -0.006;
      const waistTilt =
        v > 0.72
          ? ((v - 0.72) / 0.28) * (cosP < 0 ? 0.016 * Math.abs(cosP) : frontDip * cosP)
          : 0;
      const crotchDip = v < 0.22 ? -0.026 * Math.pow(Math.abs(cosP), 2.5) * (1 - v / 0.22) : 0;

      if (v < 0.22) {
        pelvisAO = Math.min(pelvisAO, 1 - 0.1 * (1 - v / 0.22) * (1 - Math.abs(sinP) * 0.45));
      }

      row.push(pushVert(ox, baseY + waistTilt + crotchDip, oz, uF, vF, uB, vB, pelvisAO));
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

  // 2. LEFT & RIGHT LEGS (1:1 silhouette from BOTH front & back photos)
  const evalLegSlice = (isLeft: boolean, vLeg: number) => {
    const fBounds = isLeft ? frontMask.leftLegBounds : frontMask.rightLegBounds;
    const bBounds = isLeft ? backMask.rightLegBounds : backMask.leftLegBounds;
    const slF = sampleSpanAndCx(frontMask, fBounds, frontMask.crotchY, frontMask.botY, vLeg);
    const slB = sampleSpanAndCx(backMask, bBounds, backMask.crotchY, backMask.botY, vLeg);
    const splitBlend = smoothstep(0.76, 1.0, vLeg);

    let cutMod = 0;
    if (calib.cuffStep && vLeg < 0.09 && vLeg > 0.008) {
      const cuffBody = smoothstep(0.008, 0.026, vLeg) * (1 - smoothstep(0.078, 0.09, vLeg));
      cutMod = 0.007 * cuffBody;
    }

    const baseRx = THREE.MathUtils.lerp(slF.rx, slB.rx, 0.22) + cutMod;
    const rx = THREE.MathUtils.lerp(baseRx, splitLegRx, splitBlend);
    const rz = rx * (0.82 - 0.04 * splitBlend);
    const cx = THREE.MathUtils.lerp(slF.cx, isLeft ? -splitLegCx : splitLegCx, splitBlend);
    const cz = Math.sin(vLeg * Math.PI) * 0.012;
    return { rx, rz, cx, cz, fMin: slF.mn, fMax: slF.mx, fPy: slF.py };
  };

  const legGrids: { left: number[][]; right: number[][] } = { left: [], right: [] };

  const buildLeg = (isLeft: boolean) => {
    const side: 1 | -1 = isLeft ? -1 : 1;
    const halfInnerCols = Math.floor(innerArcCols / 2);
    const bBoundsArr = isLeft ? backMask.rightLegBounds : backMask.leftLegBounds;

    const legGrid: number[][] = [];
    for (let r = 0; r <= legRows; r++) {
      const vLeg = r / legRows; // 0 hem -> 1 split
      const baseY = THREE.MathUtils.lerp(yHem, ySplit, vLeg);
      const prof = evalLegSlice(isLeft, vLeg);
      const topSplitBlend = smoothstep(0.84, 1.0, vLeg);

      const bY = THREE.MathUtils.lerp(backMask.botY - 1, backMask.crotchY, vLeg);
      const bRow = Math.max(backMask.topY, Math.min(backMask.botY, Math.round(bY)));
      const [bMin, bMax] = bBoundsArr[bRow];
      const bSpan = Math.max(16, bMax - bMin);
      const bMid = (bMin + bMax) * 0.5;

      const fSpan = Math.max(16, prof.fMax - prof.fMin);
      const fMid = (prof.fMin + prof.fMax) * 0.5;

      const row: number[] = [];
      for (let c = 0; c <= legCols; c++) {
        let px = 0;
        let pz = 0;
        let py = baseY;

        if (c < halfInnerCols) {
          const tInner = 0.5 + (c / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = prof.cx + side * prof.rx * superPow(Math.cos(ang), 0.9);
          const legZ = prof.cz + prof.rz * superPow(Math.sin(ang), 0.9);

          const spZ = THREE.MathUtils.lerp(-splitCrotchHalfZ, splitCrotchHalfZ, tInner);
          px = THREE.MathUtils.lerp(legX, 0, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, spZ, topSplitBlend);

          const saddleArch = Math.sin(tInner * Math.PI);
          py += -0.028 * smoothstep(0.8, 1.0, vLeg) * (1 - 0.15 * saddleArch);
          if (vLeg > 0.85) py -= 0.012 * saddleArch * smoothstep(0.85, 1.0, vLeg);
        } else if (c <= halfInnerCols + outerHalfCols) {
          const alpha = (c - halfInnerCols) / outerHalfCols;
          const ang = THREE.MathUtils.lerp(phiEdge, -phiEdge, alpha);

          const sp = evalSplitRingPoint(side, alpha);
          const legX = prof.cx + side * prof.rx * superPow(Math.cos(ang), 0.9);
          const legZ = prof.cz + prof.rz * superPow(Math.sin(ang), 0.9);

          px = THREE.MathUtils.lerp(legX, sp.x, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, sp.z, topSplitBlend);
          if (vLeg > 0.8) {
            const edgeCenterWeight = Math.pow(Math.abs(alpha - 0.5) * 2, 2.8);
            py += -0.028 * edgeCenterWeight * smoothstep(0.8, 1.0, vLeg);
          }
        } else {
          const tInner = ((c - halfInnerCols - outerHalfCols) / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = prof.cx + side * prof.rx * superPow(Math.cos(ang), 0.9);
          const legZ = prof.cz + prof.rz * superPow(Math.sin(ang), 0.9);

          const spZ = THREE.MathUtils.lerp(-splitCrotchHalfZ, splitCrotchHalfZ, tInner);
          px = THREE.MathUtils.lerp(legX, 0, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, spZ, topSplitBlend);

          const saddleArch = Math.sin(tInner * Math.PI);
          py += -0.028 * smoothstep(0.8, 1.0, vLeg) * (1 - 0.15 * saddleArch);
          if (vLeg > 0.85) py -= 0.012 * saddleArch * smoothstep(0.85, 1.0, vLeg);
        }

        const lx = px - prof.cx;
        const lz = pz - prof.cz;
        const texTheta = Math.atan2(lx, lz);
        const outDirX = Math.sin(texTheta);
        const outDirZ = Math.cos(texTheta);

        // Angle-compensated front/back UVs (zero side-seam horizontal texture smearing!)
        const nxGeom = THREE.MathUtils.clamp(lx / Math.max(0.02, prof.rx), -1, 1);
        const uRatioF = evalAngleCompensatedRatio(nxGeom, outDirZ);
        const uRatioB = evalAngleCompensatedRatio(nxGeom, -outDirZ);

        const fPx = fMid + uRatioF * (fSpan * 0.488);
        const bPx = bMid - uRatioB * (bSpan * 0.488);

        const uF = THREE.MathUtils.clamp(fPx / fW, 0.002, 0.998);
        const vF = 1.0 - THREE.MathUtils.clamp(prof.fPy / fH, 0.002, 0.998);
        const uB = THREE.MathUtils.clamp(bPx / bW, 0.002, 0.998);
        const vB = 1.0 - THREE.MathUtils.clamp(bY / bH, 0.002, 0.998);

        // Clean, restrained sculptural silhouettes matched strictly to each garment
        let disp = 0;
        let legAO = 1.0;

        if (calib.cargoBulge && vLeg > 0.54 && vLeg < 0.84) {
          const outerSide = isLeft ? smoothstep(-0.38, -0.92, outDirX) : smoothstep(0.38, 0.92, outDirX);
          const pocketBox = smoothstep(0.54, 0.62, vLeg) * (1 - smoothstep(0.76, 0.84, vLeg));
          disp += 0.02 * outerSide * pocketBox * (1 - topSplitBlend);
        } else if (calib.kneeDarts && vLeg > 0.39 && vLeg < 0.64) {
          const kneeZone = Math.sin(((vLeg - 0.39) / 0.25) * Math.PI);
          disp += 0.011 * kneeZone * smoothstep(0.25, 0.85, outDirZ);
        } else if (calib.doubleKnee && vLeg > 0.28 && vLeg < 0.88) {
          const panelStep = smoothstep(0.28, 0.32, vLeg) * (1 - smoothstep(0.84, 0.88, vLeg));
          disp += 0.004 * panelStep * smoothstep(0.35, 0.72, outDirZ);
        } else if (calib.puddleHem && vLeg < 0.22) {
          const stackZone = 1 - vLeg / 0.22;
          const phaseOffset = isLeft ? 1.2 : -0.6;
          disp += 0.01 * stackZone * Math.sin(vLeg * 30 + texTheta * 2 + phaseOffset);
        } else if (calib.pleatRidges && vLeg > 0.42) {
          const frontCrease = Math.exp(-Math.pow(outDirX * 5.2, 2)) * smoothstep(0.4, 0.92, outDirZ);
          disp += 0.01 * frontCrease * (1 - topSplitBlend * 0.3);
        }

        px += outDirX * disp * (1 - topSplitBlend * 0.7);
        pz += outDirZ * disp * (1 - topSplitBlend * 0.7);

        // Subtle inner-thigh contact occlusion only near crotch saddle
        const isInnerVert = c < halfInnerCols || c > halfInnerCols + outerHalfCols;
        if (isInnerVert && vLeg > 0.72) {
          legAO = Math.min(legAO, 1 - 0.14 * smoothstep(0.72, 1.0, vLeg));
        }

        row.push(pushVert(px, py, pz, uF, vF, uB, vB, legAO));
      }
      legGrid.push(row);
    }

    if (isLeft) {
      legGrids.left = legGrid;
    } else {
      legGrids.right = legGrid;
    }

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

  buildLeg(false);
  buildLeg(true);

  const outerGeo = new THREE.BufferGeometry();
  outerGeo.setAttribute('position', new THREE.Float32BufferAttribute(posList, 3));
  outerGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvFrontList, 2));
  outerGeo.setAttribute('aUvBack', new THREE.Float32BufferAttribute(uvBackList, 2));
  outerGeo.setAttribute('color', new THREE.Float32BufferAttribute(aoList, 3));
  outerGeo.setIndex(idxList);
  outerGeo.computeVertexNormals();
  weldCoincidentNormals(outerGeo, posList.length / 3);

  // 3. COMPLETE SEALED OPAQUE GARMENT INTERIOR (DoubleSide + Sealed Crotch Saddle + Pocket Bags + Rims)
  const posAttr = outerGeo.attributes.position as THREE.BufferAttribute;
  const normAttr = outerGeo.attributes.normal as THREE.BufferAttribute;

  const linPos: number[] = [];
  const linUv: number[] = [];
  const linColor: number[] = [];
  const linIdx: number[] = [];

  const baseLinC = new THREE.Color(calib.liningColor);
  const pocketC = new THREE.Color(calib.pocketBagColor);
  const waistTapeC = baseLinC.clone().lerp(pocketC, 0.35);

  const pushInnerVert = (
    x: number,
    y: number,
    z: number,
    u: number,
    v: number,
    cObj: THREE.Color,
    ao: number
  ) => {
    const idx = linPos.length / 3;
    linPos.push(x, y, z);
    linUv.push(u, v);
    linColor.push(cObj.r * ao, cObj.g * ao, cObj.b * ao);
    return idx;
  };

  const clothThickness = 0.0044;
  const offsetInwardVert = (outerIdx: number, thickness: number, lockY: boolean) => {
    const ox = posAttr.getX(outerIdx);
    const oy = posAttr.getY(outerIdx);
    const oz = posAttr.getZ(outerIdx);
    const nx = normAttr.getX(outerIdx);
    const ny = normAttr.getY(outerIdx);
    const nz = normAttr.getZ(outerIdx);
    return {
      x: ox - nx * thickness,
      y: lockY ? oy : oy - ny * thickness * 0.35,
      z: oz - nz * thickness,
    };
  };

  // 3a. Full Inner Pelvis Wall (r: 0 split -> pelvisRows waist)
  const innerPelvisGrid: number[][] = [];
  for (let r = 0; r <= pelvisRows; r++) {
    const v = r / pelvisRows;
    const isWaistBand = v > 0.91;
    const colTint = isWaistBand ? waistTapeC : baseLinC;
    const cavAO = isWaistBand ? 0.9 + 0.08 * ((v - 0.91) / 0.09) : 0.48 + 0.4 * v;

    const row: number[] = [];
    for (let c = 0; c <= pelvisCols; c++) {
      const p = offsetInwardVert(pelvisGrid[r][c], v > 0.92 ? 0.0055 : clothThickness, r === pelvisRows);
      row.push(pushInnerVert(p.x, p.y, p.z, c / pelvisCols, v * 0.45, colTint, cavAO));
    }
    innerPelvisGrid.push(row);
  }
  for (let r = 0; r < pelvisRows; r++) {
    for (let c = 0; c < pelvisCols; c++) {
      const a = innerPelvisGrid[r][c];
      const b = innerPelvisGrid[r][c + 1];
      const d = innerPelvisGrid[r + 1][c];
      const e = innerPelvisGrid[r + 1][c + 1];
      linIdx.push(a, d, b, b, d, e);
    }
  }

  // 3b. Rounded Folded Top Waistband Rim connecting outer waist -> inner waist
  const outerTopRing: number[] = [];
  const midRimRing: number[] = [];
  const topOuterRow = pelvisGrid[pelvisRows];
  const topInnerRow = innerPelvisGrid[pelvisRows];
  for (let c = 0; c <= pelvisCols; c++) {
    const oi = topOuterRow[c];
    const ii = topInnerRow[c];
    const ox = posAttr.getX(oi);
    const oy = posAttr.getY(oi);
    const oz = posAttr.getZ(oi);
    const ix = linPos[ii * 3];
    const iy = linPos[ii * 3 + 1];
    const iz = linPos[ii * 3 + 2];

    outerTopRing.push(pushInnerVert(ox, oy, oz, c / pelvisCols, 0.96, waistTapeC, 0.96));
    midRimRing.push(
      pushInnerVert((ox + ix) * 0.5, (oy + iy) * 0.5 + 0.0042, (oz + iz) * 0.5, c / pelvisCols, 0.98, waistTapeC, 1.0)
    );
  }
  for (let c = 0; c < pelvisCols; c++) {
    linIdx.push(
      outerTopRing[c],
      outerTopRing[c + 1],
      midRimRing[c],
      outerTopRing[c + 1],
      midRimRing[c + 1],
      midRimRing[c]
    );
    linIdx.push(
      midRimRing[c],
      midRimRing[c + 1],
      topInnerRow[c],
      midRimRing[c + 1],
      topInnerRow[c + 1],
      topInnerRow[c]
    );
  }

  // 3c. Full Inner Left & Right Leg Tubes + Bottom Hem Rolled Rim
  const innerLegTopRows: { left: number[]; right: number[] } = { left: [], right: [] };
  const buildInnerLeg = (isLeft: boolean) => {
    const outerGrid = isLeft ? legGrids.left : legGrids.right;
    const innerLegGrid: number[][] = [];
    for (let r = 0; r <= legRows; r++) {
      const vLeg = r / legRows;
      // Rich interior visibility (bright enough from top view without crushing into a black hole)
      const cavAO =
        vLeg < 0.25 ? THREE.MathUtils.lerp(0.45, 0.34, vLeg / 0.25) : THREE.MathUtils.lerp(0.34, 0.52, (vLeg - 0.25) / 0.75);
      const row: number[] = [];
      for (let c = 0; c <= legCols; c++) {
        const p = offsetInwardVert(outerGrid[r][c], clothThickness, r === 0);
        row.push(pushInnerVert(p.x, p.y, p.z, c / legCols, vLeg, baseLinC, cavAO));
      }
      innerLegGrid.push(row);
    }

    if (isLeft) innerLegTopRows.left = innerLegGrid[legRows];
    else innerLegTopRows.right = innerLegGrid[legRows];

    for (let r = 0; r < legRows; r++) {
      for (let c = 0; c < legCols; c++) {
        const a = innerLegGrid[r][c];
        const b = innerLegGrid[r][c + 1];
        const d = innerLegGrid[r + 1][c];
        const e = innerLegGrid[r + 1][c + 1];
        if (isLeft) {
          linIdx.push(a, b, d, b, e, d);
        } else {
          linIdx.push(a, d, b, b, d, e);
        }
      }
    }

    // Rolled bottom hem edge
    const outerHemRing: number[] = [];
    const midHemRing: number[] = [];
    const outBotRow = outerGrid[0];
    const inBotRow = innerLegGrid[0];
    for (let c = 0; c <= legCols; c++) {
      const oi = outBotRow[c];
      const ii = inBotRow[c];
      const ox = posAttr.getX(oi);
      const oy = posAttr.getY(oi);
      const oz = posAttr.getZ(oi);
      const ix = linPos[ii * 3];
      const iy = linPos[ii * 3 + 1];
      const iz = linPos[ii * 3 + 2];

      outerHemRing.push(pushInnerVert(ox, oy, oz, c / legCols, 0.0, baseLinC, 0.55));
      midHemRing.push(
        pushInnerVert((ox + ix) * 0.5, (oy + iy) * 0.5 - 0.0025, (oz + iz) * 0.5, c / legCols, 0.02, baseLinC, 0.48)
      );
    }
    for (let c = 0; c < legCols; c++) {
      if (isLeft) {
        linIdx.push(
          outerHemRing[c],
          outerHemRing[c + 1],
          midHemRing[c],
          outerHemRing[c + 1],
          midHemRing[c + 1],
          midHemRing[c]
        );
        linIdx.push(
          midHemRing[c],
          midHemRing[c + 1],
          inBotRow[c],
          midHemRing[c + 1],
          inBotRow[c + 1],
          inBotRow[c]
        );
      } else {
        linIdx.push(
          outerHemRing[c],
          midHemRing[c],
          outerHemRing[c + 1],
          outerHemRing[c + 1],
          midHemRing[c],
          midHemRing[c + 1]
        );
        linIdx.push(
          midHemRing[c],
          inBotRow[c],
          midHemRing[c + 1],
          midHemRing[c + 1],
          inBotRow[c],
          inBotRow[c + 1]
        );
      }
    }
  };

  buildInnerLeg(false);
  buildInnerLeg(true);

  // 3d. Airtight Inner Crotch Saddle Bridge sealing innerPelvis[0] <-> innerLeftLeg[top] <-> innerRightLeg[top]
  const bridgeHalf = Math.floor(innerArcCols / 2);
  const rightTop = innerLegTopRows.right;
  const leftTop = innerLegTopRows.left;
  const stitchBridgeSide = (topRing: number[]) => {
    for (let i = 0; i < bridgeHalf; i++) {
      const i0 = topRing[i];
      const i1 = topRing[i + 1];
      const j0 = topRing[legCols - i];
      const j1 = topRing[legCols - i - 1];
      linIdx.push(i0, i1, j0, i1, j1, j0);
    }
  };
  stitchBridgeSide(rightTop);
  stitchBridgeSide(leftTop);

  // Also seal front-to-back crotch seam between innerRightLeg[0] and innerLeftLeg[0] across x = 0
  for (let i = 0; i < bridgeHalf; i++) {
    const r0 = rightTop[i];
    const r1 = rightTop[i + 1];
    const l0 = leftTop[legCols - i];
    const l1 = leftTop[legCols - i - 1];
    linIdx.push(r0, r1, l0, r1, l1, l0);
  }
  const pelSplitFront = innerPelvisGrid[0][0];
  const pelSplitBack = innerPelvisGrid[0][outerHalfCols];
  linIdx.push(pelSplitFront, rightTop[0], leftTop[legCols]);
  linIdx.push(pelSplitBack, leftTop[bridgeHalf], rightTop[bridgeHalf]);

  // 3e. Cotton Inner Pocket Bags visible from Top View on Left & Right Front Hips
  const buildInnerPocketBag = (isLeft: boolean) => {
    const startCol = isLeft ? pelvisCols - 15 : 4;
    const endCol = isLeft ? pelvisCols - 4 : 15;
    const minRow = Math.round(pelvisRows * 0.46);
    const maxRow = Math.round(pelvisRows * 0.9);
    const pGrid: number[][] = [];
    for (let r = minRow; r <= maxRow; r++) {
      const tV = (r - minRow) / (maxRow - minRow);
      const row: number[] = [];
      for (let c = startCol; c <= endCol; c++) {
        const tU = (c - startCol) / (endCol - startCol);
        const oi = pelvisGrid[r][c];
        const nx = normAttr.getX(oi);
        const nz = normAttr.getZ(oi);
        const bagPouch = 0.0055 + 0.008 * Math.sin(tU * Math.PI) * Math.sin(tV * Math.PI);
        const px = posAttr.getX(oi) - nx * bagPouch;
        const py = posAttr.getY(oi);
        const pz = posAttr.getZ(oi) - nz * bagPouch;
        const bagAO = 0.56 + 0.34 * tV;
        row.push(pushInnerVert(px, py, pz, tU * 0.5, tV * 0.5, pocketC, bagAO));
      }
      pGrid.push(row);
    }
    const rCnt = pGrid.length - 1;
    const cCnt = pGrid[0].length - 1;
    for (let r = 0; r < rCnt; r++) {
      for (let c = 0; c < cCnt; c++) {
        const a = pGrid[r][c];
        const b = pGrid[r][c + 1];
        const d = pGrid[r + 1][c];
        const e = pGrid[r + 1][c + 1];
        linIdx.push(a, d, b, b, d, e);
      }
    }
  };
  buildInnerPocketBag(false);
  buildInnerPocketBag(true);

  const liningGeo = new THREE.BufferGeometry();
  liningGeo.setAttribute('position', new THREE.Float32BufferAttribute(linPos, 3));
  liningGeo.setAttribute('uv', new THREE.Float32BufferAttribute(linUv, 2));
  liningGeo.setAttribute('color', new THREE.Float32BufferAttribute(linColor, 3));
  liningGeo.setIndex(linIdx);
  liningGeo.computeVertexNormals();

  const backInnerIdx = innerPelvisGrid[pelvisRows - 1][Math.floor(pelvisCols / 2)];
  const tagPos: [number, number, number] = [
    linPos[backInnerIdx * 3],
    linPos[backInnerIdx * 3 + 1] - 0.01,
    linPos[backInnerIdx * 3 + 2] + 0.004,
  ];

  void specId;

  return {
    outerGeo,
    liningGeo,
    metrics: {
      waistRx,
      waistRz,
      waistY: yWaist,
      tagPos,
    },
  };
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
    const dist = 2.46;
    switch (presetRequest.key) {
      case 'hero': {
        const p = STUDIO_PROFILES[spec.id] ?? DEFAULT_STUDIO_PROFILE;
        presetTargetRef.current = new THREE.Vector3(...p.heroCam);
        break;
      }
      case 'front':
        presetTargetRef.current = new THREE.Vector3(0, 1.03, dist);
        break;
      case 'angle45':
        presetTargetRef.current = new THREE.Vector3(dist * 0.707, 1.08, dist * 0.707);
        break;
      case 'side':
        presetTargetRef.current = new THREE.Vector3(dist, 1.03, 0.02);
        break;
      case 'back':
        presetTargetRef.current = new THREE.Vector3(0, 1.03, -dist);
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
    scene.fog = new THREE.FogExp2(stageProfile.bgHex, 0.078);
    scene.environmentIntensity = 0.16;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 35);
    camera.position.set(...stageProfile.heroCam);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(_targetVec);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 1.45;
    controls.maxDistance = 4.1;
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

    // Photo-faithful balanced studio lighting: broad soft wrap preserves true photographed folds & color
    const hemiLight = new THREE.HemisphereLight(0xf3f7ef, stageProfile.bgHex, 0.96);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffdf8, 0.78);
    keyLight.position.set(2.4, 3.8, 2.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 14;
    const d = 1.65;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.00025;
    keyLight.shadow.normalBias = 0.015;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ebd9, 0.44);
    fillLight.position.set(-2.9, 2.2, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(stageProfile.rimHex, 0.72);
    rimLight.position.set(-1.5, 2.6, -3.0);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [envTex];
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. DEEP GREEN ARCHITECTURAL STUDIO FLOOR + CURVED CYCLORAMA + INSTANCED COLUMNS
    const floorTex = createStudioFloorTexture(stageProfile.floorCenterHex, stageProfile.floorEdgeHex);
    const floorGeo = new THREE.CircleGeometry(7.2, 48);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.9,
      metalness: 0.04,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.042;
    floorMesh.receiveShadow = true;
    rootGroup.add(floorMesh);

    const cycGeo = new THREE.CylinderGeometry(4.6, 4.6, 5.2, 40, 1, true);
    const cycMat = new THREE.MeshStandardMaterial({
      color: stageProfile.wallHex,
      roughness: 0.94,
      metalness: 0.02,
      side: THREE.BackSide,
    });
    const cycMesh = new THREE.Mesh(cycGeo, cycMat);
    cycMesh.position.y = 2.45;
    rootGroup.add(cycMesh);

    const colGeo = new THREE.CylinderGeometry(0.11, 0.125, 5.0, 10);
    const colMat = new THREE.MeshStandardMaterial({
      color: stageProfile.columnHex,
      roughness: 0.76,
      metalness: 0.12,
    });
    const colCount = 10;
    const colInstanced = new THREE.InstancedMesh(colGeo, colMat, colCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < colCount; i++) {
      const ang = (i / colCount) * Math.PI * 2 + 0.25;
      dummy.position.set(Math.sin(ang) * 4.2, 2.35, Math.cos(ang) * 4.2);
      dummy.rotation.set(0, ang, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      colInstanced.setMatrixAt(i, dummy.matrix);
    }
    colInstanced.instanceMatrix.needsUpdate = true;
    colInstanced.computeBoundingSphere();
    rootGroup.add(colInstanced);

    // 2. LAYERED ARCHITECTURAL SHOWROOM PODIUM + SOFT CONTACT SHADOW
    const plinthMat = new THREE.MeshStandardMaterial({
      color: stageProfile.plinthHex,
      metalness: 0.32,
      roughness: 0.52,
    });
    const plinthRimMat = new THREE.MeshStandardMaterial({
      color: stageProfile.plinthAccentHex,
      metalness: 0.48,
      roughness: 0.3,
      emissive: stageProfile.plinthAccentHex,
      emissiveIntensity: 0.12,
    });

    const baseStepGeo = new THREE.CylinderGeometry(0.92, 0.98, 0.022, 48);
    const baseStepMesh = new THREE.Mesh(baseStepGeo, plinthMat);
    baseStepMesh.position.y = -0.031;
    baseStepMesh.receiveShadow = true;
    rootGroup.add(baseStepMesh);

    const plinthGeo = new THREE.CylinderGeometry(0.76, 0.8, 0.026, 48);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.013;
    plinthMesh.receiveShadow = true;
    rootGroup.add(plinthMesh);

    const ringGeo = new THREE.TorusGeometry(0.76, 0.0055, 10, 56);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, plinthRimMat);
    ringMesh.position.y = 0.001;
    rootGroup.add(ringMesh);

    const shadowTex = getContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(1.42, 1.42);
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

    const moteCount = 36;
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      const a = i * 2.39996;
      const rad = 1.25 + (i % 7) * 0.35;
      motePos[i * 3] = Math.cos(a) * rad;
      motePos[i * 3 + 1] = 0.25 + ((i * 37) % 100) * 0.02;
      motePos[i * 3 + 2] = Math.sin(a) * rad;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: stageProfile.rimHex,
      size: 0.018,
      transparent: true,
      opacity: 0.28,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const motePoints = new THREE.Points(moteGeo, moteMat);
    rootGroup.add(motePoints);

    disposables.push(
      floorTex,
      floorGeo,
      floorMat,
      cycGeo,
      cycMat,
      colGeo,
      colMat,
      plinthMat,
      plinthRimMat,
      baseStepGeo,
      plinthGeo,
      ringGeo,
      shadowTex,
      shadowPlaneGeo,
      shadowPlaneMat,
      moteGeo,
      moteMat
    );

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
      const zoomRatio = Number((2.46 / Math.max(0.8, dist)).toFixed(2));
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
        const nextDist = THREE.MathUtils.clamp(currentDist + zoomTargetDistRef.current, 1.45, 4.1);
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
      .then(({ frontMask, backMask }) => {
        if (disposed) return;

        const maxAniso = renderer.capabilities.getMaxAnisotropy();

        const frontTex = new THREE.CanvasTexture(frontMask.canvas);
        frontTex.colorSpace = THREE.SRGBColorSpace;
        frontTex.wrapS = THREE.ClampToEdgeWrapping;
        frontTex.wrapT = THREE.ClampToEdgeWrapping;
        frontTex.anisotropy = maxAniso;
        frontTex.needsUpdate = true;

        const backTex = new THREE.CanvasTexture(backMask.canvas);
        backTex.colorSpace = THREE.SRGBColorSpace;
        backTex.wrapS = THREE.ClampToEdgeWrapping;
        backTex.wrapT = THREE.ClampToEdgeWrapping;
        backTex.anisotropy = maxAniso;
        backTex.needsUpdate = true;

        const normalCanvas = getFabricNormalCanvas(calib.weaveKind);
        const weaveNormTex = new THREE.CanvasTexture(normalCanvas);
        weaveNormTex.wrapS = THREE.RepeatWrapping;
        weaveNormTex.wrapT = THREE.RepeatWrapping;
        weaveNormTex.repeat.set(24, 30);
        weaveNormTex.anisotropy = maxAniso;
        weaveNormTex.needsUpdate = true;

        disposables.push(frontTex, backTex, weaveNormTex);

        // Photogrammetry-inspired Dual-Projection PBR Material (true studio look, zero plastic sheen)
        const garmentMat = new THREE.MeshPhysicalMaterial({
          map: frontTex,
          normalMap: weaveNormTex,
          normalScale: new THREE.Vector2(0.16, 0.16),
          roughness: calib.roughness,
          metalness: 0.0,
          specularIntensity: calib.specularIntensity,
          sheen: calib.sheen,
          sheenRoughness: 0.88,
          sheenColor: new THREE.Color(calib.sheenColor),
          vertexColors: true,
          side: THREE.FrontSide,
        });

        garmentMat.onBeforeCompile = (shader) => {
          shader.uniforms.uBackMap = { value: backTex };

          shader.vertexShader =
            'attribute vec2 aUvBack;\nvarying vec2 vUvBack;\nvarying vec3 vObjNormal;\n' +
            shader.vertexShader;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <beginnormal_vertex>',
            `#include <beginnormal_vertex>
             vObjNormal = normalize(objectNormal);`
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
             vUvBack = aUvBack;`
          );

          shader.fragmentShader =
            'uniform sampler2D uBackMap;\nvarying vec2 vUvBack;\nvarying vec3 vObjNormal;\n' +
            shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `#ifdef USE_MAP
               vec4 frontSample = texture2D( map, vMapUv );
               vec4 backSample = texture2D( uBackMap, vUvBack );
               float nZ = normalize( vObjNormal ).z;
               float sideMix = smoothstep( -0.32, 0.32, nZ );
               float seamAO = 1.0 - 0.03 * ( 1.0 - smoothstep( 0.0, 0.15, abs( nZ ) ) );
               vec3 blendedPhoto = mix( backSample.rgb, frontSample.rgb, sideMix ) * seamAO;
               diffuseColor *= vec4( blendedPhoto, 1.0 );
             #endif`
          );
        };
        garmentMat.customProgramCacheKey = () => `pants-dual-proj-v3-${spec.id}`;

        // DoubleSide opaque interior lining so looking from ANY top or bottom angle is 100% solid
        const liningMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          normalMap: weaveNormTex,
          normalScale: new THREE.Vector2(0.18, 0.18),
          roughness: 0.94,
          metalness: 0.0,
          vertexColors: true,
          side: THREE.DoubleSide,
        });

        const { outerGeo, liningGeo, metrics } = createPhotoMatchedTrouserMesh(
          spec.id,
          frontMask,
          backMask,
          calib
        );

        const garmentMesh = new THREE.Mesh(outerGeo, garmentMat);
        garmentMesh.castShadow = true;
        garmentMesh.receiveShadow = true;
        garmentGroup.add(garmentMesh);

        const liningMesh = new THREE.Mesh(liningGeo, liningMat);
        liningMesh.receiveShadow = true;
        garmentGroup.add(liningMesh);
        disposables.push(garmentMat, liningMat, outerGeo, liningGeo);

        // Woven 000GREEN interior waistband label tucked flush inside back waist
        const tagTex = createWovenTagTexture('000GREEN');
        const tagMat = new THREE.MeshStandardMaterial({
          map: tagTex,
          roughness: 0.72,
          metalness: 0.04,
        });
        const tagGeo = new THREE.BoxGeometry(0.1, 0.038, 0.005);
        const tagMesh = new THREE.Mesh(tagGeo, tagMat);
        tagMesh.position.set(...metrics.tagPos);
        garmentGroup.add(tagMesh);
        disposables.push(tagTex, tagMat, tagGeo);

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
            Cargando 3D · {spec.name}
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
