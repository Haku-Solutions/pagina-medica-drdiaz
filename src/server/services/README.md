# Servicios (services)

Lógica de negocio compartida y reutilizable por los Route Handlers.

Ejemplos de funciones que vivirán aquí:

- Crear expediente validando reglas del negocio (CURP única, etc.).
- Registrar nota operatoria y validar que el expediente exista.
- Generar estadísticas para el dashboard.
- Orquestar la subida a Firebase Storage y el registro en `ArchivoModel`.

Los servicios no deben importar directamente de `next/server` ni manejar la cookie;
eso pertenece al Route Handler.