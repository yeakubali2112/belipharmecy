import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Hero = () => {
  const { lang, heroBanner } = useShop();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef(null);

  // Normalize slides from heroBanner (supports both multi-slide array and legacy single imageUrl)
  const slides = useMemo(() => {
    if (heroBanner?.slides && Array.isArray(heroBanner.slides) && heroBanner.slides.length > 0) {
      return heroBanner.slides.filter(s => s && s.imageUrl);
    }
    if (heroBanner?.imageUrl) {
      return [{
        id: 'legacy-slide',
        imageUrl: heroBanner.imageUrl,
        showText: heroBanner.showText !== false,
        showOverlay: heroBanner.showOverlay !== false,
        titleLine1: heroBanner.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ',
        titleLine2: heroBanner.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়',
        subtitle: heroBanner.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।'
      }];
    }
    return [];
  }, [heroBanner]);

  // Keep index in bounds
  useEffect(() => {
    if (currentSlideIndex >= slides.length && slides.length > 0) {
      setCurrentSlideIndex(0);
    }
  }, [slides.length, currentSlideIndex]);

  // Auto-slide effect (cycles smoothly every configured interval)
  useEffect(() => {
    if (slides.length <= 1 || heroBanner?.autoSlide === false || isHovered) return;
    const intervalSeconds = Math.max(2, Number(heroBanner?.autoSlideInterval) || 5);
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [slides.length, heroBanner?.autoSlide, heroBanner?.autoSlideInterval, isHovered]);

  const goToNext = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    if (slides.length <= 1) return;
    setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || slides.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <div className="w-full bg-white py-3 sm:py-4 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/40 min-h-[190px] sm:min-h-[240px] md:min-h-[280px] flex items-center group transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* CASE 1: No Custom Slides -> Default Brand Gradient */}
          {slides.length === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#123184] via-[#0e2669] to-[#02975E] text-white py-8 sm:py-10 px-6 sm:px-10 flex items-center">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#02975E]/25 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#123184]/50 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 max-w-3xl space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {lang === 'bn' ? (
                    <>
                      <span className="hero-animated-title-line1">
                        {heroBanner?.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ'}
                      </span>
                      <br />
                      <span className="hero-animated-title-line2">
                        {heroBanner?.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="hero-animated-title-line1">
                        Genuine Medicines Delivered
                      </span>
                      <br />
                      <span className="hero-animated-title-line2">
                        Fast & Safe To Your Doorstep
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-blue-100/90 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
                  {lang === 'bn' 
                    ? (heroBanner?.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।')
                    : 'Upload your prescription or search by medicine name. Verified by registered pharmacists, delivered genuine to your home 24/7.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* CASE 2: Multi-Slide or Single Custom Banner Slides */}
          {slides.length > 0 && slides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            return (
              <div
                key={slide.id || index}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out flex items-center ${
                  isActive 
                    ? 'opacity-100 z-10 scale-100 pointer-events-auto' 
                    : 'opacity-0 z-0 scale-[1.02] pointer-events-none'
                }`}
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              >
                {/* Dark gradient overlay for text readability */}
                {slide.showOverlay !== false && (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/70 to-slate-900/30 pointer-events-none"></div>
                )}

                {/* Slide Text Content */}
                {slide.showText !== false && (
                  <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10 max-w-3xl space-y-4 text-white">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                      {lang === 'bn' ? (
                        <>
                          <span className="hero-animated-title-line1">
                            {slide.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ'}
                          </span>
                          <br />
                          <span className="hero-animated-title-line2">
                            {slide.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="hero-animated-title-line1">
                            Genuine Medicines Delivered
                          </span>
                          <br />
                          <span className="hero-animated-title-line2">
                            Fast & Safe To Your Doorstep
                          </span>
                        </>
                      )}
                    </h1>

                    <p className="text-blue-100/90 text-sm md:text-base max-w-2xl font-normal leading-relaxed">
                      {lang === 'bn' 
                        ? (slide.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।')
                        : 'Upload your prescription or search by medicine name. Verified by registered pharmacists, delivered genuine to your home 24/7.'
                      }
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Slider Navigation Arrows (shown only when 2 or more slides exist) */}
          {slides.length > 1 && (
            <>
              {/* Prev Button */}
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 shadow-lg border border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={goToNext}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-85 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 shadow-lg border border-white/20 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                {slides.map((_, idx) => {
                  const isActive = idx === currentSlideIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        isActive 
                          ? 'w-6 sm:w-8 h-2 bg-[#02975E] shadow-sm' 
                          : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Slide Counter Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white/90 font-mono font-bold border border-white/15 pointer-events-none">
                {currentSlideIndex + 1} / {slides.length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
