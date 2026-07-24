"use client";

import { useState } from "react";

type TokenLogoProps = {
  src?: string | null;
  symbol: string;
  size?: number;
  className?: string;
};

export function TokenLogo({
  src,
  symbol,
  size = 32,
  className = "",
}: TokenLogoProps) {
  const [failed, setFailed] = useState(false);
  const initials = symbol.slice(0, 3).toUpperCase();

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[rgba(42,157,143,0.25)] text-[var(--teal-soft)] ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(9, size * 0.28) }}
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full bg-[rgba(7,20,26,0.5)] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
