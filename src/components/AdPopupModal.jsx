import React, { useState, useEffect } from 'react';
import { X, Sparkles, Tag, Check, ArrowRight, ExternalLink, Gift, FileText, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AdPopupModal = () => {
  const { 
    adBanner, 
    isAdModalOpen, 
    setIsAdModalOpen, 
    setIsPrescriptionModalOpen, 
    applyCoupon,
    showToast,
    lang 
  } = useShop();

  const [copied, setCopied] = useState(false);

  // Automatically trigger popup on page load if active and not dismissed for the day
  useEffect(() => {
    if (!adBanner?.isActive || !adBanner?.imageUrl) return;

    // Check if dismissed today
    const dismissedTimestamp = localStorage.getItem('beli_ad_dismissed_until');
    const now = Date.now();

    if (dismissedTimestamp && now < Number(dismissedTimestamp)) {
      // User chose "Don't show again today"
      return;
    }

    // Delay slightly (750ms) so website renders smoothly before popup appears
    const timer = setTimeout(() => {
      setIsAdModalOpen(true);
    }, 750);

    return () => clearTimeout(timer);
  }, [adBanner?.isActive, adBanner?.imageUrl]);

  if (!isAdModalOpen || !adBanner?.isActive || !adBanner?.imageUrl) {
    return null;
  }

  const handleClose = () => {
    setIsAdModalOpen(false);
  };

  const handleDismissToday = () => {
    // Dismiss for 24 hours
    const expireTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('beli_ad_dismissed_until', String(expireTime));
    setIsAdModalOpen(false);
    if (showToast) {
      showToast(lang === 'bn' ? 'অফারটি আজকের জন্য বন্ধ করা হয়েছে' : 'Offer dismissed for today', 'info');
    }
  };

  const handleCopyCoupon = (e) => {
    e?.stopPropagation();
    if (!adBanner.couponCode) return;
    navigator.clipboard?.writeText(adBanner.couponCode);
    setCopied(true);
    if (applyCoupon) {
      applyCoupon(adBanner.couponCode);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleActionClick = () => {
    setIsAdModalOpen(false);

    if (adBanner.buttonAction === 'prescription') {
      setIsPrescriptionModalOpen(true);
    } else {
      // Default: scroll smoothly to catalog
      const catalogEl = document.getElementById('medicines-catalog');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-black text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
          title={lang === 'bn' ? 'বিজ্ঞাপন বন্ধ করুন' : 'Close Ad'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ad Photo Banner (Clickable) */}
        <div 
          onClick={handleActionClick}
          className="relative w-full max-h-[300px] sm:max-h-[340px] overflow-hidden bg-slate-100 group cursor-pointer"
        >
          <img 
            src={adBanner.imageUrl} 
            alt={adBanner.title || 'Offer Ad'} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Badge over photo */}
          {adBanner.badgeText && (
            <div className="absolute bottom-3 left-3 bg-[#123184]/90 backdrop-blur-xs text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{adBanner.badgeText}</span>
            </div>
          )}
        </div>

        {/* Offer Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Title & Subtitle */}
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {adBanner.title || (lang === 'bn' ? 'বেলী ফার্মেসির বিশেষ অফার!' : 'Special Offer!')}
            </h3>
            {adBanner.subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {adBanner.subtitle}
              </p>
            )}
          </div>

          {/* Coupon Code Section (if provided) */}
          {adBanner.couponCode && (
            <div 
              onClick={handleCopyCoupon}
              className="flex items-center justify-between bg-amber-50 border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-2xl p-3 cursor-pointer transition-all hover:bg-amber-100/50 group"
              title="ক্লিক করে কোড কপি করুন"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-amber-800 font-bold block">
                    {lang === 'bn' ? 'অফার কুপন কোড:' : 'Promo Coupon Code:'}
                  </span>
                  <span className="font-mono text-sm sm:text-base font-black text-[#123184]">
                    {adBanner.couponCode}
                  </span>
                </div>
              </div>

              <button 
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#123184] hover:bg-[#0d2463] text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'কপি করুন' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Action CTA Button */}
          <button
            onClick={handleActionClick}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e2669] hover:to-[#02804f] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#02975E]/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            {adBanner.buttonAction === 'prescription' ? (
              <FileText className="w-5 h-5" />
            ) : (
              <ShoppingBag className="w-5 h-5" />
            )}
            <span>
              {adBanner.buttonText || (lang === 'bn' ? 'অফারটি লুফে নিন ও অর্ডার করুন' : 'Claim Offer & Order')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Bottom Bar: Dismiss Today & Close */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
            <button
              onClick={handleDismissToday}
              className="hover:text-slate-700 underline cursor-pointer"
            >
              {lang === 'bn' ? 'আজ আর দেখাবেন না' : "Don't show again today"}
            </button>
            <button
              onClick={handleClose}
              className="hover:text-slate-700 font-semibold cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন ✕' : 'Close ✕'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
