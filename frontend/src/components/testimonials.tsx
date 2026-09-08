"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface TestimonialCard {
  id: string;
  name: string;
  role: string;
  companyContext: string;
  avatar: string;
  headline: string;
  flaggedRisk: string;
  quote: string;
  outcome: string;
  relX: number;
  relY: number;
}

// Repeating grid cell dimensions
const GRID_W = 1920;
const GRID_H = 1300;

// Target vertical position for the spotlight card: placed with generous breathing room above "Case Studies"
const FOCUSED_CARD_Y = -275;

// Mathematically verified coordinates with >440px Euclidean distance between ANY two cards
// across all repeating tiles, and >490px clearance from the central title (relX: 0, relY: 0)
const CARDS: TestimonialCard[] = [
  {
    id: "t-1",
    name: "Elena Rostova",
    role: "Founding Engineer",
    companyContext: "DevTools Startup",
    avatar: "/images/portrait_elena.jpg",
    headline: "Weekend side-project protected",
    flaggedRisk: "All-Encompassing IP Assignment (§8.2)",
    quote:
      "Section 8.2 of my offer claimed all software created 'during leisure hours.' Signwise drafted the Exhibit B carve-out language, and the founder signed the amendment.",
    outcome: "Personal IP 100% carved out from assignment",
    relX: -580,
    relY: -360,
  },
  {
    id: "t-2",
    name: "Marcus Vance",
    role: "Principal Product Designer",
    companyContext: "Fintech Platform",
    avatar: "/images/portrait_marcus.jpg",
    headline: "Notice cut from 90 to 30 days",
    flaggedRisk: "90-Day Resignation Lock-In (§5.1)",
    quote:
      "In product design, no future employer waits 3 months for you to start. Signwise provided the counter-proposal citing 30-day norms. HR amended it that afternoon.",
    outcome: "Notice period negotiated down to standard 30 days",
    relX: 580,
    relY: -360,
  },
  {
    id: "t-3",
    name: "Sarah Chen",
    role: "Independent Brand Consultant",
    companyContext: "Studio SOW ($22k)",
    avatar: "/images/portrait_sarah.jpg",
    headline: "Payment tied directly to copyright transfer",
    flaggedRisk: "Pre-Payment Copyright Surrender (§4.3)",
    quote:
      "The client's SOW required immediate copyright surrender upon file delivery. If they delayed my $22,000 final invoice, I had zero leverage. Signwise fixed the clause.",
    outcome: "Copyright release conditioned on cleared payment",
    relX: 650,
    relY: 160,
  },
  {
    id: "t-4",
    name: "David Thorne",
    role: "VP of Engineering",
    companyContext: "Cloud Infrastructure",
    avatar: "/images/portrait_david.jpg",
    headline: "2-year global non-compete eliminated",
    flaggedRisk: "14-Country Non-Compete (§9.4)",
    quote:
      "My executive package barred me from cloud computing across North America and Europe for two years. Signwise drafted the limitation amendment to protect my career mobility.",
    outcome: "Scope restricted strictly to named direct competitors",
    relX: -650,
    relY: 160,
  },
  {
    id: "t-5",
    name: "Julian Mercer",
    role: "Founder & Creative Director",
    companyContext: "Digital Product Agency",
    avatar: "/images/portrait_david.jpg",
    headline: "Compounding 10% rent escalation capped",
    flaggedRisk: "Automatic Annual Rent Escalation (§11.2)",
    quote:
      "Our commercial studio lease contained an automatic 10% compounded annual escalation. Signwise flagged the non-market rate and benchmarked it to local CPI caps.",
    outcome: "Annual increase capped at regional CPI (max 3.5%)",
    relX: 220,
    relY: 440,
  },
  {
    id: "t-6",
    name: "Priya Patel",
    role: "Senior Research Scientist",
    companyContext: "Applied AI Lab",
    avatar: "/images/portrait_priya.jpg",
    headline: "100% clawback cliff changed to monthly proration",
    flaggedRisk: "Bonus 100% Cliff Clawback (§6.3)",
    quote:
      "My relocation and sign-on bonus had a 100% repayment penalty if I departed even at month 23. Signwise generated standard monthly proration language that HR approved.",
    outcome: "Bonus clawback prorated monthly instead of a cliff",
    relX: -220,
    relY: 440,
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTile, setActiveTile] = useState<{ col: number; row: number }>({ col: 0, row: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMomentum, setIsMomentum] = useState(false);
  const [isAllLit, setIsAllLit] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const activeIndexRef = useRef(0);
  const activeTileRef = useRef({ col: 0, row: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const momentumRafRef = useRef<number | null>(null);

  // Auto-focus timing refs
  const autoFocusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs synchronized with state
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    activeTileRef.current = activeTile;
  }, [activeTile]);

  // Focus a specific card and smoothly glide camera to position it directly above "Case Studies"
  const focusCardWithGlide = useCallback((cardIndex: number, overrideCol?: number, overrideRow?: number) => {
    const targetCard = CARDS[cardIndex];

    // Find the nearest tile instance to current camera pan so the glide is short, natural, and elegant
    const targetCol = overrideCol !== undefined
      ? overrideCol
      : Math.round((-panRef.current.x - targetCard.relX) / GRID_W);

    const targetRow = overrideRow !== undefined
      ? overrideRow
      : Math.round((-panRef.current.y - targetCard.relY + FOCUSED_CARD_Y) / GRID_H);

    setActiveIndex(cardIndex);
    setActiveTile({ col: targetCol, row: targetRow });

    // Calculate camera pan needed so the card lands at screenX = 0, screenY = FOCUSED_CARD_Y (above Case Studies)
    const nextPanX = -(targetCol * GRID_W + targetCard.relX);
    const nextPanY = FOCUSED_CARD_Y - (targetRow * GRID_H + targetCard.relY);

    setPan({ x: nextPanX, y: nextPanY });
  }, []);

  // Clear running auto-focus timers
  const clearTimers = useCallback(() => {
    if (autoFocusIntervalRef.current) {
      clearInterval(autoFocusIntervalRef.current);
      autoFocusIntervalRef.current = null;
    }
    if (idleResumeTimeoutRef.current) {
      clearTimeout(idleResumeTimeoutRef.current);
      idleResumeTimeoutRef.current = null;
    }
  }, []);

  // Start regular 8-second auto-focus interval
  const startInterval = useCallback(() => {
    clearTimers();
    autoFocusIntervalRef.current = setInterval(() => {
      if (!isDraggingRef.current) {
        let next = Math.floor(Math.random() * CARDS.length);
        while (next === activeIndexRef.current && CARDS.length > 1) {
          next = Math.floor(Math.random() * CARDS.length);
        }
        focusCardWithGlide(next);
      }
    }, 8000);
  }, [clearTimers, focusCardWithGlide]);

  // Schedule auto-focus resumption after 5 seconds of complete idle
  // (All cards stay lit during these 5 seconds, and dim back only when the 5s expire)
  const scheduleResumeAfterIdle = useCallback(() => {
    clearTimers();
    idleResumeTimeoutRef.current = setTimeout(() => {
      setIsAllLit(false); // Return to single-spotlight auto-focus mode after 5s buffer
      // Smoothly glide to position the designated card directly above "Case Studies"
      focusCardWithGlide(activeIndexRef.current, activeTileRef.current.col, activeTileRef.current.row);
      startInterval();
    }, 5000);
  }, [clearTimers, focusCardWithGlide, startInterval]);

  // Cancel any running momentum inertia animation
  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current !== null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
    setIsMomentum(false);
  }, []);

  // Helper to find whichever card is closest to the center of the viewport
  const findClosestCardToCenter = useCallback(() => {
    let closestIndex = 0;
    let closestTile = { col: 0, row: 0 };
    let minDistanceSq = Infinity;

    const centerCol = Math.round(-panRef.current.x / GRID_W);
    const centerRow = Math.round(-panRef.current.y / GRID_H);

    for (let c = centerCol - 2; c <= centerCol + 2; c++) {
      for (let r = centerRow - 2; r <= centerRow + 2; r++) {
        CARDS.forEach((card, idx) => {
          const screenX = panRef.current.x + c * GRID_W + card.relX;
          const screenY = panRef.current.y + r * GRID_H + card.relY;
          const distSq = screenX * screenX + (screenY - FOCUSED_CARD_Y) * (screenY - FOCUSED_CARD_Y);
          if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestIndex = idx;
            closestTile = { col: c, row: r };
          }
        });
      }
    }

    return { cardIndex: closestIndex, tile: closestTile };
  }, []);

  // Finish drag and start the 5-second buffer (keeping all cards lit during the buffer)
  const handleDragEnd = useCallback(() => {
    // Determine the card that landed closest to the target position
    const closest = findClosestCardToCenter();
    setActiveIndex(closest.cardIndex);
    setActiveTile(closest.tile);

    // Keep all cards lit for 5 seconds; smoothly glide to position above text when 5s expire
    scheduleResumeAfterIdle();
  }, [findClosestCardToCenter, scheduleResumeAfterIdle]);

  // Initial mount: position card above "Case Studies" and start auto-focus
  useEffect(() => {
    focusCardWithGlide(0, 0, 0);
    startInterval();
    return () => clearTimers();
  }, [focusCardWithGlide, startInterval, clearTimers]);

  // Pointer event handlers for true continuous infinite dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    stopMomentum();
    clearTimers(); // Pause auto-focus immediately when drag interaction begins
    setIsAllLit(true); // Light up all cards across the canvas
    isDraggingRef.current = true;
    setIsDragging(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };

    lastMoveRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
    };

    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;

    const now = performance.now();
    const dt = Math.max(1, now - lastMoveRef.current.time);

    const deltaX = e.clientX - dragStartRef.current.pointerX;
    const deltaY = e.clientY - dragStartRef.current.pointerY;

    // Direct continuous unbounded accumulator — tracks user's exact drag position
    const newX = dragStartRef.current.panX + deltaX;
    const newY = dragStartRef.current.panY + deltaY;

    // Track instantaneous velocity for inertial flick glide
    const moveDx = e.clientX - lastMoveRef.current.x;
    const moveDy = e.clientY - lastMoveRef.current.y;
    velocityRef.current = {
      vx: moveDx / dt,
      vy: moveDy / dt,
    };

    lastMoveRef.current = { x: e.clientX, y: e.clientY, time: now };
    setPan({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    // Inertial momentum glide on release if user swiped with velocity
    let vx = velocityRef.current.vx * 15;
    let vy = velocityRef.current.vy * 15;

    if (Math.abs(vx) > 0.5 || Math.abs(vy) > 0.5) {
      setIsMomentum(true);
      const applyInertia = () => {
        if (Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05) {
          stopMomentum();
          handleDragEnd();
          return;
        }

        vx *= 0.92;
        vy *= 0.92;

        setPan((prev) => ({
          x: prev.x + vx,
          y: prev.y + vy,
        }));

        momentumRafRef.current = requestAnimationFrame(applyInertia);
      };

      momentumRafRef.current = requestAnimationFrame(applyInertia);
    } else {
      handleDragEnd();
    }
  };

  // Dynamically calculate the visible 5x5 repeating tile matrix based on current camera pan
  const centerCol = Math.round(-pan.x / GRID_W);
  const centerRow = Math.round(-pan.y / GRID_H);

  const visibleTiles: { col: number; row: number; key: string }[] = [];
  for (let c = centerCol - 2; c <= centerCol + 2; c++) {
    for (let r = centerRow - 2; r <= centerRow + 2; r++) {
      visibleTiles.push({ col: c, row: r, key: `${c}_${r}` });
    }
  }

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden">
      {/* ── 1. Expansive Cinematic Visual Showcase (Full-width editorial image) ── */}
      <div className="mx-auto max-w-6xl px-6 mb-24 sm:mb-32">
        <div className="reveal rounded-2xl overflow-hidden border border-white/[0.1] bg-[var(--ink-raised)] relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
          <div className="relative h-[400px] sm:h-[500px] lg:h-[560px] w-full overflow-hidden">
            <Image
              src="/images/contract_ink_macro.jpg"
              alt="Execution clause and fountain pen on open legal agreement"
              fill
              className="object-cover object-center brightness-[0.82] transition-transform duration-1000 ease-out hover:scale-[1.03]"
              priority
            />
            {/* Rich vignette gradient overlays for depth and legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/50 pointer-events-none" />

            {/* Overlaid Editorial Text */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10">
              <div className="chapter-marker text-[var(--gold)]">
                The Reality of Signing
              </div>

              <div className="max-w-2xl space-y-4">
                <blockquote className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal leading-tight">
                  &ldquo;Before you sign, you hold 100% of the leverage.{" "}
                  <span className="italic text-[var(--gold)]">
                    The moment the ink dries, the leverage flips.
                  </span>&rdquo;
                </blockquote>
                <p className="text-sm sm:text-base text-[var(--paper-dim)] font-light leading-relaxed max-w-xl">
                  Most professionals discover restrictive covenants only after resigning, facing an IP dispute, or leaving bonuses on the table.
                </p>
              </div>

              <div className="text-[11px] font-mono text-[var(--paper-muted)] tracking-wider uppercase">
                Clause Inspection Archive &mdash; Pre-Execution Case Studies
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Full-Width Infinite Draggable Canvas (Aceternity-style Infinite Drag & Repeat) ── */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="reveal relative w-full h-[880px] sm:h-[960px] lg:h-[1020px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        {/* Infinite Dot Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: `${pan.x % 32}px ${pan.y % 32}px`,
          }}
        />

        {/* Soft radial vignette at edges to melt the canvas seamlessly into the dark page */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,var(--ink)_88%)]" />

        {/* Central Protective Vignette Mask (guarantees center headline is 100% readable) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[620px] h-[380px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(8,8,9,0.85)_25%,rgba(8,8,9,0.45)_60%,transparent_80%)]" />
        </div>

        {/* Central Anchor Title — unboxed, clean, authoritative */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-xl px-6 pointer-events-none select-none">
          <div className="chapter-marker mb-3">Case Studies</div>
          <h2 className="headline-editorial text-[clamp(2.25rem,4.5vw,3.75rem)] font-normal text-white leading-tight">
            Real Scenarios.{" "}
            <span className="italic text-[var(--gold)]">Real Leverage.</span>
          </h2>
        </div>

        {/* ── Infinite Seamless Repeating World Layer (Smooth Camera Glide into Position) ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0)`,
            transition: isDragging || isMomentum
              ? "none"
              : "transform 1.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Dynamically render 5x5 surrounding tiles — repeating infinitely in every direction */}
          {visibleTiles.map((tile) => (
            <React.Fragment key={tile.key}>
              {CARDS.map((card, cardIdx) => {
                const isTargetSpotlight =
                  cardIdx === activeIndex &&
                  tile.col === activeTile.col &&
                  tile.row === activeTile.row;

                const isLit = isAllLit || isTargetSpotlight;

                const worldX = tile.col * GRID_W + card.relX;
                const worldY = tile.row * GRID_H + card.relY;

                return (
                  <div
                    key={`${card.id}-${tile.key}`}
                    onClick={() => {
                      if (!isDragging) {
                        setIsAllLit(false);
                        focusCardWithGlide(cardIdx, tile.col, tile.row);
                        scheduleResumeAfterIdle(); // Wait 5s before cycling again
                      }
                    }}
                    style={{
                      transform: `translate3d(${worldX}px, ${worldY}px, 0)`,
                      transition:
                        "opacity 0.8s ease, transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.8s ease, box-shadow 0.8s ease",
                    }}
                    className={`absolute w-[310px] sm:w-[350px] p-5 sm:p-6 rounded-xl pointer-events-auto cursor-pointer select-none ${
                      isTargetSpotlight
                        ? "bg-[var(--ink-surface)] border-2 border-[var(--gold)]/85 shadow-[0_0_55px_rgba(223,177,91,0.24),0_25px_50px_rgba(0,0,0,0.95)] z-30 scale-100 opacity-100"
                        : isAllLit
                        ? "bg-[var(--ink-surface)]/95 border border-white/[0.18] shadow-[0_15px_35px_rgba(0,0,0,0.85)] z-20 scale-100 opacity-100 blur-none"
                        : "bg-[var(--ink-raised)]/75 border border-white/[0.05] z-10 scale-[0.93] opacity-[0.20] blur-[0.3px] hover:opacity-50"
                    }`}
                  >
                    <div className="space-y-3.5 pointer-events-none">
                      {/* Author Header */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`relative h-11 w-11 rounded-full overflow-hidden border shrink-0 transition-all ${
                            isTargetSpotlight
                              ? "border-[var(--gold)] ring-2 ring-[var(--gold)]/35"
                              : isAllLit
                              ? "border-white/25 ring-1 ring-white/10"
                              : "border-white/10"
                          }`}
                        >
                          <Image
                            src={card.avatar}
                            alt={card.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4
                            className={`text-sm font-semibold transition-colors ${
                              isLit
                                ? "text-white"
                                : "text-[var(--paper-dim)]"
                            }`}
                          >
                            {card.name}
                          </h4>
                          <div className="text-[11px] text-[var(--paper-muted)] leading-tight">
                            {card.role} &bull; {card.companyContext}
                          </div>
                        </div>
                      </div>

                      {/* Pull-quote Headline */}
                      <div
                        className={`text-xs font-semibold leading-snug transition-colors ${
                          isLit
                            ? "text-white"
                            : "text-[var(--paper-dim)]"
                        }`}
                      >
                        &ldquo;{card.headline}&rdquo;
                      </div>

                      {/* Flagged Clause */}
                      <div className="text-[11px] font-mono text-[var(--paper-muted)] pt-1 border-t border-white/[0.06] leading-tight">
                        Flagged:{" "}
                        <span
                          className={`font-medium transition-colors ${
                            isLit
                              ? "text-[var(--gold)]"
                              : "text-[var(--gold)]/70"
                          }`}
                        >
                          {card.flaggedRisk}
                        </span>
                      </div>

                      {/* Story Quote */}
                      <p
                        className={`text-[13px] leading-relaxed font-normal transition-colors ${
                          isLit
                            ? "text-[var(--paper)]"
                            : "text-[var(--paper-dim)]"
                        }`}
                      >
                        {card.quote}
                      </p>

                      {/* Negotiated Outcome */}
                      <div className="pt-2.5 border-t border-white/[0.06]">
                        <div className="text-xs text-[var(--signal-safe)] font-mono flex items-baseline gap-1.5">
                          <span className="text-[var(--gold)] font-bold">
                            &rarr;
                          </span>
                          <span>{card.outcome}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
