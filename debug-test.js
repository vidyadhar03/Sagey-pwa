// Debug Test Script for Spotify API
console.log('🧪 Starting Spotify API Debug Test');

// Test the status endpoint
async function testStatus() {
  try {
    console.log('📡 Testing /api/spotify/status');
    const response = await fetch('http://localhost:3000/api/spotify/status');
    const data = await response.json();
    console.log('✅ Status Response:', {
      connected: data.connected,
      hasUser: !!data.user,
      error: data.error,
      debug: data.debug
    });
    return data.connected;
  } catch (error) {
    console.error('❌ Status Test Failed:', error);
    return false;
  }
}

// Test recent tracks endpoint
async function testRecentTracks() {
  try {
    console.log('📡 Testing /api/spotify/recent-tracks');
    const response = await fetch('http://localhost:3000/api/spotify/recent-tracks');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Recent Tracks Response:', {
        tracksCount: data.tracks?.length,
        total: data.total,
        firstTrack: data.tracks?.[0]?.name
      });
    } else {
      console.log('❌ Recent Tracks Error:', data);
    }
  } catch (error) {
    console.error('❌ Recent Tracks Test Failed:', error);
  }
}

// Test top artists endpoint
async function testTopArtists() {
  try {
    console.log('📡 Testing /api/spotify/top-artists');
    const response = await fetch('http://localhost:3000/api/spotify/top-artists?time_range=short_term');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Top Artists Response:', {
        artistsCount: data.artists?.length,
        total: data.total,
        firstArtist: data.artists?.[0]?.name
      });
    } else {
      console.log('❌ Top Artists Error:', data);
    }
  } catch (error) {
    console.error('❌ Top Artists Test Failed:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Running debug tests...\n');
  
  const isConnected = await testStatus();
  
  if (isConnected) {
    console.log('🎵 Testing data endpoints...\n');
    await testRecentTracks();
    await testTopArtists();
  } else {
    console.log('❌ Not connected to Spotify, skipping data tests');
  }
  
  console.log('\n🏁 Debug tests completed');
}

// Only run if called directly (not imported)
if (typeof window === 'undefined' && require.main === module) {
  runTests();
}

module.exports = { testStatus, testRecentTracks, testTopArtists, runTests }; 