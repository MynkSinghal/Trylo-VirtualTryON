import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
      <Image
        src="/icons/favicon.ico"
        alt="Trylo Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      <span className="text-2xl font-bold text-yellow-400">
        Trylo
      </span>
    </Link>
  );
} 