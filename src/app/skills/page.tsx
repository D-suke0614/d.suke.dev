import { FaVuejs } from 'react-icons/fa';
import {
  SiCss3,
  SiCssmodules,
  SiFigma,
  SiGit,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiVercel,
  SiWebpack,
} from 'react-icons/si';

import styles from './page.module.css';

// Mock skills data with icons
// todo: スキルに乗せる内容の見直し
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
      { name: 'CSS Modules', icon: <SiCssmodules className={styles.skillIcon} /> },
      { name: 'Vue.js', icon: <FaVuejs className={styles.skillIcon} /> },
    ],
  },
  {
    title: 'Tools & Platforms',
    skills: [
      { name: 'Git', icon: <SiGit className={styles.skillIcon} /> },
      { name: 'GitHub', icon: <SiGithub className={styles.skillIcon} /> },
      { name: 'Webpack', icon: <SiWebpack className={styles.skillIcon} /> },
      { name: 'Vercel', icon: <SiVercel className={styles.skillIcon} /> },
    ],
  },
  {
    title: 'Design & UX',
    skills: [
      { name: 'Figma', icon: <SiFigma className={styles.skillIcon} /> },
      // {
      //   name: 'Responsive Design',
      //   icon: <ResponsiveIcon className={styles.skillIcon} />,
      // },
      // { name: 'UI/UX Principles', icon: <MousePointer className={styles.skillIcon} /> },
      // { name: 'Accessibility', icon: <Accessibility className={styles.skillIcon} /> },
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
