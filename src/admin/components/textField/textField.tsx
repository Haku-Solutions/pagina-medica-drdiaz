

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextField({ label, name, value, onChange }: TextFieldProps) {
  return <label className="nota-field" key={name}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
