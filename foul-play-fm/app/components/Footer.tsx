import Image from "next/image";
import Link from "next/link";
import Button from "../components/Button";

const Links = [
    { text: 'Home', href: '/' },
    { text: 'Shows', href: '/shows' },
    { text: 'Presenters', href: '/presenters' },
]

export default function Footer() {
    return (
        <footer className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto mt-12 md:mt-16 lg:mt-24 mb-6">
            <div className="w-full flex flex-col md:flex-row md:justify-between gap-8">
                <div className="w-full flex flex-col items-center md:items-start gap-4 md:max-w-2/5">
                    <div className="relative aspect-133/48 h-16 md:h-18 lg:h-24">
                        <Image src='/Logo Horizontal.png' alt="Foul Play FM Logo" fill className="object-contain"/>
                    </div>
                    <h3 className="font-headings font-bold text-center md:text-left text-xl md:text-2xl lg:text-3xl">Want to listen to radio like it's 1984? We've got you!</h3>
                    <Button text='Listen Live' href='/listen-live' />
                </div>
                <div className="flex flex-col gap-4 items-center md:items-end py-0 md:py-5">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-18 items-center md:items-end">
                        {Links.map((link) => (
                            <Link 
                                key={link.href}
                                href={link.href}
                                className="font-sans text-xl lg:text-2xl hover:text-accent-green transition-colors"
                            >
                                <p>{link.text}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center md:justify-between w-full border-t-foreground border-t pt-6">
                <p className="font-sans text-base">© 2026 Foul Play FM. All rights reserved.</p>
                <Link href="https://maraisroos.co.za" target="_blank" rel="noopener noreferrer" className="flex flex-row items-center gap-4 bg-foreground/20 px-4 py-2 rounded-md hover:bg-foreground/30 transition-colors">
                    <div className="relative aspect-square w-6 h-6 rounded-full overflow-hidden">
                        <Image src='/Marais Roos.png' alt='Ligne Claire illustration of Marais Roos wearing a shirt with a tie and sunglasses on a light blue background' fill className="object-cover"/>
                    </div>
                    <p className="font-sans text-base">Crafted by <span className="font-bold">Marais Roos</span>.</p>
                </Link>
            </div>
        </footer>
    );
}