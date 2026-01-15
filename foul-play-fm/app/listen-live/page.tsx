'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ShowData {
  title: string;
  streamUrl: string;
  imageUrl?: string;
  timeSlot: number; // Hour when show starts (0-23)
  hosts: { name: string; imageUrl?: string }[];
}

interface SongHistoryItem {
  title: string;
  artist: string;
  albumArt?: string;
  timestamp: Date;
}

export default function ListenLive() {
  const [currentShow, setCurrentShow] = useState<ShowData | null>(null);
  const [nowPlayingSong, setNowPlayingSong] = useState("Loading Stream...");
  const [currentAlbumArt, setCurrentAlbumArt] = useState<string | null>(null);
  const [songHistory, setSongHistory] = useState<SongHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProgress, setShowProgress] = useState({ elapsed: "0:00", percentage: 0 });
  const lastProcessedSong = useRef<string>("");

  // Load song history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('foulplay-song-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSongHistory(history);
      } catch (e) {
        console.warn("Failed to load song history:", e);
      }
    }
  }, []);

  // Save song history to localStorage whenever it changes
  useEffect(() => {
    if (songHistory.length > 0) {
      localStorage.setItem('foulplay-song-history', JSON.stringify(songHistory));
    }
  }, [songHistory]);

  // Fetch album art from iTunes API
  const fetchAlbumArt = async (artist: string, title: string): Promise<string | null> => {
    try {
      const query = encodeURIComponent(`${artist} ${title}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // iTunes returns 100x100 by default, we can get higher res
        const artworkUrl = data.results[0].artworkUrl100;
        return artworkUrl.replace('100x100', '600x600'); // Get larger image
      }
    } catch (error) {
      console.warn("Album art fetch failed:", error);
    }
    return null;
  };

  // Calculate show progress (3-hour shows)
  useEffect(() => {
    if (!currentShow) return;

    const updateProgress = () => {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const sastOffset = 2 * 60 * 60 * 1000;
      const sastDate = new Date(utc + sastOffset);
      const currentHour = sastDate.getHours();
      const currentMinute = sastDate.getMinutes();

      // Calculate minutes since show started
      let minutesSinceStart = (currentHour - currentShow.timeSlot) * 60 + currentMinute;
      
      // Handle day wraparound (e.g., show starts at 23:00)
      if (minutesSinceStart < 0) {
        minutesSinceStart += 24 * 60;
      }

      // Cap at 3 hours (180 minutes)
      const cappedMinutes = Math.min(minutesSinceStart, 180);
      const percentage = (cappedMinutes / 180) * 100;
      
      const hours = Math.floor(cappedMinutes / 60);
      const minutes = cappedMinutes % 60;
      const elapsed = `${hours}:${minutes.toString().padStart(2, '0')}`;

      setShowProgress({ elapsed, percentage });
    };

    updateProgress();
    const interval = setInterval(updateProgress, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [currentShow]);

  // Fetch schedule (same as RadioPlayer)
  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/schedule/now');
      const data = await res.json();
      
      if (data.show) {
        setCurrentShow(data.show);
      }
    } catch (e) {
      console.error("Schedule error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 30000); 
    return () => clearInterval(interval);
  }, []);

  // Poll metadata and update song history
  useEffect(() => {
    if (!currentShow?.streamUrl) return;

    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/proxy-metadata?url=${encodeURIComponent(currentShow.streamUrl)}`);
        const data = await res.json();
        
        if (data.title && data.title !== "Live Broadcast" && !data.title.includes("Loading")) {
          const newSong = data.title;
          
          // Only process if it's different from the last processed song
          if (newSong !== lastProcessedSong.current) {
            lastProcessedSong.current = newSong;
            setNowPlayingSong(newSong);
            
            // Parse artist and title
            let artist = "Unknown Artist";
            let title = newSong;
            
            if (newSong.includes(" - ")) {
              const parts = newSong.split(" - ");
              artist = parts[0];
              title = parts.slice(1).join(" - ");
            }

            // Fetch album art and add to history
            fetchAlbumArt(artist, title).then(artUrl => {
              const historyItem: SongHistoryItem = {
                title,
                artist,
                albumArt: artUrl || undefined,
                timestamp: new Date()
              };

              setSongHistory(prev => [historyItem, ...prev.slice(0, 4)]); // Keep last 5
              
              // Update current album art
              if (artUrl) {
                setCurrentAlbumArt(artUrl);
              }
            });
          }
        } else if (data.title === "Live Broadcast") {
          setNowPlayingSong(prev => prev === "Loading Stream..." ? "Live Broadcast" : prev);
        }
      } catch (error) {
        console.warn("Metadata poll failed");
      }
    };

    fetchMetadata();
    const interval = setInterval(fetchMetadata, 10000); 
    return () => clearInterval(interval);
  }, [currentShow]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-neon-green text-2xl font-mono animate-pulse">TUNING IN...</div>
      </main>
    );
  }

  if (!currentShow) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">OFF AIR</h1>
          <p className="text-gray-400">No show currently scheduled</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white pb-32">
      {/* Background Effects */}
      <div className="fixed inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.1),transparent_50%)]"></div>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-green blur-[200px] opacity-10 rounded-full animate-pulse"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32">
        {/* Live Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 border border-neon-green px-6 py-2 rounded-full text-neon-green text-sm font-bold tracking-widest animate-pulse shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <span className="w-3 h-3 bg-neon-green rounded-full animate-ping absolute"></span>
            <span className="w-3 h-3 bg-neon-green rounded-full"></span>
            LIVE NOW
          </div>
        </div>

        {/* Main Player Card */}
        <div className="bg-gradient-to-b from-gray-900 to-black border-2 border-neon-green/30 rounded-3xl p-8 md:p-12 shadow-[0_0_60px_rgba(57,255,20,0.2)]">
          
          {/* Show Title */}
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{currentShow.title}</h1>
            <div className="flex items-center justify-center gap-3 text-gray-400">
              {currentShow.hosts.map((host, idx) => (
                <span key={idx} className="text-sm">{host.name}</span>
              ))}
            </div>
          </div>

          {/* Album Art */}
          <div className="flex justify-center mb-6">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden border-4 group">
              {currentAlbumArt ? (
                <img 
                  src={currentAlbumArt} 
                  alt={nowPlayingSong}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : currentShow.imageUrl ? (
                <Image 
                  src={currentShow.imageUrl} 
                  alt={currentShow.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-gray-800 to-black flex items-center justify-center">
                  <span className="text-6xl">📻</span>
                </div>
              )}
            </div>
          </div>

          {/* Now Playing */}
          <div className="text-center mb-6">
            <p className="text-neon-green text-xs uppercase tracking-[0.3em] font-bold mb-2">Now Playing</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {nowPlayingSong.includes(" - ") ? nowPlayingSong.split(" - ")[1] : nowPlayingSong}
            </h2>
            <p className="text-gray-400 text-lg">
              {nowPlayingSong.includes(" - ") ? nowPlayingSong.split(" - ")[0] : "Unknown Artist"}
            </p>
          </div>

          {/* Show Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>{currentShow.timeSlot.toString().padStart(2, '0')}:00</span>
              <span>{showProgress.elapsed}</span>
              <span>{((currentShow.timeSlot + 3) % 24).toString().padStart(2, '0')}:00</span>
            </div>
            <div className="relative w-full h-1 bg-accent-purple/60 rounded-full">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-accent-purple rounded-full shadow-[0_0_12px_rgba(124,58,237,0.8)] transition-all duration-1000 border-2 border-white"
                style={{ left: `calc(${showProgress.percentage}% - 6px)` }}
              />
            </div>
          </div>

          {/* Recently Played */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-gray-400 text-sm uppercase tracking-widest mb-4 font-bold">Recently Played</h3>
            <div className="space-y-3">
              {songHistory.length > 0 ? (
                songHistory.map((song, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 bg-black/50 p-3 rounded-lg border border-gray-800 hover:border-neon-green/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
                      {song.albumArt ? (
                        <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{song.title}</p>
                      <p className="text-gray-500 text-xs truncate">{song.artist}</p>
                    </div>
                    <div className="text-gray-600 text-xs">
                      {new Date(song.timestamp).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm text-center py-4">No song history yet...</p>
              )}
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-6 text-center border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm">
              Use the player controls at the bottom of the page to play/pause
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}