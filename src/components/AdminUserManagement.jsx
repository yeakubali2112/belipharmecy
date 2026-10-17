import React, { useState } from 'react';
import { 
  User,
  Users, 
  UserPlus, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Copy, 
  Sparkles, 
  BarChart3, 
  ShoppingCart, 
  PackagePlus, 
  Package, 
  FileText, 
  Pill, 
  Tag, 
  Settings, 
  X, 
  Plus, 
  Power,
  Phone,
  Shield,
  Loader2
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

// Definition of all 10 modules/options in the Admin Portal
export const ADMIN_MODULES = [
  { 
    id: 'overview', 
    nameBn: 'সামগ্রিক পরিসংখ্যান', 
    nameEn: 'Overview & Analytics',
    desc: 'বিক্রয় চার্ট, লাভ-ক্ষতি, মোট ইনকাম ও ব্যবসায়িক পরিসংখ্যান', 
    icon: BarChart3, 
    color: 'text-blue-600 bg-blue-50 border-blue-200' 
  },
  { 
    id: 'sell', 
    nameBn: 'সেল (Sell / POS)', 
    nameEn: 'POS Counter Sale',
    desc: 'কাউন্টার সরাসরি বিক্রয়, ওষুধের বারকোড/নাম সার্চ ও ইনভয়েস রশিদ প্রিন্ট', 
    icon: ShoppingCart, 
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200' 
  },
  { 
    id: 'restock', 
    nameBn: 'স্টক ইন ও রিস্টক', 
    nameEn: 'Stock In & Restock',
    desc: 'নতুন ওষুধের চালান এন্ট্রি, স্টক বৃদ্ধি ও ইনভয়েস হিস্ট্রি', 
    icon: PackagePlus, 
    color: 'text-teal-600 bg-teal-50 border-teal-200' 
  },
  { 
    id: 'orders', 
    nameBn: 'গ্রাহকের অর্ডার', 
    nameEn: 'Customer Orders',
    desc: 'অনলাইন অর্ডারের তালিকা, স্ট্যাটাস পরিবর্তন (ডেলিভার্ড/ক্যান্সেল) ও ট্র্যাকিং', 
    icon: Package, 
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200' 
  },
  { 
    id: 'prescriptions', 
    nameBn: 'প্রেসক্রিপশন সমূহ', 
    nameEn: 'Prescriptions',
    desc: 'গ্রাহকের আপলোডকৃত প্রেসক্রিপশন ইমেজ দেখা ও ফার্মাসিস্ট রিভিউ', 
    icon: FileText, 
    color: 'text-amber-600 bg-amber-50 border-amber-200' 
  },
  { 
    id: 'customers', 
    nameBn: 'গ্রাহক ম্যানেজমেন্ট', 
    nameEn: 'Customer Management',
    desc: 'নিবন্ধিত গ্রাহক প্রোফাইল, ফোন নম্বর ও ক্রয় হিস্ট্রি পরিচালনা', 
    icon: Users, 
    color: 'text-purple-600 bg-purple-50 border-purple-200' 
  },
  { 
    id: 'medicines', 
    nameBn: 'ওষুধ ক্যাটালগ ও স্টক', 
    nameEn: 'Medicine Catalog',
    desc: 'ওষুধের তথ্য, বিক্রয় মূল্য, ডিসকাউন্ট ও বর্তমান স্টক পরিচালনা ও এডিট', 
    icon: Pill, 
    color: 'text-rose-600 bg-rose-50 border-rose-200' 
  },
  { 
    id: 'coupons', 
    nameBn: 'ডেলিভারি চার্জ ও কুপন', 
    nameEn: 'Delivery & Coupons',
    desc: 'হোম ডেলিভারি ফি, ফ্রি ডেলিভারি শর্ত ও ডিসকাউন্ট কুপন কোড নির্ধারণ', 
    icon: Tag, 
    color: 'text-orange-600 bg-orange-50 border-orange-200' 
  },
  { 
    id: 'ads', 
    nameBn: 'ব্যানার ও অফার বিজ্ঞাপন', 
    nameEn: 'Banners & Offers',
    desc: 'ওয়েবসাইটের হিরো ব্যানার স্লাইডার ও অফার পপআপ নোটিশ নিয়ন্ত্রণ', 
    icon: Sparkles, 
    color: 'text-cyan-600 bg-cyan-50 border-cyan-200' 
  },
  { 
    id: 'settings', 
    nameBn: 'ফার্মেসি সেটিংস ও প্রোফাইল', 
    nameEn: 'Pharmacy Settings',
    desc: 'ফার্মেসির নাম, ড্রাগ লাইসেন্স, পেমেন্ট নম্বর ও ইউজার পারমিশন কন্ট্রোল', 
    icon: Settings, 
    color: 'text-slate-600 bg-slate-50 border-slate-200' 
  }
];

// Quick Role Presets for convenient permission assigning
const ROLE_PRESETS = [
  {
    role: 'cashier',
    name: 'ক্যাশিয়ার (POS Sales)',
    permissions: ['sell', 'medicines', 'customers'],
    desc: 'শুধু কাউন্টার সেল, ওষুধ সার্চ ও কাস্টমার ইনফো'
  },
  {
    role: 'pharmacist',
    name: 'ফার্মাসিস্ট (Pharmacist)',
    permissions: ['sell', 'restock', 'prescriptions', 'medicines'],
    desc: 'সেলস, স্টক ইন, প্রেসক্রিপশন ও ওষুধ পরিচালনা'
  },
  {
    role: 'inventory',
    name: 'স্টক ও ইনভেন্টরি কিপার',
    permissions: ['restock', 'medicines'],
    desc: 'নতুন ওষুধের চালান এন্ট্রি ও স্টক ব্যবস্থাপনা'
  },
  {
    role: 'order_manager',
    name: 'অর্ডার ও ডেলিভারি স্টাফ',
    permissions: ['orders', 'prescriptions', 'customers'],
    desc: 'অনলাইন অর্ডার প্রসেসিং ও ডেলিভারি স্ট্যাটাস'
  },
  {
    role: 'full_admin',
    name: 'ম্যানেজার / অল-অ্যাক্সেস',
    permissions: ['overview', 'sell', 'restock', 'orders', 'prescriptions', 'customers', 'medicines', 'coupons', 'ads', 'settings'],
    desc: 'সব ১০টি অপশনের পূর্ণ অ্যাক্সেস'
  }
];

export const AdminUserManagement = () => {
  const { 
    adminUsers = [], 
    currentAdminUser, 
    addAdminUser, 
    updateAdminUser, 
    deleteAdminUser, 
    toggleAdminUserStatus,
    switchAdminUser,
    showToast 
  } = useShop();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'ক্যাশিয়ার (POS Sales)',
    phone: '',
    status: 'active',
    permissions: ['sell', 'medicines']
  });
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Open modal for new user
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'ক্যাশিয়ার (POS Sales)',
      phone: '',
      status: 'active',
      permissions: ['sell', 'medicines']
    });
    setFormError('');
    setShowFormPassword(false);
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      username: user.username || '',
      password: user.password || '',
      role: user.role || 'ফার্মেসি স্টাফ',
      phone: user.phone || '',
      status: user.status || 'active',
      permissions: Array.isArray(user.permissions) ? [...user.permissions] : ['sell', 'medicines']
    });
    setFormError('');
    setShowFormPassword(false);
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  // Toggle specific permission in form
  const togglePermission = (modId) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(modId);
      const updated = exists 
        ? prev.permissions.filter(p => p !== modId)
        : [...prev.permissions, modId];
      return { ...prev, permissions: updated };
    });
  };

  // Apply a role preset
  const applyPreset = (preset) => {
    setFormData(prev => ({
      ...prev,
      role: preset.name,
      permissions: [...preset.permissions]
    }));
  };

  // Select all permissions
  const selectAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: ADMIN_MODULES.map(m => m.id)
    }));
  };

  // Clear all permissions
  const clearAllPermissions = () => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
  };

  // Toggle password visibility in table
  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  // Copy credentials to clipboard
  const copyCredentials = (user) => {
    const text = `বেলী ফার্মেসি অ্যাডমিন পোর্টাল লগইন:\nওয়েবসাইট: ${window.location.origin}#admin\nইউজারনেম: ${user.username}\nপাসওয়ার্ড: ${user.password}\nপদবি: ${user.role || 'স্টাফ'}`;
    navigator.clipboard?.writeText(text);
    showToast?.('লগইন তথ্য ক্লিপবোর্ডে কপি করা হয়েছে!', 'success');
  };

  // Submit form with loading and success feedback
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setFormError('');

    const cleanUsername = String(formData.username || '').trim().toLowerCase();
    const cleanPass = String(formData.password || '').trim();

    if (!cleanUsername) {
      setFormError('অনুগ্রহ করে ইউজারনেম লিখুন!');
      return;
    }
    if (!cleanPass || cleanPass.length < 3) {
      setFormError('পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে!');
      return;
    }
    if (formData.permissions.length === 0) {
      setFormError('কমপক্ষে ১টি অপশনের অনুমতি সিলেক্ট করতে হবে!');
      return;
    }

    setIsSubmitting(true);
    // Smooth loading animation delay
    await new Promise(r => setTimeout(r, 450));

    if (editingUser) {
      // Update
      const res = updateAdminUser(editingUser.id, {
        name: formData.name.trim(),
        username: cleanUsername,
        password: cleanPass,
        role: formData.role.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        permissions: formData.permissions
      });
      if (res && res.success !== false) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitSuccess(false);
          setIsModalOpen(false);
        }, 700);
      } else {
        setIsSubmitting(false);
        if (res?.error) setFormError(res.error);
      }
    } else {
      // Create
      const res = addAdminUser({
        name: formData.name.trim() || cleanUsername,
        username: cleanUsername,
        password: cleanPass,
        role: formData.role.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
        permissions: formData.permissions
      });
      if (res && res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitSuccess(false);
          setIsModalOpen(false);
        }, 700);
      } else {
        setIsSubmitting(false);
        if (res?.error) setFormError(res.error);
      }
    }
  };

  const totalUsers = adminUsers.length;
  const activeUsers = adminUsers.filter(u => u.status !== 'inactive').length;
  const isSuper = currentAdminUser?.isSuperAdmin;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#123184] via-[#0d47a1] to-[#02975E] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              <span>রোল বেসড এক্সেস কন্ট্রোল (RBAC)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              ব্যবহারকারী ও স্টাফ প্রোফাইল পারমিশন ম্যানেজমেন্ট
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              আপনার ফার্মেসির সেলসম্যান, ক্যাশিয়ার, ফার্মাসিস্টদের আলাদা প্রোফাইল তৈরি করুন এবং কে কোন অপশন দেখতে ও ব্যবহার করতে পারবে তা নির্ধারণ করুন।
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold px-5 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 shrink-0 text-sm"
          >
            <UserPlus className="w-5 h-5" />
            <span>নতুন ইউজার তৈরি করুন</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/20 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-blue-200 block text-[11px] font-semibold">মোট ব্যবহারকারী</span>
            <span className="text-xl font-black text-white">{totalUsers} জন</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-emerald-200 block text-[11px] font-semibold">সক্রিয় অ্যাকাউন্ট</span>
            <span className="text-xl font-black text-emerald-300">{activeUsers} জন</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-rose-200 block text-[11px] font-semibold">নিষ্ক্রিয় অ্যাকাউন্ট</span>
            <span className="text-xl font-black text-rose-300">{totalUsers - activeUsers} জন</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
            <span className="text-amber-200 block text-[11px] font-semibold">মোট কন্ট্রোল অপশন</span>
            <span className="text-xl font-black text-amber-300">{ADMIN_MODULES.length} টি</span>
          </div>
        </div>
      </div>

      {/* Users List Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#123184]/10 text-[#123184] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                নিবন্ধিত ইউজার ও পারমিশন তালিকা ({adminUsers.length})
              </h3>
              <p className="text-xs text-slate-500">
                সকল স্টাফ ও অ্যাডমিন প্রোফাইলের লগইন ও অপশন এক্সেস
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">লগইন ঠিকানা:</span>
            <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-[#123184] font-bold">
              /#admin
            </code>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">ব্যবহারকারী / প্রোফাইল</th>
                <th className="py-3.5 px-4">পদবি ও রোল</th>
                <th className="py-3.5 px-4">লগইন ক্রেডেনশিয়াল</th>
                <th className="py-3.5 px-4">অনুমোদিত অপশন / মডিউল</th>
                <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsers.map((user) => {
                const isUserSuper = !!user.isSuperAdmin;
                const isCurrentlyActiveUser = currentAdminUser?.id === user.id || currentAdminUser?.username === user.username;
                const isPasswordVisible = !!visiblePasswords[user.id];
                const userPerms = Array.isArray(user.permissions) ? user.permissions : [];

                return (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCurrentlyActiveUser ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    {/* User Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-xs ${
                          isUserSuper 
                            ? 'bg-gradient-to-tr from-amber-500 to-amber-600' 
                            : 'bg-gradient-to-tr from-[#123184] to-[#02975E]'
                        }`}>
                          {user.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {user.name}
                            </span>
                            {isUserSuper && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-amber-300">
                                👑 সুপার অ্যাডমিন
                              </span>
                            )}
                            {isCurrentlyActiveUser && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded-full border border-emerald-300">
                                আপনি (Logged in)
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono block">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className="inline-block bg-blue-50 text-[#123184] border border-blue-200 px-2.5 py-0.5 rounded-md font-bold text-xs">
                          {user.role || (isUserSuper ? 'মালিক / Super Admin' : 'স্টাফ')}
                        </span>
                        {user.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Credentials with Eye toggle & Copy */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">User:</span>
                          <code className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {user.username}
                          </code>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 font-medium">Pass:</span>
                          <code className="font-mono font-bold text-[#02975E] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {isPasswordVisible ? user.password : '••••••'}
                          </code>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors cursor-pointer"
                            title={isPasswordVisible ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyCredentials(user)}
                            className="text-slate-400 hover:text-[#123184] p-0.5 transition-colors cursor-pointer"
                            title="লগইন তথ্য কপি করুন"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Allowed Options Chips */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {isUserSuper ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>সব ১০টি অপশনের পূর্ণ অ্যাক্সেস</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {userPerms.slice(0, 3).map((permId) => {
                              const mod = ADMIN_MODULES.find(m => m.id === permId);
                              if (!mod) return null;
                              return (
                                <span 
                                  key={permId} 
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200"
                                >
                                  {mod.nameBn}
                                </span>
                              );
                            })}
                            {userPerms.length > 3 && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                                +{userPerms.length - 3} আরও
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            মোট {userPerms.length} টি অপশন সক্রিয়
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      {isUserSuper ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          স্থায়ী সক্রিয়
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleAdminUserStatus(user.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all border ${
                            user.status !== 'inactive'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                          title="ক্লিক করে সক্রিয়/নিষ্ক্রিয় করুন"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status !== 'inactive' ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                          }`} />
                          <span>{user.status !== 'inactive' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</span>
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Quick View / Test Switch Button */}
                        {!isCurrentlyActiveUser && (
                          <button
                            type="button"
                            onClick={() => switchAdminUser?.(user.id)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#123184] border border-blue-200 transition-colors cursor-pointer"
                            title="এই স্টাফ প্রোফাইল প্রিভিউ করুন (টেস্ট দেখুন)"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                          title="তথ্য ও পারমিশন সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        {!isUserSuper && (
                          deleteConfirmId === user.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAdminUser(user.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                              >
                                নিশ্চিত
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] hover:bg-slate-300 cursor-pointer"
                              >
                                না
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(user.id)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
                              title="ইউজার ডিলিট করুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD / EDIT USER MODAL (Clean Fixed Header & Footer Layout) */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-70 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Modal Header (Fixed, shrink-0) */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-r from-[#123184] via-[#0d2d7c] to-[#02975E] text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  {editingUser ? <Edit3 className="w-5 h-5 text-emerald-300" /> : <UserPlus className="w-5 h-5 text-emerald-300" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    {editingUser ? 'ইউজার প্রোফাইল ও পারমিশন সম্পাদনা' : 'নতুন ইউজার প্রোফাইল তৈরি'}
                  </h3>
                  <p className="text-xs text-blue-100">
                    স্টাফের লগইন তথ্য এবং কোন কোন অপশন ব্যবহার করতে পারবে তা নির্ধারণ করুন
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Scrollable Modal Form Content (Flex-1, with bottom spacing) */}
            <form 
              id="user-profile-form" 
              onSubmit={handleFormSubmit} 
              className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-xs overscroll-contain"
            >
              
              {/* Error Alert */}
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 font-semibold animate-in shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Basic Profile & Credentials Card */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
                <h4 className="font-extrabold text-sm text-[#123184] flex items-center gap-2 border-b border-slate-200/80 pb-2">
                  <span className="w-6 h-6 rounded-lg bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <span>১. সাধারণ প্রোফাইল ও লগইন বিবরণ</span>
                </h4>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {/* Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      স্টাফ / ইউজারের পূর্ণ নাম *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ রাসেল হাসান"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-semibold transition-all shadow-2xs"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      লগইন ইউজারনেম (Admin ID) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono font-bold">@</span>
                      <input
                        type="text"
                        required
                        placeholder="rasel_pos"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-mono font-semibold transition-all shadow-2xs"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">শুধু ছোট হাতের ইংরেজি বর্ণ ও সংখ্যা</span>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      লগইন পাসওয়ার্ড *
                    </label>
                    <div className="relative">
                      <input
                        type={showFormPassword ? 'text' : 'password'}
                        required
                        placeholder="পাসওয়ার্ড লিখুন (যেমন: 123456)"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-mono font-semibold transition-all shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFormPassword(!showFormPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 transition-colors"
                        title={showFormPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
                      >
                        {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Role / Designation */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      পদবি / দায়িত্ব (Role)
                    </label>
                    <input
                      type="text"
                      placeholder="ক্যাশিয়ার, ফার্মাসিস্ট, সেলস এক্সিকিউটিভ"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-medium transition-all shadow-2xs"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      মোবাইল নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-medium transition-all shadow-2xs"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      অ্যাকাউন্ট স্ট্যাটাস
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-4 focus:ring-[#02975E]/10 outline-none text-slate-900 font-semibold cursor-pointer transition-all shadow-2xs"
                    >
                      <option value="active">🟢 সক্রিয় (Active - লগইন করতে পারবে)</option>
                      <option value="inactive">🔴 নিষ্ক্রিয় (Inactive - সাময়িক স্থগিত)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Permissions & Option Control Card */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3.5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <h4 className="font-extrabold text-sm text-[#123184] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <span>২. অপশন পারমিশন কন্ট্রোল (কোন কোন অপশন ব্যবহার করতে পারবে)</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPermissions}
                      className="text-[11px] font-bold text-[#123184] hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#123184]"
                    >
                      সব সিলেক্ট করুন
                    </button>
                    <button
                      type="button"
                      onClick={clearAllPermissions}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-300"
                    >
                      সব মুছুন
                    </button>
                  </div>
                </div>

                {/* Role Presets Pills */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                  <span className="text-[11px] font-extrabold text-slate-600 block mb-2">
                    ⚡ এক ক্লিকে রোল প্রিসেট দিন:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLE_PRESETS.map((preset) => (
                      <button
                        key={preset.role}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                        title={preset.desc}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modules Grid */}
                <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                  {ADMIN_MODULES.map((mod) => {
                    const isChecked = formData.permissions.includes(mod.id);
                    const IconComponent = mod.icon;

                    return (
                      <div
                        key={mod.id}
                        onClick={() => togglePermission(mod.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked 
                            ? 'bg-emerald-50/80 border-emerald-400 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors border ${
                          isChecked 
                            ? 'bg-[#02975E] text-white border-[#02975E]' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-emerald-700' : 'text-slate-500'}`} />
                            <span className={`font-black text-xs ${isChecked ? 'text-emerald-900' : 'text-slate-800'}`}>
                              {mod.nameBn}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                            {mod.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Permission Summary Preview Card */}
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#123184] text-[11px] flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#123184]" />
                      <span>এই স্টাফের সাইডবারে যা যা দৃশ্যমান হবে:</span>
                    </span>
                    <span className="text-[11px] font-black text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                      মোট {formData.permissions.length} টি অপশন অনুমোদিত
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {formData.permissions.length === 0 ? (
                      <span className="text-rose-600 font-bold text-[11px] py-1">
                        ⚠️ কোনো অপশন সিলেক্ট করা নেই! লগইন করলে সাইডবারে কোনো মেনু দেখতে পাবে না।
                      </span>
                    ) : (
                      formData.permissions.map(permId => {
                        const m = ADMIN_MODULES.find(mod => mod.id === permId);
                        return (
                          <span 
                            key={permId} 
                            className="bg-white text-slate-800 border border-blue-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xs flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-[#02975E] stroke-[3]" />
                            <span>{m?.nameBn || permId}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

            </form>

            {/* 3. Modal Footer (Fixed at bottom, completely outside scroll container!) */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs flex items-center justify-between gap-3 z-10 shadow-sm">
              <div className="text-[11px] font-bold text-slate-500 hidden sm:flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${formData.permissions.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{formData.permissions.length} টি অপশন পারমিশন দেওয়া হয়েছে</span>
              </div>

              <div className="flex items-center justify-end gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200/60 cursor-pointer transition-colors disabled:opacity-50 text-xs"
                >
                  বাতিল করুন
                </button>

                <button
                  type="submit"
                  form="user-profile-form"
                  disabled={isSubmitting}
                  className={`min-w-[170px] px-6 py-2.5 rounded-xl text-white font-extrabold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs ${
                    submitSuccess 
                      ? 'bg-emerald-600 shadow-emerald-600/30 ring-4 ring-emerald-500/20' 
                      : isSubmitting 
                        ? 'bg-[#123184]/80 cursor-wait' 
                        : 'bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0d2463] hover:to-[#028352] hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>সংরক্ষণ করা হচ্ছে...</span>
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>সফলভাবে সম্পন্ন!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{editingUser ? 'পরিবর্তন সেভ করুন' : 'ইউজার তৈরি সম্পন্ন করুন'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
