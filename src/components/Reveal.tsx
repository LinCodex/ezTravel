"use client";

import { useEffect, useRef, useState } from "react";

/** Fades + slides children up when they scroll into view. */
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
  // Start visible for SSR / first paint so content never flashes blank.
  const [visible, setVisible] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 1.2 && rect.bottom > -200;

    if (inView) {
      // Already on screen or near viewport — keep visible.
      setAnimate(true);
      setVisible(true);
      return;
    }

    // Off-screen — hide, then reveal on scroll.
    setVisible(false);
    setAnimate(true);

    // Fallback timer: ensure content NEVER stays hidden on mobile fast scrolling
    const fallbackTimer = setTimeout(() => {
      setVisible(true);
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
  }, []);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`${animate ? "reveal" : ""} ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
