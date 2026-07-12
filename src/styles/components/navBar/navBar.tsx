import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";

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
        <nav>
            <div>
                <h1>{title}</h1>
                <p>{subtitle}</p>
            </div>

            <ul>
                {links.map((link) => (
                    <li key={link.href}>
                        <a href={link.href}>{link.label}</a>
                    </li>
                ))}
            </ul>

            <WhatsAppButton
                phone=""
                message="Hola. Me gustaría agendar una cita." />
        </nav>
    );
}