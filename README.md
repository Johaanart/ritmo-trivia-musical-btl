# Trivia Musical BTL

Aplicación web de trivia musical para activaciones BTL.

## Arquitectura

- **Frontend:** React + Vite.
- **Autenticación y datos:** Supabase Auth y tablas `tracks`, `games` y `game_answers`.
- **Despliegue:** Vercel.

Para desarrollo local, copia `.env.example` a `.env.local` en la raíz y completa `VITE_SUPABASE_URL` (URL `https://` del proyecto) y `VITE_SUPABASE_ANON_KEY`. La tabla `tracks` debe exponer `id`, `title`, `artist` y `audio_url`; el cliente selecciona cinco pistas aleatorias y genera cuatro opciones por pista. Las tablas de partidas usan las columnas `games(user_id, score, correct_answers, total_questions, duration_seconds)` y `game_answers(game_id, track_id, selected_option, is_correct, response_time_ms)`. Configura las políticas RLS para que la app pueda leer pistas y cada usuario solo pueda insertar partidas propias y sus respuestas.

El juego se puede jugar como invitado; solo las sesiones autenticadas guardan partidas y respuestas.

## Instalación y desarrollo

Este repositorio usa un workspace de pnpm. Para instalar dependencias y ejecutar la aplicación:

```bash
pnpm install
pnpm --filter @workspace/trivia-musical-btl run dev
```

## Estrategia de ramas

- `main`: versión estable lista para publicar.
- `develop`: integración del trabajo aprobado para la próxima versión.
- `feature/*`: ramas para desarrollar funcionalidades o cambios específicos; se integran en `develop` mediante revisión.
