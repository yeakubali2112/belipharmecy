import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  KeyRound, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle, 
  Check, 
  X, 
  ArrowLeft, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  Copy,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

/**
 * Web Audio API gentle notification chime for OTP arrival
 */
function playOtpChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Two-tone pleasant security chime (D5 -> A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Normalize Bangladeshi phone number for matching
 */
function normalizePhone(num) {
  return String(num || '')
    .replace(/[^0-9]/g, '')
    .replace(/^88/, '');
}

export const AdminForgotPasswordModal = ({ 
  isOpen, 
  onClose, 
  initialUsername = '', 
  onSuccess 
}) => {
  const { adminUsers, config, resetAdminPassword, showToast } = useShop();

  // Steps: 'ident' (1: Find Account & Phone) -> 'otp' (2: Verify OTP) -> 'new_password' (3: Reset Password)
  const [step, setStep] = useState('ident');

  // Form states
  const [identInput, setIdentInput] = useState(initialUsername || 'yeakub007');
  const [matchedUser, setMatchedUser] = useState(null);
  const [customPhone, setCustomPhone] = useState('');

  // OTP states
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [showSmsBanner, setShowSmsBanner] = useState(false);

  // New password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const otpInputRef = useRef(null);

  // Reset and pre-select on open
  useEffect(() => {
    if (isOpen) {
      setStep('ident');
      const startUser = initialUsername || 'yeakub007';
      setIdentInput(startUser);
      setEnteredOtp('');
      setGeneratedOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpError('');
      setPasswordError('');
      setIsSubmitting(false);
      setIsSuccess(false);
      setShowSmsBanner(false);

      findUser(startUser);
    }
  }, [isOpen, initialUsername, adminUsers]);

  // Cooldown countdown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Find user based on input (username or phone)
  const findUser = (query) => {
    const q = String(query || '').trim().toLowerCase();
    const cleanQPhone = normalizePhone(q);

    // 1. Search in adminUsers array
    let found = adminUsers.find(u => {
      const uName = String(u.username || '').toLowerCase();
      const uPhone = normalizePhone(u.phone);
      return uName === q || (cleanQPhone && uPhone === cleanQPhone);
    });

    // 2. Fallback to Super Admin from config if not matched yet
    if (!found && (q === 'yeakub007' || q === 'admin' || cleanQPhone === normalizePhone(config.phone))) {
      found = adminUsers.find(u => u.isSuperAdmin || u.username === 'yeakub007') || {
        id: 'usr_super_yeakub',
        name: 'Yeakub Ahmed',
        username: 'yeakub007',
        phone: config.phone || '01774 961757',
        role: 'সুপার অ্যাডমিন (মালিক)',
        isSuperAdmin: true,
        avatar: 'Y'
      };
    }

    setMatchedUser(found || null);
    if (found && found.phone) {
      setCustomPhone(found.phone);
    } else if (found) {
      setCustomPhone(config.phone || '01774 961757');
    }
  };

  const handleIdentChange = (val) => {
    setIdentInput(val);
    findUser(val);
  };

  // Generate and send 6-digit OTP
  const handleSendOtp = () => {
    if (!matchedUser) {
      showToast?.('অনুগ্রহ করে সঠিক ইউজারনেম বা মোবাইল নম্বর দিন!', 'error');
      return;
    }

    const targetPhone = customPhone || matchedUser.phone || config.phone || '01774 961757';
    if (!targetPhone || targetPhone.length < 11) {
      showToast?.('অনুগ্রহ করে সঠিক মোবাইল নম্বর দিন!', 'error');
      return;
    }

    // Generate random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp('');
    setOtpError('');
    setResendCooldown(60);
    setShowSmsBanner(true);
    playOtpChime();

    showToast?.(`📱 ফোনে ওটিপি কোড পাঠানো হয়েছে: ${code}`, 'success');

    // Move to step 2
    setStep('otp');
    setTimeout(() => {
      otpInputRef.current?.focus();
    }, 200);
  };

  // Auto-fill OTP helper
  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setEnteredOtp(generatedOtp);
      setOtpError('');
    }
  };

  // Copy OTP helper
  const handleCopyOtp = () => {
    if (generatedOtp) {
      navigator.clipboard?.writeText(generatedOtp);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Verify OTP
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setOtpError('');

    const cleanInputOtp = enteredOtp.trim();
    if (!cleanInputOtp) {
      setOtpError('৬-সংখ্যার OTP কোডটি লিখুন!');
      return;
    }

    if (cleanInputOtp !== generatedOtp) {
      setOtpError('ভুল OTP কোড! অনুগ্রহ করে সঠিক কোড দিন অথবা পুনরায় পাঠান।');
      return;
    }

    // Success! Move to step 3
    showToast?.('ওটিপি সফলভাবে যাচাই করা হয়েছে!', 'success');
    setStep('new_password');
  };

  // Save new password
  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPasswordError('');

    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword.trim();

    if (!cleanPass || cleanPass.length < 3) {
      setPasswordError('পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে!');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setPasswordError('পাসওয়ার্ড দুটি মেলেনি! অনুগ্রহ করে আবার পরীক্ষা করুন।');
      return;
    }

    setIsSubmitting(true);
    // Smooth animation delay
    await new Promise(r => setTimeout(r, 500));

    const res = resetAdminPassword(matchedUser.id || matchedUser.username, cleanPass);

    if (res && res.success) {
      setIsSuccess(true);
      showToast?.('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');

      // Call parent callback
      onSuccess?.(matchedUser, cleanPass);

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(false);
        onClose();
      }, 900);
    } else {
      setIsSubmitting(false);
      setPasswordError(res?.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে!');
    }
  };

  if (!isOpen) return null;

  const currentPhoneDisplay = customPhone || matchedUser?.phone || config.phone || '01774 961757';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 1. Modal Top Banner */}
        <div className="bg-gradient-to-r from-[#123184] via-[#0b1b44] to-[#02975E] p-4 sm:p-5 text-white shrink-0 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shrink-0 shadow-inner">
              <KeyRound className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                <span>পাসওয়ার্ড ভুলে গেছেন? (Forgot Password)</span>
              </h3>
              <p className="text-xs text-blue-100/90 font-medium">
                ফোন ওটিপি (OTP) ভেরিফিকেশনের মাধ্যমে পাসওয়ার্ড রিসেট করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-[11px] font-bold">
          <div className={`flex items-center gap-1.5 ${step === 'ident' ? 'text-[#123184] font-black' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'ident' ? 'bg-[#123184] text-white' : 'bg-slate-200 text-slate-600'}`}>১</span>
            <span>ইউজার ও ফোন</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 'otp' ? 'text-[#02975E] font-black' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'otp' ? 'bg-[#02975E] text-white' : 'bg-slate-200 text-slate-600'}`}>২</span>
            <span>OTP কোড যাচাই</span>
          </div>
          <div className="w-6 h-0.5 bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 'new_password' ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'new_password' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>৩</span>
            <span>নতুন পাসওয়ার্ড</span>
          </div>
        </div>

        {/* Interactive Simulated SMS Banner (Visible when OTP is generated) */}
        {showSmsBanner && generatedOtp && (
          <div className="mx-4 sm:mx-6 mt-4 p-3.5 bg-emerald-50 border-2 border-emerald-400/80 rounded-2xl shadow-sm space-y-2 animate-in slide-in-from-top-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold text-emerald-900 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                <span>[ইনকামিং সিকিউরিটি SMS] • বেলী ফার্মেসি</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                এখনই এসেছে
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-700">
                <span className="block text-[10px] text-slate-500 font-medium">পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড:</span>
                <span className="font-mono text-base font-black text-[#123184] tracking-widest">{generatedOtp}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">(মেয়াদ ৫ মিনিট)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 bg-[#02975E] hover:bg-[#028352] text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                  title="কোডটি ফর্মে অটো-বসিয়ে দিন"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>অটো-ফিল</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyOtp}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors border border-slate-200 flex items-center gap-1"
                  title="ক্লিপবোর্ডে কপি করুন"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'কপি!' : 'কপি'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">

          {/* ================= STEP 1: IDENTIFY USER & PHONE ================= */}
          {step === 'ident' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">
                  ইউজারনেম (Username) অথবা মোবাইল নম্বর লিখুন *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="যেমন: yeakub007 অথবা 01774961757"
                    value={identInput}
                    onChange={(e) => handleIdentChange(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123184] focus:ring-4 focus:ring-[#123184]/10 text-sm font-semibold outline-none transition-all shadow-2xs text-slate-900"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  সুপার অ্যাডমিন বা যে কোনো অনুমোদিত স্টাফের ইউজার আইডি
                </span>
              </div>

              {/* Matched Profile Found Card */}
              {matchedUser ? (
                <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#123184] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#02975E]" />
                      <span>প্রোফাইল শনাক্ত হয়েছে:</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      ভেরিফায়েড আইডি
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                      {matchedUser.avatar || matchedUser.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm truncate">{matchedUser.name}</span>
                        {matchedUser.isSuperAdmin && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-amber-300">
                            সুপার অ্যাডমিন
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>@{matchedUser.username}</span>
                        <span className="text-slate-400">•</span>
                        <span>{matchedUser.role || 'স্টাফ'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone confirmation */}
                  <div className="pt-2 border-t border-blue-200/80">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ওটিপি (OTP) পাঠানোর ফোন নম্বর:
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-[#02975E] absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="01774 961757"
                        className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-blue-200 focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/20 text-xs font-bold text-slate-900 outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      এই নম্বরে ওটিপি কোড যাবে। প্রয়োজনে পরিবর্তন করতে পারেন।
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>কোনো ইউজার ম্যাচ করেনি। সঠিক ইউজারনেম (যেমন: <strong className="font-mono">yeakub007</strong>) লিখুন।</span>
                </div>
              )}

              {/* Quick Preset Buttons for Testing */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                  দ্রুত সিলেক্ট করুন:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleIdentChange('yeakub007')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-[#123184] border border-blue-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                  >
                    👑 সুপার অ্যাডমিন (@yeakub007)
                  </button>
                  {adminUsers.filter(u => !u.isSuperAdmin).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleIdentChange(u.username)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                    >
                      @{u.username} ({u.role || 'স্টাফ'})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: ENTER OTP ================= */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              
              <div className="text-center py-2 space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#02975E] flex items-center justify-center mx-auto shadow-inner">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-sm sm:text-base">
                  ওটিপি (OTP) কোড লিখুন
                </h4>
                <p className="text-xs text-slate-500">
                  <strong className="text-slate-800">{currentPhoneDisplay}</strong> নম্বরে ৬-সংখ্যার ভেরিফিকেশন কোড পাঠানো হয়েছে।
                </p>
              </div>

              {/* OTP Error */}
              {otpError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Large Centered OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-center text-xs font-bold text-slate-600">
                  ৬-সংখ্যার ওটিপি কোড
                </label>
                <div className="max-w-[240px] mx-auto">
                  <input
                    ref={otpInputRef}
                    type="text"
                    maxLength={6}
                    required
                    placeholder="______"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full text-center text-2xl font-mono font-black tracking-widest py-3 px-4 bg-slate-50 border-2 border-slate-300 focus:border-[#02975E] focus:bg-white focus:ring-4 focus:ring-[#02975E]/15 rounded-2xl outline-none transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Resend Cooldown / Button */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <button
                  type="button"
                  onClick={() => setStep('ident')}
                  className="text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>নম্বর পরিবর্তন</span>
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-slate-400" />
                    পুনরায় পাঠানো যাবে ({resendCooldown}s)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#02975E] hover:underline font-extrabold flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>পুনরায় OTP পাঠান</span>
                  </button>
                )}
              </div>

            </form>
          )}

          {/* ================= STEP 3: SET NEW PASSWORD ================= */}
          {step === 'new_password' && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-emerald-900 text-xs block">
                    ওটিপি যাচাইকরণ সফল হয়েছে!
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    এখন এই অ্যাকাউন্টের জন্য নতুন গোপন পাসওয়ার্ড সেট করুন।
                  </span>
                </div>
              </div>

              {/* Username badge - PERMANENT & IMMUTABLE */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">
                    লগইন ইউজার আইডি (স্থায়ী)
                  </span>
                  <span className="font-mono font-black text-sm text-[#123184]">
                    @{matchedUser?.username}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-700" />
                  <span>ইউজারনেম অপরিবর্তনযোগ্য</span>
                </span>
              </div>

              {/* Password Error */}
              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Input 1: New Password */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  নতুন পাসওয়ার্ড লিখুন *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#123184] absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="নতুন পাসওয়ার্ড (যেমন: 1234 বা শক্তিশালী পাসওয়ার্ড)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 text-sm font-mono font-semibold outline-none transition-all shadow-2xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Input 2: Confirm Password */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  নতুন পাসওয়ার্ড পুনরায় লিখুন (নিশ্চিতকরণ) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#02975E] absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm font-mono font-semibold outline-none transition-all shadow-2xs text-slate-900 ${
                      confirmPassword && newPassword === confirmPassword 
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                        : 'border-slate-300 focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {confirmPassword && (
                  <div className="mt-1 text-[11px] font-bold">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        পাসওয়ার্ড মিলেছে!
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        পাসওয়ার্ড মেলেনি!
                      </span>
                    )}
                  </div>
                )}
              </div>

            </form>
          )}

        </div>

        {/* 3. Modal Footer Actions */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shadow-inner">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200/60 cursor-pointer transition-colors disabled:opacity-50 text-xs"
          >
            বাতিল করুন
          </button>

          {step === 'ident' && (
            <button
              type="button"
              disabled={!matchedUser}
              onClick={handleSendOtp}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0d2463] hover:to-[#028352] text-white font-extrabold shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smartphone className="w-4 h-4" />
              <span>ফোনে ওটিপি (OTP) পাঠান</span>
            </button>
          )}

          {step === 'otp' && (
            <button
              type="button"
              onClick={handleVerifyOtp}
              className="px-6 py-2.5 rounded-xl bg-[#02975E] hover:bg-[#028352] text-white font-extrabold shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center gap-2 text-xs"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>ওটিপি যাচাই সম্পন্ন করুন</span>
            </button>
          )}

          {step === 'new_password' && (
            <button
              type="button"
              disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
              onClick={handleSaveNewPassword}
              className={`min-w-[190px] px-6 py-2.5 rounded-xl text-white font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${
                isSuccess
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : isSubmitting
                    ? 'bg-[#123184]/80 cursor-wait'
                    : 'bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0d2463] hover:to-[#028352] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>সংরক্ষণ করা হচ্ছে...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>সফলভাবে সম্পন্ন!</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>নতুন পাসওয়ার্ড সেভ করুন</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
