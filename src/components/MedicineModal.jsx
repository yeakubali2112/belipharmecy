import React, { useState } from 'react';
import { X, ShoppingCart, ShieldCheck, AlertCircle, Building2, Pill, Check, Loader2, Package } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MedicineModal = () => {
  const { selectedMedicine, setSelectedMedicine, lang, addToCart, medicines } = useShop();

  const [unitType, setUnitType] = useState('strip');
  const [quantity, setQuantity] = useState(1);
  const [btnState, setBtnState] = useState('idle'); // 'idle' | 'loading' | 'success'

  if (!selectedMedicine) return null;

  // Synchronized live stock from context
  const liveMed = (medicines && medicines.find(m => m.id === selectedMedicine.id)) || selectedMedicine;
  const stockCount = typeof liveMed.stock === 'number' ? liveMed.stock : 100;
  const isOutOfStock = stockCount <= 0;

  const price = unitType === 'strip' ? selectedMedicine.pricePerStrip : selectedMedicine.pricePerUnit;
  const discountPercent = selectedMedicine.discountPercent || 0;
  const discountedPrice = discountPercent > 0 ? (price * (1 - discountPercent / 100)) : price;

  const handleAdd = () => {
    if (isOutOfStock) return;
    if (btnState !== 'idle') return;
    setBtnState('loading');
    setTimeout(() => {
      addToCart(selectedMedicine, unitType, quantity);
      setBtnState('success');
      setTimeout(() => {
        setBtnState('idle');
      }, 1500);
    }, 450);
  };

  const rawCompany = selectedMedicine.company || '';
  const cleanCompany = rawCompany.replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস').trim() || 'বাংলাদেশ ফার্মাসিউটিক্যালস';

  const rawDescription = selectedMedicine.description || '';
  const cleanDescription = rawDescription
    .replace(/MedEx\s*Bangladesh\s*ডাটাবেজ\s*থেকে\s*সংগৃহীত\s*/gi, '')
    .replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বেলী ফার্মেসি')
    .trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#02975E]/15 text-[#02975E]">
              <Pill className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  {selectedMedicine.name}
                </h2>
                {selectedMedicine.nameBn && selectedMedicine.nameBn !== selectedMedicine.name && (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedMedicine.nameBn}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {selectedMedicine.generic}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedMedicine(null)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid sm:grid-cols-12 gap-6 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="sm:col-span-4 flex justify-center">
              <img
                src={selectedMedicine.image}
                alt={selectedMedicine.name}
                className="h-32 object-contain drop-shadow rounded-xl"
              />
            </div>
            <div className="sm:col-span-8 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="bg-[#123184]/10 text-[#123184] font-bold px-2.5 py-0.5 rounded-full">
                  {selectedMedicine.type}
                </span>
                {selectedMedicine.requiresPrescription ? (
                  <span className="bg-rose-100 text-rose-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {lang === 'bn' ? 'প্রেসক্রিপশন আবশ্যক' : 'Prescription Required'}
                  </span>
                ) : (
                  <span className="bg-[#02975E]/10 text-[#02975E] font-semibold px-2.5 py-0.5 rounded-full">
                    {lang === 'bn' ? 'প্রেসক্রিপশন ছাড়া কেনা যাবে (OTC)' : 'OTC (No Rx Required)'}
                  </span>
                )}
                {/* Live Stock Badge */}
                <span className={`font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border text-xs ${
                  isOutOfStock 
                    ? 'bg-rose-100 text-rose-800 border-rose-200' 
                    : stockCount <= 15 
                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  <Package className="w-3.5 h-3.5" />
                  <span>
                    {isOutOfStock 
                      ? (lang === 'bn' ? 'স্টক শেষ (০ পিস)' : 'Out of Stock') 
                      : (lang === 'bn' ? `মজুদ স্টক: ${stockCount} পিস` : `Stock: ${stockCount} pcs`)}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold pt-1">
                <Building2 className="w-4 h-4 text-[#123184]" />
                <span className="text-[#123184]">{cleanCompany}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {cleanDescription}
              </p>

              {/* Price Tag */}
              <div className="pt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-[#123184]">
                  ৳{discountedPrice.toFixed(2)}
                </span>
                {discountPercent > 0 && (
                  <span className="text-sm text-slate-400 line-through">
                    ৳{price.toFixed(2)}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  /{unitType === 'strip' ? (lang === 'bn' ? 'পাতা' : 'Strip') : (lang === 'bn' ? 'পিস' : 'Piece')}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Instructions Tabs / Cards */}
          <div className="space-y-4 text-sm">
            {/* Indications */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <h4 className="font-bold flex items-center gap-2 mb-1.5 text-[#123184]">
                <ShieldCheck className="w-4 h-4 text-[#123184]" />
                {lang === 'bn' ? 'যেসব কারণে ব্যবহার করা হয় (Indications)' : 'Indications'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedMedicine.indications}
              </p>
            </div>

            {/* Dosage */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <h4 className="font-bold flex items-center gap-2 mb-1.5 text-[#02975E]">
                <Pill className="w-4 h-4 text-[#02975E]" />
                {lang === 'bn' ? 'সেবনবিধি ও খাওয়ার নিয়ম (Dosage & Advice)' : 'Dosage & Instructions'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedMedicine.dosage}
              </p>
            </div>

            {/* Side Effects */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5 text-amber-700">
                <AlertCircle className="w-4 h-4" />
                {lang === 'bn' ? 'পার্শ্বপ্রতিক্রিয়া ও সতর্কতা (Side Effects)' : 'Side Effects & Safety'}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedMedicine.sideEffects}
              </p>
            </div>
          </div>

          {/* Unit & Add to cart row */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">{lang === 'bn' ? 'প্যাক নির্বাচন:' : 'Select Unit:'}</span>
              <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold">
                {selectedMedicine.stripSize > 1 && (
                  <button
                    onClick={() => setUnitType('strip')}
                    className={`px-3 py-1.5 rounded-md cursor-pointer ${
                      unitType === 'strip' ? 'bg-white text-[#123184] font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'bn' ? `পাতা (${selectedMedicine.stripSize}টি)` : 'Strip'}
                  </button>
                )}
                <button
                  onClick={() => setUnitType('unit')}
                  className={`px-3 py-1.5 rounded-md cursor-pointer ${
                    unitType === 'unit' ? 'bg-white text-[#123184] font-bold shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {lang === 'bn' ? '১ পিস' : '1 Piece'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold text-slate-800">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={isOutOfStock || quantity >= stockCount}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={isOutOfStock || btnState === 'loading'}
                className={`font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 min-w-[135px] ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : btnState === 'success'
                    ? 'bg-gradient-to-r from-[#02975E] to-[#027e4e] text-white shadow-emerald-700/20 cursor-pointer'
                    : btnState === 'loading'
                    ? 'bg-gradient-to-r from-[#123184] to-[#02975E] opacity-90 text-white cursor-wait'
                    : 'bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e276b] hover:to-[#027e4e] text-white shadow-[#123184]/25 hover:shadow-lg cursor-pointer'
                }`}
              >
                {isOutOfStock ? (
                  <span>{lang === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}</span>
                ) : btnState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{lang === 'bn' ? 'যোগ হচ্ছে...' : 'Adding...'}</span>
                  </>
                ) : btnState === 'success' ? (
                  <>
                    <Check className="w-4 h-4 animate-in zoom-in-75 duration-200 stroke-[2.5]" />
                    <span>{lang === 'bn' ? 'যোগ হয়েছে!' : 'Added!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
