import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, AlertCircle, X, RotateCcw } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  subMessage,
  confirmText,
  cancelText,
  isDanger = true,
  lang = 'bn'
}) => {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultTitle = isDanger 
    ? (lang === 'bn' ? 'মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Deletion')
    : (lang === 'bn' ? 'নিশ্চিতকরণ' : 'Confirm Action');

  const defaultConfirmText = isDanger
    ? (lang === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : 'Yes, Delete')
    : (lang === 'bn' ? 'নিশ্চিত করুন' : 'Confirm');

  const defaultCancelText = lang === 'bn' ? 'বাতিল' : 'Cancel';

  return (
    <div 
      className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 select-none"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer z-10"
          title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-7 text-center">
          {/* Centered Icon Badge */}
          <div className="relative mx-auto mb-4 flex items-center justify-center">
            {isDanger ? (
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
                <Trash2 className="w-8 h-8 stroke-[2.2]" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#123184] shadow-inner">
                <AlertCircle className="w-8 h-8 stroke-[2.2]" />
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {title || defaultTitle}
          </h3>

          {/* Item Name Highlight Pill (if available) */}
          {itemName && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 max-w-full truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span className="truncate">{itemName}</span>
            </div>
          )}

          {/* Primary Message */}
          <p className="mt-3 text-sm sm:text-base font-semibold text-slate-700 leading-relaxed px-1">
            {message}
          </p>

          {/* Optional Sub-message or Warning Notice */}
          {subMessage ? (
            <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">
              {subMessage}
            </p>
          ) : isDanger ? (
            <p className="mt-2 text-xs text-slate-400 font-medium">
              {lang === 'bn' 
                ? 'এই কাজটি সম্পন্ন হলে ডাটা স্থায়ীভাবে মুছে যাবে।' 
                : 'This action cannot be undone once deleted.'}
            </p>
          ) : null}

          {/* Irreversible Action Warning Banner */}
          {isDanger && (
            <div className="mt-4 bg-amber-50/90 border border-amber-200 rounded-xl p-2.5 text-left flex items-center gap-2 text-amber-900 text-[11px] font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {lang === 'bn' 
                  ? 'সতর্কতা: মুছে ফেলা আইটেম পরবর্তীতে পুনরুদ্ধার করা যাবে না।' 
                  : 'Warning: This item cannot be recovered later.'}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs"
            >
              {cancelText || defaultCancelText}
            </button>

            <button
              type="button"
              onClick={() => {
                const action = onConfirm;
                onClose?.();
                if (action) {
                  action();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                isDanger
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/30'
                  : 'bg-gradient-to-r from-[#123184] to-[#02975E] hover:opacity-95 shadow-md shadow-blue-900/30'
              }`}
            >
              {isDanger ? <Trash2 className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
              <span>{confirmText || defaultConfirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
