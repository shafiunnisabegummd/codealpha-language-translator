import { useState } from "react";
import Translation from "./components/Translation";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("codealpha-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  function toggleDarkMode(value) {
    setDarkMode(value);

    try {
      localStorage.setItem("codealpha-dark-mode", String(value));
    } catch {
      // Theme still works for the current session.
    }
  }

  return (
    <div className={`app ${darkMode ? "dark-mode" : ""}`}>
      <header className="header">
        <div className="brand-mark">CA</div>
        <h1>CodeAlpha AI Projects</h1>
        <p>Artificial Intelligence Internship</p>
      </header>

      <main className="content">
        <Translation
          darkMode={darkMode}
          setDarkMode={toggleDarkMode}
        />
      </main>

      <footer>
        <p>Built for CodeAlpha AI Internship</p>
        <span>Language Translator · Powered by MyMemory</span>
      </footer>
    </div>
  );
}