'use client';

import Link from 'next/link';
import { FaXTwitter } from 'react-icons/fa6';
import { LuGithub, LuLinkedin } from 'react-icons/lu';
import { SiZenn } from 'react-icons/si';
import styles from './footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>© 2025 D.suke.dev. All rights reserved.</p>
        <div className={styles.socialLinks}>
          <Link
            href="https://github.com/D-suke0614"
            aria-label="GitHub profile"
            target="_blank"
            className={styles.socialLink}
          >
            <LuGithub className={styles.socialIcon} />
          </Link>
          <Link
            href="https://x.com/0614d_suke"
            aria-label="Twitter profile"
            target="_blank"
            className={styles.socialLink}
          >
            <FaXTwitter className={styles.socialIcon} />
          </Link>
          <Link
            href="https://www.linkedin.com/in/daisuke-kida/"
            aria-label="LinkedIn profile"
            target="_blank"
            className={styles.socialLink}
          >
            <LuLinkedin className={styles.socialIcon} />
          </Link>
          <Link
            href="https://zenn.dev/d_suke0614"
            aria-label="zenn profile"
            target="_blank"
            className={styles.socialLink}
          >
            <SiZenn className={styles.socialIcon} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
