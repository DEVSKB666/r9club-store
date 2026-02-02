'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Slide {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
}

interface HeroSliderProps {
  slides?: Slide[];
  autoPlayInterval?: number;
}

export function HeroSlider({ slides = [], autoPlayInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const goToSlide = useCallback((index: number, dir: 'left' | 'right' = 'right') => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setDirection(dir);
    setPrevIndex(currentIndex);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [currentIndex, isAnimating]);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const next = (currentIndex + 1) % slides.length;
    goToSlide(next, 'right');
  }, [slides.length, currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    const prev = (currentIndex - 1 + slides.length) % slides.length;
    goToSlide(prev, 'left');
  }, [slides.length, currentIndex, goToSlide]);

  const handleDotClick = (index: number) => {
    const dir = index > currentIndex ? 'right' : 'left';
    goToSlide(index, dir);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const timer = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length, autoPlayInterval, nextSlide]);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl group">
      {/* Slides Container */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const isVisible = isActive || (isAnimating && isPrev);
        
        if (!isVisible) return null;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              isActive
                ? 'opacity-100 scale-100 z-10'
                : 'opacity-0 scale-105 z-0'
            } ${
              isAnimating && isActive
                ? direction === 'right'
                  ? 'animate-slide-in-right'
                  : 'animate-slide-in-left'
                : ''
            } ${
              isAnimating && isPrev
                ? direction === 'right'
                  ? 'animate-slide-out-left'
                  : 'animate-slide-out-right'
                : ''
            }`}
          >
            {/* Background Image with Ken Burns effect */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[8000ms] ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
              style={{ backgroundImage: `url(${slide.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center z-10">
              <div className="max-w-7xl mx-auto px-8 w-full">
                <div className="max-w-xl space-y-6">
                  {slide.title && (
                    <h2
                      className={`text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 drop-shadow-2xl transition-all duration-700 ${
                        isActive && !isAnimating
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: '200ms' }}
                    >
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p
                      className={`text-lg md:text-2xl text-white/90 drop-shadow-lg transition-all duration-700 ${
                        isActive && !isAnimating
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: '400ms' }}
                    >
                      {slide.description}
                    </p>
                  )}
                  {slide.linkUrl && (
                    <div
                      className={`transition-all duration-700 ${
                        isActive && !isAnimating
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-8'
                      }`}
                      style={{ transitionDelay: '600ms' }}
                    >
                      <Link
                        href={slide.linkUrl}
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-lg transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
                      >
                        {slide.buttonText || 'เลือกซื้อสินค้า'}
                        <ChevronRightIcon className="w-5 h-5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/20 z-20"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            disabled={isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border border-white/20 z-20"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`relative h-3 rounded-full transition-all duration-500 overflow-hidden ${
                index === currentIndex ? 'w-10 bg-white' : 'w-3 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex && isAutoPlaying && (
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 origin-left"
                  style={{
                    animation: `progress ${autoPlayInterval}ms linear`,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md text-white text-sm font-medium z-20">
        {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>

      <style jsx>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-out-left {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        }
        
        @keyframes slide-out-right {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.7s ease-out forwards;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.7s ease-out forwards;
        }
        
        .animate-slide-out-left {
          animation: slide-out-left 0.7s ease-out forwards;
        }
        
        .animate-slide-out-right {
          animation: slide-out-right 0.7s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
