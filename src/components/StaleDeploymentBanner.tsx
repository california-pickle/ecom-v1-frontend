"use client";

import { useEffect, useRef, useState } from "react";

const CURRENT_BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
const CHECK_INTERVAL_MS = 60_000;

export default function StaleDeploymentBanner() {
  const [stale, setStale] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (CURRENT_BUILD_ID === "dev") return;

    const check = async () => {
      try {
        const res = await fetch("/api/build-id", { cache: "no-store" });
        const { buildId } = await res.json();
        if (buildId !== CURRENT_BUILD_ID) setStale(true);
      } catch {
        // ignore network errors
      }
    };

    intervalRef.current = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!stale) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#a3e635] text-black px-4 py-3 flex items-center justify-between shadow-[0_-4px_0px_0px_rgba(0,0,0,1)]">
      <span className="font-black uppercase tracking-widest text-sm">
        A new version is available
      </span>
      <button
        onClick={() => window.location.reload()}
        className="font-black uppercase tracking-widest text-sm border-2 border-black px-4 py-1 hover:bg-black hover:text-[#a3e635] transition-colors"
      >
        Reload
      </button>
    </div>
  );
}
