import './globals.css';
import { Providers } from './providers';
import type { Metadata } from 'next';

const miniAppFrame = {
  version: "1",
  imageUrl: "https://base-nu-ten.vercel.app/splash.png",
  button: {
    title: "Listen Radio",
    action: {
      type: "launch_frame",
      name: "Base Radio",
      url: "https://base-nu-ten.vercel.app",
      splashImageUrl: "https://base-nu-ten.vercel.app/icon.png",
      splashBackgroundColor: "#000000"
    }
  }
};

export const metadata: Metadata = {
  title: 'Base Radio',
  description: 'Listen to lofi radio and ping stations on Base',
  openGraph: {
    title: 'Base Radio',
    description: 'Listen to lofi radio and ping stations on Base',
    images: ['https://base-nu-ten.vercel.app/splash.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify(miniAppFrame),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
