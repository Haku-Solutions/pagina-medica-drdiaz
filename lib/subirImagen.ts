export interface ImagenUploadResult {
  ok: boolean;
  data?: { _id?: string };
  error?: string;
}

export function subirImagen(
  idNota: string,
  nombreOriginal: string,
  imagen: Blob,
  onProgress: (percent: number) => void,
): Promise<ImagenUploadResult> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("archivo", imagen, imagen.type === "image/webp" ? "imagen.webp" : "imagen.jpg");
    form.append("idNota", idNota);
    form.append("nombreArchivo", nombreOriginal);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/archivos");
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    request.onerror = () => reject(new Error("No se pudo conectar para subir la imagen."));
    request.onload = () => {
      let result: ImagenUploadResult | null = null;
      try {
        result = JSON.parse(request.responseText) as ImagenUploadResult;
      } catch {
        // El servidor puede rechazar la solicitud antes de devolver JSON.
      }
      if (request.status < 200 || request.status >= 300 || !result?.ok) {
        reject(new Error(result?.error || (request.status === 413
          ? "La imagen excede el límite de carga del servidor."
          : `No se pudo subir la imagen (${request.status || "sin respuesta"}).`)));
        return;
      }
      resolve(result);
    };
    request.send(form);
  });
}
