import React, { useEffect, useRef, useState } from 'react';

export const CyberCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Direct DOM refs for 120fps GPU performance
  const pointerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  // Mouse & follower coordinates
  const mousePos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Only run on devices with a mouse/trackpad, not touchscreens
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (!isVisible) setIsVisible(true);

      // Instantly position the green arrow tip at the exact cursor point
      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          'a, button, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive]'
        );
        setIsHovering(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Smooth inertia follower for the subtle green ring
    const renderLoop = () => {
      const lerp = 0.22;
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * lerp;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * lerp;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0)`;
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

  return (
    <>
      {/* 1. Subtle, Clean Green Trailing Aura (Gently follows the pointer) */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 transition-[width,height,opacity,background-color,border-color] duration-200 ease-out rounded-full flex items-center justify-center ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: isHovering ? '38px' : '26px',
          height: isHovering ? '38px' : '26px',
        }}
      >
        <div
          className={`w-full h-full rounded-full border transition-all duration-200 ${
            isHovering
              ? 'border-[#22C55E] bg-[#22C55E]/15 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
              : isClicking
              ? 'border-[#4ADE80] bg-[#22C55E]/25 scale-75'
              : 'border-[#22C55E]/50 bg-transparent'
          }`}
        />
      </div>

      {/* 2. Sleek Green Precision Arrow Pointer (Exact position, normal feel) */}
      <div
        ref={pointerRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          // Offset so the sharp tip of the arrow is exactly at (0, 0) of the mouse
          marginTop: '-1px',
          marginLeft: '-1px',
        }}
      >
        <div
          className={`transition-transform duration-100 origin-top-left ${
            isClicking ? 'scale-90 translate-y-0.5' : isHovering ? 'scale-105' : 'scale-100'
          }`}
        >
          {isHovering ? (
            /* Sleek Green Link Pointer Hand when hovering */
            <svg
              width="22"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.65)]"
            >
              {/* Dark Outline */}
              <path
                d="M10 2C9.45 2 9 2.45 9 3V11.5H8.2C7.5 11.5 6.9 12.1 6.9 12.8C6.9 13.2 7.1 13.5 7.4 13.8L10.6 17C11.5 17.9 12.7 18.5 14 18.5H16.5C18.4 18.5 20 16.9 20 15V10C20 9.45 19.55 9 19 9C18.45 9 18 9.45 18 10V11H17V7C17 6.45 16.55 6 16 6C15.45 6 15 6.45 15 7V11H14V4C14 3.45 13.55 3 13 3C12.45 3 12 3.45 12 4V11H11V3C11 2.45 10.55 2 10 2Z"
                fill="#0A180C"
                stroke="#0A180C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Green Body */}
              <path
                d="M10 2C9.45 2 9 2.45 9 3V11.5H8.2C7.5 11.5 6.9 12.1 6.9 12.8C6.9 13.2 7.1 13.5 7.4 13.8L10.6 17C11.5 17.9 12.7 18.5 14 18.5H16.5C18.4 18.5 20 16.9 20 15V10C20 9.45 19.55 9 19 9C18.45 9 18 9.45 18 10V11H17V7C17 6.45 16.55 6 16 6C15.45 6 15 6.45 15 7V11H14V4C14 3.45 13.55 3 13 3C12.45 3 12 3.45 12 4V11H11V3C11 2.45 10.55 2 10 2Z"
                fill="#22C55E"
              />
              {/* Subtle Highlight */}
              <path
                d="M10 3V10M12 4V10M14 6V10M16 8V10"
                stroke="#86EFAC"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            /* Sleek Green Precision Arrow Pointer */
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]"
            >
              {/* Dark Outline for high contrast */}
              <path
                d="M3 2L18 10.5L11 13.2L7.5 20L3 2Z"
                fill="#0A180C"
                stroke="#0A180C"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Vibrant Emerald Green Body */}
              <path
                d="M3 2L18 10.5L11 13.2L7.5 20L3 2Z"
                fill="#22C55E"
                stroke="#15803D"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
              {/* Inner Light Bevel Highlight */}
              <path
                d="M4.5 4.5L14.5 10.2L10.2 12L7.8 16.5L4.5 4.5Z"
                fill="#4ADE80"
                opacity="0.45"
              />
            </svg>
          )}
        </div>
      </div>
    </>
  );
};
export default CyberCursor;
