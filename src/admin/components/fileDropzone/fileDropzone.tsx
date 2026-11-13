"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { HiArrowUpTray, HiDocumentText, HiTrash } from "react-icons/hi2";
import "./fileDropzone.css";

export interface DropzoneFile {
  id: string;
  name: string;
  size?: number;
  uploaded?: boolean;
  deleting?: boolean;
}

interface FileDropzoneProps {
  files: DropzoneFile[];
  onFilesSelected: (files: FileList | null) => void;
  onRemoveFile: (id: string) => void;
  disabled?: boolean;
}

export default function FileDropzone({
  files,
  onFilesSelected,
  onRemoveFile,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(event.target.files);
    event.target.value = "";
  };
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) onFilesSelected(event.dataTransfer.files);
  };

  return (
    <>
      <div
        className={`nota-dropzone${isDragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          className="nota-file-input"
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          multiple
          disabled={disabled}
          onChange={handleFileChange}
        />
        <span className="nota-upload-icon">
          <HiArrowUpTray aria-hidden="true" />
        </span>
        <strong>Sube Archivos</strong>
        <span>Formatos permitidos: PNG, JPEG y WEBP</span>
        <small>Haz clic para elegir o arrastra tus archivos aquí</small>
      </div>

      {files.length > 0 && (
        <ul className="nota-file-list">
          {files.map((file) => (
            <li key={file.id}>
              <HiDocumentText aria-hidden="true" />
              <span>{file.name}</span>
              {file.uploaded ? (
                <small>Subido</small>
              ) : typeof file.size === "number" ? (
                <small>{(file.size / 1024).toFixed(0)} KB</small>
              ) : null}
              <button
                className="nota-file-remove"
                type="button"
                aria-label={`Eliminar ${file.name}`}
                title={`Eliminar ${file.name}`}
                disabled={disabled || file.deleting}
                onClick={() => onRemoveFile(file.id)}
              >
                <HiTrash aria-hidden="true" />
                <span>{file.deleting ? "Eliminando…" : "Eliminar"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
