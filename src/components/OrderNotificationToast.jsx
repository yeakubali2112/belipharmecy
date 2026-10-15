import React from 'react';
import { useShop } from '../context/ShopContext';
import { Bell, FileText, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const OrderNotificationToast = ({ isUserView = false }) => {
  const { 
    orderNotification, 
    setOrderNotification, 
    setActiveInvoiceOrder, 
    toast, 
    lang
  } = useShop();

  return (
    <div className={`fixed z-50 flex flex-col gap-3 pointer-events-none transition-all duration-300 ${
      isUserView 
        ? 'bottom-20 right-4 sm:bottom-6 sm:right-6 max-w-sm w-[calc(100%-2rem)] sm:w-96' 
        : 'bottom-6 right-6 max-w-sm w-[calc(100%-3rem)] sm:w-96'
    }`}>
      {/* General Toast Alert */}
      {toast && (
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-3 fade-in duration-200">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Real-time Order Notification Card (Bottom-Right Red Box Area) */}
      {orderNotification && (
        <div className="pointer-events-auto bg-white border-2 border-[#02975E] rounded-2xl shadow-2xl shadow-emerald-950/20 p-4 border-l-8 border-l-[#123184] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#02975E] flex items-center justify-center shrink-0 border border-emerald-200">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                    {isUserView 
                      ? (lang === 'bn' ? 'অর্ডার গ্রহণ' : 'Order Placed')
                      : (lang === 'bn' ? 'নতুন অর্ডার' : 'New Order')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{orderNotification.time}</span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-1 flex items-center gap-1.5">
                  <span>{lang === 'bn' ? 'অর্ডার নং:' : 'Order ID:'}</span>
                  <span className="font-mono text-[#123184] bg-slate-100 px-1.5 py-0.5 rounded text-xs font-bold">
                    {orderNotification.id}
                  </span>
                </h4>
              </div>
            </div>
            
            <button
              onClick={() => setOrderNotification(null)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              {orderNotification.customerName && (
                <p className="text-slate-600 font-semibold truncate">
                  গ্রাহক: <strong className="text-slate-900">{orderNotification.customerName}</strong>
                </p>
              )}
              <p className="text-slate-500 font-medium">
                মোট মূল্য: <strong className="text-[#02975E] text-sm font-black">৳{orderNotification.totalAmount}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  if (orderNotification.order) {
                    setActiveInvoiceOrder(orderNotification.order);
                  }
                  setOrderNotification(null);
                }}
                className="bg-[#123184] hover:bg-[#0d2463] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ইনভয়েস' : 'Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
