import Image from "next/image";
import Button from "./components/Button";
import ShowsCarouselWrapper from "./components/ShowsCarouselWrapper";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto flex-col">
      <main className="flex flex-col gap-12 md:gap-16 lg:gap-24 w-full">
        {/*Hero Section*/}
        <section className="flex flex-col gap-8 md:gap-10 lg:gap-12 items-center w-full mt-32 md:mt-40">
          <div className="flex flex-col w-full items-center text-center gap-4 md:gap-5 lg:gap-6">
            <h1 className="font-headings font-bold text-5xl md:text-6xl lg:text-7xl">AI Radio for people who wish they were deaf.</h1>
            <p className="font-sans font-normal text-xl md:text-2xl ">Repellat aut amet perferendis. Sint vel aliquid nulla. Facilis ut odio qui voluptates sunt sed.</p>
            <Button text="Listen Now" href="/listen-live"/>  
          </div>
          <div className="relative aspect-4/3 w-full lg:max-w-180">
            <Image src='/Hero Image.png' fill alt="A modern recording studio with neon green accents features multiple monitors displaying audio waveforms, sound mixers, microphones, and a rubber duck on a desk. Coffee cups, headphones, and coiled cables contribute to a busy yet organized environment." className="object-cover "/>
          </div>
        </section>
        <section className="w-full"></section> {/*Now playing section*/}
        <section className="w-full flex flex-col gap-6 md:gap-8 lg:gap-10">
          <div className="flex flex-row items-end justify-between">
            <h2 className="font-headings font-bold text-4xl md:text-5xl lg:text-6xl">Our Shows</h2>
            <Button text='View all shows' href='/shows' variant="secondary"/>
          </div>
          {/*All shows carousel*/}
          <ShowsCarouselWrapper />
        </section>
      </main>
    </div>
  );
}
