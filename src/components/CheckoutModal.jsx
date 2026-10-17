import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  CheckCircle, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Banknote,
  Receipt,
  Landmark,
  Building2,
  Copy,
  Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CheckoutModal = () => {
  const { 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen, 
    cart, 
    cartSubtotal, 
    discountAmount, 
    couponCode,
    config, 
    paymentSettings,
    createOrder,
    currentCustomer,
    lang 
  } = useShop();

  const [customerName, setCustomerName] = useState(currentCustomer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentCustomer?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentCustomer?.address || '');
  const [area, setArea] = useState('Dupchanchia / Bogura');
  const [deliveryType, setDeliveryType] = useState('regular'); // 'regular' or 'express'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'bkash', 'nagad', 'bank'
  const [selectedBankId, setSelectedBankId] = useState(() => {
    if (paymentSettings?.banks && paymentSettings.banks.length > 0) {
      const active = paymentSettings.banks.find(b => b.enabled !== false);
      return active ? active.id : paymentSettings.banks[0]?.id;
    }
    return null;
  });
  const [trxId, setTrxId] = useState('');
  const [patientNote, setPatientNote] = useState('');
  const [orderState, setOrderState] = useState('idle'); // 'idle' | 'riding' | 'success'
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  React.useEffect(() => {
    if (isCheckoutModalOpen) {
      setOrderState('idle');
      if (!selectedBankId && paymentSettings?.banks && paymentSettings.banks.length > 0) {
        const active = paymentSettings.banks.find(b => b.enabled !== false) || paymentSettings.banks[0];
        if (active) setSelectedBankId(active.id);
      }
    }
  }, [isCheckoutModalOpen, paymentSettings, selectedBankId]);

  React.useEffect(() => {
    if (currentCustomer && isCheckoutModalOpen) {
      if (!customerName) setCustomerName(currentCustomer.name || '');
      if (!customerPhone) setCustomerPhone(currentCustomer.phone || '');
      if (!deliveryAddress) setDeliveryAddress(currentCustomer.address || '');
    }
  }, [currentCustomer, isCheckoutModalOpen]);

  if (!isCheckoutModalOpen) return null;

  const baseDeliveryFee = cartSubtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryFee;
  const deliveryFee = deliveryType === 'express' ? config.expressDeliveryFee : baseDeliveryFee;
  const grandTotal = Number(Math.max(0, cartSubtotal - discountAmount + deliveryFee).toFixed(2));

  const handleSubmit = (e) => {
    e.preventDefault();

    if (orderState !== 'idle') return;

    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে নাম, ফোন নম্বর এবং সম্পূর্ণ ঠিকানা পূরণ করুন।' : 'Please fill your name, phone and address.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'bank') && !trxId.trim()) {
      alert(lang === 'bn' 
        ? (paymentMethod === 'bank' ? 'অনুগ্রহ করে ব্যাংক ডিপোজিট স্লিপ বা ট্রানজেকশন রেফারেন্স নম্বর দিন।' : 'অনুগ্রহ করে TrxID বা লেনদেন নম্বর দিন।')
        : 'Please enter your Transaction ID or Bank Reference.');
      return;
    }

    // Step 1: Start bicycle delivery animation across the button
    setOrderState('riding');

    // Step 2: Delivery boy completes crossing the button
    setTimeout(() => {
      setOrderState('success');

      // Step 3: Show completed state and finalize order
      setTimeout(() => {
        const availableBanks = (paymentSettings?.banks && Array.isArray(paymentSettings.banks) && paymentSettings.banks.length > 0)
          ? paymentSettings.banks.filter(b => b && b.enabled !== false)
          : (paymentSettings?.bank?.enabled !== false && paymentSettings?.bank ? [paymentSettings.bank] : []);
        const chosenBank = (selectedBankId ? availableBanks.find(b => b?.id === selectedBankId) : null) || availableBanks[0] || paymentSettings?.bank;

        createOrder({
          customerName,
          customerPhone,
          customerAvatar: currentCustomer?.avatar || null,
          deliveryAddress: `${deliveryAddress}, ${area}`,
          deliveryType,
          paymentMethod: paymentMethod === 'bank' ? 'Bank Transfer' : paymentMethod,
          bankName: paymentMethod === 'bank' ? chosenBank?.bankName : undefined,
          trxId: trxId || 'N/A',
          patientNote,
          subtotal: Number(cartSubtotal.toFixed(2)),
          discount: Number(discountAmount.toFixed(2)),
          deliveryFee: Number(deliveryFee.toFixed(2)),
          grandTotal: Number(grandTotal.toFixed(2)),
          items: cart.map(item => ({
            id: item.medicineId || item.id,
            medicineId: item.medicineId || item.id,
            stripSize: item.stripSize || 10,
            name: item.name,
            generic: item.generic,
            unitType: item.unitType,
            unitLabel: item.unitLabel,
            quantity: item.quantity,
            price: item.unitPrice
          }))
        });
        setOrderState('idle');
      }, 800);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header in Brand Navy Blue #123184 */}
        <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-[#123184] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
              <Receipt className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {lang === 'bn' ? 'অর্ডার ও চেকআউট সম্পূর্ণ করুন' : 'Complete Your Order'}
              </h2>
              <span className="text-xs text-blue-200">
                {lang === 'bn' ? 'সরাসরি হোম ডেলিভারি ও নিরাপদ পেমেন্ট' : 'Fast Delivery & Safe Payment'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsCheckoutModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Customer Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                {lang === 'bn' ? 'গ্রাহকের তথ্য ও ডেলিভারি ঠিকানা' : 'Customer & Delivery Info'}
              </h3>
              {currentCustomer && (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 p-0.5 border border-slate-200 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-[10px] font-bold">
                      {currentCustomer.avatar ? (
                        <img src={currentCustomer.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        currentCustomer.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    {currentCustomer.name} (লগইন করা আছে)
                  </span>
                </div>
              )}
            </div>

            {!currentCustomer && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-2.5 text-xs text-blue-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#123184] shrink-0" />
                <span>
                  {lang === 'bn' 
                    ? '💡 অর্ডার সম্পূর্ণ করলেই আপনার একটি প্রোফাইল তৈরি হবে, যেখান থেকে অর্ডারের লাইভ অগ্রগতি ট্র্যাক করতে পারবেন।' 
                    : '💡 A customer profile will be created automatically to track your order status live.'}
                </span>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === 'bn' ? "যেমন: তানভীর হাসান" : "e.g., Tanvir Hasan"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) *' : 'Delivery Address (House/Road/Area) *'}
              </label>
              <textarea
                required
                rows="2"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder={lang === 'bn' ? "বাড়ি #, রোড #, ব্লক/সেক্টর, থানা..." : "Flat, House #, Road #, Area..."}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'শহর / ডেলিভারি এলাকা' : 'Delivery City / Zone'}
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none bg-white"
              >
                <option value="Dupchanchia / Bogura">দুপচাঁচিয়া / বগুড়া সদর</option>
                <option value="Bogura District">বগুড়া জেলা (উপজেলাসমূহ)</option>
                <option value="Rajshahi Division">রাজশাহী বিভাগ</option>
                <option value="Dhaka & Other Cities">ঢাকা ও অন্যান্য শহর (কুরিয়ার)</option>
                <option value="All Bangladesh Delivery">সারা বাংলাদেশ হোম ডেলিভারি</option>
              </select>
            </div>
          </div>

          {/* Delivery Speed Option */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'ডেলিভারির গতি নির্বাচন করুন' : 'Delivery Speed'}
            </h3>

            <div className="grid sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setDeliveryType('regular')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'regular' 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'regular'}
                  onChange={() => setDeliveryType('regular')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    {lang === 'bn' ? 'নিয়মিত ডেলিভারি' : 'Regular Delivery'}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'bn' ? 'আজকের মধ্যে ডেলিভারি (৳৫০০+ অর্ডারে ফ্রি)' : 'Same-day delivery (Free above ৳500)'}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    {cartSubtotal >= config.freeDeliveryThreshold ? (lang === 'bn' ? 'ফ্রি' : 'Free') : `৳${config.deliveryFee}`}
                  </span>
                </div>
              </div>

              <div 
                onClick={() => setDeliveryType('express')}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  deliveryType === 'express' 
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  checked={deliveryType === 'express'}
                  onChange={() => setDeliveryType('express')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    {lang === 'bn' ? '৬০ মিনিট জরুরি ডেলিভারি' : '60-min Express'}
                    <span className="bg-rose-500 text-white text-[9px] px-1 rounded font-extrabold">FAST</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'bn' ? 'জরুরি প্রয়োজনে স্পিড রাইডার দ্বারা দ্রুততম ডেলিভারি' : 'Dedicated instant dispatch'}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 mt-1 block">
                    ৳{config.expressDeliveryFee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Payment Method'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {/* Cash On Hand */}
              {paymentSettings?.cod?.enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'cod' 
                      ? 'border-[#02975E] bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-[#02975E]/30' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center mb-1">
                    <span className="text-xl">💵</span>
                  </div>
                  <span className="text-xs block font-bold leading-tight">
                    {lang === 'bn' ? 'Cash on Hand' : 'Cash on Hand'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">হাতে নগদ</span>
                </button>
              )}

              {/* bKash */}
              {paymentSettings?.bkash?.enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'bkash' 
                      ? 'border-[#D12053] bg-pink-50 text-[#D12053] font-black shadow-xs ring-2 ring-[#D12053]/30' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center mb-1">
                    <img 
                      src="/bkash-logo.png" 
                      alt="bKash বিকাশ" 
                      className="h-6 max-w-[75px] sm:max-w-[85px] object-contain drop-shadow-2xs" 
                    />
                  </div>
                  <span className="text-xs block font-bold leading-tight">bKash</span>
                  <span className="text-[10px] text-[#D12053] font-medium">বিকাশ পেমেন্ট</span>
                </button>
              )}

              {/* Nagad */}
              {paymentSettings?.nagad?.enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'nagad' 
                      ? 'border-[#E31B23] bg-orange-50 text-[#E31B23] font-black shadow-xs ring-2 ring-[#E31B23]/30' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center mb-1">
                    <img 
                      src="/nagad-logo.png" 
                      alt="Nagad নগদ" 
                      className="h-6 max-w-[75px] sm:max-w-[85px] object-contain drop-shadow-2xs" 
                    />
                  </div>
                  <span className="text-xs block font-bold leading-tight">Nagad</span>
                  <span className="text-[10px] text-[#E31B23] font-medium">নগদ পেমেন্ট</span>
                </button>
              )}

              {/* Bank Transfer */}
              {paymentSettings?.bank?.enabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                    paymentMethod === 'bank' 
                      ? 'border-[#123184] bg-blue-50 text-[#123184] font-black shadow-xs ring-2 ring-[#123184]/30' 
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="h-7 flex items-center justify-center mb-1 text-[#123184]">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs block font-bold leading-tight">Bank</span>
                  <span className="text-[10px] text-blue-700 font-medium">ব্যাংক ট্রান্সফার</span>
                </button>
              )}
            </div>

            {/* Cash on Hand Instructions */}
            {paymentMethod === 'cod' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 flex items-center gap-2.5 animate-in fade-in">
                <span className="text-xl shrink-0">💵</span>
                <p className="leading-relaxed text-[11px] sm:text-xs">
                  {paymentSettings?.cod?.instructions || (lang === 'bn' 
                    ? 'ওষুধ বাসায় পৌঁছানোর পর ডেলিভারি ম্যানকে সরাসরি নগদ অর্থ পরিশোধ করুন।' 
                    : 'Pay with cash upon delivery at your doorstep.')}
                </p>
              </div>
            )}

            {/* bKash Instructions */}
            {paymentMethod === 'bkash' && (
              <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3.5 text-xs text-pink-950 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-pink-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white px-2 py-1 rounded-lg border border-pink-200 shadow-2xs">
                      <img src="/bkash-logo.png" alt="bKash" className="h-5 object-contain" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#D12053] text-xs">
                        {lang === 'bn' ? 'বিকাশ পেমেন্ট বা সেন্ড মানি নির্দেশিকা' : 'bKash Payment Instruction'}
                      </p>
                      <span className="text-[10px] text-pink-700 font-medium">
                        {paymentSettings?.bkash?.type || 'Personal / Merchant'} একাউন্ট
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#D12053] bg-white px-2 py-0.5 rounded-lg border border-pink-200">
                    ৳{grandTotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 p-2.5 rounded-xl border border-pink-200">
                  <div className="leading-tight">
                    <span className="text-[10px] text-pink-800 font-bold block">বিকাশ নম্বর:</span>
                    <span className="font-mono text-base font-black text-[#D12053] select-all tracking-wider">
                      {paymentSettings?.bkash?.number || config.bkashNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentSettings?.bkash?.number || config.bkashNumber, 'bkash')}
                    className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-[#D12053] rounded-lg border border-pink-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copiedField === 'bkash' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'bkash' ? 'কপিকৃত!' : 'নম্বর কপি'}</span>
                  </button>
                </div>

                <p className="leading-relaxed text-[11px] text-pink-900">
                  {paymentSettings?.bkash?.instructions || (lang === 'bn' 
                    ? `উপরের বিকাশ নম্বরে মোট ৳${grandTotal.toFixed(0)} টাকা সেন্ড মানি করুন। এরপর নিচে প্রাপ্ত TrxID প্রদান করুন:`
                    : `Send ৳${grandTotal.toFixed(0)} to the bKash number and enter TrxID below:`)}
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-pink-900 mb-1">
                    বিকাশ ট্রানজেকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: 9J8B21K3"
                    className="w-full bg-white px-3.5 py-2 rounded-xl border border-pink-300 text-xs uppercase font-mono font-bold outline-none focus:border-[#D12053] focus:ring-1 focus:ring-[#D12053]"
                  />
                </div>
              </div>
            )}

            {/* Nagad Instructions */}
            {paymentMethod === 'nagad' && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 text-xs text-orange-950 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-orange-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white px-2 py-1 rounded-lg border border-orange-200 shadow-2xs">
                      <img src="/nagad-logo.png" alt="Nagad" className="h-5 object-contain" />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#E31B23] text-xs">
                        {lang === 'bn' ? 'নগদ পেমেন্ট বা সেন্ড মানি নির্দেশিকা' : 'Nagad Payment Instruction'}
                      </p>
                      <span className="text-[10px] text-orange-700 font-medium">
                        {paymentSettings?.nagad?.type || 'Personal'} একাউন্ট
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#E31B23] bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                    ৳{grandTotal.toFixed(0)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 p-2.5 rounded-xl border border-orange-200">
                  <div className="leading-tight">
                    <span className="text-[10px] text-orange-800 font-bold block">নগদ নম্বর:</span>
                    <span className="font-mono text-base font-black text-[#E31B23] select-all tracking-wider">
                      {paymentSettings?.nagad?.number || config.nagadNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(paymentSettings?.nagad?.number || config.nagadNumber, 'nagad')}
                    className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#E31B23] rounded-lg border border-orange-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copiedField === 'nagad' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'nagad' ? 'কপিকৃত!' : 'নম্বর কপি'}</span>
                  </button>
                </div>

                <p className="leading-relaxed text-[11px] text-orange-900">
                  {paymentSettings?.nagad?.instructions || (lang === 'bn' 
                    ? `উপরের নগদ নম্বরে ৳${grandTotal.toFixed(0)} টাকা সেন্ড মানি করে নিচের বক্সে TrxID দিন:`
                    : `Send ৳${grandTotal.toFixed(0)} to the Nagad number and enter TrxID below:`)}
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-orange-900 mb-1">
                    নগদ ট্রানজেকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: 7GA8X10"
                    className="w-full bg-white px-3.5 py-2 rounded-xl border border-orange-300 text-xs uppercase font-mono font-bold outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]"
                  />
                </div>
              </div>
            )}

            {/* Bank Transfer Instructions */}
            {paymentMethod === 'bank' && (() => {
              const availableBanks = (paymentSettings?.banks && Array.isArray(paymentSettings.banks) && paymentSettings.banks.length > 0)
                ? paymentSettings.banks.filter(b => b && b.enabled !== false)
                : (paymentSettings?.bank?.enabled !== false && paymentSettings?.bank ? [paymentSettings.bank] : []);
              const currentBank = (selectedBankId ? availableBanks.find(b => b?.id === selectedBankId) : null) || availableBanks[0] || paymentSettings?.bank;

              return (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-xs text-sky-950 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-sky-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#123184] text-white flex items-center justify-center shadow-xs">
                        <Building2 className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div>
                        <p className="font-extrabold text-[#123184] text-xs sm:text-sm">
                          {currentBank?.bankName || 'ব্যাংক ফান্ড ট্রান্সফার'}
                        </p>
                        <span className="text-[10px] text-sky-700 font-medium">অনলাইন ব্যাংকিং / ডিপোজিট / NPSB / BEFTN</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#123184] bg-white px-2 py-0.5 rounded-lg border border-sky-200">
                      ৳{grandTotal.toFixed(0)}
                    </span>
                  </div>

                  {/* Multiple Banks Switcher Pills */}
                  {availableBanks.length > 1 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-sky-900 block">ব্যাংক নির্বাচন করুন:</span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {availableBanks.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBankId(b.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                              (currentBank?.id === b.id)
                                ? 'bg-[#123184] text-white shadow-2xs'
                                : 'bg-white border border-sky-300 text-sky-900 hover:bg-sky-100'
                            }`}
                          >
                            🏦 {b.bankName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank Account Details Grid */}
                  <div className="grid sm:grid-cols-2 gap-2 bg-white/95 p-3 rounded-xl border border-sky-200 text-xs shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">ব্যাংকের নাম (Bank Name):</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {currentBank?.bankName || 'Islami Bank Bangladesh Ltd'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">হিসাবধারীর নাম (Account Name):</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {currentBank?.accountName || 'Beli Pharmacy'}
                      </span>
                    </div>

                    <div className="sm:col-span-2 flex items-center justify-between bg-sky-50/80 p-2.5 rounded-lg border border-sky-200">
                      <div>
                        <span className="text-[10px] text-sky-800 font-bold block">হিসাব নম্বর (Account Number):</span>
                        <span className="font-mono font-black text-sm text-[#123184] select-all tracking-wider">
                          {currentBank?.accountNumber || '2050 1480 2003 4567'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(currentBank?.accountNumber, 'bank_acc')}
                        className="px-2.5 py-1 bg-white hover:bg-sky-100 text-[#123184] rounded-lg border border-sky-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        {copiedField === 'bank_acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'bank_acc' ? 'কপিকৃত!' : 'কপি'}</span>
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">শাখা (Branch Name):</span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {currentBank?.branchName || 'Dupchanchia Branch'}
                      </span>
                    </div>

                    {currentBank?.routingNumber && (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block">রাউটিং নম্বর (Routing No):</span>
                          <span className="font-mono font-bold text-slate-900 mt-0.5 block">{currentBank?.routingNumber}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentBank?.routingNumber, 'bank_route')}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          title="রাউটিং কপি করুন"
                        >
                          {copiedField === 'bank_route' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'bank_route' ? 'কপিকৃত' : 'কপি'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {currentBank?.instructions && (
                    <p className="text-[11px] text-sky-900 bg-sky-100/60 p-2.5 rounded-xl border border-sky-200 leading-relaxed">
                      💡 <b>নির্দেশনা:</b> {currentBank?.instructions}
                    </p>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#123184] mb-1">
                      ব্যাংক ডিপোজিট স্লিপ / রেফারেন্স নম্বর / TrxID *
                    </label>
                    <input
                      type="text"
                      required
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="যেমন: IBBL-98213456 বা ডিপোজিট স্লিপ নং"
                      className="w-full bg-white px-3.5 py-2 rounded-xl border border-sky-300 text-xs font-mono font-bold outline-none focus:border-[#123184] focus:ring-1 focus:ring-[#123184]"
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Optional Patient/Doctor Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'ফার্মাসিস্টের জন্য কোনো বিশেষ বার্তা (ঐচ্ছিক)' : 'Special note for Pharmacist (Optional)'}
            </label>
            <input
              type="text"
              value={patientNote}
              onChange={(e) => setPatientNote(e.target.value)}
              placeholder={lang === 'bn' ? "যেমন: রোগীর প্রেসার বেশি, নির্দিষ্ট ব্র্যান্ড ছাড়া অন্য ব্র্যান্ড দিবেন না" : "Any special instruction..."}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 outline-none"
            />
          </div>

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>{lang === 'bn' ? 'ওষুধের মূল্য' : 'Medicines Total'}</span>
              <span className="font-semibold text-slate-900">৳{cartSubtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                <span>-৳{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
              <span className="font-semibold text-slate-900">৳{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
              <span>{lang === 'bn' ? 'মোট পরিশোধযোগ্য' : 'Grand Total'}</span>
              <span className="text-[#123184]">৳{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button with Delivery Boy Bicycle Animation */}
          <div className="relative w-full">
            <button
              type="submit"
              disabled={orderState !== 'idle'}
              className={`w-full relative overflow-hidden font-extrabold py-3.5 px-4 rounded-2xl shadow-xl text-sm flex items-center justify-center transition-all duration-300 min-h-[54px] select-none ${
                orderState === 'riding'
                  ? 'bg-gradient-to-r from-slate-900 via-[#123184] to-slate-900 border-2 border-[#02975E] shadow-emerald-900/40 cursor-wait'
                  : orderState === 'success'
                  ? 'bg-[#02975E] text-white shadow-[#02975E]/40 scale-[1.01]'
                  : 'bg-[#02975E] hover:bg-[#027e4e] text-white shadow-[#02975E]/30 cursor-pointer transform hover:-translate-y-0.5 active:scale-98'
              }`}
            >
              {orderState === 'idle' && (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <span>{lang === 'bn' ? `৳${grandTotal.toFixed(2)} - অর্ডার কনফার্ম করুন` : `Place Order (৳${grandTotal.toFixed(2)})`}</span>
                </div>
              )}

              {orderState === 'riding' && (
                <div className="w-full h-full flex items-center justify-center relative py-1">
                  {/* Road Asphalt & Moving Dashed Line */}
                  <div className="absolute inset-x-0 bottom-1 h-3 flex items-center justify-center overflow-hidden pointer-events-none opacity-40">
                    <div 
                      className="w-full h-[2px]" 
                      style={{
                        backgroundImage: 'linear-gradient(to right, white 50%, transparent 50%)',
                        backgroundSize: '16px 2px',
                        animation: 'roadMove 0.4s linear infinite'
                      }}
                    />
                  </div>

                  {/* Centered Status Text */}
                  <span className="text-xs font-bold text-white/90 tracking-wide z-10 animate-pulse flex items-center gap-1.5">
                    <span>ডেলিভারি রাইডার রওনা হচ্ছে...</span>
                  </span>

                  {/* Delivery Boy on Bicycle Riding from Left to Right */}
                  <div 
                    className="absolute bottom-1 pointer-events-none z-20"
                    style={{
                      animation: 'bikeRideAcross 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards'
                    }}
                  >
                    <div style={{ animation: 'bikePedal 0.3s ease-in-out infinite' }}>
                      <svg width="76" height="46" viewBox="0 0 110 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Speed Wind Lines */}
                        <g opacity="0.8">
                          <line x1="2" y1="28" x2="14" y2="28" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                          <line x1="8" y1="36" x2="18" y2="36" stroke="#02975E" strokeWidth="2" strokeLinecap="round" />
                          <line x1="0" y1="44" x2="12" y2="44" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                        </g>

                        {/* Rear Delivery Box with Medical Emblem */}
                        <g>
                          {/* Rack carrier frame connecting to back wheel */}
                          <line x1="26" y1="52" x2="20" y2="38" stroke="#cbd5e1" strokeWidth="2" />
                          <line x1="12" y1="38" x2="34" y2="38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
                          
                          {/* Delivery Box body in warm golden amber */}
                          <rect x="12" y="16" width="24" height="22" rx="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
                          
                          {/* Box Lid & Buckle */}
                          <line x1="12" y1="24" x2="36" y2="24" stroke="#D97706" strokeWidth="1.5" />
                          <rect x="22" y="22" width="4" height="4" rx="1" fill="#FEF3C7" />
                          
                          {/* Pharmacy Cross Emblem on Box */}
                          <circle cx="24" cy="30" r="5" fill="#ffffff" />
                          <path d="M24 27.5 V32.5 M21.5 30 H26.5" stroke="#02975E" strokeWidth="1.8" strokeLinecap="round" />
                        </g>

                        {/* Bicycle Wheels */}
                        {/* Back Wheel with Spokes */}
                        <g className="origin-center" style={{ transformOrigin: '26px 52px', animation: 'wheelRotate 0.4s linear infinite' }}>
                          <circle cx="26" cy="52" r="14" stroke="#ffffff" strokeWidth="2.5" fill="#0f172a" fillOpacity="0.4" />
                          <circle cx="26" cy="52" r="2.5" fill="#ffffff" />
                          <line x1="26" y1="38" x2="26" y2="66" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                          <line x1="12" y1="52" x2="40" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                        </g>

                        {/* Front Wheel with Spokes */}
                        <g className="origin-center" style={{ transformOrigin: '84px 52px', animation: 'wheelRotate 0.4s linear infinite' }}>
                          <circle cx="84" cy="52" r="14" stroke="#ffffff" strokeWidth="2.5" fill="#0f172a" fillOpacity="0.4" />
                          <circle cx="84" cy="52" r="2.5" fill="#ffffff" />
                          <line x1="84" y1="38" x2="84" y2="66" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                          <line x1="70" y1="52" x2="98" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                        </g>

                        {/* Bicycle Frame */}
                        <g stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="26" y1="52" x2="52" y2="52" />
                          <line x1="26" y1="52" x2="44" y2="30" />
                          <line x1="44" y1="30" x2="52" y2="52" />
                          <line x1="52" y1="52" x2="74" y2="26" />
                          <line x1="44" y1="30" x2="74" y2="26" />
                          <line x1="74" y1="26" x2="84" y2="52" stroke="#ffffff" />
                          <line x1="74" y1="26" x2="75" y2="18" stroke="#ffffff" />
                          <path d="M72 18 H80" stroke="#ffffff" strokeWidth="3" />
                        </g>

                        {/* Saddle */}
                        <path d="M38 29 Q44 27 49 29 Q44 32 38 29 Z" fill="#ffffff" />

                        {/* Delivery Boy Figure */}
                        {/* Legs & Pants */}
                        <path d="M44 32 L56 42 L52 52" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        <ellipse cx="52" cy="53" rx="4" ry="2" fill="#ffffff" />

                        {/* Jersey in Brand Green */}
                        <path d="M44 31 L64 19 Q67 23 63 28 L49 35 Z" fill="#02975E" />

                        {/* Arm extending forward */}
                        <path d="M62 21 L76 20" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />

                        {/* Head & Cap */}
                        <circle cx="61" cy="11" r="6" fill="#FBBF24" />
                        <path d="M55 11 Q61 4 69 9 Q68 13 60 13 Z" fill="#123184" />
                        <path d="M66 10 L74 11" stroke="#123184" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {orderState === 'success' && (
                <div className="flex items-center justify-center gap-2 text-white animate-in zoom-in-75 duration-300">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm sm:text-base font-black tracking-wide">
                    {lang === 'bn' ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে! 🎉' : 'Order Placed Successfully! 🎉'}
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
