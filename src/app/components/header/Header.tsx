'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LuGithub } from 'react-icons/lu';
import ThemeToggle from '../themeToggle/ThemeToggle';
import styles from './header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScroll = window.scrollY > 20;
      if (isScroll !== scrolled) {
        setScrolled(isScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <>
      <div className={styles.headerSpacer}></div>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            D.suke
          </Link>
          <div className={styles.links}>
            <Link href="/blog" className={styles.link}>
              Blog
            </Link>
            <Link href="/works" className={styles.link}>
              Works
            </Link>
            <Link href="/skills" className={styles.link}>
              Skills
            </Link>
            <Link href="/about" className={styles.link}>
              About
            </Link>
            <div className={styles.actions}>
              <Link
                href="https://github.com/D-suke0614"
                aria-label="GitHub profile"
                target="_blank"
                className={styles.githubLink}
              >
                <LuGithub className={styles.githubIcon} />
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
