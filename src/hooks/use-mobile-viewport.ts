import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 640;

// Mirrors useAppliedTheme's prefers-color-scheme listener — mobile vs.
// desktop chrome is a live viewport breakpoint, not a one-time check.
export function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT}px)`,
    );
    const onChange = (event: MediaQueryListEvent) =>
      setIsMobile(event.matches);
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
