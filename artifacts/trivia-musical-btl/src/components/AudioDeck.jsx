import { useEffect, useRef } from 'react';
import { Pause, Play } from 'lucide-react';

const bars = [16, 26, 11, 35, 22, 48, 19, 33, 13, 46, 28, 17, 39, 22, 50, 15, 29, 41, 18, 33, 13, 44, 25, 37, 16, 48, 22, 34, 12, 40, 25, 17, 36, 49, 21, 31, 14, 43, 26, 38, 18, 45, 22, 32, 13, 40, 19, 29];
export function AudioDeck({ isPlaying, onToggle, onPlaybackComplete, onPlaybackError, disabled, audioSrc }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, [audioSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    if (isPlaying) {
      audio.play().catch(onPlaybackError);
    } else {
      audio.pause();
    }

    return () => audio.pause();
  }, [audioSrc, isPlaying, onPlaybackError]);

  return (
    <div className="audio-console" data-testid="audio-player">
      <div className="audio-status">
        <span className="audio-status-label">Pista de Supabase</span>
        <span aria-live="polite">{isPlaying ? 'En curso' : disabled ? 'Finalizada' : 'En pausa'}</span>
      </div>
      <audio
        ref={audioRef}
        src={audioSrc}
        preload="metadata"
        onEnded={onPlaybackComplete}
        onError={onPlaybackError}
      />
      <div className="audio-placeholder" role="img" aria-label="Visualización de la pista de audio">
        {bars.map((height, index) => (
          <span
            className={`audio-wave${isPlaying ? ' is-playing' : ''}`}
            key={`${height}-${index}`}
            style={{ height: `${height}px`, animationDelay: `${(index % 7) * -0.13}s` }}
          />
        ))}
      </div>
      <p className="audio-pending">Audio MP3 cargado desde la biblioteca de pistas</p>
      <button
        className="audio-control"
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? 'Pausar pista' : 'Reproducir pista'}
        data-testid="button-toggle-playback"
      >
        {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
        {isPlaying ? 'Pausar' : 'Reproducir pista'}
      </button>
    </div>
  );
}
