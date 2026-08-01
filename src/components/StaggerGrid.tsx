"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";

/**
 * Reveals children in document order when the grid enters the viewport.
 * Avoids per-card IntersectionObservers racing so lower cards don't pop in first.
 */
export function StaggerGrid({
  children,
  className = "",
  resetKey,
  staggerMs = 45,
  maxStagger = 16,
}: {
  children: React.ReactNode;
  className?: string;
  /** Change this when the list is filtered/reordered so stagger replays in order. */
  resetKey: string;
  staggerMs?: number;
  maxStagger?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 1.2 && rect.bottom > -200;
    if (alreadyInView) {
      let id2 = 0;
      const id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => setActive(true));
      });
      return () => {
        cancelAnimationFrame(id1);
        cancelAnimationFrame(id2);
      };
    }

    const fallbackTimer = setTimeout(() => {
      setActive(true);
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          clearTimeout(fallbackTimer);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "300px 0px 300px 0px" }
    );
    observer.observe(el);
    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, [resetKey]);

  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={isValidElement(child) && child.key != null ? String(child.key) : i}
          className={`stagger-item ${active ? "is-visible" : ""}`}
          style={
            {
              "--stagger-delay": `${Math.min(i, maxStagger) * staggerMs}ms`,
            } as React.CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
