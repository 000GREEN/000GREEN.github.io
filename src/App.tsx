/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import baggyMossCargoImg from './assets/images/baggy_moss_cargo_v2_1795108115684_cutout.png';
import baggyObsidianDenimImg from './assets/images/baggy_obsidian_denim_v3_1795108133375_cutout.png';
import baggyStealthParachuteImg from './assets/images/baggy_stealth_parachute_v2_1795108116852_cutout.png';
import baggyBioStitchImg from './assets/images/baggy_biostitch_carpenter_v2_1795108116703_cutout.png';
import baggyBonePleatedImg from './assets/images/baggy_bone_pleated_v2_1795108116230_cutout.png';
import baggyVintageIndigoImg from './assets/images/baggy_vintage_indigo_v2_1795108116399_cutout.png';

// 000GREEN Official Baggy Pants Collection
export interface ProductItem {
  id: string;
  kind: string;
  name: string;
  price: number;
  desc: string;
  image: string;
  sizes: string[];
  colors: [string, string][]; // [ColorName, HexCode]
  keywords: string[];
}

export const BRAND_LOGO_SRC = '/official_logo.png';

export const EXACT_PRODUCTS: ProductItem[] = [
  {
    id: 'b1',
    kind: 'Pantalón Baggy Cargo',
    name: '000 Moss Cargo / Olive Wide',
    price: 320000,
    image: baggyMossCargoImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Pantalón baggy cargo de sarga pesada en verde musgo oliva, bolsillos fuelle de gran volumen, pinzas articuladas en rodilla y ajuste en botamanga.',
    colors: [
      ['Verde Musgo', '#556B3D'],
      ['Oliva Táctico', '#3D4D2B'],
    ],
    keywords: [
      'verde', 'green', 'musgo', 'moss', 'oliva', 'olive', 'cargo', 'bolsillos',
      'ancho', 'wide', 'baggy', 'bagy', 'baguies', 'baggies', 'pantalon', 'pantalones',
      'militar', 'tactico', 'sarga', '000green'
    ],
  },
  {
    id: 'b2',
    kind: 'Jean Baggy Selvedge 14oz',
    name: '000 Obsidian Wash / Raw Baggy',
    price: 345000,
    image: baggyObsidianDenimImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Jean baggy corte ultra wide-leg en denim japonés selvedge de 14oz lavado en negro obsidiana, caída estructurada y doble costura reforzada.',
    colors: [
      ['Negro Obsidiana', '#1C1E22'],
      ['Carbón Lavado', '#3E4249'],
    ],
    keywords: [
      'negro', 'black', 'obsidiana', 'obsidian', 'jean', 'jeans', 'denim', 'selvedge',
      'lavado', 'washed', 'carbon', 'baggy', 'baguies', 'baggies', 'wide leg', 'pantalon', 'pantalones'
    ],
  },
  {
    id: 'b3',
    kind: 'Pantalón Baggy Parachute',
    name: '000 Stealth Parachute / Slate Ripstop',
    price: 295000,
    image: baggyStealthParachuteImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Baggy parachute confeccionado en ripstop técnico liviano color gris pizarra mate, cintura elástica con cordón y topes regulables en tobillos.',
    colors: [
      ['Gris Pizarra', '#5C6468'],
      ['Acero Mate', '#3E4548'],
    ],
    keywords: [
      'gris', 'grey', 'gray', 'slate', 'pizarra', 'parachute', 'paracaidas', 'nylon',
      'ripstop', 'tecnico', 'táctico', 'liviano', 'oversized', 'baggy', 'baguies', 'pantalon', 'pantalones'
    ],
  },
  {
    id: 'b4',
    kind: 'Pantalón Baggy Carpenter',
    name: '000 Bio Stitch / Carpenter Black',
    price: 335000,
    image: baggyBioStitchImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Pantalón baggy carpenter en lona duck negra de alto gramaje con costuras triples en contraste verde salvia 000GREEN y panel doble en rodillas.',
    colors: [
      ['Negro Duck', '#141516'],
      ['Costura 000GREEN', '#7E9A64'],
    ],
    keywords: [
      'negro', 'black', 'verde', 'green', 'carpenter', 'carpintero', 'costura', 'stitch',
      'lona', 'canvas', 'bio', '000green', 'skater', 'skate', 'baggy', 'baguies', 'pantalon', 'pantalones'
    ],
  },
  {
    id: 'b5',
    kind: 'Pantalón Baggy Pinzado',
    name: '000 Bone Canvas / Double Pleat',
    price: 315000,
    image: baggyBonePleatedImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Baggy arquitectónico de doble pinza frontal en gabardina cruda tono hueso, caída amplia fluida y cintura sastrera de calce relajado.',
    colors: [
      ['Hueso Crudo', '#E5DEC9'],
      ['Arena Natural', '#C9BFA5'],
    ],
    keywords: [
      'beige', 'hueso', 'bone', 'crema', 'crudo', 'ecru', 'blanco', 'arena', 'pinzado',
      'pinzas', 'pleated', 'gabardina', 'canvas', 'sastrero', 'baggy', 'baguies', 'pantalon', 'pantalones'
    ],
  },
  {
    id: 'b6',
    kind: 'Jean Baggy Skater',
    name: '000 Vintage Indigo / Acid Baggy',
    price: 330000,
    image: baggyVintageIndigoImg,
    sizes: ['36', '38', '40', '42', '44', '46'],
    desc: 'Jean super baggy estilo skate 90s en denim índigo con lavado ácido vintage, botamanga extra ancha y remaches metálicos de alta resistencia.',
    colors: [
      ['Índigo Ácido', '#4D647D'],
      ['Azul Vintage', '#2D3C4E'],
    ],
    keywords: [
      'azul', 'blue', 'indigo', 'índigo', 'acid', 'acido', 'vintage', 'jean', 'jeans',
      'denim', 'skater', 'skate', '90s', 'baggy', 'baguies', 'baggies', 'pantalon', 'pantalones'
    ],
  },
];

let rouletteAudioCtx: AudioContext | null = null;
let lastRouletteTickMs = 0;

function getRouletteAudio(): AudioContext | null {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!rouletteAudioCtx) {
      rouletteAudioCtx = new AudioCtx();
    }
    if (rouletteAudioCtx.state === 'suspended') {
      void rouletteAudioCtx.resume().catch(() => {});
    }
    return rouletteAudioCtx;
  } catch {
    return null;
  }
}

function playRouletteTick(nextSize: number, prevSize: number) {
  if (nextSize === prevSize) return;
  const now = performance.now();
  if (now - lastRouletteTickMs < 22) return;
  lastRouletteTickMs = now;

  const ctx = getRouletteAudio();
  if (!ctx) return;

  const ratio = Math.max(0, Math.min(1, (nextSize - 26) / 30));

  try {
    const t = ctx.currentTime + 0.001;

    // 1. Razor-sharp ivory/metal fret tick (5.5ms crisp harmonic impulse, zero plastic noise)
    const clickOsc = ctx.createOscillator();
    clickOsc.type = 'sine';
    clickOsc.frequency.setValueAtTime(1750 + ratio * 260, t);
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.0001, t);
    clickGain.gain.linearRampToValueAtTime(0.11, t + 0.0008);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.0065);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.008);

    // 2. Warm hardwood / roulette pocket resonance tap (10ms clean wood knock)
    const woodOsc = ctx.createOscillator();
    woodOsc.type = 'sine';
    woodOsc.frequency.setValueAtTime(520 + ratio * 130, t);
    const woodGain = ctx.createGain();
    woodGain.gain.setValueAtTime(0.0001, t);
    woodGain.gain.linearRampToValueAtTime(0.12, t + 0.001);
    woodGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.011);
    woodOsc.connect(woodGain);
    woodGain.connect(ctx.destination);
    woodOsc.start(t);
    woodOsc.stop(t + 0.013);

    // 3. Subtle low mechanical detent body (8ms weight)
    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(210, t);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.0001, t);
    bodyGain.gain.linearRampToValueAtTime(0.08, t + 0.001);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.009);
    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);
    bodyOsc.start(t);
    bodyOsc.stop(t + 0.011);

    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(4);
    }
  } catch {
    // Ignore audio errors if blocked before gesture
  }
}

interface SizeWheelProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (nextSize: number) => void;
  onInteract?: () => void;
}

