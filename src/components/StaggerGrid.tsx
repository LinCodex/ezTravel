"use client";

import { Children, isValidElement, useEffect, useRef, useState } from "react";

export function StaggerGrid({
  children,
  className = "",
  resetKey,
  staggerMs = 35,
  maxStagger = 16,
}: {
  children: React.ReactNode;
  className?: string;
  resetKey: string;
  staggerMs?: number;
  maxStagger?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 1.5) {
      setActive(false);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(true);
            observer.disconnect();
          }
        },
        { threshold: 0.01, rootMargin: "400px 0px 400px 0px" }
      );
      observer.observe(el);

      const timer = setTimeout(() => {
        setActive(true);
      }, 150);

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    } else {
      setActive(true);
    }
  }, [resetKey]);

  const items = Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {items.map((child, i) => (
        <div
          key={isValidElement(child) && child.key != null ? String(child.key) : i}
          className={`transition-all duration-350 ease-out ${
            active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
          style={
            {
              transitionDelay: active ? `${Math.min(i, maxStagger) * staggerMs}ms` : "0ms",
            } as React.CSSProperties
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
