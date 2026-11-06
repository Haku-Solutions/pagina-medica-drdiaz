import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.DATABASE_URL;
function databaseName(u){
  const s = u.replace(/^mongodb(?:\+srv)?:\/\//, "");
  const i = s.indexOf("/");
  if (i === -1) return "Expediente";
  return decodeURIComponent(s.slice(i+1).split("?")[0]) || "Expediente";
}
await mongoose.connect(uri, { dbName: databaseName(uri) });
const db = mongoose.connection.db;
const expCount = await db.collection("expedientemedicos").countDocuments();
const notaCount = await db.collection("notaoperatorias").countDocuments();
console.log(JSON.stringify({expCount, notaCount}));
const exp = await db.collection("expedientemedicos").find({}).limit(3).toArray();
exp.forEach((e, idx) => {
  console.log("EXP"+idx, JSON.stringify(Object.keys(e)));
});
await mongoose.disconnect();