function SizeWheel({ value, min = 26, max = 56, onChange, onInteract }: SizeWheelProps) {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const centerBadgeRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const prevBtnRef = useRef<HTMLButtonElement | null>(null);
  const nextBtnRef = useRef<HTMLButtonElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isFreeMove, setIsFreeMove] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftValue, setDraftValue] = useState<string>(String(value));
  const [rollDir, setRollDir] = useState<'up' | 'down'>('up');
  const [tickSeq, setTickSeq] = useState<number>(0);

  const dragOriginRef = useRef<{ x: number; y: number; startVal: number; moved: boolean } | null>(null);
  const touchOriginRef = useRef<{
    id: number;
    x: number;
    y: number;
    startVal: number;
    moved: boolean;
    target: EventTarget | null;
  } | null>(null);
  const lastDragMovedRef = useRef<boolean>(false);
  const justLockedFreeMoveRef = useRef<boolean>(false);
  const wheelAccumRef = useRef<{ acc: number; lastTs: number }>({ acc: 0, lastTs: 0 });
  const freeMoveOriginRef = useRef<{ x: number; y: number; startVal: number } | null>(null);
  const valueRef = useRef<number>(value);

  useEffect(() => {
    valueRef.current = value;
    setDraftValue(String(value));
  }, [value]);

  const clamp = useCallback((n: number) => Math.max(min, Math.min(max, n)), [min, max]);

  const commitSize = useCallback(
    (nextRaw: number) => {
      const next = clamp(nextRaw);
      const prev = valueRef.current;
      if (next !== prev) {
        valueRef.current = next;
        setRollDir(next > prev ? 'up' : 'down');
        setTickSeq((s) => s + 1);
        playRouletteTick(next, prev);
        onInteract?.();
        onChange(next);
      }
    },
    [clamp, onChange, onInteract]
  );

  const stepSize = useCallback(
    (delta: number) => {
      commitSize(valueRef.current + delta);
    },
    [commitSize]
  );

  // Smooth non-passive mouse-wheel rolling with accumulated threshold so micro-scrolls don't jump sizes
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const dir = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : -e.deltaX;
      if (dir === 0) return;

      const now = performance.now();
      if (now - wheelAccumRef.current.lastTs > 260) {
        wheelAccumRef.current.acc = 0;
      }
      wheelAccumRef.current.lastTs = now;
      wheelAccumRef.current.acc += dir;

      const threshold = 78;
      if (Math.abs(wheelAccumRef.current.acc) >= threshold) {
        const delta = wheelAccumRef.current.acc > 0 ? 1 : -1;
        wheelAccumRef.current.acc = 0;
        commitSize(valueRef.current + delta);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [commitSize]);

  // Mobile finger-touch glide: drag right -> smaller sizes, drag left -> larger sizes
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isEditingText && e.target === inputRef.current) return;
      const touch = e.changedTouches[0];
      if (!touch) return;

      e.preventDefault();
      getRouletteAudio();
      lastDragMovedRef.current = false;
      setIsFreeMove(false);
      freeMoveOriginRef.current = null;

      touchOriginRef.current = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startVal: valueRef.current,
        moved: false,
        target: e.target,
      };
      setIsDragging(true);
    };

    const handleWindowTouchMove = (e: TouchEvent) => {
      const origin = touchOriginRef.current;
      if (!origin) return;

      let touch: Touch | undefined;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === origin.id) {
          touch = e.touches[i];
          break;
        }
      }
      if (!touch) return;

      e.preventDefault();
      // Right -> smaller (-), Left -> larger (+)
      const dx = origin.x - touch.clientX;
      const dy = origin.y - touch.clientY;
      if (Math.hypot(dx, dy) > 8 && !origin.moved) {
        origin.moved = true;
        inputRef.current?.blur();
      }
      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      const steps = Math.trunc(primaryDelta / 30);
      commitSize(origin.startVal + steps);
    };

    const handleWindowTouchEnd = (e: TouchEvent) => {
      const origin = touchOriginRef.current;
      if (!origin) return;

      let ended = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === origin.id) {
          ended = true;
          break;
        }
      }
      if (!ended) return;

      lastDragMovedRef.current = origin.moved;
      const tapTarget = origin.target as Node | null;
      touchOriginRef.current = null;
      setIsDragging(false);

      if (!origin.moved && tapTarget) {
        if (prevBtnRef.current?.contains(tapTarget)) {
          stepSize(-1);
        } else if (nextBtnRef.current?.contains(tapTarget)) {
          stepSize(1);
        } else if (centerBadgeRef.current?.contains(tapTarget)) {
          setIsEditingText(true);
          inputRef.current?.focus();
        }
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
    window.addEventListener('touchend', handleWindowTouchEnd);
    window.addEventListener('touchcancel', handleWindowTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleWindowTouchMove);
      window.removeEventListener('touchend', handleWindowTouchEnd);
      window.removeEventListener('touchcancel', handleWindowTouchEnd);
    };
  }, [isEditingText, commitSize, stepSize]);

  // Desktop grab-and-drag: drag right -> smaller sizes, drag left -> larger sizes
  useEffect(() => {
    if (!isDragging || touchOriginRef.current) return;

    const handleWindowMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const origin = dragOriginRef.current;
      if (!origin) return;
      // Right -> smaller (-), Left -> larger (+)
      const dx = origin.x - e.clientX;
      const dy = origin.y - e.clientY;
      const distance = Math.hypot(dx, dy);
      if (distance > 8 && !origin.moved) {
        origin.moved = true;
        inputRef.current?.blur();
      }
      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      const steps = Math.trunc(primaryDelta / 30);
      commitSize(origin.startVal + steps);
    };

    const handleWindowUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      lastDragMovedRef.current = dragOriginRef.current?.moved ?? false;
      dragOriginRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handleWindowMove);
    window.addEventListener('pointerup', handleWindowUp);
    window.addEventListener('pointercancel', handleWindowUp);
    return () => {
      window.removeEventListener('pointermove', handleWindowMove);
      window.removeEventListener('pointerup', handleWindowUp);
      window.removeEventListener('pointercancel', handleWindowUp);
    };
  }, [isDragging, commitSize]);

  // Double-click free-move mode: move right -> smaller sizes, move left -> larger sizes
  useEffect(() => {
    if (!isFreeMove) return;

    const handleFreeMove = (e: MouseEvent) => {
      const origin = freeMoveOriginRef.current;
      if (!origin) {
        freeMoveOriginRef.current = { x: e.clientX, y: e.clientY, startVal: valueRef.current };
        return;
      }
      // Right -> smaller (-), Left -> larger (+)
      const dx = origin.x - e.clientX;
      const dy = origin.y - e.clientY;
      const primaryDelta = Math.abs(dx) >= Math.abs(dy) ? dx : dy;
      const steps = Math.trunc(primaryDelta / 32);
      commitSize(origin.startVal + steps);
    };

    const handleLockOnOutsideClick = (e: MouseEvent) => {
      if (wheelRef.current && wheelRef.current.contains(e.target as Node)) return;
      setIsFreeMove(false);
      freeMoveOriginRef.current = null;
    };

    const handleKeyLock = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        setIsFreeMove(false);
        freeMoveOriginRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleFreeMove);
    window.addEventListener('mousedown', handleLockOnOutsideClick);
    window.addEventListener('keydown', handleKeyLock);
    return () => {
      window.removeEventListener('mousemove', handleFreeMove);
      window.removeEventListener('mousedown', handleLockOnOutsideClick);
      window.removeEventListener('keydown', handleKeyLock);
    };
  }, [isFreeMove, commitSize]);

  const prevNum = value > min ? value - 1 : null;
  const nextNum = value < max ? value + 1 : null;

  return (
    <div className="flex items-center gap-1.5 select-none">
      <button
        type="button"
        onClick={() => {
          getRouletteAudio();
          setIsFreeMove(false);
          stepSize(-1);
        }}
        disabled={value <= min}
        aria-label="Disminuir talle"
        className="w-7 h-7 rounded-full bg-[#152B14] border border-[#4D8046] hover:border-[#9BD08A] disabled:opacity-35 text-[#DDECD7] hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
      >
        ‹
      </button>

      <div
        ref={wheelRef}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') return;
          getRouletteAudio();
          if (isFreeMove) {
            e.preventDefault();
            justLockedFreeMoveRef.current = true;
            setIsFreeMove(false);
            freeMoveOriginRef.current = null;
            return;
          }
          justLockedFreeMoveRef.current = false;
          if (isEditingText && e.target === inputRef.current) return;
          e.preventDefault();
          lastDragMovedRef.current = false;
          dragOriginRef.current = {
            x: e.clientX,
            y: e.clientY,
            startVal: valueRef.current,
            moved: false,
          };
          setIsDragging(true);
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          getRouletteAudio();
          onInteract?.();
          setIsDragging(false);
          setIsEditingText(false);
          inputRef.current?.blur();
          freeMoveOriginRef.current = {
            x: e.clientX,
            y: e.clientY,
            startVal: valueRef.current,
          };
          setIsFreeMove((prev) => !prev);
        }}
        style={{ touchAction: 'none' }}
        title="Arrastrá a la derecha para talles más chicos o a la izquierda para talles más grandes (26–56)"
        className={`relative overflow-hidden flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#0A1509] via-[#173015] to-[#0A1509] border shadow-[inset_0_2px_8px_rgba(0,0,0,0.85)] transition-all touch-none ${
          isFreeMove || isDragging
            ? 'border-[#9BD08A] ring-2 ring-[#9BD08A]/70 shadow-[0_0_14px_rgba(155,208,138,0.45)]'
            : 'border-[#5E9455] hover:border-[#9BD08A]'
        } ${isFreeMove ? 'cursor-ew-resize' : isDragging ? 'cursor-grabbing scale-[1.03]' : 'cursor-grab'}`}
      >
        {/* Bio-green kinetic flash pulse on every size change */}
        {tickSeq > 0 && (
          <span
            key={`flash-${tickSeq}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl animate-wheel-flash"
          />
        )}

        {/* Animated roulette drum notch ticks */}
        <span
          className="pointer-events-none absolute inset-x-3 top-0 h-[3px] flex justify-between opacity-65 transition-transform duration-150"
          style={{ transform: `translateX(${((value % 3) - 1) * 2}px)` }}
          aria-hidden="true"
        >
          <span className="w-[1px] h-full bg-[#9BD08A]" />
          <span className="w-[1px] h-full bg-[#9BD08A]" />
          <span className="w-[1px] h-full bg-[#9BD08A]" />
          <span className="w-[1px] h-full bg-[#9BD08A]" />
          <span className="w-[1px] h-full bg-[#9BD08A]" />
        </span>

        <button
          ref={prevBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            getRouletteAudio();
            if (justLockedFreeMoveRef.current) {
              justLockedFreeMoveRef.current = false;
              return;
            }
            if (!isFreeMove && !lastDragMovedRef.current && prevNum !== null) stepSize(-1);
          }}
          disabled={prevNum === null}
          style={{ touchAction: 'none' }}
          className="w-6 text-center text-[11px] font-mono text-[#86A87E] opacity-75 hover:opacity-100 hover:text-white transition-all cursor-inherit disabled:opacity-20 touch-none overflow-hidden"
          tabIndex={-1}
        >
          <span
            key={`prev-${tickSeq}`}
            className={`inline-block ${
              tickSeq > 0 ? (rollDir === 'up' ? 'animate-wheel-side-up' : 'animate-wheel-side-down') : ''
            }`}
          >
            {prevNum ?? '·'}
          </span>
        </button>

        <div
          ref={centerBadgeRef}
          onClick={(e) => {
            e.stopPropagation();
            getRouletteAudio();
            if (justLockedFreeMoveRef.current) {
              justLockedFreeMoveRef.current = false;
              return;
            }
            if (!isFreeMove && !lastDragMovedRef.current) {
              setIsEditingText(true);
              inputRef.current?.focus();
            }
          }}
          style={{ touchAction: 'none' }}
          className={`relative w-9 h-5 flex items-center justify-center rounded-md overflow-hidden shadow-[0_0_10px_rgba(211,201,172,0.35)] transition-colors touch-none ${
            isFreeMove || isDragging ? 'bg-[#9BD08A] text-[#0E140D]' : 'bg-[#D3C9AC] text-[#0E140D]'
          }`}
        >
          {!isEditingText && (
            <span
              key={`cur-${tickSeq}`}
              className={`font-mono font-bold text-xs leading-none inline-block ${
                tickSeq > 0 ? (rollDir === 'up' ? 'animate-wheel-up' : 'animate-wheel-down') : ''
              }`}
            >
              {value}
            </span>
          )}

          <input
            ref={inputRef}
            type="number"
            min={min}
            max={max}
            value={draftValue}
            onFocus={() => setIsEditingText(true)}
            onChange={(e) => {
              const raw = e.target.value;
              setDraftValue(raw);
              const parsed = parseInt(raw, 10);
              if (!Number.isNaN(parsed) && parsed >= min && parsed <= max) {
                commitSize(parsed);
              }
            }}
            onBlur={() => {
              setIsEditingText(false);
              const parsed = parseInt(draftValue, 10);
              const finalVal = Number.isNaN(parsed) ? value : clamp(parsed);
              setDraftValue(String(finalVal));
              if (finalVal !== value) commitSize(finalVal);
            }}
            aria-label="Número de talle"
            style={{ touchAction: 'none' }}
            className={`no-spinner w-full h-full text-center font-mono font-bold text-xs bg-transparent text-[#0E140D] focus:outline-none focus:ring-2 focus:ring-[#9BD08A] cursor-inherit touch-none ${
              isEditingText ? 'relative opacity-100 pointer-events-auto' : 'absolute inset-0 opacity-0 pointer-events-none'
            }`}
          />
        </div>

        <button
          ref={nextBtnRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            getRouletteAudio();
            if (justLockedFreeMoveRef.current) {
              justLockedFreeMoveRef.current = false;
              return;
            }
            if (!isFreeMove && !lastDragMovedRef.current && nextNum !== null) stepSize(1);
          }}
          disabled={nextNum === null}
          style={{ touchAction: 'none' }}
          className="w-6 text-center text-[11px] font-mono text-[#86A87E] opacity-75 hover:opacity-100 hover:text-white transition-all cursor-inherit disabled:opacity-20 touch-none overflow-hidden"
          tabIndex={-1}
        >
          <span
            key={`next-${tickSeq}`}
            className={`inline-block ${
              tickSeq > 0 ? (rollDir === 'up' ? 'animate-wheel-side-up' : 'animate-wheel-side-down') : ''
            }`}
          >
            {nextNum ?? '·'}
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          getRouletteAudio();
          setIsFreeMove(false);
          stepSize(1);
        }}
        disabled={value >= max}
        aria-label="Aumentar talle"
        className="w-7 h-7 rounded-full bg-[#152B14] border border-[#4D8046] hover:border-[#9BD08A] disabled:opacity-35 text-[#DDECD7] hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}

export default function App() {
  // Logo Jump / Reaction state
  const [logoBumping, setLogoBumping] = useState(false);
  const logoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLogoReaction = () => {
    setLogoBumping(true);
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);
    logoTimerRef.current = setTimeout(() => {
      setLogoBumping(false);
    }, 700);
  };

  // Sparkles
  const lastSparkleTimeRef = useRef<number>(0);

  // E-commerce & UI State
  const [activeFilter, setActiveFilter] = useState<string>('todo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('rel');
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({
    b1: '40',
    b2: '40',
    b3: '40',
    b4: '40',
    b5: '40',
    b6: '40',
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; size: string; price: number; qty: number }[]>([]);
  const [emailOpened, setEmailOpened] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Official 000GREEN YouTube Soundtrack Engine (Video ID: NFa7KlLyzGY @ 503s) - SOLE AUDIO ENGINE
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.85);
  const hasUserTriggeredMusic = useRef<boolean>(false);

  // Fullscreen State & Feedback Toast
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFsToast, setShowFsToast] = useState<boolean>(false);
  const fsToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleFullscreen = async () => {
    triggerLogoReaction();
    try {
      const doc = document as any;
      const docEl = document.documentElement as any;

      const isCurrentlyFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (isCurrentlyFs) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      } else {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          await docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          await docEl.msRequestFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any;
      const isFs = !!(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      setIsFullscreen(isFs);

      if (isFs) {
        setShowFsToast(true);
        if (fsToastTimerRef.current) clearTimeout(fsToastTimerRef.current);
        fsToastTimerRef.current = setTimeout(() => {
          setShowFsToast(false);
        }, 2600);
      } else {
        setShowFsToast(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
      if (fsToastTimerRef.current) clearTimeout(fsToastTimerRef.current);
    };
  }, []);

  // Official 000GREEN Exclusive YouTube Soundtrack Engine (NFa7KlLyzGY @ 503s)
  useEffect(() => {
    let isMounted = true;

    const playYouTubeAudio = () => {
      if (!ytPlayerRef.current || !isYtReadyRef.current) return;
      try {
        ytPlayerRef.current.seekTo(503, true);
        ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
        ytPlayerRef.current.playVideo();
      } catch {}
    };

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      try {
        ytPlayerRef.current = new (window as any).YT.Player('yt-music-iframe-holder', {
          height: '200',
          width: '200',
          videoId: 'NFa7KlLyzGY',
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            start: 503,
            loop: 1,
            playlist: 'NFa7KlLyzGY',
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              isYtReadyRef.current = true;
              try {
                event.target.setVolume(Math.round(musicVolume * 100));
                event.target.seekTo(503, true);
                event.target.playVideo();
              } catch {}

              if (hasUserTriggeredMusic.current) {
                try {
                  event.target.playVideo();
                  setIsMusicPlaying(true);
                } catch {}
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsMusicPlaying(true);
                hasUserTriggeredMusic.current = true;
              } else if (event.data === 2) {
                setIsMusicPlaying(false);
              } else if (event.data === 0) {
                // Loop back to 503s seamlessly
                try {
                  event.target.seekTo(503, true);
                  event.target.playVideo();
                } catch {}
              }
            },
          },
        });
      } catch {}
    };

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = initYT;
    } else if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    }

    // Trigger playback on first user interaction anywhere (tap, click, key, or scroll)
    const handleFirstInteraction = () => {
      if (!hasUserTriggeredMusic.current) {
        hasUserTriggeredMusic.current = true;
        playYouTubeAudio();
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });
    window.addEventListener('scroll', handleFirstInteraction, { once: true });

    return () => {
      isMounted = false;
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      try {
        if (ytPlayerRef.current?.destroy) {
          ytPlayerRef.current.destroy();
        }
      } catch {}
    };
  }, [musicVolume]);

  const toggleMusic = () => {
    triggerLogoReaction();
    hasUserTriggeredMusic.current = true;

    if (!ytPlayerRef.current || !isYtReadyRef.current) return;
    try {
      if (isMusicPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsMusicPlaying(false);
      } else {
        ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
        ytPlayerRef.current.playVideo();
        setIsMusicPlaying(true);
      }
    } catch {}
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);
    if (!ytPlayerRef.current || !isYtReadyRef.current) return;
    try {
      ytPlayerRef.current.setVolume(Math.round(vol * 100));
      if (vol === 0) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    } catch {}
  };

  const fmt = (n: number) => `₲ ${Math.round(n).toLocaleString('es-PY')}`;

  // Interactive subtle green sparkle trail and click reactions
  useEffect(() => {
    const STAR_PATH = 'M12 0Q13 11 24 12Q13 13 12 24Q11 13 0 12Q11 11 12 0Z';
    const SPARKLE_COLORS = ['#7E9A64', '#9BD08A', '#5E824C', '#A4C992', '#4D6B3F', '#8FA87B', '#6B8E57'];
    const fxContainer = document.getElementById('fx');

    const spawn = (x: number, y: number, o: { s: number; dx: number; dy: number; d: number; c?: string }) => {
      if (!fxContainer || fxContainer.children.length > 60) return;
      const s = document.createElement('span');
      s.className = 'fxs';
      s.innerHTML = `<svg viewBox="0 0 24 24"><path d="${STAR_PATH}" fill="currentColor"/></svg>`;
      s.style.left = `${x}px`;
      s.style.top = `${y}px`;
      s.style.width = `${o.s}px`;
      s.style.height = `${o.s}px`;
      s.style.color = o.c || SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
      fxContainer.appendChild(s);

      const a = s.animate(
        [
          { transform: 'translate(-50%,-50%) scale(.2) rotate(0deg)', opacity: 1 },
          {
            transform: `translate(calc(-50% + ${o.dx}px), calc(-50% + ${o.dy}px)) scale(1) rotate(180deg)`,
            opacity: 0.9,
            offset: 0.4,
          },
          {
            transform: `translate(calc(-50% + ${o.dx * 1.5}px), calc(-50% + ${o.dy * 1.5}px)) scale(.1) rotate(360deg)`,
            opacity: 0,
          },
        ],
        { duration: o.d, easing: 'ease-out' }
      );
      a.onfinish = () => s.remove();
    };

    const burst = (x: number, y: number, count = 8, customColor?: string) => {
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        const dist = 30 + Math.random() * 45;
        spawn(x, y, {
          s: 3.5 + Math.random() * 4,
          dx: Math.cos(ang) * dist,
          dy: Math.sin(ang) * dist,
          d: 650 + Math.random() * 300,
          c: customColor,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Spawn subtle green trail sparkles
      const now = Date.now();
      if (now - lastSparkleTimeRef.current > 45) {
        lastSparkleTimeRef.current = now;
        spawn(e.clientX, e.clientY, {
          s: 3 + Math.random() * 4,
          dx: (Math.random() - 0.5) * 20,
          dy: 8 + Math.random() * 16,
          d: 750 + Math.random() * 200,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      triggerLogoReaction();
      burst(e.clientX, e.clientY, 8);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        triggerLogoReaction();
        const touch = e.touches[0];
        burst(touch.clientX, touch.clientY, 6);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];

      const now = Date.now();
      if (now - lastSparkleTimeRef.current > 50) {
        lastSparkleTimeRef.current = now;
        spawn(touch.clientX, touch.clientY, {
          s: 3 + Math.random() * 4,
          dx: (Math.random() - 0.5) * 18,
          dy: 8 + Math.random() * 14,
          d: 700,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const toggleFavorite = (id: string) => {
    triggerLogoReaction();
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getProductSearchableText = (p: ProductItem) => {
    return normalize(
      [
        p.name,
        p.desc,
        p.kind,
        p.colors.map((c) => c[0]).join(' '),
        p.keywords.join(' '),
        'pantalon pantalones baggy baguies baggies wide leg cargo denim streetwear ropa'
      ].join(' ')
    );
  };

  const scrollToProductMatch = (query: string, immediate = false) => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

    const performScroll = () => {
      const q = normalize(query.trim());
      if (!q) {
        const catalogoEl = document.getElementById('catalogo');
        if (catalogoEl) catalogoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // 1. Try to find the matching product directly
      const tokens = q.split(/\s+/).filter(Boolean);
      const matched = EXACT_PRODUCTS.find((p) => {
        const text = getProductSearchableText(p);
        return tokens.every((t) => text.includes(t));
      });

      if (matched) {
        const el = document.getElementById(`producto-${matched.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      // 2. Fallback: scroll directly to the catalog / results section
      const catalogoEl = document.getElementById('catalogo');
      if (catalogoEl) {
        catalogoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (immediate) {
      performScroll();
    } else {
      scrollTimerRef.current = setTimeout(performScroll, 90);
    }
  };

  // Filter & sorting for products
  const filteredProducts = EXACT_PRODUCTS.filter((p) => {
    // Real-time live multi-keyword search across all fields and rich keywords
    if (searchQuery.trim()) {
      const tokens = normalize(searchQuery.trim()).split(/\s+/).filter(Boolean);
      const searchable = getProductSearchableText(p);
      const matches = tokens.every((token) => searchable.includes(token));
      if (!matches) return false;
    }

    // Filter by favorites if activeFilter is 'favoritos'
    if (activeFilter === 'favoritos') {
      if (!favorites.includes(p.id)) return false;
    } else if (activeFilter !== 'todo' && p.id !== activeFilter && p.name !== activeFilter) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price;
    if (sortBy === 'desc') return b.price - a.price;
    if (sortBy === 'az') return a.name.localeCompare(b.name);
    return 0; // 'rel' default order
  });

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const getOrderSummaryText = () => {
    if (cartItems.length === 0) {
      return 'Hola 000GREEN! Me gustaría consultar sobre la colección de pantalones baggy.';
    }
    const itemsList = cartItems
      .map((item) => `• ${item.name} (Talle ${item.size}) x${item.qty} - ${fmt(item.price * item.qty)}`)
      .join('\n');

    return `Hola 000GREEN! Quiero finalizar mi compra:\n\n${itemsList}\n\nTotal estimado: ${fmt(total)}\n\n¿Me confirman para coordinar la entrega?`;
  };

  const getGmailOrderUrl = () => {
    const subject = `Pedido 000GREEN - ${fmt(total)}`;
    return `https://mail.google.com/mail/?view=cm&fs=1&to=000green@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(getOrderSummaryText())}`;
  };

  const getMailtoOrderUrl = () => {
    const subject = `Pedido 000GREEN - ${fmt(total)}`;
    return `mailto:000green@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getOrderSummaryText())}`;
  };

  const handleGmailLaunch = () => {
    triggerLogoReaction();
    const text = getOrderSummaryText();
    try {
      void navigator.clipboard?.writeText(text);
    } catch {}
    setEmailOpened(true);
  };

  return (
    <div className="min-h-screen bg-black text-[#E3DCC3] font-body selection:bg-[#7E9A64] selection:text-black relative overflow-x-hidden">
      {/* SPARKLE PARTICLES CONTAINER */}
      <div id="fx" aria-hidden="true" />

      {/* 000GREEN OFFICIAL YOUTUBE SOUNDTRACK ENGINE (NFa7KlLyzGY @ 503s - EXCLUSIVE) */}
      <div
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <div id="yt-music-iframe-holder" />
      </div>

      {/* BACKGROUND MASCOT (SEAMLESS CONTINUOUS BOOMERANG LOOP WITH SOFT EDGE DISSOLVE) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center [mask-image:linear-gradient(to_bottom,black_0%,black_82%,transparent_98%)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          src="/assets/aistudio/video_clean.mp4?v=2"
          className="h-[84vh] sm:h-[90vh] md:h-[95vh] max-h-[960px] w-auto max-w-none object-contain object-center select-none pointer-events-none transition-opacity duration-700"
        />
      </div>

      {/* FIXED TOP HEADER & SEARCH BAR (ALWAYS VISIBLE WHILE SCROLLING) */}
      <header className="fixed top-0 inset-x-0 z-40 bg-black/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-2.5 transition-colors shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center justify-between gap-3">
            {/* Brand Logo & Wordmark (CREST JUMP + LETTER WAVE HOP) */}
            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ fontFamily: "'Times New Roman', serif" }}
              className="shrink-0 inline-flex items-center gap-2.5 sm:gap-3 group focus:outline-none cursor-pointer font-['Times_New_Roman',serif] select-none whitespace-nowrap"
              title="000GREEN (Haz clic para hacer saltar el logo)"
            >
              {/* Jumping Official Brand Crest Badge */}
              <span
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-[#D3C9AC] overflow-hidden flex items-center justify-center bg-[#182C15] shrink-0 shadow-[0_0_12px_rgba(100,160,80,0.35)] transition-all ${
                  logoBumping ? 'animate-logo-jump ring-2 ring-[#9BD08A]' : 'group-hover:scale-105'
                }`}
              >
                <img
                  src={BRAND_LOGO_SRC}
                  alt="000GREEN Logo Oficial"
                  className="w-full h-full object-contain"
                />
              </span>

              {/* Hopping Letters Wordmark (Restored original wave animation, stabilized for landscape) */}
              <span translate="no" className="notranslate font-['Times_New_Roman',serif] font-bold text-xl sm:text-2xl tracking-[0.16em] text-[#E3DCC3] group-hover:text-white transition-colors shrink-0 whitespace-nowrap inline-flex items-center select-none">
                {'000GREEN'.split('').map((letter, i) => (
                  <span
                    key={i}
                    className={`inline-block whitespace-nowrap ${logoBumping ? 'letter-hop' : ''}`}
                    style={{
                      animationDelay: `${i * 45}ms`,
                      fontFamily: "'Times New Roman', serif",
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </button>

            {/* Mobile Actions (Visible on small screens) */}
            <div className="flex sm:hidden items-center gap-1.5 sm:gap-2">
              {/* Fullscreen Toggle Mobile */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer relative shadow-sm transition-all duration-200 group ${
                  isFullscreen
                    ? 'bg-[#183216] border-[#9BD08A] text-[#9BD08A] shadow-[0_0_12px_rgba(155,208,138,0.4)] ring-1 ring-[#9BD08A]/40'
                    : 'bg-[#274D24] border-[#5E9455] text-[#DDECD7] hover:border-[#D3C9AC] hover:text-white hover:bg-[#32612E]'
                }`}
                title={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
                aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
              >
                {isFullscreen ? (
                  <svg
                    className="w-4 h-4 text-[#9BD08A] shrink-0 transition-transform duration-200 group-hover:scale-90"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 4v5H4" />
                    <path d="M9 9L3.5 3.5" />
                    <path d="M15 4v5h5" />
                    <path d="M15 9l5.5-5.5" />
                    <path d="M9 20v-5H4" />
                    <path d="M9 15l-5.5 5.5" />
                    <path d="M15 20v-5h5" />
                    <path d="M15 15l5.5 5.5" />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-[#DDECD7] group-hover:text-white shrink-0 transition-transform duration-200 group-hover:scale-110"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3.5 8.5V3.5h5" />
                    <path d="M3.5 3.5L9 9" />
                    <path d="M20.5 8.5V3.5h-5" />
                    <path d="M20.5 3.5L15 9" />
                    <path d="M3.5 15.5v5h5" />
                    <path d="M3.5 20.5L9 15" />
                    <path d="M20.5 15.5v5h-5" />
                    <path d="M20.5 20.5L15 15" />
                  </svg>
                )}
              </button>

              {/* Music Toggle Mobile */}
              <button
                type="button"
                onClick={toggleMusic}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs cursor-pointer relative shadow-sm transition-all ${
                  isMusicPlaying
                    ? 'bg-[#183216] border-[#9BD08A] text-[#9BD08A] shadow-[0_0_10px_rgba(155,208,138,0.35)]'
                    : 'bg-[#274D24] border-[#5E9455] text-white hover:border-[#D3C9AC]'
                }`}
                title={isMusicPlaying ? 'Pausar música ambiental' : 'Reproducir música ambiental'}
              >
                {isMusicPlaying ? (
                  <span className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center">
                    <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-1" />
                    <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-2" />
                    <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-3" />
                  </span>
                ) : (
                  <svg className="w-4 h-4 text-[#DDECD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerLogoReaction();
                  setFavoritesOpen(true);
                }}
                className="w-9 h-9 rounded-full bg-[#274D24] border border-[#5E9455] flex items-center justify-center text-xs cursor-pointer relative shadow-sm"
                title="Ver Favoritos"
              >
                <svg
                  className={`w-4 h-4 ${favorites.length > 0 ? 'text-[#E88C84] fill-current' : 'text-[#DDECD7]'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.5 3 5 6.4 5c2 0 3.4 1.1 4.1 2.4h3C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.5 21.5 11.8 19.5 16.4 12 21 12 21z"
                  />
                </svg>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D3C9AC] text-[#0E140D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerLogoReaction();
                  setCartOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-[#274D24] border border-[#5E9455] text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer relative text-white shadow-sm"
              >
                <svg className="w-4 h-4 text-[#DDECD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 8h14l-1.2 12H6.2zM9 8V6a3 3 0 016 0v2"
                  />
                </svg>
                <span>{cartItems.reduce((acc, i) => acc + i.qty, 0)}</span>
              </button>
            </div>
          </div>

          {/* Search bar (Real-time live search with instant scroll to product) */}
          <div className="flex-1 max-w-md w-full relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D8EADB] cursor-pointer"
              onClick={() => {
                if (searchQuery.trim()) {
                  triggerLogoReaction();
                  scrollToProductMatch(searchQuery, true);
                }
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path d="M20 20l-4-4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                triggerLogoReaction();
                if (val.trim().length > 0) {
                  scrollToProductMatch(val, false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  triggerLogoReaction();
                  scrollToProductMatch(searchQuery, true);
                }
              }}
              placeholder="Buscar por modelo, color, cargo, denim, negro, verde..."
              className="w-full bg-[#284E25] border-2 border-[#5E9455] text-sm text-white placeholder-[#C8DFC0] rounded-full py-2 pl-10 pr-9 focus:outline-none focus:border-[#9BD08A] focus:ring-2 focus:ring-[#9BD08A]/40 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  triggerLogoReaction();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C8DFC0] hover:text-white bg-[#1E3F1C] hover:bg-[#346230] rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Fullscreen Toggle Desktop */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className={`inline-flex items-center gap-2 border text-xs font-semibold px-3.5 py-2 rounded-full transition-all duration-200 cursor-pointer relative shadow-sm group ${
                isFullscreen
                  ? 'bg-[#183216] border-[#9BD08A] text-[#9BD08A] shadow-[0_0_12px_rgba(155,208,138,0.4)] ring-1 ring-[#9BD08A]/40'
                  : 'bg-[#274D24] border-[#5E9455] hover:border-[#D3C9AC] text-[#DDECD7] hover:text-white hover:bg-[#32612E]'
              }`}
              title={isFullscreen ? 'Salir de pantalla completa (o presiona ESC)' : 'Activar pantalla completa para una experiencia inmersiva'}
              aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Ver en pantalla completa'}
            >
              {isFullscreen ? (
                <svg
                  className="w-4 h-4 text-[#9BD08A] shrink-0 transition-transform duration-200 group-hover:scale-90"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 4v5H4" />
                  <path d="M9 9L3.5 3.5" />
                  <path d="M15 4v5h5" />
                  <path d="M15 9l5.5-5.5" />
                  <path d="M9 20v-5H4" />
                  <path d="M9 15l-5.5 5.5" />
                  <path d="M15 20v-5h5" />
                  <path d="M15 15l5.5 5.5" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-[#DDECD7] group-hover:text-white shrink-0 transition-transform duration-200 group-hover:scale-110"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 8.5V3.5h5" />
                  <path d="M3.5 3.5L9 9" />
                  <path d="M20.5 8.5V3.5h-5" />
                  <path d="M20.5 3.5L15 9" />
                  <path d="M3.5 15.5v5h5" />
                  <path d="M3.5 20.5L9 15" />
                  <path d="M20.5 15.5v5h-5" />
                  <path d="M20.5 20.5L15 15" />
                </svg>
              )}
              <span>{isFullscreen ? 'Salir Fullscreen' : 'Pantalla Completa'}</span>
            </button>

            {/* Music Toggle Desktop (Top Header) */}
            <button
              type="button"
              onClick={toggleMusic}
              className={`inline-flex items-center gap-2 border text-xs font-semibold px-3.5 py-2 rounded-full transition-all cursor-pointer relative shadow-sm ${
                isMusicPlaying
                  ? 'bg-[#183216] border-[#9BD08A] text-[#9BD08A] shadow-[0_0_12px_rgba(155,208,138,0.35)]'
                  : 'bg-[#274D24] border-[#5E9455] hover:border-[#D3C9AC] text-white'
              }`}
              title={isMusicPlaying ? 'Pausar música oficial 000GREEN' : 'Reproducir música oficial 000GREEN'}
            >
              {isMusicPlaying ? (
                <span className="flex items-end gap-[2px] h-3.5 w-3.5 justify-center">
                  <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-1" />
                  <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-2" />
                  <span className="w-[2.5px] bg-[#9BD08A] rounded-full animate-sound-bar-3" />
                </span>
              ) : (
                <svg className="w-4 h-4 text-[#DDECD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              )}
              <span>{isMusicPlaying ? 'Música ON' : 'Música'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setFavoritesOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#274D24] border border-[#5E9455] hover:border-[#D3C9AC] text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer text-white shadow-sm"
              title="Ver Favoritos"
            >
              <svg
                className={`w-4 h-4 ${favorites.length > 0 ? 'text-[#E88C84] fill-current' : 'text-[#DDECD7]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.5 3 5 6.4 5c2 0 3.4 1.1 4.1 2.4h3C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.5 21.5 11.8 19.5 16.4 12 21 12 21z"
                />
              </svg>
              <span>Favoritos</span>
              {favorites.length > 0 && (
                <span className="bg-[#D3C9AC] text-[#0E140D] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setCartOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-[#274D24] border border-[#5E9455] hover:border-[#D3C9AC] text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer relative text-white shadow-sm"
            >
              <svg className="w-4 h-4 text-[#DDECD7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 8h14l-1.2 12H6.2zM9 8V6a3 3 0 016 0v2"
                />
              </svg>
              <span>Carrito</span>
              {cartItems.length > 0 && (
                <span className="bg-[#D3C9AC] text-[#0E140D] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {cartItems.reduce((acc, i) => acc + i.qty, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* FULLSCREEN FEEDBACK TOAST NOTIFICATION */}
      {showFsToast && (
        <div className="fixed top-20 inset-x-0 z-50 flex justify-center pointer-events-none px-4 transition-all duration-300">
          <div className="bg-[#183216]/95 border-2 border-[#9BD08A] text-white px-5 py-2.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(155,208,138,0.4)] backdrop-blur-md flex items-center gap-3 text-xs sm:text-sm font-semibold animate-bounce">
            <svg
              className="w-4 h-4 text-[#9BD08A] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.5 8.5V3.5h5" />
              <path d="M3.5 3.5L9 9" />
              <path d="M20.5 8.5V3.5h-5" />
              <path d="M20.5 3.5L15 9" />
              <path d="M3.5 15.5v5h5" />
              <path d="M3.5 20.5L9 15" />
              <path d="M20.5 15.5v5h-5" />
              <path d="M20.5 20.5L15 15" />
            </svg>
            <span>Pantalla completa activada · 000GREEN</span>
            <span className="text-[#D3C9AC] text-[11px] font-mono hidden sm:inline">(Presiona ESC para salir)</span>
          </div>
        </div>
      )}

      {/* FIXED HEADER SPACING SPACER */}
      <div className="h-[105px] sm:h-[66px]" />

      {/* ROTATING TEXT TICKER (SOLO TEXTO, SIN FONDO VERDE NI LÍNEAS) */}
      <div className="py-3 sm:py-4 overflow-hidden select-none notranslate" translate="no" aria-hidden="true">
        <div className="animate-marquee font-mark text-xs sm:text-sm tracking-[0.25em] uppercase text-[#E3DCC3] font-semibold flex items-center gap-8">
          <span>000GREEN</span>
          <span>·</span>
          <span>Corte Amplio Sin Reglas</span>
          <span>·</span>
          <span>Edición Verde Musgo</span>
          <span>·</span>
          <span>Talles Reales 26 al 56</span>
          <span>·</span>
          <span>Sarga &amp; Denim Pesado</span>
          <span>·</span>
          <span>Actitud Urbana Independiente</span>
          <span>·</span>
          <span>Stock Exclusivo</span>
          <span>·</span>
          <span>Pedidos por Gmail</span>
          <span>·</span>
          <span>000GREEN</span>
          <span>·</span>
          <span>Corte Amplio Sin Reglas</span>
          <span>·</span>
          <span>Edición Verde Musgo</span>
          <span>·</span>
          <span>Talles Reales 26 al 56</span>
          <span>·</span>
          <span>Sarga &amp; Denim Pesado</span>
          <span>·</span>
          <span>Actitud Urbana Independiente</span>
          <span>·</span>
          <span>Stock Exclusivo</span>
          <span>·</span>
          <span>Pedidos por Gmail</span>
        </div>
      </div>

      {/* CATALOG PREVIEW SECTION */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16 relative z-10">
        {/* Catalog Header Recuadro de Fondo */}
        <div className="bg-[#183216] border-2 border-[#548A4C] rounded-2xl p-6 sm:p-8 mb-8 shadow-[0_12px_35px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-block bg-[#274D24] border border-[#5E9455] px-3.5 py-1 rounded-full text-xs uppercase tracking-[0.2em] font-bold text-[#D3C9AC] mb-3 shadow-sm">
              Catálogo Oficial · Productos de Calidad
            </div>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white">
              Catálogo
            </h2>
          </div>

          <div className="flex flex-col sm:items-end gap-2.5">
            <div className="bg-[#274D24] border-2 border-[#5E9455] rounded-xl px-4 py-2.5 text-xs font-mono text-[#D3C9AC] font-bold shadow-md self-start sm:self-auto">
              {filteredProducts.length} productos disponibles
            </div>
          </div>
        </div>

        {/* Filter Bar (Quality optical products, matching catalog box color and styling) */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#183216] border-2 border-[#548A4C] rounded-2xl p-4 sm:p-5 mb-10 shadow-[0_12px_35px_rgba(0,0,0,0.7)]">
          {/* Watch Names Pills (No 000GREEN Signature) */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setActiveFilter('todo');
                setSearchQuery('');
                const catalogoEl = document.getElementById('catalogo');
                if (catalogoEl) catalogoEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'todo'
                  ? 'bg-[#D3C9AC] text-[#0E140D] font-bold shadow-md'
                  : 'bg-[#274D24] text-white border border-[#5E9455] hover:border-[#9BD08A] hover:bg-[#32612E]'
              }`}
            >
              Todos los pantalones
            </button>

            {/* Favoritos Pill */}
            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setActiveFilter((prev) => (prev === 'favoritos' ? 'todo' : 'favoritos'));
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeFilter === 'favoritos'
                  ? 'bg-[#E88C84] text-[#0E140D] font-bold shadow-md'
                  : 'bg-[#274D24] text-white border border-[#5E9455] hover:border-[#E88C84] hover:bg-[#32612E]'
              }`}
              title="Filtrar por productos favoritos"
            >
              <svg
                className={`w-3.5 h-3.5 ${activeFilter === 'favoritos' ? 'fill-current text-[#0E140D]' : 'fill-current text-[#E88C84]'}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.5 3 5 6.4 5c2 0 3.4 1.1 4.1 2.4h3C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.5 21.5 11.8 19.5 16.4 12 21 12 21z" />
              </svg>
              <span>Favoritos ({favorites.length})</span>
            </button>

            {EXACT_PRODUCTS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  triggerLogoReaction();
                  setActiveFilter((prev) => (prev === p.id ? 'todo' : p.id));
                  scrollToProductMatch(p.name, true);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeFilter === p.id
                    ? 'bg-[#D3C9AC] text-[#0E140D] font-bold shadow-md'
                    : 'bg-[#274D24] text-white border border-[#5E9455] hover:border-[#9BD08A] hover:bg-[#32612E]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Sort Controls (Price slider removed as requested) */}
          <div className="flex items-center gap-4 text-xs text-white">
            <label className="flex items-center gap-2">
              <span className="font-medium text-[#DDECD7]">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  triggerLogoReaction();
                  setSortBy(e.target.value);
                }}
                className="bg-[#274D24] border border-[#5E9455] rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none focus:border-[#9BD08A] cursor-pointer"
              >
                <option value="rel">Destacados</option>
                <option value="asc">Precio: menor a mayor</option>
                <option value="desc">Precio: mayor a menor</option>
                <option value="az">Nombre A–Z</option>
              </select>
            </label>
          </div>
        </div>

        {/* Active Search Results Banner */}
        {searchQuery.trim() && (
          <div className="mb-6 bg-[#183216] border-2 border-[#5E9455] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-[#D3C9AC] font-bold">Búsqueda activa:</span>
              <span className="bg-[#0B150A] border border-[#44763C] px-2.5 py-0.5 rounded-md font-mono text-[#F0E9D5] font-bold">
                "{searchQuery}"
              </span>
              <span className="text-[#A4C992]">
                · {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'} encontrado{filteredProducts.length === 1 ? '' : 's'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setSearchQuery('');
              }}
              className="text-[#E88C84] hover:text-white underline font-bold cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Empty State (Solid luxury background, no background video bleed-through) */}
        {filteredProducts.length === 0 && (
          <div className="relative z-20 bg-[#0B140A] border-2 border-[#376632] rounded-2xl p-8 sm:p-12 text-center space-y-5 my-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-w-2xl mx-auto">
            {activeFilter === 'favoritos' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-[#182C15] border border-[#E88C84]/60 flex items-center justify-center mx-auto text-2xl shadow-inner">
                  ❤️
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Tu lista de favoritos está vacía
                </h3>
                <p className="text-xs sm:text-sm text-[#D7E8D3] max-w-md mx-auto leading-relaxed">
                  Podés guardar tus modelos preferidos tocando el ícono de corazón en cualquier pantalón del catálogo para tenerlos siempre a mano y coordinar tu compra.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      setActiveFilter('todo');
                    }}
                    className="bg-[#D3C9AC] text-[#0E140D] font-bold px-7 py-3 rounded-full text-xs sm:text-sm hover:bg-white transition-all cursor-pointer shadow-lg hover:scale-105"
                  >
                    Ver todos los pantalones
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#182C15] border border-[#5E9455] flex items-center justify-center mx-auto text-2xl shadow-inner">
                  🔍
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  No se encontraron resultados
                </h3>
                <p className="text-xs sm:text-sm text-[#D7E8D3] max-w-md mx-auto leading-relaxed">
                  No encontramos coincidencias exactas para <span className="font-semibold text-white font-mono">"{searchQuery}"</span>. Probá buscando por alguna de estas opciones:
                </p>
                {/* Search suggestion pills */}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {['Verde', 'Cargo', 'Denim', 'Parachute', 'Negro', 'Indigo'].map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        triggerLogoReaction();
                        setSearchQuery(kw);
                      }}
                      className="bg-[#183216] hover:bg-[#254A22] text-[#D3C9AC] hover:text-white border border-[#44763C] text-xs px-3 py-1 rounded-full font-medium transition-all cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      setSearchQuery('');
                      setActiveFilter('todo');
                    }}
                    className="bg-[#D3C9AC] text-[#0E140D] font-bold px-7 py-3 rounded-full text-xs sm:text-sm hover:bg-white transition-all cursor-pointer shadow-lg hover:scale-105"
                  >
                    Restablecer catálogo
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((p) => {
            const isMatch =
              searchQuery.trim().length > 0 &&
              (normalize(p.name).includes(normalize(searchQuery.trim())) ||
                p.colors.some((c) => normalize(c[0]).includes(normalize(searchQuery.trim()))));

            return (
              <div
                key={p.id}
                id={`producto-${p.id}`}
                className={`bg-[#183216] border-2 ${
                  isMatch
                    ? 'border-[#9BD08A] ring-2 ring-[#9BD08A] shadow-[0_0_35px_rgba(155,208,138,0.45)]'
                    : 'border-[#548A4C]'
                } rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_rgba(0,0,0,0.6)] scroll-mt-28 transition-all duration-300`}
              >
                <div>
                  {/* Top Header of the Watch Box: Only Favorite button (Edición Limitada removed as requested) */}
                  <div className="flex justify-end items-center mb-2.5">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      className="w-8 h-8 rounded-full border border-[#5E9455] bg-[#274D24] flex items-center justify-center hover:border-white transition-colors cursor-pointer"
                      title={favorites.includes(p.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <svg
                        className={`w-4 h-4 ${
                          favorites.includes(p.id) ? 'text-[#E88C84] fill-current' : 'text-[#D5E7CF]'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.5 3 5 6.4 5c2 0 3.4 1.1 4.1 2.4h3C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.5 21.5 11.8 19.5 16.4 12 21 12 21z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Official Baggy Pants Studio Photo Tile (static studio backdrop + floating pants cutout) */}
                  <div
                    onClick={() => triggerLogoReaction()}
                    className="aspect-[4/5] rounded-xl bg-gradient-to-b from-[#071307] via-[#10260F] to-[#050C05] border-2 border-[#68A85E]/75 mb-4 flex items-center justify-center relative overflow-hidden shadow-[inset_0_0_28px_rgba(0,0,0,0.75)] cursor-pointer group/pant"
                  >
                    {/* Fixed 000GREEN studio spotlight halo behind the garment (never moves on hover) */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 45%, rgba(211, 201, 172, 0.34) 0%, rgba(126, 154, 100, 0.20) 28%, rgba(16, 36, 15, 0) 64%)',
                      }}
                    />

                    {/* Fixed dark studio floor plane */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-t from-[#030703] via-[#081207]/75 to-transparent"
                    />

                    {failedImages[p.id] ? (
                      <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center gap-2 text-[#D3C9AC]">
                        <span className="text-xs font-mono uppercase tracking-widest text-[#9BD08A]">000GREEN</span>
                        <span className="text-sm font-bold text-white">{p.name}</span>
                      </div>
                    ) : (
                      <>
                        {/* Ground shadow stays on the floor while softening as the pants lift */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-[6%] left-1/2 -translate-x-1/2 w-[52%] h-3.5 rounded-full bg-black/80 blur-[7px] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/pant:scale-90 group-hover/pant:opacity-45 group-hover/pant:blur-[10px]"
                        />

                        {/* Only the pants cutout lifts smoothly on hover */}
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          onError={() => setFailedImages((prev) => ({ ...prev, [p.id]: true }))}
                          className="relative z-10 w-full h-full object-contain object-center drop-shadow-[0_10px_14px_rgba(0,0,0,0.65)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover/pant:-translate-y-4 group-hover/pant:scale-[1.035] group-hover/pant:drop-shadow-[0_24px_18px_rgba(0,0,0,0.85)]"
                        />
                      </>
                    )}
                  </div>

                  {/* Recuadro de Información: Nombre, Precio, Descripción y Talles */}
                  <div className="bg-[#1E3F1C] border border-[#4D8046] rounded-xl p-4 mb-4 shadow-inner space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                      <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                        {p.name}
                      </h3>
                      <span className="font-bold text-sm text-[#F0E9D5] whitespace-nowrap bg-[#274D24] px-2.5 py-1 rounded-lg border border-[#5A8E51] font-mono tabular-nums self-start sm:self-auto">
                        {fmt(p.price)}
                      </span>
                    </div>

                    <p className="text-xs text-[#E3F2DF] leading-relaxed line-clamp-3 font-medium pt-1 border-t border-[#345B31]">
                      {p.desc}
                    </p>

                    {/* Size wheel selector ("Ruedita de talle") */}
                    <div className="pt-2 border-t border-[#345B31] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-[#A8C7A2]">Talle:</span>
                      <SizeWheel
                        value={parseInt(selectedSizes[p.id] || '40', 10) || 40}
                        onInteract={triggerLogoReaction}
                        onChange={(nextNum) =>
                          setSelectedSizes((prev) => ({ ...prev, [p.id]: String(nextNum) }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Opción de Compras */}
                <div className="pt-3 border-t border-[#3E6C3A] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      const chosenSize = selectedSizes[p.id] || '40';
                      setCartItems((prev) => {
                        const existing = prev.find((item) => item.id === p.id && item.size === chosenSize);
                        if (existing) {
                          return prev.map((item) =>
                            item.id === p.id && item.size === chosenSize
                              ? { ...item, qty: item.qty + 1 }
                              : item
                          );
                        }
                        return [
                          ...prev,
                          {
                            id: p.id,
                            name: p.name,
                            size: chosenSize,
                            price: p.price,
                            qty: 1,
                          },
                        ];
                      });
                      setOrderComplete(false);
                      setCartOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#D3C9AC] hover:bg-white text-[#0E140D] font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer shadow-md"
                  >
                    <svg className="w-4 h-4 text-[#0E140D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <span>Comprar · Talle {selectedSizes[p.id] || '40'}</span>
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-[#A8C7A2] font-mono">
                    <span>✓ Garantía oficial 000GREEN</span>
                    <span>·</span>
                    <span>Envío seguro</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-16 px-4 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Brand Info Card */}
          <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-6 shadow-md max-w-sm space-y-4">
            <button
              type="button"
              onClick={triggerLogoReaction}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <span
                className={`w-10 h-10 rounded-full border-2 border-[#D3C9AC] overflow-hidden flex items-center justify-center bg-[#182C15] shadow-md flex-shrink-0 ${
                  logoBumping ? 'animate-logo-jump ring-2 ring-[#9BD08A]' : ''
                }`}
              >
                <img
                  src={BRAND_LOGO_SRC}
                  alt="000GREEN Logo"
                  className="w-full h-full object-contain"
                />
              </span>
              <span translate="no" className="notranslate font-mark font-bold text-2xl tracking-[0.16em] text-white">
                000GREEN
              </span>
            </button>
            <div className="bg-[#1E3F1C] border border-[#4D8046] rounded-xl p-3 shadow-inner">
              <p className="text-xs text-[#E3F2DF] leading-relaxed font-medium">
                Marca urbana independiente con identidad propia. Piezas exclusivas de edición limitada pensadas para destacar con comodidad, actitud y calidad en cada detalle.
              </p>
            </div>
          </div>

          {/* Navigation Links Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs flex-1">
            <div className="bg-[#183216] border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Navegación</div>
              <ul className="space-y-2 text-[#E3F2DF] font-medium">
                <li><a href="#catalogo" onClick={triggerLogoReaction} className="hover:text-white transition-colors block py-0.5">Catálogo Oficial</a></li>
                <li><button type="button" onClick={() => { triggerLogoReaction(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors block py-0.5 text-left cursor-pointer">Volver al inicio</button></li>
              </ul>
            </div>
            <div className="bg-[#183216] border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Soporte</div>
              <ul className="space-y-2 text-[#E3F2DF] font-medium">
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Envíos y Entregas</span></li>
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Guía de Talles y Fit</span></li>
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Cuidado de la prenda</span></li>
              </ul>
            </div>
            <div className="bg-[#183216] border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3 col-span-2 sm:col-span-1">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Contacto Oficial</div>
              <div className="text-[#E3F2DF] space-y-2 font-medium">
                <div>
                  <span className="text-[#A4C992] text-[10px] block font-mono uppercase tracking-wider">Ubicación</span>
                  <span>Asunción, Paraguay</span>
                </div>
                <div>
                  <span className="text-[#A4C992] text-[10px] block font-mono uppercase tracking-wider">Instagram Oficial</span>
                  <a
                    href="https://www.instagram.com/000green_/?hl=es-la"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#9BD08A] font-bold underline transition-colors"
                  >
                    @000green_
                  </a>
                </div>
                <div>
                  <span className="text-[#A4C992] text-[10px] block font-mono uppercase tracking-wider">Correo Electrónico</span>
                  <a
                    href="mailto:000green@gmail.com"
                    className="text-white hover:text-[#9BD08A] font-bold underline transition-colors block"
                  >
                    000green@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SOCIAL & INSTAGRAM DIRECT BAR */}
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div translate="no" className="notranslate text-[11px] font-mono text-[#D8EADB]">
            © 2026 000GREEN · Todos los derechos reservados.
          </div>

          <a
            href="https://www.instagram.com/000green_/?hl=es-la"
            target="_blank"
            rel="noopener noreferrer"
            onClick={triggerLogoReaction}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#833ab4]/30 via-[#fd1d1d]/30 to-[#fcb045]/30 hover:from-[#833ab4]/50 hover:via-[#fd1d1d]/50 hover:to-[#fcb045]/50 border border-[#D3C9AC]/50 hover:border-[#9BD08A] text-[#E3DCC3] hover:text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-[0_4px_18px_rgba(0,0,0,0.6)] group cursor-pointer"
            title="Ir directo al perfil oficial de Instagram @000green_"
          >
            <svg className="w-4 h-4 fill-current text-[#E88C84] group-hover:text-[#9BD08A] transition-colors" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="font-medium">Instagram: <strong className="text-white group-hover:text-[#9BD08A]">@000green_</strong></span>
            <span className="text-xs text-[#9BD08A] group-hover:translate-x-1 transition-transform">↗</span>
          </a>
        </div>
      </footer>

      {/* SLIDE-OVER CART DRAWER */}
      {cartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#151D13] border-l border-[#2A3626] h-full flex flex-col justify-between p-6 sm:p-8 text-[#E3DCC3] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#2A3626]">
                <h2 className="font-display font-bold text-2xl text-[#E3DCC3]">Tu carrito</h2>
                <button
                  type="button"
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#2A3626] flex items-center justify-center text-sm hover:border-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {orderComplete ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#274D24] border-2 border-[#9BD08A] text-[#9BD08A] flex items-center justify-center mx-auto text-2xl shadow-md">
                    ✓
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#E3DCC3]">
                    ¡Gracias por tu pedido!
                  </h3>
                  <p className="text-xs text-[#98A18A] leading-relaxed max-w-xs mx-auto">
                    Recibimos la confirmación de tu envío a <strong className="text-[#E3DCC3]">000green@gmail.com</strong> por <span className="font-mono text-[#D3C9AC] font-bold">{fmt(total)}</span>. Te respondemos a la brevedad.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      setOrderComplete(false);
                      setEmailOpened(false);
                      setCartItems([]);
                      setCartOpen(false);
                    }}
                    className="bg-[#D3C9AC] text-[#0E140D] font-bold px-6 py-2.5 rounded-full text-xs hover:bg-white transition-colors mt-3 cursor-pointer"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-4">
                  {cartItems.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#98A18A]">
                      El carrito está vacío.
                    </div>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div
                        key={`${item.id}-${item.size}-${idx}`}
                        className="py-3 border-b border-[#2A3626] flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate text-[#E3DCC3]">{item.name}</div>
                          <div className="text-xs text-[#98A18A] font-mono">
                            Talle {item.size} · {fmt(item.price)} c/u
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-[#2A3626] rounded-full px-2 py-0.5 text-xs font-mono">
                            <button
                              type="button"
                              onClick={() => {
                                triggerLogoReaction();
                                setCartItems((prev) =>
                                  prev
                                    .map((p, i) => (i === idx ? { ...p, qty: p.qty - 1 } : p))
                                    .filter((p) => p.qty > 0)
                                );
                              }}
                              className="px-1 text-[#98A18A] hover:text-white cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => {
                                triggerLogoReaction();
                                setCartItems((prev) =>
                                  prev.map((p, i) => (i === idx ? { ...p, qty: p.qty + 1 } : p))
                                );
                              }}
                              className="px-1 text-[#98A18A] hover:text-white cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              triggerLogoReaction();
                              setCartItems((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-[11px] text-[#E88C84] hover:underline cursor-pointer"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {!orderComplete && cartItems.length > 0 && (
              <div className="pt-6 border-t border-[#2A3626] space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-base text-[#E3DCC3] pt-2 border-t border-[#2A3626]">
                    <span>Total estimado</span>
                    <span className="font-mono text-[#D3C9AC] text-lg tabular-nums">{fmt(total)}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <a
                    href={getGmailOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleGmailLaunch}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#D3C9AC] hover:bg-white text-[#0E140D] font-bold py-3.5 px-4 rounded-full text-xs sm:text-sm transition-all shadow-lg cursor-pointer uppercase tracking-wider text-center"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <span>Finalizar compra por Gmail</span>
                  </a>

                  <a
                    href={getMailtoOrderUrl()}
                    onClick={handleGmailLaunch}
                    className="w-full inline-flex items-center justify-center gap-2 border border-[#4D8046] hover:border-[#9BD08A] bg-[#182C15] hover:bg-[#20391C] text-[#DDECD7] font-semibold py-2.5 px-4 rounded-full text-[11px] transition-all cursor-pointer text-center"
                  >
                    <span>Abrir app de correo del celular / PC</span>
                  </a>

                  {emailOpened && (
                    <div className="bg-[#1B2C18] border border-[#4D8046] rounded-xl p-3 text-center space-y-2">
                      <p className="text-[11px] text-[#CDE0C5] leading-relaxed">
                        Se abrió el redactor hacia <strong className="text-white">000green@gmail.com</strong>. Cuando hayas tocado <strong>Enviar</strong>, confirmá abajo:
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          triggerLogoReaction();
                          setOrderComplete(true);
                          setEmailOpened(false);
                        }}
                        className="w-full bg-[#9BD08A] hover:bg-[#B4E0A6] text-[#0E140D] font-bold py-2 px-3 rounded-full text-xs transition-colors cursor-pointer"
                      >
                        Ya envié el correo · Confirmar y vaciar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SLIDE-OVER FAVORITES DRAWER */}
      {favoritesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-all"
          onClick={() => setFavoritesOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#151D13] border-l border-[#2A3626] h-full flex flex-col justify-between p-6 sm:p-8 text-[#E3DCC3] shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#2A3626]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#E88C84] fill-current" viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.6-9.5-9.2C1.1 8.5 3 5 6.4 5c2 0 3.4 1.1 4.1 2.4h3C14.2 6.1 15.6 5 17.6 5 21 5 22.9 8.5 21.5 11.8 19.5 16.4 12 21 12 21z" />
                  </svg>
                  <h2 className="font-display font-bold text-2xl text-[#E3DCC3]">
                    Tus Favoritos ({favorites.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setFavoritesOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#2A3626] flex items-center justify-center text-sm hover:border-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#274D24] text-[#E88C84] flex items-center justify-center mx-auto text-2xl border border-[#5E9455]">
                    ♡
                  </div>
                  <h3 className="font-display font-bold text-xl text-[#E3DCC3]">
                    No tienes favoritos guardados
                  </h3>
                  <p className="text-xs text-[#98A18A] max-w-xs mx-auto leading-relaxed">
                    Toca el corazón en cualquier pantalón del catálogo para guardarlo aquí y comprarlo fácilmente cuando quieras.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      setFavoritesOpen(false);
                      const el = document.getElementById('catalogo');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-[#D3C9AC] text-[#0E140D] font-bold px-6 py-2.5 rounded-full text-xs hover:bg-white transition-colors mt-2 cursor-pointer shadow-md"
                  >
                    Explorar catálogo
                  </button>
                </div>
              ) : (
                <div className="py-4 space-y-3">
                  {EXACT_PRODUCTS.filter((p) => favorites.includes(p.id)).map((p) => (
                    <div
                      key={p.id}
                      className="py-3 px-3.5 bg-[#1C271A] rounded-xl border border-[#374C32] flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div
                        className="w-14 h-14 border border-[#4D8046] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 p-0.5"
                        style={{
                          background:
                            'radial-gradient(circle at 50% 45%, rgba(211, 201, 172, 0.28) 0%, rgba(16, 36, 15, 0.95) 75%)',
                        }}
                      >
                        <img src={p.image} alt={p.name} referrerPolicy="no-referrer" className="w-full h-full object-contain drop-shadow-[0_3px_5px_rgba(0,0,0,0.65)]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{p.name}</div>
                        <div className="text-xs text-[#D3C9AC] font-mono mt-0.5">
                          Talle {selectedSizes[p.id] || '40'} · {fmt(p.price)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 items-end">
                        <button
                          type="button"
                          onClick={() => {
                            triggerLogoReaction();
                            const chosenSize = selectedSizes[p.id] || '40';
                            setCartItems((prev) => {
                              const existing = prev.find((item) => item.id === p.id && item.size === chosenSize);
                              if (existing) {
                                return prev.map((item) =>
                                  item.id === p.id && item.size === chosenSize
                                    ? { ...item, qty: item.qty + 1 }
                                    : item
                                );
                              }
                              return [...prev, { id: p.id, name: p.name, size: chosenSize, price: p.price, qty: 1 }];
                            });
                            setOrderComplete(false);
                            setFavoritesOpen(false);
                            setCartOpen(true);
                          }}
                          className="bg-[#3D6E35] hover:bg-[#D3C9AC] hover:text-[#0E140D] text-white text-[11px] font-bold px-3 py-1 rounded-full transition-colors cursor-pointer border border-[#52864A]"
                        >
                          + Carrito
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(p.id)}
                          className="text-[10px] text-[#E88C84] hover:underline cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {favorites.length > 0 && (
              <div className="pt-6 border-t border-[#2A3626] space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerLogoReaction();
                    const favProducts = EXACT_PRODUCTS.filter((p) => favorites.includes(p.id));
                    setCartItems((prev) => {
                      let next = [...prev];
                      favProducts.forEach((p) => {
                        const chosenSize = selectedSizes[p.id] || '40';
                        const existing = next.find((item) => item.id === p.id && item.size === chosenSize);
                        if (existing) {
                          next = next.map((item) =>
                            item.id === p.id && item.size === chosenSize
                              ? { ...item, qty: item.qty + 1 }
                              : item
                          );
                        } else {
                          next.push({ id: p.id, name: p.name, size: chosenSize, price: p.price, qty: 1 });
                        }
                      });
                      return next;
                    });
                    setOrderComplete(false);
                    setFavoritesOpen(false);
                    setCartOpen(true);
                  }}
                  className="w-full bg-[#D3C9AC] text-[#0E140D] hover:bg-white font-bold py-3 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Agregar todos al carrito
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

