import type { NotaPostoperatoriaPdfData } from "./notaPostoperatoriaPdf.types";
import { cirujano } from "@/config/cirujano";

const WIDTH = 612;
const HEIGHT = 792;
const LEFT = 51;
const RIGHT = 588;
const BOTTOM = 750;

type PdfDocument = import("jspdf").jsPDF;
type PdfConstructor = typeof import("jspdf").jsPDF;

function clean(value: string): string {
  return value.trim();
}

function drawPageBase(doc: PdfDocument, logo: string | null) {
  doc.setFillColor(233, 237, 240);
  doc.rect(0, 0, WIDTH, HEIGHT, "F");
  for (let y = 640; y < HEIGHT; y += 2) {
    const ratio = (y - 640) / (HEIGHT - 640);
    doc.setFillColor(
      Math.round(233 + (187 - 233) * ratio),
      Math.round(237 + (198 - 237) * ratio),
      Math.round(240 + (255 - 240) * ratio),
    );
    doc.rect(0, y, WIDTH, 2, "F");
  }
  if (logo) {
    try { doc.addImage(logo, "PNG", 33, 14, 55, 55); } catch { /* logo opcional */ }
  }
  doc.setTextColor(17, 17, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(cirujano.nombre, 588, 40, { align: "right" });
  doc.text(cirujano.especialidad, 588, 53, { align: "right" });
  doc.text(`Ced Prof. ${cirujano.cedula}`, 588, 66, { align: "right" });
  doc.setDrawColor(51, 51, 51);
  doc.setLineWidth(1);
  doc.line(32, 81, 588, 81);
}

function formatFileDate(value: string): string {
  const parts = value.split("/");
  return parts.length === 3 ? `${parts[0]}-${parts[1]}-${parts[2]}` : "sin-fecha";
}

export async function generateNotaPostoperatoriaPdf(data: NotaPostoperatoriaPdfData, Pdf: PdfConstructor): Promise<void> {
  const doc = new Pdf({ orientation: "portrait", unit: "pt", format: "letter" });
  let logo: string | null = null;
  try {
    const response = await fetch(cirujano.logo);
    if (response.ok) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
          const element = new Image();
          element.onload = () => resolve(element);
          element.onerror = () => reject(new Error("No se pudo cargar el logo"));
          element.src = imageUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("No se pudo preparar el logo para el PDF");
        const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        logo = canvas.toDataURL("image/png");
      } finally {
        URL.revokeObjectURL(imageUrl);
      }
    }
  } catch { /* El PDF funciona sin logo */ }

  drawPageBase(doc, logo);
  let y = 96;
  const patientLeft: Array<[string, string]> = [
    ["NOMBRE DEL PACIENTE", data.paciente.nombre],
    ["EDAD", data.paciente.edad],
    ["LUGAR DE LA CIRUGÍA", data.paciente.lugarCirugia],
  ];
  const patientRight: Array<[string, string]> = [
    ["FECHA DE INGRESO", data.paciente.fechaIngreso],
    ["HORA DE INGRESO", data.paciente.horaIngreso],
  ];
  function patientRow(label: string, value: string, x: number, baseline: number, align: "left" | "right") {
    if (!clean(value)) return;
    doc.setFont("helvetica", "bold"); doc.setFontSize(9);
    const labelText = `${label}: `;
    const width = doc.getTextWidth(labelText);
    if (align === "left") {
      doc.text(labelText, x, baseline);
      doc.setFont("helvetica", "normal"); doc.text(value, x + width, baseline, { maxWidth: 265 - width });
    } else {
      doc.setFont("helvetica", "normal");
      const valueWidth = doc.getTextWidth(value);
      doc.setFont("helvetica", "bold");
      const labelWidth = doc.getTextWidth(labelText);
      const start = x - labelWidth - valueWidth;
      doc.text(labelText, start, baseline);
      doc.setFont("helvetica", "normal");
      doc.text(value, start + labelWidth, baseline);
    }
  }
  patientLeft.forEach(([label, value], index) => patientRow(label, value, 33, 96 + index * 23, "left"));
  patientRight.forEach(([label, value], index) => patientRow(label, value, 588, 96 + index * 23, "right"));
  doc.setDrawColor(51, 51, 51); doc.setLineWidth(1); doc.line(32, 158, 588, 158);
  y = 186;

  function newPage() {
    doc.addPage();
    drawPageBase(doc, logo);
    y = 105;
  }
  function ensure(height: number) {
    if (y + height > BOTTOM) newPage();
  }
  const noteFields: Array<[string, string]> = [
    ["DIAGNÓSTICO PREOPERATORIO", data.nota.diagnosticoPreoperatorio],
    ["DIAGNÓSTICO POSTOPERATORIO", data.nota.diagnosticoPostoperatorio],
    ["CIRUGÍA PROGRAMADA", data.nota.cirugiaProgramada],
    ["CIRUGÍA REALIZADA", data.nota.cirugiaRealizada],
    ["HALLAZGOS", data.nota.hallazgos], ["TÉCNICA", data.nota.tecnica],
    ["SANGRADO", data.nota.sangrado], ["DRENAJES", data.nota.drenajes],
    ["CUENTA DE MATERIALES Y TEXTILES", data.nota.materialesTextiles],
    ["COMPLICACIONES", data.nota.complicaciones], ["CIRUJANO", data.nota.cirujano],
    ["ANESTESIÓLOGO", data.nota.anestesiologo], ["TIPO DE ANESTESIA", data.nota.tipoAnestesia],
    ["ENFERMERA INSTRUMENTISTA", data.nota.enfermeraInstrumentista],
    ["ENFERMERA CIRCULANTE", data.nota.enfermeraCirculante], ["AYUDANTES", data.nota.ayudantes],
    ["PRONÓSTICO", data.nota.pronostico], ["PLAN", data.nota.plan],
  ].filter((field): field is [string, string] => clean(field[1]).length > 0);
  const instructionFields: Array<[string, string]> = [
    ["DIETA", data.indicaciones.dieta], ["SOLUCIONES", data.indicaciones.soluciones],
    ["MEDICAMENTOS", data.indicaciones.medicamentos],
    ["CUIDADOS GENERALES DE ENFERMERÍA", data.indicaciones.cuidadosGenerales],
  ].filter((field): field is [string, string] => clean(field[1]).length > 0);

  function sectionTitle(title: string, x: number) {
    const fieldsExist = title === "NOTA POSTOPERATORIA" ? noteFields.length > 0 : instructionFields.length > 0;
    if (!fieldsExist) return;
    ensure(35);
    doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(47, 109, 181);
    doc.text(title, x, y); y += 22;
    doc.setTextColor(17, 17, 17);
  }

  sectionTitle("NOTA POSTOPERATORIA", LEFT);
  for (const [label, value] of noteFields) {
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const valueX = LEFT + doc.getTextWidth(`${label}: `);
    doc.setFont("helvetica", "normal");
    const wrappedLines = value.split(/\r?\n/).flatMap((line, index) =>
      doc.splitTextToSize(line, index === 0 ? RIGHT - valueX : RIGHT - LEFT),
    );
    const firstText = wrappedLines.shift() ?? "";
    ensure(30);
    doc.setFont("helvetica", "bold"); doc.text(`${label}:`, LEFT, y);
    doc.setFont("helvetica", "normal");
    doc.text(firstText, valueX, y);
    let nextY = y + 12;
    let lastBaseline = y;
    for (const line of wrappedLines) {
      if (nextY > BOTTOM) { newPage(); nextY = y; }
      doc.text(line, LEFT, nextY);
      lastBaseline = nextY;
      nextY += 12;
    }
    y = Math.max(y + 30, lastBaseline + 18);
  }

  sectionTitle("INDICACIONES POSTOPERATORIAS", LEFT);
  for (const [label, original] of instructionFields) {
    const value = label === "MEDICAMENTOS"
      ? `${clean(original)}\nOtro: ________________________________`
      : label === "CUIDADOS GENERALES DE ENFERMERÍA"
        ? `${clean(original)}\nOtro: ________________________________\nGracias.`
        : clean(original);
    const lines = value.split(/\r?\n/).flatMap((line) => doc.splitTextToSize(line, RIGHT - LEFT));
    ensure(23 + lines.length * 11.5);
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.text(`${label}:`, LEFT, y); y += 12;
    doc.setFont("helvetica", "normal");
    for (const line of lines) {
      if (y + 12 > BOTTOM) newPage();
      doc.text(line, LEFT, y); y += 11.5;
    }
    y += 23;
  }

  const signatureHeight = 140;
  ensure(signatureHeight + 80);
  y += 80;
  doc.setTextColor(17, 17, 17);
  // La fuente manuscrita no está disponible; Times italic sirve como respaldo provisional.
  doc.setFont("times", "italic"); doc.setFontSize(20);
  doc.text(cirujano.firma, WIDTH / 2, y, { align: "center" });
  y += 100;
  doc.setDrawColor(51, 51, 51); doc.setLineWidth(1.5); doc.line((WIDTH - 290) / 2, y, (WIDTH + 290) / 2, y);
  y += 26;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text(`Ced Prof. ${cirujano.cedula}`, WIDTH / 2, y, { align: "center" });

  const filenameName = data.paciente.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") || "Paciente";
  doc.save(`${filenameName}_${formatFileDate(data.paciente.fechaIngreso)}.pdf`);
}
