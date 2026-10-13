# Guardado de datos (repositories)

Capa intermedia entre los Route Handlers y Mongo. Los `Route Handlers` llaman a estas funciones
para mantener el acceso a datos en un solo lugar y poder reutilizarlo en tests.

Convención: una función por operación, nombrada `verboSustantivo`:

```ts
export async function findExpedientesPorTermino(termino: string) {
  return ExpedienteMedicoModel.find({ ... }).lean();
}
```

Pendiente de convenir con el equipo: ubicación de las agregaciones (por ejemplo las de
`/api/estadisticas` podrían moverse aquí).