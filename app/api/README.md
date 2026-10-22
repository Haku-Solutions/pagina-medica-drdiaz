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
| `/api/auth/login`        | `POST`                      | Inicio de sesión (Cirujano en Mongo + bcrypt + cookie JWT) |
| `/api/auth/logout`       | `POST`                      | Cierra la sesión (borra cookie)          |
| `/api/auth/me`           | `GET`                       | Devuelve el usuario de la sesión activa  |
| `/api/expedientes`       | `GET` (búsqueda), `POST`    | Lista/crea expedientes                   |
| `/api/expedientes/[id]`  | `GET`, `PUT`, `DELETE`      | Expediente individual                    |
| `/api/notas`             | `POST`                      | Crea nota operatoria                     |
| `/api/notas/[id]`        | `GET` (con archivos), `PUT`, `DELETE` | Nota operatoria + sus archivos |
| `/api/archivos`          | `POST` (multipart)          | Subida de adjuntos (aun sin Firebase)    |
| `/api/estadisticas`      | `GET`                       | Resumen para el dashboard                |

### `/api/estadisticas`

Devuelve los agregados que consume la vista `/admin/inicio`. Las series simples
usan la forma `{ etiqueta: string, valor: number }` y el desglose por tipo de
cirugía agrega la clave `tipo`:

```json
{
  "ok": true,
  "data": {
    "totalExpedientes": 0,
    "totalCirugias": 0,
    "cirugiasPorTipo": [{ "etiqueta": "Apendicectomía", "valor": 4 }],
    "lugaresMasComunes": [{ "etiqueta": "Hospital Diamante", "valor": 4 }],
    "porSexo": [{ "etiqueta": "M", "valor": 3 }],
    "cirugiasPorMes": [{ "etiqueta": "2026-10", "valor": 1 }],
    "cirugiasPorTipoMes": [
      { "tipo": "Apendicectomía", "etiqueta": "2026-10", "valor": 2 }
    ]
  }
}
```

- `cirugiasPorMes` devuelve siempre los últimos 12 meses (incluidos los que
  tienen valor `0`), para que la gráfica de área mantenga una línea de tiempo
  continua.
- `cirugiasPorTipoMes` alimenta el histograma por cirugía: al elegir un tipo en
  el selector, la vista muestra su evolución mensual (acotada a la misma
  ventana de 12 meses).

## Cómo agregar un endpoint

1. Crea `app/api/<recurso>/route.ts` (o `[id]/route.ts` si es por recurso).
2. Importa `getSessionUser`, `connectDB`, el modelo y `fail`/`ok`.
3. Implementa `export async function GET/POST/PUT/DELETE`.
4. Verifica el handler protege el acceso con `getSessionUser()`.