import { HiClipboardDocumentList } from "react-icons/hi2";
import type { Paciente } from "./pacientes";
import "./pacienteRow.css";

interface PacienteRowProps {
  paciente: Paciente;
  onVerExpediente?: (paciente: Paciente) => void;
}

export default function PacienteRow({
  paciente,
  onVerExpediente,
}: PacienteRowProps) {
  return (
    <li className="paciente-row">
      <HiClipboardDocumentList className="paciente-row-icon" />

      <div className="paciente-row-info">
        <p className="paciente-row-nombre">{paciente.nombre}</p>
      </div>

      <button
        type="button"
        className="paciente-row-ver"
        onClick={() => onVerExpediente?.(paciente)}
        aria-label={`Ver expediente de ${paciente.nombre}`}
      >
        Ver Expediente
      </button>
    </li>
  );
}
