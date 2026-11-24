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

// Rich, lush 000GREEN architectural studio palettes per pant (never black, never empty)
const STUDIO_PROFILES: Record<string, StudioProfile> = {
  b1: {
    bgHex: 0x1b3a1a,
    wallHex: 0x264e24,
    floorCenterHex: '#356630',
    floorEdgeHex: '#183317',
    columnHex: 0x20441e,
    rimHex: 0xaee398,
    plinthHex: 0x244221,
    plinthAccentHex: 0x9bd08a,
    heroCam: [0.54, 1.04, 2.48],
  },
  b2: {
    bgHex: 0x163424,
    wallHex: 0x204933,
    floorCenterHex: '#2d6245',
    floorEdgeHex: '#142f20',
    columnHex: 0x1b3f2b,
    rimHex: 0xb7ead0,
    plinthHex: 0x1f3a2b,
    plinthAccentHex: 0x8fd2ae,
    heroCam: [-0.46, 1.0, 2.48],
  },
  b3: {
    bgHex: 0x17372c,
    wallHex: 0x224e3f,
    floorCenterHex: '#2f6855',
    floorEdgeHex: '#143127',
    columnHex: 0x1c4336,
    rimHex: 0xa8e0cb,
    plinthHex: 0x1f3e34,
    plinthAccentHex: 0x8bc9b3,
    heroCam: [0.58, 1.04, 2.5],
  },
  b4: {
    bgHex: 0x1d3c18,
    wallHex: 0x285222,
    floorCenterHex: '#396b30',
    floorEdgeHex: '#193415',
    columnHex: 0x22461d,
    rimHex: 0xb2e695,
    plinthHex: 0x25421f,
    plinthAccentHex: 0x93cb78,
    heroCam: [-0.62, 1.02, 2.46],
  },
  b5: {
    bgHex: 0x233c1e,
    wallHex: 0x31522a,
    floorCenterHex: '#416938',
    floorEdgeHex: '#1e351a',
    columnHex: 0x294624,
    rimHex: 0xd9ebb8,
    plinthHex: 0x2c4426,
    plinthAccentHex: 0xc5d69f,
    heroCam: [0.36, 1.04, 2.48],
  },
  b6: {
    bgHex: 0x15352b,
    wallHex: 0x1e4a3d,
    floorCenterHex: '#2a6251',
    floorEdgeHex: '#132f26',
    columnHex: 0x193f34,
    rimHex: 0x9fdfca,
    plinthHex: 0x1c3a31,
    plinthAccentHex: 0x82c7b1,
    heroCam: [0.5, 1.0, 2.48],
  },
};

const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  bgHex: 0x1b3a1a,
  wallHex: 0x264e24,
  floorCenterHex: '#356630',
  floorEdgeHex: '#183317',
  columnHex: 0x20441e,
  rimHex: 0xaee398,
  plinthHex: 0x244221,
  plinthAccentHex: 0x9bd08a,
  heroCam: [0, 1.04, 2.48],
};

interface ModelCalibration {
  frontWaistSkipRatio: number;
  backWaistSkipRatio: number;
  roughness: number;
  sheen: number;
  weaveKind: 'denim' | 'ripstop' | 'canvas';
  liningColor: number;
  cargoBulge: boolean;
  pleatRidges: boolean;
  kneeDarts: boolean;
  cuffStep: boolean;
  puddleHem: boolean;
}

