import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { INITIAL_MEDICINES, PHARMACY_CONFIG } from '../data/medicines';
import { 
  fetchCloudOrders, 
  saveCloudOrder, 
  fetchCloudPrescriptions, 
  saveCloudPrescription, 
  fetchCloudSettings, 
  saveCloudSettings,
  fetchCloudCustomers,
  saveCloudCustomer,
  deleteCloudCustomer,
  fetchCloudMedicines,
  saveCloudMedicine
} from '../services/firebaseService';
import { subscribeLiveSync, publishLiveSync, fetchRecentSyncEvents } from '../services/liveSyncService';
import { fetchMedexSearchResults } from '../utils/medicineSearch';

const ShopContext = createContext();

// Safe localStorage helper to protect against QuotaExceededError and quota overflows
const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`localStorage quota exceeded for "${key}":`, err);
    try {
      if (key === 'beli_prescriptions') {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Keep newest items and strip large image strings from local storage (images persist in Firebase cloud)
          const trimmed = parsed.slice(0, 10).map(p => ({
            ...p,
            image: (p.image && p.image.length > 250000) ? null : p.image
          }));
          localStorage.setItem(key, JSON.stringify(trimmed));
        }
      } else if (key === 'beli_medicines') {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Keep only admin-created or admin-edited medicines to conserve localStorage quota
          const initialMap = new Map(INITIAL_MEDICINES.map(m => [m.id, m]));
          const delta = parsed.filter(m => {
            const init = initialMap.get(m.id);
            if (!init) return true;
            return m.pricePerStrip !== init.pricePerStrip || m.stock !== init.stock || m.discountPercent !== init.discountPercent || m.image !== init.image || m.name !== init.name;
          });
          localStorage.setItem(key, JSON.stringify(delta));
        }
      }
    } catch (e2) {
      // Ignore fallback errors
    }
    return false;
  }
};

