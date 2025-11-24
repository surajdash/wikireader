import { createContext } from "react";

/**
 * Theme Context Interface
 * 
 * Provides theme state and toggle functionality throughout the app.
 */
interface ThemeContextProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {}
});
