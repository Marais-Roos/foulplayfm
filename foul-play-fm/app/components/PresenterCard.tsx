import Image from 'next/image';
import Link from 'next/link';

interface PresenterCardProps {
  name: string;
  slug: string;
  image: string;
}

export default function PresenterCard({ name, slug, image }: PresenterCardProps) {
  return (
    <Link href={`/presenters/${slug}`} className="group">
      <div className="flex flex-col gap-3">
        {/* Square Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image 
            src={image} 
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* Name */}
        <h3 className="font-headings font-bold text-lg md:text-xl text-center group-hover:text-accent-green transition-colors">
          {name}
        </h3>
      </div>
    </Link>
  );
}
