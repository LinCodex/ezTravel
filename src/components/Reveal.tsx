"use client";

import { useEffect, useRef, useState } from "react";

/** Fades + slides children up when they scroll into view. Always visible by default to prevent black screens on mobile. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "span";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const rect = el.getBoundingClientRect();
    // Only animate elements that start well below the initial viewport
    if (rect.top > window.innerHeight * 1.2) {
      setIsVisible(false);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.01, rootMargin: "350px 0px 350px 0px" }
      );
      observer.observe(el);

      // Fail-safe timer: guarantee content is 100% visible within 300ms on fast mobile scroll
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 300);

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    } else {
      setIsVisible(true);
    }
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
