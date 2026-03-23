import { useState } from "react";
import axios from "axios";
import Flashcards from "./components/Flashcards";
import Summary from "./components/Summary";
import Quiz from "./components/Quiz";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studyData, setStudyData] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic to study.");
      return;
    }
    setLoading(true);
    setError(null);
    setStudyData(null);

    try {
      const response = await axios.post(`http://localhost:3001/api/generate`, {
        topic: topic,
      });
      setStudyData(response.data.data);
      setActiveTab("summary");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) handleGenerate();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-icon">📚</div>
        <h1>AI Study Buddy</h1>
        <p>Enter any topic and instantly get flashcards, a summary, and a quiz</p>
      </header>

      <section className="input-section">
        <div className="input-row">
          <input
            type="text"
            className="topic-input"
            placeholder="e.g. Photosynthesis, World War 2, Black holes..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className={`generate-btn ${loading ? "loading" : ""}`}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate ✨"}
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        {loading && (
          <div className="loading-box">
            <div className="spinner"></div>
            <span>AI is generating your study materials...</span>
          </div>
        )}
      </section>

      {studyData && (
        <section className="results-section">
          <div className="tabs">
            <button className={`tab ${activeTab === "summary" ? "active" : ""}`} onClick={() => setActiveTab("summary")}>
              Summary
            </button>
            <button className={`tab ${activeTab === "flashcards" ? "active" : ""}`} onClick={() => setActiveTab("flashcards")}>
              Flashcards ({studyData.flashcards.length})
            </button>
            <button className={`tab ${activeTab === "quiz" ? "active" : ""}`} onClick={() => setActiveTab("quiz")}>
              Quiz ({studyData.quiz.length} questions)
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "summary" && <Summary summary={studyData.summary} topic={topic} />}
            {activeTab === "flashcards" && <Flashcards flashcards={studyData.flashcards} />}
            {activeTab === "quiz" && <Quiz quiz={studyData.quiz} />}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;