const MODEL_CALIBRATIONS: Record<string, ModelCalibration> = {
  b1: {
    frontWaistSkipRatio: 0.012,
    backWaistSkipRatio: 0.008,
    roughness: 0.9,
    sheen: 0.16,
    weaveKind: 'canvas',
    liningColor: 0x22291c,
    cargoBulge: true,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
  },
  b2: {
    frontWaistSkipRatio: 0.092,
    backWaistSkipRatio: 0.01,
    roughness: 0.84,
    sheen: 0.18,
    weaveKind: 'denim',
    liningColor: 0x121315,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: true,
    puddleHem: false,
  },
  b3: {
    frontWaistSkipRatio: 0.01,
    backWaistSkipRatio: 0.008,
    roughness: 0.62,
    sheen: 0.36,
    weaveKind: 'ripstop',
    liningColor: 0x252d2f,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: true,
    cuffStep: false,
    puddleHem: false,
  },
  b4: {
    frontWaistSkipRatio: 0.02,
    backWaistSkipRatio: 0.008,
    roughness: 0.88,
    sheen: 0.15,
    weaveKind: 'canvas',
    liningColor: 0x141614,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
  },
  b5: {
    frontWaistSkipRatio: 0.012,
    backWaistSkipRatio: 0.008,
    roughness: 0.86,
    sheen: 0.24,
    weaveKind: 'canvas',
    liningColor: 0xa29780,
    cargoBulge: false,
    pleatRidges: true,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: false,
  },
  b6: {
    frontWaistSkipRatio: 0.084,
    backWaistSkipRatio: 0.01,
    roughness: 0.82,
    sheen: 0.2,
    weaveKind: 'denim',
    liningColor: 0x1d293a,
    cargoBulge: false,
    pleatRidges: false,
    kneeDarts: false,
    cuffStep: false,
    puddleHem: true,
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

function extractAndDilateCutout(
  img: HTMLImageElement,
  removeWhiteBg: boolean,
  isLightGarment: boolean
): MaskData {
  const W = 640;
  const H = 800;
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

  // Record exact garment silhouette bounds BEFORE dilation
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
      if (data[(y * W + x) * 4 + 3] > 80) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        count++;
        weightedX += x;
        totalOpaque++;
      }
    }
    if (count > 20) {
      if (y < topY) topY = y;
      if (y > botY) botY = y;
      wholeBounds[y] = [minX, maxX];
    } else {
      wholeBounds[y] = [Math.round(W * 0.25), Math.round(W * 0.75)];
    }
  }

  if (botY <= topY + 40) {
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
      data[(y * W + midX - 5) * 4 + 3] < 60 &&
      data[(y * W + midX + 5) * 4 + 3] < 60;
    if (centerGap && rMin < midX - 24 && rMax > midX + 24) {
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
      if (data[(y * W + x) * 4 + 3] > 80) {
        if (x < midX) {
          if (x < lMin) lMin = x;
          if (x > lMax) lMax = x;
        } else {
          if (x < rMin) rMin = x;
          if (x > rMax) rMax = x;
        }
      }
    }
    if (lMax <= lMin + 10) {
      lMin = wholeBounds[y][0];
      lMax = midX - 5;
    }
    if (rMax <= rMin + 10) {
      rMin = midX + 5;
      rMax = wholeBounds[y][1];
    }
    leftLegBounds[y] = [lMin, lMax];
    rightLegBounds[y] = [rMin, rMax];
  }

  // Keep a clean copy of original pixels for mask/relief queries
  const cleanPixels = new Uint8ClampedArray(data);

  // Dilate pure garment fabric colors outward by 8px so texture filtering NEVER bleeds background/white halos
  let valid = new Uint8Array(W * H);
  for (let p = 0; p < W * H; p++) {
    if (data[p * 4 + 3] >= 200) {
      valid[p] = 1;
      data[p * 4 + 3] = 255;
    } else {
      data[p * 4 + 3] = 0;
    }
  }

  for (let pass = 0; pass < 8; pass++) {
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
  for (let p = 0; p < W * H; p += 13) {
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
        const gridX = x % 10 === 0 || x % 10 === 1 ? 0.24 : 0;
        const gridY = y % 10 === 0 || y % 10 === 1 ? 0.24 : 0;
        h = 0.46 + Math.max(gridX, gridY) + ((((x + y) & 1) * 2 - 1) * 0.04);
      } else if (weaveKind === 'denim') {
        const diag = (x + y * 2) % 6;
        const twill = diag < 4 ? 0.14 : -0.15;
        const slub = Math.sin(x * 0.5) * 0.03 + Math.cos(y * 0.3) * 0.03;
        h = 0.5 + twill + slub;
      } else {
        const warp = Math.sin(x * 1.5) * 0.07;
        const weft = Math.cos(y * 1.5) * 0.07;
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
  const strength = weaveKind === 'denim' ? 1.85 : weaveKind === 'ripstop' ? 1.7 : 1.35;

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

  // Subtle architectural concentric studio rings on the green showroom floor
  ctx.strokeStyle = 'rgba(211, 201, 172, 0.14)';
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

function sampleLumaRelief(mask: MaskData, px: number, py: number): number {
  const ix = Math.max(2, Math.min(mask.width - 3, Math.round(px)));
  const iy = Math.max(2, Math.min(mask.height - 3, Math.round(py)));
  const idx = (iy * mask.width + ix) * 4;
  if (mask.pixels[idx + 3] < 160) return 0;
  const luma = (mask.pixels[idx] * 0.299 + mask.pixels[idx + 1] * 0.587 + mask.pixels[idx + 2] * 0.114) / 255;
  // Local 6px contrast captures creases/folds without warping flat silhouette
  const idxL = (iy * mask.width + Math.max(0, ix - 6)) * 4;
  const idxR = (iy * mask.width + Math.min(mask.width - 1, ix + 6)) * 4;
  const lL = (mask.pixels[idxL] * 0.299 + mask.pixels[idxL + 1] * 0.587 + mask.pixels[idxL + 2] * 0.114) / 255;
  const lR = (mask.pixels[idxR] * 0.299 + mask.pixels[idxR + 1] * 0.587 + mask.pixels[idxR + 2] * 0.114) / 255;
  return luma - (lL + lR) * 0.5;
}

interface UnifiedTrouserMetrics {
  waistRx: number;
  waistRz: number;
  waistY: number;
}

// Builds ONE seamless, water-tight, 1:1 photo-silhouette-matched 3D trouser mesh:
// - Uses exact true pixel-to-world aspect ratio from the garment cutout
// - Projects exact Front photo UVs (`uv`) and Back photo UVs (`aUvBack`) directly in GPU shader
// - Sculpts subtle 3D relief for cargo pockets, pleats, knee darts, selvedge cuffs, & fabric wrinkles
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

  const frontGarmentPixH = Math.max(40, frontMask.botY - frontMask.topY);
  const backGarmentPixH = Math.max(40, backMask.botY - backMask.topY);
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
    // Smooth 5-row vertical average so silhouette curve is silky-smooth
    let mnSum = 0;
    let mxSum = 0;
    let cnt = 0;
    for (let dy = -2; dy <= 2; dy++) {
      const sy = Math.max(mask.topY, Math.min(mask.botY, py + dy));
      mnSum += boundsArr[sy][0];
      mxSum += boundsArr[sy][1];
      cnt++;
    }
    const mn = mnSum / cnt;
    const mx = mxSum / cnt;
    const rx = Math.max(0.06, (mx - mn) * 0.5 * (worldGarmentH / Math.max(40, mask.botY - mask.topY)));
    const cx = ((mn + mx) * 0.5 - mask.midX) * (worldGarmentH / Math.max(40, mask.botY - mask.topY));
    return { mn, mx, rx, cx, py };
  };

  // True photo waist & hip proportions
  const waistF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 0.96);
  const hipF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 0.12);
  const waistRx = waistF.rx;
  const waistRz = waistRx * 0.56;

  // Exact bifurcation geometry matching the photo's hip width
  const splitLegRx = Math.max(0.12, hipF.rx * 0.515);
  const splitLegRz = splitLegRx * 0.78;
  const splitCrotchHalfZ = 0.036;
  const splitInnerAngle = Math.acos(Math.min(0.97, splitCrotchHalfZ / splitLegRz));
  const splitLegCx = splitLegRx * Math.sin(splitInnerAngle);

  const outerHalfCols = 28;
  const pelvisCols = outerHalfCols * 2; // 56
  const innerArcCols = 10;
  const legCols = outerHalfCols + innerArcCols; // 38
  const pelvisRows = 20;
  const legRows = 30;

  const posList: number[] = [];
  const uvFrontList: number[] = [];
  const uvBackList: number[] = [];
  const idxList: number[] = [];

  const pushVert = (
    x: number,
    y: number,
    z: number,
    uF: number,
    vF: number,
    uB: number,
    vB: number
  ) => {
    const idx = posList.length / 3;
    posList.push(x, y, z);
    uvFrontList.push(uF, vF);
    uvBackList.push(uB, vB);
    return idx;
  };

  const phiEdge = Math.PI * 0.5 + splitInnerAngle;
  const evalSplitRingPoint = (side: 1 | -1, alpha: number) => {
    const ang = THREE.MathUtils.lerp(phiEdge, -phiEdge, alpha);
    const x = side * (splitLegCx + splitLegRx * Math.cos(ang));
    const z = splitLegRz * Math.sin(ang);
    return { x, z };
  };

  // Compute Front & Back UVs for Pelvis directly from photo bounds
  const computePelvisUVs = (x: number, cosP: number, vPelvis: number) => {
    const fTop = frontMask.topY + frontGarmentPixH * calib.frontWaistSkipRatio * smoothstep(-0.1, 0.75, cosP);
    const bTop = backMask.topY + backGarmentPixH * calib.backWaistSkipRatio;
    const fY = THREE.MathUtils.lerp(frontMask.crotchY + 3, fTop, vPelvis);
    const bY = THREE.MathUtils.lerp(backMask.crotchY + 3, bTop, vPelvis);

    const fRow = Math.max(frontMask.topY, Math.min(frontMask.botY, Math.round(fY)));
    const bRow = Math.max(backMask.topY, Math.min(backMask.botY, Math.round(bY)));
    const [fMin, fMax] = frontMask.wholeBounds[fRow];
    const [bMin, bMax] = backMask.wholeBounds[bRow];

    const fSpan = Math.max(12, fMax - fMin);
    const bSpan = Math.max(12, bMax - bMin);
    const fMid = (fMin + fMax) * 0.5;
    const bMid = (bMin + bMax) * 0.5;

    // Normalize x cleanly across actual pixel width
    const fWorldHalf = fSpan * 0.5 * pixelToWorld;
    const nx = THREE.MathUtils.clamp(x / Math.max(0.05, fWorldHalf), -1, 1);

    const fPx = fMid + nx * (fSpan * 0.485);
    const bPx = bMid - nx * (bSpan * 0.485);

    return {
      uF: THREE.MathUtils.clamp(fPx / fW, 0.002, 0.998),
      vF: 1.0 - THREE.MathUtils.clamp(fY / fH, 0.002, 0.998),
      uB: THREE.MathUtils.clamp(bPx / bW, 0.002, 0.998),
      vB: 1.0 - THREE.MathUtils.clamp(bY / bH, 0.002, 0.998),
      fPx,
      fY,
    };
  };

  // 1. PELVIS & WAIST TRUNK (vPelvis: 0 crotch -> 1 waist)
  const pelvisGrid: number[][] = [];
  for (let r = 0; r <= pelvisRows; r++) {
    const v = r / pelvisRows;
    const baseY = THREE.MathUtils.lerp(ySplit, yWaist, v);

    const sliceF = sampleSpanAndCx(frontMask, frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, v);
    const ovalRx = sliceF.rx;
    const ovalRz = ovalRx * 0.58;
    const splitBlend = 1 - smoothstep(0.0, 0.52, v);

    const row: number[] = [];
    for (let c = 0; c <= pelvisCols; c++) {
      const u = c / pelvisCols;
      const phi = u * Math.PI * 2;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);

      const seatDepth = cosP < 0 ? 1.15 - 0.08 * v : 1.0;
      let ox = sliceF.cx * (1 - splitBlend) + sinP * ovalRx;
      let oz = cosP * ovalRz * seatDepth;

      if (splitBlend > 0) {
        const isRightHalf = c <= outerHalfCols;
        const side: 1 | -1 = isRightHalf ? 1 : -1;
        const alpha = isRightHalf ? c / outerHalfCols : 1 - (c - outerHalfCols) / outerHalfCols;
        const sp = evalSplitRingPoint(side, alpha);
        ox = THREE.MathUtils.lerp(ox, sp.x, splitBlend);
        oz = THREE.MathUtils.lerp(oz, sp.z, splitBlend);
      }

      const { uF, vF, uB, vB, fPx, fY } = computePelvisUVs(ox, cosP, v);

      // Subtle photo-driven surface relief & model-specific waist/pleat sculpting
      const photoRelief = cosP > 0 ? sampleLumaRelief(frontMask, fPx, fY) * 0.016 : 0;
      let relief = photoRelief * Math.sin(v * Math.PI);

      if (calib.pleatRidges && cosP > 0.25) {
        const p1 = Math.exp(-Math.pow((sinP - 0.34) * 9, 2)) + Math.exp(-Math.pow((sinP + 0.34) * 9, 2));
        const p2 = Math.exp(-Math.pow((sinP - 0.56) * 10, 2)) + Math.exp(-Math.pow((sinP + 0.56) * 10, 2));
        relief += (p1 * 0.015 + p2 * 0.01) * smoothstep(0.25, 0.85, cosP) * smoothstep(0.05, 0.4, v);
      }
      ox += sinP * relief;
      oz += cosP * relief;

      // Anatomical waistband profile: slight back rise, slight front button dip for b2/b6
      const frontDip = calib.frontWaistSkipRatio > 0.05 ? -0.022 : -0.008;
      const waistTilt =
        v > 0.72
          ? ((v - 0.72) / 0.28) * (cosP < 0 ? 0.02 * Math.abs(cosP) : frontDip * cosP)
          : 0;
      const crotchDip = v < 0.22 ? -0.028 * Math.pow(Math.abs(cosP), 2.5) * (1 - v / 0.22) : 0;

      row.push(pushVert(ox, baseY + waistTilt + crotchDip, oz, uF, vF, uB, vB));
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

  // 2. LEFT & RIGHT LEGS (1:1 pixel-matched to photo's exact leg contour & inner gap)
  const evalLegSlice = (isLeft: boolean, vLeg: number) => {
    const bounds = isLeft ? frontMask.leftLegBounds : frontMask.rightLegBounds;
    const sl = sampleSpanAndCx(frontMask, bounds, frontMask.crotchY, frontMask.botY, vLeg);
    const splitBlend = smoothstep(0.76, 1.0, vLeg);

    let cutMod = 0;
    if (calib.cuffStep && vLeg < 0.085 && vLeg > 0.01) {
      cutMod = 0.009 * smoothstep(0.01, 0.03, vLeg);
    }

    const rx = THREE.MathUtils.lerp(sl.rx + cutMod, splitLegRx, splitBlend);
    const rz = rx * 0.76;
    const cx = THREE.MathUtils.lerp(sl.cx, isLeft ? -splitLegCx : splitLegCx, splitBlend);
    const cz = Math.sin(vLeg * Math.PI) * 0.012;
    return { rx, rz, cx, cz, fMin: sl.mn, fMax: sl.mx, fPy: sl.py };
  };

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
      const bSpan = Math.max(12, bMax - bMin);
      const bMid = (bMin + bMax) * 0.5;

      const fSpan = Math.max(12, prof.fMax - prof.fMin);
      const fMid = (prof.fMin + prof.fMax) * 0.5;

      const row: number[] = [];
      for (let c = 0; c <= legCols; c++) {
        let px = 0;
        let pz = 0;
        let py = baseY;

        if (c < halfInnerCols) {
          const tInner = 0.5 + (c / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = prof.cx + side * prof.rx * Math.cos(ang);
          const legZ = prof.cz + prof.rz * Math.sin(ang);

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
          const legX = prof.cx + side * prof.rx * Math.cos(ang);
          const legZ = prof.cz + prof.rz * Math.sin(ang);

          px = THREE.MathUtils.lerp(legX, sp.x, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, sp.z, topSplitBlend);
          if (vLeg > 0.8) {
            const edgeCenterWeight = Math.pow(Math.abs(alpha - 0.5) * 2, 2.8);
            py += -0.028 * edgeCenterWeight * smoothstep(0.8, 1.0, vLeg);
          }
        } else {
          const tInner = ((c - halfInnerCols - outerHalfCols) / halfInnerCols) * 0.5;
          const ang = THREE.MathUtils.lerp(-phiEdge, -(Math.PI * 2 - phiEdge), tInner);
          const legX = prof.cx + side * prof.rx * Math.cos(ang);
          const legZ = prof.cz + prof.rz * Math.sin(ang);

          const spZ = THREE.MathUtils.lerp(-splitCrotchHalfZ, splitCrotchHalfZ, tInner);
          px = THREE.MathUtils.lerp(legX, 0, topSplitBlend);
          pz = THREE.MathUtils.lerp(legZ, spZ, topSplitBlend);

          const saddleArch = Math.sin(tInner * Math.PI);
          py += -0.028 * smoothstep(0.8, 1.0, vLeg) * (1 - 0.15 * saddleArch);
          if (vLeg > 0.85) py -= 0.012 * saddleArch * smoothstep(0.85, 1.0, vLeg);
        }

        // Exact front/back screen-space UV from actual leg horizontal ratio
        const nx = THREE.MathUtils.clamp((px - prof.cx) / Math.max(0.02, prof.rx), -1, 1);
        const fPx = fMid + nx * (fSpan * 0.485);
        const bPx = bMid - nx * (bSpan * 0.485);

        const uF = THREE.MathUtils.clamp(fPx / fW, 0.002, 0.998);
        const vF = 1.0 - THREE.MathUtils.clamp(prof.fPy / fH, 0.002, 0.998);
        const uB = THREE.MathUtils.clamp(bPx / bW, 0.002, 0.998);
        const vB = 1.0 - THREE.MathUtils.clamp(bY / bH, 0.002, 0.998);

        // Subtle photo-guided fold relief + model-specific sculptural silhouettes
        const lx = px - prof.cx;
        const lz = pz - prof.cz;
        const texTheta = Math.atan2(lx, lz);
        const outDirX = Math.sin(texTheta);
        const outDirZ = Math.cos(texTheta);

        let disp = (outDirZ > 0 ? sampleLumaRelief(frontMask, fPx, prof.fPy) : 0) * 0.014 * Math.sin(vLeg * Math.PI);

        if (calib.cargoBulge && vLeg > 0.56 && vLeg < 0.88) {
          // Sculpted 3D cargo bellow relief right where the photographed cargo pockets sit
          const outerSide = isLeft ? smoothstep(-0.35, -0.92, outDirX) : smoothstep(0.35, 0.92, outDirX);
          const pocketBox = smoothstep(0.56, 0.62, vLeg) * (1 - smoothstep(0.82, 0.88, vLeg));
          disp += 0.026 * outerSide * pocketBox * (1 - topSplitBlend);
        } else if (calib.kneeDarts && vLeg > 0.38 && vLeg < 0.68) {
          const kneeZone = Math.sin(((vLeg - 0.38) / 0.3) * Math.PI);
          disp += 0.016 * kneeZone * smoothstep(0.15, 0.85, outDirZ);
        } else if (calib.puddleHem && vLeg < 0.24) {
          const stackZone = 1 - vLeg / 0.24;
          disp += 0.014 * stackZone * Math.sin(vLeg * 38 + texTheta * 2);
        } else if (calib.pleatRidges && vLeg > 0.38) {
          const frontCrease = Math.exp(-Math.pow(outDirX * 5.2, 2)) * smoothstep(0.35, 0.9, outDirZ);
          disp += 0.011 * frontCrease * (1 - topSplitBlend * 0.3);
        }

        px += outDirX * disp * (1 - topSplitBlend * 0.7);
        pz += outDirZ * disp * (1 - topSplitBlend * 0.7);

        row.push(pushVert(px, py, pz, uF, vF, uB, vB));
      }
      legGrid.push(row);
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
  outerGeo.setIndex(idxList);
  outerGeo.computeVertexNormals();
  weldCoincidentNormals(outerGeo, posList.length / 3);

  // Inner rolled waistband & hem lining
  const linPos: number[] = [];
  const linIdx: number[] = [];
  const topRow = pelvisGrid[pelvisRows];
  const posAttr = outerGeo.attributes.position as THREE.BufferAttribute;

  const waistSteps = [
    { scale: 1.0, yOff: 0.0 },
    { scale: 0.96, yOff: 0.006 },
    { scale: 0.91, yOff: -0.024 },
    { scale: 0.87, yOff: -0.17 },
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

  [false, true].forEach((isLeft) => {
    const prof0 = evalLegSlice(isLeft, 0);
    const hemSteps = [
      { scale: 0.82, y: yHem + 0.065 },
      { scale: 0.93, y: yHem + 0.006 },
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

  void specId;

  return {
    outerGeo,
    liningGeo,
    metrics: {
      waistRx,
      waistRz,
      waistY: yWaist,
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
    renderer.toneMappingExposure = 1.05;
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
    scene.fog = new THREE.FogExp2(stageProfile.bgHex, 0.055);
    scene.environmentIntensity = 0.35;

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

    // Bright, balanced 000GREEN fashion studio lighting
    const hemiLight = new THREE.HemisphereLight(0xeef6e8, stageProfile.bgHex, 0.82);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.35);
    keyLight.position.set(2.4, 4.2, 3.2);
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
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8e4c8, 0.72);
    fillLight.position.set(-2.9, 2.2, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(stageProfile.rimHex, 1.05);
    rimLight.position.set(-1.3, 2.8, -3.2);
    scene.add(rimLight);

    // Soft uplight to illuminate the green architectural studio backdrop
    const backdropGlow = new THREE.PointLight(stageProfile.rimHex, 2.8, 12, 1.5);
    backdropGlow.position.set(0, 1.5, -2.5);
    scene.add(backdropGlow);

    const disposables: Array<{ dispose: () => void }> = [envTex];
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. GREEN ARCHITECTURAL STUDIO FLOOR + CURVED CYCLORAMA WALLS + COLUMNS
    const floorTex = createStudioFloorTexture(stageProfile.floorCenterHex, stageProfile.floorEdgeHex);
    const floorGeo = new THREE.CircleGeometry(9.5, 72);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.88,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.042;
    floorMesh.receiveShadow = true;
    rootGroup.add(floorMesh);

    // Curved green studio cyclorama wall surrounding the rear & flanks
    const cycGeo = new THREE.CylinderGeometry(5.2, 5.2, 5.8, 64, 1, true);
    const cycMat = new THREE.MeshStandardMaterial({
      color: stageProfile.wallHex,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.BackSide,
    });
    const cycMesh = new THREE.Mesh(cycGeo, cycMat);
    cycMesh.position.y = 2.65;
    rootGroup.add(cycMesh);

    // Architectural fluted sage/emerald studio columns around the perimeter for rich depth
    const colGeo = new THREE.CylinderGeometry(0.11, 0.125, 5.2, 16);
    const colMat = new THREE.MeshStandardMaterial({
      color: stageProfile.columnHex,
      roughness: 0.72,
      metalness: 0.14,
    });
    const colCount = 12;
    const colInstanced = new THREE.InstancedMesh(colGeo, colMat, colCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < colCount; i++) {
      const ang = (i / colCount) * Math.PI * 2 + 0.25;
      dummy.position.set(Math.sin(ang) * 4.75, 2.4, Math.cos(ang) * 4.75);
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
      metalness: 0.35,
      roughness: 0.48,
    });
    const plinthRimMat = new THREE.MeshStandardMaterial({
      color: stageProfile.plinthAccentHex,
      metalness: 0.52,
      roughness: 0.28,
      emissive: stageProfile.plinthAccentHex,
      emissiveIntensity: 0.18,
    });

    const baseStepGeo = new THREE.CylinderGeometry(0.92, 0.98, 0.022, 64);
    const baseStepMesh = new THREE.Mesh(baseStepGeo, plinthMat);
    baseStepMesh.position.y = -0.031;
    baseStepMesh.receiveShadow = true;
    rootGroup.add(baseStepMesh);

    const plinthGeo = new THREE.CylinderGeometry(0.76, 0.8, 0.026, 64);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.013;
    plinthMesh.receiveShadow = true;
    rootGroup.add(plinthMesh);

    const ringGeo = new THREE.TorusGeometry(0.76, 0.0055, 12, 72);
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
      opacity: 0.58,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.y = 0.003;
    rootGroup.add(shadowPlane);

    // Subtle botanical dust particles floating in studio air
    const moteCount = 54;
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
      size: 0.022,
      transparent: true,
      opacity: 0.45,
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
        weaveNormTex.repeat.set(16, 20);
        weaveNormTex.anisotropy = maxAniso;
        weaveNormTex.needsUpdate = true;

        disposables.push(frontTex, backTex, weaveNormTex);

        // Full native-photo Dual-Projection PBR Material (exact Front + Back photo match!)
        const garmentMat = new THREE.MeshPhysicalMaterial({
          map: frontTex,
          normalMap: weaveNormTex,
          normalScale: new THREE.Vector2(0.28, 0.28),
          roughness: calib.roughness,
          metalness: 0.02,
          sheen: calib.sheen,
          sheenRoughness: 0.82,
          sheenColor: new THREE.Color(0xd8e8d4),
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
               float sideMix = smoothstep( -0.28, 0.28, normalize( vObjNormal ).z );
               vec3 blendedPhoto = mix( backSample.rgb, frontSample.rgb, sideMix );
               diffuseColor *= vec4( blendedPhoto, 1.0 );
             #endif`
          );
        };
        garmentMat.customProgramCacheKey = () => `pants-dual-proj-${spec.id}`;

        const liningMat = new THREE.MeshStandardMaterial({
          color: calib.liningColor,
          roughness: 0.94,
          metalness: 0.02,
          side: THREE.FrontSide,
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
        tagMesh.position.set(0, metrics.waistY - 0.055, -metrics.waistRz * 0.91);
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
