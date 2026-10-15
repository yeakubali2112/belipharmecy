import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  FileText, 
  LogOut, 
  Edit3, 
  Save, 
  ChevronRight, 
  ShoppingBag, 
  ShieldCheck, 
  PhoneCall, 
  Eye, 
  Pill, 
  Sparkles, 
  ArrowRight, 
  Receipt,
  Camera,
  Upload,
  Trash2,
  Check,
  Mic
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PRESET_AVATARS } from '../data/avatars';
import { VoiceNotePlayer } from './VoiceNotePlayer';

export const CustomerProfileModal = () => {
  const { 
    isCustomerProfileOpen, 
    setIsCustomerProfileOpen, 
    currentCustomer, 
    customerProfiles, 
    loginCustomer, 
    logoutCustomer, 
    updateCustomerProfile,
    orders, 
    prescriptions, 
    setActiveInvoiceOrder,
    updateOrderPaymentMethod,
    config, 
    lang,
    medicines,
    addToCart,
    markPrescriptionAddedToCart,
    setIsPrescriptionModalOpen,
    setIsCartOpen
  } = useShop();

  // Active tab: 'orders', 'prescriptions', 'edit'
  const [activeTab, setActiveTab] = useState('orders');

  // Edit Profile Form State
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Avatar Photo State & File Input Ref
  const fileInputRef = useRef(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [guestAvatar, setGuestAvatar] = useState(null);

  // Selected payment method before confirming
  const [selectedMethods, setSelectedMethods] = useState({});

  // Login / Switch account form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginAddress, setLoginAddress] = useState('');

  // Prescription image preview modal
  const [previewRx, setPreviewRx] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে ছবি ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।' : 'Please choose an image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ছবির সাইজ ৫ মেগাবাইটের কম হতে হবে।' : 'Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
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
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

        if (currentCustomer) {
          updateCustomerProfile({ avatar: compressedBase64 });
        } else {
          setGuestAvatar(compressedBase64);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectPresetAvatar = (avatarUrl) => {
    if (currentCustomer) {
      updateCustomerProfile({ avatar: avatarUrl });
    } else {
      setGuestAvatar(avatarUrl);
    }
  };

  const handleRemoveAvatar = () => {
    if (currentCustomer) {
      updateCustomerProfile({ avatar: null });
    } else {
      setGuestAvatar(null);
    }
  };

  if (!isCustomerProfileOpen) return null;

  // Filter orders and prescriptions for current customer
  const customerOrders = orders.filter(o => 
    currentCustomer && o.customerPhone && (
      o.customerPhone.trim() === currentCustomer.phone.trim() ||
      o.customerPhone.includes(currentCustomer.phone) ||
      currentCustomer.phone.includes(o.customerPhone)
    )
  );

  const customerPrescriptions = prescriptions.filter(p => 
    currentCustomer && p.customerPhone && (
      p.customerPhone.trim() === currentCustomer.phone.trim() ||
      p.customerPhone.includes(currentCustomer.phone)
    )
  );

  const totalOrders = customerOrders.length;
  const activeOrders = customerOrders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const deliveredOrders = customerOrders.filter(o => o.status === 'Delivered').length;
  const totalSpent = customerOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const handleStartEdit = () => {
    if (currentCustomer) {
      setEditName(currentCustomer.name || '');
      setEditAddress(currentCustomer.address || '');
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateCustomerProfile({
      name: editName.trim(),
      address: editAddress.trim()
    });
    setIsEditing(false);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;
    loginCustomer(loginPhone, loginName, loginAddress, guestAvatar);
    setLoginPhone('');
    setLoginName('');
    setLoginAddress('');
    setGuestAvatar(null);
  };

  const getOrderStatusInfo = (status) => {
    switch (status) {
      case 'Pending':
        return {
          step: 1,
          labelBn: 'অর্ডার গৃহীত হয়েছে (পেন্ডিং)',
          labelEn: 'Order Placed (Pending)',
          color: 'bg-amber-500 text-white',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          descBn: 'আপনার অর্ডারটি সিস্টেমে সংরক্ষিত হয়েছে, ফার্মাসিস্ট শীঘ্রই যাচাই করবেন।'
        };
      case 'Processing':
        return {
          step: 2,
          labelBn: 'ফার্মাসিস্ট প্রস্তুত করছেন',
          labelEn: 'Pharmacist Processing',
          color: 'bg-blue-600 text-white',
          badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
          descBn: 'রেজিস্টার্ড ফার্মাসিস্ট ওষুধের ব্যাচ ও মেয়াদ যাচাই করে নিরাপদ প্যাকেজিং করছেন।'
        };
      case 'Dispatched':
      case 'Out for Delivery':
        return {
          step: 3,
          labelBn: 'রাইডার ডেলিভারির পথে রয়েছে',
          labelEn: 'Out for Delivery',
          color: 'bg-purple-600 text-white',
          badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
          descBn: 'আমাদের কোল্ড-চেইন ডেলিভারি রাইডার আপনার ঠিকানায় ওষুধ পৌঁছে দিতে রওনা হয়েছে।'
        };
      case 'Delivered':
        return {
          step: 4,
          labelBn: 'সফলভাবে ডেলিভারি সম্পন্ন',
          labelEn: 'Delivered Successfully',
          color: 'bg-[#02975E] text-white',
          badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          descBn: 'ওষুধ সফলভাবে গ্রাহকের হাতে পৌঁছানো হয়েছে।'
        };
      case 'Cancelled':
        return {
          step: 0,
          labelBn: 'অর্ডার বাতিল',
          labelEn: 'Cancelled',
          color: 'bg-rose-600 text-white',
          badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
          descBn: 'গ্রাহকের অনুরোধে বা কোনো কারণে অর্ডারটি বাতিল করা হয়েছে।'
        };
      default:
        return {
          step: 1,
          labelBn: status,
          labelEn: status,
          color: 'bg-slate-500 text-white',
          badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
          descBn: ''
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Hidden File Input for Avatar Photo Upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoUpload} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] via-[#0d2463] to-[#02975E] text-white">
          <div className="flex items-center gap-3.5">
            {/* Square Container ("profile square hobe") */}
            <div className="relative group shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 p-1 border-2 border-white/30 backdrop-blur-xs flex items-center justify-center shadow-md">
                {/* Circular Profile Photo inside ("tar vitor profile pic dekhabe cycle akare") */}
                <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center font-black text-xl shadow-inner ring-2 ring-white/60">
                  {currentCustomer?.avatar ? (
                    <img src={currentCustomer.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : currentCustomer ? (
                    <span>{currentCustomer.name.slice(0, 1).toUpperCase()}</span>
                  ) : guestAvatar ? (
                    <img src={guestAvatar} alt="Guest Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-7 h-7 text-white" />
                  )}
                </div>
              </div>

              {/* Camera Trigger Badge Button ("profile photo set kora jabe") */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={lang === 'bn' ? 'ছবি পরিবর্তন / আপলোড করুন' : 'Change/Upload Photo'}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#02975E] hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-transform hover:scale-110 active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  {currentCustomer ? currentCustomer.name : (lang === 'bn' ? 'গ্রাহক প্রোফাইল' : 'Customer Profile')}
                </h2>
                {currentCustomer && (
                  <span className="bg-[#02975E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3 h-3" />
                    {lang === 'bn' ? 'ভেরিফায়েড গ্রাহক' : 'Verified'}
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100/90 flex items-center gap-2 mt-0.5">
                <Phone className="w-3 h-3 text-[#02975E]" />
                <span>{currentCustomer ? currentCustomer.phone : (lang === 'bn' ? 'অর্ডার ট্র্যাকিং ও প্রোফাইল' : 'Track orders & profile')}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCustomerProfileOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {currentCustomer ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#123184]/5 border border-[#123184]/15 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                  {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#123184]">
                  {totalOrders}
                </span>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-amber-800 block uppercase tracking-wider">
                  {lang === 'bn' ? 'চলমান অর্ডার' : 'Active Orders'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
                  {activeOrders}
                  {activeOrders > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>}
                </span>
              </div>

              <div className="bg-[#02975E]/10 border border-[#02975E]/20 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-[#02975E] block uppercase tracking-wider">
                  {lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#02975E]">
                  {deliveredOrders}
                </span>
              </div>

              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                  {lang === 'bn' ? 'মোট খরচ' : 'Total Spent'}
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-800">
                  ৳{totalSpent.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Profile Photo Manager Widget ("profile photo set kora jabe") */}
            <div className="bg-gradient-to-r from-emerald-50/70 via-blue-50/30 to-slate-50 border border-emerald-200/70 rounded-3xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {/* Square frame with circular photo inside */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white border-2 border-emerald-300 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] flex items-center justify-center text-white font-extrabold text-base shadow-inner">
                      {currentCustomer.avatar ? (
                        <img src={currentCustomer.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        currentCustomer.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#02975E]" />
                      <span>{lang === 'bn' ? 'প্রোফাইল ছবি সেট বা পরিবর্তন' : 'Profile Photo'}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {lang === 'bn' 
                        ? 'ডিভাইস থেকে ছবি আপলোড করুন অথবা রেডিমেড অবতার পছন্দ করুন' 
                        : 'Upload photo from device or choose a preset avatar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:shadow"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload Photo'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#123184] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#02975E]" />
                    <span>{showAvatarPicker ? (lang === 'bn' ? 'অবতার লুকান' : 'Hide Avatars') : (lang === 'bn' ? 'অবতার পছন্দ করুন' : 'Pick Avatar')}</span>
                  </button>

                  {currentCustomer.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="ছবি মুছে ডিফল্ট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'মুছুন' : 'Remove'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Ready-made Avatar Presets Gallery */}
              {showAvatarPicker && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {lang === 'bn' ? '১-ক্লিকে রেডিমেড অবতার সেট করুন:' : '1-Click Preset Avatars:'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = currentCustomer.avatar === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(preset.url)}
                          className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer bg-white ${
                            isSelected 
                              ? 'border-[#02975E] bg-emerald-50/60 shadow-md ring-2 ring-[#02975E]/30 scale-105' 
                              : 'border-slate-200 hover:border-[#02975E]/50 hover:bg-slate-50'
                          }`}
                        >
                          {/* Square frame with circular avatar */}
                          <div className="w-11 h-11 rounded-xl bg-slate-100 p-0.5 border border-slate-200/80 flex items-center justify-center">
                            <img src={preset.url} alt={preset.label} className="w-full h-full rounded-full object-cover" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 truncate max-w-full text-center">
                            {preset.label}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] font-black text-[#02975E] bg-emerald-100 px-1.5 py-0.5 rounded-full">
                              সিলেক্টেড
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Info Summary / Inline Edit Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-[#02975E] shrink-0" />
                      <span><b>{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Delivery Address:'}</b> {currentCustomer.address || (lang === 'bn' ? 'ঠিকানা যুক্ত করা হয়নি' : 'No address saved')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4 text-[#123184] shrink-0" />
                      <span>{lang === 'bn' ? 'নিবন্ধনের তারিখ:' : 'Member Since:'} {currentCustomer.createdAt || '২০২৬'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#123184] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'তথ্য পরিবর্তন' : 'Edit Info'}</span>
                    </button>
                    <button
                      onClick={logoutCustomer}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="লগআউট"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <h4 className="text-xs font-bold text-[#123184] uppercase tracking-wider flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-[#02975E]" />
                    {lang === 'bn' ? 'প্রোফাইল তথ্য সম্পাদন' : 'Edit Profile Details'}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'bn' ? 'পূর্ণ নাম' : 'Full Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#02975E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {lang === 'bn' ? 'ডিফল্ট ডেলিভারি ঠিকানা' : 'Default Delivery Address'}
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="বাসা #, রোড #, এলাকা..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-[#02975E] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'orders' 
                    ? 'border-[#123184] text-[#123184]' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Package className="w-4 h-4 text-[#123184]" />
                <span>{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
                <span className="bg-[#123184]/10 text-[#123184] text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {customerOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'prescriptions' 
                    ? 'border-[#02975E] text-[#02975E]' 
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-[#02975E]" />
                <span>{lang === 'bn' ? 'আপলোডকৃত প্রেসক্রিপশন' : 'Prescriptions'}</span>
                <span className="bg-[#02975E]/10 text-[#02975E] text-[11px] px-2 py-0.5 rounded-full font-bold">
                  {customerPrescriptions.length}
                </span>
              </button>
            </div>

            {/* TAB 1: ORDERS LIST WITH LIVE TIMELINE */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {customerOrders.length > 0 ? (
                  customerOrders.map((order) => {
                    const statusInfo = getOrderStatusInfo(order.status);
                    return (
                      <div 
                        key={order.id}
                        className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-[#123184]/30 transition-all space-y-4"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveInvoiceOrder(order)}
                                className="font-extrabold text-sm text-[#123184] hover:text-[#02975E] hover:underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                                title="ক্যাশ মেমো / ইনভয়েস দেখতে ক্লিক করুন"
                              >
                                #{order.id}
                              </button>
                              <span className="text-slate-400">•</span>
                              <span className="text-xs text-slate-500">
                                {order.createdAt}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#02975E]" />
                              <span>{order.deliveryAddress}</span>
                            </p>
                          </div>

                          {/* Live Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.badgeColor}`}>
                              <span className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-[#02975E]' : 'bg-amber-500 animate-pulse'}`}></span>
                              {statusInfo.labelBn}
                            </span>
                          </div>
                        </div>

                        {/* LIVE PROGRESS TIMELINE BAR (4 STEPS) */}
                        {order.status !== 'Cancelled' ? (
                          <div className="py-2 px-1">
                            <div className="relative">
                              {/* Background Gray Line */}
                              <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0"></div>
                              
                              {/* Active Green Line */}
                              <div 
                                className="absolute top-4 left-6 h-1 bg-gradient-to-r from-[#123184] to-[#02975E] -z-0 transition-all duration-500"
                                style={{
                                  width: statusInfo.step === 1 ? '10%' : statusInfo.step === 2 ? '40%' : statusInfo.step === 3 ? '75%' : '90%'
                                }}
                              ></div>

                              {/* 4 Step Nodes */}
                              <div className="grid grid-cols-4 text-center relative z-10">
                                
                                {/* Step 1: Placed */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                                    statusInfo.step >= 1 ? 'bg-[#123184] text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'
                                  }`}>
                                    1
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 ${statusInfo.step >= 1 ? 'text-[#123184]' : 'text-slate-400'}`}>
                                    অর্ডার গৃহীত
                                  </span>
                                </div>

                                {/* Step 2: Processing */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                                    statusInfo.step >= 2 ? 'bg-[#123184] text-white ring-4 ring-blue-100' : 'bg-slate-200 text-slate-400'
                                  }`}>
                                    2
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 ${statusInfo.step >= 2 ? 'text-[#123184]' : 'text-slate-400'}`}>
                                    প্রসেসিং
                                  </span>
                                </div>

                                {/* Step 3: Out for delivery */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                                    statusInfo.step >= 3 ? 'bg-[#02975E] text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-400'
                                  }`}>
                                    3
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 ${statusInfo.step >= 3 ? 'text-[#02975E]' : 'text-slate-400'}`}>
                                    ডেলিভারিতে
                                  </span>
                                </div>

                                {/* Step 4: Delivered */}
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                                    statusInfo.step >= 4 ? 'bg-[#02975E] text-white ring-4 ring-emerald-100' : 'bg-slate-200 text-slate-400'
                                  }`}>
                                    ✓
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-bold mt-1.5 ${statusInfo.step >= 4 ? 'text-[#02975E]' : 'text-slate-400'}`}>
                                    সম্পন্ন
                                  </span>
                                </div>

                              </div>
                            </div>

                            {/* Status Helper Notice */}
                            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600 flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-[#02975E] shrink-0" />
                              <span>{statusInfo.descBn}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>এই অর্ডারটি বাতিল করা হয়েছে। কোনো জিজ্ঞাসা থাকলে আমাদের হেল্পলাইনে কল করুন।</span>
                          </div>
                        )}

                        {/* When order is Delivered / সম্পন্ন: Payment Method Option (Cash on Hand, bKash, Nagad) */}
                        {order.status === 'Delivered' && (
                          order.paymentConfirmed ? (
                            /* LOCKED CONFIRMED PAYMENT DISPLAY - NO EDITING, OTHER OPTIONS HIDDEN */
                            <div className="bg-emerald-50/90 border border-[#02975E] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs animate-in fade-in">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-[#02975E] text-white flex items-center justify-center text-xs font-black shadow-xs">
                                  ✓
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h4 className="font-extrabold text-xs text-emerald-950">
                                      পেমেন্ট সফলভাবে সংরক্ষিত ও নিশ্চিত
                                    </h4>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-300 px-1.5 py-0.2 rounded-full">
                                      🔒 অপরিবর্তনযোগ্য
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-700 mt-0.5 flex flex-wrap items-center gap-1.5">
                                    <span className="font-semibold">পদ্ধতি:</span>
                                    {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') ? (
                                      <span className="inline-flex items-center gap-1 font-bold text-[#D12053] bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                                        <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain" /> bKash
                                      </span>
                                    ) : (order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') ? (
                                      <span className="inline-flex items-center gap-1 font-bold text-[#E31B23] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                                        <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain" /> Nagad
                                      </span>
                                    ) : (
                                      <span className="font-bold text-emerald-900 bg-emerald-100/60 px-2 py-0.5 rounded border border-emerald-200">
                                        💵 Cash on Hand (হাতে নগদ)
                                      </span>
                                    )}
                                    {order.trxId && order.trxId !== 'N/A' && (
                                      <span className="font-mono text-slate-800 font-bold bg-white px-2 py-0.5 border border-slate-300 rounded text-xs">
                                        TrxID: {order.trxId}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs font-black text-[#123184] bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                                মোট পরিশোধ: ৳{Number(order.grandTotal || 0).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            /* SELECTION & CONFIRMATION BOX - BEFORE SAVING */
                            (() => {
                              const activeChoice = selectedMethods[order.id] || (order.paymentMethod === 'bKash' || order.paymentMethod === 'Nagad' ? order.paymentMethod : 'Cash on Hand');
                              return (
                                <div className="bg-gradient-to-r from-emerald-50/90 via-blue-50/50 to-pink-50/40 border border-[#02975E] rounded-xl p-3 space-y-2 shadow-2xs animate-in fade-in">
                                  <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-emerald-200/80 pb-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded-full bg-[#02975E] text-white flex items-center justify-center text-[10px] font-black shadow-2xs">
                                        ✓
                                      </span>
                                      <div>
                                        <h4 className="font-extrabold text-xs text-slate-900">
                                          পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Option):
                                        </h4>
                                      </div>
                                    </div>
                                    <span className="text-[11px] font-black text-[#123184] bg-white px-2 py-0.5 rounded border border-emerald-200">
                                      বিল: ৳{Number(order.grandTotal || 0).toFixed(2)}
                                    </span>
                                  </div>

                                  {/* 3 Payment Options: Cash on Hand, bKash, Nagad */}
                                  <div className="grid grid-cols-3 gap-2">
                                    {/* Cash on Hand */}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'Cash on Hand' }))}
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
                                      onClick={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'bKash' }))}
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
                                      onClick={() => setSelectedMethods(prev => ({ ...prev, [order.id]: 'Nagad' }))}
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
                                  </div>

                                  {/* Cash on Hand save box */}
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
                                        onClick={() => updateOrderPaymentMethod(order.id, 'Cash on Hand', 'N/A', true)}
                                        className="bg-[#02975E] hover:bg-[#027e4e] text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                      >
                                        সংরক্ষণ
                                      </button>
                                    </div>
                                  )}

                                  {/* bKash save box with TrxID */}
                                  {activeChoice === 'bKash' && (
                                    <div className="bg-white border border-pink-200 p-3 rounded-xl space-y-1.5 text-xs text-pink-950 animate-in fade-in">
                                      <div className="flex items-center gap-2">
                                        <img src="/bkash-logo.png" alt="bKash" className="h-4 object-contain" />
                                        <span className="font-bold">বিকাশ পেমেন্ট সম্পন্ন করতে:</span>
                                      </div>
                                      <p className="leading-relaxed">
                                        বিকাশ নম্বর: <b className="text-[#D12053] font-mono select-all bg-pink-50 px-1.5 py-0.5 rounded">{config.bkashNumber}</b> এ <b>৳{Number(order.grandTotal).toFixed(0)}</b> টাকা পাঠিয়ে TrxID সংরক্ষণ করুন।
                                      </p>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          id={`cust-trx-${order.id}`}
                                          defaultValue={order.trxId !== 'N/A' ? order.trxId : ''}
                                          placeholder="BKASH TRXID (যেমন: 9J8B21K3)"
                                          className="flex-1 px-3 py-1.5 border border-pink-300 rounded-lg text-xs font-mono uppercase font-bold outline-none focus:border-[#D12053]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const val = document.getElementById(`cust-trx-${order.id}`)?.value?.trim();
                                            if (!val) {
                                              alert('অনুগ্রহ করে বিকাশ TrxID প্রদান করুন');
                                              return;
                                            }
                                            updateOrderPaymentMethod(order.id, 'bKash', val, true);
                                          }}
                                          className="bg-[#D12053] hover:bg-pink-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                        >
                                          সংরক্ষণ
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Nagad save box with TrxID */}
                                  {activeChoice === 'Nagad' && (
                                    <div className="bg-white border border-orange-200 p-3 rounded-xl space-y-1.5 text-xs text-orange-950 animate-in fade-in">
                                      <div className="flex items-center gap-2">
                                        <img src="/nagad-logo.png" alt="Nagad" className="h-4 object-contain" />
                                        <span className="font-bold">নগদ পেমেন্ট সম্পন্ন করতে:</span>
                                      </div>
                                      <p className="leading-relaxed">
                                        নগদ নম্বর: <b className="text-[#E31B23] font-mono select-all bg-orange-50 px-1.5 py-0.5 rounded">{config.nagadNumber}</b> এ <b>৳{Number(order.grandTotal).toFixed(0)}</b> টাকা পাঠিয়ে TrxID সংরক্ষণ করুন।
                                      </p>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          id={`cust-trx-${order.id}`}
                                          defaultValue={order.trxId !== 'N/A' ? order.trxId : ''}
                                          placeholder="NAGAD TRXID (যেমন: 7GA8X10)"
                                          className="flex-1 px-3 py-1.5 border border-orange-300 rounded-lg text-xs font-mono uppercase font-bold outline-none focus:border-[#E31B23]"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const val = document.getElementById(`cust-trx-${order.id}`)?.value?.trim();
                                            if (!val) {
                                              alert('অনুগ্রহ করে নগদ TrxID প্রদান করুন');
                                              return;
                                            }
                                            updateOrderPaymentMethod(order.id, 'Nagad', val, true);
                                          }}
                                          className="bg-[#E31B23] hover:bg-orange-700 text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                                        >
                                          সংরক্ষণ
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          )
                        )}

                        {/* Order Items Breakdown */}
                        <div className="bg-slate-50/60 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            অর্ডারের ওষুধসমূহ ({order.items ? order.items.length : 0} টি আইটেম):
                          </span>
                          <div className="space-y-1 text-xs">
                            {order.items && order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-slate-700">
                                <span className="font-medium">
                                  • {it.name} <span className="text-slate-400 text-[11px]">({it.quantity} {it.unitLabel || 'পাতা'})</span>
                                </span>
                                <span className="font-bold text-slate-900">
                                  ৳{(Number(it.price) * it.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total Bill & Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                          <div>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mb-0.5">
                              <span>পেমেন্ট মেথড:</span>
                              {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') ? (
                                <span className="inline-flex items-center gap-1 text-[#D12053] font-bold">
                                  <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain" /> bKash
                                </span>
                              ) : (order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') ? (
                                <span className="inline-flex items-center gap-1 text-[#E31B23] font-bold">
                                  <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain" /> Nagad
                                </span>
                              ) : (
                                <b className="text-slate-800 font-bold">💵 Cash on Hand</b>
                              )}
                              {order.trxId && order.trxId !== 'N/A' && <span className="font-mono text-slate-600 font-bold">({order.trxId})</span>}
                            </span>
                            <span className="text-base font-black text-[#123184]">
                              মোট বিল: ৳{Number(order.grandTotal || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setActiveInvoiceOrder(order)}
                              className="px-3.5 py-2 rounded-xl bg-[#123184] hover:bg-[#0d2463] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>ক্যাশ মেমো / ইনভয়েস</span>
                            </button>

                            <a
                              href={`tel:${config.phone}`}
                              className="px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-[#02975E] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                              title="সরাসরি কল দিন"
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-[#02975E]" />
                              <span>হেল্পলাইন</span>
                            </a>
                          </div>
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      {lang === 'bn' ? 'আপনার কোনো পূর্ববর্তী অর্ডার নেই' : 'No orders found yet'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {lang === 'bn' ? 'আমাদের ক্যাটালগ থেকে ওষুধ নির্বাচন করে অর্ডার করলেই লাইভ অগ্রগতি দেখতে পারবেন।' : 'Browse our catalog and order medicines to view real-time tracking.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsCustomerProfileOpen(false);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-[#02975E] hover:bg-[#027e4e] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                    >
                      ওষুধ ব্রাউজ করুন &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: PRESCRIPTIONS LIST */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                {customerPrescriptions.length > 0 ? (
                  customerPrescriptions.map((p) => (
                    <div 
                      key={p.id}
                      className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col space-y-3.5 hover:border-[#123184]/30 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img 
                              src={p.image} 
                              alt="Prescription" 
                              onClick={() => setPreviewRx(p.image)}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <FileText className="w-6 h-6" />
                            </div>
                          )}
                          <div className="space-y-0.5 text-xs">
                            <span className="font-black text-[#123184] block text-sm">
                              #{p.id}
                            </span>
                            <span className="text-slate-500 block">
                              তারিখ: {p.createdAt}
                            </span>
                            {p.notes && (
                              <span className="text-slate-600 italic block">
                                নোট: "{p.notes}"
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                          {p.voiceNote && (
                            <span className="px-2.5 py-1 rounded-full font-bold text-xs bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <Mic className="w-3 h-3 text-amber-600" />
                              <span>🎙️ ভয়েস বার্তা</span>
                            </span>
                          )}

                          <span className={`px-3 py-1 rounded-full font-bold text-xs border ${
                            p.isAddedToCart
                              ? 'bg-emerald-100 text-[#02975E] border-emerald-300'
                              : p.prescribedMedicines && p.prescribedMedicines.length > 0
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : p.status === 'Reviewed' 
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {p.isAddedToCart
                              ? '✓ কার্টে যোগ সম্পন্ন'
                              : p.prescribedMedicines && p.prescribedMedicines.length > 0 
                              ? '✓ ওষুধ প্রস্তুত ও মূল্য নির্ধারিত'
                              : p.status === 'Reviewed' 
                              ? '✓ পর্যালোচনা সম্পন্ন' 
                              : '⏳ যাচাইকরণের অপেক্ষায়'}
                          </span>

                          {p.image && (
                            <button
                              onClick={() => setPreviewRx(p.image)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="বড় করে দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Pharmacist Prescription Audio Note (Voice Note) */}
                      {p.voiceNote && (
                        <div className="mt-1">
                          <VoiceNotePlayer
                            audioUrl={p.voiceNote}
                            pharmacistNotes={p.pharmacistNotes}
                            durationLabel={p.voiceNoteDuration}
                            label="🎙️ ফার্মাসিস্টের অডিও সেবনবিধি (ভয়েস নোট)"
                          />
                        </div>
                      )}

                      {/* Pharmacist Prescribed Medicines Breakdown & Total Price */}
                      {p.prescribedMedicines && p.prescribedMedicines.length > 0 ? (
                        <div className="bg-slate-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2.5 mt-1">
                          <div className="flex items-center justify-between text-xs font-bold border-b border-slate-200 pb-2">
                            <span className="flex items-center gap-1.5 text-[#123184]">
                              <Pill className="w-4 h-4 text-[#02975E]" />
                              <span>ফার্মাসিস্ট কর্তৃক নির্ধারিত ওষুধের তালিকা ({p.prescribedMedicines.length}টি)</span>
                            </span>
                            <span className="text-[#02975E] font-black text-sm">
                              সর্বমোট মূল্য: ৳{p.totalPrice}
                            </span>
                          </div>

                          {p.pharmacistNotes && (
                            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 p-2 rounded-xl text-xs">
                              <span className="font-bold">ফার্মাসিস্ট পরামর্শ / নিয়মাবলী:</span> {p.pharmacistNotes}
                            </div>
                          )}

                          <div className="divide-y divide-slate-200 text-xs">
                            {p.prescribedMedicines.map((med, mIdx) => (
                              <div key={mIdx} className="py-2 flex items-center justify-between">
                                <div>
                                  <span className="font-extrabold text-slate-900 block">{med.name}</span>
                                  <span className="text-[11px] text-slate-500">{med.generic} • {med.unitLabel} × {med.quantity}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-slate-900 block">৳{Number(med.total || (med.unitPrice * med.quantity)).toFixed(2)}</span>
                                  <span className="text-[10px] text-slate-400">@ ৳{med.unitPrice}</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] text-slate-500 font-medium">
                              ওষুধের দাম আমাদের ওয়েবসাইট রেটের সাথে হুবহু সামঞ্জস্যপূর্ণ
                            </span>

                            {p.isAddedToCart ? (
                              <div className="flex items-center gap-1.5 bg-emerald-50 text-[#02975E] border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs select-none shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-[#02975E]" />
                                <span>✓ কার্টে যোগ সম্পন্ন হয়েছে</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  p.prescribedMedicines.forEach(med => {
                                    const catalogMed = medicines.find(m => m.id === med.medicineId) || {
                                      id: med.medicineId,
                                      name: med.name,
                                      generic: med.generic,
                                      pricePerStrip: med.rawPrice || med.unitPrice,
                                      pricePerUnit: med.rawPrice || med.unitPrice,
                                      discountPercent: med.discountPercent || 0,
                                      image: med.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60'
                                    };
                                    addToCart(catalogMed, med.unitType, med.quantity);
                                  });
                                  markPrescriptionAddedToCart(p.id);
                                  setIsCustomerProfileOpen(false);
                                  setIsCartOpen(true);
                                }}
                                className="bg-[#02975E] hover:bg-[#027e4e] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors active:scale-95"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>কার্টে নিন ও অর্ডার সম্পন্ন করুন (৳{p.totalPrice})</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 px-4 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">
                      কোনো প্রেসক্রিপশন আপলোড করা হয়নি
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      ডাক্তারের প্রেসক্রিপশন আপলোড করলে আমাদের ফার্মাসিস্ট দেখে ওষুধ হোম ডেলিভারি পাঠিয়ে দেবে।
                    </p>
                    <button
                      onClick={() => {
                        setIsCustomerProfileOpen(false);
                        setIsPrescriptionModalOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-2xl bg-[#02975E] hover:bg-[#027e4e] text-white font-bold text-xs shadow-md cursor-pointer transition-colors"
                    >
                      প্রেসক্রিপশন আপলোড করুন
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* NOT LOGGED IN: LOGIN / FIND ORDERS FORM */
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="text-center space-y-3 max-w-md mx-auto">
              {/* Square box with circular avatar inside */}
              <div className="relative inline-block mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-300 p-1 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-[#123184] to-[#02975E] flex items-center justify-center text-white">
                    {guestAvatar ? (
                      <img src={guestAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="ছবি পছন্দ করুন"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#02975E] text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer hover:scale-110 transition-transform"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                {lang === 'bn' ? 'গ্রাহক প্রোফাইলে প্রবেশ ও লাইভ ট্র্যাকিং' : 'Customer Profile & Tracking'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'bn' 
                  ? 'অর্ডার করার সময় যে মোবাইল নম্বর দিয়েছিলেন, সেটি লিখলে আপনার প্রোফাইল ও সমস্ত অর্ডারের লাইভ স্ট্যাটাস দেখতে পাবেন।' 
                  : 'Enter your phone number to view your profile and live order tracking.'}
              </p>

              {/* Quick Preset Avatars for new user */}
              <div className="flex justify-center items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-bold text-[#02975E] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer hover:bg-emerald-100"
                >
                  <Camera className="w-3 h-3" />
                  <span>ছবি দিন</span>
                </button>
                {PRESET_AVATARS.slice(0, 5).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setGuestAvatar(p.url)}
                    className={`w-7 h-7 rounded-lg border p-0.5 cursor-pointer transition-transform hover:scale-110 ${guestAvatar === p.url ? 'border-[#02975E] ring-2 ring-[#02975E]' : 'border-slate-200'}`}
                    title={p.label}
                  >
                    <img src={p.url} alt={p.label} className="w-full h-full rounded-full object-cover" />
                  </button>
                ))}
                {guestAvatar && (
                  <button
                    type="button"
                    onClick={() => setGuestAvatar(null)}
                    className="text-[10px] text-rose-600 underline font-bold ml-1 cursor-pointer"
                  >
                    রিসেট
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  মোবাইল নম্বর (Phone Number) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#02975E] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 text-sm font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  আপনার নাম (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#123184] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123184] outline-none text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#123184] hover:bg-[#0d2463] text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-[#123184]/30 text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>প্রোফাইলে যান / সাইন ইন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo profiles switcher if any exist */}
            {customerProfiles.length > 0 && (
              <div className="max-w-md mx-auto pt-4 border-t border-slate-100 text-center space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  পূর্বে ব্যবহৃত প্রোফাইল:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {customerProfiles.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => loginCustomer(p.phone, p.name, p.address)}
                      className="text-xs bg-slate-100 hover:bg-[#02975E]/10 hover:text-[#02975E] border border-slate-200 px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <User className="w-3 h-3 text-[#02975E]" />
                      <span>{p.name} ({p.phone})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Full Image Preview Modal */}
      {previewRx && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewRx(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl">
            <button
              onClick={() => setPreviewRx(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full p-2 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={previewRx}
              alt="Prescription"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
