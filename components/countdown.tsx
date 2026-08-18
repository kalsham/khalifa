"use client";

import { useEffect, useState } from "react";

function getParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, minutes, seconds };
}

export function Countdown({ target, label = "ends in" }: { target: string | Date; label?: string }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState(() => getParts(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(getParts(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (parts.diff <= 0) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-white/80">{label}</span>
      <div className="flex gap-1.5 font-mono text-sm font-semibold">
        {[
          [parts.days, "d"],
          [parts.hours, "h"],
          [parts.minutes, "m"],
          [parts.seconds, "s"],
        ].map(([val, unit]) => (
          <span key={unit as string} className="rounded bg-white/15 px-1.5 py-0.5 text-white">
            {String(val).padStart(2, "0")}
            {unit}
          </span>
        ))}
      </div>
    </div>
  );
}
