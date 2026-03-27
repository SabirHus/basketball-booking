import { useState, useEffect } from "react";

const DarkModeToggle = ({ customStyle }) => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button 
      className="dark-mode-toggle" 
      onClick={() => setDarkMode(!darkMode)}
      title="Toggle Dark/Light Mode"
      // If a custom style is passed, use it. Otherwise, float top-right.
      style={customStyle || { position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
};

export default DarkModeToggle;