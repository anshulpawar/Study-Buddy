import { useState } from "react";

function Quiz({ quiz }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (qIndex, oIndex) => {
    if (submitted) return;
    setAnswers({ ...answers, [qIndex]: oIndex });
  };

  const getScore = () => quiz.filter((q, i) => answers[i] === q.correct).length;

  const getOptionClass = (qIndex, oIndex, correctIndex) => {
    if (!submitted) return answers[qIndex] === oIndex ? "option selected" : "option";
    if (oIndex === correctIndex) return "option correct";
    if (answers[qIndex] === oIndex) return "option wrong";
    return "option";
  };

  const allAnswered = Object.keys(answers).length === quiz.length;
  const score = submitted ? getScore() : null;

  return (
    <div className="quiz-container">
      <h2 className="section-title">Quiz</h2>

      {quiz.map((q, qIndex) => (
        <div key={qIndex} className="question-block">
          <p className="question-text">
            <span className="question-number">Q{qIndex + 1}.</span> {q.question}
          </p>
          <div className="options-grid">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                className={getOptionClass(qIndex, oIndex, q.correct)}
                onClick={() => handleSelect(qIndex, oIndex)}
              >
                <span className="option-letter">{["A", "B", "C", "D"][oIndex]}</span>
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          className={`submit-btn ${!allAnswered ? "disabled" : ""}`}
          onClick={() => allAnswered && setSubmitted(true)}
          disabled={!allAnswered}
        >
          {allAnswered ? "Submit Answers" : `Answer all ${quiz.length} questions to submit`}
        </button>
      )}

      {submitted && (
        <div className={`score-box ${score === quiz.length ? "perfect" : score >= quiz.length / 2 ? "good" : "low"}`}>
          <span className="score-number">{score}/{quiz.length}</span>
          <span className="score-label">
            {score === quiz.length ? "Perfect score!" : score >= quiz.length / 2 ? "Good job! Review the ones you missed." : "Keep studying — you'll get it!"}
          </span>
        </div>
      )}
    </div>
  );
}
export default Quiz;