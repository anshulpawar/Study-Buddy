const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { topic } = req.body;

  if (!topic || topic.trim() === "") {
    return res.status(400).json({ error: "Please provide a topic." });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert tutor. Always respond with only raw valid JSON. No markdown, no code blocks, no backticks.",
        },
        {
          role: "user",
          content: `Generate study materials for this topic: "${topic}"

Respond with ONLY this JSON:
{
  "summary": "3-4 sentence summary",
  "flashcards": [
    { "front": "term", "back": "definition" },
    { "front": "term", "back": "definition" },
    { "front": "term", "back": "definition" },
    { "front": "term", "back": "definition" },
    { "front": "term", "back": "definition" }
  ],
  "quiz": [
    { "question": "question", "options": ["A","B","C","D"], "correct": 0 },
    { "question": "question", "options": ["A","B","C","D"], "correct": 1 },
    { "question": "question", "options": ["A","B","C","D"], "correct": 2 }
  ]
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    let rawText = chatCompletion.choices[0].message.content.trim();
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const studyData = JSON.parse(rawText);

    res.json({ success: true, data: studyData });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}