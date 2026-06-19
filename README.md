# Cuina-app — Gestor Inventario de Cocina

Aplicación web para gestionar el **plano interactivo** y el **inventario** de una
cocina. Migración del prototipo `cocina_app_v2.html` (un único HTML con
localStorage) a una app real con persistencia en Supabase y despliegue en Vercel.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Supabase** (Postgres) como base de datos — cliente `@supabase/supabase-js`
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

## Modelo de datos (Supabase)

- `locations` (id text PK, name, desc, w, d, h) — 22 ubicaciones
- `categories` (id, name) — 11 categorías
- `items` (id, name, cat, loc_id → locations, freq, notes) — 76 items

La geometría del plano (`ELS`, `APER`, `SUB_LOCS`) es fija y vive en
`lib/planData.ts` (no en BD). El esquema y los datos semilla están en
`supabase/migrations/`.

## Configuración local

1. Copia `.env.example` a `.env.local` y rellena las claves de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. Instala dependencias y arranca:
   ```bash
   npm install
   npm run dev
   ```
3. Abre http://localhost:3000

## Despliegue (Vercel)

Conectado a este repo de GitHub: cada push a `main` despliega producción y cada
rama/PR genera un preview. Configura las dos variables `NEXT_PUBLIC_SUPABASE_*`
en el proyecto de Vercel.

## Acceso

App de uso personal/familiar, sin autenticación (abierta). Las tablas usan RLS
con políticas abiertas. Si en el futuro se quiere proteger, añadir un middleware
con contraseña por variable de entorno.

## Estructura

```
app/            layout, página, estilos globales
components/      AppShell + vistas (plano, inventario, ubicaciones, móvil, modales)
lib/            tipos, cliente Supabase, datos del plano, generadores SVG, seed
store/          estado global (Zustand) + operaciones CRUD sobre Supabase
supabase/       migraciones SQL (esquema + datos semilla)
```
