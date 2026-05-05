# PharmaDerm Frontend (Vue 3 + Vite)

## Setup

- Instalar dependencias: `npm install`
- Desarrollo: `npm run dev`
- Build: `npm run build`

## Auth / Datos

El proyecto soporta 3 modos (según `.env`):

- `VITE_DATA_MODE=supabase`: usa Supabase Auth + DB (requiere `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- `VITE_DATA_MODE=backend`: consume un API externo (`VITE_API_BASE_URL`).
- (default) `local`: fallback con `localStorage` (solo para demo; sin emails reales).

## Olvidé mi contraseña (Supabase)

Flujo implementado:

- `GET /olvide`: envía email con `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.
- El link redirige a `GET /reset-password`, donde el usuario define la nueva contraseña con `supabase.auth.updateUser({ password })`.

Requisitos en Supabase Dashboard:

- Authentication → URL Configuration → **Redirect URLs**: agregar la URL de tu app, por ejemplo:
  - `http://localhost:5173/reset-password`
  - tu dominio en producción, por ejemplo `https://tu-dominio.com/reset-password`

Nota: en modo `local` no hay envío de correos; para recuperar contraseña usa `supabase` o `backend`.
