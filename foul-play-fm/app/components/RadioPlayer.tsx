'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// --- ICONS ---
const ICONS = {
  play: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7">
      <path fill="currentColor" fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
  ),
  pause: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7">
      <path fill="currentColor" fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
  ),
  volume: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-foreground">
      <path fill="currentColor" d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318 0-2.486.005C1.137 7.534 0 8.618 0 9.545v4.91c0 .927 1.137 2.011 2.022 2.04.168.005 1.345.005 2.486.005h1.932l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06zM18.81 9.75a3 3 0 010 4.5.75.75 0 01-1.06-1.06 1.5 1.5 0 000-2.38.75.75 0 011.06-1.06z" />
    </svg>
  ),
  robot: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-foreground">
      <path fill="currentColor" d="M16.5 6a3 3 0 00-3-3H10.5a3 3 0 00-3 3v2.25h6V6zM18 9h-1.5v2.25A2.25 2.25 0 0114.25 13.5h-4.5A2.25 2.25 0 017.5 11.25V9H6a3 3 0 00-3 3v4.5a3 3 0 003 3h12a3 3 0 003-3V12a3 3 0 00-3-3z" />
    </svg>
  )
};

interface ShowData {
  title: string;
  streamUrl: string;
  imageUrl?: string; // New field
  hosts: { name: string }[];
}

