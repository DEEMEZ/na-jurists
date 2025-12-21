"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

const LoadingSpinner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set isMounted to true only on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setIsLoading(false);
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, [pathname, searchParams, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      // Only show spinner for internal navigation links
      if (!link || !link.href) return;

      // Ignore new-tab links
      if (link.target === '_blank') return;

      const linkUrl = new URL(link.href);
      const currentUrl = new URL(window.location.href);
      const isInternal = linkUrl.origin === currentUrl.origin;
      const isSameRoute = linkUrl.pathname === currentUrl.pathname && linkUrl.search === currentUrl.search;

      // Avoid locking the spinner when clicking a link to the current page
      if (isInternal && !isSameRoute) {
        setIsLoading(true);
        // Fail-safe in case the navigation is cancelled or errors
        hideTimer.current = setTimeout(() => setIsLoading(false), 2000);
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
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
