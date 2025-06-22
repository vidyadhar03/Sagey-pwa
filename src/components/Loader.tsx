"use client";

interface LoaderProps {
  size?: number; // tailwind size in rem (height & width) default 8 (2rem)
  className?: string;
}

export default function Loader({ size = 32, className = "" }: LoaderProps) {
  const dimension = `${size}px`;
  return (
    <div
      className={["animate-spin rounded-full border-b-2 border-[#1DB954]", className].join(" ")}
      style={{ width: dimension, height: dimension }}
    />
  );
} 