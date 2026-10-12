import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AdPopupModal = () => {
  const { 
    adBanner, 
    isAdModalOpen, 
    setIsAdModalOpen, 
    lang 
  } = useShop();

  const [timeLeft, setTimeLeft] = useState(5);

  // Automatically trigger popup on page load if active
  useEffect(() => {
    if (!adBanner?.isActive || !adBanner?.imageUrl) return;

    // Delay slightly (600ms) so website renders smoothly before popup appears
    const timer = setTimeout(() => {
      setIsAdModalOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [adBanner?.isActive, adBanner?.imageUrl]);

  // Auto-dismiss after exactly 5 seconds
  useEffect(() => {
    if (!isAdModalOpen) {
      setTimeLeft(5);
      return;
    }

    setTimeLeft(5);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsAdModalOpen(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAdModalOpen, setIsAdModalOpen]);

  if (!isAdModalOpen || !adBanner?.isActive || !adBanner?.imageUrl) {
    return null;
  }

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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md sm:max-w-lg bg-transparent rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-center group"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button with 5-second countdown timer */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 z-30 px-2.5 h-8 sm:h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer border border-white/20"
          title={lang === 'bn' ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
        >
          <span className="text-[11px] text-emerald-400 font-mono font-extrabold">{timeLeft}s</span>
          <X className="w-4 h-4 text-slate-300 hover:text-white" />
        </button>

        {/* Pure Ad Photo Banner (Clickable) */}
        <div 
          onClick={handleImageClick}
          className="relative w-full overflow-hidden rounded-xl cursor-pointer shadow-2xl bg-slate-900/10"
        >
          <img 
            src={adBanner.imageUrl} 
            alt="Offer Ad" 
            className="w-full max-h-[82vh] object-contain rounded-xl transition-transform duration-300 group-hover:scale-101"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80';
            }}
          />
        </div>
      </div>
    </div>
  );
};
