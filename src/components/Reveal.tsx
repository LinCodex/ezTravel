"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades & slides children up smoothly when scrolled into view.
 * ALWAYS defaults to opacity-100 to guarantee ZERO black screens on fast mobile scrolling.
 */
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
  // Default to true so all content renders visibly immediately on SSR & fast scroll
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    // Only attempt reveal hide if element is far below the viewport (> 1.5x screen height)
    if (rect.top > window.innerHeight * 1.5) {
      setIsVisible(false);

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.01, rootMargin: "400px 0px 400px 0px" }
      );
      observer.observe(el);

      // Fail-safe timer: guarantee 100% visibility within 150ms regardless of scroll speed
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 150);

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`transition-all duration-400 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${className}`}
      style={{
        transitionDelay: isVisible ? `${delay}ms` : "0ms",
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
