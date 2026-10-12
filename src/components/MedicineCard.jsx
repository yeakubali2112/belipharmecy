import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Info, Check, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MedicineCard = ({ medicine }) => {
  const { lang, addToCart, setSelectedMedicine } = useShop();

  // Unit selection: 'strip' or 'unit'
  const [unitType, setUnitType] = useState('strip');
  const [quantity, setQuantity] = useState(1);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

  const price = unitType === 'strip' ? medicine.pricePerStrip : medicine.pricePerUnit;
  const discountPercent = medicine.discountPercent || 0;
  const discountedPrice = discountPercent > 0 ? (price * (1 - discountPercent / 100)) : price;

  const handleAddToCart = () => {
    if (btnState !== 'idle') return;
    setBtnState('loading');
    setTimeout(() => {
      addToCart(medicine, unitType, quantity);
      setBtnState('success');
      setTimeout(() => {
        setBtnState('idle');
      }, 1500);
    }, 450);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-[#02975E]/40 shadow-xs hover:shadow-xl hover:shadow-[#123184]/5 transition-all duration-300 flex flex-col overflow-hidden group">
      
      {/* Top Banner / Image Area */}
      <div className="relative h-44 bg-gradient-to-b from-slate-50 to-[#02975E]/5 p-4 flex items-center justify-center overflow-hidden">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {medicine.requiresPrescription ? (
            <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
              Rx Only
            </span>
          ) : (
            <span className="bg-[#02975E]/10 text-[#02975E] border border-[#02975E]/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
              OTC
            </span>
          )}
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => setSelectedMedicine(medicine)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-[#123184] hover:text-white text-slate-600 flex items-center justify-center shadow-xs transition-all z-10 cursor-pointer"
          title={lang === 'bn' ? 'বিস্তারিত তথ্য' : 'Quick Details'}
        >
          <Info className="w-4 h-4" />
        </button>

        {/* Medicine Product Image */}
        <div 
          onClick={() => setSelectedMedicine(medicine)}
          className="w-full h-full flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-300"
        >
          <img
            src={medicine.image}
            alt={medicine.name}
            className="h-32 w-auto object-contain drop-shadow-md rounded-xl"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60';
            }}
          />
        </div>

        {/* Dosage Form pill */}
        <span className="absolute bottom-2 right-3 bg-white/95 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">
          {medicine.type}
        </span>
      </div>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Company name in brand navy blue */}
          <p className="text-[11px] font-semibold text-[#123184] uppercase tracking-wide truncate">
            {medicine.company}
          </p>

          {/* Medicine Brand Name */}
          <h3 
            onClick={() => setSelectedMedicine(medicine)}
            className="font-bold text-base text-slate-900 group-hover:text-[#123184] transition-colors cursor-pointer line-clamp-1 mt-0.5"
          >
            {medicine.name}
          </h3>

          {/* Generic composition */}
          <p className="text-xs text-slate-500 italic line-clamp-1 mt-0.5" title={medicine.generic}>
            {medicine.generic}
          </p>
        </div>

        {/* Unit Selection (Strip vs Piece) */}
        {medicine.stripSize > 1 ? (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setUnitType('strip')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                unitType === 'strip'
                  ? 'bg-white text-[#123184] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? `পাতা (${medicine.stripSize}টি)` : `Strip (${medicine.stripSize})`}
            </button>
            <button
              onClick={() => setUnitType('unit')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer text-center ${
                unitType === 'unit'
                  ? 'bg-white text-[#123184] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'bn' ? '১ পিস' : '1 Piece'}
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-medium py-1">
            {lang === 'bn' ? 'প্যাকেট বা বোতল ভিত্তিক' : 'Standard packaging'}
          </div>
        )}

        {/* Price & Quantity Area */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#123184]">
                ৳{discountedPrice.toFixed(2)}
              </span>
              {discountPercent > 0 && (
                <span className="text-xs text-slate-400 line-through">
                  ৳{price.toFixed(2)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              {unitType === 'strip' ? (lang === 'bn' ? 'প্রতি পাতা' : 'per strip') : (lang === 'bn' ? 'প্রতি পিস' : 'per piece')}
            </span>
          </div>

          {/* Qty increment / decrement */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-bold text-slate-800">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          <button
            onClick={() => setSelectedMedicine(medicine)}
            className="col-span-2 py-2 px-2 rounded-xl border border-slate-200 hover:border-[#123184] text-slate-600 hover:text-[#123184] text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            {lang === 'bn' ? 'নির্দেশিকা' : 'Details'}
          </button>
          
          <button
            onClick={handleAddToCart}
            disabled={btnState === 'loading'}
            className={`col-span-3 py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
              btnState === 'success'
                ? 'bg-gradient-to-r from-[#02975E] to-[#027e4e] text-white shadow-emerald-700/20' 
                : btnState === 'loading'
                ? 'bg-gradient-to-r from-[#123184] to-[#02975E] opacity-90 text-white cursor-wait'
                : 'bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e276b] hover:to-[#027e4e] text-white shadow-[#123184]/25 hover:shadow-lg'
            }`}
          >
            {btnState === 'loading' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>{lang === 'bn' ? 'যোগ হচ্ছে...' : 'Adding...'}</span>
              </>
            ) : btnState === 'success' ? (
              <>
                <Check className="w-3.5 h-3.5 animate-in zoom-in-75 duration-200 stroke-[2.5]" />
                <span>{lang === 'bn' ? 'যোগ হয়েছে' : 'Added'}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'কার্টে নিন' : 'Add'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
