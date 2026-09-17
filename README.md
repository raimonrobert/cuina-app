# Cuina-app — Gestor Inventario de Cocina

Aplicación web para gestionar el **plano interactivo** y el **inventario** de una
cocina. Migración del prototipo `cocina_app_v2.html` (un único HTML con
localStorage) a una app real con persistencia en Neon (Postgres) y despliegue
en Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Neon** (Postgres serverless) como base de datos — driver `@neondatabase/serverless`
- **Zustand** para el estado global
- CSS plano con variables (tema oscuro cálido del prototipo) + Google Fonts
  (Playfair Display + Archivo Narrow)
- Despliegue en **Vercel**

## Funcionalidad

- **Plano**: vista en planta + 3 alzados (muebles, isla, esquinero), dibujados en
  SVG a escala. Módulos clicables con badge de nº de items, navegación jerárquica
  (módulo → sub-cajón → volver), panel de detalle y edición de medidas.
- **Inventario**: tabla agrupable por categoría o ubicación, buscador, filtros
  (todos/ubicados/pendientes), estadísticas y CRUD completo de items.
- **Ubicaciones**: acordeón con dimensiones e items por ubicación, CRUD.
- **Móvil** (mobile-first): barra inferior de 5 botones y pantallas completas.
- **Backup**: exportar / importar / restaurar datos en JSON.

## Arquitectura

El navegador **nunca** habla directamente con la base de datos (la connection
string de Neon es una credencial completa, no una clave pública como la de
Supabase). Todo pasa por Route Handlers en el propio servidor:

```
componente → store (Zustand, cliente) → fetch → Route Handler (servidor) → Neon
```

- `lib/db.ts` — cliente Neon (`server-only`, usa `DATABASE_URL`).
- `app/api/` — endpoints: `GET /api/data` (carga inicial), `POST/PATCH/DELETE
  /api/items[/:id]`, `POST/PATCH/DELETE /api/locations[/:id]`, `POST
  /api/replace-all` (transaccional, usado por "Importar JSON" y "Restaurar
  datos").
- `store/useStore.ts` — mismas funciones y firmas de siempre; por dentro llaman
  a esos endpoints con `fetch` en vez de a un cliente de BD.

Ningún componente accede a datos directamente ni conoce Neon: todos consumen el
store.

## Modelo de datos (Neon / Postgres)

- `locations` (id text PK, name, desc, w, d, h)
- `categories` (id, name)
- `items` (id, name, cat, loc_id → locations, freq, notes)

La geometría del plano (`ELS`, `APER`, `SUB_LOCS`) es fija y vive en
`lib/planData.ts` (no en BD). El esquema vive en `db/migrations/` (histórico;
no hay migraciones automatizadas — los cambios de esquema se aplican a mano
contra Neon).

## Configuración local

1. Copia `.env.example` a `.env.local` y rellena la connection string de Neon:
   ```
   DATABASE_URL=postgresql://usuario:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?channel_binding=require&sslmode=require
   ```
   (usa el endpoint con `-pooler`, recomendado para entornos serverless).
2. Instala dependencias y arranca:
   ```bash
   npm install
   npm run dev
   ```
3. Abre http://localhost:3000

## Despliegue (Vercel)

Conectado a este repo de GitHub: cada push a `main` despliega producción y cada
rama/PR genera un preview. Configura `DATABASE_URL` en el proyecto de Vercel
(nunca con el prefijo `NEXT_PUBLIC_`).

## Acceso

App de uso personal/familiar, sin autenticación (abierta). El acceso a Neon
está protegido en el servidor (la credencial no sale de ahí), pero los
endpoints en sí no están protegidos: cualquiera con la URL puede leer/escribir,
igual que antes con Supabase. Si en el futuro se quiere proteger, añadir un
middleware con contraseña por variable de entorno.

## Estructura

```
app/            layout, página, estilos globales, Route Handlers (app/api/)
components/     AppShell + vistas (plano, inventario, ubicaciones, móvil, modales)
lib/            tipos, cliente Neon (db.ts), datos del plano, generadores SVG, seed
store/          estado global (Zustand) + llamadas fetch a los Route Handlers
db/migrations/  esquema y datos semilla (histórico, aplicado a mano contra Neon)
```
