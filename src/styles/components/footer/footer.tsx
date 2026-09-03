import Image from "next/image";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import MessengerButton from "../messengerButton/messengerButton";
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
                        <MessengerButton
                                                username="61592800274943"
                                                text="CONTACTO"
                        />
                    </div>
                    
            </div>

            <div className="footer-content">

                <section className="footer-quote">
                    <p>{quote}</p>

                </section>

                <section className="footer-certification">
                    <p className="footer-bottom-title">Cédulas profesionales</p>
                    
                        <ul className="footer-certification-list">
                            <li> Ced. Profesional: 2391817</li>
                            <li> Ced. Especialidad: 4964110</li>
                        </ul>
                    
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

                        <li>
                            <a href={facebook}>
                                <FaFacebookF />
                                <span>DR. JOSÉ DÍAZ</span>
                            </a>
                        </li>

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
                        <p>Ced. Prof 2391817</p>
                </section>
                <section className="footer-bottom-right">
                        <p>Developed by Haku Dev</p>
                </section>
            </div>
        </footer>
    );
}