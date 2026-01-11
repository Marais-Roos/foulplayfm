import Link from 'next/link';

interface ButtonProps {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary';
}

export default function Button({ text, href, variant = 'primary' }: ButtonProps) {
  const isPrimary = variant === 'primary';
  
  const baseClasses = "shrink-0 rounded-xl px-6 py-3 md:px-8 md:py-4 font-headings font-bold text-xl md:text-2xl transition-shadow duration-300 flex items-center";
  
  const variantClasses = isPrimary
    ? "bg-accent-green text-background shadow-lg shadow-accent-green/30 hover:shadow-accent-green/50 gap-4 md:gap-6"
    : "border-2 border-accent-green text-accent-green hover:bg-accent-green/10 justify-center";

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses}`}>
      {isPrimary && (
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-background opacity-75 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-background"></span>
        </span>
      )}
      {text}
    </Link>
  );
}
