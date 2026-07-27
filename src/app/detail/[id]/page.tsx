useEffect(() => {
  async function loadStream() {
    // Pass type, tmdbId, season, and episode
    const res = await fetch(`/api/stream?type=tv&tmdbId=94997&season=1&episode=1`);
    const data = await res.json();
    
    if (data.streams && data.streams.length > 0) {
      // Set stream source to your video player state
      setStreamUrl(data.streams[0].url);
    }
  }
  
  loadStream();
}, []);
