import { useState, useEffect } from "react";

/**
 * Custom hook to detect device orientation (portrait vs landscape)
 * Returns true when width < height (portrait mode)
 */
export function useOrientation(): boolean {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const updateOrientation = () => {
      setIsPortrait(window.innerWidth < window.innerHeight);
    };

    // Set initial orientation
    updateOrientation();

    // Listen for resize and orientation change events
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  }, []);

  return isPortrait;
}
