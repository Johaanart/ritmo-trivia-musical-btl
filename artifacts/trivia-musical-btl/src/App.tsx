import { useEffect } from 'react';
import { ArrowRight, Headphones, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { AnswerOption } from './components/AnswerOption';
import { AudioDeck } from './components/AudioDeck';
import { useTriviaGame } from './hooks/useTriviaGame';
import type { TriviaGameState } from './hooks/useTriviaGame';

const letters = ['A', 'B', 'C', 'D'];

function BrandHeader() {
  return (
    <header className="topbar">
      <div className="brand" aria-label="Ritmo, trivia musical">
        <span className="brand-mark" aria-hidden="true"><Volume2 size={19} /></span>
        <span>
          <span className="brand-name">Ritmo</span>
          <span className="brand-caption">Trivia musical</span>
        </span>
      </div>
      <span className="edition-pill"><span className="live-dot" /> Edición para jugar en vivo</span>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>Escucha. Elige. Suma.</span>
      <span>Una activación para compartir</span>
    </footer>
  );
}

function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="screen">
      <div className="hero-grid">
        <section className="hero-copy" aria-labelledby="welcome-title">
          <div className="eyebrow"><span className="eyebrow-line" /> El reto empieza aquí</div>
          <h1 className="hero-title" id="welcome-title">¿Cuánto<br />suena en<br /><em>tu cabeza?</em></h1>
          <p className="hero-description">
            Escucha cada pista, reconoce la canción y elige tu respuesta antes de que termine el tiempo.
          </p>
          <div className="hero-instructions" aria-label="Instrucciones">
            <span className="instruction"><span className="instruction-number">01</span> Escucha la pista</span>
            <span className="instruction"><span className="instruction-number">02</span> Elige una de 4</span>
            <span className="instruction"><span className="instruction-number">03</span> Suma puntos</span>
          </div>
          <button className="primary-button" type="button" onClick={onStart} data-testid="button-start-game">
            Empezar partida <ArrowRight size={17} aria-hidden="true" />
          </button>
          <p className="hero-note">5 preguntas · 15 segundos por pista · Responde con A, B, C o D</p>
        </section>
        <aside className="visual-card" aria-label="Ilustración de una onda sonora">
          <div className="visual-top"><span>Prueba de oído</span><span>01 / 05</span></div>
          <div className="visual-center" aria-hidden="true">
            {[32, 56, 82, 46, 96, 68, 38, 72, 50, 88, 43, 65, 92, 48, 77, 35, 58, 84, 44, 69, 98, 54, 75, 38, 62, 89, 47, 71, 54, 93, 40, 66, 81, 48].map((height, index) => (
              <span className="soundbar" key={index} style={{ height: `${height}%`, animationDelay: `${(index % 8) * -0.16}s` }} />
            ))}
            <span className="visual-stamp"><strong>Play<br />it<br />back</strong><span>RITMO / BTL</span></span>
          </div>
          <div className="visual-bottom"><span>Tu oído manda</span><span>Vol. 01</span></div>
        </aside>
      </div>
    </main>
  );
}

function GameScreen({ game }: { game: TriviaGameState }) {
  const {
    question, questionIndex, totalQuestions, score, secondsLeft, isPlaying,
    selectedAnswer, answered, timedOut, chooseAnswer, togglePlayback, nextQuestion,
  } = game;
  const correct = question.answer;
  const hasSelectedCorrect = selectedAnswer === correct;
  const percent = ((questionIndex + 1) / totalQuestions) * 100;
  const timerPercent = (secondsLeft / 15) * 100;

  return (
    <main className="screen game-screen">
      <div className="game-topline">
        <h1 className="game-title">Ritmo / Ronda en curso</h1>
        <div className="score-chip" data-testid="text-score"><span>Puntaje</span><strong>{score}</strong></div>
      </div>
      <div className="progress-wrap" aria-label={`Pregunta ${questionIndex + 1} de ${totalQuestions}`}>
        <div className="progress-label">
          <span>Pregunta {String(questionIndex + 1).padStart(2, '0')} <span aria-hidden="true">/</span> {String(totalQuestions).padStart(2, '0')}</span>
          <span>{Math.round(percent)}% completado</span>
        </div>
        <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={questionIndex + 1} aria-label="Progreso de preguntas">
          <div className="progress-value" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="game-layout">
        <section className="listen-panel" aria-labelledby="question-title">
          <div className="question-kicker"><Headphones size={13} aria-hidden="true" /> Momento de escuchar</div>
          <h2 className="question-title" id="question-title">{question.prompt}</h2>
          <p className="question-hint">{question.hint}</p>
          <AudioDeck
            isPlaying={isPlaying}
            onToggle={togglePlayback}
            onPlaybackComplete={game.stopPlayback}
            disabled={answered}
            audioSrc={question.audioSrc}
            demoMelody={question.demoMelody}
          />
          <div className="timer-box" aria-live="off">
            <span className="timer-copy">Tiempo para responder</span>
            <span className={`timer-number${secondsLeft <= 5 ? ' is-low' : ''}`} data-testid="text-timer">
              00:{String(secondsLeft).padStart(2, '0')}
            </span>
          </div>
          <div className="timer-track" role="progressbar" aria-label="Tiempo restante" aria-valuemin={0} aria-valuemax={15} aria-valuenow={secondsLeft}>
            <div className="timer-fill" style={{ width: `${timerPercent}%` }} />
          </div>
        </section>

        <section className="answers-panel" aria-labelledby="answers-heading">
          <h2 className="answers-heading" id="answers-heading">Elige una respuesta</h2>
          <div className="answer-list" role="group" aria-label="Opciones de canción">
            {question.options.map((answer, index) => {
              let state: '' | 'correct' | 'wrong' = '';
              if (answered && index === correct) state = 'correct';
              else if (index === selectedAnswer) state = 'wrong';
              return (
                <AnswerOption
                  key={`${question.id}-${index}`}
                  answer={answer}
                  index={index}
                  state={state}
                  selected={index === selectedAnswer}
                  disabled={answered}
                  onChoose={chooseAnswer}
                />
              );
            })}
          </div>
          <div className="answer-feedback" aria-live="polite" data-testid="status-answer-feedback">
            {answered ? (
              <>
                <p className="feedback-copy">
                  {timedOut ? 'Se acabó el tiempo.' : hasSelectedCorrect ? '¡Eso era! Buen oído.' : 'No era esa esta vez.'}
                  <span>
                    {timedOut
                      ? `La respuesta era ${question.options[correct]}.`
                      : hasSelectedCorrect
                        ? `+${100 + Math.max(secondsLeft, 0) * 10} puntos · ${question.options[correct]}`
                        : `La respuesta era ${question.options[correct]}.`}
                  </span>
                </p>
                <button className="next-button" type="button" onClick={nextQuestion} data-testid="button-next-question">
                  {questionIndex === totalQuestions - 1 ? 'Ver resultados' : 'Siguiente'} <ArrowRight size={14} aria-hidden="true" />
                </button>
              </>
            ) : (
              <p className="feedback-copy">¿La reconoces? Elige tu respuesta<span>Una vez elegida, no se puede cambiar.</span></p>
            )}
          </div>
          <p className="keyboard-hint" aria-hidden="true">
            <span className="keyboard-key">A</span><span className="keyboard-key">B</span><span className="keyboard-key">C</span><span className="keyboard-key">D</span>
            responde · <span className="keyboard-key">Espacio</span> pausa o reanuda
          </p>
        </section>
      </div>
    </main>
  );
}

