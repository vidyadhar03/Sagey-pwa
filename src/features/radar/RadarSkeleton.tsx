export default function RadarSkeleton() {
  return (
    <div 
      className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 w-full animate-pulse"
      role="alert"
      aria-label="Loading music radar"
    >
      <div className="h-48 bg-zinc-800 rounded-md mb-4"></div>
      <div className="h-4 bg-zinc-800 rounded w-3/4 mx-auto mb-4"></div>
      <div className="flex justify-center gap-2">
        <div className="h-6 w-24 bg-zinc-800 rounded-full"></div>
        <div className="h-6 w-24 bg-zinc-800 rounded-full"></div>
        <div className="h-6 w-24 bg-zinc-800 rounded-full"></div>
      </div>
    </div>
  );
} 