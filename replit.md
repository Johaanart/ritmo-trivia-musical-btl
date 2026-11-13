# Trivia Musical BTL

Trivia musical web para activaciones BTL, con preguntas de demostración, melodías de prueba locales y una partida responsive.

## Run & Operate

- `pnpm --filter @workspace/trivia-musical-btl run dev` — ejecutar la aplicación web
- `pnpm --filter @workspace/trivia-musical-btl run typecheck` — comprobar tipos del artefacto
- `pnpm --filter @workspace/trivia-musical-btl run build` — generar la versión de producción
- Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` para usar autenticación, canciones y persistencia.

## Stack

- pnpm workspaces, React, Vite, JavaScript/JSX y CSS
- Supabase Auth mantiene la sesión; Supabase almacena pistas, partidas y respuestas.

## Where things live

- `artifacts/trivia-musical-btl/src/App.tsx` — inicio, juego, resultados y composición de pantallas.
- `artifacts/trivia-musical-btl/src/components/` — opciones, reproductor MP3 y formulario de autenticación.
- `artifacts/trivia-musical-btl/src/lib/supabase.js` — cliente Supabase configurado con variables Vite.
- `artifacts/trivia-musical-btl/src/lib/tracks.js` — carga aleatoria de pistas y opciones de respuesta.
- `artifacts/trivia-musical-btl/src/hooks/useAuth.js` — sesión persistente y operaciones de autenticación.
- `artifacts/trivia-musical-btl/src/hooks/useTriviaGame.js` — temporizador, puntuación, respuestas y guardado.
- `artifacts/trivia-musical-btl/src/index.css` — estilos responsive y tema visual.

## Architecture decisions

- La lógica de la partida está separada de los componentes visuales.
- Las cuatro opciones se generan con títulos de canciones de la tabla `tracks`; el audio se reproduce desde `audio_url`.
- Solo partidas iniciadas por usuarios autenticados se guardan en `games` y `game_answers`; el modo invitado sigue disponible.

## Product

Los participantes escuchan pistas MP3, eligen entre cuatro respuestas, ven su puntaje y pueden iniciar otra partida.

## User preferences

- No usar logotipos ni recursos protegidos de Spotify; no inventar enlaces de canciones.

## Gotchas

- `tracks` necesita al menos cinco filas con `id`, `title`, `audio_url` y audio accesible; `artist` puede estar vacío.
- Las políticas RLS de Supabase deben permitir leer las pistas y escribir partidas y respuestas propias.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
