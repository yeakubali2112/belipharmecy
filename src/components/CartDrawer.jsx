import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck,
  Sparkles
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartDrawer = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart,
    cartSubtotal, 
    rawSubtotal,
    totalItemSavings,
    couponCode,
    discountAmount,
    applyCoupon,
    setIsCheckoutModalOpen,
    config,
    coupons,
    lang 
  } = useShop();

  const [inputCoupon, setInputCoupon] = useState('');

  if (!isCartOpen) return null;

  const subtotal = Number.isFinite(Number(cartSubtotal)) ? Number(cartSubtotal) : 0;
  const discount = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const freeThreshold = Number.isFinite(Number(config?.freeDeliveryThreshold)) ? Number(config.freeDeliveryThreshold) : 500;
  const standardFee = Number.isFinite(Number(config?.deliveryFee)) ? Number(config.deliveryFee) : 40;

  const deliveryFee = subtotal >= freeThreshold ? 0 : (cart.length > 0 ? standardFee : 0);
  const grandTotal = Math.max(0, Number((subtotal - discount + deliveryFee).toFixed(2)));
  const freeDeliveryRemaining = Math.max(0, Number((freeThreshold - subtotal).toFixed(2)));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (inputCoupon) {
      applyCoupon(inputCoupon);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="absolute inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-slate-900">
                  {lang === 'bn' ? 'আপনার শপিং কার্ট' : 'Your Shopping Cart'}
                </h2>
                <span className="text-xs text-slate-500 font-medium">
                  {cart.length} {lang === 'bn' ? 'টি আইটেম' : 'items'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 cursor-pointer"
                >
                  {lang === 'bn' ? 'সব মুছুন' : 'Clear'}
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Free delivery progress bar in #02975E */}
          {cart.length > 0 && (
            <div className="bg-[#02975E]/10 border-b border-[#02975E]/20 px-4 py-2.5 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="flex items-center gap-1.5 font-medium text-[#02975E]">
                  <Truck className="w-3.5 h-3.5 text-[#02975E]" />
                  {freeDeliveryRemaining > 0 ? (
                    lang === 'bn' 
                      ? <>আর <b>৳{freeDeliveryRemaining.toFixed(0)}</b> টাকার ওষুধ কিনলে <b>ফ্রি ডেলিভারি</b>!</> 
                      : <>Add <b>৳{freeDeliveryRemaining.toFixed(0)}</b> more for <b>FREE Delivery</b>!</>
                  ) : (
                    <span className="font-bold text-[#02975E]">
                      🎉 {lang === 'bn' ? 'অভিনন্দন! আপনি পাচ্ছেন ফ্রি ডেলিভারি!' : 'Congratulations! You unlocked FREE Delivery!'}
                    </span>
                  )}
                </span>
              </div>
              <div className="w-full bg-[#02975E]/20 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#02975E] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (cartSubtotal / config.freeDeliveryThreshold) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-base text-slate-700">
                  {lang === 'bn' ? 'আপনার কার্ট খালি' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  {lang === 'bn' 
                    ? 'প্রয়োজনীয় ওষুধ বা স্বাস্থ্যপণ্য নির্বাচন করে কার্টে যোগ করুন।' 
                    : 'Add medicines or healthcare essentials to your cart.'
                  }
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  {lang === 'bn' ? 'ওষুধ কিনুন' : 'Browse Medicines'}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div 
                  key={item.key}
                  className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3 flex gap-3 items-center justify-between hover:bg-emerald-50/20 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-contain rounded-lg bg-white p-1 border border-slate-200/50"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.generic}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-emerald-800">
                        ৳{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {item.unitLabel}
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeFromCart(item.key)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center border border-slate-200 bg-white rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.key, (Number(item.quantity) || 1) - 1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 text-xs cursor-pointer"
                        title="পরিমাণ কমান"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity === '' ? '' : item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            updateCartQuantity(item.key, '');
                          } else {
                            const n = parseInt(val, 10);
                            if (!isNaN(n)) updateCartQuantity(item.key, n);
                          }
                        }}
                        onBlur={() => {
                          if (!item.quantity || Number(item.quantity) < 1) updateCartQuantity(item.key, 1);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                        }}
                        className="w-10 text-center font-bold text-slate-800 text-xs border-x border-slate-100 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-emerald-50"
                        title="সরাসরি পরিমাণ টাইপ করুন"
                      />
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.key, (Number(item.quantity) || 0) + 1)}
                        className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 text-xs cursor-pointer"
                        title="পরিমাণ বাড়ান"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
              
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value)}
                      placeholder={
                        coupons?.find(c => c.isActive) 
                          ? (lang === 'bn' ? `কুপন কোড (যেমন: ${coupons.find(c => c.isActive).code})` : `Promo code (e.g. ${coupons.find(c => c.isActive).code})`)
                          : (lang === 'bn' ? "কুপন কোড লিখুন" : "Enter promo code")
                      }
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase outline-none focus:border-emerald-600 font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>

                {/* Available active coupon chips */}
                {coupons?.filter(c => c.isActive).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-semibold">{lang === 'bn' ? 'অফার:' : 'Offers:'}</span>
                    {coupons.filter(c => c.isActive).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setInputCoupon(c.code);
                          applyCoupon(c.code);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer border ${
                          couponCode === c.code 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                            : 'bg-white hover:bg-emerald-50 text-emerald-700 border-dashed border-emerald-300'
                        }`}
                        title={c.description}
                      >
                        {c.code} ({c.type === 'percent' ? `${c.value}%` : `৳${c.value}`})
                      </button>
                    ))}
                  </div>
                )}
              </form>

              {/* Promo notice */}
              {couponCode && (
                <div className="flex items-center justify-between text-xs bg-[#02975E]/15 border border-[#02975E]/30 text-[#02975E] px-3 py-1.5 rounded-xl">
                  <span className="flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-[#02975E]" />
                    {couponCode} {lang === 'bn' ? 'সক্রিয়' : 'Applied'}
                  </span>
                  <span className="font-extrabold">-৳{discountAmount}</span>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'সাবটোটাল' : 'Subtotal'}</span>
                  <span className="font-semibold text-slate-900">৳{cartSubtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#02975E] font-semibold">
                    <span>{lang === 'bn' ? 'কুপন ডিসকাউন্ট' : 'Coupon Discount'}</span>
                    <span>-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-[#02975E] font-bold uppercase">{lang === 'bn' ? 'ফ্রি' : 'Free'}</span>
                    ) : (
                      <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total Payable'}</span>
                  <span className="text-[#123184]">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button in Brand Navy Blue #123184 */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                className="w-full bg-[#123184] hover:bg-[#0d2463] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-[#123184]/30 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 text-sm"
              >
                <span>{lang === 'bn' ? 'চেকআউট ও অর্ডার কনফার্ম করুন' : 'Proceed to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-[#02975E]" />
                <span>{lang === 'bn' ? '১০০% নিরাপদ ও সুরক্ষিত পেমেন্ট' : 'Safe & Secure Delivery'}</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
