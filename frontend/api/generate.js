import Groq from "groq-sdk";

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
          content: "You are an expert tutor. Always respond with only raw valid JSON. No markdown, no code blocks, no backticks, no explanation — just pure JSON.",
        },
        {
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
- Make everything accurate and educational`,
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
    if (error instanceof SyntaxError) {
      return res.status(500).json({ error: "AI returned invalid data. Please try again." });
    }
    res.status(500).json({ error: "Something went wrong. Please try again.", details: error.message });
  }
}