import Image from 'next/image';
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import { notFound } from 'next/navigation';

interface Presenter {
  _id: string;
  name: string;
  slug: { current: string };
  image: any;
}

interface Show {
  _id: string;
  title: string;
  slug: { current: string };
  timeSlot: number;
  description: string;
  coverImage: any;
  hosts: Presenter[];
  vibe?: string;
}

async function getShow(slug: string): Promise<Show | null> {
  const query = `*[_type == "show" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    timeSlot,
    description,
    coverImage,
    vibe,
    hosts[]-> {
      _id,
      name,
      slug,
      image
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

export default async function Show({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const show = await getShow(slug);

  if (!show) {
    notFound();
  }

  return (
    <div className="flex min-h-screen items-center w-full max-w-[calc(100vw-32px)] md:max-w-[calc(100vw-120px)] lg:max-w-7xl mx-auto flex-col">
      <main className="flex flex-col gap-12 md:gap-16 lg:gap-24 w-full py-12 md:py-16 lg:py-24">
        <section className='flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-12 items-center w-full'>
            <div className='relative aspect-square w-full md:max-w-90 lg:max-w-full flex-1 rounded-2xl overflow-hidden'> {/*Show thumbnail*/}
                <Image
                  src={urlFor(show.coverImage).width(800).height(800).url()}
                  alt={show.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
            </div>
            <div className='flex flex-col gap-4 md:gap-5 lg:gap-6 flex-1 justify-center items-center lg:items-start text-center lg:text-left'>
                <p className="text-sm md:text-base font-sans text-accent-green font-semibold">
                    DAILY: {formatTime(show.timeSlot)}
                </p>
                <h1 className="font-headings font-bold text-4xl md:text-5xl lg:text-6xl">{show.title}</h1>
                {show.hosts && show.hosts.length > 0 && (
                  <div className='flex flex-wrap gap-3 justify-center lg:justify-start'>
                    {show.hosts.map((host) => (
                      <Link
                        key={host._id}
                        href={`/presenters/${host.slug.current}`}
                        className='flex items-center gap-2 bg-accent-purple rounded-full px-4 py-2 hover:bg-accent-purple/80 transition-colors'
                      >
                        {host.image && (
                          <div className='relative w-6 h-6 rounded-full overflow-hidden'>
                            <Image
                              src={urlFor(host.image).width(48).height(48).url()}
                              alt={host.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                        <span className='font-sans font-semibold text-sm text-background'>
                          {host.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                <p className="font-sans text-base md:text-lg text-foreground/90">{show.description}</p>
                {show.vibe && (
                  <div className='flex flex-wrap gap-2 justify-center lg:justify-start'>
                    {show.vibe
                      .split(/[,.]/)
                      .map(item => item.trim())
                      .map(item => item.replace(/^and\s+/i, ''))
                      .filter(item => item)
                      .map((item, index) => (
                        <span 
                          key={index}
                          className='capitalize bg-foreground/10 rounded-full px-4 py-2 font-sans text-sm text-foreground border border-foreground/20'
                        >
                          {item}
                        </span>
                      ))}
                  </div>
                )}
            </div>    
        </section>
      </main>
    </div>
  );
}