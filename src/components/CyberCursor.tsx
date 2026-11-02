import React, { useEffect, useRef, useState } from 'react';

export const CyberCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // Exact coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only activate for real mouse/trackpad pointers, never on touchscreen devices
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) setIsVisible(true);

      // Instant 0ms update for the precision central green dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over any clickable or interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive]'
        );
        setIsHovering(!!interactive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    // Ultra-fluid 120fps spring lerp for the trailing magnetic ring
    const render = () => {
      const ease = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ease;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ease;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  return (
    <>
      {/* 1. Trailing Magnetic Green Aura / Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height,opacity,background-color,border-color,box-shadow,transform] duration-200 ease-out flex items-center justify-center ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${isClicking ? 'scale-75' : 'scale-100'}`}
        style={{
          width: isHovering ? '48px' : '32px',
          height: isHovering ? '48px' : '32px',
        }}
      >
        <div
          className={`w-full h-full rounded-full transition-all duration-200 ${
            isHovering
              ? 'border-2 border-[#4ADE80] bg-[#22C55E]/18 shadow-[0_0_18px_rgba(74,222,128,0.45)] backdrop-blur-[1px]'
              : 'border border-[#22C55E]/60 bg-[#22C55E]/5 shadow-[0_0_8px_rgba(34,197,94,0.2)]'
          }`}
        />
      </div>

      {/* 2. Razor-Sharp Precision Green Dot Core */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className={`rounded-full transition-all duration-200 ${
            isHovering
              ? 'w-1.5 h-1.5 bg-[#86EFAC] shadow-[0_0_10px_#4ADE80] scale-75'
              : isClicking
              ? 'w-3 h-3 bg-white shadow-[0_0_12px_#22C55E]'
              : 'w-2 h-2 bg-[#22C55E] shadow-[0_0_8px_#22C55E]'
          }`}
        />
      </div>
    </>
  );
};

export default CyberCursor;
