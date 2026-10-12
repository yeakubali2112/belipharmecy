import React from 'react';
import { useShop } from '../context/ShopContext';

export const Hero = () => {
  const { lang } = useShop();

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#123184] via-[#0e2669] to-[#02975E] text-white py-8 sm:py-10 px-4">
      {/* Decorative background blurs using #02975E and #123184 */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#02975E]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#123184]/50 rounded-full blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {lang === 'bn' ? (
              <>
                <span className="hero-animated-title-line1">
                  প্রয়োজনে দ্রুত আসল ওষুধ
                </span>
                <br />
                <span className="hero-animated-title-line2">
                  পৌঁছে যাবে আপনার দোরগোড়ায়
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
              ? 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।'
              : 'Upload your prescription or search by medicine name. Verified by registered pharmacists, delivered genuine to your home 24/7.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
