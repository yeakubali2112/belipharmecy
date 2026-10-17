import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  ShoppingCart, 
  Search, 
  MapPin, 
  HeartPulse, 
  Clock, 
  Lock, 
  Menu, 
  X, 
  ChevronRight, 
  Activity, 
  PackageCheck, 
  Stethoscope, 
  Pill,
  User,
  FileText
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { searchMedicines, mergeSearchResults } from '../utils/medicineSearch';

export const Header = () => {
  const { 
    config, 
    cart, 
    cartSubtotal, 
    setIsCartOpen, 
    setIsPrescriptionModalOpen, 
    setIsOrderTrackingModalOpen,
    setIsHealthToolsModalOpen,
    setIsCustomerProfileOpen,
    currentCustomer,
    navigateTo,
    lang, 
    setLang,
    searchQuery,
    setSearchQuery,
    medicines,
    setSelectedMedicine,
    setSelectedCategory,
    medexLiveResults,
    isMedexLoading
  } = useShop();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Search filter suggestions - bilingual Bangladesh medicine search engine + Live MedEx integration
  const localResults = searchQuery.trim() === '' ? [] : searchMedicines(medicines, searchQuery).slice(0, 8);
  const searchResults = mergeSearchResults(localResults, medexLiveResults).slice(0, 10);

  // Typewriter text animation for search placeholder
  const searchPhrasesBn = [
    'ওষুধের নাম লিখুন (উদা: Napa Extra, Ace Plus)...',
    'গ্যাস্ট্রিকের ওষুধ খুঁজুন (উদা: Seclo 20mg, Pantonix)...',
    'অ্যান্টিবায়োটিক সার্চ করুন (উদা: Ciprocin, Zithrin)...',
    'অ্যালার্জি ও কাশির ওষুধ (উদা: Fexo 120mg, Tusca)...',
    'প্রেসার ও ডায়াবেটিসের ওষুধ (উদা: Comet, Bicozin)...',
    'জেনেরিক নাম লিখে খুঁজুন (উদা: Paracetamol, Omeprazole)...'
  ];

  const searchPhrasesEn = [
    'Search medicine by name (e.g. Napa Extra, Ace Plus)...',
    'Search gastric medicine (e.g. Seclo, Pantonix)...',
    'Search antibiotics (e.g. Ciprocin, Zithrin)...',
    'Search allergy & cough syrup (e.g. Fexo, Tusca)...',
    'Search diabetes & BP meds (e.g. Comet, Bicozin)...',
    'Search by generic name (e.g. Paracetamol, Omeprazole)...'
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const activePhrases = lang === 'bn' ? searchPhrasesBn : searchPhrasesEn;
  const currentPhrase = activePhrases[phraseIndex % activePhrases.length] || '';
  const animatedSearchPlaceholder = currentPhrase.slice(0, charIndex);

  useEffect(() => {
    if (searchQuery) return;

    let timer;
    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setCharIndex(prev => prev + 1);
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setCharIndex(prev => prev - 1);
        }, 25);
      } else {
        setIsDeleting(false);
        setPhraseIndex(prev => (prev + 1) % activePhrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, currentPhrase, searchQuery, activePhrases.length]);

  useEffect(() => {
    setCharIndex(0);
    setIsDeleting(false);
  }, [lang]);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchContainerRef.current && !mobileSearchContainerRef.current.contains(e.target)) {
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      {/* Top Utility Bar in Brand Navy Blue #123184 */}
      <div className="bg-[#123184] text-white text-xs py-1.5 px-4 hidden md:block border-b border-[#0d2463]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-[#02975E]" />
              <span>{lang === 'bn' ? 'জরুরি কল ও পরামর্শ:' : '24/7 Helpline:'}</span>
              <a 
                href={`tel:${config.phone}`} 
                className="hover:underline font-bold text-white tracking-wider"
              >
                {lang === 'bn' ? '০১৭৭৪ ৯৬১৭৫৭' : config.phone}
              </a>
            </span>
          </div>

          <div className="flex items-center gap-5">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#0d2463] rounded-full p-0.5 border border-blue-900/40">
              <button 
                onClick={() => setLang('bn')}
                className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] font-semibold cursor-pointer ${
                  lang === 'bn' ? 'bg-[#02975E] text-white shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] font-semibold cursor-pointer ${
                  lang === 'en' ? 'bg-[#02975E] text-white shadow-xs' : 'text-blue-200 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center text-left group cursor-pointer py-0.5"
            title="বেলী ফার্মেসি"
          >
            <img 
              src="/logo.png" 
              alt="বেলী ফার্মেসি" 
              className="h-11 sm:h-12 md:h-14 w-auto object-contain" 
            />
          </button>
        </div>

        {/* Live Search Bar with Instant Generic Dropdown */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-xl mx-2 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#123184] absolute left-3.5 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              aria-label={lang === 'bn' ? 'ওষুধ বা জেনেরিক অনুসন্ধান' : 'Search medicine or generic'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/15 rounded-full text-sm text-slate-800 placeholder-transparent outline-none transition-all shadow-2xs"
            />
            {!searchQuery && (
              <div className="absolute left-10 right-9 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden pr-2 z-10">
                <span className="text-sm text-slate-400 truncate font-normal">
                  {animatedSearchPlaceholder}
                </span>
                <span className="inline-block w-[2px] h-4 bg-[#02975E] ml-0.5 animate-pulse shrink-0" />
              </div>
            )}
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600 z-20 cursor-pointer"
                title="মুছুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 text-xs font-semibold text-slate-500 bg-slate-50 border-b border-slate-100 uppercase tracking-wider flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span>{lang === 'bn' ? 'ওষুধ তালিকা:' : 'Medicines:'}</span>
                  {isMedexLoading && (
                    <span className="text-[10px] text-emerald-700 font-semibold lowercase tracking-normal flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                      {lang === 'bn' ? 'লাইভ অনুসন্ধান হচ্ছে...' : 'Searching catalog...'}
                    </span>
                  )}
                </div>
                <span className="text-[#02975E] font-bold">{searchResults.length} {lang === 'bn' ? 'টি' : 'items'}</span>
              </div>
              {searchResults.map((med) => (
                <div
                  key={med.id}
                  onClick={() => {
                    setSelectedMedicine(med);
                    setIsSearchFocused(false);
                  }}
                  className="px-4 py-2.5 hover:bg-[#02975E]/10 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#123184]/10 text-[#123184] flex items-center justify-center font-bold text-xs shrink-0">
                      {med.type[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{med.name}</span>
                        {med.nameBn && med.nameBn !== med.name && (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded">
                            {med.nameBn}
                          </span>
                        )}
                        <span className="text-[11px] font-normal text-slate-500">({med.type})</span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        {med.generic} • <span className="text-[#123184] font-semibold">{med.company?.replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#123184]">৳{med.pricePerStrip}</span>
                    <span className="text-[10px] block text-slate-400">/{lang === 'bn' ? 'পাতা' : 'strip'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">

          {/* Order Tracking */}
          <button
            onClick={() => setIsOrderTrackingModalOpen(true)}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e2669] hover:to-[#02804f] text-white font-bold text-xs md:text-sm px-3.5 py-2 sm:py-2.5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group shrink-0"
          >
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-wide">
              {lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Order'}
            </span>
          </button>

          {/* Prescription Upload */}
          <button
            onClick={() => setIsPrescriptionModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e2669] hover:to-[#02804f] text-white font-bold text-xs md:text-sm px-3.5 py-2 sm:py-2.5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group shrink-0"
          >
            <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="tracking-wide">
              {lang === 'bn' ? 'প্রেসক্রিপশন আপলোড' : 'Upload Prescription'}
            </span>
          </button>

          {/* Customer Profile Trigger: Square container with circular avatar inside */}
          <button
            onClick={() => setIsCustomerProfileOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#123184] border-2 border-slate-200 hover:border-[#02975E] p-1 sm:px-2.5 sm:py-1.5 rounded-2xl shadow-xs transition-all cursor-pointer group shrink-0"
            title={currentCustomer ? `${currentCustomer.name} (প্রোফাইল)` : (lang === 'bn' ? 'গ্রাহক প্রোফাইল ও অর্ডার ট্র্যাক' : 'Customer Profile')}
          >
            {/* Square Profile Box */}
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-slate-100 border border-slate-200/90 group-hover:border-[#02975E]/50 flex items-center justify-center p-0.5 shrink-0 transition-colors shadow-xs">
              {/* Circular Profile Pic inside ("cycle akare") */}
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-xs font-black shadow-inner ring-1 ring-white/60">
                {currentCustomer?.avatar ? (
                  <img src={currentCustomer.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : currentCustomer ? (
                  <span>{currentCustomer.name.slice(0, 1).toUpperCase()}</span>
                ) : (
                  <User className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">{lang === 'bn' ? 'প্রোফাইল' : 'Account'}</span>
              <span className="font-extrabold text-[#123184] group-hover:text-[#02975E] transition-colors truncate max-w-[85px] block">
                {currentCustomer ? currentCustomer.name.split(' ')[0] : (lang === 'bn' ? 'লগইন' : 'Login')}
              </span>
            </div>
          </button>

          {/* Cart Trigger: Square container with circular icon inside */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#123184] border-2 border-slate-200 hover:border-[#02975E] p-1 sm:px-2.5 sm:py-1.5 rounded-2xl shadow-xs transition-all cursor-pointer group shrink-0 relative"
            title={lang === 'bn' ? `শপিং কার্ট (${totalCartCount} আইটেম)` : `Shopping Cart (${totalCartCount} items)`}
          >
            {/* Square Cart Box */}
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-slate-100 border border-slate-200/90 group-hover:border-[#02975E]/50 flex items-center justify-center p-0.5 shrink-0 transition-colors shadow-xs relative">
              {/* Circular Icon inside ("cycle akare") */}
              <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center shadow-inner ring-1 ring-white/60">
                <ShoppingCart className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </div>

              {/* Notification Badge on top right of square box */}
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#02975E] text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
                  {totalCartCount}
                </span>
              )}
            </div>

            <div className="hidden sm:block text-left text-xs leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">{lang === 'bn' ? 'কার্ট' : 'Cart'}</span>
              <span className="font-extrabold text-[#123184] group-hover:text-[#02975E] transition-colors block">
                ৳{cartSubtotal.toFixed(2)}
              </span>
            </div>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-emerald-700 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar with Live Product Dropdown */}
      <div ref={mobileSearchContainerRef} className="px-4 pb-3 sm:hidden relative">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            setIsMobileSearchFocused(false);
            const catalogEl = document.getElementById('medicines-catalog');
            if (catalogEl) {
              catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="relative"
        >
          <Search className="w-4 h-4 text-[#123184] absolute left-3.5 top-3 pointer-events-none z-10" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsMobileSearchFocused(true);
            }}
            onFocus={() => setIsMobileSearchFocused(true)}
            aria-label={lang === 'bn' ? 'ওষুধ বা জেনেরিক অনুসন্ধান' : 'Search medicine or generic'}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-100 focus:bg-white border border-slate-200 focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/20 rounded-full text-sm outline-none transition-all shadow-2xs text-slate-800 placeholder-transparent"
          />
          {!searchQuery && (
            <div className="absolute left-10 right-9 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden pr-2 z-10">
              <span className="text-xs sm:text-sm text-slate-400 truncate font-normal">
                {animatedSearchPlaceholder}
              </span>
              <span className="inline-block w-[1.5px] h-3.5 bg-[#02975E] ml-0.5 animate-pulse shrink-0" />
            </div>
          )}
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => {
                setSearchQuery('');
                setIsMobileSearchFocused(false);
              }} 
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer z-20"
              title="মুছুন"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Mobile Live Search Results Dropdown */}
        {isMobileSearchFocused && searchQuery.trim() !== '' && (
          <div className="absolute top-full left-4 right-4 mt-1.5 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 max-h-[68vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
            <div className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'খুঁজে পাওয়া ওষুধ:' : 'Found Products:'}</span>
                {isMedexLoading && (
                  <span className="text-[10px] text-emerald-700 font-normal flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                    {lang === 'bn' ? 'লাইভ অনুসন্ধান হচ্ছে...' : 'Searching catalog...'}
                  </span>
                )}
              </div>
              <span className="text-[#02975E] font-black">{searchResults.length} {lang === 'bn' ? 'টি' : 'items'}</span>
            </div>

            {searchResults.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {searchResults.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => {
                      setSelectedMedicine(med);
                      setIsMobileSearchFocused(false);
                    }}
                    className="p-3 hover:bg-emerald-50/60 active:bg-emerald-100/50 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {med.image ? (
                        <img 
                          src={med.image} 
                          alt={med.name} 
                          className="w-11 h-11 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#123184]/10 text-[#123184] border border-blue-100 flex items-center justify-center font-black text-xs shrink-0">
                          {med.type ? med.type[0] : '💊'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1.5 flex-wrap">
                          <span>{med.name}</span>
                          {med.nameBn && med.nameBn !== med.name && (
                            <span className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1 rounded shrink-0">
                              {med.nameBn}
                            </span>
                          )}
                          <span className="text-[11px] font-normal text-slate-500">({med.type})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {med.generic} • <span className="text-[#123184] font-semibold">{med.company?.replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-[#123184] block">৳{med.pricePerStrip}</span>
                      <span className="text-[10px] text-[#02975E] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                        দেখুন &rarr;
                      </span>
                    </div>
                  </div>
                ))}

                {/* View all button in mobile dropdown */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileSearchFocused(false);
                    const catalogEl = document.getElementById('medicines-catalog');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full text-center py-2.5 px-3 bg-[#123184] hover:bg-[#0d2463] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{lang === 'bn' ? `সবগুলো পণ্য দেখুন (${searchResults.length} টি) ↓` : `View all ${searchResults.length} products ↓`}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">{lang === 'bn' ? 'কোনো ওষুধ পাওয়া যায়নি' : 'No medicine found'}</p>
                <p className="text-[11px]">{lang === 'bn' ? 'বানান পরীক্ষা করুন অথবা প্রেসক্রিপশন আপলোড করুন।' : 'Check spelling or upload prescription.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">{lang === 'bn' ? 'ভাষা নির্বাচন করুন:' : 'Language:'}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setLang('bn')} 
                className={`px-3 py-1 text-xs rounded-full ${lang === 'bn' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100'}`}
              >
                বাংলা
              </button>
              <button 
                onClick={() => setLang('en')} 
                className={`px-3 py-1 text-xs rounded-full ${lang === 'en' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100'}`}
              >
                English
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              setIsOrderTrackingModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-emerald-700"
          >
            <span className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'অর্ডার ট্র্যাকিং' : 'Track Order'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => {
              setIsPrescriptionModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-[#02975E]"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#02975E]" />
              {lang === 'bn' ? 'প্রেসক্রিপশন আপলোড' : 'Upload Prescription'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={() => {
              setIsCustomerProfileOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center justify-between py-2 text-sm font-medium text-slate-700 hover:text-[#123184]"
          >
            <span className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 p-0.5 border border-slate-200 shrink-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {currentCustomer?.avatar ? (
                    <img src={currentCustomer.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : currentCustomer ? (
                    <span>{currentCustomer.name.slice(0, 1).toUpperCase()}</span>
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              <div>
                <span className="font-bold text-slate-800 block text-xs">
                  {currentCustomer ? `${currentCustomer.name}` : (lang === 'bn' ? 'গ্রাহক প্রোফাইল' : 'Customer Profile')}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  {currentCustomer ? currentCustomer.phone : (lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও প্রোফাইল' : 'Track orders & account')}
                </span>
              </div>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <a href={`tel:${config.phone}`} className="hover:text-emerald-700 font-medium">
              {lang === 'bn' ? 'জরুরি কল ও পরামর্শ: ০১৭৭৪ ৯৬১৭৫৭' : `24/7 Helpline: ${config.phone}`}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
