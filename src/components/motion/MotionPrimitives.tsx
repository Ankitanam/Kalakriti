// src/components/motion/MotionPrimitives.tsx
import React, { useEffect, useRef, useState } from "react";

/**
 * Top-level page transition wrapper.
 * Re-mounts with GPU-accelerated entrance whenever the pageKey changes.
 */
export function PageTransition({
  pageKey,
  children,
  className = "",
}: {
  pageKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div key={pageKey} className={`size-full animate-page-enter ${className}`}>
      {children}
    </div>
  );
}

/**
 * Staggered SlideUp animation container.
 */
export function SlideUp({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-slide-up ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Subtle FadeIn animation container.
 */
export function FadeIn({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn pop animation container.
 */
export function ScaleIn({
  children,
  delayMs = 0,
  className = "",
}: {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Staggered Card Entrance.
 */
export function CardEnter({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-card-enter ${className}`}
      style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Authentic number count-up component.
 * Only animates when the target value genuinely changes.
 * Avoids replaying fake 0 -> Value on static re-renders.
 */
export function AnimatedNumber({
  value,
  duration = 450,
  prefix = "",
  suffix = "",
  className = "",
}: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = prevValueRef.current;
    const endVal = value;

    if (startVal === endVal) {
      setDisplayValue(endVal);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth out-cubic easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * eased);

      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(updateCounter);
      } else {
        prevValueRef.current = endVal;
        setDisplayValue(endVal);
      }
    };

    rafRef.current = requestAnimationFrame(updateCounter);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * Concentric sound ripple rings for microphone recording state.
 */
export function MicPulseRing({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <>
      <span className="absolute inset-0 rounded-full bg-red-500/35 animate-mic-pulse-1 pointer-events-none" />
      <span className="absolute inset-0 rounded-full bg-red-500/25 animate-mic-pulse-2 pointer-events-none" />
    </>
  );
}

/**
 * Indeterminate AI photo scanner overlay for craft processing.
 */
export function AiScannerOverlay({
  active,
  stageText,
}: {
  active: boolean;
  stageText?: string;
}) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none rounded-xl overflow-hidden bg-black/25 backdrop-blur-[1px] flex flex-col items-center justify-between p-3 animate-fade-in">
      {/* Laser Scanning Beam */}
      <div
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#F59E0B] animate-laser-scan"
        style={{ willChange: "top" }}
      />

      {/* Top Status Tag */}
      <div className="bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold tracking-wider uppercase border border-amber-300/40 flex items-center gap-1.5 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>AI Analysis</span>
      </div>

      {/* Bottom Live Stage Indicator */}
      {stageText && (
        <div className="bg-[#2E1065]/90 backdrop-blur-md text-amber-200 border border-purple-400/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-center shadow-lg max-w-[90%]">
          {stageText}
        </div>
      )}
    </div>
  );
}

