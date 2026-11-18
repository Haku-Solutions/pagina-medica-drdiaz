import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_DECODED_PIXELS = 50_000_000;
export const MAX_PROCESSED_BYTES = 3.5 * 1024 * 1024;

export class ImageUploadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function formatoPorMagicBytes(buffer: Buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (
    buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) return "webp";
  return null;
}

export async function processUploadedImage(buffer: Buffer) {
  if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
    throw new ImageUploadError("La imagen supera el límite de 4 MB.", 413);
  }
  const magicFormat = formatoPorMagicBytes(buffer);
  if (!magicFormat) throw new ImageUploadError("El archivo no es una imagen JPEG, PNG o WEBP válida.");

  try {
    const input = sharp(buffer, { limitInputPixels: false, failOn: "error" });
    const metadata = await input.metadata();
    if (metadata.format !== magicFormat || !metadata.width || !metadata.height) {
      throw new ImageUploadError("El contenido de la imagen no es válido.");
    }
    if (metadata.width * metadata.height > MAX_DECODED_PIXELS) {
      throw new ImageUploadError("La imagen supera el límite de 50 megapíxeles.", 413);
    }

    const dimensions = [2048, 1740, 1479, 1257, 1068, 908, 772, 656, 558, 474, 403, 343, 292, 248, 211, 180];
    for (const dimension of dimensions) {
      for (const quality of [82, 75, 68, 60]) {
        const output = await sharp(buffer, { limitInputPixels: MAX_DECODED_PIXELS, failOn: "error" })
          .rotate()
          .resize({ width: dimension, height: dimension, fit: "inside", withoutEnlargement: true })
          .webp({ quality, effort: 4 })
          .toBuffer();
        if (output.length <= MAX_PROCESSED_BYTES) {
          return { buffer: output, contentType: "image/webp" as const };
        }
      }
    }
    throw new ImageUploadError("No se pudo optimizar la imagen por debajo de 3.5 MB.", 413);
  } catch (error) {
    if (error instanceof ImageUploadError) throw error;
    throw new ImageUploadError("No se pudo decodificar la imagen. Verifica que sea una JPEG, PNG o WEBP válida.");
  }
}
