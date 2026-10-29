/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

// 000GREEN Official Products
export interface ProductItem {
  id: string;
  kind: string;
  name: string;
  price: number;
  tag?: string;
  desc: string;
  image: string;
  colors: [string, string][]; // [ColorName, HexCode]
}

export const BRAND_LOGO_SRC = '/assets/aistudio/862063659_1697145255304697_6128105736949461467_n_f3ff5d9d.jpg';

export const EXACT_PRODUCTS: ProductItem[] = [
  {
    id: 'w1',
    kind: 'Reloj Digital Cyber',
    name: '000 Chrono Blade / Orange Pulse',
    price: 275000,
    tag: 'Edición Especial',
    image: '/assets/aistudio/reloj_1_naranja_5a75334e.png',
    desc: 'Caja asimétrica ergonómica en titanio cepillado, pantalla LED matricial de alto contraste y acentos en naranja vibrante.',
    colors: [
      ['Naranja Neón', '#FF6B00'],
      ['Gris Titanio', '#8B939C'],
    ],
  },
  {
    id: 'w2',
    kind: 'Reloj Digital Cyber',
    name: '000 Stealth Titanium / Matte Grey',
    price: 275000,
    tag: 'Más Vendido',
    image: '/assets/aistudio/reloj_2_gris_b61eba16.png',
    desc: 'Estructura monolítica en acabado gris titanio mate, pantalla invertida táctica y brazalete segmentado ergonómico.',
    colors: [
      ['Titanio Mate', '#7A808C'],
      ['Grafito Oscuro', '#3F444E'],
    ],
  },
  {
    id: 'w3',
    kind: 'Reloj Digital Cyber',
    name: '000 Cyber Chrome / Mirror Steel',
    price: 275000,
    tag: 'Edición Premium',
    image: '/assets/aistudio/reloj_3_cromado_6fc08572.png',
    desc: 'Acabado espejo cromado de alto impacto en acero líquido aeroespacial, bisel curvado fluido y display digital retroiluminado.',
    colors: [
      ['Cromado Espejo', '#E2E6EC'],
      ['Acero Pulido', '#B8BFC9'],
    ],
  },
  {
    id: 'w4',
    kind: 'Reloj Digital Cyber',
    name: '000 Bio Green / Obsidian Matrix',
    price: 275000,
    tag: 'Edición Especial',
    image: '/assets/aistudio/reloj_4_negro_verde_6c42b715.png',
    desc: 'Edición en negro obsidiana con inserciones de alto contraste en verde neón eléctrico y caja ultraliviana.',
    colors: [
      ['Verde 000GREEN', '#76FF03'],
      ['Negro Obsidiana', '#121417'],
    ],
  },
  {
    id: 'w5',
    kind: 'Reloj Digital Cyber',
    name: '000 Crimson Core / Dark Red',
    price: 275000,
    tag: 'Nuevo Ingreso',
    image: '/assets/aistudio/reloj_5_negro_rojo_3e1329aa.png',
    desc: 'Cuerpo aerodinámico en polímero reforzado y acero con ranuras en rojo carmesí brillante y pantalla LCD ultra nítida.',
    colors: [
      ['Rojo Carmesí', '#E50914'],
      ['Negro Carbón', '#15171A'],
    ],
  },
  {
    id: 'w6',
    kind: 'Reloj Digital Cyber',
    name: '000 Shadow Blade / Total Black',
    price: 275000,
    tag: 'Edición Limitada',
    image: '/assets/aistudio/reloj_6_negro_total_6b621875.png',
    desc: 'Estructura asimétrica monocromática en negro total mate con pantalla digital LED segmentada blanca de alta visibilidad y correa ergonómica integrada.',
    colors: [
      ['Negro Total', '#0B0C0E'],
      ['Grafito Táctico', '#2B2F38'],
    ],
  },
];

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
  const [maxPrice, setMaxPrice] = useState<number>(600000);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesOpen, setFavoritesOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number; qty: number }[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);

  // Background Cyber Audio Soundtrack State (YouTube URL: NFa7KlLyzGY starting at 503s with fallback)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);
  const [usingYouTube, setUsingYouTube] = useState<boolean>(true);
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

  // Initialize YouTube IFrame Player
  useEffect(() => {
    let isMounted = true;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;

      try {
        ytPlayerRef.current = new (window as any).YT.Player('yt-music-iframe-holder', {
          height: '200',
          width: '200',
          videoId: 'NFa7KlLyzGY',
          playerVars: {
            autoplay: 0,
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
              event.target.setVolume(Math.round(musicVolume * 100));
              event.target.seekTo(503, true);

              // If user already clicked to start, trigger play immediately
              if (hasUserTriggeredMusic.current) {
                event.target.playVideo();
                setIsMusicPlaying(true);
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsMusicPlaying(true);
              } else if (event.data === 2) {
                setIsMusicPlaying(false);
              } else if (event.data === 0) {
                // Loop back to 503s
                event.target.seekTo(503, true);
                event.target.playVideo();
              }
            },
            onError: () => {
              if (!isMounted) return;
              // On error, fallback smoothly to HTML5 audio
              setUsingYouTube(false);
            },
          },
        });
      } catch {
        setUsingYouTube(false);
      }
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

    return () => {
      isMounted = false;
      try {
        if (ytPlayerRef.current?.destroy) {
          ytPlayerRef.current.destroy();
        }
      } catch {}
    };
  }, []);

  const toggleMusic = () => {
    triggerLogoReaction();
    hasUserTriggeredMusic.current = true;

    if (usingYouTube && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        if (isMusicPlaying) {
          ytPlayerRef.current.pauseVideo();
          setIsMusicPlaying(false);
        } else {
          ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
          ytPlayerRef.current.playVideo();
          setIsMusicPlaying(true);
        }
        return;
      } catch {
        // Fallback to audioRef if YT throws
      }
    }

    // HTML5 Audio fallback
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.volume = musicVolume;
      audioRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => {});
    }
  };

  const handleVolumeChange = (vol: number) => {
    setMusicVolume(vol);

    if (usingYouTube && ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.setVolume(Math.round(vol * 100));
        if (vol === 0) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
        }
      } catch {}
    }

    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Attempt gentle autoplay on user's first tap/click anywhere on the page
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasUserTriggeredMusic.current) {
        hasUserTriggeredMusic.current = true;

        if (usingYouTube && ytPlayerRef.current && isYtReadyRef.current) {
          try {
            ytPlayerRef.current.seekTo(503, true);
            ytPlayerRef.current.setVolume(Math.round(musicVolume * 100));
            ytPlayerRef.current.playVideo();
            setIsMusicPlaying(true);
            return;
          } catch {}
        }

        if (audioRef.current) {
          audioRef.current.volume = musicVolume;
          audioRef.current
            .play()
            .then(() => {
              setIsMusicPlaying(true);
            })
            .catch(() => {});
        }
      }
    };

    window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, [musicVolume, usingYouTube]);

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
      const matched = EXACT_PRODUCTS.find((p) => {
        const pName = normalize(p.name);
        const pDesc = normalize(p.desc);
        const pKind = normalize(p.kind);
        const pTag = normalize(p.tag || '');
        const pColors = p.colors.map((c) => normalize(c[0])).join(' ');
        return (
          pName.includes(q) ||
          pDesc.includes(q) ||
          pKind.includes(q) ||
          pTag.includes(q) ||
          pColors.includes(q)
        );
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
    // Real-time live search across name, description, category, colors, and prices
    if (searchQuery.trim()) {
      const q = normalize(searchQuery.trim());
      const pName = normalize(p.name);
      const pDesc = normalize(p.desc);
      const pKind = normalize(p.kind);
      const pTag = normalize(p.tag || '');
      const pColors = p.colors.map((c) => normalize(c[0])).join(' ');
      const pPrice = String(p.price);

      const matches =
        pName.includes(q) ||
        pDesc.includes(q) ||
        pKind.includes(q) ||
        pTag.includes(q) ||
        pColors.includes(q) ||
        pPrice.includes(q);

      if (!matches) return false;
      if (p.price > maxPrice) return false;
      return true;
    }

    // Filter by favorites if activeFilter is 'favoritos'
    if (activeFilter === 'favoritos') {
      if (!favorites.includes(p.id)) return false;
    } else if (activeFilter !== 'todo' && p.id !== activeFilter && p.name !== activeFilter) {
      return false;
    }

    if (p.price > maxPrice) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'asc') return a.price - b.price;
    if (sortBy === 'desc') return b.price - a.price;
    if (sortBy === 'az') return a.name.localeCompare(b.name);
    return 0; // 'rel' default order
  });

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const getWhatsAppOrderUrl = () => {
    if (cartItems.length === 0) {
      return `https://wa.me/595976287422?text=${encodeURIComponent(
        'Hola 000GREEN! Me gustaría consultar sobre su catálogo de relojes.'
      )}`;
    }

    if (cartItems.length === 1) {
      const item = cartItems[0];
      const qtyStr = item.qty > 1 ? ` (${item.qty} unidades)` : '';
      const msg = `Hola 000GREEN! Quiero comprar este reloj:

• ${item.name}${qtyStr} - ${fmt(item.price * item.qty)}

Total: ${fmt(total)}

¿Cómo coordinamos el pago y la entrega?`;
      return `https://wa.me/595976287422?text=${encodeURIComponent(msg)}`;
    }

    const itemsList = cartItems
      .map((item) => `• ${item.name} (${item.qty} un.) - ${fmt(item.price * item.qty)}`)
      .join('\n');

    const msg = `Hola 000GREEN! Quiero comprar estos relojes:

${itemsList}

Total: ${fmt(total)}

¿Cómo coordinamos el pago y la entrega?`;

    return `https://wa.me/595976287422?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-black text-[#E3DCC3] font-body selection:bg-[#7E9A64] selection:text-black relative overflow-x-hidden">
      {/* SPARKLE PARTICLES CONTAINER */}
      <div id="fx" aria-hidden="true" />

      {/* YOUTUBE AUDIO BACKGROUND ENGINE (NFa7KlLyzGY @ 503s) */}
      <div
        className="fixed -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        <div id="yt-music-iframe-holder" />
      </div>

      {/* BACKGROUND SOUNDTRACK FALLBACK (HTML5 AUDIO) */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
      >
        <source src="/assets/aistudio/cyber_music.mp3" type="audio/mpeg" />
        <source src="/assets/aistudio/cyber_music.ogg" type="audio/ogg" />
      </audio>

      {/* BACKGROUND MASCOT (PERFECTLY CENTERED, NO BOX, NO SHADOWS, ENLARGED & CLOSE-UP) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none flex items-center justify-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          src="/assets/aistudio/video_clean.mp4"
          className="h-[84vh] sm:h-[90vh] md:h-[95vh] max-h-[960px] w-auto max-w-none object-contain object-center select-none pointer-events-none"
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
                  className="w-full h-full object-cover scale-105"
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
              placeholder="Buscar por nombre, color, titanio, negro, naranja..."
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
              title={isMusicPlaying ? 'Pausar música (YouTube 503s)' : 'Reproducir música (YouTube 503s)'}
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
          <span>Relojes Digitales Cyber</span>
          <span>·</span>
          <span>Edición Especial Limitada</span>
          <span>·</span>
          <span>Caja en Titanio & Acero Cromado</span>
          <span>·</span>
          <span>Pantalla LED Matricial de Alta Definición</span>
          <span>·</span>
          <span>Diseño Ergonómico Asimétrico</span>
          <span>·</span>
          <span>Máxima Precisión Digital</span>
          <span>·</span>
          <span>100% Garantía Oficial 000GREEN</span>
          <span>·</span>
          <span>Envíos Seguros a Todo el País</span>
          <span>·</span>
          <span>000GREEN</span>
          <span>·</span>
          <span>Relojes Digitales Cyber</span>
          <span>·</span>
          <span>Edición Especial Limitada</span>
          <span>·</span>
          <span>Caja en Titanio & Acero Cromado</span>
          <span>·</span>
          <span>Pantalla LED Matricial de Alta Definición</span>
          <span>·</span>
          <span>Diseño Ergonómico Asimétrico</span>
          <span>·</span>
          <span>Máxima Precisión Digital</span>
          <span>·</span>
          <span>100% Garantía Oficial 000GREEN</span>
          <span>·</span>
          <span>Envíos Seguros a Todo el País</span>
        </div>
      </div>

      {/* CATALOG PREVIEW SECTION */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
        {/* Catalog Header Recuadro de Fondo */}
        <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-6 sm:p-8 mb-8 shadow-[0_12px_35px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-4 sm:p-5 mb-10 shadow-[0_12px_35px_rgba(0,0,0,0.5)] backdrop-blur-md">
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
              Todos los relojes
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

          {/* Sort & Max Price Controls */}
          <div className="flex items-center gap-4 text-xs text-white">
            <label className="flex items-center gap-2">
              <span className="font-medium text-[#DDECD7]">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  triggerLogoReaction();
                  setSortBy(e.target.value);
                }}
                className="bg-[#274D24] border border-[#5E9455] rounded-lg px-2.5 py-1 text-white font-medium focus:outline-none focus:border-[#9BD08A] cursor-pointer"
              >
                <option value="rel">Destacados</option>
                <option value="asc">Precio: menor a mayor</option>
                <option value="desc">Precio: mayor a menor</option>
                <option value="az">Nombre A–Z</option>
              </select>
            </label>

            <label className="hidden sm:flex items-center gap-2">
              <span className="font-medium text-[#DDECD7]">Hasta {fmt(maxPrice)}:</span>
              <input
                type="range"
                min="100000"
                max="600000"
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="accent-[#9BD08A] w-24 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Active Search Results Banner */}
        {searchQuery.trim() && (
          <div className="mb-6 bg-[#274D24] border-2 border-[#5E9455] rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-[#D3C9AC] font-bold">Búsqueda activa:</span>
              <span className="bg-[#183216] border border-[#44763C] px-2.5 py-0.5 rounded-md font-mono text-[#F0E9D5] font-bold">
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

        {/* Empty Search / Filter State */}
        {filteredProducts.length === 0 && (
          <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-10 text-center space-y-4 my-8 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-[#274D24] border border-[#5E9455] flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-xl font-bold text-white">
              {activeFilter === 'favoritos'
                ? 'No tienes productos en favoritos'
                : 'No se encontraron relojes'}
            </h3>
            <p className="text-xs text-[#E3F2DF] max-w-md mx-auto leading-relaxed">
              {activeFilter === 'favoritos'
                ? 'Toca el corazón en cualquier reloj para agregarlo a tus favoritos.'
                : `No encontramos resultados para "${searchQuery}". Intentá buscando por palabras como "Orange", "Titanium", "Chrome", "Green", "Crimson", "Black" o explorá todo el catálogo.`}
            </p>
            <button
              type="button"
              onClick={() => {
                triggerLogoReaction();
                setSearchQuery('');
                setActiveFilter('todo');
              }}
              className="bg-[#D3C9AC] text-[#0E140D] font-bold px-6 py-2.5 rounded-full text-xs hover:bg-white transition-colors cursor-pointer shadow-md"
            >
              Ver todos los relojes
            </button>
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
                className={`bg-[#183216]/95 border-2 ${
                  isMatch
                    ? 'border-[#9BD08A] ring-2 ring-[#9BD08A] shadow-[0_0_35px_rgba(155,208,138,0.45)]'
                    : 'border-[#548A4C]'
                } rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_35px_rgba(0,0,0,0.5)] backdrop-blur-md scroll-mt-28 transition-all duration-300`}
              >
                <div>
                  {/* Top Header of the Watch Box: Tag & Favorite */}
                  <div className="flex justify-between items-center mb-3.5">
                    <span className="bg-[#274D24] text-[#D3C9AC] border border-[#5E9455] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      {p.tag || p.kind}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(p.id)}
                      className="w-8 h-8 rounded-full border border-[#5E9455] bg-[#274D24] flex items-center justify-center hover:border-white transition-colors cursor-pointer"
                      title="Agregar a favoritos"
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

                  {/* Official Watch Photo Tile (Fixed background color, no hover color shift) */}
                  <div
                    onClick={() => triggerLogoReaction()}
                    className="aspect-[4/5] rounded-xl bg-[#B8DDB4] border border-[#52864A] mb-4 flex items-center justify-center p-4 relative overflow-hidden shadow-inner cursor-pointer"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                    />
                  </div>

                  {/* Recuadro de Información: Nombre, Precio y Pequeña Descripción */}
                  <div className="bg-[#1E3F1C] border border-[#4D8046] rounded-xl p-4 mb-4 shadow-inner space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5">
                      <h3 className="font-bold text-base sm:text-lg text-white leading-snug">
                        {p.name}
                      </h3>
                      <span className="font-bold text-sm text-[#F0E9D5] whitespace-nowrap bg-[#274D24] px-2.5 py-1 rounded-lg border border-[#5A8E51] font-mono self-start sm:self-auto">
                        {fmt(p.price)}
                      </span>
                    </div>

                    <p className="text-xs text-[#E3F2DF] leading-relaxed line-clamp-3 font-medium pt-1 border-t border-[#345B31]">
                      {p.desc}
                    </p>
                  </div>
                </div>

                {/* Opción de Compras */}
                <div className="pt-3 border-t border-[#3E6C3A] space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerLogoReaction();
                      setCartItems((prev) => {
                        const existing = prev.find((item) => item.id === p.id);
                        if (existing) {
                          return prev.map((item) =>
                            item.id === p.id ? { ...item, qty: item.qty + 1 } : item
                          );
                        }
                        return [
                          ...prev,
                          {
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            qty: 1,
                          },
                        ];
                      });
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
                    <span>Comprar / Agregar al carrito</span>
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
                  className="w-full h-full object-cover scale-105"
                />
              </span>
              <span translate="no" className="notranslate font-mark font-bold text-2xl tracking-[0.16em] text-white">
                000GREEN
              </span>
            </button>
            <div className="bg-[#1E3F1C] border border-[#4D8046] rounded-xl p-3 shadow-inner">
              <p className="text-xs text-[#E3F2DF] leading-relaxed font-medium">
                Relojes digitales cyber de alta gama y piezas de diseño con carácter. Estructura ergonómica en titanio, acero cromado y pantallas LED matriciales.
              </p>
            </div>
            <a
              href="https://www.instagram.com/000green_/?hl=es-la"
              target="_blank"
              rel="noopener noreferrer"
              onClick={triggerLogoReaction}
              className="inline-flex items-center gap-2 text-xs text-[#E3F2DF] hover:text-white bg-[#274D24] hover:bg-[#346230] border border-[#5E9455] hover:border-[#9BD08A] px-3.5 py-2 rounded-xl transition-all shadow-sm group w-full justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2 font-semibold">
                <svg className="w-4 h-4 fill-current text-[#E88C84] group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>Instagram: @000green_</span>
              </span>
              <span className="text-[#9BD08A] text-xs">Visitar ↗</span>
            </a>
          </div>

          {/* Navigation Links Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs flex-1">
            <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Navegación</div>
              <ul className="space-y-2 text-[#E3F2DF] font-medium">
                <li><a href="#catalogo" onClick={triggerLogoReaction} className="hover:text-white transition-colors block py-0.5">Catálogo Oficial</a></li>
                <li><button type="button" onClick={() => { triggerLogoReaction(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors block py-0.5 text-left cursor-pointer">Volver al inicio</button></li>
              </ul>
            </div>
            <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Soporte</div>
              <ul className="space-y-2 text-[#E3F2DF] font-medium">
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Envíos y Entregas</span></li>
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Garantía de Precisión</span></li>
                <li><span onClick={triggerLogoReaction} className="hover:text-white cursor-pointer block py-0.5">Cuidado del reloj</span></li>
              </ul>
            </div>
            <div className="bg-[#183216]/95 border-2 border-[#548A4C] rounded-2xl p-5 shadow-md space-y-3 col-span-2 sm:col-span-1">
              <div className="font-bold uppercase tracking-wider text-[#D3C9AC] border-b border-[#4D8046] pb-1.5">Contacto</div>
              <p className="text-[#E3F2DF] leading-relaxed font-medium">
                Asunción, Paraguay.<br />
                WhatsApp:{' '}
                <a
                  href="https://wa.me/595976287422"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#9BD08A] font-bold underline transition-colors"
                >
                  595 976 287 422
                </a>
                <br />
                Instagram:{' '}
                <a
                  href="https://www.instagram.com/000green_/?hl=es-la"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#9BD08A] font-bold underline transition-colors"
                >
                  @000green_
                </a>
                <br />
                Gmail:{' '}
                <a
                  href="mailto:000greeeen@gmail.com"
                  className="text-white hover:text-[#9BD08A] font-bold underline transition-colors"
                >
                  000greeeen@gmail.com
                </a>
              </p>
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
                  <div className="w-16 h-16 rounded-full bg-[#9BD08A]/20 text-[#9BD08A] flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h3 className="font-display font-bold text-2xl text-[#E3DCC3]">
                    ¡Pedido registrado!
                  </h3>
                  <p className="text-xs text-[#98A18A] leading-relaxed">
                    Hemos preparado tu resumen de compra por {fmt(total)}. Nos comunicaremos contigo para coordinar la entrega.
                  </p>
                  <a
                    href={getWhatsAppOrderUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold px-5 py-2.5 rounded-full text-xs transition-colors mt-2 shadow-md cursor-pointer"
                  >
                    <span>Enviar pedido por WhatsApp</span>
                    <span>(+595 976 287 422)</span>
                  </a>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerLogoReaction();
                        setOrderComplete(false);
                        setCartItems([]);
                        setCartOpen(false);
                      }}
                      className="bg-[#D3C9AC] text-[#0E140D] font-bold px-6 py-2.5 rounded-full text-xs hover:bg-white transition-colors mt-4 cursor-pointer"
                    >
                      Seguir explorando
                    </button>
                  </div>
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
                        key={`${item.id}-${idx}`}
                        className="py-3 border-b border-[#2A3626] flex items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold truncate text-[#E3DCC3]">{item.name}</div>
                          <div className="text-xs text-[#98A18A]">{fmt(item.price)} c/u</div>
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
                    <span className="font-mono text-[#D3C9AC] text-lg">{fmt(total)}</span>
                  </div>
                </div>

                <a
                  href={getWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    triggerLogoReaction();
                  }}
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-bold py-3.5 px-4 rounded-full text-sm transition-all shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_25px_rgba(37,211,102,0.6)] cursor-pointer uppercase tracking-wider text-center group"
                >
                  <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.66 20.15 9.3 19.78 8.12 19.08L7.84 18.91L4.72 19.73L5.55 16.69L5.36 16.39C4.59 15.17 4.19 13.75 4.19 11.91C4.19 7.37 7.88 3.67 12.05 3.67ZM8.83 7.37C8.61 7.37 8.24 7.45 7.94 7.78C7.63 8.11 6.78 8.91 6.78 10.53C6.78 12.15 7.96 13.72 8.12 13.94C8.29 14.16 10.42 17.43 13.68 18.84C14.46 19.18 15.06 19.38 15.54 19.53C16.32 19.78 17.03 19.74 17.59 19.66C18.22 19.56 19.52 18.87 19.79 18.11C20.06 17.35 20.06 16.7 19.98 16.56C19.9 16.42 19.71 16.34 19.42 16.2C19.13 16.05 17.7 15.35 17.44 15.26C17.18 15.16 17 15.12 16.81 15.41C16.63 15.7 16.11 16.34 15.95 16.53C15.79 16.71 15.63 16.73 15.34 16.59C15.05 16.44 14.11 16.13 13 15.14C12.13 14.37 11.55 13.41 11.38 13.12C11.22 12.83 11.36 12.67 11.51 12.53C11.64 12.4 11.8 12.18 11.95 12.01C12.1 11.84 12.15 11.72 12.25 11.52C12.35 11.32 12.3 11.15 12.23 11.01C12.15 10.87 11.59 9.5 11.36 8.94C11.13 8.39 10.9 8.47 10.73 8.46C10.57 8.46 10.38 8.45 10.2 8.45C10.02 8.45 9.72 8.52 9.47 8.79C9.22 9.06 8.52 11.08 8.52 12.44 9.51 13.75 9.65 13.94" />
                  </svg>
                  <span>Finalizar pedido</span>
                </a>
                <p className="text-[11px] text-center text-[#9BD08A] font-medium">
                  💬 Te redirige a WhatsApp con tu mensaje listo para enviar
                </p>
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
                    Toca el corazón en cualquier reloj del catálogo para guardarlo aquí y comprarlo fácilmente cuando quieras.
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
                      <div className="w-14 h-14 bg-[#B8DDB4] rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{p.name}</div>
                        <div className="text-xs text-[#D3C9AC] font-mono mt-0.5">{fmt(p.price)}</div>
                      </div>

                      <div className="flex flex-col gap-1.5 items-end">
                        <button
                          type="button"
                          onClick={() => {
                            triggerLogoReaction();
                            setCartItems((prev) => {
                              const existing = prev.find((item) => item.id === p.id);
                              if (existing) {
                                return prev.map((item) =>
                                  item.id === p.id ? { ...item, qty: item.qty + 1 } : item
                                );
                              }
                              return [...prev, { id: p.id, name: p.name, price: p.price, qty: 1 }];
                            });
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
                        const existing = next.find((item) => item.id === p.id);
                        if (existing) {
                          next = next.map((item) =>
                            item.id === p.id ? { ...item, qty: item.qty + 1 } : item
                          );
                        } else {
                          next.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
                        }
                      });
                      return next;
                    });
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

