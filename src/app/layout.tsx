import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Footer from './components/footer/Footer';
import Header from './components/header/Header';
import MainContentWrapper from './components/mainContentWrapper/MainContentWrapper';
import { ThemeProvider } from './components/themeProvider/ThemeProvide';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'd.suke.dev',
  description: 'Official website of d.suke.dev, a frontend developer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <MainContentWrapper>{children}</MainContentWrapper>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
