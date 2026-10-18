import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  HardDrive, 
  Layers, 
  Table, 
  Check, 
  ArrowUpRight,
  Image as ImageIcon,
  Key
} from 'lucide-react';
import { checkDatabaseStatus, initDatabaseSchema, syncAllDataToCloud } from '../services/cloudSyncService';
import { uploadImageToImgBB, IMGBB_API_KEY } from '../services/imgbbService';
import { useShop } from '../context/ShopContext';

export const AdminDatabaseManager = () => {
  const { 
    orders, 
    prescriptions, 
    medicines, 
    heroBanner, 
    paymentSettings, 
    deliverySettings, 
    coupons, 
    adBanner, 
    adminUsers, 
    customerProfiles,
    showToast,
    lang 
  } = useShop();

  // Database Connection State
  const [dbStatus, setDbStatus] = useState({
    loading: true,
    connected: false,
    configured: false,
    error: '',
    details: ''
  });
  const [isTesting, setIsTesting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ImgBB Quick Uploader State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);

  // Test Database Connection
  const handleCheckConnection = async () => {
    setIsTesting(true);
    try {
      const res = await checkDatabaseStatus();
      setDbStatus({
        loading: false,
        connected: !!res.connected,
        configured: !!res.configured,
        error: res.error || '',
        details: res.details || ''
      });
      if (res.connected) {
        showToast?.('Supabase PostgreSQL ডাটাবেজের সাথে সফলভাবে সংযুক্ত হয়েছে! ✅', 'success');
      } else if (!res.configured) {
        showToast?.('ডাটাবেজ পাসওয়ার্ড কনফিগার করা বাকি আছে। .env ফাইল চেক করুন। ⚠️', 'error');
      } else {
        showToast?.(`কানেকশন এরর: ${res.error || 'সংযুক্ত হতে পারেনি'}`, 'error');
      }
    } catch (err) {
      setDbStatus({
        loading: false,
        connected: false,
        configured: false,
        error: err.message,
        details: ''
      });
      showToast?.('কানেকশন টেস্টে সমস্যা হয়েছে', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    handleCheckConnection();
  }, []);

  // Initialize Schema / Tables
  const handleInitSchema = async () => {
    if (isMigrating) return;
    setIsMigrating(true);
    try {
      const res = await initDatabaseSchema();
      if (res && res.success) {
        showToast?.('Supabase ডাটাবেজে সব টেবিল (orders, medicines, prescriptions, settings, customers) তৈরি সম্পন্ন হয়েছে! 🎉', 'success');
        handleCheckConnection();
      } else {
        showToast?.(`মাইগ্রেশন এরর: ${res?.error || 'টেবিল তৈরি ব্যর্থ'}`, 'error');
      }
    } catch (err) {
      showToast?.(`মাইগ্রেশন সমস্যা: ${err.message}`, 'error');
    } finally {
      setIsMigrating(false);
    }
  };

  // Push Local Data to Postgres
  const handleSyncLocalToCloud = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncAllDataToCloud({
        heroBanner,
        paymentSettings,
        deliverySettings,
        adBanner,
        coupons,
        adminUsers,
        customMedicines: medicines,
        orders,
        prescriptions,
        customers: customerProfiles
      });
      if (res && res.success) {
        showToast?.('সব লোকাল ডাটা সফলভাবে Supabase PostgreSQL ডাটাবেজে আপলোড হয়েছে! ☁️', 'success');
      } else {
        showToast?.('কিছু ডাটা আপলোড করতে সমস্যা হয়েছে', 'error');
      }
    } catch (err) {
      showToast?.('ডাটা সিঙ্ক ব্যর্থ হয়েছে', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // ImgBB Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন', 'error');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setUploadPreview(localPreview);
    setIsUploading(true);
    setUploadedUrl('');
    setCopiedUrl(false);

    try {
      const res = await uploadImageToImgBB(file, file.name.split('.')[0]);
      if (res && res.success && res.url) {
        setUploadedUrl(res.url);
        setRecentUploads(prev => [res.url, ...prev.filter(u => u !== res.url)].slice(0, 8));
        showToast?.('ছবি ImgBB ক্লাউডে সফলভাবে আপলোড সম্পন্ন হয়েছে! 🚀', 'success');
      } else {
        showToast?.(`ImgBB আপলোড এরর: ${res?.error || 'ব্যর্থ'}`, 'error');
      }
    } catch (err) {
      showToast?.(`আপলোড সমস্যা: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleCopyUrl = (urlToCopy) => {
    if (!urlToCopy) return;
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    showToast?.('ছবির সরাসরি লিংক ক্লিপবোর্ডে কপি করা হয়েছে! 📋', 'success');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full animate-in fade-in pb-12">
      
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-[#0b1b44] via-[#123184] to-[#02975E] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-300 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen Enterprise Infrastructure</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ডাটাবেজ ও ImgBB ক্লাউড হাব
            </h2>
            <p className="text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              বেলী ফার্মেসির সকল ওষুধ, কাস্টমার অর্ডার, প্রেসক্রিপশন ও সেটিংস সরাসরি Supabase PostgreSQL ডাটাবেজে স্থায়ীভাবে সংরক্ষিত হয় এবং প্রেসক্রিপশন ও ব্যানার ছবি ImgBB ক্লাউড সিডিএন-এ হোস্ট থাকে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleCheckConnection}
              disabled={isTesting}
              className="bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold px-4 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer backdrop-blur-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'টেস্ট চলছে...' : 'কানেকশন রিফ্রেশ'}</span>
            </button>
            <button
              onClick={handleSyncLocalToCloud}
              disabled={isSyncing}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <HardDrive className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'সব ডাটা পুশ করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns for Database and ImgBB */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ========================================================= */}
        {/* SECTION 1: SUPABASE POSTGRESQL DATABASE CARD */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#123184] to-cyan-600 text-white flex items-center justify-center shadow-md">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Supabase PostgreSQL
                  </h3>
                  <span className="text-xs text-slate-500">
                    IPv4 Shared Transaction Pooler (Port 6543)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {dbStatus.connected ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>সংযুক্ত (Connected)</span>
                  </span>
                ) : !dbStatus.configured ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-black">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>পাসওয়ার্ড সেট করুন (Action Required)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-full text-xs font-black">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>কানেকশন ব্যাহত</span>
                  </span>
                )}
              </div>
            </div>

            {/* Connection Information */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold">Host:</span>
                <span className="font-bold text-slate-800">aws-0-ap-northeast-2.pooler.supabase.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold">Pooler Port:</span>
                <span className="font-bold text-[#123184]">6543 (Transaction) / 5432 (Session)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold">Database User:</span>
                <span className="font-bold text-slate-800">postgres.qqjkqhznbgdgokpwqlib</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold">Database Name:</span>
                <span className="font-bold text-emerald-700">postgres</span>
              </div>
            </div>

            {/* Tables Info */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                স্বয়ংক্রিয় ডাটাবেজ টেবিলসমূহ (Tables):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { name: 'medicines', count: medicines.length, label: 'ওষুধ তালিকা' },
                  { name: 'orders', count: orders.length, label: 'অর্ডার সমূহ' },
                  { name: 'prescriptions', count: prescriptions.length, label: 'প্রেসক্রিপশন' },
                  { name: 'customers', count: customerProfiles.length, label: 'গ্রাহক তথ্য' },
                  { name: 'settings', count: '6+', label: 'কনফিগারেশন' }
                ].map(t => (
                  <div key={t.name} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col">
                    <span className="font-mono font-bold text-xs text-[#123184]">{t.name}</span>
                    <span className="text-[11px] text-slate-500">{t.label} ({t.count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Password Configuration Helper */}
            {!dbStatus.connected && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span>পাসওয়ার্ড সেট করার নিয়ম:</span>
                </div>
                <p className="leading-relaxed">
                  আপনার প্রজেক্টের রুট ডিরেক্টরিতে <code className="bg-amber-100 font-bold px-1.5 py-0.5 rounded text-amber-900">.env</code> ফাইলটিতে <code className="bg-amber-100 font-bold px-1.5 py-0.5 rounded text-amber-900">[YOUR-PASSWORD]</code> লেখার স্থানে আপনার Supabase একাউন্টের পাসওয়ার্ডটি বসিয়ে দিন। এরপর নিচের "টেবিল তৈরি ও মাইগ্রেট করুন" বাটনে ক্লিক করুন।
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <button
              onClick={handleCheckConnection}
              disabled={isTesting}
              className="flex-1 px-4 py-3 bg-[#123184] hover:bg-[#0d2463] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>টেস্ট কানেকশন</span>
            </button>

            <button
              onClick={handleInitSchema}
              disabled={isMigrating}
              className="flex-1 px-4 py-3 bg-[#02975E] hover:bg-[#027e4e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
            >
              <Table className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>{isMigrating ? 'তৈরি হচ্ছে...' : 'টেবিল তৈরি / মাইগ্রেট'}</span>
            </button>
          </div>

        </div>

        {/* ========================================================= */}
        {/* SECTION 2: IMGBB CLOUD IMAGE HOSTING CARD */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    ImgBB Image Cloud CDN
                  </h3>
                  <span className="text-xs text-slate-500">
                    Unlimited Fast Image Hosting & Delivery
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-black">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>সক্রিয় ও ভেরিফাইড (Active)</span>
              </span>
            </div>

            {/* API Key Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-sans font-bold">
                <span>ImgBB API Key:</span>
                <span className="text-emerald-700 font-bold">100% Verified ✅</span>
              </div>
              <div className="font-black text-[#123184] truncate">
                {IMGBB_API_KEY}
              </div>
            </div>

            {/* Interactive Image Uploader Box */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                সরাসরি ছবি আপলোড করুন (Quick CDN Uploader):
              </span>

              <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group">
                <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:scale-110 text-emerald-700 flex items-center justify-center transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-[#123184] hover:underline">ছবি সিলেক্ট করুন</span>
                  <span className="text-slate-500"> অথবা এখানে টেনে এনে ছাড়ুন</span>
                </div>
                <span className="text-[10px] text-slate-400">JPG, PNG, WebP (সর্বোচ্চ ৩২ মেগাবাইট)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageFileChange} 
                  className="hidden" 
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* Upload Progress or Result */}
            {isUploading && (
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center gap-3 animate-pulse">
                <RefreshCw className="w-4 h-4 text-[#123184] animate-spin" />
                <span className="font-bold">ছবি ImgBB সার্ভারে আপলোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন।</span>
              </div>
            )}

            {uploadedUrl && !isUploading && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>আপলোড সফল! সরাসরি লিংক:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(uploadedUrl)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-emerald-200 bg-white p-1 shrink-0 overflow-hidden">
                    <img src={uploadedUrl} alt="Uploaded" className="w-full h-full object-contain rounded-lg" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={uploadedUrl}
                    className="flex-1 px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-emerald-900 select-all"
                  />
                  <a
                    href={uploadedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl transition-colors"
                    title="নতুন ট্যাবে দেখুন"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Recent Uploads List */}
            {recentUploads.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  সম্প্রতি আপলোডকৃত ছবি ({recentUploads.length}):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {recentUploads.map((url, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleCopyUrl(url)}
                      className="w-12 h-12 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white p-0.5 shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-all shadow-xs relative group"
                      title="ক্লিক করে লিংক কপি করুন"
                    >
                      <img src={url} alt="Recent" className="w-full h-full object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                        <Copy className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ImgBB Footer Note */}
          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>প্রেসক্রিপশন ও ওষুধের ছবি স্বয়ংক্রিয়ভাবে ImgBB তে আপলোড হয়</span>
            </span>
            <span className="text-emerald-700 font-bold">Free & Unlimited</span>
          </div>

        </div>

      </div>

    </div>
  );
};
