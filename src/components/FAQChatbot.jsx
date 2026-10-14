import { useState } from "react";

function FAQChatbot() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! 👋 I'm your FAQ Assistant. Ask me a question."
    }
  ]);

  async function askQuestion() {
    const userQuestion = question.trim();

    if (!userQuestion || loading) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userQuestion }
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/faq",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: userQuestion
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: data.answer || "No answer was found."
        }
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "Unable to connect to the chatbot server. Please check that the backend is running."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card chatbot-card">
      <div className="task-title">
        <span className="icon">🤖</span>
        <div>
          <h2>FAQ Chatbot</h2>
          <p>Ask a question and get a relevant answer.</p>
        </div>
      </div>

      <div className="chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.sender === "user"
                ? "message user-message"
                : "message bot-message"
            }
          >
            <strong>
              {message.sender === "user" ? "You" : "FAQ Assistant"}
            </strong>
            <p>{message.text}</p>
          </div>
        ))}

        {loading && (
          <div className="message bot-message">
            <p>Thinking...</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              askQuestion();
            }
          }}
          placeholder="Type your question here..."
          rows={2}
        />

        <button
          className="primary-button"
          onClick={askQuestion}
          disabled={loading || !question.trim()}
        >
          {loading ? "Please wait..." : "Send"}
        </button>
      </div>

      <p>Try: What is artificial intelligence?</p>
    </section>
  );
}

export default FAQChatbot;