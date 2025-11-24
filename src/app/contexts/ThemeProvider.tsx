import React, { useState } from "react";
import type { ReactNode } from "react";
import { ThemeContext } from "./ThemeContext";

/**
 * ThemeProvider Component
 * 
 * Provides theme state management to the entire application.
 * Wraps the app to enable theme switching between light and dark modes.
 */

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
