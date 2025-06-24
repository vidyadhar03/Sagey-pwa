"use client";

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 text-white">
            Psycho-Analysis Methodology
          </h1>
          <p className="text-zinc-400 text-lg">
            Our psycho-analysis suite derives insights from your Spotify listening patterns using advanced statistical analysis and music metadata.
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">How It Works</h2>
          <p className="text-zinc-300 mb-6 leading-relaxed">
            We analyze your recent listening history to compute five key psychological metrics that reveal unique patterns in your musical personality.
          </p>
          
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
            <p className="text-amber-200 text-sm italic">
              <strong>Coming Soon:</strong> Detailed methodology documentation is currently being prepared. 
              Our team is working on comprehensive explanations of each metric's calculation and scientific basis.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-white mb-4">Current Metrics</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">Musical Diversity</h4>
              <p className="text-zinc-400 text-sm">Shannon entropy analysis of genre distribution</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">Exploration Rate</h4>
              <p className="text-zinc-400 text-sm">Unique artist and track discovery patterns</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">Temporal Consistency</h4>
              <p className="text-zinc-400 text-sm">Listening schedule regularity analysis</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <h4 className="font-semibold text-orange-400 mb-2">Mainstream Affinity</h4>
              <p className="text-zinc-400 text-sm">Popularity and chart performance correlation</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-4 md:col-span-2">
              <h4 className="font-semibold text-pink-400 mb-2">Emotional Volatility</h4>
              <p className="text-zinc-400 text-sm">Valence variance across listening sessions</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
          >
            ← Back to Analysis
          </button>
        </div>
      </div>
    </main>
  );
} 