# Trivia Musical BTL

Aplicación web de trivia musical para activaciones BTL.

## Arquitectura

- **Frontend:** React + Vite.
- **Backend y datos:** Supabase (integración prevista; no está conectada en esta fase).
- **Despliegue:** Vercel (destino previsto; no está configurado en esta fase).

El prototipo actual usa preguntas y melodías de prueba locales. Las variables de ejemplo para una futura conexión con Supabase están en `.env.example`. Copia ese archivo a `.env.local` y completa los valores cuando la integración esté configurada. No compartas ni publiques valores reales.

## Instalación y desarrollo

Comandos solicitados para un proyecto administrado con npm:

```bash
npm install
npm run dev
```

**Nota sobre este repositorio:** actualmente está configurado como un workspace de pnpm; npm está bloqueado por su configuración y el comando de desarrollo vive en el paquete de la aplicación. Para ejecutar esta copia:

```bash
pnpm install
pnpm --filter @workspace/trivia-musical-btl run dev
```

## Estrategia de ramas

- `main`: versión estable lista para publicar.
- `develop`: integración del trabajo aprobado para la próxima versión.
- `feature/*`: ramas para desarrollar funcionalidades o cambios específicos; se integran en `develop` mediante revisión.