export default function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShow, setCurrentShow] = useState<ShowData | null>(null);
  const [nowPlayingSong, setNowPlayingSong] = useState("Loading Stream...");
  const [volume, setVolume] = useState(0.5);
  const [loading, setLoading] = useState(true);
  const [aiScript, setAiScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- 1. FETCH SCHEDULE (AUTO-UPDATES) ---
  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/schedule/now');
      const data = await res.json();
      
      if (data.show) {
        setCurrentShow(prev => {
          if (!prev || prev.title !== data.show.title || prev.streamUrl !== data.show.streamUrl) {
            console.log("🔄 Show switching to:", data.show.title);
            return data.show;
          }
          return prev;
        });
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

  // --- 2. POLL METADATA ---
  useEffect(() => {
    if (!currentShow?.streamUrl) return;

    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/proxy-metadata?url=${encodeURIComponent(currentShow.streamUrl)}`);
        const data = await res.json();
        
        if (data.title && data.title !== "Live Broadcast") {
          setNowPlayingSong(data.title);
        } else if (data.title) {
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

  // --- 3. AUTO-PLAY NEW STREAM ---
  useEffect(() => {
    if (!audioRef.current || !currentShow) return;
    if (isPlaying && audioRef.current.src !== currentShow.streamUrl) {
        audioRef.current.src = currentShow.streamUrl;
        audioRef.current.play().catch(e => console.error("Auto-switch play failed", e));
    }
  }, [currentShow, isPlaying]);

  // --- 4. AI SCRIPT GENERATOR ---
  const generateDjTalk = async () => {
    if (!currentShow || !nowPlayingSong || nowPlayingSong === "Live Broadcast" || nowPlayingSong.includes("Loading")) {
      setAiScript("Wait for a song name to appear...");
      setTimeout(() => setAiScript(""), 3000);
      return;
    }

    setIsGenerating(true);
    setAiScript("Listening to track...");

    try {
      let artist = "Unknown Artist";
      let title = nowPlayingSong;

      if (nowPlayingSong.includes(" - ")) {
        const parts = nowPlayingSong.split(" - ");
        artist = parts[0];
        title = parts.slice(1).join(" - ");
      }

      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songName: title,
          artist: artist,
          showTitle: currentShow.title,
          hostNames: currentShow.hosts.map(h => h.name)
        })
      });

      const data = await res.json();
      
      if (data.error) {
         setAiScript(`Error: ${data.error}`);
      } else if (data.script) {
        setAiScript(data.script);
      } else {
        setAiScript("Radio silence... (API Error)");
      }

    } catch (e) {
      console.error(e);
      setAiScript("Signal interference.");
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 5. CONTROLS ---
  const togglePlay = () => {
    if (!audioRef.current || !currentShow) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current.src !== currentShow.streamUrl) {
          audioRef.current.src = currentShow.streamUrl;
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Play failed:", e));
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  if (loading) return null;
  if (!currentShow) return <div className="fixed bottom-0 w-full p-4 bg-black text-white text-center z-[100]">OFF AIR</div>;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t-2 border-neon-green z-[100] shadow-[0_-10px_40px_rgba(57,255,20,0.2)]">
      <div className="max-w-7xl mx-auto">
        
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Row: Info + Play Button */}
          <div className="flex items-center gap-3 p-3">
            {/* SHOW ARTWORK */}
            <div className={`w-12 h-12 shrink-0 rounded-md border-2 border-neon-green bg-black overflow-hidden relative ${isPlaying ? 'animate-pulse shadow-[0_0_15px_#39ff14]' : ''}`}>
              {currentShow.imageUrl ? (
                <Image 
                  src={currentShow.imageUrl} 
                  alt={currentShow.title} 
                  className="object-cover"
                  fill
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">📻</div>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">
              <h3 className="text-neon-green font-bold text-[10px] uppercase tracking-wider truncate">{currentShow.title}</h3>
              <div className="overflow-hidden">
                <p className="text-white text-xs truncate">{nowPlayingSong}</p>
              </div>
            </div>

            {/* PLAY BUTTON */}
            <button 
              onClick={togglePlay} 
              className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(57,255,20,0.5)] shrink-0"
            >
              <span className="text-black">{isPlaying ? ICONS.pause : ICONS.play}</span>
            </button>
          </div>

          {/* Bottom Row: Volume + AI Button */}
          <div className="flex items-center gap-3 px-3 pb-3 pt-1">
            <div className="flex items-center gap-2 flex-1">
              <span className="shrink-0">{ICONS.volume}</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume} 
                onChange={handleVolume} 
                className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green" 
              />
            </div>
            <button 
              onClick={generateDjTalk} 
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-foreground rounded-full text-foreground hover:border-neon-green hover:text-neon-green transition-colors disabled:opacity-50 text-[9px] font-bold tracking-wider"
            >
              {ICONS.robot}
              <span>{isGenerating ? "..." : "AI"}</span>
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between p-4">
          
          {/* INFO */}
          <div className="flex items-center gap-4 min-w-0 flex-1 mr-4">
            {/* SHOW ARTWORK */}
            <div className={`w-14 h-14 shrink-0 rounded-md border-2 border-neon-green bg-black overflow-hidden relative ${isPlaying ? 'animate-pulse shadow-[0_0_15px_#39ff14]' : ''}`}>
              {currentShow.imageUrl ? (
                <Image 
                  src={currentShow.imageUrl} 
                  alt={currentShow.title} 
                  className="object-cover"
                  fill
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl">📻</div>
              )}
            </div>

            <div className="flex flex-col overflow-hidden">
              <h3 className="text-neon-green font-bold text-xs uppercase tracking-[0.2em] whitespace-nowrap">{currentShow.title}</h3>
              <div className="relative w-full h-6 overflow-hidden">
                <p className="text-white font-medium text-sm whitespace-nowrap animate-marquee">
                  {nowPlayingSong}
                </p>
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center gap-6">
            <button 
              onClick={togglePlay} 
              className="w-14 h-14 bg-neon-green rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.6)] cursor-pointer"
            >
              <span className="text-black">{isPlaying ? ICONS.pause : ICONS.play}</span>
            </button>

            <button 
              onClick={generateDjTalk} 
              disabled={isGenerating} 
              className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-foreground hover:text-neon-green transition-colors disabled:opacity-50"
            >
              <div className="p-2 border border-foreground rounded-full hover:border-neon-green transition-colors">
                {ICONS.robot}
              </div>
              {isGenerating ? "THINKING..." : "DJ RANT"}
            </button>
          </div>

          {/* VOLUME */}
          <div className="flex items-center gap-3 ml-6">
            {ICONS.volume}
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={volume} 
              onChange={handleVolume} 
              className="w-24 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-green" 
            />
          </div>
        </div>

        <audio ref={audioRef} crossOrigin="anonymous" preload="none" />
      </div>

      {/* SCRIPT OVERLAY */}
      {aiScript && (
        <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-[90%] md:w-auto max-w-2xl bg-black/95 p-6 border border-neon-green rounded-xl text-center z-[102] shadow-[0_0_30px_rgba(57,255,20,0.2)]">
          <p className="text-neon-green text-xs mb-2 uppercase tracking-widest font-bold">Generated Script</p>
          <p className="text-white text-base md:text-lg font-serif italic leading-relaxed mb-4">"{aiScript}"</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setAiScript("")} className="px-4 py-1 border border-gray-600 text-gray-400 rounded hover:border-white hover:text-white text-sm">Dismiss</button>
          </div>
        </div>
      )}
    </div>
  );
}