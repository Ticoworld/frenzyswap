"use client";

export default function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth: Math.max(2, Math.round(size / 10)),
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-block rounded-full border-transparent border-t-current animate-spin ${className}`}
      style={style}
    />
  );
}
