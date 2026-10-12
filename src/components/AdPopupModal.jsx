import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AdPopupModal = () => {
  const { 
    adBanner, 
    isAdModalOpen, 
    setIsAdModalOpen, 
    lang 
  } = useShop();

  // Automatically trigger popup on page load if active
  useEffect(() => {
    if (!adBanner?.isActive || !adBanner?.imageUrl) return;

    // Delay slightly (600ms) so website renders smoothly before popup appears
    const timer = setTimeout(() => {
      setIsAdModalOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [adBanner?.isActive, adBanner?.imageUrl]);

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
        className="relative w-full max-w-md sm:max-w-lg bg-transparent rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-center group"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border border-white/20"
          title={lang === 'bn' ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pure Ad Photo Banner (Clickable) */}
        <div 
          onClick={handleImageClick}
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl cursor-pointer shadow-2xl bg-slate-900/10"
        >
          <img 
            src={adBanner.imageUrl} 
            alt="Offer Ad" 
            className="w-full max-h-[82vh] object-contain rounded-2xl sm:rounded-3xl transition-transform duration-300 group-hover:scale-101"
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
