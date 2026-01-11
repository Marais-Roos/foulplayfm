import { client } from '@/sanity/lib/client';
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

async function getShows(): Promise<Show[]> {
  const query = `*[_type == "show"] | order(timeSlot asc) {
    _id,
    title,
    slug,
    timeSlot,
    description,
    coverImage
  }`;
  
  return await client.fetch(query);
}

export default async function ShowsGrid() {
  const shows = await getShows();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 w-full">
      {shows.map((show) => (
        <ShowCard
          key={show._id}
          title={show.title}
          slug={show.slug.current}
          timeSlot={show.timeSlot}
          description={show.description}
          coverImage={urlFor(show.coverImage).width(600).height(600).url()}
        />
      ))}
    </div>
  );
}
