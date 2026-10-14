import { useState } from "react";
import Translation from "./components/Translation";
import FAQChatbot from "./components/FAQChatbot";
import "./App.css";

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("codealpha-dark-mode") === "true";
    } catch {
      return false;
    }
  });

  const [activeTask, setActiveTask] = useState("translation");

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

      <nav className="task-navigation">
        <button
          className={activeTask === "translation" ? "active" : ""}
          onClick={() => setActiveTask("translation")}
        >
          🌐 Language Translator
        </button>

        <button
          className={activeTask === "faq" ? "active" : ""}
          onClick={() => setActiveTask("faq")}
        >
          🤖 FAQ Chatbot
        </button>
      </nav>

      <main className="content">
        {activeTask === "translation" && (
          <Translation
            darkMode={darkMode}
            setDarkMode={toggleDarkMode}
          />
        )}

        {activeTask === "faq" && <FAQChatbot />}
      </main>

      <footer>
        <p>Built for CodeAlpha AI Internship</p>
        <span>Language Translator · FAQ Chatbot</span>
      </footer>
    </div>
  );
}