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
    heroCam: [0.58, 1.08, 2.48],
  },
  b2: {
    bgHex: 0x08090c,
    rimHex: 0xc8d3dc,
    plinthAccentHex: 0x8a949e,
    heroCam: [-0.48, 0.98, 2.52],
  },
  b3: {
    bgHex: 0x070d0f,
    rimHex: 0x8fb8c2,
    plinthAccentHex: 0x7a9aa4,
    heroCam: [0.64, 1.06, 2.56],
  },
  b4: {
    bgHex: 0x070e07,
    rimHex: 0x8ad16e,
    plinthAccentHex: 0x7e9a64,
    heroCam: [-0.74, 1.02, 2.46],
  },
  b5: {
    bgHex: 0x100e0a,
    rimHex: 0xefe6ce,
    plinthAccentHex: 0xd3c9ac,
    heroCam: [0.34, 1.08, 2.5],
  },
  b6: {
    bgHex: 0x060a12,
    rimHex: 0x7fa9dc,
    plinthAccentHex: 0x5e84b5,
    heroCam: [0.52, 0.96, 2.54],
  },
};

const DEFAULT_STUDIO_PROFILE: StudioProfile = {
  bgHex: 0x071007,
  rimHex: 0x9bd08a,
  plinthAccentHex: 0x9bd08a,
  heroCam: [0, 1.05, 2.55],
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
  pelvisCanvas: HTMLCanvasElement;
  leftLegCanvas: HTMLCanvasElement;
  rightLegCanvas: HTMLCanvasElement;
}

const garmentCache = new Map<string, BakedGarmentCacheEntry>();
const weaveCanvasCache = new Map<string, HTMLCanvasElement>();
let sharedShadowCanvas: HTMLCanvasElement | null = null;

const _targetVec = new THREE.Vector3(0, 0.96, 0);
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

