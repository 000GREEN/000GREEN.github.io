import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  vx: number;
  vy: number;
}

export const CyberCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  // Refs for direct DOM manipulation to achieve buttery smooth 120fps
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);
  const lastParticleTime = useRef(0);
  const particleIdCounter = useRef(0);

  useEffect(() => {
    // Only enable custom cursor on devices with fine pointer (mouse/trackpad), not touch screens
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) setIsVisible(true);

      // Direct position for the instantaneous central core
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Position for ambient spotlight
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over an interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive]'
        );
        setIsHovering(!!interactive);
      }

      // Emit subtle emerald particle trail when moving
      const now = performance.now();
      if (now - lastParticleTime.current > 45) {
        lastParticleTime.current = now;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.8 + 0.2;
        const newParticle: Particle = {
          id: particleIdCounter.current++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 5 + 3,
          opacity: 0.9,
          rotation: Math.random() * 360,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 0.3,
        };

        setParticles((prev) => [...prev.slice(-12), newParticle]);
      }
    };

    const handleMouseDown = () => {
      setIsClicking(true);

      // Trigger click ripple effect
      if (rippleRef.current) {
        rippleRef.current.classList.remove('animate-cursor-ripple');
        void rippleRef.current.offsetWidth; // Force reflow
        rippleRef.current.classList.add('animate-cursor-ripple');
      }
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Physics Lerp Loop for the trailing outer cyber-reticle
    const renderLoop = () => {
      const lerp = 0.22; // Smooth responsiveness
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    document.documentElement.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Particle update lifecycle
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            opacity: p.opacity - 0.05,
            rotation: p.rotation + 4,
          }))
          .filter((p) => p.opacity > 0.05)
      );
    }, 28);

    return () => clearInterval(interval);
  }, [particles.length]);

  return (
    <>
      {/* 1. Ambient Green Cursor Spotlight (Subtle matrix atmospheric lighting) */}
      <div
        ref={spotlightRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9990] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(118, 255, 3, 0.045) 0%, rgba(34, 197, 94, 0.015) 45%, transparent 70%)',
          opacity: isVisible ? 1 : 0,
        }}
      />

      {/* 2. Trailing Diamond Spark Particles (✦) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-[9995] overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              opacity: p.opacity,
              transform: `translate(-50%, -50%) rotate(${p.rotation}deg) scale(${p.size / 5})`,
              transition: 'opacity 0.05s linear',
            }}
          >
            {/* Cyber ✦ Diamond Sparkle */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="#76FF03"
              className="drop-shadow-[0_0_4px_rgba(118,255,3,0.8)]"
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
            </svg>
          </div>
        ))}
      </div>

      {/* 3. Trailing Outer Cyber Reticle Ring (Precision chronometer watch dial) */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,background-color,border-color,transform] duration-200 ease-out flex items-center justify-center ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '48px' : isClicking ? '26px' : '34px',
          height: isHovering ? '48px' : isClicking ? '26px' : '34px',
        }}
      >
        {/* The Outer Glowing Ring */}
        <div
          className={`relative w-full h-full rounded-full border transition-all duration-300 ${
            isHovering
              ? 'border-[#76FF03] bg-[#76FF03]/15 shadow-[0_0_16px_rgba(118,255,3,0.6)] rotate-45'
              : isClicking
              ? 'border-[#9BD08A] bg-[#9BD08A]/30 scale-90'
              : 'border-[#9BD08A]/75 border-dashed shadow-[0_0_10px_rgba(155,208,138,0.35)]'
          }`}
        >
          {/* 4 Precision Watch Index Notches (0°, 90°, 180°, 270°) */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-0.5 bg-[#76FF03] rounded-full shadow-[0_0_4px_#76FF03]" />
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-0.5 bg-[#76FF03] rounded-full shadow-[0_0_4px_#76FF03]" />
          <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-1.5 w-0.5 bg-[#76FF03] rounded-full shadow-[0_0_4px_#76FF03]" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-1.5 w-0.5 bg-[#76FF03] rounded-full shadow-[0_0_4px_#76FF03]" />

          {/* Cyber Targeting Corner Brackets when Hovering */}
          {isHovering && (
            <>
              <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-[#76FF03]" />
              <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-[#76FF03]" />
              <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-[#76FF03]" />
              <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-[#76FF03]" />
            </>
          )}
        </div>

        {/* Click Sonic Ripple Wave */}
        <div
          ref={rippleRef}
          className="absolute inset-0 rounded-full border-2 border-[#76FF03] opacity-0 pointer-events-none"
        />
      </div>

      {/* 4. Instantaneous Central Laser Core Dot (High-precision tracking) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHovering
              ? 'w-2 h-2 bg-[#76FF03] ring-4 ring-[#76FF03]/40 shadow-[0_0_12px_#76FF03]'
              : isClicking
              ? 'w-3 h-3 bg-white ring-2 ring-[#76FF03] shadow-[0_0_16px_#76FF03]'
              : 'w-1.5 h-1.5 bg-[#76FF03] shadow-[0_0_8px_#76FF03]'
          }`}
        />
      </div>
    </>
  );
};
export default CyberCursor;
