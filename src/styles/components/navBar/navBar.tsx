import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import "./navBar.css";

interface Link {
    label: string;
    href?: string;
}

interface NavBarProps {
    title: string;
    subtitle: string;
    links: Link[];
}

export default function NavBar({
    title,
    subtitle,
    links,
}: NavBarProps) {
    return ( 
        <nav className="navbar">    
            <div className="navbar-title">
                <img 
                    className="navbar-logo"
                    src="/assets/logos/logo_drdiaz.svg"
                    alt="Logo"
                />
                <div className="navbar-text">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>
            <div className="navbar-menu">
                <ul className="navbar-links">
                    {links.map((link) => (
                        <li key={link.href}>
                            <a href={link.href}>{link.label}</a>
                        </li>
                    ))}
                </ul>
                <WhatsAppButton
                    phone=""
                    message="Hola. Me gustaría agendar una cita." />
            </div>
        </nav>
    );
}