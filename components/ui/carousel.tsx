"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  slidesToShow?: number;
  slidesToShowMobile?: number;
  slidesToShowTablet?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function Carousel({
  children,
  className,
  slidesToShow = 1,
  slidesToShowMobile = 1,
  slidesToShowTablet = 2,
  autoPlay = false,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startXRef = React.useRef<number | null>(null);
  const scrollLeftRef = React.useRef<number>(0);
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const childrenArray = React.Children.toArray(children);
  const totalSlides = childrenArray.length;
  
  // Calculate slides to show based on screen size
  const [slidesPerView, setSlidesPerView] = React.useState(slidesToShow);

  React.useEffect(() => {
    const updateSlidesPerView = () => {
      let newSlidesPerView: number;
      if (window.innerWidth < 768) {
        newSlidesPerView = slidesToShowMobile;
      } else if (window.innerWidth < 1024) {
        newSlidesPerView = slidesToShowTablet;
      } else {
        newSlidesPerView = slidesToShow;
      }
      setSlidesPerView(newSlidesPerView);
    };

    updateSlidesPerView();
    window.addEventListener("resize", updateSlidesPerView);
    return () => window.removeEventListener("resize", updateSlidesPerView);
  }, [slidesToShow, slidesToShowMobile, slidesToShowTablet]);

  // Reset index when slides per view changes to prevent out-of-bounds
  React.useEffect(() => {
    const newMaxIndex = Math.max(0, totalSlides - slidesPerView);
    if (currentIndex > newMaxIndex) {
      setCurrentIndex(newMaxIndex);
    }
  }, [slidesPerView, totalSlides, currentIndex]);

  const maxIndex = Math.max(0, totalSlides - slidesPerView);

  const goToSlide = React.useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
  }, [maxIndex]);

  const nextSlide = React.useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = React.useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  // Auto-play logic
  React.useEffect(() => {
    if (autoPlay && !isPaused && totalSlides > slidesPerView) {
      autoPlayTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= maxIndex) {
            return 0; // Loop back to start
          }
          return prev + 1;
        });
      }, autoPlayInterval);
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlay, isPaused, autoPlayInterval, maxIndex, totalSlides, slidesPerView]);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    scrollLeftRef.current = currentIndex;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const x = e.touches[0].clientX;
    const diff = startXRef.current - x;
    
    // Prevent default scrolling while swiping horizontally
    if (Math.abs(diff) > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (startXRef.current === null) return;
    const x = e.changedTouches[0].clientX;
    const diff = startXRef.current - x;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    startXRef.current = null;
    setTimeout(() => setIsPaused(false), autoPlayInterval);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    containerRef.current?.addEventListener("keydown", handleKeyDown);
    return () => {
      containerRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, prevSlide]);

  return (
    <div
      className={cn("relative w-full", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
        role="region"
        aria-label="Carousel"
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
          }}
        >
          {childrenArray.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: `${100 / slidesPerView}%` }}
            >
              <div className="px-3">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > slidesPerView && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 z-10",
              "h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50",
              "shadow-lg hover:bg-background hover:shadow-xl",
              "disabled:opacity-0 disabled:pointer-events-none",
              "transition-all duration-200"
            )}
            onClick={prevSlide}
            disabled={currentIndex === 0}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 z-10",
              "h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50",
              "shadow-lg hover:bg-background hover:shadow-xl",
              "disabled:opacity-0 disabled:pointer-events-none",
              "transition-all duration-200"
            )}
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && totalSlides > slidesPerView && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                currentIndex === index
                  ? "w-8 bg-primary"
                  : "w-2 bg-border hover:bg-border/60"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
