import React, { useState } from 'react';
import { 
  X, 
  Search, 
  PackageCheck, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  AlertCircle,
  FileText,
  Mic,
  Building2
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { VoiceNotePlayer } from './VoiceNotePlayer';

export const OrderTrackingModal = () => {
  const { 
    isOrderTrackingModalOpen, 
    setIsOrderTrackingModalOpen, 
    orders, 
    prescriptions,
    updateOrderPaymentMethod,
    config,
    paymentSettings,
    setActiveInvoiceOrder,
    lang 
  } = useShop();

  const [searchKey, setSearchKey] = useState('');
  const [searchedOrderId, setSearchedOrderId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOrderTrackingModalOpen) return null;

  const searchedOrder = searchedOrderId ? orders.find(o => o.id === searchedOrderId) : null;
  const matchingRx = searchedOrder 
    ? (prescriptions.find(p => p.id === searchedOrder.prescriptionId) || 
       prescriptions.find(p => p.customerPhone && searchedOrder.customerPhone && p.customerPhone.includes(searchedOrder.customerPhone) && p.voiceNote))
    : null;

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchKey.trim().toLowerCase();
    if (!query) return;

    const found = orders.find(o => 
      o.id.toLowerCase() === query || 
      (o.customerPhone && o.customerPhone.includes(query))
    );

    setSearchedOrderId(found ? found.id : null);
    setHasSearched(true);
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Processing': return 2;
      case 'Dispatched': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      default: return 1;
    }
  };

  const steps = [
    { titleBn: 'অর্ডার গৃহীত', titleEn: 'Order Placed', descBn: 'অর্ডার সিস্টেমে সংরক্ষিত হয়েছে', descEn: 'Received' },
    { titleBn: 'ফার্মাসিস্ট রিভিউ', titleEn: 'Pharmacist Review', descBn: 'ওষুধ ও ব্যাচ ভেরিফাই করা হচ্ছে', descEn: 'Checking' },
    { titleBn: 'প্যাকিং সম্পন্ন', titleEn: 'Packed', descBn: 'সুরক্ষিত কোল্ড-প্যাকেটে প্যাকড', descEn: 'Packed' },
    { titleBn: 'ডেলিভারিতে রয়েছে', titleEn: 'On the Way', descBn: 'রাইডার আপনার ঠিকানায় রওনা হয়েছে', descEn: 'En Route' },
    { titleBn: 'ডেলিভারি সম্পন্ন', titleEn: 'Delivered', descBn: 'গ্রাহকের নিকট হস্তান্তর করা হয়েছে', descEn: 'Delivered' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Brand Navy Blue #123184 */}
        <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-[#123184] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <PackageCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও লাইভ স্ট্যাটাস' : 'Live Order Tracking'}
              </h2>
              <span className="text-xs text-blue-200">
                {lang === 'bn' ? 'অর্ডার আইডি বা মোবাইল নম্বর দিয়ে খুঁজুন' : 'Track by Order ID or Phone'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOrderTrackingModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input form */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder={lang === 'bn' ? "অর্ডার আইডি (উদা: BP-2026-101) বা ফোন নম্বর..." : "Order ID or Phone..."}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-[#02975E] outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-[#02975E] hover:bg-[#027e4e] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-[#02975E]/30"
            >
              {lang === 'bn' ? 'খুঁজুন' : 'Search'}
            </button>
          </form>

          {/* Quick list of recent orders if no search performed yet */}
          {!hasSearched && orders.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">
                {lang === 'bn' ? 'সাম্প্রতিক অর্ডারসমূহ (ক্লিক করে ট্র্যাক করুন):' : 'Recent Orders:'}
              </span>
              <div className="space-y-2">
                {orders.slice(0, 3).map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSearchedOrderId(o.id);
                      setHasSearched(true);
                      setSearchKey(o.id);
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-slate-900">{o.id}</span>
                      <p className="text-[11px] text-slate-500">{o.customerName} • {o.createdAt}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-white px-2 py-1 rounded-md border border-slate-200">
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Result */}
          {hasSearched && (
            searchedOrder ? (
              <div className="space-y-5 animate-in fade-in">
                {/* Order Summary Header */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold">{lang === 'bn' ? 'অর্ডার নম্বর:' : 'Order ID:'}</span>
                    <h3 className="font-black text-lg text-emerald-950">{searchedOrder.id}</h3>
                    <p className="text-xs text-emerald-800/80">{searchedOrder.createdAt}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-emerald-800 block">{lang === 'bn' ? 'বর্তমান স্ট্যাটাস:' : 'Current Status:'}</span>
                    <span className="inline-block bg-emerald-700 text-white font-extrabold text-xs px-3 py-1 rounded-full shadow-xs">
                      {searchedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Progress Steps Timeline */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {lang === 'bn' ? 'ডেলিভারি ট্র্যাকিং প্রগ্রেস' : 'Delivery Progress'}
                  </h4>

                  <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {steps.map((st, index) => {
                      const isComplete = getStepIndex(searchedOrder.status) >= (index + 1);
                      const isCurrent = getStepIndex(searchedOrder.status) === (index + 1);

                      return (
                        <div key={index} className="relative flex items-start gap-3">
                          <span className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isComplete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {isComplete ? '✓' : index + 1}
                          </span>
                          <div>
                            <span className={`text-xs font-bold block ${isCurrent ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {lang === 'bn' ? st.titleBn : st.titleEn}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {lang === 'bn' ? st.descBn : st.descEn}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Option Block when Order is Delivered */}
                {searchedOrder.status === 'Delivered' && (
                  searchedOrder.paymentConfirmed ? (
                    /* LOCKED CONFIRMED PAYMENT DISPLAY - NO EDITING, OTHER OPTIONS HIDDEN */
                    <div className="bg-emerald-50/90 border border-[#02975E] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#02975E] text-white flex items-center justify-center text-xs font-black shadow-xs">
                          ✓
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-xs text-emerald-950">
                              {lang === 'bn' ? 'পেমেন্ট সফলভাবে সংরক্ষিত ও নিশ্চিত' : 'Payment Confirmed & Saved'}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-300 px-1.5 py-0.2 rounded-full">
                              🔒 অপরিবর্তনযোগ্য
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700 mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold">{lang === 'bn' ? 'পদ্ধতি:' : 'Method:'}</span>
                            {(searchedOrder.paymentMethod === 'bKash' || searchedOrder.paymentMethod === 'bkash') ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#D12053] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                                <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain" /> bKash
                              </span>
                            ) : (searchedOrder.paymentMethod === 'Nagad' || searchedOrder.paymentMethod === 'nagad') ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#E31B23] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain" /> Nagad
                              </span>
                            ) : (searchedOrder.paymentMethod === 'Bank' || searchedOrder.paymentMethod === 'bank' || searchedOrder.paymentMethod === 'Bank Transfer') ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[#123184] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                <Building2 className="w-3.5 h-3.5 text-[#123184]" /> Bank Transfer (ব্যাংক)
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                                💵 Cash on Hand (হাতে নগদ)
                              </span>
                            )}
                            {searchedOrder.trxId && searchedOrder.trxId !== 'N/A' && (
                              <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 border border-slate-300 rounded text-xs">
                                TrxID / Ref: {searchedOrder.trxId}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-black text-[#123184] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                        {lang === 'bn' ? 'পরিশোধিত:' : 'Paid:'} ৳{Number(searchedOrder.grandTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    /* SELECTION & CONFIRMATION BOX - BEFORE SAVING */
                    (() => {
                      const method = searchedOrder.paymentMethod;
                      const activeChoice = (method === 'bKash' || method === 'bkash') 
                        ? 'bKash' 
                        : (method === 'Nagad' || method === 'nagad')
                        ? 'Nagad'
                        : (method === 'bank' || method === 'Bank' || method === 'Bank Transfer')
                        ? 'Bank Transfer'
                        : 'Cash on Hand';
                      return (
                        <div className="bg-gradient-to-r from-emerald-50 via-blue-50/50 to-pink-50/40 border border-[#02975E] rounded-xl p-3 space-y-2 shadow-2xs animate-in fade-in">
                          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-200/80 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-[#02975E] text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                                ✓
                              </span>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900">
                                  {lang === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Option):' : 'Choose Payment Option:'}
                                </h4>
                              </div>
                            </div>
                            <span className="text-[11px] font-black text-[#123184] bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {lang === 'bn' ? 'বিল:' : 'Total:'} ৳{Number(searchedOrder.grandTotal || 0).toFixed(2)}
                            </span>
                          </div>

                          {/* 4 Payment Options: Cash on Hand, bKash, Nagad, Bank Transfer */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* Cash on Hand */}
                            <button
                              type="button"
                              onClick={() => updateOrderPaymentMethod(searchedOrder.id, 'Cash on Hand', 'N/A', false)}
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                                activeChoice === 'Cash on Hand'
                                  ? 'border-[#02975E] bg-white text-emerald-950 font-black shadow-xs ring-2 ring-[#02975E]'
                                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <span className="text-base">💵</span>
                              <span className="text-[11px] font-extrabold block leading-tight">Cash on Hand</span>
                              {activeChoice === 'Cash on Hand' && (
                                <span className="text-[9px] font-bold text-[#02975E] bg-emerald-100 px-1 rounded">✓ সিলেক্টেড</span>
                              )}
                            </button>

                            {/* bKash */}
                            <button
                              type="button"
                              onClick={() => updateOrderPaymentMethod(searchedOrder.id, 'bKash', searchedOrder.trxId, false)}
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                                activeChoice === 'bKash'
                                  ? 'border-[#D12053] bg-white text-[#D12053] font-black shadow-xs ring-2 ring-[#D12053]'
                                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <img src="/bkash-logo.png" alt="bKash" className="h-4 max-w-[70px] object-contain" />
                              <span className="text-[11px] font-extrabold block leading-tight">bKash</span>
                              {activeChoice === 'bKash' && (
                                <span className="text-[9px] font-bold text-[#D12053] bg-pink-100 px-1 rounded">✓ সিলেক্টেড</span>
                              )}
                            </button>

                            {/* Nagad */}
                            <button
                              type="button"
                              onClick={() => updateOrderPaymentMethod(searchedOrder.id, 'Nagad', searchedOrder.trxId, false)}
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                                activeChoice === 'Nagad'
                                  ? 'border-[#E31B23] bg-white text-[#E31B23] font-black shadow-xs ring-2 ring-[#E31B23]'
                                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <img src="/nagad-logo.png" alt="Nagad" className="h-4 max-w-[70px] object-contain" />
                              <span className="text-[11px] font-extrabold block leading-tight">Nagad</span>
                              {activeChoice === 'Nagad' && (
                                <span className="text-[9px] font-bold text-[#E31B23] bg-orange-100 px-1 rounded">✓ সিলেক্টেড</span>
                              )}
                            </button>

                            {/* Bank Transfer */}
                            <button
                              type="button"
                              onClick={() => updateOrderPaymentMethod(searchedOrder.id, 'Bank Transfer', searchedOrder.trxId, false)}
                              className={`p-2 rounded-lg border flex flex-col items-center justify-center text-center gap-1 transition-all cursor-pointer ${
                                activeChoice === 'Bank Transfer'
                                  ? 'border-[#123184] bg-white text-[#123184] font-black shadow-xs ring-2 ring-[#123184]'
                                  : 'border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                              }`}
                            >
                              <Building2 className="w-4 h-4 text-[#123184]" />
                              <span className="text-[11px] font-extrabold block leading-tight">Bank Transfer</span>
                              {activeChoice === 'Bank Transfer' && (
                                <span className="text-[9px] font-bold text-[#123184] bg-blue-100 px-1 rounded">✓ সিলেক্টেড</span>
                              )}
                            </button>
                          </div>

                          {/* Cash on Hand action */}
                          {activeChoice === 'Cash on Hand' && (
                            <div className="bg-white border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-950 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <span className="text-base">💵</span>
                                <div>
                                  <span className="font-bold block">হাতে নগদ (Cash on Hand)</span>
                                  <span className="text-[11px] text-slate-500">পেমেন্ট মেথড নিশ্চিত ও স্থায়ীভাবে সংরক্ষণ করতে বাটনে চাপুন।</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateOrderPaymentMethod(searchedOrder.id, 'Cash on Hand', 'N/A', true)}
                                className="bg-[#02975E] hover:bg-[#027e4e] text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                              >
                                {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                              </button>
                            </div>
                          )}

                          {/* bKash action */}
                          {activeChoice === 'bKash' && (
                            <div className="bg-white border border-pink-200 p-3 rounded-xl space-y-1.5 text-xs text-pink-950 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <img src="/bkash-logo.png" alt="bKash" className="h-4 object-contain" />
                                <span className="font-bold">{lang === 'bn' ? 'বিকাশ পেমেন্ট সম্পন্ন করতে:' : 'To complete bKash payment:'}</span>
                              </div>
                              <p className="leading-relaxed">
                                {lang === 'bn' ? 'বিকাশ নম্বর:' : 'bKash Number:'} <b className="text-[#D12053] font-mono select-all bg-pink-50 px-1.5 py-0.5 rounded">{paymentSettings?.bkash?.number || config.bkashNumber}</b> এ <b>৳{Number(searchedOrder.grandTotal).toFixed(0)}</b> টাকা পাঠিয়ে TrxID সংরক্ষণ করুন।
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  id={`track-trx-${searchedOrder.id}`}
                                  defaultValue={searchedOrder.trxId !== 'N/A' ? searchedOrder.trxId : ''}
                                  placeholder="bKash TrxID (যেমন: 9J8B21K3)"
                                  className="flex-1 px-3 py-1.5 border border-pink-300 rounded-lg text-xs font-mono uppercase font-bold outline-none focus:border-[#D12053]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = document.getElementById(`track-trx-${searchedOrder.id}`)?.value?.trim();
                                    if (!val) {
                                      alert(lang === 'bn' ? 'অনুগ্রহ করে বিকাশ TrxID প্রদান করুন' : 'Please enter bKash TrxID');
                                      return;
                                    }
                                    updateOrderPaymentMethod(searchedOrder.id, 'bKash', val, true);
                                  }}
                                  className="bg-[#D12053] hover:bg-pink-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Nagad action */}
                          {activeChoice === 'Nagad' && (
                            <div className="bg-white border border-orange-200 p-3 rounded-xl space-y-1.5 text-xs text-orange-950 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <img src="/nagad-logo.png" alt="Nagad" className="h-4 object-contain" />
                                <span className="font-bold">{lang === 'bn' ? 'নগদ পেমেন্ট সম্পন্ন করতে:' : 'To complete Nagad payment:'}</span>
                              </div>
                              <p className="leading-relaxed">
                                {lang === 'bn' ? 'নগদ নম্বর:' : 'Nagad Number:'} <b className="text-[#E31B23] font-mono select-all bg-orange-50 px-1.5 py-0.5 rounded">{paymentSettings?.nagad?.number || config.nagadNumber}</b> এ <b>৳{Number(searchedOrder.grandTotal).toFixed(0)}</b> টাকা পাঠিয়ে TrxID সংরক্ষণ করুন।
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  id={`track-trx-${searchedOrder.id}`}
                                  defaultValue={searchedOrder.trxId !== 'N/A' ? searchedOrder.trxId : ''}
                                  placeholder="Nagad TrxID (যেমন: 7GA8X10)"
                                  className="flex-1 px-3 py-1.5 border border-orange-300 rounded-lg text-xs font-mono uppercase font-bold outline-none focus:border-[#E31B23]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = document.getElementById(`track-trx-${searchedOrder.id}`)?.value?.trim();
                                    if (!val) {
                                      alert(lang === 'bn' ? 'অনুগ্রহ করে নগদ TrxID প্রদান করুন' : 'Please enter Nagad TrxID');
                                      return;
                                    }
                                    updateOrderPaymentMethod(searchedOrder.id, 'Nagad', val, true);
                                  }}
                                  className="bg-[#E31B23] hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bank Transfer action */}
                          {activeChoice === 'Bank Transfer' && (
                            <div className="bg-white border border-blue-200 p-3 rounded-xl space-y-2 text-xs text-blue-950 animate-in fade-in">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#123184]" />
                                <span className="font-bold">{lang === 'bn' ? 'ব্যাংক ট্রান্সফার পেমেন্ট বিবরণ:' : 'Bank Transfer Details:'}</span>
                              </div>
                              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100 text-[11px] space-y-1">
                                <p><b>ব্যাংক:</b> {paymentSettings?.bank?.bankName || 'Islami Bank Bangladesh Ltd'}</p>
                                <p><b>হিসাব নাম:</b> {paymentSettings?.bank?.accountName || 'Beli Pharmacy'}</p>
                                <p><b>হিসাব নং:</b> <b className="font-mono text-[#123184] select-all">{paymentSettings?.bank?.accountNumber || '2050 1480 2003 4567'}</b> ({paymentSettings?.bank?.branchName || 'Dupchanchia Branch'})</p>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  id={`track-trx-${searchedOrder.id}`}
                                  defaultValue={searchedOrder.trxId !== 'N/A' ? searchedOrder.trxId : ''}
                                  placeholder="ব্যাংক ডিপোজিট স্লিপ / TrxID নম্বর"
                                  className="flex-1 px-3 py-1.5 border border-blue-300 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#123184]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = document.getElementById(`track-trx-${searchedOrder.id}`)?.value?.trim();
                                    if (!val) {
                                      alert(lang === 'bn' ? 'অনুগ্রহ করে ব্যাংক স্লিপ বা TrxID নম্বর দিন' : 'Please enter Bank Reference or TrxID');
                                      return;
                                    }
                                    updateOrderPaymentMethod(searchedOrder.id, 'Bank Transfer', val, true);
                                  }}
                                  className="bg-[#123184] hover:bg-[#0d2463] text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                >
                                  {lang === 'bn' ? 'সংরক্ষণ' : 'Save'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )
                )}

                {/* Prescription Voice Note (Oral Dosage Instructions) */}
                {matchingRx && matchingRx.voiceNote && (
                  <div className="space-y-1.5 animate-in fade-in">
                    <VoiceNotePlayer
                      audioUrl={matchingRx.voiceNote}
                      pharmacistNotes={matchingRx.pharmacistNotes}
                      durationLabel={matchingRx.voiceNoteDuration}
                      label={lang === 'bn' ? '🎙️ ফার্মাসিস্টের অডিও সেবনবিধি (ভয়েস নোট)' : '🎙️ Pharmacist Audio Directions (Voice Note)'}
                    />
                  </div>
                )}

                {/* Order Details & Items */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
                    <span className="font-semibold text-slate-900">{searchedOrder.customerName} ({searchedOrder.customerPhone})</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{lang === 'bn' ? 'ঠিকানা:' : 'Address:'}</span>
                    <span className="font-semibold text-slate-900 text-right max-w-xs">{searchedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>{lang === 'bn' ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {(searchedOrder.paymentMethod === 'bKash' || searchedOrder.paymentMethod === 'bkash') ? (
                        <span className="inline-flex items-center gap-1 text-[#D12053] font-bold">
                          <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain" /> bKash
                        </span>
                      ) : (searchedOrder.paymentMethod === 'Nagad' || searchedOrder.paymentMethod === 'nagad') ? (
                        <span className="inline-flex items-center gap-1 text-[#E31B23] font-bold">
                          <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain" /> Nagad
                        </span>
                      ) : (
                        <span className="text-slate-800 font-bold">💵 Cash on Hand</span>
                      )}
                      {searchedOrder.trxId && searchedOrder.trxId !== 'N/A' && <span className="font-mono text-slate-500">({searchedOrder.trxId})</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                    <span>{lang === 'bn' ? 'মোট মূল্য:' : 'Grand Total:'}</span>
                    <span className="font-extrabold text-emerald-800 text-sm">৳{Number(searchedOrder.grandTotal || 0).toFixed(2)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        setActiveInvoiceOrder(searchedOrder);
                        setIsOrderTrackingModalOpen(false);
                      }}
                      className="flex items-center gap-1.5 text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ইনভয়েস / রসিদ দেখুন ও প্রিন্ট করুন' : 'View & Print Invoice'}</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h4 className="font-bold text-slate-800">
                  {lang === 'bn' ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No Order Found'}
                </h4>
                <p className="text-xs">
                  {lang === 'bn' ? 'অনুগ্রহ করে সঠিক অর্ডার আইডি অথবা ফোন নম্বর দিন।' : 'Please check your Order ID or phone number.'}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
