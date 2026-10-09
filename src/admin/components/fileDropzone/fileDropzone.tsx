"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { HiArrowUpTray } from "react-icons/hi2";
import "./fileDropzone.css";

interface FileDropzoneProps {
  onFilesSelected: (files: FileList | null) => void;
}

export default function FileDropzone({ onFilesSelected }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => onFilesSelected(event.target.files);
  const handleDrop = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); onFilesSelected(event.dataTransfer.files); };

  return <div className={`nota-dropzone${isDragging ? " is-dragging" : ""}`} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click(); }}>
    <input ref={fileInputRef} className="nota-file-input" type="file" multiple onChange={handleFileChange} /><span className="nota-upload-icon"><HiArrowUpTray aria-hidden="true" /></span><strong>Sube Archivos</strong><span>Selecciona esta área tu contenido para que se pueda subir</span><small>Haz clic para elegir o arrastra tus archivos aquí</small>
  </div>;
}
