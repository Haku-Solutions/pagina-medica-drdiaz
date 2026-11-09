import { FaFacebookMessenger } from "react-icons/fa";
import "./messengerButton.css";
interface MessengerButtonProps {
  username: string;
  text?: string;
}

export default function MessengerButton({
  username,
  text = "CONTACTO",
}: MessengerButtonProps) {
  const url = `https://m.me/${username}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="messenger-button"
    >
      <FaFacebookMessenger className="btn-icon" />

      <span>{text}</span>
    </a>
  );
}