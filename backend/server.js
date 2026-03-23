// ─────────────────────────────────────────────────────────────
//  Study Buddy — Backend Server
//  Powered by Groq (free AI API)
//
//  What this file does:
//  1. Creates a web server that listens for requests
//  2. When frontend sends a topic, this calls the Groq AI API
//  3. Gets back flashcards, summary, quiz as JSON
//  4. Sends that JSON back to the frontend
// ─────────────────────────────────────────────────────────────

// STEP A: Load our secret API key from the .env file
require("dotenv").config();

// STEP B: Import the packages we installed
const express = require("express");       // creates our web server
const cors = require("cors");             // lets frontend talk to backend
const Groq = require("groq-sdk");         // lets us call the Groq AI API

// STEP C: Create the web server
const app = express();

// STEP D: Connect to Groq using our secret API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY        // reads from .env file
});

// STEP E: Tell our server to accept JSON and allow frontend requests
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────
//  ROUTE 1: Health check
//  Visit http://localhost:3001/health to confirm server works
// ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "Server is running!" });
});

// ─────────────────────────────────────────────────────────────
//  ROUTE 2: The main AI route
//  The frontend sends a POST request to /api/generate
//  with a topic, and we return AI-generated study materials
// ─────────────────────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {

  // Get the topic the user typed in the frontend
  const { topic } = req.body;

  // If they didn't send a topic, return an error
  if (!topic || topic.trim() === "") {
    return res.status(400).json({ error: "Please provide a topic." });
  }

  try {

    // ── Call the Groq AI API ──────────────────────────────────
    const chatCompletion = await groq.chat.completions.create({

      model: "llama-3.3-70b-versatile",    // the AI model to use (free)

      messages: [
        {
          // The "system" message sets the AI's behaviour
          role: "system",
          content: "You are an expert tutor. Always respond with only raw valid JSON. No markdown, no code blocks, no backticks, no explanation — just pure JSON.",
        },
        {
          // The "user" message is what we're actually asking
          role: "user",
          content: `Generate study materials for this topic: "${topic}"

Respond with ONLY this exact JSON structure, nothing else:
{
  "summary": "A clear 3-4 sentence summary of the topic",
  "flashcards": [
    { "front": "Question or term", "back": "Answer or definition" },
    { "front": "Question or term", "back": "Answer or definition" },
    { "front": "Question or term", "back": "Answer or definition" },
    { "front": "Question or term", "back": "Answer or definition" },
    { "front": "Question or term", "back": "Answer or definition" }
  ],
  "quiz": [
    {
      "question": "A multiple choice question about the topic",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0
    },
    {
      "question": "Another multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 1
    },
    {
      "question": "A third multiple choice question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 2
    }
  ]
}

Rules:
- Exactly 5 flashcards
- Exactly 3 quiz questions
- The "correct" field is the index (0, 1, 2, or 3) of the correct option
- Make everything accurate and educational for the given topic`,
        },
      ],

      temperature: 0.7,
      max_tokens: 2048,
    });

    // ── Get the AI's text response ────────────────────────────
    let rawText = chatCompletion.choices[0].message.content.trim();

    // Sometimes AI wraps response in ```json ... ``` — remove that
    rawText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // ── Convert the text into a JavaScript object ─────────────
    const studyData = JSON.parse(rawText);

    // ── Send the data back to the frontend ────────────────────
    res.json({
      success: true,
      data: studyData
    });

  } catch (error) {
    console.error("Error:", error.message);

    if (error instanceof SyntaxError) {
      return res.status(500).json({
        error: "AI returned invalid data. Please try again."
      });
    }

    res.status(500).json({
      error: "Something went wrong. Please try again.",
      details: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────
//  Start the server on port 3001
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("");
  console.log("✅ Backend server is running!");
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Test it: http://localhost:${PORT}/health`);
  console.log("");
});