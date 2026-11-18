export const MAX_IMAGE_SOURCE_BYTES = 50 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 2048;
export const MAX_COMPRESSED_IMAGE_BYTES = 3.5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ACCEPTED_HEIC_TYPES = new Set(["image/heic", "image/heif"]);
const HEIC_EXTENSIONS = new Set(["heic", "heif"]);
const QUALITY_STEPS = [0.82, 0.75, 0.68, 0.6];

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
}

function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("No se pudo codificar la imagen.")),
      mimeType,
      quality,
    );
  });
}

async function encode(canvas: HTMLCanvasElement, quality: number) {
  try {
    const webp = await encodeCanvas(canvas, "image/webp", quality);
    if (webp.type === "image/webp") return webp;
  } catch {
    // Algunos navegadores no implementan la codificación WebP en canvas.
  }
  const jpeg = await encodeCanvas(canvas, "image/jpeg", quality);
  if (jpeg.type !== "image/jpeg") {
    throw new Error("Este navegador no puede recodificar la imagen en un formato compatible.");
  }
  return jpeg;
}

export async function comprimirImagen(file: File): Promise<CompressedImage> {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const heicInput = ACCEPTED_HEIC_TYPES.has(file.type) || HEIC_EXTENSIONS.has(extension);
  const recognizedType = ACCEPTED_IMAGE_TYPES.has(file.type) || ACCEPTED_HEIC_TYPES.has(file.type);
  const recognizedExtension = ["jpg", "jpeg", "png", "webp"].includes(extension);
  if (
    file.type === "image/gif" || file.type === "image/svg+xml" ||
    (!recognizedType && !(heicInput || (!file.type && recognizedExtension)))
  ) {
    throw new Error("Formato no compatible. Usa una imagen JPEG, PNG o WEBP. Se intentará abrir HEIC si el navegador lo soporta; GIF y SVG no están admitidos.");
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SOURCE_BYTES) {
    throw new Error("La imagen está vacía o supera el tamaño de origen permitido (50 MB).");
  }
  if (typeof createImageBitmap !== "function") {
    throw new Error("Este navegador no permite optimizar imágenes. Prueba con una versión reciente de Chrome, Edge o Safari.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("No se pudo abrir esta imagen. Si es HEIC, conviértela a JPEG y vuelve a intentarlo.");
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    let width = Math.max(1, Math.round(bitmap.width * scale));
    let height = Math.max(1, Math.round(bitmap.height * scale));

    while (width > 0 && height > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("No se pudo preparar el espacio para optimizar la imagen.");
      context.drawImage(bitmap, 0, 0, width, height);

      for (const quality of QUALITY_STEPS) {
        const blob = await encode(canvas, quality);
        if (blob.size <= MAX_COMPRESSED_IMAGE_BYTES) return { blob, width, height };
      }

      if (width <= 512 && height <= 512) break;
      const shrink = 0.85;
      width = Math.max(1, Math.floor(width * shrink));
      height = Math.max(1, Math.floor(height * shrink));
    }
    throw new Error("No se pudo reducir la imagen a menos de 3.5 MB. Prueba con otra imagen o reduce su tamaño.");
  } finally {
    bitmap.close();
  }
}
