import { useState } from "react";

function FlashCard({ front, back, index }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          <span className="card-number">Card {index + 1}</span>
          <p className="card-text">{front}</p>
          <span className="flip-hint">Click to reveal answer</span>
        </div>
        <div className="flashcard-back">
          <span className="card-number">Answer</span>
          <p className="card-text">{back}</p>
          <span className="flip-hint">Click to go back</span>
        </div>
      </div>
    </div>
  );
}

function Flashcards({ flashcards }) {
  return (
    <div className="flashcards-container">
      <h2 className="section-title">Flashcards</h2>
      <p className="section-hint">Click any card to flip it and see the answer</p>
      <div className="flashcards-grid">
        {flashcards.map((card, index) => (
          <FlashCard key={index} front={card.front} back={card.back} index={index} />
        ))}
      </div>
    </div>
  );
}
export default Flashcards;