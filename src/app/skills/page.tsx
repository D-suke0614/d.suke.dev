import { FaVuejs } from 'react-icons/fa';
import {
  SiCss3,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiSlack,
  SiTypescript,
  SiVercel,
} from 'react-icons/si';

import styles from './page.module.css';

const skillCategories = [
  {
    title: 'Languages',
    skills: [
      { name: 'JavaScript', icon: <SiJavascript className={styles.skillIcon} /> },
      { name: 'TypeScript', icon: <SiTypescript className={styles.skillIcon} /> },
      { name: 'HTML', icon: <SiHtml5 className={styles.skillIcon} /> },
      { name: 'CSS', icon: <SiCss3 className={styles.skillIcon} /> },
    ],
  },
  {
    title: 'Frameworks & Libraries',
    skills: [
      { name: 'React', icon: <SiReact className={styles.skillIcon} /> },
      { name: 'Next.js', icon: <SiNextdotjs className={styles.skillIcon} /> },
      { name: 'Vue.js', icon: <FaVuejs className={styles.skillIcon} /> },
    ],
  },
  {
    title: 'Tools & Platforms',
    skills: [
      { name: 'Git', icon: <SiGit className={styles.skillIcon} /> },
      { name: 'GitHub', icon: <SiGithub className={styles.skillIcon} /> },
      { name: 'Vercel', icon: <SiVercel className={styles.skillIcon} /> },
      { name: 'Figma', icon: <SiFigma className={styles.skillIcon} /> },
      { name: 'Slack', icon: <SiSlack className={styles.skillIcon} /> },
    ],
  },
];

export default function SkillsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Skills</h1>
      <div className={styles.content}>
        <div className={styles.categoriesList}>
          {skillCategories.map((category, index) => (
            <div key={index} className={styles.category}>
              <h2 className={styles.categoryTitle}>{category.title}</h2>
              <div className={styles.skillsGrid}>
                {category.skills.map((skill, skillIndex) => (
                  <div key={skillIndex} className={styles.skillCard}>
                    <div className={styles.iconWrapper}>{skill.icon}</div>
                    <span className={styles.skillName}>{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
