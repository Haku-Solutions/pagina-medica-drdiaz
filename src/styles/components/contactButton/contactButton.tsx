import { FaWhatsapp } from "react-icons/fa";
import "./contactButton.css";
interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  text?: string;
}

export default function WhatsAppButton({
  phone,
  message = "",
  text = "CONTACTO",
}: WhatsAppButtonProps) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
    >
      <FaWhatsapp className="btn-icon" />

      <span>{text}</span>
    </a>
  );
}