function extractGarmentMask(img: HTMLImageElement, removeWhiteBg: boolean): MaskData {
  const W = 320;
  const H = 400;
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

    const isBackdrop = (idx4: number) => {
      const r = data[idx4];
      const g = data[idx4 + 1];
      const b = data[idx4 + 2];
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      return r > 224 && g > 224 && b > 224 && maxC - minC < 32;
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
            if (data[idx4] > 210 && data[idx4 + 1] > 210 && data[idx4 + 2] > 210) {
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
      if (data[(y * W + x) * 4 + 3] > 36) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        count++;
        weightedX += x;
        totalOpaque++;
      }
    }
    if (count > 10) {
      if (y < topY) topY = y;
      if (y > botY) botY = y;
      wholeBounds[y] = [minX, maxX];
    } else {
      wholeBounds[y] = [Math.round(W * 0.25), Math.round(W * 0.75)];
    }
  }

  if (botY <= topY + 20) {
    topY = Math.round(H * 0.08);
    botY = Math.round(H * 0.92);
  }

  const midX = totalOpaque > 0 ? Math.round(weightedX / totalOpaque) : Math.round(W * 0.5);
  const garmentH = botY - topY;

  let crotchY = Math.round(topY + garmentH * 0.42);
  const searchStart = Math.round(topY + garmentH * 0.26);
  const searchEnd = Math.round(topY + garmentH * 0.58);
  for (let y = searchStart; y <= searchEnd; y++) {
    const [rMin, rMax] = wholeBounds[y];
    const centerGap =
      data[(y * W + midX) * 4 + 3] < 36 &&
      data[(y * W + midX - 3) * 4 + 3] < 36 &&
      data[(y * W + midX + 3) * 4 + 3] < 36;
    if (centerGap && rMin < midX - 14 && rMax > midX + 14) {
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
      if (data[(y * W + x) * 4 + 3] > 36) {
        if (x < midX) {
          if (x < lMin) lMin = x;
          if (x > lMax) lMax = x;
        } else {
          if (x < rMin) rMin = x;
          if (x > rMax) rMax = x;
        }
      }
    }
    if (lMax <= lMin + 5) {
      lMin = wholeBounds[y][0];
      lMax = midX - 3;
    }
    if (rMax <= rMin + 5) {
      rMin = midX + 3;
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

function sampleFabricPixel(
  mask: MaskData,
  y: number,
  normX: number,
  bounds: [number, number]
): [number, number, number] {
  const cy = Math.max(mask.topY, Math.min(mask.botY, Math.round(y)));
  const [bMin, bMax] = bounds;
  const span = Math.max(8, bMax - bMin);
  const inset = Math.min(span * 0.08, 4);
  const minSafe = bMin + inset;
  const maxSafe = bMax - inset;
  let cx = Math.round(minSafe + Math.max(0, Math.min(1, normX)) * Math.max(1, maxSafe - minSafe));
  cx = Math.max(0, Math.min(mask.width - 1, cx));

  const idx = (cy * mask.width + cx) * 4;
  if (mask.pixels[idx + 3] >= 180) {
    return [mask.pixels[idx], mask.pixels[idx + 1], mask.pixels[idx + 2]];
  }

  const sliceMid = Math.round((bMin + bMax) * 0.5);
  const step = cx < sliceMid ? 1 : -1;
  for (let k = 0; k < span; k++) {
    const sx = cx + step * k;
    if (sx < 0 || sx >= mask.width) break;
    const sIdx = (cy * mask.width + sx) * 4;
    if (mask.pixels[sIdx + 3] >= 180) {
      return [mask.pixels[sIdx], mask.pixels[sIdx + 1], mask.pixels[sIdx + 2]];
    }
  }
  const mIdx = (cy * mask.width + Math.max(0, Math.min(mask.width - 1, sliceMid))) * 4;
  return [mask.pixels[mIdx], mask.pixels[mIdx + 1], mask.pixels[mIdx + 2]];
}

function bakeCylindricalCanvas(
  frontMask: MaskData,
  backMask: MaskData,
  part: 'pelvis' | 'leftLeg' | 'rightLeg'
): HTMLCanvasElement {
  const TW = 384;
  const TH = 384;
  const canvas = document.createElement('canvas');
  canvas.width = TW;
  canvas.height = TH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create texture canvas');

  const out = ctx.createImageData(TW, TH);
  const dst = out.data;

  const fTop = part === 'pelvis' ? frontMask.topY : frontMask.crotchY - 4;
  const fBot = part === 'pelvis' ? frontMask.crotchY + 6 : frontMask.botY;
  const bTop = part === 'pelvis' ? backMask.topY : backMask.crotchY - 4;
  const bBot = part === 'pelvis' ? backMask.crotchY + 6 : backMask.botY;

  for (let py = 0; py < TH; py++) {
    const vNorm = py / (TH - 1);
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

    for (let px = 0; px < TW; px++) {
      const u = px / TW;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const frontWeight = smoothstep(-0.34, 0.34, cosT);
      const fxNorm = 0.5 + 0.48 * sinT;
      const bxNorm = 0.5 - 0.48 * sinT;

      const [fr, fg, fb] = sampleFabricPixel(frontMask, fy, fxNorm, fBounds);
      const [br, bg, bb] = sampleFabricPixel(backMask, by, bxNorm, bBounds);

      const oIdx = (py * TW + px) * 4;
      dst[oIdx] = Math.round(fr * frontWeight + br * (1 - frontWeight));
      dst[oIdx + 1] = Math.round(fg * frontWeight + bg * (1 - frontWeight));
      dst[oIdx + 2] = Math.round(fb * frontWeight + bb * (1 - frontWeight));
      dst[oIdx + 3] = 255;
    }
  }

  ctx.putImageData(out, 0, 0);
  return canvas;
}

async function getOrBuildGarmentAssets(spec: Pants3DSpec): Promise<BakedGarmentCacheEntry> {
  const cached = garmentCache.get(spec.id);
  if (cached) return cached;

  const [frontImg, backImg] = await Promise.all([
    loadHtmlImage(spec.frontImage),
    loadHtmlImage(spec.backImage),
  ]);

  const frontMask = extractGarmentMask(frontImg, false);
  const backMask = extractGarmentMask(backImg, true);

  const entry: BakedGarmentCacheEntry = {
    frontMask,
    pelvisCanvas: bakeCylindricalCanvas(frontMask, backMask, 'pelvis'),
    leftLegCanvas: bakeCylindricalCanvas(frontMask, backMask, 'leftLeg'),
    rightLegCanvas: bakeCylindricalCanvas(frontMask, backMask, 'rightLeg'),
  };
  garmentCache.set(spec.id, entry);
  return entry;
}

function getFabricWeaveCanvas(productId: string): HTMLCanvasElement {
  const weaveKind = productId === 'b3' ? 'ripstop' : productId === 'b2' || productId === 'b6' ? 'denim' : 'canvas';
  const existing = weaveCanvasCache.get(weaveKind);
  if (existing) return existing;

  const S = 256;
  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(S, S);
  const d = imgData.data;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let val = 128;
      if (weaveKind === 'ripstop') {
        const gridX = x % 12 === 0 || x % 12 === 1 ? 36 : 0;
        const gridY = y % 12 === 0 || y % 12 === 1 ? 36 : 0;
        val = 122 + Math.max(gridX, gridY) + (((x + y) % 2) * 10 - 5);
      } else if (weaveKind === 'denim') {
        const diag = (x + y * 2) % 8;
        const twill = diag < 5 ? 24 : -22;
        const yarn = (x % 3 === 0 ? 1 : -1) * 10 + (y % 4 === 0 ? 1 : -1) * 8;
        val = 128 + twill + yarn;
      } else {
        const warp = Math.sin(x * 1.45) * 14;
        const weft = Math.cos(y * 1.45) * 14;
        const grain = (((x * 37 + y * 17) % 19) - 9) * 1.4;
        val = 128 + warp + weft + grain;
      }
      const c = Math.max(0, Math.min(255, Math.round(val)));
      const idx = (y * S + x) * 4;
      d[idx] = c;
      d[idx + 1] = c;
      d[idx + 2] = c;
      d[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  weaveCanvasCache.set(weaveKind, canvas);
  return canvas;
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
    const grad = ctx.createRadialGradient(S / 2, S / 2, 12, S / 2, S / 2, S / 2);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);
    sharedShadowCanvas = canvas;
  }
  const tex = new THREE.CanvasTexture(sharedShadowCanvas);
  tex.needsUpdate = true;
  return tex;
}

function createLoftedGarmentGeometry(options: {
  heightSegs: number;
  radialSegs: number;
  yStart: number;
  yEnd: number;
  getProfile: (vNorm: number) => { cx: number; cz: number; rx: number; rz: number };
  foldAmp: number;
  isHollowEnds: boolean;
  saddleArchBottom?: number;
}): THREE.BufferGeometry {
  const {
    heightSegs,
    radialSegs,
    yStart,
    yEnd,
    getProfile,
    foldAmp,
    isHollowEnds,
    saddleArchBottom = 0,
  } = options;

  const ringSpecs: Array<{ v: number; inset: number; yOffset: number }> = [];
  if (isHollowEnds) {
    ringSpecs.push({ v: 0, inset: 0.78, yOffset: 0.045 });
    ringSpecs.push({ v: 0, inset: 0.93, yOffset: 0.008 });
  }
  for (let i = 0; i <= heightSegs; i++) {
    ringSpecs.push({ v: i / heightSegs, inset: 1, yOffset: 0 });
  }
  if (isHollowEnds) {
    ringSpecs.push({ v: 1, inset: 0.93, yOffset: 0.005 });
    ringSpecs.push({ v: 1, inset: 0.81, yOffset: -0.055 });
  }

  const rings = ringSpecs.length;
  const cols = radialSegs + 1;
  const positions = new Float32Array(rings * cols * 3);
  const uvs = new Float32Array(rings * cols * 2);
  const indices: number[] = [];

  for (let r = 0; r < rings; r++) {
    const spec = ringSpecs[r];
    const prof = getProfile(spec.v);
    const baseY = THREE.MathUtils.lerp(yStart, yEnd, spec.v) + spec.yOffset;

    for (let c = 0; c < cols; c++) {
      const u = c / radialSegs;
      const theta = u * Math.PI * 2;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const drapeFold =
        spec.inset === 1
          ? 1 +
            foldAmp *
              (Math.sin(theta * 5 + spec.v * 7.5) * 0.6 +
                Math.cos(theta * 3 - spec.v * 11) * 0.4) *
              Math.sin(spec.v * Math.PI)
          : spec.inset;

      const backDepth = cosT < 0 ? 1.07 : 1.0;

      // Anatomical crotch dip on bottom pelvis edge at center front/back (|cosT| -> 1)
      const saddleDip =
        saddleArchBottom !== 0 && spec.v < 0.25
          ? -saddleArchBottom * Math.pow(Math.abs(cosT), 2) * (1 - spec.v / 0.25)
          : 0;

      const x = prof.cx + sinT * prof.rx * drapeFold;
      const z = prof.cz + cosT * prof.rz * drapeFold * backDepth;
      const y = baseY + saddleDip;

      const vIdx = r * cols + c;
      positions[vIdx * 3] = x;
      positions[vIdx * 3 + 1] = y;
      positions[vIdx * 3 + 2] = z;

      uvs[vIdx * 2] = u;
      uvs[vIdx * 2 + 1] = spec.v;
    }
  }

  for (let r = 0; r < rings - 1; r++) {
    for (let c = 0; c < radialSegs; c++) {
      const a = r * cols + c;
      const b = a + 1;
      const d = (r + 1) * cols + c;
      const e = d + 1;
      indices.push(a, b, d);
      indices.push(b, e, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
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
  const lastTelemetryRef = useRef<{ deg: number; zoom: number; ts: number }>({ deg: -1, zoom: -1, ts: 0 });

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
    const dist = 2.55;
    switch (presetRequest.key) {
      case 'hero': {
        const p = STUDIO_PROFILES[spec.id] ?? DEFAULT_STUDIO_PROFILE;
        presetTargetRef.current = new THREE.Vector3(...p.heroCam);
        break;
      }
      case 'front':
        presetTargetRef.current = new THREE.Vector3(0, 1.05, dist);
        break;
      case 'angle45':
        presetTargetRef.current = new THREE.Vector3(dist * 0.707, 1.12, dist * 0.707);
        break;
      case 'side':
        presetTargetRef.current = new THREE.Vector3(dist, 1.05, 0.02);
        break;
      case 'back':
        presetTargetRef.current = new THREE.Vector3(0, 1.05, -dist);
        break;
      case 'top':
        presetTargetRef.current = new THREE.Vector3(0, 2.75, 0.95);
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
    renderer.toneMappingExposure = 1.12;
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
    scene.fog = new THREE.FogExp2(stageProfile.bgHex, 0.085);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 30);
    camera.position.set(...stageProfile.heroCam);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(_targetVec);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.minDistance = 1.45;
    controls.maxDistance = 4.4;
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

    // Three-Point Model-Tuned Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xdfeadd, 0x162414, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e0, 1.85);
    keyLight.position.set(2.8, 4.2, 3.2);
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

    const fillLight = new THREE.DirectionalLight(0xc2d8c5, 0.85);
    fillLight.position.set(-3.0, 2.0, 1.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(stageProfile.rimHex, 1.25);
    rimLight.position.set(-1.6, 2.8, -3.3);
    scene.add(rimLight);

    const disposables: Array<{ dispose: () => void }> = [envTex];
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Custom Model-Tuned Studio Turntable Plinth + Contact Shadow
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x111812,
      metalness: 0.74,
      roughness: 0.28,
    });
    const plinthRimMat = new THREE.MeshStandardMaterial({
      color: stageProfile.plinthAccentHex,
      metalness: 0.52,
      roughness: 0.28,
      emissive: stageProfile.plinthAccentHex,
      emissiveIntensity: 0.25,
    });
    const plinthGeo = new THREE.CylinderGeometry(0.84, 0.9, 0.045, 56);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = -0.0225;
    plinthMesh.receiveShadow = true;
    rootGroup.add(plinthMesh);

    const ringGeo = new THREE.TorusGeometry(0.84, 0.009, 10, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, plinthRimMat);
    ringMesh.position.y = 0.001;
    rootGroup.add(ringMesh);

    const shadowTex = getContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(1.55, 1.55);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.65,
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
      const zoomRatio = Number((2.55 / Math.max(0.8, dist)).toFixed(2));
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
        const nextDist = THREE.MathUtils.clamp(currentDist + zoomTargetDistRef.current, 1.45, 4.4);
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
      .then(({ frontMask, pelvisCanvas, leftLegCanvas, rightLegCanvas }) => {
        if (disposed) return;

        const maxAniso = renderer.capabilities.getMaxAnisotropy();

        const wrapTexture = (cvs: HTMLCanvasElement, isColor: boolean) => {
          const tex = new THREE.CanvasTexture(cvs);
          if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
          tex.wrapS = isColor ? THREE.RepeatWrapping : THREE.RepeatWrapping;
          tex.wrapT = isColor ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
          if (!isColor) tex.repeat.set(8, 10);
          tex.anisotropy = maxAniso;
          tex.needsUpdate = true;
          return tex;
        };

        const pelvisTex = wrapTexture(pelvisCanvas, true);
        const leftLegTex = wrapTexture(leftLegCanvas, true);
        const rightLegTex = wrapTexture(rightLegCanvas, true);
        const weaveBump = wrapTexture(getFabricWeaveCanvas(spec.id), false);
        disposables.push(pelvisTex, leftLegTex, rightLegTex, weaveBump);

        const fabricRoughness = spec.id === 'b3' ? 0.6 : spec.id === 'b2' || spec.id === 'b6' ? 0.78 : 0.88;

        const makeGarmentMat = (map: THREE.CanvasTexture) =>
          new THREE.MeshPhysicalMaterial({
            map,
            bumpMap: weaveBump,
            bumpScale: 0.014,
            roughnessMap: weaveBump,
            roughness: fabricRoughness,
            metalness: 0.04,
            sheen: 0.35,
            sheenRoughness: 0.72,
            sheenColor: new THREE.Color(0xdde8d6),
            side: THREE.DoubleSide,
          });

        const pelvisMat = makeGarmentMat(pelvisTex);
        const leftMat = makeGarmentMat(leftLegTex);
        const rightMat = makeGarmentMat(rightLegTex);
        disposables.push(pelvisMat, leftMat, rightMat);

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
          return (((mn + mx) * 0.5 - frontMask.midX) / fW) * 1.95;
        };

        // 1. Sculpted Pelvis & Waist Trunk with anatomical crotch saddle dip
        const pelvisGeo = createLoftedGarmentGeometry({
          heightSegs: 16,
          radialSegs: 44,
          yStart: 1.16,
          yEnd: 1.84,
          foldAmp: spec.id === 'b5' ? 0.028 : 0.02,
          isHollowEnds: true,
          saddleArchBottom: 0.075,
          getProfile: (v) => {
            const w = sampleHalfWidth(frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, v);
            const rx = THREE.MathUtils.clamp(w * 0.58, 0.24, 0.42);
            const rz = rx * (spec.id === 'b3' ? 0.68 : 0.64);
            return { cx: 0, cz: 0, rx, rz };
          },
        });
        const pelvisMesh = new THREE.Mesh(pelvisGeo, pelvisMat);
        pelvisMesh.castShadow = true;
        pelvisMesh.receiveShadow = true;
        garmentGroup.add(pelvisMesh);
        disposables.push(pelvisGeo);

        // Tailored silhouette modifiers per pant model
        const getLegCutModifiers = (v: number) => {
          if (spec.id === 'b3') {
            // Parachute balloon swell + ankle drawcord cinch
            const balloon = Math.sin(v * Math.PI) * 0.036;
            const ankleCinch = v < 0.09 ? -0.028 * (1 - v / 0.09) : 0;
            return balloon + ankleCinch;
          }
          if (spec.id === 'b6') {
            // 90s skate wide puddle-hem flare
            return v < 0.2 ? 0.024 * (1 - v / 0.2) : 0;
          }
          if (spec.id === 'b5') {
            // Wide tailored drape
            return Math.sin(v * Math.PI) * 0.015;
          }
          return 0;
        };

        const buildLegGeometry = (isLeft: boolean) =>
          createLoftedGarmentGeometry({
            heightSegs: 22,
            radialSegs: 36,
            yStart: 0.03,
            yEnd: 1.25,
            foldAmp: spec.id === 'b3' ? 0.048 : 0.034,
            isHollowEnds: true,
            getProfile: (v) => {
              const bounds = isLeft ? frontMask.leftLegBounds : frontMask.rightLegBounds;
              const w = sampleHalfWidth(bounds, frontMask.crotchY, frontMask.botY, v);
              const cxRaw = sampleCenterX(bounds, frontMask.crotchY, frontMask.botY, v);
              const mod = getLegCutModifiers(v);
              const hipMerge = v > 0.78 ? (v - 0.78) * 0.14 : 0;
              const rx = THREE.MathUtils.clamp(w * 0.62 + mod, 0.14, 0.25);
              const rz = rx * (spec.id === 'b1' ? 0.94 : 0.9);
              const baseCx = isLeft
                ? THREE.MathUtils.clamp(cxRaw, -0.27, -0.15)
                : THREE.MathUtils.clamp(cxRaw, 0.15, 0.27);
              const cx = isLeft ? baseCx + hipMerge * 0.45 : baseCx - hipMerge * 0.45;
              return { cx, cz: 0, rx, rz };
            },
          });

        // 2. Left & Right Baggy Legs seamlessly entering pelvis saddle
        const leftLegGeo = buildLegGeometry(true);
        const leftLegMesh = new THREE.Mesh(leftLegGeo, leftMat);
        leftLegMesh.castShadow = true;
        leftLegMesh.receiveShadow = true;
        garmentGroup.add(leftLegMesh);
        disposables.push(leftLegGeo);

        const rightLegGeo = buildLegGeometry(false);
        const rightLegMesh = new THREE.Mesh(rightLegGeo, rightMat);
        rightLegMesh.castShadow = true;
        rightLegMesh.receiveShadow = true;
        garmentGroup.add(rightLegMesh);
        disposables.push(rightLegGeo);

        // 3. Inner Waistband Dark Lining + 000GREEN Woven Waist Label
        const topW = sampleHalfWidth(frontMask.wholeBounds, frontMask.topY, frontMask.crotchY, 1);
        const waistRx = THREE.MathUtils.clamp(topW * 0.56, 0.23, 0.38);
        const waistRz = waistRx * 0.62;

        const liningMat = new THREE.MeshStandardMaterial({
          color: 0x101410,
          roughness: 0.94,
          metalness: 0.02,
          side: THREE.DoubleSide,
        });
        const liningGeo = new THREE.CylinderGeometry(0.93, 0.89, 0.14, 32, 1, true);
        liningGeo.scale(waistRx, 1, waistRz);
        const liningMesh = new THREE.Mesh(liningGeo, liningMat);
        liningMesh.position.y = 1.77;
        garmentGroup.add(liningMesh);

        const tagTex = createWovenTagTexture('000GREEN');
        const tagMat = new THREE.MeshStandardMaterial({
          map: tagTex,
          roughness: 0.68,
          metalness: 0.05,
        });
        const tagGeo = new THREE.BoxGeometry(0.11, 0.042, 0.008);
        const tagMesh = new THREE.Mesh(tagGeo, tagMat);
        tagMesh.position.set(0, 1.8, -waistRz * 0.87);
        garmentGroup.add(tagMesh);
        disposables.push(liningMat, liningGeo, tagTex, tagMat, tagGeo);

        // 4. Contrasting Hardware (Button, Rivets, Belt Loops)
        const metalMat = new THREE.MeshStandardMaterial({
          color: spec.id === 'b6' ? 0xd0a868 : 0x9aa4a0,
          metalness: 0.9,
          roughness: 0.22,
        });
        const accentMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(spec.accentColor),
          roughness: 0.82,
          metalness: 0.08,
        });
        const hardwareMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(spec.primaryColor),
          roughness: 0.86,
          metalness: 0.05,
        });
        disposables.push(metalMat, accentMat, hardwareMat);

        const btnGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.012, 18);
        btnGeo.rotateX(Math.PI / 2);
        const btnMesh = new THREE.Mesh(btnGeo, metalMat);
        btnMesh.position.set(0.015, 1.815, waistRz + 0.006);
        garmentGroup.add(btnMesh);
        disposables.push(btnGeo);

        const loopGeo = new THREE.BoxGeometry(0.024, 0.095, 0.018);
        [0.42, 1.48, 2.55, Math.PI, 3.75, 4.82, 5.86].forEach((ang) => {
          const loop = new THREE.Mesh(loopGeo, hardwareMat);
          const lx = Math.sin(ang) * (waistRx + 0.008);
          const lz = Math.cos(ang) * (waistRz + 0.008) * (Math.cos(ang) < 0 ? 1.07 : 1);
          loop.position.set(lx, 1.805, lz);
          loop.rotation.y = ang;
          garmentGroup.add(loop);
        });
        disposables.push(loopGeo);

        // 5. Exclusive Model-Specific 3D Architectural Components
        if (spec.id === 'b1') {
          const pocketGeo = new THREE.BoxGeometry(0.05, 0.29, 0.22);
          const flapGeo = new THREE.BoxGeometry(0.058, 0.068, 0.23);
          const snapGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.012, 12);
          snapGeo.rotateZ(Math.PI / 2);
          const ankleToggleGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.028, 10);

          [-1, 1].forEach((side) => {
            const pMesh = new THREE.Mesh(pocketGeo, hardwareMat);
            pMesh.position.set(side * 0.39, 0.94, 0.01);
            pMesh.rotation.z = side * -0.05;
            pMesh.castShadow = true;
            garmentGroup.add(pMesh);

            const fMesh = new THREE.Mesh(flapGeo, accentMat);
            fMesh.position.set(side * 0.396, 1.07, 0.01);
            fMesh.rotation.z = side * -0.05;
            garmentGroup.add(fMesh);

            [-0.06, 0.06].forEach((zOff) => {
              const sMesh = new THREE.Mesh(snapGeo, metalMat);
              sMesh.position.set(side * 0.424, 1.06, 0.01 + zOff);
              garmentGroup.add(sMesh);
            });

            const ankleTog = new THREE.Mesh(ankleToggleGeo, metalMat);
            ankleTog.position.set(side * 0.37, 0.055, 0.03);
            garmentGroup.add(ankleTog);
          });
          disposables.push(pocketGeo, flapGeo, snapGeo, ankleToggleGeo);
        } else if (spec.id === 'b2') {
          const patchMat = new THREE.MeshStandardMaterial({
            color: 0x161719,
            roughness: 0.46,
            metalness: 0.14,
          });
          const patchGeo = new THREE.BoxGeometry(0.14, 0.085, 0.016);
          const patch = new THREE.Mesh(patchGeo, patchMat);
          patch.position.set(0.16, 1.795, -waistRz * 1.08);
          patch.rotation.y = -0.35;
          garmentGroup.add(patch);

          const cuffGeo = new THREE.TorusGeometry(0.175, 0.018, 12, 32);
          cuffGeo.rotateX(Math.PI / 2);
          [-0.21, 0.21].forEach((cx) => {
            const cuff = new THREE.Mesh(cuffGeo, accentMat);
            cuff.position.set(cx, 0.055, 0);
            garmentGroup.add(cuff);
          });
          disposables.push(patchMat, patchGeo, cuffGeo);
        } else if (spec.id === 'b3') {
          const toggleGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.032, 12);
          const cordGeo = new THREE.TorusGeometry(0.155, 0.008, 8, 28);
          cordGeo.rotateX(Math.PI / 2);
          const kneeBandGeo = new THREE.TorusGeometry(0.185, 0.008, 8, 28);
          kneeBandGeo.rotateX(Math.PI / 2);

          [-0.21, 0.21].forEach((cx) => {
            const cord = new THREE.Mesh(cordGeo, accentMat);
            cord.position.set(cx, 0.05, 0);
            garmentGroup.add(cord);

            const kneeDart = new THREE.Mesh(kneeBandGeo, accentMat);
            kneeDart.position.set(cx, 0.72, 0.01);
            garmentGroup.add(kneeDart);

            const tog = new THREE.Mesh(toggleGeo, metalMat);
            tog.position.set(cx + (cx < 0 ? -0.165 : 0.165), 0.045, 0.04);
            garmentGroup.add(tog);
          });
          disposables.push(toggleGeo, cordGeo, kneeBandGeo);
        } else if (spec.id === 'b4') {
          const kneeMat = new THREE.MeshStandardMaterial({
            color: 0x151716,
            roughness: 0.85,
            metalness: 0.05,
          });
          const kneeGeo = new THREE.CylinderGeometry(0.185, 0.175, 0.34, 24, 1, true, -0.75, 1.5);
          const seamCurveL = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.37, 1.24, 0.02),
            new THREE.Vector3(-0.39, 0.68, 0.01),
            new THREE.Vector3(-0.38, 0.06, 0.01),
          ]);
          const seamCurveR = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.37, 1.24, 0.02),
            new THREE.Vector3(0.39, 0.68, 0.01),
            new THREE.Vector3(0.38, 0.06, 0.01),
          ]);
          const seamLGeo = new THREE.TubeGeometry(seamCurveL, 16, 0.005, 6, false);
          const seamRGeo = new THREE.TubeGeometry(seamCurveR, 16, 0.005, 6, false);

          [-0.21, 0.21].forEach((cx) => {
            const panel = new THREE.Mesh(kneeGeo, kneeMat);
            panel.position.set(cx, 0.72, 0.016);
            garmentGroup.add(panel);
          });
          garmentGroup.add(new THREE.Mesh(seamLGeo, accentMat));
          garmentGroup.add(new THREE.Mesh(seamRGeo, accentMat));

          const hammerCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(-0.34, 1.32, -0.05),
            new THREE.Vector3(-0.42, 1.24, -0.07),
            new THREE.Vector3(-0.35, 1.15, -0.06),
          ]);
          const hammerGeo = new THREE.TubeGeometry(hammerCurve, 14, 0.014, 8, false);
          garmentGroup.add(new THREE.Mesh(hammerGeo, accentMat));
          disposables.push(kneeMat, kneeGeo, seamLGeo, seamRGeo, hammerGeo);
        } else if (spec.id === 'b5') {
          const pleatGeo = new THREE.BoxGeometry(0.014, 0.36, 0.022);
          [-0.14, -0.08, 0.08, 0.14].forEach((px) => {
            const pleat = new THREE.Mesh(pleatGeo, hardwareMat);
            pleat.position.set(px, 1.52, waistRz * 0.97);
            pleat.rotation.x = 0.04;
            garmentGroup.add(pleat);
          });
          disposables.push(pleatGeo);
        } else if (spec.id === 'b6') {
          const rivetGeo = new THREE.SphereGeometry(0.01, 10, 10);
          [
            [-0.22, 1.69, waistRz * 0.85],
            [0.22, 1.69, waistRz * 0.85],
            [-0.17, 1.56, -waistRz * 1.02],
            [0.17, 1.56, -waistRz * 1.02],
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
            Construyendo vista 3D…
          </span>
        </div>
      )}
      {loadError && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 text-center text-xs text-[#E88C84]">
          {loadError}
        </div>
      )}
    </div>
  );
}