function ResultsScreen({ game }: { game: TriviaGameState }) {
  const accuracy = Math.round((game.answersCorrect / game.totalQuestions) * 100);
  let title = 'El ritmo es tuyo.';
  let description = 'Tienes oído para esto. Una vuelta más y seguro reconoces hasta la última pista.';
  if (game.answersCorrect <= 1) {
    title = 'Buen comienzo.';
    description = 'Cada canción deja una pista. Vuelve a jugar y afina ese oído para la próxima ronda.';
  } else if (game.answersCorrect >= 4) {
    title = 'Oído de primera.';
    description = 'Reconociste casi todas. Ese oído merece una ovación y otra partida.';
  }
  return (
    <main className="screen result-screen">
      <section className="result-card" aria-labelledby="result-title">
        <div className="eyebrow"><span className="eyebrow-line" /> Fin de la partida</div>
        <div className="result-score" data-testid="text-final-score">{game.score}<small>PTS</small></div>
        <h1 className="result-title" id="result-title">{title}</h1>
        <p className="result-description">{description}</p>
        <div className="result-summary">
          <div className="summary-item">
            <span className="summary-value" data-testid="text-correct-count">{game.answersCorrect}/{game.totalQuestions}</span>
            <span className="summary-label">Aciertos</span>
          </div>
          <div className="summary-item">
            <span className="summary-value" data-testid="text-accuracy">{accuracy}%</span>
            <span className="summary-label">Precisión</span>
          </div>
          <div className="summary-item">
            <span className="summary-value">{game.totalQuestions}</span>
            <span className="summary-label">Pistas</span>
          </div>
        </div>
        <div className="result-actions">
          <button className="primary-button" type="button" onClick={game.startGame} data-testid="button-play-again">
            <RotateCcw size={16} aria-hidden="true" /> Jugar otra vez
          </button>
          <span className="result-replay-hint"><Sparkles size={13} aria-hidden="true" /> El marcador vuelve a cero</span>
        </div>
      </section>
    </main>
  );
}

function App() {
  const game = useTriviaGame();

  useEffect(() => {
    if (game.screen !== 'game' || game.answered) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isButton = target instanceof HTMLElement && target.closest('button');
      const isEditable = target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"]');
      if (event.code === 'Space' && !isButton) {
        event.preventDefault();
        game.togglePlayback();
        return;
      }
      if (isEditable || event.altKey || event.ctrlKey || event.metaKey) return;
      const answerIndex = letters.indexOf(event.key.toUpperCase());
      if (answerIndex !== -1) {
        event.preventDefault();
        game.chooseAnswer(answerIndex);
      } else if (/^[1-4]$/.test(event.key)) {
        event.preventDefault();
        game.chooseAnswer(Number(event.key) - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [game.screen, game.answered, game.togglePlayback, game.chooseAnswer]);

  return (
    <div className="app-shell">
      <BrandHeader />
      <div className="stage">
        {game.screen === 'home' && <HomeScreen onStart={game.startGame} />}
        {game.screen === 'game' && <GameScreen game={game} />}
        {game.screen === 'results' && <ResultsScreen game={game} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
