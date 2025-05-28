'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

// Import the blog utility functions with the correct path
import type { BlogPost } from '@/app/lib/blog';

// Number of posts to show per page
const POSTS_PER_PAGE = 4;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a client component, we need to fetch the posts on the client side
    async function fetchPosts() {
      try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Filter posts based on active filter
  const filteredPosts = useMemo(() => {
    return activeFilter === 'all'
      ? posts
      : posts.filter((post) => post.category === activeFilter);
  }, [posts, activeFilter]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  }, [filteredPosts.length]);

  // Get current posts for the page
  const currentPosts = useMemo(() => {
    return filteredPosts.slice(
      (currentPage - 1) * POSTS_PER_PAGE,
      currentPage * POSTS_PER_PAGE,
    );
  }, [filteredPosts, currentPage]);

  // Handle page navigation
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);
      // Scroll to top of the posts section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [totalPages],
  );

  // Memoized date formatter
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Blog</h1>
        <div className={styles.content}>
          <div className={styles.loading}>Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Blog</h1>

      {/* Tag filters */}
      <div className={styles.filters}>
        <button
          onClick={() => setActiveFilter('all')}
          className={`${styles.filterButton} ${activeFilter === 'all' ? styles.activeFilter : ''}`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('tech')}
          className={`${styles.filterButton} ${activeFilter === 'tech' ? styles.activeFilter : ''}`}
        >
          Tech
        </button>
        <button
          onClick={() => setActiveFilter('life')}
          className={`${styles.filterButton} ${activeFilter === 'life' ? styles.activeFilter : ''}`}
        >
          Life
        </button>
      </div>

      <div className={styles.content}>
        {currentPosts.length === 0 ? (
          <div className={styles.emptyState}>No posts found for this category.</div>
        ) : (
          <>
            <div className={styles.postsList}>
              {currentPosts.map((post) => (
                <article
                  key={post.slug}
                  className={styles.post}
                  style={{
                    borderBottom: '2px solid var(--color-accent)',
                    paddingBottom: '2rem',
                    marginBottom: '2.5rem',
                  }}
                >
                  <div className={styles.postMeta}>
                    <div className={styles.postDate}>{formatDate(post.date)}</div>
                    <span className={styles.postCategory}>
                      {post.category === 'tech' ? 'Tech' : 'Life'}
                    </span>
                  </div>
                  <h2 className={styles.postTitle}>
                    <Link href={`/blog/${post.slug}`} className={styles.postTitleLink}>
                      {post.title}
                    </Link>
                  </h2>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className={styles.readMoreLink}>
                    Read more
                  </Link>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={styles.paginationButton}
                  aria-label="Previous page"
                >
                  <ChevronLeft className={styles.paginationIcon} />
                </button>

                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goToPage(i + 1)}
                      className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.activePage : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={styles.paginationButton}
                  aria-label="Next page"
                >
                  <ChevronRight className={styles.paginationIcon} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
