import React, { useRef } from 'react';
import { 
  Sparkles, 
  Pill, 
  Activity, 
  HeartPulse, 
  ShieldCheck, 
  HeartHandshake, 
  Stethoscope, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../data/medicines';
import { useShop } from '../context/ShopContext';

export const CategoryFilter = ({ sortBy, setSortBy, filterRx, setFilterRx }) => {
  const { selectedCategory, setSelectedCategory, lang, medicines } = useShop();
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 280;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return medicines.length;
    return medicines.filter(m => m.category === catId).length;
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Pill': return <Pill className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4" />;
      case 'Stethoscope': return <Stethoscope className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border-y border-slate-200 shadow-xs py-3.5 px-4 sticky top-[69px] z-30">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Category Pills Slider with Left/Right Navigation */}
        <div className="flex items-center gap-2">
          {/* Scroll Left Button */}
          <button
            onClick={() => scroll('left')}
            className="shrink-0 h-[38px] w-9 mb-1 bg-slate-50 hover:bg-slate-100 text-[#123184] hover:text-[#02975E] border border-slate-300 flex items-center justify-center cursor-pointer transition-all shadow-xs active:scale-95"
            title={lang === 'bn' ? 'আগের ক্যাটাগরি' : 'Previous categories'}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={sliderRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count = getCategoryCount(cat.id);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-none text-xs md:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected 
                      ? 'bg-[#123184] text-white border-[#123184] shadow-sm shadow-[#123184]/30' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[#02975E]">
                    {renderIcon(cat.icon)}
                  </span>
                  <span>{lang === 'bn' ? cat.nameBn : cat.nameEn}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-none font-bold ${
                    isSelected ? 'bg-[#0d2463] text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => scroll('right')}
            className="shrink-0 h-[38px] w-9 mb-1 bg-slate-50 hover:bg-slate-100 text-[#123184] hover:text-[#02975E] border border-slate-300 flex items-center justify-center cursor-pointer transition-all shadow-xs active:scale-95"
            title={lang === 'bn' ? 'পরের ক্যাটাগরি' : 'Next categories'}
            aria-label="Next categories"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Rx Filter Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'ওষুধের ধরণ:' : 'Filter Type:'}</span>
            <button
              onClick={() => setFilterRx('all')}
              className={`px-2.5 py-1 rounded-none border cursor-pointer font-bold ${
                filterRx === 'all' 
                  ? 'bg-[#123184] text-white border-[#123184]' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {lang === 'bn' ? 'সবগুলো' : 'All'}
            </button>
            <button
              onClick={() => setFilterRx('otc')}
              className={`px-2.5 py-1 rounded-none border cursor-pointer font-bold ${
                filterRx === 'otc' 
                  ? 'bg-[#02975E] text-white border-[#02975E]' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              OTC ({lang === 'bn' ? 'প্রেসক্রিপশন ছাড়া' : 'No Rx'})
            </button>
            <button
              onClick={() => setFilterRx('rx')}
              className={`px-2.5 py-1 rounded-none border cursor-pointer font-bold ${
                filterRx === 'rx' 
                  ? 'bg-rose-600 text-white border-rose-600' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Rx Only ({lang === 'bn' ? 'প্রেসক্রিপশন প্রয়োজন' : 'Rx Needed'})
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'সাজান:' : 'Sort by:'}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-none px-2.5 py-1 text-slate-700 outline-none focus:border-[#123184] cursor-pointer text-xs"
            >
              <option value="popular">{lang === 'bn' ? 'জনপ্রিয়তা অনুযায়ী' : 'Popularity'}</option>
              <option value="price-asc">{lang === 'bn' ? 'মূল্য: কম থেকে বেশি' : 'Price: Low to High'}</option>
              <option value="price-desc">{lang === 'bn' ? 'মূল্য: বেশি থেকে কম' : 'Price: High to Low'}</option>
              <option value="name-asc">{lang === 'bn' ? 'নাম: A থেকে Z' : 'Name: A to Z'}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
