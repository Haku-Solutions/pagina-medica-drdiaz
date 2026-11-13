import mongoose from "mongoose";

function databaseName(uri) {
  const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//, "");
  const slashIndex = withoutScheme.indexOf("/");
  if (slashIndex === -1) return "Expediente";
  const path = withoutScheme.slice(slashIndex + 1);
  const name = decodeURIComponent(path.split("?")[0].trim());
  return name || "Expediente";
}

await mongoose.connect(process.env.DATABASE_URL, { dbName: databaseName(process.env.DATABASE_URL) });
const db = mongoose.connection.db;

const MARKER = "__drdiaz_prueba_graficas__";

const filtro = {
  $or: [{ marcador: MARKER }, { cirugiaProgramada: { $regex: MARKER } }],
};

await db.collection("expedientemedicos").deleteMany(filtro);
await db.collection("notaoperatorias").deleteMany(filtro);

const cirugias = [
  "Apendicectomía",
  "Colecistectomía laparoscópica",
  "Hernioplastia inguinal",
  "Cirugía de vesícula biliar",
];
const lugares = ["Clínica Sagrado Corazón", "Clínica Dr Díaz", "Hospital Diamante"];
const sexos = ["M", "F", "F", "M", "F"];

const cirujano = await db.collection("cirujanos").findOne({});

const expedientesIds = [];
for (let i = 0; i < 5; i += 1) {
  const resultado = await db.collection("expedientemedicos").insertOne({
    idCirujano: cirujano._id,
    nombreCompleto: `Paciente ${i + 1}`,
    fechaNacimiento: new Date(1980 + i * 5, i % 12, 15),
    sexo: sexos[i],
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  expedientesIds.push(resultado.insertedId);
}

const pesos = [14, 9, 5, 3];
let indice = 0;

for (let tipo = 0; tipo < cirugias.length; tipo += 1) {
  for (let n = 0; n < pesos[tipo]; n += 1) {
    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() - (indice % 12));

    await db.collection("notaoperatorias").insertOne({
      idExpediente: expedientesIds[indice % expedientesIds.length],
      fechaCirugia: fecha,
      lugarCirugia: lugares[(tipo + n) % lugares.length],
      cirugiaProgramada: cirugias[tipo],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    indice += 1;
  }
}

console.log(`sembrado: 5 expedientes y ${pesos.reduce((a, b) => a + b, 0)} notas`);
await mongoose.disconnect();
