import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

interface ParallaxContextValue {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isReducedMotion: boolean;
}

const ParallaxContext = createContext<ParallaxContextValue | null>(null);

export interface MouseParallaxContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * If true, tracking is relative to the entire browser window.
   * If false (default), tracking is relative to this container's bounding rectangle.
   */
  global?: boolean;
  /**
   * Smoothness damping factor between 0.01 and 1.
   * Lower values produce smoother, more cinematic interpolation (lerp). Default is 0.08.
   */
  damping?: number;
  /**
   * Maximum tilt angles [maxRotateX, maxRotateY] in degrees. Default is [10, 10].
   */
  maxTilt?: [number, number];
  /**
   * 3D perspective distance in pixels. Default is 1000.
   */
  perspective?: number;
  /**
   * Whether container itself should tilt in 2.5D space. Default is false.
   */
  tiltContainer?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface MouseParallaxLayerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Translation offset factor in pixels along X/Y axes.
   * Positive moves towards mouse, negative moves in reverse. Default is 20.
   */
  factorOffset?: number;
  /**
   * Offset along Z axis (translateZ in pixels) to separate 2.5D planes. Default is 0.
   */
  zOffset?: number;
  /**
   * Optional rotational multiplier relative to container tilt. Default is 0.
   */
  rotateFactor?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * Maximum card rotation angle in degrees. Default is 14.
   */
  maxTilt?: number;
  /**
   * Scale factor when hovered. Default is 1.02.
   */
  scale?: number;
  /**
   * Perspective distance in pixels. Default is 1000.
   */
  perspective?: number;
  /**
   * Whether to render an interactive specular light reflection (glare). Default is true.
   */
  glare?: boolean;
  /**
   * Maximum opacity of the glare reflection (0 to 1). Default is 0.25.
   */
  maxGlareOpacity?: number;
  /**
   * Lerp damping factor for smoothing (0.02 to 0.3). Default is 0.1.
   */
  damping?: number;
  className?: string;
  style?: React.CSSProperties;
}

// ============================================================================
// HELPER: REDUCED MOTION HOOK
// ============================================================================

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// 1. MOUSE PARALLAX CONTAINER
// ============================================================================

/**
 * Performance-friendly 2D/2.5D container that updates CSS variables via requestAnimationFrame
 * to drive child parallax layers with ZERO React re-renders during pointer movements.
 */
export function MouseParallaxContainer({
  children,
  global = false,
  damping = 0.08,
  maxTilt = [10, 10],
  perspective = 1000,
  tiltContainer = false,
  className = "",
  style = {},
  ...rest
}: MouseParallaxContainerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isReducedMotion = usePrefersReducedMotion();

  // Target and current values normalized to [-1, 1]
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const rafId = useRef<number | null>(null);
  const isHovered = useRef(false);

  const updateLoop = useCallback(() => {
    // Linear interpolation: current + (target - current) * damping
    currentX.current += (targetX.current - currentX.current) * damping;
    currentY.current += (targetY.current - currentY.current) * damping;

    const el = containerRef.current;
    if (el) {
      // Directly mutate CSS custom properties on the DOM node for 60/120fps GPU updates
      el.style.setProperty("--mp-x", currentX.current.toFixed(4));
      el.style.setProperty("--mp-y", currentY.current.toFixed(4));

      if (tiltContainer) {
        const rotX = (-currentY.current * maxTilt[0]).toFixed(3);
        const rotY = (currentX.current * maxTilt[1]).toFixed(3);
        el.style.transform = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    }

    const deltaX = Math.abs(targetX.current - currentX.current);
    const deltaY = Math.abs(targetY.current - currentY.current);

    // Continue loop until settled or if user is still hovering
    if (deltaX > 0.0005 || deltaY > 0.0005 || isHovered.current) {
      rafId.current = requestAnimationFrame(updateLoop);
    } else {
      rafId.current = null;
    }
  }, [damping, maxTilt, perspective, tiltContainer]);

  const requestUpdate = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(updateLoop);
    }
  }, [updateLoop]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isReducedMotion) return;
      isHovered.current = true;

      if (global) {
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        targetX.current = (e.clientX / width) * 2 - 1;
        targetY.current = (e.clientY / height) * 2 - 1;
      } else {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        targetX.current = (x / rect.width) * 2 - 1;
        targetY.current = (y / rect.height) * 2 - 1;
      }

      requestUpdate();
    },
    [global, isReducedMotion, requestUpdate]
  );

  const handlePointerLeave = useCallback(() => {
    isHovered.current = false;
    // Smoothly return back to rest center
    targetX.current = 0;
    targetY.current = 0;
    requestUpdate();
  }, [requestUpdate]);

  useEffect(() => {
    if (global && !isReducedMotion) {
      const handleGlobalMove = (e: MouseEvent) => {
        const width = window.innerWidth || 1;
        const height = window.innerHeight || 1;
        targetX.current = (e.clientX / width) * 2 - 1;
        targetY.current = (e.clientY / height) * 2 - 1;
        requestUpdate();
      };

      window.addEventListener("mousemove", handleGlobalMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleGlobalMove);
    }
  }, [global, isReducedMotion, requestUpdate]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <ParallaxContext.Provider value={{ containerRef, isReducedMotion }}>
      <div
        ref={containerRef}
        onPointerMove={!global ? handlePointerMove : undefined}
        onPointerLeave={!global ? handlePointerLeave : undefined}
        className={className}
        style={{
          position: "relative",
          perspective: `${perspective}px`,
          transformStyle: "preserve-3d",
          willChange: "transform",
          ...style,
        }}
        {...rest}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  );
}

// ============================================================================
// 2. MOUSE PARALLAX LAYER
// ============================================================================

