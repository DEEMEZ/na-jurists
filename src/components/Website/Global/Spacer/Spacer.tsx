"use client";

import { useEffect, useRef } from 'react';

interface SpacerProps {
  height?: number;
  showPattern?: boolean;
}

const Spacer = ({ height = 60, showPattern = true }: SpacerProps) => {
  const patternRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Subtle parallax scrolling effect for pattern
    const handleScroll = () => {
      if (patternRef.current) {
        const scrollPosition = window.scrollY;
        const rect = patternRef.current.getBoundingClientRect();
        const offsetTop = rect.top + scrollPosition;
        const relativeScroll = scrollPosition - offsetTop;
        patternRef.current.style.transform = `translateY(${relativeScroll * 0.05}px)`;
      }
    };

    if (showPattern) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showPattern]);

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      {showPattern && (
        <div 
          ref={patternRef}
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px',
          }}
        />
      )}
    </div>
  );
};

export default Spacer;