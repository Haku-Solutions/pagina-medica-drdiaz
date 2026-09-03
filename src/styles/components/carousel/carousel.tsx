"use client";
import React, { useState, useEffect, useRef } from 'react';
import './carousel.css';

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerPage?: number; 
}

export const Carousel: React.FC<CarouselProps> = ({ children, itemsPerPage = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(itemsPerPage);
  
  // Estados para control de Swipe / Drag
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragPercent, setDragPercent] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  
  const trackRef = useRef<HTMLDivElement>(null);

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
    setCurrentIndex(Math.max(0, totalPages - 1));
  }

  const baseTranslate = -(currentIndex * 100);
  const currentTranslate = isDragging ? baseTranslate + dragPercent : baseTranslate;

  // Manejadores de arrastre (Mouse y Touch)
  const handleTouchStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setDragPercent(0);
    setDragDistance(0);
  };

  const handleTouchMove = (clientX: number) => {
    if (!isDragging || !trackRef.current) return;
    const diff = clientX - startX;
    setDragDistance(Math.abs(diff));
    
    const containerWidth = trackRef.current.offsetWidth;
    const movePercent = (diff / containerWidth) * 100;
    setDragPercent(movePercent);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragDistance < 5) {
      setDragPercent(0);
      return;
    }

    if (dragPercent < -15 && currentIndex < totalPages - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (dragPercent > 15 && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
    
    setDragPercent(0);
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragDistance >= 5) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="carousel-container">
      <div 
        className="carousel-window"
        onMouseDown={(e) => handleTouchStart(e.clientX)}
        onMouseMove={(e) => handleTouchMove(e.clientX)}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleTouchMove(e.touches[0].clientX)}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          ref={trackRef}
          className="carousel-track" 
          style={{ 
            transform: `translateX(${currentTranslate}%)`,
            transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onClickCapture={handleClickCapture}
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
        <button 
          className="carousel-arrow" 
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1))} 
          aria-label="Anterior"
        >
          &larr;
        </button>
        
        <div className="carousel-dots">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir a página ${index + 1}`}
            />
          ))}
        </div>

        <button 
          className="carousel-arrow" 
          onClick={() => setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1))} 
          aria-label="Siguiente"
        >
          &rarr;
        </button>
      </div>
    </div>
  );
};
