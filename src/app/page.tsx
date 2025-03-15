import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>I&apos;m D.suke</h1>
        <p className={styles.subtitle}>Frontend Engineer</p>
        <div className={styles.navigation}>
          <Link href="/blog" className={styles.navLink}>
            Blog
          </Link>
          <Link href="/works" className={styles.navLink}>
            Works
          </Link>
          <Link href="/skills" className={styles.navLink}>
            Skills
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </div>
      </div>
    </div>
  );
}
