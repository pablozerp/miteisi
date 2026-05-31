'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Template({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP Page Transition
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    });

    return () => ctx.revert(); // Cleanup on unmount
  }, []);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}
