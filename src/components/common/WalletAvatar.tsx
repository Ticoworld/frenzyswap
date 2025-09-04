"use client";

import React from 'react';

function hashColor(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h << 5) - h + input.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export default function WalletAvatar({
  wallet,
  size = 28,
  className = "",
  title,
}: {
  wallet: string;
  size?: number;
  className?: string;
  title?: string;
}) {
  const bg = hashColor(wallet);
  const txt = wallet ? `${wallet.slice(0, 2)}${wallet.slice(-2)}`.toUpperCase() : "??";
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full ring-1 ring-white/10 select-none ${className}`}
      style={{ width: size, height: size, background: `radial-gradient( circle at 30% 30%, ${bg}, #1f2937)` }}
      aria-label={`Wallet ${wallet}`}
      title={title || wallet}
    >
      <span className="text-[10px] font-semibold text-white/90 mix-blend-screen">{txt}</span>
    </div>
  );
}
