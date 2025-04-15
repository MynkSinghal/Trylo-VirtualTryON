import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
      <Image
        src="https://img.icons8.com/pulsar-color/100/hanger.png"
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