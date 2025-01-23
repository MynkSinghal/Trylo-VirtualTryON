

import './globals.css';
import type { Metadata } from 'next';
import { Inter, Roboto_Flex } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });
const robotoFlex = Roboto_Flex({ 
  subsets: ['latin'],
  variable: '--font-roboto-flex'
});

export const metadata: Metadata = {
  title: 'FASHN Studio | Virtual Try-on',
  description: 'Experience the future of fashion with AI-powered virtual try-on',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${robotoFlex.variable} bg-black`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}