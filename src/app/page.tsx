import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      {/* Main Content Area with 24px padding */}
      <div className="p-6 pb-24">
        {/* Top Bar */}
        <div className="flex items-center justify-center relative mb-6">
          {/* Avatar - 16px from top and left edges */}
          <div 
            className="absolute left-0 top-0 w-10 h-10 rounded-full overflow-hidden cursor-pointer"
            style={{ left: '16px', top: '16px' }}
            role="button"
            aria-label="Open profile"
          >
            <Image
              src="/placeholder-avatar.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          
          {/* Title - centered horizontally */}
          <h1 className="text-[20px] font-semibold text-white">Sagey</h1>
        </div>
        
        {/* Daily Aha! Card - 24px margin top, using flex layout */}
        <div className="flex items-start justify-between p-4 bg-[#1E1E1E] rounded-xl mb-6">
          {/* Text block - constrained width with margin-right */}
          <div className="flex-1 mr-4">
            <p className="text-[14px] text-[#5DD39E] mb-2">Daily Aha!</p>
            <p className="text-[18px] text-white leading-[1.4] mb-2">
              The best way to predict the future is to create it.
            </p>
            <p className="text-[12px] text-[#888888]">Peter Drucker</p>
          </div>
          
          {/* Thumbnail - fixed size with rounded corners */}
          <div className="w-[60px] h-[60px] rounded-lg overflow-hidden bg-[#2A2A2A] flex-shrink-0">
            <Image
              src="/placeholder-image.jpg"
              alt="Daily Aha image"
              width={60}
              height={60}
              className="object-cover"
            />
          </div>
        </div>
        
        {/* Quick Actions - 24px margin top */}
        <div className="mb-6">
          <div className="flex gap-2"> {/* 8px gap between buttons */}
            <button className="flex-1 h-[44px] bg-[#5DD39E] text-black font-semibold text-[14px] rounded-lg px-3">
              Start Journaling
            </button>
            <button className="flex-1 h-[44px] border border-[#444444] text-white font-semibold text-[14px] rounded-lg px-3">
              View Spotify Insights
            </button>
          </div>
        </div>
        
        {/* Recent Activity - 24px margin top */}
        <div>
          <h2 className="text-[16px] font-semibold text-white mb-4">Recent Activity</h2>
          
          {/* Activity Items */}
          <div className="space-y-3"> {/* 12px margin between cards */}
            {/* Journaling Item */}
            <div className="bg-[#1E1E1E] rounded-xl px-4 py-3 flex items-center">
              <div className="text-[#888888] w-6 h-6 mr-3 flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] text-white">Journaling</h3>
                <p className="text-[12px] text-[#888888] mt-1">No journaling activity yet</p>
              </div>
            </div>
            
            {/* Spotify Insights Item */}
            <div className="bg-[#1E1E1E] rounded-xl px-4 py-3 flex items-center">
              <div className="text-[#888888] w-6 h-6 mr-3 flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div>
                <h3 className="text-[16px] text-white">Spotify Insights</h3>
                <p className="text-[12px] text-[#888888] mt-1">No Spotify insights yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#1E1E1E',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 24px'
      }}>
        <a href="/" className="flex flex-col items-center" style={{ color: '#5DD39E' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="text-xs mt-1">Home</span>
        </a>
        <a href="/journaling" className="flex flex-col items-center" style={{ color: '#a0a0a0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          <span className="text-xs mt-1">Journaling</span>
        </a>
        <a href="/insights" className="flex flex-col items-center" style={{ color: '#a0a0a0' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <span className="text-xs mt-1">Insights</span>
        </a>
      </nav>
    </div>
  );
}
