import { client } from '@/sanity/lib/client';
import ShowsCarousel from './ShowsCarousel';

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

export default async function ShowsCarouselWrapper() {
  const shows = await getShows();
  
  return <ShowsCarousel shows={shows} />;
}