export const ShopProvider = ({ children }) => {
  // Delivery Settings (Saved in localStorage so admin updates persist)
  const DEFAULT_DELIVERY = {
    deliveryFee: PHARMACY_CONFIG.deliveryFee || 40,
    freeDeliveryThreshold: PHARMACY_CONFIG.freeDeliveryThreshold || 500,
    expressDeliveryFee: PHARMACY_CONFIG.expressDeliveryFee || 80,
  };

  const [deliverySettings, setDeliverySettings] = useState(() => {
    const saved = localStorage.getItem('beli_delivery_settings');
    if (!saved) return DEFAULT_DELIVERY;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_DELIVERY, ...parsed };
    } catch {
      return DEFAULT_DELIVERY;
    }
  });

  // Ad Banner / Offer Popup Settings (Synced with LocalStorage and Firebase Cloud)
  const DEFAULT_AD_BANNER = {
    isActive: true,
    title: 'বেলী ফার্মেসির বিশেষ অফার!',
    subtitle: 'ঘরে বসেই আসল ওষুধ অর্ডার করুন দ্রুততম ডেলিভারিতে। বিশেষ কুপন কোড ব্যবহারে আকর্ষণীয় ছাড় লুফে নিন!',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80',
    badgeText: '🔥 বিশেষ অফার (Limited Offer)',
    buttonText: 'অর্ডার করতে ক্লিক করুন',
    buttonAction: 'catalog', // 'catalog', 'prescription'
    couponCode: 'BELI10',
    updatedAt: new Date().toISOString()
  };

  const [adBanner, setAdBanner] = useState(() => {
    const saved = localStorage.getItem('beli_ad_banner');
    if (!saved) return DEFAULT_AD_BANNER;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_AD_BANNER, ...parsed };
    } catch {
      return DEFAULT_AD_BANNER;
    }
  });

  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  // Hero Banner / Main Page Background Photo Settings (Synced with LocalStorage and Firebase Cloud)
  const DEFAULT_HERO_BANNER = {
    imageUrl: '', // if empty, uses brand gradient
    showText: true,
    showOverlay: true,
    titleLine1: 'প্রয়োজনে দ্রুত আসল ওষুধ',
    titleLine2: 'পৌঁছে যাবে আপনার দোরগোড়ায়',
    subtitle: 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।',
    updatedAt: new Date().toISOString()
  };

  const [heroBanner, setHeroBanner] = useState(() => {
    const saved = localStorage.getItem('beli_hero_banner');
    if (!saved) return DEFAULT_HERO_BANNER;
    try {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_HERO_BANNER, ...parsed };
    } catch {
      return DEFAULT_HERO_BANNER;
    }
  });

  const updateHeroBanner = (newBannerData) => {
    const updated = {
      ...heroBanner,
      ...newBannerData,
      updatedAt: new Date().toISOString()
    };
    setHeroBanner(updated);
    safeSetItem('beli_hero_banner', JSON.stringify(updated));
    saveCloudSettings({ deliverySettings, coupons, adBanner, heroBanner: updated });
    publishLiveSync({ type: 'HERO_BANNER_UPDATED', heroBanner: updated });
    showToast(lang === 'bn' ? 'হিরো ব্যানার সফলভাবে আপডেট ও সেভ হয়েছে!' : 'Hero banner updated successfully!', 'success');
  };

  const updateAdBanner = (newAdData) => {
    const updated = {
      ...adBanner,
      ...newAdData,
      updatedAt: new Date().toISOString()
    };
    setAdBanner(updated);
    safeSetItem('beli_ad_banner', JSON.stringify(updated));
    saveCloudSettings({ deliverySettings, coupons, adBanner: updated, heroBanner });
    showToast(lang === 'bn' ? 'অফার বিজ্ঞাপন সফলভাবে আপডেট ও সেভ হয়েছে!' : 'Ad banner updated successfully!', 'success');
  };

  const updateDeliverySettings = (newSettings) => {
    const updated = {
      deliveryFee: Number(newSettings.deliveryFee ?? deliverySettings.deliveryFee),
      freeDeliveryThreshold: Number(newSettings.freeDeliveryThreshold ?? deliverySettings.freeDeliveryThreshold),
      expressDeliveryFee: Number(newSettings.expressDeliveryFee ?? deliverySettings.expressDeliveryFee),
    };
    setDeliverySettings(updated);
    safeSetItem('beli_delivery_settings', JSON.stringify(updated));
    saveCloudSettings({ deliverySettings: updated, coupons, adBanner, heroBanner });
    showToast(lang === 'bn' ? 'ডেলিভারি চার্জ সেটিংস সফলভাবে আপডেট হয়েছে!' : 'Delivery settings updated successfully!', 'success');
  };

  // Dynamic config merging default config with admin delivery settings
  const config = {
    ...PHARMACY_CONFIG,
    deliveryFee: Number(deliverySettings.deliveryFee),
    freeDeliveryThreshold: Number(deliverySettings.freeDeliveryThreshold),
    expressDeliveryFee: Number(deliverySettings.expressDeliveryFee),
  };

  // Medicines (saved in localStorage so admin edits persist, merged with full INITIAL_MEDICINES catalog)
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('beli_medicines');
    if (!saved) return INITIAL_MEDICINES;
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_MEDICINES;
      
      // Map of saved admin edits by ID
      const savedMap = new Map(parsed.map(m => [m.id, m]));
      // Merge: For each item in INITIAL_MEDICINES, merge catalog defaults (including nameBn, genericBn, keywords) with admin edits (price, stock, etc.)
      const merged = INITIAL_MEDICINES.map(m => {
        const savedItem = savedMap.get(m.id);
        if (!savedItem) return m;
        return {
          ...m,
          ...savedItem,
          nameBn: savedItem.nameBn || m.nameBn,
          genericBn: savedItem.genericBn || m.genericBn,
          keywords: Array.from(new Set([...(m.keywords || []), ...(savedItem.keywords || [])]))
        };
      });
      
      // Also keep any custom medicines manually created by the admin in the portal
      const initialIds = new Set(INITIAL_MEDICINES.map(m => m.id));
      const customAdded = parsed.filter(m => !initialIds.has(m.id));
      
      return [...merged, ...customAdded];
    } catch {
      return INITIAL_MEDICINES;
    }
  });

  // Cart
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('beli_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Orders
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('beli_orders');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(o => o.customerPhone !== '01711223344') : [];
    } catch {
      return [];
    }
  });

  // Prescriptions uploaded
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('beli_prescriptions');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Stock In / Restock History Logs
  const [restockLogs, setRestockLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('beli_restock_logs');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Language: 'bn' or 'en'
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('beli_lang') || 'bn';
  });

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState(false);
  const [isHealthToolsModalOpen, setIsHealthToolsModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  // Customer Profile & Session (Default: null - no user logged in initially)
  const [currentCustomer, setCurrentCustomer] = useState(() => {
    const saved = localStorage.getItem('beli_current_customer');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Clean up previous demo user if it exists
      if (parsed.phone === '01711223344' || parsed.name === 'তানভীর আহমেদ') {
        localStorage.removeItem('beli_current_customer');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [customerProfiles, setCustomerProfiles] = useState(() => {
    const saved = localStorage.getItem('beli_customer_profiles');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) 
        ? parsed.filter(p => p.phone !== '01711223344' && p.name !== 'তানভীর আহমেদ') 
        : [];
    } catch {
      return [];
    }
  });
  
  // Page View Routing: 'store' or 'admin'
  const [currentView, setCurrentView] = useState(() => {
    return (window.location.hash === '#admin' || window.location.search.includes('admin')) ? 'admin' : 'store';
  });

  // Listen to hash changes in window
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (!window.location.hash) {
        setCurrentView('store');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view) => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = 'admin';
    } else {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
    }
  };

  // Admin authentication (yeakub007 / 1234)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('beli_admin_auth') === 'true';
  });

  const adminLogin = (username, password) => {
    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (
      cleanUser.toLowerCase() === String(PHARMACY_CONFIG.adminUsername).toLowerCase() && 
      cleanPass === String(PHARMACY_CONFIG.adminPassword)
    ) {
      setIsAdminAuthenticated(true);
      localStorage.setItem('beli_admin_auth', 'true');
      showToast(lang === 'bn' ? 'অ্যাডমিন লগইন সফল হয়েছে!' : 'Admin logged in successfully!', 'success');
      return { success: true };
    } else {
      showToast(lang === 'bn' ? 'ভুল ইউজারনেম বা পাসওয়ার্ড!' : 'Invalid username or password!', 'error');
      return { success: false, error: 'ভুল ব্যবহারকারী নাম অথবা পাসওয়ার্ড!' };
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('beli_admin_auth');
    showToast(lang === 'bn' ? 'অ্যাডমিন থেকে লগআউট করা হয়েছে' : 'Logged out from Admin', 'info');
  };

  // Customer Profile functions
  const loginCustomer = (phone, name = '', address = '', avatar = null) => {
    const cleanPhone = String(phone || '').trim();
    if (!cleanPhone) return false;

    // Check if profile exists
    const existing = customerProfiles.find(p => p.phone === cleanPhone);
    let profile;
    if (existing) {
      profile = { ...existing };
      if (name && !existing.name) profile.name = name;
      if (address && !existing.address) profile.address = address;
      if (avatar) profile.avatar = avatar;
    } else {
      profile = {
        name: name.trim() || 'বেলী গ্রাহক',
        phone: cleanPhone,
        address: address.trim() || '',
        avatar: avatar || null,
        createdAt: new Date().toLocaleDateString('bn-BD')
      };
      setCustomerProfiles(prev => {
        const next = [profile, ...prev.filter(p => p.phone !== cleanPhone)];
        safeSetItem('beli_customer_profiles', JSON.stringify(next));
        return next;
      });
    }

    setCurrentCustomer(profile);
    safeSetItem('beli_current_customer', JSON.stringify(profile));
    saveCloudCustomer(profile);
    showToast(lang === 'bn' ? `স্বাগতম, ${profile.name}!` : `Welcome, ${profile.name}!`, 'success');
    return true;
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('beli_current_customer');
    showToast(lang === 'bn' ? 'প্রোফাইল থেকে লগআউট করা হয়েছে' : 'Logged out from profile', 'info');
  };

  const updateCustomerProfile = (updatedData) => {
    if (!currentCustomer) return;
    const merged = { ...currentCustomer, ...updatedData };
    setCurrentCustomer(merged);
    safeSetItem('beli_current_customer', JSON.stringify(merged));
    
    setCustomerProfiles(prev => {
      const filtered = prev.filter(p => p.phone !== currentCustomer.phone);
      const next = [merged, ...filtered];
      safeSetItem('beli_customer_profiles', JSON.stringify(next));
      return next;
    });

    saveCloudCustomer(merged);

    if (updatedData.avatar) {
      setOrders(prev => {
        const nextOrders = prev.map(o => o.customerPhone === merged.phone ? { ...o, customerAvatar: updatedData.avatar } : o);
        safeSetItem('beli_orders', JSON.stringify(nextOrders));
        return nextOrders;
      });
    }

    showToast(lang === 'bn' ? 'প্রোফাইল তথ্য আপডেট হয়েছে' : 'Profile updated', 'success');
  };

  // Admin Customer Management CRUD
  const adminUpdateCustomer = (oldPhone, updatedData) => {
    const cleanOldPhone = String(oldPhone || '').trim();
    const newPhone = String(updatedData.phone || cleanOldPhone).trim();

    if (!newPhone) {
      showToast(lang === 'bn' ? 'মোবাইল নম্বর খালি রাখা যাবে না' : 'Phone cannot be empty', 'error');
      return false;
    }

    setCustomerProfiles(prev => {
      const existing = prev.find(p => p.phone === cleanOldPhone) || {};
      const updated = {
        ...existing,
        ...updatedData,
        phone: newPhone,
        updatedAt: new Date().toLocaleDateString('bn-BD')
      };
      const filtered = prev.filter(p => p.phone !== cleanOldPhone && p.phone !== newPhone);
      const next = [updated, ...filtered];
      safeSetItem('beli_customer_profiles', JSON.stringify(next));

      // Cloud Firestore Sync
      saveCloudCustomer(updated);
      if (cleanOldPhone && newPhone !== cleanOldPhone) {
        deleteCloudCustomer(cleanOldPhone);
      }
      return next;
    });

    // Update active user session if it matches this customer
    if (currentCustomer && (currentCustomer.phone === cleanOldPhone || currentCustomer.phone === newPhone)) {
      const mergedCurrent = {
        ...currentCustomer,
        ...updatedData,
        phone: newPhone
      };
      setCurrentCustomer(mergedCurrent);
      safeSetItem('beli_current_customer', JSON.stringify(mergedCurrent));
    }

    // Update orders customer fields
    setOrders(prev => {
      let changed = false;
      const nextOrders = prev.map(o => {
        if (o.customerPhone === cleanOldPhone || (cleanOldPhone && o.customerPhone && o.customerPhone.includes(cleanOldPhone))) {
          changed = true;
          const updatedOrder = {
            ...o,
            customerName: updatedData.name || o.customerName,
            customerPhone: newPhone,
            deliveryAddress: updatedData.address !== undefined ? updatedData.address : o.deliveryAddress,
            customerAvatar: updatedData.avatar !== undefined ? updatedData.avatar : o.customerAvatar
          };
          saveCloudOrder(updatedOrder);
          return updatedOrder;
        }
        return o;
      });
      if (changed) {
        safeSetItem('beli_orders', JSON.stringify(nextOrders));
      }
      return nextOrders;
    });

    // Update prescriptions customer fields
    setPrescriptions(prev => {
      let changed = false;
      const nextPresc = prev.map(p => {
        if (p.customerPhone === cleanOldPhone || (cleanOldPhone && p.customerPhone && p.customerPhone.includes(cleanOldPhone))) {
          changed = true;
          const updatedP = {
            ...p,
            customerName: updatedData.name || p.customerName,
            customerPhone: newPhone,
            deliveryAddress: updatedData.address !== undefined ? updatedData.address : p.deliveryAddress,
            customerAvatar: updatedData.avatar !== undefined ? updatedData.avatar : p.customerAvatar
          };
          saveCloudPrescription(updatedP);
          return updatedP;
        }
        return p;
      });
      if (changed) {
        safeSetItem('beli_prescriptions', JSON.stringify(nextPresc));
      }
      return nextPresc;
    });

    showToast(lang === 'bn' ? 'গ্রাহকের তথ্য সফলভাবে আপডেট হয়েছে' : 'Customer updated successfully', 'success');
    return true;
  };

  const adminAddCustomer = (customerData) => {
    const phone = String(customerData.phone || '').trim();
    if (!phone) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে গ্রাহকের মোবাইল নম্বর লিখুন' : 'Please provide customer phone number', 'error');
      return false;
    }

    const newCustomer = {
      name: customerData.name?.trim() || 'নতুন গ্রাহক',
      phone,
      address: customerData.address?.trim() || '',
      avatar: customerData.avatar || null,
      createdAt: new Date().toLocaleDateString('bn-BD'),
      updatedAt: new Date().toLocaleDateString('bn-BD')
    };

    setCustomerProfiles(prev => {
      const next = [newCustomer, ...prev.filter(p => p.phone !== phone)];
      safeSetItem('beli_customer_profiles', JSON.stringify(next));
      saveCloudCustomer(newCustomer);
      return next;
    });

    showToast(lang === 'bn' ? 'নতুন গ্রাহক প্রোফাইল সফলভাবে তৈরি হয়েছে' : 'New customer profile created', 'success');
    return true;
  };

  const adminDeleteCustomer = (phone) => {
    const cleanPhone = String(phone || '').trim();
    if (!cleanPhone) return;

    setCustomerProfiles(prev => {
      const next = prev.filter(p => p.phone !== cleanPhone);
      safeSetItem('beli_customer_profiles', JSON.stringify(next));
      deleteCloudCustomer(cleanPhone);
      return next;
    });

    if (currentCustomer && currentCustomer.phone === cleanPhone) {
      setCurrentCustomer(null);
      localStorage.removeItem('beli_current_customer');
    }

    showToast(lang === 'bn' ? 'গ্রাহকের প্রোফাইল মুছে ফেলা হয়েছে' : 'Customer profile deleted', 'info');
  };

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medexLiveResults, setMedexLiveResults] = useState([]);
  const [isMedexLoading, setIsMedexLoading] = useState(false);

  // Live MedEx Search synchronization
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setMedexLiveResults([]);
      setIsMedexLoading(false);
      return;
    }

    setIsMedexLoading(true);
    const timer = setTimeout(async () => {
      try {
        const liveItems = await fetchMedexSearchResults(q);
        setMedexLiveResults(liveItems);
      } catch (err) {
        console.warn('MedEx search error:', err);
        setMedexLiveResults([]);
      } finally {
        setIsMedexLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Coupon Management (Saved in localStorage so admin updates persist)
  const INITIAL_COUPONS = [
    {
      id: 'cp_1',
      code: 'BELI10',
      description: '১০% বিশেষ ছাড়',
      type: 'percent', // 'percent' or 'flat'
      value: 10,
      minOrder: 0,
      maxDiscount: 500,
      isActive: true,
    },
    {
      id: 'cp_2',
      code: 'HEALTH50',
      description: '৳৫০ ফ্ল্যাট ক্যাশব্যাক ছাড়',
      type: 'flat',
      value: 50,
      minOrder: 300,
      maxDiscount: 50,
      isActive: true,
    }
  ];

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('beli_coupons');
    if (!saved) return INITIAL_COUPONS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  });

  useEffect(() => {
    safeSetItem('beli_coupons', JSON.stringify(coupons));
  }, [coupons]);

  const addCoupon = (couponData) => {
    const cleanCode = String(couponData.code || '').trim().toUpperCase();
    if (!cleanCode) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে কুপন কোড প্রদান করুন!' : 'Please enter a coupon code!', 'error');
      return { success: false, error: 'কুপন কোড প্রদান করুন' };
    }
    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      showToast(lang === 'bn' ? 'এই কুপন কোডটি ইতিমধ্যে বিদ্যমান!' : 'Coupon code already exists!', 'error');
      return { success: false, error: 'কুপন কোড ইতিমধ্যে বিদ্যমান' };
    }
    const newCp = {
      id: `cp_${Date.now()}`,
      code: cleanCode,
      description: couponData.description || '',
      type: couponData.type || 'percent',
      value: Number(couponData.value) || 0,
      minOrder: Number(couponData.minOrder) || 0,
      maxDiscount: Number(couponData.maxDiscount) || 0,
      isActive: couponData.isActive !== false,
    };
    setCoupons(prev => [newCp, ...prev]);
    showToast(lang === 'bn' ? `কুপন '${cleanCode}' সফলভাবে তৈরি হয়েছে!` : `Coupon '${cleanCode}' created!`, 'success');
    return { success: true };
  };

  const updateCoupon = (id, updatedData) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updatedData,
          code: updatedData.code ? String(updatedData.code).trim().toUpperCase() : c.code,
          value: updatedData.value !== undefined ? Number(updatedData.value) : c.value,
          minOrder: updatedData.minOrder !== undefined ? Number(updatedData.minOrder) : c.minOrder,
          maxDiscount: updatedData.maxDiscount !== undefined ? Number(updatedData.maxDiscount) : c.maxDiscount,
        };
      }
      return c;
    }));
    showToast(lang === 'bn' ? 'কুপন কোড আপডেট করা হয়েছে!' : 'Coupon updated!', 'success');
  };

  const deleteCoupon = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast(lang === 'bn' ? 'কুপনটি মুছে ফেলা হয়েছে' : 'Coupon deleted', 'info');
  };

  const toggleCouponStatus = (id) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.isActive;
        showToast(
          lang === 'bn' 
            ? `কুপন ${c.code} ${nextState ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে` 
            : `Coupon ${c.code} ${nextState ? 'activated' : 'deactivated'}`,
          'info'
        );
        return { ...c, isActive: nextState };
      }
      return c;
    }));
  };

  // Applied Coupon state in current session
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Order Notification in Bottom-Right
  const [orderNotification, setOrderNotification] = useState(null);
  const notificationTimeoutRef = useRef(null);
  const knownOrderIdsRef = useRef(new Set());

  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // AudioContext may require user interaction on some browsers
    }
  };

  const triggerOrderNotification = (order) => {
    if (!order) return;
    playNotificationSound();
    setOrderNotification({
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount || order.total || order.subtotal || 0,
      itemsCount: order.items?.length || 0,
      order: order,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })
    });
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => {
      setOrderNotification(null);
    }, 9000);
  };

  // Pre-seed known order ids
  useEffect(() => {
    if (orders && orders.length > 0 && knownOrderIdsRef.current.size === 0) {
      orders.forEach(o => o && o.id && knownOrderIdsRef.current.add(o.id));
    }
  }, [orders]);

  // Sync state to local storage
  useEffect(() => {
    safeSetItem('beli_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    safeSetItem('beli_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeSetItem('beli_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeSetItem('beli_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    safeSetItem('beli_lang', lang);
  }, [lang]);

  useEffect(() => {
    safeSetItem('beli_restock_logs', JSON.stringify(restockLogs));
  }, [restockLogs]);

  // Cart operations
  const addToCart = (medicine, unitType = 'strip', quantity = 1) => {
    // Check live stock
    const currentMed = medicines.find(m => m.id === medicine.id) || medicine;
    const stockCount = typeof currentMed.stock === 'number' ? currentMed.stock : 100;
    if (stockCount <= 0) {
      showToast(lang === 'bn' ? 'দুঃখিত, এই ওষুধটি বর্তমানে স্টকে নেই!' : 'Sorry, this medicine is out of stock!', 'error');
      return;
    }

    const stripSize = Number(currentMed.stripSize || medicine.stripSize) || 10;
    const maxAllowedQty = unitType === 'strip' ? Math.max(1, Math.floor(stockCount / stripSize)) : stockCount;

    const price = unitType === 'strip' 
      ? (medicine.pricePerStrip * (1 - (medicine.discountPercent || 0) / 100))
      : (medicine.pricePerUnit * (1 - (medicine.discountPercent || 0) / 100));

    const itemKey = `${medicine.id}_${unitType}`;

    setCart(prev => {
      const existing = prev.find(item => item.key === itemKey);
      if (existing) {
        const nextQty = existing.quantity + quantity;
        if (nextQty > maxAllowedQty) {
          showToast(
            lang === 'bn' 
              ? `স্টকে সর্বোচ্চ ${maxAllowedQty} টি পাওয়া যাবে!` 
              : `Only ${maxAllowedQty} available in stock!`, 
            'error'
          );
          return prev.map(item => item.key === itemKey ? { ...item, quantity: maxAllowedQty } : item);
        }
        return prev.map(item => 
          item.key === itemKey 
            ? { ...item, quantity: nextQty }
            : item
        );
      }

      const safeQty = Math.min(quantity, maxAllowedQty);
      return [...prev, {
        key: itemKey,
        id: medicine.id,
        medicineId: medicine.id,
        stripSize: stripSize,
        name: medicine.name,
        generic: medicine.generic,
        image: medicine.image,
        unitType,
        unitLabel: unitType === 'strip' ? (lang === 'bn' ? `পাতা (${stripSize}টি)` : `Strip (${stripSize} pcs)`) : (lang === 'bn' ? 'পিস' : 'Pcs'),
        unitPrice: price,
        rawPrice: unitType === 'strip' ? medicine.pricePerStrip : medicine.pricePerUnit,
        discountPercent: medicine.discountPercent || 0,
        quantity: safeQty
      }];
    });

    showToast(
      lang === 'bn' 
        ? `${medicine.name} কার্টে যোগ করা হয়েছে` 
        : `${medicine.name} added to cart`,
      'success'
    );
  };

  const updateCartQuantity = (key, newQuantity) => {
    if (newQuantity === '') {
      setCart(prev => prev.map(item => item.key === key ? { ...item, quantity: '' } : item));
      return;
    }
    const num = Number(newQuantity);
    if (num <= 0) {
      removeFromCart(key);
      return;
    }

    const targetItem = cart.find(it => it.key === key);
    if (targetItem) {
      const currentMed = medicines.find(m => m.id === (targetItem.medicineId || targetItem.id));
      if (currentMed) {
        const stockCount = typeof currentMed.stock === 'number' ? currentMed.stock : 100;
        const stripSize = Number(targetItem.stripSize || currentMed.stripSize) || 10;
        const maxQty = targetItem.unitType === 'strip' ? Math.max(1, Math.floor(stockCount / stripSize)) : stockCount;
        if (num > maxQty) {
          showToast(
            lang === 'bn' 
              ? `স্টকে সর্বোচ্চ ${maxQty} টি পাওয়া যাবে!` 
              : `Only ${maxQty} available in stock!`, 
            'error'
          );
          setCart(prev => prev.map(item => item.key === key ? { ...item, quantity: maxQty } : item));
          return;
        }
      }
    }

    setCart(prev => prev.map(item => item.key === key ? { ...item, quantity: num } : item));
  };

  const removeFromCart = (key) => {
    setCart(prev => prev.filter(item => item.key !== key));
    showToast(lang === 'bn' ? 'আইটেম সরানো হয়েছে' : 'Item removed', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountAmount(0);
  };

  // Cart totals calculation
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * (Number(item.quantity) || 0)), 0);
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.rawPrice * (Number(item.quantity) || 0)), 0);
  const totalItemSavings = Math.max(0, rawSubtotal - cartSubtotal);

  const applyCoupon = (code) => {
    const cleanCode = String(code || '').trim().toUpperCase();
    if (!cleanCode) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে একটি কুপন কোড লিখুন' : 'Please enter a coupon code', 'error');
      return false;
    }

    const found = coupons.find(c => c.code.toUpperCase() === cleanCode);
    if (!found) {
      showToast(lang === 'bn' ? 'ভুল কুপন কোড! অনুগ্রহ করে সঠিক কোড দিন।' : 'Invalid promo code!', 'error');
      return false;
    }

    if (!found.isActive) {
      showToast(lang === 'bn' ? 'এই কুপন কোডটি বর্তমানে নিষ্ক্রিয় রয়েছে!' : 'This promo code is currently inactive!', 'error');
      return false;
    }

    if (found.minOrder > 0 && cartSubtotal < found.minOrder) {
      showToast(
        lang === 'bn'
          ? `এই কুপন ব্যবহার করতে ন্যূনতম ৳${found.minOrder} টাকার অর্ডার আবশ্যক!`
          : `Minimum order of ৳${found.minOrder} required for this coupon!`,
        'error'
      );
      return false;
    }

    let discount = 0;
    if (found.type === 'percent') {
      discount = Math.round(cartSubtotal * (Number(found.value) / 100));
      if (found.maxDiscount && found.maxDiscount > 0) {
        discount = Math.min(discount, Number(found.maxDiscount));
      }
    } else {
      discount = Math.min(Number(found.value), cartSubtotal);
    }

    setDiscountAmount(discount);
    setCouponCode(found.code);
    showToast(
      lang === 'bn' 
        ? `কুপন '${found.code}' সফলভাবে প্রয়োগ করা হয়েছে! (৳${discount} ছাড়)` 
        : `Coupon '${found.code}' applied! (৳${discount} off)`, 
      'success'
    );
    return true;
  };

  // Recalculate discount if cart quantity or items change
  useEffect(() => {
    if (couponCode && discountAmount > 0) {
      const activeCp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase());
      if (activeCp && activeCp.isActive) {
        if (activeCp.minOrder > 0 && cartSubtotal < activeCp.minOrder) {
          setDiscountAmount(0);
          setCouponCode('');
        } else {
          let newDiscount = 0;
          if (activeCp.type === 'percent') {
            newDiscount = Math.round(cartSubtotal * (Number(activeCp.value) / 100));
            if (activeCp.maxDiscount > 0) newDiscount = Math.min(newDiscount, Number(activeCp.maxDiscount));
          } else {
            newDiscount = Math.min(Number(activeCp.value), cartSubtotal);
          }
          setDiscountAmount(newDiscount);
        }
      } else {
        setDiscountAmount(0);
        setCouponCode('');
      }
    }
  }, [cartSubtotal, coupons]);

  // Helper: Deduct sold items from stock (called when order is Delivered or Counter Sale)
  const deductItemsFromStock = (items) => {
    if (!items || !Array.isArray(items)) return;
    setMedicines(prev => {
      const idMap = new Map();
      const nameMap = new Map();

      items.forEach(it => {
        const medId = it.medicineId || it.id;
        const qty = Math.max(1, Number(it.quantity) || 1);
        const isStrip = it.unitType === 'strip' || (it.unitLabel && (it.unitLabel.includes('পাতা') || it.unitLabel.toLowerCase().includes('strip')));
        const stripSize = Number(it.stripSize) || 10;
        const piecesSold = isStrip ? (qty * stripSize) : qty;

        if (medId) idMap.set(medId, (idMap.get(medId) || 0) + piecesSold);
        if (it.name) nameMap.set(it.name.trim().toLowerCase(), (nameMap.get(it.name.trim().toLowerCase()) || 0) + piecesSold);
      });

      const updatedMeds = prev.map(m => {
        let piecesToDeduct = 0;
        if (idMap.has(m.id)) piecesToDeduct = idMap.get(m.id);
        else if (nameMap.has((m.name || '').trim().toLowerCase())) piecesToDeduct = nameMap.get((m.name || '').trim().toLowerCase());

        if (piecesToDeduct > 0) {
          const currentStock = typeof m.stock === 'number' ? m.stock : 100;
          const newStock = Math.max(0, currentStock - piecesToDeduct);
          const updated = {
            ...m,
            stock: newStock,
            lastSoldAt: new Date().toISOString()
          };
          saveCloudMedicine(updated);
          publishLiveSync({ type: 'STOCK_UPDATED', medicineId: m.id, stock: newStock, medicine: updated });
          return updated;
        }
        return m;
      });

      safeSetItem('beli_medicines', JSON.stringify(updatedMeds));
      return updatedMeds;
    });
  };

  // Helper: Restore sold items to stock (called if Delivered order is Cancelled)
  const restoreItemsToStock = (items) => {
    if (!items || !Array.isArray(items)) return;
    setMedicines(prev => {
      const idMap = new Map();
      const nameMap = new Map();

      items.forEach(it => {
        const medId = it.medicineId || it.id;
        const qty = Math.max(1, Number(it.quantity) || 1);
        const isStrip = it.unitType === 'strip' || (it.unitLabel && (it.unitLabel.includes('পাতা') || it.unitLabel.toLowerCase().includes('strip')));
        const stripSize = Number(it.stripSize) || 10;
        const pieces = isStrip ? (qty * stripSize) : qty;

        if (medId) idMap.set(medId, (idMap.get(medId) || 0) + pieces);
        if (it.name) nameMap.set(it.name.trim().toLowerCase(), (nameMap.get(it.name.trim().toLowerCase()) || 0) + pieces);
      });

      const restoredMeds = prev.map(m => {
        let piecesToRestore = 0;
        if (idMap.has(m.id)) piecesToRestore = idMap.get(m.id);
        else if (nameMap.has((m.name || '').trim().toLowerCase())) piecesToRestore = nameMap.get((m.name || '').trim().toLowerCase());

        if (piecesToRestore > 0) {
          const currentStock = typeof m.stock === 'number' ? m.stock : 0;
          const newStock = currentStock + piecesToRestore;
          const updated = {
            ...m,
            stock: newStock,
            lastRestockedAt: new Date().toISOString()
          };
          saveCloudMedicine(updated);
          publishLiveSync({ type: 'STOCK_UPDATED', medicineId: m.id, stock: newStock, medicine: updated });
          return updated;
        }
        return m;
      });

      safeSetItem('beli_medicines', JSON.stringify(restoredMeds));
      return restoredMeds;
    });
  };

  // Handle incoming real-time sync events from any connected device
  const handleIncomingSyncEvent = (event) => {
    if (!event || !event.type) return;

    if (event.type === 'ORDER_CREATED' && event.order) {
      setOrders(prev => {
        if (prev.some(o => o.id === event.order.id)) return prev;
        const next = [event.order, ...prev];
        safeSetItem('beli_orders', JSON.stringify(next));
        return next;
      });
      if (!knownOrderIdsRef.current.has(event.order.id)) {
        knownOrderIdsRef.current.add(event.order.id);
        triggerOrderNotification(event.order);
      }
    } else if (event.type === 'ORDER_STATUS_CHANGED' && event.orderId) {
      setOrders(prev => {
        const next = prev.map(o => o.id === event.orderId ? { 
          ...o, 
          status: event.status, 
          stockDeducted: event.stockDeducted !== undefined ? event.stockDeducted : o.stockDeducted 
        } : o);
        safeSetItem('beli_orders', JSON.stringify(next));
        return next;
      });
    } else if (event.type === 'MEDICINE_UPDATED' && event.medicine) {
      setMedicines(prev => {
        const index = prev.findIndex(m => m.id === event.medicine.id);
        let next;
        if (index >= 0) {
          next = [...prev];
          next[index] = { ...next[index], ...event.medicine };
        } else {
          next = [event.medicine, ...prev];
        }
        safeSetItem('beli_medicines', JSON.stringify(next));
        return next;
      });
    } else if (event.type === 'STOCK_UPDATED' && event.medicineId) {
      setMedicines(prev => {
        const next = prev.map(m => m.id === event.medicineId ? { ...m, stock: event.stock } : m);
        safeSetItem('beli_medicines', JSON.stringify(next));
        return next;
      });
    } else if (event.type === 'PRESCRIPTION_UPLOADED' && event.prescription) {
      setPrescriptions(prev => {
        if (prev.some(p => p.id === event.prescription.id)) return prev;
        const next = [event.prescription, ...prev];
        safeSetItem('beli_prescriptions', JSON.stringify(next));
        return next;
      });
    } else if (event.type === 'HERO_BANNER_UPDATED' && event.heroBanner) {
      setHeroBanner(event.heroBanner);
      safeSetItem('beli_hero_banner', JSON.stringify(event.heroBanner));
    } else if (event.type === 'SETTINGS_UPDATED' && event.settings) {
      if (event.settings.deliverySettings) {
        setDeliverySettings(event.settings.deliverySettings);
        safeSetItem('beli_delivery_settings', JSON.stringify(event.settings.deliverySettings));
      }
      if (event.settings.adBanner) {
        setAdBanner(event.settings.adBanner);
        safeSetItem('beli_ad_banner', JSON.stringify(event.settings.adBanner));
      }
      if (event.settings.heroBanner) {
        setHeroBanner(event.settings.heroBanner);
        safeSetItem('beli_hero_banner', JSON.stringify(event.settings.heroBanner));
      }
    }
  };

  // Real-time Cloud Sync across all devices (Mobile & Desktop) via Server-Sent Events (SSE)
  useEffect(() => {
    let isMounted = true;

    // 1. Initial catch-up from cloud
    fetchRecentSyncEvents().then(events => {
      if (Array.isArray(events) && events.length > 0 && isMounted) {
        events.forEach(handleIncomingSyncEvent);
      }
    });

    const syncCloudDataOnce = async () => {
      try {
        const cloudOrders = await fetchCloudOrders();
        if (cloudOrders && Array.isArray(cloudOrders) && isMounted) {
          if (knownOrderIdsRef.current.size > 0) {
            const freshOrders = cloudOrders.filter(o => o && o.id && !knownOrderIdsRef.current.has(o.id));
            if (freshOrders.length > 0) {
              freshOrders.forEach(o => knownOrderIdsRef.current.add(o.id));
              triggerOrderNotification(freshOrders[0]);
            }
          } else {
            cloudOrders.forEach(o => o && o.id && knownOrderIdsRef.current.add(o.id));
          }

          setOrders(prev => {
            const map = new Map();
            prev.forEach(o => map.set(o.id, o));
            cloudOrders.forEach(o => map.set(o.id, o));
            const merged = Array.from(map.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            safeSetItem('beli_orders', JSON.stringify(merged));
            return merged;
          });
        }

        const cloudMeds = await fetchCloudMedicines();
        if (cloudMeds && Array.isArray(cloudMeds) && isMounted && cloudMeds.length > 0) {
          setMedicines(prev => {
            const cloudMap = new Map(cloudMeds.map(m => [m.id, m]));
            const next = prev.map(m => cloudMap.has(m.id) ? { ...m, ...cloudMap.get(m.id) } : m);
            cloudMeds.forEach(cm => {
              if (!next.some(m => m.id === cm.id)) next.unshift(cm);
            });
            safeSetItem('beli_medicines', JSON.stringify(next));
            return next;
          });
        }

        const cloudPresc = await fetchCloudPrescriptions();
        if (cloudPresc && Array.isArray(cloudPresc) && isMounted) {
          setPrescriptions(prev => {
            const map = new Map();
            prev.forEach(p => map.set(p.id, p));
            cloudPresc.forEach(p => map.set(p.id, p));
            const merged = Array.from(map.values());
            safeSetItem('beli_prescriptions', JSON.stringify(merged));
            return merged;
          });
        }

        const cloudSettings = await fetchCloudSettings();
        if (cloudSettings && isMounted) {
          if (cloudSettings.deliverySettings) {
            setDeliverySettings(cloudSettings.deliverySettings);
            safeSetItem('beli_delivery_settings', JSON.stringify(cloudSettings.deliverySettings));
          }
          if (cloudSettings.adBanner) {
            setAdBanner(cloudSettings.adBanner);
            safeSetItem('beli_ad_banner', JSON.stringify(cloudSettings.adBanner));
          }
          if (cloudSettings.heroBanner) {
            setHeroBanner(cloudSettings.heroBanner);
            safeSetItem('beli_hero_banner', JSON.stringify(cloudSettings.heroBanner));
          }
        }
      } catch (err) {
        // Fallback silently
      }
    };

    syncCloudDataOnce();
    window.addEventListener('focus', syncCloudDataOnce);

    // 2. Connect to real-time stream (instant updates without reload across all devices)
    const unsubscribeSSE = subscribeLiveSync((event) => {
      if (isMounted) {
        handleIncomingSyncEvent(event);
      }
    });

    return () => {
      isMounted = false;
      window.removeEventListener('focus', syncCloudDataOnce);
      unsubscribeSSE();
    };
  }, []);

  // Create Order
  const createOrder = (orderData) => {
    const newId = `BP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingCust = customerProfiles.find(p => p.phone === orderData.customerPhone);
    const resolvedAvatar = orderData.customerAvatar || currentCustomer?.avatar || existingCust?.avatar || null;

    const now = Date.now();
    const isCounter = !!orderData.isCounterSale;

    // For counter sales: completed immediately with status Delivered and stock deducted.
    // For online customer orders: starts as Pending, stock is NOT deducted yet (deducted only when Admin marks Delivered!).
    const newOrder = {
      id: newId,
      createdAt: new Date().toLocaleString('en-GB'),
      timestamp: now,
      ...orderData,
      customerAvatar: resolvedAvatar,
      status: isCounter ? 'Delivered' : (orderData.status || 'Pending'),
      stockDeducted: isCounter // Only immediate counter sales deduct stock upon creation!
    };

    setOrders(prev => {
      const next = [newOrder, ...prev];
      safeSetItem('beli_orders', JSON.stringify(next));
      return next;
    });

    // Save to Firebase Cloud immediately
    saveCloudOrder(newOrder);

    // Broadcast instant real-time event to all devices
    publishLiveSync({ type: 'ORDER_CREATED', order: newOrder });

    // Only clear online cart if not a counter sale
    if (!isCounter) {
      clearCart();
      setIsCheckoutModalOpen(false);
    }

    // Auto-create / update Customer Profile so user can track orders in their profile
    if (orderData.customerPhone && orderData.customerPhone !== 'N/A' && orderData.customerPhone.length >= 6) {
      const profile = {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        address: orderData.deliveryAddress,
        avatar: resolvedAvatar,
        createdAt: currentCustomer?.createdAt || existingCust?.createdAt || new Date().toLocaleDateString('bn-BD'),
        lastOrderDate: new Date().toLocaleDateString('bn-BD')
      };

      if (!isCounter) {
        setCurrentCustomer(profile);
        safeSetItem('beli_current_customer', JSON.stringify(profile));
      }

      setCustomerProfiles(prev => {
        const filtered = prev.filter(p => p.phone !== orderData.customerPhone);
        const next = [profile, ...filtered];
        safeSetItem('beli_customer_profiles', JSON.stringify(next));
        return next;
      });

      saveCloudCustomer(profile);
    }

    // Only deduct stock on creation IF it is an immediate Counter Sale!
    // Online customer orders wait until Admin marks Delivered!
    if (isCounter && orderData.items && Array.isArray(orderData.items)) {
      deductItemsFromStock(orderData.items);
    }

    setActiveInvoiceOrder(newOrder);
    knownOrderIdsRef.current.add(newId);
    triggerOrderNotification(newOrder);
    showToast(
      isCounter
        ? (lang === 'bn' ? `কাউন্টার সেল সফল! চালান নং: ${newId}` : `Sale completed! Invoice ID: ${newId}`)
        : (lang === 'bn' ? `অর্ডার সফল! আপনার প্রোফাইল তৈরি হয়েছে। আইডি: ${newId}` : `Order placed! Your profile has been created. ID: ${newId}`),
      'success'
    );
    return newOrder;
  };

  // Upload Prescription
  const uploadPrescription = (prescData, autoClose = false) => {
    const newId = `RX-${Math.floor(1000 + Math.random() * 9000)}`;
    const existingCust = customerProfiles.find(p => p.phone === prescData.customerPhone);
    const resolvedAvatar = prescData.customerAvatar || currentCustomer?.avatar || existingCust?.avatar || null;

    const now = Date.now();
    const newPrescription = {
      id: newId,
      createdAt: new Date().toLocaleString('en-GB'),
      timestamp: now,
      ...prescData,
      customerAvatar: resolvedAvatar,
      status: 'Pending Review'
    };

    setPrescriptions(prev => {
      const next = [newPrescription, ...prev];
      safeSetItem('beli_prescriptions', JSON.stringify(next));
      return next;
    });

    // Save to Firebase Cloud immediately
    saveCloudPrescription(newPrescription);

    // Broadcast instant real-time event to all devices
    publishLiveSync({ type: 'PRESCRIPTION_UPLOADED', prescription: newPrescription });

    if (autoClose) {
      setIsPrescriptionModalOpen(false);
    }

    if (prescData.customerPhone) {
      if (!existingCust) {
        const newProf = {
          name: prescData.customerName || 'বেলী গ্রাহক',
          phone: prescData.customerPhone,
          address: prescData.deliveryAddress || '',
          avatar: resolvedAvatar,
          createdAt: new Date().toLocaleDateString('bn-BD')
        };
        setCustomerProfiles(prev => {
          const next = [newProf, ...prev];
          safeSetItem('beli_customer_profiles', JSON.stringify(next));
          return next;
        });
        saveCloudCustomer(newProf);
        if (!currentCustomer) {
          setCurrentCustomer(newProf);
          safeSetItem('beli_current_customer', JSON.stringify(newProf));
        }
      }
    }

    showToast(
      lang === 'bn' 
        ? 'প্রেসক্রিপশন আপলোড সফল! আমাদের ফার্মাসিস্ট দ্রুত যোগাযোগ করবেন।' 
        : 'Prescription uploaded! Our pharmacist will contact you shortly.',
      'success'
    );
    return newPrescription;
  };

  // Admin & Customer Order Actions
  const updateOrderStatus = (orderId, newStatus) => {
    let orderToDeduct = null;
    let orderToRestore = null;
    let updatedOrder = null;

    setOrders(prev => {
      const next = prev.map(o => {
        if (o.id === orderId) {
          let stockDeducted = !!o.stockDeducted;

          // If changing to Delivered and stock was NOT yet deducted -> deduct now!
          if (newStatus === 'Delivered' && !stockDeducted) {
            orderToDeduct = o;
            stockDeducted = true;
          }
          // If was Delivered (stock was deducted) and now changing to Cancelled or Pending -> restore stock!
          else if ((newStatus === 'Cancelled' || newStatus === 'Pending') && stockDeducted) {
            orderToRestore = o;
            stockDeducted = false;
          }

          updatedOrder = { ...o, status: newStatus, stockDeducted };
          return updatedOrder;
        }
        return o;
      });

      safeSetItem('beli_orders', JSON.stringify(next));
      if (updatedOrder) {
        saveCloudOrder(updatedOrder);
        publishLiveSync({
          type: 'ORDER_STATUS_CHANGED',
          orderId: updatedOrder.id,
          status: updatedOrder.status,
          stockDeducted: updatedOrder.stockDeducted,
          order: updatedOrder
        });
      }
      return next;
    });

    if (orderToDeduct && orderToDeduct.items && Array.isArray(orderToDeduct.items)) {
      deductItemsFromStock(orderToDeduct.items);
      showToast(
        lang === 'bn' 
          ? `অর্ডার সম্পন্ন হয়েছে এবং ইনভেন্টরি স্টক থেকে ওষুধ কাটা হয়েছে!` 
          : `Order delivered! Stock deducted from inventory.`,
        'success'
      );
    } else if (orderToRestore && orderToRestore.items && Array.isArray(orderToRestore.items)) {
      restoreItemsToStock(orderToRestore.items);
      showToast(
        lang === 'bn' 
          ? `অর্ডার স্ট্যাটাস পরিবর্তনের কারণে স্টক পুনঃসংরক্ষণ (Restore) করা হয়েছে!` 
          : `Order status reverted! Stock restored to inventory.`,
        'info'
      );
    } else {
      showToast(`Order ${orderId} status updated to ${newStatus}`, 'info');
    }
  };

  const updateOrderPaymentMethod = (orderId, paymentMethod, trxId = 'N/A', isConfirmed = true) => {
    setOrders(prev => {
      const next = prev.map(o => o.id === orderId ? { 
        ...o, 
        paymentMethod, 
        trxId: trxId || o.trxId || 'N/A',
        paymentConfirmed: isConfirmed
      } : o);
      safeSetItem('beli_orders', JSON.stringify(next));
      const target = next.find(o => o.id === orderId);
      if (target) saveCloudOrder(target);
      return next;
    });
    showToast(
      isConfirmed
        ? (lang === 'bn' ? 'পেমেন্ট পদ্ধতি সফলভাবে সংরক্ষিত ও নিশ্চিত হয়েছে' : 'Payment confirmed & saved')
        : (lang === 'bn' ? 'পেমেন্ট পদ্ধতি আপডেট হয়েছে' : 'Payment method updated'), 
      'success'
    );
  };

  const updatePrescriptionStatus = (rxId, newStatus) => {
    setPrescriptions(prev => {
      const next = prev.map(rx => rx.id === rxId ? { ...rx, status: newStatus } : rx);
      safeSetItem('beli_prescriptions', JSON.stringify(next));
      const target = next.find(rx => rx.id === rxId);
      if (target) saveCloudPrescription(target);
      return next;
    });
    showToast(`Prescription ${rxId} updated to ${newStatus}`, 'info');
  };

  const updatePrescriptionMedicines = (
    rxId, 
    prescribedMedicines, 
    pharmacistNotes = '', 
    newStatus = 'Order Created',
    voiceNote = undefined,
    voiceNoteDuration = ''
  ) => {
    const totalPrice = prescribedMedicines.reduce((sum, item) => sum + (Number(item.total) || (Number(item.unitPrice) * Number(item.quantity))), 0);
    
    setPrescriptions(prev => {
      const updated = prev.map(rx => {
        if (rx.id === rxId) {
          const uRx = {
            ...rx,
            prescribedMedicines,
            totalPrice: Number(totalPrice.toFixed(2)),
            pharmacistNotes,
            voiceNote: voiceNote !== undefined ? voiceNote : (rx.voiceNote || null),
            voiceNoteDuration: voiceNoteDuration || rx.voiceNoteDuration || '',
            hasVoiceNote: !!(voiceNote !== undefined ? voiceNote : rx.voiceNote),
            status: newStatus,
            processedAt: new Date().toLocaleString('en-GB')
          };
          saveCloudPrescription(uRx);
          return uRx;
        }
        return rx;
      });
      safeSetItem('beli_prescriptions', JSON.stringify(updated));
      return updated;
    });

    showToast(
      lang === 'bn'
        ? `প্রেসক্রিপশনের ওষুধ, অডিও ভয়েস নোট ও মূল্য সংরক্ষিত হয়েছে! মোট: ৳${totalPrice.toFixed(2)}`
        : `Prescription medicines, audio note & price saved! Total: ৳${totalPrice.toFixed(2)}`,
      'success'
    );
  };

  const updatePrescriptionVoiceNote = (rxId, voiceNote, voiceNoteDuration = '') => {
    setPrescriptions(prev => {
      const updated = prev.map(rx => {
        if (rx.id === rxId) {
          const uRx = {
            ...rx,
            voiceNote,
            voiceNoteDuration,
            hasVoiceNote: !!voiceNote,
            voiceNoteUpdatedAt: new Date().toLocaleString('en-GB')
          };
          saveCloudPrescription(uRx);
          return uRx;
        }
        return rx;
      });
      safeSetItem('beli_prescriptions', JSON.stringify(updated));
      return updated;
    });

    showToast(
      lang === 'bn' ? 'ফার্মাসিস্টের অডিও ভয়েস নোট সফলভাবে সংযুক্ত হয়েছে! 🎙️' : 'Voice note attached successfully! 🎙️',
      'success'
    );
  };

  const markPrescriptionAddedToCart = (rxId) => {
    setPrescriptions(prev => {
      const updated = prev.map(rx => {
        if (rx.id === rxId) {
          const uRx = {
            ...rx,
            isAddedToCart: true,
            status: 'Added to Cart'
          };
          saveCloudPrescription(uRx);
          return uRx;
        }
        return rx;
      });
      safeSetItem('beli_prescriptions', JSON.stringify(updated));
      return updated;
    });
  };

  const addMedicine = (newMed) => {
    const medName = (newMed.name || '').trim().toLowerCase();
    const existing = medicines.find(m => (newMed.id && m.id === newMed.id) || (medName && m.name.toLowerCase().trim() === medName));

    let finalMed;
    if (existing) {
      // Medicine already exists in catalog! Add the stock to existing stock!
      const oldStock = typeof existing.stock === 'number' ? existing.stock : 0;
      const incomingStock = Math.max(0, Number(newMed.stock) || 0);
      const newStock = oldStock + incomingStock;

      finalMed = {
        ...existing,
        ...newMed,
        id: existing.id,
        stock: newStock,
        lastRestockedAt: new Date().toISOString()
      };

      setMedicines(prev => {
        const updated = prev.map(m => m.id === existing.id ? finalMed : m);
        safeSetItem('beli_medicines', JSON.stringify(updated));
        return updated;
      });

      if (incomingStock > 0) {
        const logEntry = {
          id: `rstk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: Date.now(),
          dateStr: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
          timeStr: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          medicineId: existing.id,
          medicineName: existing.name,
          generic: existing.generic || '',
          company: existing.company || '',
          oldStock: oldStock,
          addedStock: incomingStock,
          newStock: newStock,
          unitLabel: 'পিস',
          adminUser: 'yeakub007',
          note: 'অ্যাডমিন প্যানেল থেকে স্টক যোগ'
        };
        setRestockLogs(prev => {
          const next = [logEntry, ...prev].slice(0, 300);
          safeSetItem('beli_restock_logs', JSON.stringify(next));
          return next;
        });
      }

      showToast(
        lang === 'bn' 
          ? `✓ ${existing.name}-এর স্টকে ${incomingStock} পিস যোগ হয়েছে! মোট স্টক: ${newStock} পিস` 
          : `✓ Added ${incomingStock} pcs to ${existing.name}! Total stock: ${newStock} pcs`,
        'success'
      );
    } else {
      finalMed = {
        ...newMed,
        id: newMed.id || `med-${Date.now()}`,
        stock: Math.max(0, Number(newMed.stock) || 0),
        createdAt: new Date().toISOString()
      };
      setMedicines(prev => {
        const next = [finalMed, ...prev];
        safeSetItem('beli_medicines', JSON.stringify(next));
        return next;
      });
      showToast(lang === 'bn' ? 'নতুন ওষুধ সফলভাবে যুক্ত হয়েছে' : 'New medicine added', 'success');
    }

    // Persist to cloud and broadcast to all devices in real time
    saveCloudMedicine(finalMed);
    publishLiveSync({ type: 'MEDICINE_UPDATED', medicine: finalMed });

    return finalMed;
  };

  const updateMedicine = (updatedMed) => {
    setMedicines(prev => {
      const exists = prev.some(m => m.id === updatedMed.id);
      let next;
      if (exists) {
        next = prev.map(m => m.id === updatedMed.id ? { ...m, ...updatedMed } : m);
      } else {
        next = [updatedMed, ...prev];
      }
      safeSetItem('beli_medicines', JSON.stringify(next));
      return next;
    });

    // Save to Cloud and broadcast updated image/details to all other devices live
    saveCloudMedicine(updatedMed);
    publishLiveSync({ type: 'MEDICINE_UPDATED', medicine: updatedMed });

    showToast(lang === 'bn' ? 'ওষুধের তথ্য আপডেট হয়েছে' : 'Medicine updated', 'success');
  };

  const restockMedicine = (medicineOrId, addedUnits, logData = {}) => {
    const targetId = typeof medicineOrId === 'object' ? medicineOrId.id : medicineOrId;
    const existing = medicines.find(m => m.id === targetId || (typeof medicineOrId === 'object' && medicineOrId.name && m.name.toLowerCase().trim() === medicineOrId.name.toLowerCase().trim()));
    const baseMed = existing || (typeof medicineOrId === 'object' ? medicineOrId : null);
    if (!baseMed) return { success: false };

    const oldStockVal = typeof baseMed.stock === 'number' ? baseMed.stock : 0;
    const added = Math.max(0, Number(addedUnits) || 0);
    const newStockVal = oldStockVal + added;

    const targetMed = {
      ...baseMed,
      id: baseMed.id || `med-${Date.now()}`,
      stock: newStockVal,
      lastRestockedAt: new Date().toISOString()
    };

    setMedicines(prev => {
      const matchIndex = prev.findIndex(m => m.id === targetMed.id || m.name.toLowerCase().trim() === targetMed.name.toLowerCase().trim());
      let updated;
      if (matchIndex >= 0) {
        updated = [...prev];
        updated[matchIndex] = { ...updated[matchIndex], ...targetMed, stock: newStockVal };
      } else {
        updated = [targetMed, ...prev];
      }
      safeSetItem('beli_medicines', JSON.stringify(updated));
      return updated;
    });

    // Save to Cloud and broadcast live stock update to all devices
    saveCloudMedicine(targetMed);
    publishLiveSync({ type: 'STOCK_UPDATED', medicineId: targetMed.id, stock: newStockVal, medicine: targetMed });

    const logEntry = {
      id: `rstk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' }),
      timeStr: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      medicineId: targetMed.id,
      medicineName: targetMed.name,
      generic: targetMed.generic || '',
      company: targetMed.company || '',
      oldStock: oldStockVal,
      addedStock: added,
      newStock: newStockVal,
      unitLabel: logData.unitLabel || 'পিস',
      invoiceNo: logData.invoiceNo || '',
      supplier: logData.supplier || '',
      purchasePrice: logData.purchasePrice || '',
      adminUser: logData.adminUser || 'yeakub007',
      note: logData.note || ''
    };

    setRestockLogs(prev => {
      const next = [logEntry, ...prev].slice(0, 300);
      safeSetItem('beli_restock_logs', JSON.stringify(next));
      return next;
    });

    showToast(
      lang === 'bn' 
        ? `✓ ${targetMed.name}-এর স্টক ${oldStockVal} থেকে বৃদ্ধি পেয়ে ${newStockVal} পিস হয়েছে!` 
        : `✓ Restocked ${targetMed.name}: ${oldStockVal} ➜ ${newStockVal} pcs!`,
      'success'
    );

    return { success: true, medicine: targetMed, oldStock: oldStockVal, newStock: newStockVal, logEntry };
  };

  const clearRestockLogs = () => {
    setRestockLogs([]);
    localStorage.removeItem('beli_restock_logs');
    showToast(lang === 'bn' ? 'স্টক ইন হিস্টোরি মুছে ফেলা হয়েছে' : 'Restock history cleared', 'info');
  };

  const deleteMedicine = (medId) => {
    setMedicines(prev => prev.filter(m => m.id !== medId));
    showToast(lang === 'bn' ? 'ওষুধ ডিলিট করা হয়েছে' : 'Medicine deleted', 'info');
  };

  const resetToDefaultMedicines = () => {
    setMedicines(INITIAL_MEDICINES);
    localStorage.removeItem('beli_medicines');
    showToast('Default catalog restored', 'info');
  };

  return (
    <ShopContext.Provider value={{
      config,
      deliverySettings,
      updateDeliverySettings,
      medicines,
      cart,
      orders,
      prescriptions,
      lang,
      setLang,
      
      // UI Modals
      isCartOpen,
      setIsCartOpen,
      isPrescriptionModalOpen,
      setIsPrescriptionModalOpen,
      isOrderTrackingModalOpen,
      setIsOrderTrackingModalOpen,
      isHealthToolsModalOpen,
      setIsHealthToolsModalOpen,
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      isCustomerProfileOpen,
      setIsCustomerProfileOpen,
      currentCustomer,
      setCurrentCustomer,
      customerProfiles,
      loginCustomer,
      logoutCustomer,
      updateCustomerProfile,
      selectedMedicine,
      setSelectedMedicine,
      activeInvoiceOrder,
      setActiveInvoiceOrder,
      currentView,
      navigateTo,
      isAdminAuthenticated,
      setIsAdminAuthenticated,
      adminLogin,
      adminLogout,

      // Search & Filter
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      medexLiveResults,
      isMedexLoading,
      fetchMedexSearchResults,

      // Cart
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartSubtotal,
      rawSubtotal,
      totalItemSavings,
      couponCode,
      discountAmount,
      applyCoupon,
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus,

      // Orders & Prescriptions
      createOrder,
      uploadPrescription,
      updateOrderStatus,
      updateOrderPaymentMethod,
      updatePrescriptionStatus,
      updatePrescriptionMedicines,
      updatePrescriptionVoiceNote,
      markPrescriptionAddedToCart,

      // Admin CRUD
      addMedicine,
      updateMedicine,
      deleteMedicine,
      resetToDefaultMedicines,
      // Restock & Stock-in
      restockMedicine,
      restockLogs,
      setRestockLogs,
      clearRestockLogs,
      // Admin Customer CRUD
      adminUpdateCustomer,
      adminAddCustomer,
      adminDeleteCustomer,

      // Ad Banner & Popup
      adBanner,
      setAdBanner,
      updateAdBanner,
      isAdModalOpen,
      setIsAdModalOpen,

      // Hero Banner / Main Page Photo
      heroBanner,
      setHeroBanner,
      updateHeroBanner,

      // Toast
      toast,
      showToast,

      // Order Notification (Bottom-Right)
      orderNotification,
      setOrderNotification,
      triggerOrderNotification
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
