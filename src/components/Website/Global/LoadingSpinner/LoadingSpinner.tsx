"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set isMounted to true only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      setIsLoading(false);
    }
  }, [pathname, searchParams, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // Only show spinner for internal navigation links
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        setIsLoading(true);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isMounted]);

  // Don't render anything on the server
  if (!isMounted || !isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
    </div>
  );
};

export default LoadingSpinner;