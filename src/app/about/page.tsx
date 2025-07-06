import Image from 'next/image';
import Link from 'next/link';
import { FaXTwitter } from 'react-icons/fa6';
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu';
import styles from './page.module.css';

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About</h1>
      <div className={styles.content}>
        <div className={styles.profile}>
          <div className={styles.info}>
            <h2 className={styles.name}>D.suke</h2>
            <p className={styles.description}>
              Web Developer based in Japan, passionate about creating beautiful and
              functional web applications.
            </p>
            <p className={styles.description}>
              I especial in React, Next.js, and TypeScript, with a focus on building
              performant and accessible user interfaces.
            </p>

            <h3 className={styles.contactTitle}>Contact</h3>
            <div className={styles.socialLinks}>
              <Link
                href="https://github.com/D-suke0614"
                target="_blank"
                className={styles.socialLink}
              >
                <LuGithub className={styles.socialIcon} />
              </Link>
              <Link
                href="https://x.com/0614d_suke"
                target="_blank"
                className={styles.socialLink}
              >
                <FaXTwitter className={styles.socialIcon} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/daisuke-kida/"
                target="_blank"
                className={styles.socialLink}
              >
                <LuLinkedin className={styles.socialIcon} />
              </Link>
              <Link href="mailto:d.suke.kida@gmail.com" className={styles.socialLink}>
                <LuMail className={styles.socialIcon} />
              </Link>
            </div>
          </div>

          <div className={styles.imageContainer}>
            <Image
              src="/profile-icon1.png"
              alt="D.suke - Frontend Engineer"
              width={261}
              height={300}
              className={styles.image}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
