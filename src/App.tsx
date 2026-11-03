import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ChamberAwareness } from './components/ChamberAwareness';
import { ChamberInterest } from './components/ChamberInterest';
import { ChamberConsideration } from './components/ChamberConsideration';
import { ChamberHire } from './components/ChamberHire';
import { FunnelCanvas3D } from './components/FunnelCanvas3D';
import { FunnelCanvas2D } from './components/FunnelCanvas2D';
import { FunnelProgressHUD } from './components/FunnelProgressHUD';
import { Footer } from './components/Footer';
import { ChamberId } from './types/funnel';
import { AdminPage } from './pages/AdminPage';
import { ResultsPage } from './pages/ResultsPage';
import {
  initVisitor,
  trackScrollProgress,
  HERO_VARIANTS,
  ABVariant,
} from './utils/analytics';

// 7 Deterministic Funnel Navigation Stops:
// Scrolling through the portfolio steps through these stops,
// guaranteeing that Mistake Museum rooms change on scroll without skipping the section.
const FUNNEL_STOPS = [
  { id: 'hero', chamber: 'hero' as const },
  { id: 'awareness', chamber: 'awareness' as const },
  { id: 'interest', chamber: 'interest' as const, mistakeIndex: 0 },
  { id: 'interest', chamber: 'interest' as const, mistakeIndex: 1 },
  { id: 'interest', chamber: 'interest' as const, mistakeIndex: 2 },
  { id: 'consideration', chamber: 'consideration' as const },
  { id: 'hire', chamber: 'hire' as const },
] as const;

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const [visitorInfo, setVisitorInfo] = useState<{
    visitorId: string;
    variant: ABVariant;
  }>({
    visitorId: '',
    variant: 'A',
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeChamber, setActiveChamber] = useState<ChamberId | 'hero'>('hero');
  const [is3DMode, setIs3DMode] = useState(true);

  // Stop controller state
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [mistakeIndex, setMistakeIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentStopRef = useRef(0);
  currentStopRef.current = currentStopIndex;

  const isModalOpenRef = useRef(false);
  isModalOpenRef.current = isModalOpen;

  const isNavigatingRef = useRef(false);

  // Listen to browser popstate for routing
  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Initialize Visitor A/B Test (Sticky session via localStorage + SQLite)
  useEffect(() => {
    const info = initVisitor();
    setVisitorInfo(info);
  }, []);

  // Auto-detect mobile devices for lightweight 2D mode
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setIs3DMode(false);
    }
  }, []);

  // Programmatic smooth navigation to a specific funnel stop
  const navigateToStop = useCallback((stopIdx: number) => {
    if (stopIdx < 0 || stopIdx >= FUNNEL_STOPS.length) return;
    const stop = FUNNEL_STOPS[stopIdx];

    currentStopRef.current = stopIdx;
    setCurrentStopIndex(stopIdx);
    setActiveChamber(stop.chamber);

    if ('mistakeIndex' in stop) {
      setMistakeIndex(stop.mistakeIndex);
    }

    const el = document.getElementById(stop.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Chamber Navigation from Navbar and Right HUD Rail
  const handleNavigate = useCallback(
    (id: string) => {
      if (id === 'hero') {
        navigateToStop(0);
      } else if (id === 'awareness') {
        navigateToStop(1);
      } else if (id === 'interest') {
        navigateToStop(2); // Mistake 01
      } else if (id === 'consideration') {
        navigateToStop(5);
      } else if (id === 'hire') {
        navigateToStop(6);
      }
    },
    [navigateToStop]
  );

  // Track scroll position, 3D funnel progress, and SQLite telemetry
  useEffect(() => {
    if (currentPath === '/admin' || currentPath === '/results') return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;

          setScrollProgress(progress);

          const awarenessEl = document.getElementById('awareness');
          const interestEl = document.getElementById('interest');
          const considerationEl = document.getElementById('consideration');
          const hireEl = document.getElementById('hire');

          const scrollMiddle = scrollY + window.innerHeight * 0.45;
          let currentChamber: ChamberId | 'hero' = 'hero';

          if (hireEl && scrollMiddle >= hireEl.offsetTop) {
            currentChamber = 'hire';
          } else if (considerationEl && scrollMiddle >= considerationEl.offsetTop) {
            currentChamber = 'consideration';
          } else if (interestEl && scrollMiddle >= interestEl.offsetTop) {
            currentChamber = 'interest';
          } else if (awarenessEl && scrollMiddle >= awarenessEl.offsetTop) {
            currentChamber = 'awareness';
          } else {
            currentChamber = 'hero';
          }

          setActiveChamber(currentChamber);

          // Real-time tracking to SQLite
          if (visitorInfo.visitorId) {
            trackScrollProgress(
              visitorInfo.visitorId,
              progress,
              currentChamber !== 'hero' ? currentChamber : null
            );
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath, visitorInfo.visitorId]);

  // Global Step-by-Step Funnel Scroll Controller
  // Intercepts wheel and swipe events to step through funnel stops:
  // Hero -> Awareness -> Mistake 01 -> Mistake 02 -> Mistake 03 -> Consideration -> Hire.
  useEffect(() => {
    if (currentPath === '/admin' || currentPath === '/results') return;

    const handleWheel = (e: WheelEvent) => {
      if (isModalOpenRef.current) return;

      const target = e.target as HTMLElement;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 18) return;

      // When at the final stop (Chamber 04: Hire):
      // Allow natural scroll to see the submit button, form bottom, and footer!
      if (currentStopRef.current === FUNNEL_STOPS.length - 1) {
        if (delta > 0) {
          return; // Let native scroll move down to footer
        } else {
          const hireEl = document.getElementById('hire');
          if (hireEl && window.scrollY > hireEl.offsetTop + 15) {
            return; // Let native scroll move back up to top of Chamber 04
          }
        }
      }

      // If the current section extends past the viewport (e.g. Consideration on shorter screens),
      // allow the visitor to scroll through the full content before transitioning to the next stop!
      const activeStop = FUNNEL_STOPS[currentStopRef.current];
      if (!('mistakeIndex' in activeStop) && activeStop.id !== 'hero') {
        const activeEl = document.getElementById(activeStop.id);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          if (delta > 0) {
            if (rect.bottom > window.innerHeight + 25) {
              return; // Allow natural downward scrolling within the section
            }
          } else {
            if (rect.top < -25) {
              return; // Allow natural upward scrolling back to the top of the section
            }
          }
        }
      }

      e.preventDefault();

      if (isNavigatingRef.current) return;

      if (delta > 0) {
        // Scroll DOWN -> Next Stop
        if (currentStopRef.current < FUNNEL_STOPS.length - 1) {
          isNavigatingRef.current = true;
          navigateToStop(currentStopRef.current + 1);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 600);
        }
      } else {
        // Scroll UP -> Prev Stop
        if (currentStopRef.current > 0) {
          isNavigatingRef.current = true;
          navigateToStop(currentStopRef.current - 1);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 600);
        }
      }
    };

    // Mobile touch gestures
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isModalOpenRef.current) return;
      const target = e.target as HTMLElement;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;

      const diffY = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diffY) < 45) return;

      // Allow natural swipe down when at Hire to see footer
      if (currentStopRef.current === FUNNEL_STOPS.length - 1) {
        if (diffY > 0) {
          return;
        } else {
          const hireEl = document.getElementById('hire');
          if (hireEl && window.scrollY > hireEl.offsetTop + 15) {
            return;
          }
        }
      }

      // If current section extends past the viewport, allow natural swipe within it
      const activeTouchStop = FUNNEL_STOPS[currentStopRef.current];
      if (!('mistakeIndex' in activeTouchStop) && activeTouchStop.id !== 'hero') {
        const activeEl = document.getElementById(activeTouchStop.id);
        if (activeEl) {
          const rect = activeEl.getBoundingClientRect();
          if (diffY > 0) {
            if (rect.bottom > window.innerHeight + 25) {
              return;
            }
          } else {
            if (rect.top < -25) {
              return;
            }
          }
        }
      }

      if (isNavigatingRef.current) return;

      if (diffY > 0) {
        // Swiped UP -> Next Stop
        if (currentStopRef.current < FUNNEL_STOPS.length - 1) {
          isNavigatingRef.current = true;
          navigateToStop(currentStopRef.current + 1);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 600);
        }
      } else {
        // Swiped DOWN -> Prev Stop
        if (currentStopRef.current > 0) {
          isNavigatingRef.current = true;
          navigateToStop(currentStopRef.current - 1);
          setTimeout(() => {
            isNavigatingRef.current = false;
          }, 600);
        }
      }
    };

    // Keyboard arrow keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isModalOpenRef.current) return;
      const target = e.target as HTMLElement;
      if (target?.tagName === 'TEXTAREA' || target?.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (currentStopRef.current < FUNNEL_STOPS.length - 1) {
          e.preventDefault();
          navigateToStop(currentStopRef.current + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (currentStopRef.current > 0) {
          e.preventDefault();
          navigateToStop(currentStopRef.current - 1);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPath, navigateToStop]);

  // Dedicated Route: /admin (Submissions list)
  if (currentPath === '/admin') {
    return <AdminPage />;
  }

  // Dedicated Route: /results (A/B Test results side-by-side)
  if (currentPath === '/results') {
    return <ResultsPage />;
  }

  const progressPercent =
    (currentStopIndex / (FUNNEL_STOPS.length - 1)) * 100;

  return (
    <div className="relative min-h-screen bg-[#060709] text-slate-100 overflow-x-clip selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Horizontal Funnel Progress Bar: Plain amber-500, ultra-thin minimal line */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[1.5px] bg-white/[0.06] pointer-events-none"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-amber-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Funnel or 2D Funnel Canvas Background */}
      {is3DMode ? (
        <FunnelCanvas3D scrollProgress={scrollProgress} />
      ) : (
        <FunnelCanvas2D scrollProgress={scrollProgress} />
      )}

      {/* Minimal Top Header: RT. | PRODUCT / ROHIT THORAT | 01 / 04 */}
      <Navbar activeChamber={activeChamber} onNavigate={handleNavigate} />

      {/* Minimal Right Rail: 01 • | 02 • | 03 • | 04 • */}
      <FunnelProgressHUD
        activeChamber={activeChamber}
        onNavigate={handleNavigate}
      />

      {/* Main Minimal Story Flow matching Screenshots */}
      <main className="relative z-10">
        {/* Hero Section matching Screenshot 1 */}
        <HeroSection
          heroLine={HERO_VARIANTS[visitorInfo.variant]}
          variant={visitorInfo.variant}
          onEnterFunnel={() => navigateToStop(1)}
        />

        {/* Chamber 01: Chances I took matching Screenshot 2 */}
        <ChamberAwareness />

        {/* Chamber 02: Mistake Museum matching Screenshot 3 & 4 */}
        <ChamberInterest
          activeIndex={mistakeIndex}
          onPrev={() => navigateToStop(Math.max(0, currentStopIndex - 1))}
          onNext={() =>
            navigateToStop(Math.min(FUNNEL_STOPS.length - 1, currentStopIndex + 1))
          }
          onModalChange={setIsModalOpen}
        />

        {/* Chamber 03: What I built matching Screenshot 5 */}
        <ChamberConsideration onModalChange={setIsModalOpen} />

        {/* Chamber 04: Hire / Contact Form */}
        <ChamberHire visitorId={visitorInfo.visitorId} />
      </main>

      {/* Clean Minimal Footer */}
      <Footer />
    </div>
  );
}

export default App;
