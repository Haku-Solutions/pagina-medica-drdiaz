# Endpoints del portal (`app/api/`)

Todos los endpoints viven bajo `app/api/`. Son Route Handlers de Next.js y se exponen en el dominio como `/api/...`.

## Convenciones

- **Respuesta uniforme** con `src/server/utils/apiResponse`:
  - `ok(data)` → `200 { ok: true, data }`
  - `created(data)` → `201 { ok: true, data }`
  - `fail(mensaje, status)` → `{ ok: false, error: mensaje }`
- **Endpoints protegidos** validan primero con `getSessionUser()` y responden `401` si no hay sesión.
- **Validación de cuerpos**: por ahora manual en cada handler; cuando se requiera, añadir esquemas Zod.
- **Parámetros**: `params` de Next 16 es una `Promise` → siempre `const { id } = await params`.
- **Nombres de campos en camelCase** (igual que los modelos de `src/server/db/model.ts`).

## Guía por archivo

| Ruta                     | Métodos                     | Descripción                              |
| ------------------------ | --------------------------- | ---------------------------------------- |
| `/api/auth/login`        | `POST`                      | Inicio de sesión (bcrypt + cookie)       |
| `/api/auth/logout`       | `POST`                      | Cierra la sesión (borra cookie)          |
| `/api/auth/me`           | `GET`                       | Devuelve el usuario de la sesión activa  |
| `/api/expedientes`       | `GET` (búsqueda), `POST`    | Lista/crea expedientes                   |
| `/api/expedientes/[id]`  | `GET`, `PUT`, `DELETE`      | Expediente individual                    |
| `/api/notas`             | `POST`                      | Crea nota operatoria                     |
| `/api/notas/[id]`        | `GET` (con archivos), `PUT`, `DELETE` | Nota operatoria + sus archivos |
| `/api/archivos`          | `POST` (multipart)          | Subida de adjuntos (aun sin Firebase)    |
| `/api/estadisticas`      | `GET`                       | Resumen para el dashboard                |

## Cómo agregar un endpoint

1. Crea `app/api/<recurso>/route.ts` (o `[id]/route.ts` si es por recurso).
2. Importa `getSessionUser`, `connectDB`, el modelo y `fail`/`ok`.
3. Implementa `export async function GET/POST/PUT/DELETE`.
4. Verifica el handler protege el acceso con `getSessionUser()`.