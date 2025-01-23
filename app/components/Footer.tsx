import Link from 'next/link';
import { Github, Linkedin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <p className="text-sm text-gray-400">
            Built by{" "}
            <Link
              href="https://www.linkedin.com/in/mynkkkk/"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4 hover:text-yellow-400"
            >
              Mayank Singhal
            </Link>
          </p>
          <span className="hidden md:inline text-gray-600">•</span>
          <p className="text-sm text-gray-400">All rights reserved</p>
        </div>
        
        <div className="flex items-center justify-center md:justify-end gap-4">
          <Link
            href="https://github.com/MynkSinghal"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gray-900 p-2.5 hover:bg-gray-800 transition-colors"
          >
            <Github className="h-5 w-5 text-yellow-400" />
            <span className="sr-only">GitHub</span>
          </Link>
          <Link
            href="https://www.linkedin.com/in/mynkkkk/"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gray-900 p-2.5 hover:bg-gray-800 transition-colors"
          >
            <Linkedin className="h-5 w-5 text-yellow-400" />
            <span className="sr-only">LinkedIn</span>
          </Link>
          <Link
            href="mailto:singhal2004mayank@gmail.com"
            className="rounded-full bg-gray-900 p-2.5 hover:bg-gray-800 transition-colors"
          >
            <Mail className="h-5 w-5 text-yellow-400" />
            <span className="sr-only">Email</span>
          </Link>
          <Link
            href="tel:+918448039908"
            className="rounded-full bg-gray-900 p-2.5 hover:bg-gray-800 transition-colors"
          >
            <Phone className="h-5 w-5 text-yellow-400" />
            <span className="sr-only">Phone</span>
          </Link>
        </div>
      </div>
    </footer>
  );
} 