import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#3478F6',
};

export const metadata: Metadata = {
  title: 'Creative Hub - Produção de Criativos de Marketing',
  description: 'Hub centralizado de produção de criativos de marketing para desktop e mobile com roteiros, gravação de áudio, teleprompter e sincronização.',
  applicationName: 'Creative Hub',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Creative Hub',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: 'Creative Hub - Produção de Criativos de Marketing',
    description: 'Hub centralizado de produção de criativos de marketing para desktop e mobile com roteiros, gravação de áudio, teleprompter e sincronização.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Creative Hub - Produção de Criativos de Marketing',
    description: 'Hub centralizado de produção de criativos de marketing para desktop e mobile com roteiros, gravação de áudio, teleprompter e sincronização.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col antialiased touch-manipulation" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
