import { useEffect, useState } from "react";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "de", name: "German" },
];

export default function Translation({ darkMode, setDarkMode }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("en");
  const [target, setTarget] = useState("te");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("codealpha-translation-history") || "[]"
      );
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "codealpha-translation-history",
        JSON.stringify(history)
      );
    } catch {
      // History still works for the current session.
    }
  }, [history]);

  function swapLanguages() {
    setSource(target);
    setTarget(source);
    setText(result || text);
    setResult(text);
    setError("");
  }

  async function translate() {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    if (source === target) {
      setResult(text);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const params = new URLSearchParams({
        q: text,
        langpair: `${source}|${target}`,
      });

      const response = await fetch(
        `https://api.mymemory.translated.net/get?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Translation service unavailable. Try again.");
      }

      const data = await response.json();
      const translated = data?.responseData?.translatedText;

      if (!translated || Number(data.responseStatus) !== 200) {
        throw new Error(
          data.responseDetails || "Translation failed. Please try again."
        );
      }

      setResult(translated);

      const entry = {
        id: `${Date.now()}-${Math.random()}`,
        text,
        source,
        target,
        translatedText: translated,
        date: new Date().toLocaleString(),
      };

      setHistory((previous) => [
        entry,
        ...previous.filter(
          (item) =>
            !(
              item.text === entry.text &&
              item.source === entry.source &&
              item.target === entry.target
            )
        ),
      ].slice(0, 20));
    } catch (err) {
      setError(err.message || "Could not connect. Check your internet.");
    } finally {
      setLoading(false);
    }
  }

  function reuseTranslation(item) {
    setText(item.text);
    setSource(item.source);
    setTarget(item.target);
    setResult(item.translatedText);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearHistory() {
    setHistory([]);
  }

  function speakResult() {
    if (!result || !("speechSynthesis" in window)) {
      setError("Speech playback is not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(result);
    const language = languages.find((item) => item.code === target);
    speech.lang = language ? language.code : "en";
    window.speechSynthesis.speak(speech);
  }

  async function copyResult(value) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Copy failed. Please select and copy the text manually.");
    }
  }

  return (
    <section className="translator-layout">
      <div className="toolbar">
        <span className="status-label">
          <span className="status-dot" />
          FREE TRANSLATION
        </span>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <section className="card">
        <div className="card-heading">
          <div className="heading-icon">🌐</div>
          <div>
            <h2>Language Translator</h2>
            <p>Break language barriers in seconds.</p>
          </div>
        </div>

        <div className="language-row">
          <div className="language-field">
            <label htmlFor="source-language">Translate from</label>
            <select
              id="source-language"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="swap-button"
            onClick={swapLanguages}
            disabled={loading}
            aria-label="Swap languages"
            title="Swap languages"
          >
            ⇄
          </button>

          <div className="language-field">
            <label htmlFor="target-language">Translate to</label>
            <select
              id="target-language"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="input-label" htmlFor="translation-input">
          Your text
        </label>
        <textarea
          id="translation-input"
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
        />

        <div className="input-meta">
          <span>Enter the text you want to translate</span>
          <span>{text.length} characters</span>
        </div>

        <button
          type="button"
          className="translate-button"
          onClick={translate}
          disabled={loading}
        >
          {loading ? "Translating..." : "✦ Translate Text"}
        </button>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {result && (
          <div className="result-box">
            <div className="result-heading">
              <h3>Translation result</h3>
              <span className="result-badge">Completed</span>
            </div>

            <p className="translated-text">{result}</p>

            <div className="result-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => copyResult(result)}
              >
                📋 Copy
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={speakResult}
              >
                🔊 Listen
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="history-card">
        <div className="history-heading">
          <div>
            <h2>🕘 Translation History</h2>
            <p>Your 20 most recent translations are saved on this browser.</p>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={clearHistory}
            >
              Clear all
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <span>📝</span>
            <p>Your translations will appear here.</p>
            <small>Translate some text to get started.</small>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-languages">
                  {item.source.toUpperCase()} → {item.target.toUpperCase()}
                </div>

                <p className="history-original">{item.text}</p>
                <p className="history-translated">{item.translatedText}</p>

                <div className="history-footer">
                  <small>{item.date}</small>
                  <button
                    type="button"
                    className="reuse-button"
                    onClick={() => reuseTranslation(item)}
                  >
                    Reuse ↗
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}