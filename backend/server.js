const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Test the backend
app.get("/", (req, res) => {
  res.json({
    message: "CodeAlpha AI Backend is running!"
  });
});

// TASK 1: Language Translation
app.post("/api/translate", async (req, res) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;

    if (!text?.trim() || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: "Enter text and select a target language."
      });
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        success: false,
        message: "Configure your Google Translation API key in backend/.env."
      });
    }

    const response = await axios.post(
      "https://translation.googleapis.com/language/translate/v2",
      null,
      {
        params: {
          q: text,
          target: targetLanguage,
          source: sourceLanguage || undefined,
          format: "text",
          key: apiKey
        }
      }
    );

    res.json({
      success: true,
      translatedText:
        response.data.data.translations[0].translatedText
    });
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      message: "Translation failed. Check your API setup and try again."
    });
  }
});

// TASK 2: FAQ Chatbot
const faqs = [
  {
    question: "What is CodeAlpha?",
    answer: "CodeAlpha provides internship and learning opportunities for students and aspiring professionals."
  },
  {
    question: "What is artificial intelligence?",
    answer: "Artificial Intelligence is a field of computer science that enables machines to perform tasks that normally require human intelligence."
  },
  {
    question: "What is machine learning?",
    answer: "Machine Learning is a branch of AI in which computers learn patterns from data."
  },
  {
    question: "How do I submit my internship task?",
    answer: "Follow the instructions provided by your internship organization, prepare your project, and submit it through the official submission process."
  },
  {
    question: "What is GitHub?",
    answer: "GitHub is a platform for storing, managing, and collaborating on software projects using Git."
  },
  {
    question: "What is an internship?",
    answer: "An internship is a practical learning experience that helps students gain professional skills."
  }
];

function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(word => word.length > 1);
}

function cosineSimilarity(a, b) {
  const words = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, normA = 0, normB = 0;

  for (const word of words) {
    const x = a[word] || 0;
    const y = b[word] || 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  return normA && normB
    ? dot / (Math.sqrt(normA) * Math.sqrt(normB))
    : 0;
}

app.post("/api/faq", (req, res) => {
  const { question } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter a question."
    });
  }

  const documents = [
    ...faqs.map(faq => tokenize(faq.question)),
    tokenize(question)
  ];

  const allWords = new Set(documents.flat());
  const idf = {};

  for (const word of allWords) {
    const count = documents.filter(doc => doc.includes(word)).length;
    idf[word] = Math.log(1 + documents.length / (1 + count));
  }

  function vectorize(tokens) {
    const vector = {};
    for (const word of tokens) {
      vector[word] = (vector[word] || 0) + 1;
    }
    for (const word of Object.keys(vector)) {
      vector[word] = vector[word] / tokens.length * idf[word];
    }
    return vector;
  }

  const userVector = vectorize(documents[documents.length - 1]);
  let bestFaq = null;
  let bestScore = 0;

  faqs.forEach((faq, index) => {
    const score = cosineSimilarity(
      userVector,
      vectorize(documents[index])
    );

    if (score > bestScore) {
      bestScore = score;
      bestFaq = faq;
    }
  });

  if (!bestFaq || bestScore < 0.15) {
    return res.json({
      success: true,
      answer: "Sorry, I couldn't find a matching FAQ. Try asking in a different way.",
      confidence: 0
    });
  }

  res.json({
    success: true,
    matchedQuestion: bestFaq.question,
    answer: bestFaq.answer,
    confidence: Math.round(bestScore * 100)
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});