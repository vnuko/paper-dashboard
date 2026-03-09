import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Service Launcher Dashboard',
  description: 'Papirus-inspired desktop workspace for quick service launches.',
  manifest: undefined,
  keywords: ['dashboard', 'services', 'launcher'],
  authors: [{ name: 'Papyrus Dashboard' }],
  creator: 'Papyrus Team',
  themeColor: '#0a0f14',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="papirus-desktop">
        <main className="desktop-shell">{children}</main>
      </body>
    </html>
  );
}
