'use client';

import type { Variants } from 'framer-motion';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import styles from './mainContentWrapper.module.css';

// Simple particles component without complex hooks
const SimpleParticles = () => {
  // const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate particles
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleCount = isMobile ? 20 : 40;
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 20,
        duration: 60 + Math.random() * 120,
        delay: Math.random() * 10,
        type: Math.floor(Math.random() * 4), // 0: circle, 1: square, 2: triangle, 3: custom
        opacity: 0.05 + Math.random() * 0.15, // Increased opacity for more pop
        color:
          i % 6 === 0
            ? '#FF6B6B'
            : // Hot pink
              i % 6 === 1
              ? '#4ECDC4'
              : // Turquoise
                i % 6 === 2
                ? '#FFD166'
                : // Yellow
                  i % 6 === 3
                  ? '#FF9A8B'
                  : // Salmon
                    i % 6 === 4
                    ? '#A78BFA'
                    : // Purple
                      '#06D6A0', // Mint
        blur: Math.random() > 0.7 ? `${Math.random() * 5}px` : '0px',
      };
    });
  }, [particleCount]);

  if (!mounted) return null;

  return (
    <div className={styles.particleSystem}>
      {particles.map((particle) => {
        // Different animation paths for variety
        const animationPath = {
          x: [
            `${particle.x}%`,
            `${particle.x + (Math.random() * 15 - 7.5)}%`,
            `${particle.x - (Math.random() * 10 - 5)}%`,
            `${particle.x}%`,
          ],
          y: [
            `${particle.y}%`,
            `${particle.y - (Math.random() * 15 - 7.5)}%`,
            `${particle.y + (Math.random() * 10 - 5)}%`,
            `${particle.y}%`,
          ],
          rotate: [0, Math.random() * 180, Math.random() * -180, 0],
          scale: [1, Math.random() * 0.5 + 0.8, 1],
        };

        return (
          <motion.div
            key={particle.id}
            className={`${styles.particle} ${
              particle.type === 0
                ? styles.circle
                : particle.type === 1
                  ? styles.square
                  : particle.type === 2
                    ? styles.triangle
                    : styles.custom
            }`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              filter: `blur(${particle.blur})`,
            }}
            animate={animationPath}
            transition={{
              duration: particle.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: particle.delay,
            }}
          />
        );
      })}
    </div>
  );
};

// Simplified gradient overlay
const SimpleGradientOverlay = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  // Define more colorful pop-style gradient animations
  const gradientVariants: Variants = {
    initial: {
      background: isDark
        ? 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.15) 0%, rgba(0, 0, 0, 0) 50%)'
        : 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.1) 0%, rgba(255, 255, 255, 0) 50%)',
    },
    animate: {
      background: [
        isDark
          ? 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
        isDark
          ? 'radial-gradient(circle at 80% 80%, rgba(135, 206, 250, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 80% 80%, rgba(135, 206, 250, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
        isDark
          ? 'radial-gradient(circle at 50% 50%, rgba(127, 255, 212, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 50% 50%, rgba(127, 255, 212, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
        isDark
          ? 'radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
        isDark
          ? 'radial-gradient(circle at 80% 20%, rgba(255, 182, 193, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 80% 20%, rgba(255, 182, 193, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
        isDark
          ? 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.15) 0%, rgba(0, 0, 0, 0) 60%)'
          : 'radial-gradient(circle at 20% 20%, rgba(255, 105, 180, 0.1) 0%, rgba(255, 255, 255, 0) 60%)',
      ],
      transition: {
        duration: 30,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
        ease: 'linear',
      },
    },
  };

  // Second layer with different timing and colors
  const secondGradientVariants: Variants = {
    initial: {
      background: isDark
        ? 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 40%)'
        : 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.07) 0%, rgba(255, 255, 255, 0) 40%)',
    },
    animate: {
      background: [
        isDark
          ? 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
          : 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
        isDark
          ? 'radial-gradient(circle at 20% 30%, rgba(135, 206, 250, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
          : 'radial-gradient(circle at 20% 30%, rgba(135, 206, 250, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
        isDark
          ? 'radial-gradient(circle at 40% 70%, rgba(255, 182, 193, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
          : 'radial-gradient(circle at 40% 70%, rgba(255, 182, 193, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
        isDark
          ? 'radial-gradient(circle at 60% 20%, rgba(127, 255, 212, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
          : 'radial-gradient(circle at 60% 20%, rgba(127, 255, 212, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
        isDark
          ? 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 50%)'
          : 'radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.07) 0%, rgba(255, 255, 255, 0) 50%)',
      ],
      transition: {
        duration: 25,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: 'loop',
        ease: 'linear',
      },
    },
  };

  return (
    <>
      <motion.div
        className={styles.gradientOverlay}
        variants={gradientVariants}
        initial="initial"
        animate="animate"
      />
      <motion.div
        className={styles.gradientOverlaySecond}
        variants={secondGradientVariants}
        initial="initial"
        animate="animate"
      />
      <div className={styles.noiseBg}></div>
    </>
  );
};

// 3D Grid effect component
const Grid3DEffect = () => {
  // const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.grid3dContainer}>
      <div className={styles.grid3d}>
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className={styles.grid3dRow}>
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <motion.div
                key={`cell-${rowIndex}-${colIndex}`}
                className={styles.grid3dCell}
                initial={{ opacity: 0.1, scale: 0.95 }}
                animate={{
                  opacity: [0.1, 0.2, 0.1],
                  scale: [0.95, 1, 0.95],
                  rotateX: [0, 5, 0],
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: rowIndex * 0.2 + colIndex * 0.3,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Emoji floaters component
const EmojiFloaters = () => {
  const emojis = ['✨', '🚀', '💻', '🎨', '⚡'];

  return (
    <div className={styles.emojiFloaters}>
      {emojis.map((emoji, i) => (
        <motion.div
          key={`emoji-${i}`}
          className={styles.floatingEmoji}
          initial={{ opacity: 0.7, y: 0 }}
          animate={{
            opacity: [0.7, 0.9, 0.7],
            y: [0, -15, 0],
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
          }}
          transition={{
            duration: 3 + i,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  );
};

// Colorful shapes component
const ColorfulShapes = () => {
  return (
    <div className={styles.colorfulShapes}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`shape-${i}`}
          className={`${styles.popShape} ${styles[`shape${i % 4}`]}`}
        ></div>
      ))}
    </div>
  );
};

export default function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);
  return (
    <main className={styles.main}>
      <div className={styles.popGradientBackground}></div>
      <ColorfulShapes />
      <Grid3DEffect />
      {isVisible ?? <SimpleParticles />}
      <SimpleGradientOverlay />
      <EmojiFloaters />
      <div className={styles.content}>{children}</div>
    </main>
  );
}
