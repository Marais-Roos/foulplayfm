import Image from 'next/image';
import Link from 'next/link';

interface ShowCardProps {
  title: string;
  slug: string;
  timeSlot: number;
  description: string;
  coverImage: string;
}

export default function ShowCard({ title, slug, timeSlot, description, coverImage }: ShowCardProps) {
  // Format time slot (0-23) to readable format with 3-hour duration
  const formatTime = (hour: number) => {
    const endHour = (hour + 3) % 24;
    
    const formatHour = (h: number) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour}:00 ${period}`;
    };
    
    return `${formatHour(hour)} - ${formatHour(endHour)}`;
  };

  return (
    <Link href={`/shows/${slug}`} className="group">
      <div className="flex flex-col gap-4">
        {/* Square Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl">
          <Image 
            src={coverImage} 
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2 text-center">
          {/* Time Slot */}
          <p className="text-sm md:text-base font-sans text-accent-green font-semibold">
            {formatTime(timeSlot)}
          </p>

          {/* Title */}
          <h3 className="font-headings font-bold text-xl md:text-2xl lg:text-3xl group-hover:text-accent-green transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="font-sans text-foreground/80 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