/**
 * Child layer that transforms proportionally to parent container's mouse coordinates.
 * Supports translation offsets along X, Y, and Z for true 2.5D physical depth.
 */
export function MouseParallaxLayer({
  children,
  factorOffset = 20,
  zOffset = 0,
  rotateFactor = 0,
  className = "",
  style = {},
  ...rest
}: MouseParallaxLayerProps) {
  const context = useContext(ParallaxContext);

  if (context?.isReducedMotion) {
    return (
      <div className={className} style={style} {...rest}>
        {children}
      </div>
    );
  }

  // Uses CSS calc() referencing container CSS variables for zero-JS-paint overhead
  const transform = [
    `translate3d(calc(var(--mp-x, 0) * ${factorOffset}px), calc(var(--mp-y, 0) * ${factorOffset}px), ${zOffset}px)`,
    rotateFactor !== 0
      ? `rotateY(calc(var(--mp-x, 0) * ${rotateFactor}deg)) rotateX(calc(var(--mp-y, 0) * ${-rotateFactor}deg))`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      style={{
        transformStyle: "preserve-3d",
        transform,
        willChange: "transform",
        transition: "transform 0.05s ease-out",
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 3. 2.5D INTERACTIVE TILT CARD WITH SPECULAR GLARE
// ============================================================================

/**
 * Self-contained 2.5D tilt card. When hovered, the card physically tilts towards
 * the cursor using smooth lerped RAF animation with an optional dynamic light sheen.
 */
export function TiltCard({
  children,
  maxTilt = 14,
  scale = 1.02,
  perspective = 1000,
  glare = true,
  maxGlareOpacity = 0.22,
  damping = 0.1,
  className = "",
  style = {},
  ...rest
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const isReducedMotion = usePrefersReducedMotion();

  const targetTiltX = useRef(0);
  const targetTiltY = useRef(0);
  const currentTiltX = useRef(0);
  const currentTiltY = useRef(0);

  const targetScale = useRef(1);
  const currentScale = useRef(1);

  const targetGlareX = useRef(50);
  const targetGlareY = useRef(50);
  const currentGlareX = useRef(50);
  const currentGlareY = useRef(50);
  const targetGlareOpacity = useRef(0);
  const currentGlareOpacity = useRef(0);

  const rafId = useRef<number | null>(null);
  const isHovered = useRef(false);

  const updateCard = useCallback(() => {
    // Smooth lerp calculations
    currentTiltX.current +=
      (targetTiltX.current - currentTiltX.current) * damping;
    currentTiltY.current +=
      (targetTiltY.current - currentTiltY.current) * damping;
    currentScale.current +=
      (targetScale.current - currentScale.current) * damping;

    if (glare) {
      currentGlareX.current +=
        (targetGlareX.current - currentGlareX.current) * damping;
      currentGlareY.current +=
        (targetGlareY.current - currentGlareY.current) * damping;
      currentGlareOpacity.current +=
        (targetGlareOpacity.current - currentGlareOpacity.current) * damping;
    }

    const card = cardRef.current;
    if (card) {
      card.style.transform = `perspective(${perspective}px) rotateX(${currentTiltX.current.toFixed(
        3
      )}deg) rotateY(${currentTiltY.current.toFixed(
        3
      )}deg) scale3d(${currentScale.current.toFixed(
        4
      )}, ${currentScale.current.toFixed(4)}, 1)`;
    }

    const glareEl = glareRef.current;
    if (glareEl && glare) {
      glareEl.style.background = `radial-gradient(circle at ${currentGlareX.current.toFixed(
        2
      )}% ${currentGlareY.current.toFixed(
        2
      )}%, rgba(255,255,255,${currentGlareOpacity.current.toFixed(
        3
      )}), transparent 65%)`;
    }

    const deltaTilt =
      Math.abs(targetTiltX.current - currentTiltX.current) +
      Math.abs(targetTiltY.current - currentTiltY.current);

    if (deltaTilt > 0.01 || isHovered.current) {
      rafId.current = requestAnimationFrame(updateCard);
    } else {
      rafId.current = null;
    }
  }, [damping, glare, perspective]);

  const requestUpdate = useCallback(() => {
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(updateCard);
    }
  }, [updateCard]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (isReducedMotion) return;
      const card = cardRef.current;
      if (!card) return;

      isHovered.current = true;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1;
      const normY = (y / rect.height) * 2 - 1;

      // Invert Y for proper tilt direction
      targetTiltX.current = -normY * maxTilt;
      targetTiltY.current = normX * maxTilt;
      targetScale.current = scale;

      if (glare) {
        targetGlareX.current = (x / rect.width) * 100;
        targetGlareY.current = (y / rect.height) * 100;
        targetGlareOpacity.current = maxGlareOpacity;
      }

      requestUpdate();
    },
    [glare, isReducedMotion, maxGlareOpacity, maxTilt, requestUpdate, scale]
  );

  const handlePointerLeave = useCallback(() => {
    isHovered.current = false;
    targetTiltX.current = 0;
    targetTiltY.current = 0;
    targetScale.current = 1;

    if (glare) {
      targetGlareOpacity.current = 0;
    }

    requestUpdate();
  }, [glare, requestUpdate]);

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={{
        position: "relative",
        transformStyle: "preserve-3d",
        willChange: "transform",
        ...style,
      }}
      {...rest}
    >
      {children}

      {/* Dynamic Specular Glare Layer */}
      {glare && !isReducedMotion && (
        <div
          ref={glareRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            mixBlendMode: "overlay",
            willChange: "background",
            zIndex: 30,
          }}
        />
      )}
    </div>
  );
}

export default MouseParallaxContainer;
