import { useEffect, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

const bars = [16, 26, 11, 35, 22, 48, 19, 33, 13, 46, 28, 17, 39, 22, 50, 15, 29, 41, 18, 33, 13, 44, 25, 37, 16, 48, 22, 34, 12, 40, 25, 17, 36, 49, 21, 31, 14, 43, 26, 38, 18, 45, 22, 32, 13, 40, 19, 29];
const BEAT_SECONDS = 0.34;

export function AudioDeck({ isPlaying, onToggle, onPlaybackComplete, disabled, audioSrc, demoMelody }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audioSrc) {
      if (isPlaying) {
        audio?.play().catch(onPlaybackComplete);
      } else {
        audio?.pause();
      }
      return () => audio?.pause();
    }

    if (!isPlaying || !demoMelody?.length) return undefined;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      onPlaybackComplete();
      return undefined;
    }

    const context = new AudioContextConstructor();
    const oscillators = [];
    let completionTimer;
    let cancelled = false;

    context.resume().then(() => {
      if (cancelled) {
        context.close();
        return;
      }
      let startAt = context.currentTime + 0.06;
      for (const [midiNote, beats] of demoMelody) {
        const duration = beats * BEAT_SECONDS;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 440 * (2 ** ((midiNote - 69) / 12));
        envelope.gain.setValueAtTime(0.0001, startAt);
        envelope.gain.exponentialRampToValueAtTime(0.12, startAt + 0.025);
        envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration - 0.015);
        oscillator.connect(envelope);
        envelope.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration);
        oscillators.push(oscillator);
        startAt += duration + 0.035;
      }
      completionTimer = window.setTimeout(onPlaybackComplete, Math.max(0, (startAt - context.currentTime) * 1000));
    }).catch(onPlaybackComplete);

    return () => {
      cancelled = true;
      window.clearTimeout(completionTimer);
      oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // The note may already have finished.
        }
      });
      context.close();
    };
  }, [audioSrc, demoMelody, isPlaying, onPlaybackComplete]);

  return (
    <div className="audio-console" data-testid="audio-player">
      <div className="audio-status">
        <span className="audio-status-label">{audioSrc ? 'Pista local' : 'Demo sintética local'}</span>
        <span aria-live="polite">{isPlaying ? 'En curso' : disabled ? 'Finalizada' : 'En pausa'}</span>
      </div>
      {audioSrc && (
        <audio ref={audioRef} src={audioSrc} preload="metadata" onEnded={onPlaybackComplete} />
      )}
      <div className="audio-placeholder" role="img" aria-label="Visualización de audio de demostración, archivo de audio pendiente">
        {bars.map((height, index) => (
          <span
            className={`audio-wave${isPlaying ? ' is-playing' : ''}`}
            key={`${height}-${index}`}
            style={{ height: `${height}px`, animationDelay: `${(index % 7) * -0.13}s` }}
          />
        ))}
      </div>
      <p className="audio-pending">
        {audioSrc ? 'Reproduciendo archivo local asociado' : 'Melodía sintética de prueba · grabación real pendiente'}
      </p>
      <button
        className="audio-control"
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Pausar pista' : 'Reproducir muestra de audio'}
        data-testid="button-toggle-playback"
      >
        {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        {isPlaying ? 'Pausar' : 'Reproducir muestra'}
      </button>
    </div>
  );
}
