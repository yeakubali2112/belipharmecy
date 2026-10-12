import React, { useState, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  PhoneCall, 
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Mic
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const PrescriptionUploadModal = () => {
  const { 
    isPrescriptionModalOpen, 
    setIsPrescriptionModalOpen, 
    uploadPrescription,
    currentCustomer,
    lang 
  } = useShop();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'loading' | 'done'

  useEffect(() => {
    if (isPrescriptionModalOpen && currentCustomer) {
      if (!customerName) setCustomerName(currentCustomer.name || '');
      if (!customerPhone) setCustomerPhone(currentCustomer.phone || '');
      if (!deliveryAddress) setDeliveryAddress(currentCustomer.address || '');
    }
  }, [isPrescriptionModalOpen, currentCustomer]);

  if (!isPrescriptionModalOpen) return null;

  // Compress high-resolution smartphone / camera images to safe ~150-250KB size
  const compressPrescriptionImage = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে ছবি ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।' : 'Please choose an image file (JPG, PNG, WEBP).');
      return;
    }

    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 1200; // Optimal 1200px: ultra clear text for doctors/pharmacists, yet tiny payload
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          let compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          // If still large (>600KB), compress with quality 0.65
          if (compressedBase64.length > 700000) {
            compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          }

          setIsCompressing(false);
          callback(compressedBase64);
        } catch (err) {
          console.error('Image compression error:', err);
          setIsCompressing(false);
          callback(event.target.result);
        }
      };
      img.onerror = () => {
        setIsCompressing(false);
        alert(lang === 'bn' ? 'ছবিটি লোড করা সম্ভব হয়নি, অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।' : 'Failed to load image, please select another one.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsCompressing(false);
      alert(lang === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে।' : 'Error reading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      compressPrescriptionImage(file, (compressed) => {
        setPreviewImage(compressed);
      });
    }
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে রোগীর নাম ও সচল ফোন নম্বর দিন।' : 'Please provide patient name and phone.');
      return;
    }

    if (!previewImage) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে প্রেসক্রিপশনের ছবি আপলোড করুন।' : 'Please upload prescription image.');
      return;
    }

    if (isCompressing || uploadState !== 'idle') return;

    setUploadState('loading');
    try {
      // Smooth visual loading animation delay (1.2s)
      await new Promise(resolve => setTimeout(resolve, 1200));

      uploadPrescription({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAvatar: currentCustomer?.avatar || null,
        deliveryAddress: deliveryAddress.trim() || 'ঠিকানা ফোনে কনফার্ম করা হবে',
        notes: notes.trim(),
        image: previewImage
      });

      // Switch to success state: "Upload done"
      setUploadState('done');

      // Hold "Upload done" state for 1.8s so user can see and celebrate confirmation
      setTimeout(() => {
        setCustomerName('');
        setCustomerPhone('');
        setDeliveryAddress('');
        setNotes('');
        setPreviewImage(null);
        setUploadState('idle');
        setIsPrescriptionModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error('Error submitting prescription:', err);
      alert(lang === 'bn' ? 'প্রেসক্রিপশন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to submit prescription. Please try again.');
      setUploadState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Brand Gradient #123184 to #02975E */}
        <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
              <UploadCloud className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {lang === 'bn' ? 'প্রেসক্রিপশন আপলোড করুন' : 'Upload Prescription'}
              </h2>
              <span className="text-xs text-emerald-100">
                {lang === 'bn' ? 'ফার্মাসিস্টের সরাসরি রিভিউ ও হোম ডেলিভারি' : 'Direct Review by Registered Pharmacist'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsPrescriptionModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Feature Highlight: Bengali Voice Note Support */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl p-3 sm:p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div className="text-xs space-y-1">
              <span className="font-black text-amber-950 flex items-center gap-1.5 text-xs sm:text-sm">
                <span>🎙️ প্রেসক্রিপশন ভয়েস নোট</span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">নতুন সেবা</span>
              </span>
              <p className="text-[11px] sm:text-xs text-amber-900 leading-snug">
                ডাক্তারের হাতের লেখা বুঝতে সমস্যা? প্রেসক্রিপশন আপলোড করলেই আমাদের ফার্মাসিস্ট ওষুধ যাচাই করার পর আপনাকে ৩০-৬০ সেকেন্ডের বাংলা ভয়েস নোট পাঠিয়ে বুঝিয়ে দেবেন কোন ওষুধ কীভাবে খাবেন!
              </p>
            </div>
          </div>

          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {lang === 'bn' ? 'প্রেসক্রিপশনের ছবি সিলেক্ট করুন *' : 'Select Prescription Photo *'}
            </label>

            {isCompressing ? (
              <div className="border-2 border-dashed border-emerald-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-emerald-50/50">
                <span className="w-8 h-8 border-3 border-[#02975E] border-t-transparent rounded-full animate-spin mb-3"></span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {lang === 'bn' ? 'প্রেসক্রিপশনের ছবি অপ্টিমাইজ করা হচ্ছে...' : 'Optimizing prescription photo...'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  {lang === 'bn' ? 'অনুগ্রহ করে কয়েক মুহূর্ত অপেক্ষা করুন' : 'Please wait a moment'}
                </span>
              </div>
            ) : previewImage ? (
              <div className="relative border-2 border-emerald-500 rounded-2xl overflow-hidden bg-slate-50 p-2 flex flex-col items-center">
                <img
                  src={previewImage}
                  alt="Prescription preview"
                  className="max-h-56 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 py-1 px-3 rounded-lg bg-rose-50 border border-rose-200 cursor-pointer"
                >
                  {lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Image'}
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-emerald-50/30 hover:bg-emerald-50/60 transition-all">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {lang === 'bn' ? 'ছবি আপলোড করতে ক্লিক করুন বা টেনে আনুন' : 'Click to browse or drag & drop image'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG বা পরিষ্কার ক্যামেরায় তোলা ছবি (সর্বোচ্চ ১০ এমবি)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Patient Details */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'রোগী / আপনার নাম *' : 'Patient Name *'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={lang === 'bn' ? "যেমন: মোহাম্মদ রহিম" : "e.g., Mohammad Rahim"}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'bn' ? 'সচল মোবাইল নম্বর *' : 'Mobile Number *'}
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
            </label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder={lang === 'bn' ? "বাড়ি, রোড, এলাকা (ঐচ্ছিক - ফোনেও বলতে পারেন)" : "Address (Optional)"}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'bn' ? 'ফার্মাসিস্টের জন্য কোনো নোট (যেমন: ৩ দিনের ওষুধ লাগবে)' : 'Notes for Pharmacist'}
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'bn' ? "কোন ওষুধ কত দিনের প্রয়োজন বা বিশেষ ব্র্যান্ডের নাম..." : "Any specifics..."}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 outline-none resize-none"
            ></textarea>
          </div>

          {/* Process steps notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-600">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {lang === 'bn' ? 'প্রেসক্রিপশন আপলোডের পরের ধাপ:' : 'How it works:'}
            </span>
            <ul className="space-y-1 pl-5 list-disc text-[11px] text-slate-600">
              <li>{lang === 'bn' ? 'আমাদের ফার্মাসিস্ট প্রেসক্রিপশন দেখে নির্ভুল ওষুধের তালিকা ও মূল্য তৈরি করবেন।' : 'Pharmacist reviews prescription & prepares exact bill.'}</li>
              <li>{lang === 'bn' ? 'আপনাকে ফোন করে ওষুধ কনফার্ম করার পর ডেলিভারি পাঠানো হবে।' : 'You receive a phone call to confirm total bill & address.'}</li>
              <li>{lang === 'bn' ? 'ওষুধ হাতে পেয়ে ক্যাশ অথবা বিকাশে মূল্য পরিশোধ করতে পারবেন।' : 'Pay via Cash or bKash upon medicine arrival.'}</li>
            </ul>
          </div>

          {/* Submit button with Loading Animation and "Upload done" text */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isCompressing || uploadState !== 'idle'}
              className={`w-full text-white font-extrabold py-3.5 rounded-2xl shadow-xl text-sm flex items-center justify-center gap-2.5 transition-all duration-300 ${
                uploadState === 'done'
                  ? 'bg-emerald-600 shadow-emerald-500/40 ring-4 ring-emerald-300/60 scale-[1.01]'
                  : uploadState === 'loading'
                  ? 'bg-emerald-700 shadow-emerald-600/30 ring-2 ring-emerald-400/50 cursor-wait'
                  : isCompressing
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#02975E] hover:bg-[#027e4e] shadow-[#02975E]/30 cursor-pointer active:scale-98'
              }`}
            >
              {isCompressing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{lang === 'bn' ? 'ছবি প্রস্তুত হচ্ছে...' : 'Processing image...'}</span>
                </>
              ) : uploadState === 'loading' ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span className="tracking-wide animate-pulse">{lang === 'bn' ? 'প্রেসক্রিপশন আপলোড হচ্ছে...' : 'Uploading prescription...'}</span>
                </>
              ) : uploadState === 'done' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                  <span className="tracking-wide text-base font-black">Upload done</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>{lang === 'bn' ? 'প্রেসক্রিপশন জমা দিন' : 'Submit Prescription'}</span>
                </>
              )}
            </button>

            {uploadState === 'done' && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-2.5 text-center text-xs font-bold animate-in zoom-in-95 flex items-center justify-center gap-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>প্রেসক্রিপশন সফলভাবে জমা হয়েছে! আমাদের ফার্মাসিস্ট দ্রুত যোগাযোগ করবেন।</span>
              </div>
            )}
          </div>
        </form>

      </div>
    </div>
  );
};
