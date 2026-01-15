'use client';

import Image from "next/image";
import Link from "next/link";
import Button from "../components/Button";
import { useState } from "react";

const Links = [
    { text: 'Home', href: '/' },
    { text: 'Shows', href: '/shows' },
    { text: 'Presenters', href: '/presenters' },
]

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <nav className="fixed top-4 left-0 right-0 z-100 lg:px-8 ">
                <div className="w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto px-4 py-2 md:px-6 flex items-center justify-between bg-foreground/30 backdrop-blur-lg rounded-xl border border-foreground/20 shadow-xl shadow-background/20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 z-50">
                        <div className="relative aspect-133/48 h-12 md:h-17 lg:h-21">
                            <Image 
                                src="/Logo Horizontal.png" 
                                alt="Foul Play FM Logo" 
                                fill
                                className="object-contain"
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {Links.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className="text-foreground/80 hover:text-foreground transition-colors font-headings text-xl font-medium"
                            >
                                {link.text}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA Button */}
                    <div className="hidden md:block">
                        <Button text="Listen Live" href="/listen-live" variant="primary" />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-foreground transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div 
                className={`fixed inset-0 bg-background/95 backdrop-blur-sm z-[90] md:hidden transition-opacity duration-300 ${
                    isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMenuOpen(false)}
            >
                <div 
                    className={`absolute right-0 top-0 h-full w-64 bg-background border-l border-foreground/10 transition-transform duration-300 ${
                        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col gap-6 p-8 pt-24">
                        {Links.map((link) => (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className="text-lg text-foreground/80 hover:text-foreground transition-colors font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.text}
                            </Link>
                        ))}
                        <div className="pt-4 border-t border-foreground/10">
                            <Button text="Listen Live" href="/listen-live" variant="primary" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}