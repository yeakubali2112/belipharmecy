import React from 'react';
import { 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Clock, 
  HeartHandshake, 
  Lock, 
  Pill,
  Award,
  ChevronRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer = () => {
  const { 
    config, 
    lang, 
    setIsPrescriptionModalOpen, 
    setIsOrderTrackingModalOpen, 
    setIsHealthToolsModalOpen,
    setIsCustomerProfileOpen,
    navigateTo,
    setSelectedCategory
  } = useShop();

  return (
    <footer className="bg-[#0b1b44] text-slate-300 pt-14 pb-8 border-t border-[#123184]/50">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Intro */}
          <div className="space-y-4">
            <div className="inline-block bg-white p-2.5 rounded-2xl shadow-md">
              <img 
                src="/logo.png" 
                alt="বেলী ফার্মেসি" 
                className="h-10 md:h-11 w-auto object-contain"
              />
            </div>

            <p className="text-xs text-blue-200/80 leading-relaxed">
              {lang === 'bn' 
                ? 'বেলী ফার্মেসি সরকার অনুমোদিত লাইসেন্সধারী রিটেইল ও অনলাইন ফার্মেসি। আমরা নিশ্চিত করি ১০০% আসল ওষুধ, সঠিক কোল্ড চেইন এবং রেজিস্টার্ড ফার্মাসিস্টের পরামর্শ।'
                : 'Beli Pharmacy is a licensed online & retail pharmacy ensuring genuine medicines, cold chain storage, and 24/7 pharmacist care.'
              }
            </p>

            <div className="pt-2 text-xs space-y-1.5 text-blue-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#02975E] shrink-0" />
                <span>{config.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#02975E] shrink-0" />
                <span>
                  {lang === 'bn' ? 'হটলাইন:' : 'Hotline:'}{' '}
                  <a 
                    href="tel:01774961757" 
                    className="hover:underline text-white font-bold tracking-wide"
                  >
                    {lang === 'bn' ? '০১৭৭৪ ৯৬১৭৫৭' : '01774 961757'}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {lang === 'bn' ? 'জরুরি সেবাসমূহ' : 'Quick Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setIsCustomerProfileOpen(true)}
                  className="hover:text-[#02975E] text-blue-100 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>{lang === 'bn' ? 'আমার প্রোফাইল ও অর্ডার হিস্ট্রি' : 'My Profile & Orders'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>{lang === 'bn' ? 'প্রেসক্রিপশন আপলোড করে ওষুধ আনুন' : 'Upload Prescription'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsOrderTrackingModalOpen(true)}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>{lang === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং ও ইনভয়েস' : 'Live Order Tracking'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsHealthToolsModalOpen(true)}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>{lang === 'bn' ? 'বিএমআই (BMI) ক্যালকুলেটর' : 'BMI Calculator'}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsHealthToolsModalOpen(true)}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>{lang === 'bn' ? 'জরুরি অ্যাম্বুলেন্স ও হেল্পলাইন' : 'Emergency Numbers'}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Medicine Categories */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {lang === 'bn' ? 'ওষুধের ক্যাটাগরি' : 'Top Categories'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setSelectedCategory('otc')}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>জ্বর, সর্দি ও শরীর ব্যথা (OTC)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('gastric')}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>গ্যাস্ট্রিক ও বুক জ্বালাপোড়া</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('diabetes')}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>ডায়াবেটিস কেয়ার ও স্ট্রিপস</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('vitamins')}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>মাল্টিভিটামিন ও খনিজ উপাদান</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSelectedCategory('baby_mom')}
                  className="hover:text-[#02975E] text-blue-100/90 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-3 h-3 text-[#02975E]" />
                  <span>শিশু খাদ্য ও মাতৃত্বকালীন যত্ন</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Trust Badges & Admin portal access */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">
              {lang === 'bn' ? 'নিরাপত্তা ও নিশ্চয়তা' : 'Trust & Quality'}
            </h4>

            <div className="bg-[#123184]/40 p-3.5 rounded-2xl border border-[#02975E]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#02975E]" />
                <span>ঔষধ প্রশাসন অধিদপ্তর অনুমোদিত</span>
              </div>
            </div>
          </div>

        </div>

        {/* Payment Methods & Disclaimer strip */}
        <div className="pt-8 border-t border-blue-900/50 flex flex-wrap justify-between items-center gap-4 text-xs">
          <div className="text-blue-200 space-y-1">
            <p>© {new Date().getFullYear()} {config.name} ({config.nameBn}) - সর্বস্বত্ব সংরক্ষিত।</p>
            <p className="text-[11px] text-blue-300/70">
              * সতর্কতা: চিকিৎসকের প্রেসক্রিপশন বা রেজিস্টার্ড ফার্মাসিস্টের পরামর্শ ব্যতীত কোনো অ্যান্টিবায়োটিক বা ঘুমের ওষুধ গ্রহণ করবেন না।
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-blue-200 mr-1 font-semibold">পেমেন্ট মেথড:</span>
            <div className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs flex items-center h-6">
              <img src="/bkash-logo.png" alt="bKash" className="h-4 object-contain" />
            </div>
            <div className="bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs flex items-center h-6">
              <img src="/nagad-logo.png" alt="Nagad" className="h-4 object-contain" />
            </div>
            <span className="bg-[#123184] text-white px-2 py-1 rounded text-[10px] font-bold border border-blue-800">ক্যাশ অন ডেলিভারি</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
