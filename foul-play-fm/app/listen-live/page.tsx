'use client'; // <--- This line fixes the error

import dynamic from 'next/dynamic';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Now that we are in a Client Component, we can use ssr: false
const RadioPlayer = dynamic(() => import("../components/RadioPlayer"), {
  ssr: false,
  loading: () => (
    <div className="fixed bottom-0 left-0 w-full bg-black border-t border-neon-green p-4 text-center text-neon-green font-mono animate-pulse">
      INITIALIZING DECK...
    </div>
  )
});

export default function ListenLive() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />
      
      <div className="grow flex items-center justify-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 md:w-125 h-75 md:h-125 bg-neon-green blur-[150px] opacity-20 rounded-full animate-pulse"></div>
        
        <div className="z-10 text-center max-w-4xl px-4 -mt-12.5">
          <div className="inline-block border border-neon-green px-4 py-1 rounded-full text-neon-green text-sm font-bold tracking-widest mb-6 animate-pulse">
            🔴 LIVE BROADCAST
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-gray-600 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            ON AIR
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
            Broadcasting the chaos live from the underground. <br/>
            <span className="text-neon-green">Tuning into pirate frequencies...</span>
          </p>
        </div>
      </div>

      <RadioPlayer />
    </main>
  );
}