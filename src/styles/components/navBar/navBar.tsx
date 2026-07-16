"use client";

import { useState, useEffect } from "react";
import { HiBars3, HiXMark } from "react-icons/hi2"; 
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
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1150) {
                setIsOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return ( 
        <>
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
                                <a href={link.href}>
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <WhatsAppButton
                        phone=""
                        message="Hola. Me gustaría agendar una cita." 
                    />

                </div>

                <button 
                    className="navbar-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <HiXMark /> : <HiBars3 />}

                </button>
            </nav>

            <div
                className={`menu-overlay ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(false)}
            ></div>

            <div className={`navbar-mobile ${isOpen ? "open" : ""}`}>
                <ul className="navbar-links">
                    {links.map((link) => (
                        <li key={link.href}>
                            <a 
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>

                <WhatsAppButton
                    phone=""
                    message="Hola. Me gustaría agendar una cita." 
                />
            </div>

        </>   
    );
}