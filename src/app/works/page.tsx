import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

type Work = {
  title: string;
  company: string;
  technologies: string[];
  imageUrl: string;
  link: string;
  isPreview?: boolean;
};

const works: Work[] = [
  {
    title: '【LP】観光クロスオーバーサミット2025 in 関西・大阪万博',
    company: '観光クロスオーバー協会',
    technologies: ['Astro'],
    imageUrl: '/kankou-xoversummit2025.png',
    link: 'https://kankou-xoversummit2025.pages.dev/',
    isPreview: true,
  },
  {
    title: 'Personal Color診断サイト',
    company: '個人開発',
    technologies: ['Next.js', 'face-api'],
    imageUrl: '/personal-color.png',
    link: 'https://personal-color-tau.vercel.app/',
  },
  {
    title: '【メディアサイト構築】占いマッチングプラットフォーム RAYSEE',
    company: '株式会社ALBONA',
    technologies: ['WordPress'],
    imageUrl: '/raysee-column.png',
    link: 'https://raysee.jp/column',
  },
];

const ImageContainer = ({ work }: { work: Work }) => {
  return (
    <>
      <div className={styles.imageContainer}>
        <Image
          src={work.imageUrl || '/placeholder.svg'}
          alt={work.title}
          width={500}
          height={300}
          className={styles.image}
        />
      </div>
      <div className={styles.details}>
        <h2 className={styles.workTitle}>{work.title}</h2>
        <p className={styles.workCompany}>{work.company}</p>
        <h3 className={styles.technologiesTitle}>Technologies:</h3>
        <div className={styles.technologies}>
          {work.technologies.map((tech, index) => (
            <span key={index} className={styles.technology}>
              {tech}
            </span>
          ))}
        </div>
        {work.link ? <span className={styles.viewLink}>View Project</span> : <></>}
        {work.link && work.isPreview ? (
          <span className={styles.annotation}>※PJ都合でプレビュー環境に遷移します</span>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default function WorksPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Works</h1>
      <div className={styles.content}>
        <div className={styles.worksList}>
          {works.map((work: Work) => (
            <div key={work.title} className={styles.workItem}>
              {work.link ? (
                <Link
                  href={work.link}
                  className={styles.workGrid}
                  rel="nofollow noreferrer"
                  target="_blank"
                >
                  <ImageContainer work={work} />
                </Link>
              ) : (
                <div className={styles.workGrid}>
                  <ImageContainer work={work} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
