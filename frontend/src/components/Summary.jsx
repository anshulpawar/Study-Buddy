function Summary({ summary, topic }) {
  return (
    <div className="summary-container">
      <h2 className="section-title">Summary: {topic}</h2>
      <p className="summary-text">{summary}</p>
    </div>
  );
}
export default Summary;