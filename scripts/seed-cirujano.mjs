import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

const uri = process.env.DATABASE_URL;
if (!uri) {
  console.error("Falta DATABASE_URL. Ejecuta con: node --env-file=.env scripts/seed-cirujano.mjs ...");
  process.exit(1);
}

const nombreUsuario = getArg("usuario") ?? process.env.SEED_USUARIO;
const plainPassword = getArg("password") ?? process.env.SEED_PASSWORD;
const force = process.argv.includes("--force");

if (!nombreUsuario || !plainPassword) {
  console.error(
    "Uso: node --env-file=.env scripts/seed-cirujano.mjs --usuario tu-usuario --password 'tu-password' [--force]"
  );
  process.exit(1);
}

const cirujanoSchema = new mongoose.Schema(
  {
    nombreUsuario: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
  },
  { timestamps: true }
);

const Cirujano = mongoose.model("Cirujano", cirujanoSchema);

async function main() {
  await mongoose.connect(uri);

  const existente = await Cirujano.findOne({ nombreUsuario });
  if (existente && !force) {
    console.error(
      `El usuario "${nombreUsuario}" ya existe. Usa --force para actualizar su contraseña.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  const contraseña = await bcrypt.hash(plainPassword, 10);

  await Cirujano.findOneAndUpdate(
    { nombreUsuario },
    { $set: { contraseña } },
    { upsert: true, returnDocument: "after" }
  );

  console.log(
    `Usuario "${nombreUsuario}" ${existente ? "actualizado" : "creado"} correctamente.`
  );
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Error al crear el usuario:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});