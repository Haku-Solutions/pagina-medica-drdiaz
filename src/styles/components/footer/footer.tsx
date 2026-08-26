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
                        <img 
                            className="footer-logo"
                            src="/assets/logos/logo_drdiaz.svg"
                            alt="Logo"
                        />
                        <h1>Contáctate conmigo</h1>
                    </div>
                    <div className="footer-wabutton">
                        <MessengerButton
                                                username="1245458325315373"
                                                text="CONTACTO"
                        />
                    </div>
                    
            </div>

            <div className="footer-content">

                <section className="footer-quote">
                    <p>{quote}</p>

                </section>

                <section className="footer-qr">
                    <p className="footer-bottom-title">Tarjeta de presentación</p>
                    <img 
                        src={qrCode}
                        alt="Código QR"
                        className="footer-qr-image"
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

                        <li>
                            <a href={`mailto:${email}`}>
                                <MdEmail />
                                <span>jossdiz@hotmail.com</span>
                            </a>
                        </li>

                    </ul>

                </section>
            </div>

            <div className="footer-bottom">
                <section className="footer-bottom-left">
                        <img 
                            className="footer-bottom-logo"
                            src="/assets/logos/logo_drdiaz.svg"
                            alt="Logo"
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