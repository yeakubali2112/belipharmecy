import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const DEFAULT_POPUP_IMAGE = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80';

export const AdPopupModal = () => {
  const { 
    adBanner, 
    isAdModalOpen, 
    setIsAdModalOpen, 
    currentView,
    lang 
  } = useShop();

  const [timeLeft, setTimeLeft] = useState(6);
  const [isHovered, setIsHovered] = useState(false);

  // Automatically trigger popup on page load ONLY in store view (when ad is active and has an image)
  useEffect(() => {
    if (currentView === 'admin') return; // Do not interrupt admin workflow with auto popup
    if (!adBanner?.isActive || !adBanner?.imageUrl) return;

    // Delay slightly (700ms) so website renders smoothly before popup appears
    const timer = setTimeout(() => {
      setIsAdModalOpen(true);
    }, 700);

    return () => clearTimeout(timer);
  }, [adBanner?.isActive, adBanner?.imageUrl, currentView]);

  // Auto-dismiss countdown (pauses on hover)
  useEffect(() => {
    if (!isAdModalOpen) {
      setTimeLeft(6);
      return;
    }

    setTimeLeft(6);
    const interval = setInterval(() => {
      if (isHovered) return; // Pause countdown while reading/hovering
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsAdModalOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdModalOpen, isHovered, setIsAdModalOpen]);

  if (!isAdModalOpen) {
    return null;
  }

  const activeImage = adBanner?.imageUrl || DEFAULT_POPUP_IMAGE;

  const handleClose = () => {
    setIsAdModalOpen(false);
  };

  const handleImageClick = () => {
    setIsAdModalOpen(false);
    const catalogEl = document.getElementById('medicines-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md sm:max-w-lg bg-transparent rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-center group"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Floating Close Button with countdown timer */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-black/85 hover:bg-black text-white flex items-center gap-1.5 shadow-xl transition-transform hover:scale-105 cursor-pointer border border-white/20"
          title={lang === 'bn' ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
        >
          <span className="text-[11px] text-emerald-400 font-mono font-extrabold">{timeLeft}s</span>
          <X className="w-4 h-4 text-slate-300 hover:text-white" />
        </button>

        {currentView === 'admin' && (
          <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-[#123184]/90 backdrop-blur-md text-white text-[11px] font-bold shadow-lg border border-white/20 flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>লাইভ টেস্ট প্রিভিউ</span>
          </div>
        )}

        {/* Pure Ad Photo Banner (Clickable) */}
        <div 
          onClick={handleImageClick}
          className="relative w-full overflow-hidden rounded-2xl cursor-pointer shadow-2xl bg-slate-900/10"
        >
          <img 
            src={activeImage} 
            alt="Offer Ad" 
            className="w-full max-h-[82vh] object-contain rounded-2xl transition-transform duration-300 group-hover:scale-101"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_POPUP_IMAGE;
            }}
          />
        </div>
      </div>
    </div>
  );
};
