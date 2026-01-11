import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import PresenterCard from './PresenterCard';

interface Presenter {
  _id: string;
  name: string;
  slug: { current: string };
  image: any;
}

async function getPresenters(): Promise<Presenter[]> {
  const query = `*[_type == "presenter"] | order(name asc) {
    _id,
    name,
    slug,
    image
  }`;
  
  return await client.fetch(query);
}

export default async function PresentersGrid() {
  const presenters = await getPresenters();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 w-full">
      {presenters.map((presenter) => (
        <PresenterCard
          key={presenter._id}
          name={presenter.name}
          slug={presenter.slug.current}
          image={urlFor(presenter.image).width(600).height(600).url()}
        />
      ))}
    </div>
  );
}
