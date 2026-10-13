import { HiCalendarDays } from "react-icons/hi2";
import "./dateField.css";


interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function DateField({ label, value, onChange, required }: DateFieldProps) {
  return <label className="nota-field nota-date-field"><span>{label}{required && "*"}</span><div className="nota-date-wrap"><input type="date" placeholder="00/00/0000" value={value} onChange={(event) => onChange(event.target.value)} required={required} /><HiCalendarDays aria-hidden="true" /></div></label>;
}