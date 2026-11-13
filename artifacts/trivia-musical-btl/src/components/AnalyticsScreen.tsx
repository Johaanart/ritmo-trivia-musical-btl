import { useMemo } from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { useAnalyticsData } from '../hooks/useAnalyticsData';
import type { AnalyticsGame, TrackPerformance } from '../lib/analytics';

interface AnalyticsScreenProps {
  user: { id: string } | null;
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat('es-ES', { maximumFractionDigits }).format(value);
}

function formatPercent(value: number | null) {
  return value === null ? '—' : `${formatNumber(value, 1)} %`;
}

function formatSeconds(value: number | null) {
  return value === null ? '—' : `${formatNumber(value, 1)} s`;
}

function formatDate(value: string | null) {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function escapeCsv(value: string | number | null) {
  const raw = value === null ? '' : String(value);
  const text = /^[\t\r ]*[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null>>) {
  const content = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function GameHistoryTable({ games }: { games: AnalyticsGame[] }) {
  if (games.length === 0) {
    return (
      <div className="analytics-empty-inline">
        <strong>Aún no hay partidas guardadas.</strong>
        <span>Cuando juegues con tu cuenta, tus resultados aparecerán aquí.</span>
      </div>
    );
  }

  return (
    <div className="analytics-table-scroll">
      <table className="analytics-table">
        <caption className="visually-hidden">Tus cinco partidas más recientes</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            <th scope="col">Puntaje</th>
            <th scope="col">Aciertos</th>
            <th scope="col">Duración</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <tr key={game.id} data-testid={`row-game-${game.id}`}>
              <td>{formatDate(game.created_at)}</td>
              <td className="analytics-number">{formatNumber(game.score)} pts</td>
              <td className="analytics-number">{game.correct_answers}/{game.total_questions}</td>
              <td className="analytics-number">{formatNumber(game.duration_seconds)} s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TrackTable({ tracks }: { tracks: TrackPerformance[] }) {
  if (tracks.length === 0) {
    return (
      <div className="analytics-empty-inline">
        <strong>Sin canciones para mostrar.</strong>
        <span>El rendimiento de las canciones aparecerá cuando haya respuestas registradas.</span>
      </div>
    );
  }

  return (
    <div className="analytics-table-scroll">
      <table className="analytics-table analytics-track-table">
        <caption className="visually-hidden">Rendimiento de canciones de más fácil a más difícil</caption>
        <thead>
          <tr>
            <th scope="col">Canción</th>
            <th scope="col">Precisión</th>
            <th scope="col">Jugadas</th>
            <th scope="col">Respuesta media</th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, index) => (
            <tr key={track.id} data-testid={`row-track-${track.id}`}>
              <td>
                <span className="analytics-track-name">{track.title}</span>
                <span className="analytics-track-artist">{track.artist}</span>
              </td>
              <td>
                <span className="analytics-accuracy-cell">
                  <span className="analytics-number">{formatPercent(track.accuracyPercent)}</span>
                  {track.accuracyPercent !== null && (
                    <span className="analytics-meter" aria-hidden="true">
                      <span style={{ width: `${Math.max(0, Math.min(100, track.accuracyPercent))}%` }} />
                    </span>
                  )}
                  <span className="visually-hidden">Posición {index + 1}, de más fácil a más difícil</span>
                </span>
              </td>
              <td className="analytics-number">{formatNumber(track.plays)}</td>
              <td className="analytics-number">{formatSeconds(track.averageResponseSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnalyticsScreen({ user }: AnalyticsScreenProps) {
  const { data, isLoading, error, refresh } = useAnalyticsData(user?.id ?? null);

  const rankedTracks = useMemo(() => {
    if (!data) return [];
    return [...data.trackPerformance].sort((a, b) => {
      if (a.accuracyPercent === null && b.accuracyPercent === null) return a.title.localeCompare(b.title, 'es');
      if (a.accuracyPercent === null) return 1;
      if (b.accuracyPercent === null) return -1;
      return b.accuracyPercent - a.accuracyPercent || a.title.localeCompare(b.title, 'es');
    });
  }, [data]);

  const latestGames = useMemo(() => {
    if (!data) return [];
    return [...data.myGames]
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [data]);

  const exportGames = () => {
    downloadCsv(
      'ritmo-mis-partidas.csv',
      ['fecha', 'puntaje', 'aciertos', 'preguntas', 'duracion_segundos'],
      (data?.myGames ?? []).map((game) => [
        game.created_at,
        game.score,
        game.correct_answers,
        game.total_questions,
        game.duration_seconds,
      ]),
    );
  };

  const exportTracks = () => {
    downloadCsv(
      'ritmo-rendimiento-canciones.csv',
      ['cancion', 'artista', 'precision_porcentaje', 'jugadas', 'respuestas_correctas', 'respuesta_media_segundos'],
      rankedTracks.map((track) => [
        track.title,
        track.artist,
        track.accuracyPercent,
        track.plays,
        track.correct,
        track.averageResponseSeconds,
      ]),
    );
  };

  const summary = data?.summary ?? {
    totalGames: 0,
    averageScore: 0,
    accuracyPercent: 0,
    averageResponseSeconds: null,
  };
  const hasNoOverallPlay = Boolean(data && summary?.totalGames === 0);

  return (
    <section className="analytics-screen" aria-labelledby="analytics-title">
      <header className="analytics-heading">
        <div>
          <p className="analytics-eyebrow"><span aria-hidden="true" /> Ritmo / lectura de juego</p>
          <h1 id="analytics-title">El pulso <em>del juego.</em></h1>
          <p className="analytics-intro">Partidas, canciones y oído en una sola mirada.</p>
        </div>
        <button
          className="analytics-refresh"
          type="button"
          onClick={refresh}
          disabled={isLoading}
          aria-label={isLoading ? 'Actualizando analítica' : 'Actualizar analítica'}
          data-testid="button-refresh-analytics"
        >
          <RefreshCw size={15} aria-hidden="true" className={isLoading ? 'is-spinning' : undefined} />
          {isLoading ? 'Actualizando' : 'Actualizar'}
        </button>
      </header>

      {error && (
        <div className="analytics-error" role="alert" data-testid="status-analytics-error">
          <AlertTriangle size={17} aria-hidden="true" />
          <div>
            <strong>No pudimos cargar la analítica.</strong>
            <span>{error}</span>
          </div>
          <button type="button" onClick={refresh} disabled={isLoading} data-testid="button-retry-analytics">
            Reintentar
          </button>
        </div>
      )}

      {isLoading && !data ? (
        <div className="analytics-content" aria-label="Cargando analítica" aria-busy="true">
          <div className="analytics-kpis" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div className="analytics-skeleton-kpi" key={index}>
                <span />
                <strong />
                <i />
              </div>
            ))}
          </div>
          <div className="analytics-panel analytics-loading-panel" aria-hidden="true">
            <span /><span /><span /><span /><span />
          </div>
          <span className="visually-hidden">Cargando estadísticas del juego…</span>
        </div>
      ) : data ? (
        <div className="analytics-content">
          <section className="analytics-kpis" aria-label="Indicadores globales">
            <article className="analytics-kpi analytics-kpi-featured" data-testid="metric-total-games">
              <span className="analytics-kpi-index">01 / GLOBAL</span>
              <span className="analytics-kpi-label">Partidas jugadas</span>
              <strong>{formatNumber(summary.totalGames)}</strong>
              <span className="analytics-kpi-foot">en todas las sesiones</span>
            </article>
            <article className="analytics-kpi" data-testid="metric-average-score">
              <span className="analytics-kpi-index">02 / PUNTAJE</span>
              <span className="analytics-kpi-label">Promedio de puntos</span>
              <strong>{formatNumber(summary.averageScore, 1)}</strong>
              <span className="analytics-kpi-foot">por partida</span>
            </article>
            <article className="analytics-kpi" data-testid="metric-global-accuracy">
              <span className="analytics-kpi-index">03 / OÍDO</span>
              <span className="analytics-kpi-label">Precisión global</span>
              <strong>{formatPercent(summary.accuracyPercent)}</strong>
              <span className="analytics-kpi-foot">respuestas correctas</span>
            </article>
            <article className="analytics-kpi" data-testid="metric-average-response">
              <span className="analytics-kpi-index">04 / REFLEJOS</span>
              <span className="analytics-kpi-label">Tiempo por canción</span>
              <strong>{formatSeconds(summary.averageResponseSeconds)}</strong>
              <span className="analytics-kpi-foot">respuesta media en segundos</span>
            </article>
          </section>

          {hasNoOverallPlay && (
            <div className="analytics-empty-global" data-testid="status-empty-analytics">
              <span className="analytics-empty-mark" aria-hidden="true">—</span>
              <div>
                <h2>La pista está lista.</h2>
                <p>Aún no hay partidas registradas. Cuando empiece el juego, aquí verás cómo suena el conjunto.</p>
              </div>
            </div>
          )}

          <section className="analytics-panel analytics-leaderboard" aria-labelledby="leaderboard-title">
            <div className="analytics-panel-heading">
              <div>
                <p className="analytics-section-index">01 — QUIÉN SUENA MÁS</p>
                <h2 id="leaderboard-title">Marcador global</h2>
              </div>
              <span className="analytics-count">{Math.min(data.leaderboard.length, 10)} mejores</span>
            </div>
            {data.leaderboard.length === 0 ? (
              <div className="analytics-empty-inline">
                <strong>Sin posiciones todavía.</strong>
                <span>El marcador se completa con las primeras partidas.</span>
              </div>
            ) : (
              <div className="analytics-table-scroll">
                <table className="analytics-table">
                  <caption className="visually-hidden">Las diez mejores posiciones del marcador global</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Jugador</th>
                      <th scope="col">Partidas</th>
                      <th scope="col">Precisión</th>
                      <th scope="col">Mejor puntaje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.leaderboard.slice(0, 10).map((player, index) => (
                      <tr key={player.userId} data-testid={`row-player-${player.userId}`}>
                        <td><span className={`analytics-rank${index < 3 ? ' is-top' : ''}`}>{String(index + 1).padStart(2, '0')}</span></td>
                        <td className="analytics-player-name">{player.username || 'Jugador'}</td>
                        <td className="analytics-number">{formatNumber(player.gamesPlayed)}</td>
                        <td className="analytics-number">{formatPercent(player.accuracyPercent)}</td>
                        <td className="analytics-number analytics-best-score">{formatNumber(player.bestScore)} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="analytics-panel analytics-songs" aria-labelledby="songs-title">
            <div className="analytics-panel-heading">
              <div>
                <p className="analytics-section-index">02 — LA PRUEBA</p>
                <h2 id="songs-title">Canciones: de fácil a difícil</h2>
              </div>
              <button
                className="analytics-export"
                type="button"
                onClick={exportTracks}
                disabled={rankedTracks.length === 0}
                data-testid="button-export-tracks"
              >
                <Download size={14} aria-hidden="true" /> Descargar CSV
              </button>
            </div>
            <TrackTable tracks={rankedTracks} />
          </section>

          <section className="analytics-panel analytics-history" aria-labelledby="history-title">
            <div className="analytics-panel-heading">
              <div>
                <p className="analytics-section-index">03 — TU RECORRIDO</p>
                <h2 id="history-title">Partidas recientes</h2>
              </div>
              {user && (
                <button
                  className="analytics-export"
                  type="button"
                  onClick={exportGames}
                  disabled={latestGames.length === 0}
                  data-testid="button-export-games"
                >
                  <Download size={14} aria-hidden="true" /> Descargar CSV
                </button>
              )}
            </div>
            {!user ? (
              <div className="analytics-guest-state" data-testid="status-guest-history">
                <span className="analytics-guest-index">HISTORIAL PERSONAL</span>
                <div>
                  <strong>Tu recorrido queda fuera de este marcador.</strong>
                  <p>Inicia sesión para guardar tus partidas y consultar aquí tus cinco resultados más recientes.</p>
                </div>
              </div>
            ) : (
              <GameHistoryTable games={latestGames} />
            )}
          </section>
        </div>
      ) : !error ? (
        <div className="analytics-empty-global" role="status">
          <span className="analytics-empty-mark" aria-hidden="true">—</span>
          <div>
            <h2>Sin datos por ahora.</h2>
            <p>Actualiza la vista para volver a consultar las estadísticas del juego.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default AnalyticsScreen;
