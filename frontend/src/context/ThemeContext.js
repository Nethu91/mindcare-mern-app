import React, { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem("app-theme") || "light"
  );

  useEffect(() => {
    // Theme is stored on <html> as data-theme="light" | "dark"
    document.documentElement.setAttribute("data-theme", theme);

    // Make sure the old body class from the earlier version is gone
    document.body.classList.remove("dark-mode");

    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};