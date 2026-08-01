"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-5 bg-black text-white">
      <div className="max-w-md text-center">
        <h1 className="hero-title text-3xl font-medium">Something went wrong</h1>
        <p className="text-white/60 text-sm mt-3 leading-relaxed">
          Please try again. If this keeps happening, refresh the page or return home.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="bg-white text-black text-sm rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-neutral-900 text-white text-sm rounded-full px-6 py-3 ring-1 ring-white/15 hover:bg-neutral-800 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
