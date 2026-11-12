# Trivia Musical BTL

Trivia musical web para activaciones BTL, con preguntas de demostración, melodías de prueba locales y una partida responsive.

## Run & Operate

- `pnpm --filter @workspace/trivia-musical-btl run dev` — ejecutar la aplicación web
- `pnpm --filter @workspace/trivia-musical-btl run typecheck` — comprobar tipos del artefacto
- `pnpm --filter @workspace/trivia-musical-btl run build` — generar la versión de producción
- Esta fase no requiere variables de entorno, API ni base de datos.

## Stack

- pnpm workspaces, React, Vite, JavaScript/JSX y CSS
- La app usa estado local del navegador; no hay servicios externos en esta fase.

## Where things live

- `artifacts/trivia-musical-btl/src/App.tsx` — inicio, juego, resultados y composición de pantallas.
- `artifacts/trivia-musical-btl/src/components/` — opciones de respuesta y reproductor.
- `artifacts/trivia-musical-btl/src/data/questions.js` — preguntas locales, respuestas y melodías de prueba.
- `artifacts/trivia-musical-btl/src/hooks/useTriviaGame.js` — temporizador, puntuación y flujo de la partida.
- `artifacts/trivia-musical-btl/src/index.css` — estilos responsive y tema visual.

## Architecture decisions

- La lógica de la partida está separada de los componentes visuales.
- Las melodías sintéticas sirven para probar el reproductor sin grabaciones protegidas ni enlaces externos.
- `audioSrc` queda reservado para asociar archivos locales en una fase posterior.

## Product

Los participantes escuchan melodías de prueba, eligen entre cuatro respuestas, ven su puntaje y pueden iniciar otra partida.

## User preferences

- Esta primera fase no debe incluir autenticación, base de datos, analítica ni despliegue.
- No usar logotipos ni recursos protegidos de Spotify; no inventar enlaces de canciones.

## Gotchas

- Las muestras actuales son tonos sintetizados localmente, no grabaciones de canciones.
- Para usar clips reales, asociar archivos locales con licencia confirmada mediante `audioSrc`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
