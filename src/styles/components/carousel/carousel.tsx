"use client";
import React, { useState, useEffect } from 'react';
import './carousel.css';


interface CarouselProps {
  children: React.ReactNode[];
  itemsPerPage?: number; 
}

export const Carousel: React.FC<CarouselProps> = ({ children, itemsPerPage = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);


  // Filtrar nodos válidos para evitar errores si viene un null o undefined
  const validChildren = React.Children.toArray(children);
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setVisibleItems(1); 
      } else if (width < 1024) {
        setVisibleItems(2); 
      } else if (width < 1280) {
        setVisibleItems(3); 
      } else {
        setVisibleItems(itemsPerPage); 
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerPage]);

  const totalPages = Math.ceil(validChildren.length / visibleItems);

  if (currentIndex > totalPages - 1) {
    setCurrentIndex(totalPages - 1);
  }

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
      <div className="carousel-window">
        <div 
          className="carousel-track" 
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {validChildren.map((child, index) => (
            <div 
              className="carousel-item" 
              key={index}
              style={{ flex: `0 0 ${100 / visibleItems}%` }}
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