import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return JSON.parse(stored);
    }
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem("darkMode");
      if (stored === null) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    // Add transition class for smooth animation
    root.style.transition = "background-color 0.3s ease, color 0.3s ease";

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Clean up transition after animation completes
    const timeoutId = setTimeout(() => {
      root.style.transition = "";
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
  };

  const resetToSystemPreference = () => {
    localStorage.removeItem("darkMode");
    setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
  };

  return { isDarkMode, toggleDarkMode, resetToSystemPreference };
}
