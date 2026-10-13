import { HiChevronDown } from "react-icons/hi2";
import "./selectField.css";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}

export default function SelectField({ label, name, value, options, onChange, required }: SelectFieldProps) {
  return <label className="nota-field">
    <span>{label}{required  && "*"}</span>
    <div className="select-wrapper">
      <select value={value} onChange={(event) => onChange(event.target.value)} required={required}>
        <option value="">Selecciona una opción</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <HiChevronDown className="select-arrow"/>
    </div>
  </label>;
}
