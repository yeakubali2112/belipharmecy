import React from 'react';
import { X, Printer, CheckCircle, Share2, Phone, Pill } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const InvoiceModal = () => {
  const { activeInvoiceOrder, setActiveInvoiceOrder, config, lang } = useShop();

  if (!activeInvoiceOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Beli Pharmacy! My Order ID is ${activeInvoiceOrder.id}. Total Amount: ৳${activeInvoiceOrder.grandTotal}. Name: ${activeInvoiceOrder.customerName}. Please confirm delivery.`
    );
    window.open(`https://wa.me/8801712345678?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (hidden when printing) */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="bg-[#123184] text-white text-xs font-bold px-2 py-0.5 rounded">
              {lang === 'bn' ? 'অফিসিয়াল ইনভয়েস' : 'Official Invoice'}
            </span>
            <span className="text-xs font-semibold text-slate-700">
              #{activeInvoiceOrder.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1.5 bg-[#02975E] hover:bg-[#027e4e] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-[#123184] hover:bg-[#0d2463] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'প্রিন্ট / সেভ' : 'Print'}</span>
            </button>

            <button
              onClick={() => setActiveInvoiceOrder(null)}
              className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-5">
            <div>
              <div className="mb-2">
                <img 
                  src="/logo.png" 
                  alt="বেলী ফার্মেসি" 
                  className="h-12 w-auto object-contain" 
                />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {config.slogan}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {config.address}
              </p>
              <p className="text-xs text-slate-600">
                হটলাইন ও ফোন: ০১৭৭৪ ৯৬১৭৫৭
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                ড্রাগ লাইসেন্স নং: DA-DH-2024-9182 • ভ্যাট নং: BIN-002918274
              </p>
            </div>

            <div className="text-right">
              <span className="text-lg font-black text-slate-900 block">
                CASH MEMO
              </span>
              <span className="text-xs font-bold text-emerald-800 block">
                {activeInvoiceOrder.id}
              </span>
              <span className="text-xs text-slate-500 block mt-1">
                {activeInvoiceOrder.createdAt}
              </span>
              <span className="inline-block mt-2 bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300 uppercase">
                {activeInvoiceOrder.status}
              </span>
            </div>
          </div>

          {/* Customer & Billing Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-1">
                বিল টু / গ্রাহকের তথ্য:
              </span>
              <p className="font-bold text-slate-900 text-sm">{activeInvoiceOrder.customerName}</p>
              <p className="text-slate-600">মোবাইল: {activeInvoiceOrder.customerPhone}</p>
              <p className="text-slate-600 mt-0.5">{activeInvoiceOrder.deliveryAddress}</p>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-500 uppercase block text-[10px] tracking-wider mb-1">
                পেমেন্ট ও ডেলিভারি বিবরণ:
              </span>
              <div className="flex items-center gap-1.5 text-slate-700">
                <span>পদ্ধতি:</span>
                {(activeInvoiceOrder.paymentMethod === 'bkash' || activeInvoiceOrder.paymentMethod === 'bKash') && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#D12053]">
                    <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain inline" />
                    <span>(বিকাশ)</span>
                  </span>
                )}
                {(activeInvoiceOrder.paymentMethod === 'nagad' || activeInvoiceOrder.paymentMethod === 'Nagad') && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#E31B23]">
                    <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain inline" />
                    <span>(নগদ)</span>
                  </span>
                )}
                {(activeInvoiceOrder.paymentMethod === 'bank' || activeInvoiceOrder.paymentMethod === 'Bank' || activeInvoiceOrder.paymentMethod === 'Bank Transfer') && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#123184]">
                    <span>🏦 ব্যাংক ট্রান্সফার (Bank)</span>
                  </span>
                )}
                {(activeInvoiceOrder.paymentMethod === 'cod' || activeInvoiceOrder.paymentMethod === 'Cash on Hand') && (
                  <b className="text-slate-800">💵 Cash on Hand (হাতে নগদ)</b>
                )}
              </div>
              {activeInvoiceOrder.trxId && activeInvoiceOrder.trxId !== 'N/A' && (
                <p className="text-slate-700">TrxID / Ref: <b className="font-mono">{activeInvoiceOrder.trxId}</b></p>
              )}
              <p className="text-slate-700">
                গতি: <b>{activeInvoiceOrder.deliveryType === 'express' ? '৬০-মিনিট এক্সপ্রেস' : 'নিয়মিত ডেলিভারি'}</b>
              </p>
            </div>
          </div>

          {/* Medicines Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">ক্রমিক</th>
                  <th className="py-2.5 px-3">ওষুধের নাম ও বিবরণ</th>
                  <th className="py-2.5 px-3 text-center">প্যাক</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">একক মূল্য</th>
                  <th className="py-2.5 px-3 text-right">মোট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeInvoiceOrder.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.generic}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center">{item.unitLabel}</td>
                    <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">৳{item.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total Calculation breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>সাবটোটাল:</span>
                <span className="font-semibold">৳{activeInvoiceOrder.subtotal?.toFixed(2)}</span>
              </div>
              {activeInvoiceOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>ডিসকাউন্ট:</span>
                  <span>-৳{activeInvoiceOrder.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>ডেলিভারি ফি:</span>
                <span className="font-semibold">
                  {Number(activeInvoiceOrder.deliveryFee) === 0 ? 'ফ্রি (৳০)' : `৳${(Number(activeInvoiceOrder.deliveryFee) || 0).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-emerald-800">৳{(Number(activeInvoiceOrder.grandTotal ?? activeInvoiceOrder.total) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              আমাদের সাথে থাকার জন্য ধন্যবাদ! সুস্থ থাকুন, নিরাপদ থাকুন।
            </p>
            <p>
              ওষুধ সংরক্ষণের নির্দেশিকা মেনে চলুন। রেজিস্টার্ড চিকিৎসকের পরামর্শ ছাড়া অ্যান্টিবায়োটিক সেবন করবেন না।
            </p>
            <p className="text-[10px] text-slate-400">
              কম্পিউটার জেনারেটেড রসিদ, স্বাক্ষরের প্রয়োজন নেই।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
