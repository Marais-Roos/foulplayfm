'use client';

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { urlFor } from '@/sanity/lib/image';
import ShowCard from './ShowCard';

interface Show {
  _id: string;
  title: string;
  slug: { current: string };
  timeSlot: number;
  description: string;
  coverImage: any;
}

interface ShowsCarouselProps {
  shows: Show[];
}

function reorderShowsByCurrentTime(shows: Show[]): Show[] {
  const now = new Date();
  const currentHour = now.getHours();
  
  let currentShowIndex = shows.findIndex(show => {
    const endHour = (show.timeSlot + 3) % 24;
    
    if (endHour < show.timeSlot) {
      return currentHour >= show.timeSlot || currentHour < endHour;
    }
    return currentHour >= show.timeSlot && currentHour < endHour;
  });
  
  if (currentShowIndex === -1) {
    currentShowIndex = 0;
  }
  
  return [...shows.slice(currentShowIndex), ...shows.slice(0, currentShowIndex)];
}

export default function ShowsCarousel({ shows }: ShowsCarouselProps) {
  const orderedShows = reorderShowsByCurrentTime(shows);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'start',
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  return (
    <div className="w-full relative">
      {/* Navigation Arrows - Desktop */}
      <button
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className={`cursor-pointer hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-accent-green text-background hover:bg-accent-green/90 transition-all shadow-lg ${
          !canScrollPrev ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={scrollNext}
        disabled={!canScrollNext}
        className={`cursor-pointer hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 items-center justify-center rounded-full bg-accent-green text-background hover:bg-accent-green/90 transition-all shadow-lg ${
          !canScrollNext ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5 md:gap-6 lg:gap-8">
          {orderedShows.map((show) => (
            <div key={show._id} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0">
              <ShowCard
                title={show.title}
                slug={show.slug.current}
                timeSlot={show.timeSlot}
                description={show.description}
                coverImage={urlFor(show.coverImage).width(600).height(600).url()}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {orderedShows.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`cursor-pointer h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'w-8 bg-accent-green' 
                : 'w-2 bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
