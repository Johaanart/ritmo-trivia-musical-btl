export function AnswerOption({ answer, index, state, selected, disabled, onChoose }) {
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <button
      type="button"
      className={`answer-option${state ? ` is-${state}` : ''}`}
      onClick={() => onChoose(index)}
      disabled={disabled}
      aria-pressed={selected}
      data-testid={`button-answer-${index}`}
    >
      <span className="answer-letter" aria-hidden="true">{letters[index]}</span>
      <span className="answer-text">{answer}</span>
    </button>
  );
}
