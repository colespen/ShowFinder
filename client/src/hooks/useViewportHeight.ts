import { useEffect, useCallback } from 'react';

/**
 * viewport height handling on mobile browsers
 * CSS dvh units with React fallback (addresses iOS Chrome/Safari toolbar overlap issues)
 */
export const useViewportHeight = (): void => {
  const updateViewportHeight = useCallback((): void => {
    // set CSS custom property for fallback browsers
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  useEffect(() => {
    // initial setup for fallback browsers
    updateViewportHeight();

    // debounced handler for performance
    let timeoutId: NodeJS.Timeout | null = null;
    const debouncedUpdate = (): void => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewportHeight, 100);
    };

    // event listeners with passive option for better performance
    window.addEventListener('resize', debouncedUpdate, { passive: true });
    window.addEventListener('orientationchange', debouncedUpdate, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, [updateViewportHeight]);
};