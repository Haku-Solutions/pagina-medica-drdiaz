import Image from "next/image";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import "./footer.css";

interface FooterProps {
    quote: string;
    qrCode: string;
    instagram?: string;
    facebook?: string;
    email?: string;
}

export default function Footer({
    quote,  
    qrCode,
    instagram,
    facebook,
    email,
}: FooterProps) {
    
    return (
        <footer className="footer">
            <div className="footer-top">
                   <div className="footer-top-text"> 
                        <Image 
                            className="footer-logo"
                            src="/assets/logos/logo_drdiaz.svg"
                            alt="Logo Dr. José Díaz Zacarías"
                            width={60}
                            height={60}
                        />
                        <h2>Contáctate conmigo</h2>
                    </div>
                    <div className="footer-wabutton">
                        <WhatsAppButton
                            phone=""
                            message="Hola. Me gustaría agendar una cita." 
                    />
                    </div>
                    
            </div>

            <div className="footer-content">

                <section className="footer-quote">
                    <h2>DR. JOSÉ DÍAZ</h2>
                    <p>{quote}</p>

                </section>

                <section className="footer-qr">
                    <p className="footer-bottom-title">Tarjeta de presentación</p>
                    <Image 
                        src={qrCode}
                        alt="Código QR - Tarjeta de presentación Dr. José Díaz"
                        className="footer-qr-image"
                        width={150}
                        height={150}
                    />

                </section>

                <section className="footer-social">
                    <p className="footer-bottom-title">Redes sociales</p>

                    <ul className="footer-social-media">
                        {instagram && (
                            <li>
                                <a href={instagram} aria-label="Visitar perfil de Instagram">
                                    <FaInstagram />
                                    <span>Instagram</span>
                                </a>
                            </li>
                        )}

                        {facebook && (
                            <li>
                                <a href={facebook} aria-label="Visitar perfil de Facebook">
                                    <FaFacebookF />
                                    <span>Facebook</span>
                                </a>
                            </li>
                        )}

                        {email && (
                            <li>
                                <a href={`mailto:${email}`} aria-label="Enviar correo electrónico">
                                    <MdEmail />
                                    <span>{email}</span>
                                </a>
                            </li>
                        )}

                    </ul>

                </section>
            </div>

            <div className="footer-bottom">
                <section className="footer-bottom-left">
                        <Image 
                            className="footer-bottom-logo"
                            src="/assets/logos/logo_drdiaz.svg"
                            alt="Logo Dr. José Díaz Zacarías"
                            width={40}
                            height={40}
                        />
                        <p>Dr. José Díaz Zacarías</p>
                </section>
                <section className="footer-bottom-middle">
                        <p>Ced. Prof 12345677</p>
                </section>
                <section className="footer-bottom-right">
                        <p>Developed by Haku Solutions</p>
                </section>
            </div>
        </footer>
    );
}