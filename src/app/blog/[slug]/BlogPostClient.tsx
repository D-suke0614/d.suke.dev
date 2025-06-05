'use client';

import type { BlogPost } from '@/app/lib/blog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import ReactMarkDown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './blog-post.module.css';

function TableOfContents({ content }: { content: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [headings, setHeadings] = useState<
    Array<{ text: string; level: number; slug: string }>
  >([]);

  useEffect(() => {
    const extractHeadings = () => {
      const headingRegex = /^(#{1,3})\s+(.+)$/gm;
      const matches = [...content.matchAll(headingRegex)];

      const extractHeadings = matches.map((match) => {
        const level = match[1].length;
        const text = match[2].trim();
        // Create slug from heading text
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');

        return { text, level, slug };
      });

      setHeadings(extractHeadings);
    };

    extractHeadings();
  }, [content]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={styles.tocContainer}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.tocToggle}
        aria-expanded={isOpen}
      >
        <h2 className={styles.tocTitle}>Table of Contents</h2>
        <span className={`${styles.tocArrow} ${isOpen ? styles.tocArrowOpen : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <nav className={styles.toc}>
          <ul className={styles.tocList}>
            {headings.map((heading, index) => (
              <li
                key={index}
                className={`${styles.tocItem} ${styles[`tocLevel${heading.level}`]}`}
              >
                <a href={`#${heading.slug}`} className={styles.tocLink}>
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default function BlogPostClient({ post }: { post: BlogPost | null }) {
  const pathname = usePathname();

  const shareOnTwitter = () => {
    if (!post) return;

    const url = `${window.location.origin}${pathname}`;
    const text = `Check out "${post.title}" on D.suke's blog`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank',
    );
  };

  if (!post) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Post not found</h1>
          <Link href="/blog" className={styles.backLine}>
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.backLineWrapper}>
          <Link href="/blog" className={styles.backLine}>
            ← Back to blog
          </Link>
        </div>

        <article className={styles.article}>
          <header className={styles.header}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <div className={styles.date}>
                {new Date(post.date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <span className={styles.category}>
                {post.category === 'text' ? 'Tech' : 'Life'}
              </span>
            </div>
          </header>

          {/* Table if Contents */}
          <TableOfContents content={post.content} />

          <div className={styles.markdownContent}>
            <ReactMarkDown
              remarkPlugins={[remarkGfm]}
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h1: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children
                        .toString()
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                    : '';
                  return <h1 id={id} {...props} />;
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h2: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children
                        .toString()
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                    : '';
                  return <h2 id={id} {...props} />;
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                h3: ({ node, ...props }) => {
                  const id = props.children
                    ? props.children
                        .toString()
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                    : '';
                  return <h3 id={id} {...props} />;
                },
              }}
            >
              {post.content}
            </ReactMarkDown>
          </div>
          <div className={styles.shareSection}>
            <p className={styles.shareText}>
              Did you find this article helpful? Share it!
            </p>
            <button
              onClick={shareOnTwitter}
              className={styles.shareButton}
              aria-label="Share on X (Twitter)"
            >
              <FaXTwitter className={styles.shareIcon} />
              Share on X
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
