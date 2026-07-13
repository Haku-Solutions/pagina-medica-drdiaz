"use client";
import React, { useState } from 'react';
import './carousel.css';


interface CarouselProps {
  children: React.ReactNode[];
  itemsPerPage?: number; // Por si quieres mostrar 1, 2 o 3 elementos por vista
}

export const Carousel: React.FC<CarouselProps> = ({ children, itemsPerPage = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filtrar nodos válidos para evitar errores si viene un null o undefined
  const validChildren = React.Children.toArray(children);
  const totalPages = Math.ceil(validChildren.length / itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="carousel-container">
      {/* Ventana de visualización de las tarjetas */}
      <div className="carousel-window">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validChildren.map((child, index) => (
            <div 
              className="carousel-item" 
              key={index}
              style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Controles inferiores del carrusel */}
      <div className="carousel-controls">
        <button className="carousel-arrow" onClick={handlePrev} aria-label="Anterior">
          &larr;
        </button>
        
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>

        <button className="carousel-arrow" onClick={handleNext} aria-label="Siguiente">
          &rarr;
        </button>
      </div>
    </div>
  );
};