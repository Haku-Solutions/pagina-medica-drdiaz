# Capa de servidor (`src/server/`)

Toda la lógica que no es UI vive aquí. Las pantallas de `app/(Admin)` **nunca** importan mongoose ni firebase directamente; pasan por los Route Handlers.

## Flujo por endpoint

```
Route Handler (app/api/*)  →  Service (lógica de negocio)  →  Repository (acceso a datos)  →  MongoDB/Firebase
```

## Estructura

| Carpeta        | Qué va ahí                                                              |
| -------------- | ------------------------------------------------------------------------ |
| `index.ts`     | `connectDB()`: conexión cacheada a MongoDB (serverless-friendly)        |
| `config/`      | Acceso tipado a variables de entorno (`env`). No leer `process.env` fuera de aquí |
| `db/`          | Esquemas Mongoose en un solo archivo (`model.ts`)                       |
| `auth/`        | `password.ts` (bcrypt) y `session.ts` (JWT con jose)                     |
| `storage/`     | Modulo de Firebase Storage (`firebase.ts`)                               |
| `repositories/`| Funciones puras de acceso a MongoDB/agregaciones (aun en construcción)   |
| `services/`    | Lógica de negocio (aun en construcción)                                  |
| `utils/`       | `apiResponse.ts`: `ok()`, `created()`, `fail()`                          |
| `constants/`   | Enums y listas: `SEXO`, etc.                                             |

## Modelos (`db/model.ts`)

Los 4 esquemas viven en un solo archivo y se exportan listos para usarse:
`Cirujano`, `ExpedienteMedico`, `NotaOperatoria`, `Archivo`.

## Reglas base del equipo

1. **Conexión única y cacheada:** usa siempre `await connectDB()` de `@/src/server`. Nunca `mongoose.connect` dentro de un handler.
2. **Importa los modelos desde `db/model`:** `import { ExpedienteMedico } from "@/src/server/db/model"`.
3. **Nombres de campos en camelCase:** `nombreCompleto`, `fechaCirugia`, `idExpediente`, etc. Nunca snake_case.
4. **Respuestas HTTP uniformes:** usa `ok()`, `created()` y `fail()` de `utils/apiResponse`. Formato: `{ ok: boolean, data?: any, error?: string }`.
5. **Autenticación en cada endpoint protegido:** primero `getSessionUser()` desde `auth/requireSession`; si devuelve `null` → `fail("No autorizado", 401)`.
6. **Timestamps automáticos:** los esquemas usan `timestamps: true` (Mongoose crea `createdAt` / `updatedAt`). No los guardes manualmente.
7. **Datos médicos (PHI):** no registrar datos clínicos en `console.log`, no exponer la cookie, y usar `https` en producción.

## Autenticación (monousuario)

Sistema de un solo cirujano: **una** colección `Cirujano`, sin roles ni registros múltiples.

- **Credenciales en Mongo:** el cirujano se guarda en la colección `Cirujano` con
  `nombreUsuario` y `contraseña` (hash bcrypt). Ya no se usan variables de entorno
  para el usuario/contraseña.
- **Seed (crear el usuario una sola vez):**
  ```bash
  npm run seed:cirujano -- --usuario dr.diaz --password 'tu-password'
  ```
  Usa `--force` para actualizar la contraseña de un usuario existente.
- **Login:** `POST /api/auth/login` → busca el usuario, compara con `bcrypt.compare`
  y firma un JWT con el `id` (subject) y el `nombreUsuario` del cirujano.
- **Cookie:** `httpOnly`, `sameSite=lax`, `secure` en producción, nombre `session`,
  firmada con `ADMIN_SESSION_SECRET` (HS256, jose), expira en 4 h.
- **Logout:** `POST /api/auth/logout` borra la cookie. Ver sesión: `GET /api/auth/me`.
- **Protección de rutas:** `proxy.ts` (raíz del proyecto) valida la cookie en
  todas las rutas `/admin/:path*`; sin sesión válida redirige a `/admin/login`.
  Si ya hay sesión y se visita el login, redirige a `/admin/pacientes`.

## Endpoints actuales

| Método y ruta                      | Estado      |
| ---------------------------------- | ----------- |
| `POST /api/auth/login`             | funcional   |
| `POST /api/auth/logout`            | funcional   |
| `GET /api/auth/me`                 | funcional   |
| `GET/POST /api/expedientes`        | funcional   |
| `GET/PUT/DELETE /api/expedientes/[id]` | funcional |
| `POST /api/notas`                  | funcional   |
| `GET/PUT/DELETE /api/notas/[id]`   | funcional   |
| `POST /api/archivos`               | recibe el archivo como multipart; aún no sube a Firebase |
| `GET /api/estadisticas`            | funcional   |