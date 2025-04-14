import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

// Mock work data
// todo: コンテンツ内容の整備
const works = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description:
      'A modern e-commerce solution with cart, checkout, and payment integration.',
    technologies: ['Next.js', 'React', 'TypeScript', 'Stripe', 'CSS Modules'],
    imageUrl: '/placeholder.svg?height=300&width=500&text=E-commerce+Platform',
    link: '#',
  },
  {
    id: '2',
    title: 'Analytics Dashboard',
    description:
      'Interactive dashboard with real-time data visualization for business metrics.',
    technologies: ['React', 'D3.js', 'TypeScript', 'WebSockets', 'Material UI'],
    imageUrl: '/placeholder.svg?height=300&width=500&text=Analytics+Dashboard',
    link: '#',
  },
  {
    id: '3',
    title: 'Portfolio Website',
    description:
      'Custom portfolio website with blog, showcasing frontend development skills.',
    technologies: ['Next.js', 'CSS Modules', 'Framer Motion', 'MDX'],
    imageUrl: '/placeholder.svg?height=300&width=500&text=Portfolio+Website',
    link: '#',
  },
];

export default function WorksPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Works</h1>
      <div className={styles.content}>
        <div className={styles.worksList}>
          {works.map((work) => (
            <div key={work.id} className={styles.workItem}>
              <div className={styles.workGrid}>
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
                  <p className={styles.workDescription}>{work.description}</p>
                  <h3 className={styles.technologiesTitle}>Technologies:</h3>
                  <div className={styles.technologies}>
                    {work.technologies.map((tech, index) => (
                      <span key={index} className={styles.technology}>
                        {tech}
                      </span>
                    ))}
                  </div>
                  <Link href={work.link} className={styles.viewLink}>
                    View Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
