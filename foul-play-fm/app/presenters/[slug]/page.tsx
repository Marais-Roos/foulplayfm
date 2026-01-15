import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { notFound } from 'next/navigation';

interface Show {
  _id: string;
  title: string;
  slug: { current: string };
  timeSlot: number;
  coverImage: any;
}

interface Presenter {
  _id: string;
  name: string;
  slug: { current: string };
  image: any;
  bio: string;
  shows: Show[];
}

async function getPresenter(slug: string): Promise<Presenter | null> {
  const query = `*[_type == "presenter" && slug.current == $slug][0] {
    _id,
    name,
    slug,
    image,
    bio,
    "shows": *[_type == "show" && references(^._id)] {
      _id,
      title,
      slug,
      timeSlot,
      coverImage
    }
  }`;
  
  return await client.fetch(query, { slug });
}

// Format time slot with 3-hour duration
function formatTime(hour: number) {
  const endHour = (hour + 3) % 24;
  
  const formatHour = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayHour}:00 ${period}`;
  };
  
  return `${formatHour(hour)} - ${formatHour(endHour)}`;
}

export default async function Presenter({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const presenter = await getPresenter(slug);

    if (!presenter) {
        notFound();
    }

    return (
        <div className="flex min-h-screen items-center w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto flex-col">
            <main className="flex flex-col gap-12 md:gap-16 lg:gap-24 w-full py-12 md:py-16 lg:py-24">
                <section className='flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 items-center lg:items-center w-full mt-32 md:mt-40'>
                    <div className='relative aspect-square w-full md:max-w-90 lg:max-w-full flex-1 rounded-2xl overflow-hidden'>
                        <Image 
                            src={urlFor(presenter.image).width(600).height(600).url()}
                            alt={presenter.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <div className='flex flex-col gap-4 md:gap-5 lg:gap-6 flex-1 items-center lg:items-start text-center lg:text-left'>
                        <h1 className="font-headings font-bold text-4xl md:text-5xl lg:text-6xl">{presenter.name}</h1>
                        <p className="font-sans text-base md:text-lg text-foreground/90">{presenter.bio}</p>
                        {presenter.shows && presenter.shows.length > 0 && (
                            <div className='flex flex-col gap-3 w-full'>
                                <h2 className="font-headings font-semibold text-xl md:text-2xl">Shows</h2>
                                <div className='flex flex-row flex-wrap gap-3 items-center justify-center lg:justify-start'>
                                    {presenter.shows.map((show) => (
                                        <Link
                                            key={show._id}
                                            href={`/shows/${show.slug.current}`}
                                            className='group flex items-center gap-3 bg-foreground/5 hover:bg-foreground/10 rounded-xl px-4 py-3 transition-colors border border-foreground/10'
                                        >
                                            {show.coverImage && (
                                                <div className='relative w-12 h-12 rounded-lg overflow-hidden'>
                                                    <Image
                                                        src={urlFor(show.coverImage).width(96).height(96).url()}
                                                        alt={show.title}
                                                        fill
                                                        className="object-cover"
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                            <div className='flex flex-col gap-1'>
                                                <span className='font-sans font-semibold text-sm group-hover:text-accent-green transition-colors'>
                                                    {show.title}
                                                </span>
                                                <span className='font-sans text-xs text-accent-green'>
                                                    {formatTime(show.timeSlot)}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}