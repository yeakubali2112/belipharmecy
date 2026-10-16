import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Lock, 
  Unlock, 
  BarChart3, 
  Package, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Clock, 
  Eye, 
  EyeOff, 
  RotateCcw,
  AlertCircle,
  Printer,
  ArrowLeft,
  LogOut,
  ExternalLink,
  ShieldCheck,
  User,
  Settings,
  DollarSign,
  Phone,
  Search,
  SlidersHorizontal,
  Pill,
  Sparkles,
  ShoppingBag,
  Save,
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Tag,
  Truck,
  Percent,
  Gift,
  CheckCircle2,
  Copy,
  Users,
  UserPlus,
  PhoneCall,
  MapPin,
  Calendar,
  Mic,
  Square,
  Headphones,
  Volume2,
  ShoppingCart,
  Receipt,
  CreditCard,
  Banknote,
  History,
  Calculator,
  Store,
  PackagePlus,
  Boxes,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/medicines';
import { PRESET_AVATARS } from '../data/avatars';
import { searchMedicines, mergeSearchResults, fetchMedexSearchResults } from '../utils/medicineSearch';
import { VoiceNotePlayer } from './VoiceNotePlayer';
import { convertFileToBase64, createSyntheticVoiceAudio } from '../utils/voiceNoteHelper';

export const AdminPortal = () => {
  const { 
    config, 
    deliverySettings,
    updateDeliverySettings,
    coupons,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    adBanner,
    updateAdBanner,
    setIsAdModalOpen,
    heroBanner,
    updateHeroBanner,
    showToast,
    orders, 
    prescriptions, 
    medicines, 
    customerProfiles,
    adminUpdateCustomer,
    adminAddCustomer,
    adminDeleteCustomer,
    updateOrderStatus, 
    updateOrderPaymentMethod,
    createOrder,
    updatePrescriptionStatus,
    updatePrescriptionMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    resetToDefaultMedicines,
    restockMedicine,
    restockLogs,
    clearRestockLogs,
    setActiveInvoiceOrder,
    navigateTo,
    isAdminAuthenticated,
    adminLogin,
    adminLogout,
    lang 
  } = useShop();

  // Login form state
  const [username, setUsername] = useState('yeakub007');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Dashboard active tab: 'overview', 'orders', 'prescriptions', 'medicines', 'coupons', 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Delivery Settings Form State
  const [deliveryForm, setDeliveryForm] = useState({
    deliveryFee: config.deliveryFee || 40,
    freeDeliveryThreshold: config.freeDeliveryThreshold || 500,
    expressDeliveryFee: config.expressDeliveryFee || 80
  });

  React.useEffect(() => {
    setDeliveryForm({
      deliveryFee: config.deliveryFee || 40,
      freeDeliveryThreshold: config.freeDeliveryThreshold || 500,
      expressDeliveryFee: config.expressDeliveryFee || 80
    });
  }, [config.deliveryFee, config.freeDeliveryThreshold, config.expressDeliveryFee]);

  const handleSaveDelivery = (e) => {
    e.preventDefault();
    updateDeliverySettings({
      deliveryFee: Number(deliveryForm.deliveryFee),
      freeDeliveryThreshold: Number(deliveryForm.freeDeliveryThreshold),
      expressDeliveryFee: Number(deliveryForm.expressDeliveryFee)
    });
  };

  // Ad Banner / Offer Popup Form State
  const [adForm, setAdForm] = useState({
    isActive: adBanner?.isActive ?? true,
    title: adBanner?.title || '',
    subtitle: adBanner?.subtitle || '',
    imageUrl: adBanner?.imageUrl || '',
    badgeText: adBanner?.badgeText || '',
    buttonText: adBanner?.buttonText || '',
    buttonAction: adBanner?.buttonAction || 'catalog',
    couponCode: adBanner?.couponCode || ''
  });

  const [imageUploadMethod, setImageUploadMethod] = useState('file'); // 'file' or 'url'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const adFileInputRef = useRef(null);

  React.useEffect(() => {
    if (adBanner && !isUploadingImage) {
      setAdForm({
        isActive: adBanner.isActive ?? true,
        title: adBanner.title || '',
        subtitle: adBanner.subtitle || '',
        imageUrl: adBanner.imageUrl || '',
        badgeText: adBanner.badgeText || '',
        buttonText: adBanner.buttonText || '',
        buttonAction: adBanner.buttonAction || 'catalog',
        couponCode: adBanner.couponCode || ''
      });
    }
  }, [adBanner?.updatedAt, adBanner?.imageUrl]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);

          const updated = {
            ...adBanner,
            ...adForm,
            imageUrl: compressedDataUrl,
            isActive: true,
            updatedAt: new Date().toISOString()
          };
          setAdForm(updated);
          // SAVE IMMEDIATELY TO STATE, LOCALSTORAGE AND CLOUD
          updateAdBanner(updated);

          setIsUploadingImage(false);
          if (e.target) e.target.value = '';
          showToast?.('ছবি সফলভাবে যোগ ও সেভ হয়েছে! বিজ্ঞাপন সক্রিয় রয়েছে।', 'success');
        };
        img.onerror = () => {
          setIsUploadingImage(false);
          showToast?.('ছবি লোড করতে ব্যর্থ হয়েছে', 'error');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingImage(false);
      showToast?.('ছবি প্রসেস করতে সমস্যা হয়েছে', 'error');
    }
  };

  const handleSaveAdBanner = (e) => {
    e?.preventDefault();
    if (!adForm.imageUrl) {
      showToast?.('অনুগ্রহ করে বিজ্ঞাপনের একটি ছবি দিন!', 'error');
      return;
    }
    const updated = {
      ...adBanner,
      ...adForm,
      updatedAt: new Date().toISOString()
    };
    updateAdBanner(updated);
    showToast?.('বিজ্ঞাপন ব্যানার সফলভাবে সেভ ও লাইভ আপডেট হয়েছে!', 'success');
  };

  // ==========================================
  // Hero Banner / Main Page Background State
  // ==========================================
  const [bannerTab, setBannerTab] = useState('hero'); // 'hero' | 'popup'
  const [heroForm, setHeroForm] = useState({
    imageUrl: heroBanner?.imageUrl || '',
    showText: heroBanner?.showText !== false,
    showOverlay: heroBanner?.showOverlay !== false,
    titleLine1: heroBanner?.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ',
    titleLine2: heroBanner?.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়',
    subtitle: heroBanner?.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।'
  });
  const [heroUploadMethod, setHeroUploadMethod] = useState('file'); // 'file' | 'url'
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileInputRef = useRef(null);

  React.useEffect(() => {
    if (heroBanner && !isUploadingHero) {
      setHeroForm({
        imageUrl: heroBanner.imageUrl || '',
        showText: heroBanner.showText !== false,
        showOverlay: heroBanner.showOverlay !== false,
        titleLine1: heroBanner.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ',
        titleLine2: heroBanner.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়',
        subtitle: heroBanner.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।'
      });
    }
  }, [heroBanner?.updatedAt, heroBanner?.imageUrl]);

  const handleHeroImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast?.('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল নির্বাচন করুন (JPG, PNG, WebP)', 'error');
      return;
    }

    setIsUploadingHero(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxWidth = 1400;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);

          const updated = {
            ...heroBanner,
            ...heroForm,
            imageUrl: compressedDataUrl,
            updatedAt: new Date().toISOString()
          };
          setHeroForm(updated);
          updateHeroBanner(updated);
          setIsUploadingHero(false);
          if (e.target) e.target.value = '';
          showToast?.('হিরো ব্যানার ফটো সফলভাবে যোগ ও সেভ হয়েছে!', 'success');
        };
        img.onerror = () => {
          setIsUploadingHero(false);
          showToast?.('ছবি লোড করতে সমস্যা হয়েছে!', 'error');
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingHero(false);
      showToast?.('ফটো প্রসেসিং করতে সমস্যা হয়েছে!', 'error');
    }
  };

  const handleSaveHeroBanner = (e) => {
    e?.preventDefault?.();
    const updated = {
      ...heroBanner,
      ...heroForm,
      updatedAt: new Date().toISOString()
    };
    updateHeroBanner(updated);
    showToast?.('হিরো ব্যানার সফলভাবে সেভ ও লাইভ আপডেট হয়েছে!', 'success');
  };

  const handleResetHeroBanner = () => {
    const resetData = {
      imageUrl: '',
      showText: true,
      showOverlay: true,
      titleLine1: 'প্রয়োজনে দ্রুত আসল ওষুধ',
      titleLine2: 'পৌঁছে যাবে আপনার দোরগোড়ায়',
      subtitle: 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন। আমাদের রেজিস্টার্ড ফার্মাসিস্টের তত্ত্বাবধানে যাচাইকৃত ১০০% জেনুইন ওষুধ দ্রুততম সময়ে ডেলিভারি করা হয়।',
      updatedAt: new Date().toISOString()
    };
    setHeroForm(resetData);
    updateHeroBanner(resetData);
    showToast?.('ডিফল্ট ব্র‍্যান্ড গ্রেডিয়েন্ট ব্যাকগ্রাউন্ড রিসেট করা হয়েছে!', 'info');
  };

  // Coupon Manager Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    type: 'percent',
    value: 10,
    minOrder: 0,
    maxDiscount: 500,
    isActive: true
  });

  const handleOpenAddCoupon = () => {
    setEditingCouponId(null);
    setCouponForm({
      code: '',
      description: '',
      type: 'percent',
      value: 10,
      minOrder: 0,
      maxDiscount: 500,
      isActive: true
    });
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (coupon) => {
    setEditingCouponId(coupon.id);
    setCouponForm({
      code: coupon.code,
      description: coupon.description || '',
      type: coupon.type || 'percent',
      value: coupon.value || 0,
      minOrder: coupon.minOrder || 0,
      maxDiscount: coupon.maxDiscount || 0,
      isActive: coupon.isActive !== false
    });
    setShowCouponModal(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!couponForm.code.trim()) return;

    if (editingCouponId) {
      updateCoupon(editingCouponId, {
        code: couponForm.code,
        description: couponForm.description,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder),
        maxDiscount: Number(couponForm.maxDiscount),
        isActive: couponForm.isActive
      });
      setShowCouponModal(false);
    } else {
      const res = addCoupon({
        code: couponForm.code,
        description: couponForm.description,
        type: couponForm.type,
        value: Number(couponForm.value),
        minOrder: Number(couponForm.minOrder),
        maxDiscount: Number(couponForm.maxDiscount),
        isActive: couponForm.isActive
      });
      if (res?.success) {
        setShowCouponModal(false);
      }
    }
  };

  // Order filter, search & pagination (10 orders per page)
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 10;

  React.useEffect(() => {
    setOrderPage(1);
  }, [orderFilter, orderSearch]);

  // Prescription preview modal
  const [previewRxImage, setPreviewRxImage] = useState(null);
  const [rxZoom, setRxZoom] = useState(1);
  const [rxRotation, setRxRotation] = useState(0);
  const [isRxEnlargedOnLeft, setIsRxEnlargedOnLeft] = useState(false);

  const handleOpenRxPreview = (img) => {
    setPreviewRxImage(img);
    setRxZoom(1);
    setRxRotation(0);
  };

  // Prescription Medicine Entry Modal State
  const [activeRxForMedicines, setActiveRxForMedicines] = useState(null);
  const [rxMedicinesList, setRxMedicinesList] = useState([]);
  const [rxPharmacistNotes, setRxPharmacistNotes] = useState('');
  const [rxVoiceNote, setRxVoiceNote] = useState(null);
  const [rxVoiceDuration, setRxVoiceDuration] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = React.useRef(null);
  const audioStreamRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const recordingTimerRef = React.useRef(null);

  const [rxMedSearch, setRxMedSearch] = useState('');
  const [rxMedexResults, setRxMedexResults] = useState([]);
  const [isRxMedexLoading, setIsRxMedexLoading] = useState(false);
  const [selectedMedToAdd, setSelectedMedToAdd] = useState(null);
  const [rxAddUnitType, setRxAddUnitType] = useState('strip');
  const [rxAddQuantity, setRxAddQuantity] = useState(1);

  // Live MedEx fetch for prescription medicine search
  React.useEffect(() => {
    const q = rxMedSearch.trim();
    if (q.length < 2) {
      setRxMedexResults([]);
      setIsRxMedexLoading(false);
      return;
    }
    setIsRxMedexLoading(true);
    const timer = setTimeout(async () => {
      try {
        const liveItems = await fetchMedexSearchResults(q);
        setRxMedexResults(liveItems);
      } catch {
        setRxMedexResults([]);
      } finally {
        setIsRxMedexLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [rxMedSearch]);

  const handleOpenRxMedicinesModal = (rx) => {
    setActiveRxForMedicines(rx);
    setRxMedicinesList(rx.prescribedMedicines ? [...rx.prescribedMedicines] : []);
    setRxPharmacistNotes(rx.pharmacistNotes || '');
    setRxVoiceNote(rx.voiceNote || null);
    setRxVoiceDuration(rx.voiceNoteDuration || '');
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    setRxMedSearch('');
    setRxMedexResults([]);
    setIsRxMedexLoading(false);
    setSelectedMedToAdd(null);
    setRxAddUnitType('strip');
    setRxAddQuantity(1);
    setRxZoom(1);
    setRxRotation(0);
    setIsRxEnlargedOnLeft(false);
  };

  const handleAddMedicineToRx = () => {
    if (!selectedMedToAdd) return;
    
    // Exact website pricing calculation
    const rawPrice = rxAddUnitType === 'strip' ? selectedMedToAdd.pricePerStrip : selectedMedToAdd.pricePerUnit;
    const discount = selectedMedToAdd.discountPercent || 0;
    const unitPrice = discount > 0 ? (rawPrice * (1 - discount / 100)) : rawPrice;
    const lineTotal = Number((unitPrice * rxAddQuantity).toFixed(2));

    const newItem = {
      medicineId: selectedMedToAdd.id,
      name: selectedMedToAdd.name,
      generic: selectedMedToAdd.generic,
      company: selectedMedToAdd.company,
      image: selectedMedToAdd.image,
      unitType: rxAddUnitType,
      unitLabel: rxAddUnitType === 'strip' ? (lang === 'bn' ? `পাতা (${selectedMedToAdd.stripSize}টি)` : 'Strip') : (lang === 'bn' ? '১ পিস' : '1 Piece'),
      quantity: Number(rxAddQuantity),
      unitPrice: Number(unitPrice.toFixed(2)),
      rawPrice: Number(rawPrice.toFixed(2)),
      discountPercent: discount,
      total: lineTotal
    };

    setRxMedicinesList(prev => [...prev, newItem]);
    setSelectedMedToAdd(null);
    setRxMedSearch('');
    setRxAddQuantity(1);
  };

  const handleRemoveMedicineFromRx = (index) => {
    setRxMedicinesList(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateRxItemQuantity = (index, newQty) => {
    if (newQty === '') {
      setRxMedicinesList(prev => prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, quantity: '', total: 0 };
        }
        return item;
      }));
      return;
    }
    const num = Number(newQty);
    if (num <= 0) {
      handleRemoveMedicineFromRx(index);
      return;
    }
    setRxMedicinesList(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          quantity: num,
          total: Number((item.unitPrice * num).toFixed(2))
        };
      }
      return item;
    }));
  };

  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast?.('আপনার ব্রাউজারে মাইক্রোফোন সাপোর্ট নেই!', 'error');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      let options = {};
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          options = { mimeType: 'audio/webm' };
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          options = { mimeType: 'audio/mp4' };
        }
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          setRxVoiceNote(base64Audio);
          const mins = Math.floor(recordingSeconds / 60);
          const secs = recordingSeconds % 60;
          setRxVoiceDuration(`${mins > 0 ? `${mins} মি. ` : ''}${secs} সে.`);
          showToast?.('ভয়েস বার্তা সফলভাবে রেকর্ড করা হয়েছে!', 'success');
        };
        reader.readAsDataURL(audioBlob);

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };

      recorder.start(200);
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      showToast?.('মাইক্রোফোন অনুমতি পাওয়া যায়নি! অনুগ্রহ করে ব্রাউজার পারমিশন চেক করুন।', 'error');
    }
  };

  const stopVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleVoiceFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      showToast?.('অনুগ্রহ করে একটি সঠিক অডিও ফাইল নির্বাচন করুন!', 'error');
      return;
    }
    try {
      const base64 = await convertFileToBase64(file);
      setRxVoiceNote(base64);
      setRxVoiceDuration('অডিও ফাইল');
      showToast?.('অডিও ফাইল সফলভাবে যুক্ত হয়েছে!', 'success');
    } catch (err) {
      showToast?.('অডিও ফাইল পড়তে সমস্যা হয়েছে!', 'error');
    }
  };

  const handleUseSampleVoice = () => {
    const sampleAudio = createSyntheticVoiceAudio(8);
    setRxVoiceNote(sampleAudio);
    setRxVoiceDuration('৮ সেকেন্ড');
    showToast?.('নমুনা টেস্ট অডিও বার্তা যোগ করা হয়েছে!', 'success');
  };

  const handleDeleteVoiceNote = () => {
    setRxVoiceNote(null);
    setRxVoiceDuration('');
    showToast?.('ভয়েস বার্তা মুছে ফেলা হয়েছে', 'info');
  };

  const handleSavePrescriptionMedicines = () => {
    if (!activeRxForMedicines) return;
    updatePrescriptionMedicines(
      activeRxForMedicines.id,
      rxMedicinesList,
      rxPharmacistNotes,
      'Order Created',
      rxVoiceNote,
      rxVoiceDuration
    );
    setActiveRxForMedicines(null);
  };

  // Medicine catalog state
  const [showAddForm, setShowAddForm] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [adminMedexResults, setAdminMedexResults] = useState([]);
  const [isAdminMedexLoading, setIsAdminMedexLoading] = useState(false);
  const [medPage, setMedPage] = useState(1);
  const medItemsPerPage = 15;

  // Smart windowed pagination generator (e.g. 1, 2, 3, 4, 5, '...', 134)
  const getVisiblePages = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  // Live MedEx fetch for admin catalog search
  React.useEffect(() => {
    const q = medSearch.trim();
    if (q.length < 2) {
      setAdminMedexResults([]);
      setIsAdminMedexLoading(false);
      return;
    }
    setIsAdminMedexLoading(true);
    const timer = setTimeout(async () => {
      try {
        const liveItems = await fetchMedexSearchResults(q);
        setAdminMedexResults(liveItems);
      } catch {
        setAdminMedexResults([]);
      } finally {
        setIsAdminMedexLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [medSearch]);

  React.useEffect(() => {
    setMedPage(1);
  }, [medSearch]);

  const [newMed, setNewMed] = useState({
    name: '',
    generic: '',
    company: 'Square Pharmaceuticals Ltd',
    category: 'otc',
    type: 'Tablet',
    stripSize: 10,
    pricePerUnit: 5,
    pricePerStrip: 50,
    discountPercent: 5,
    requiresPrescription: false,
    stock: 100,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    description: '',
    indications: '',
    dosage: '',
    sideEffects: ''
  });

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = adminLogin(username, password);
    if (!res.success) {
      setLoginError(res.error);
    }
  };

  const handleAddMedicineSubmit = (e) => {
    e.preventDefault();
    if (!newMed.name || !newMed.generic) return;
    addMedicine(newMed);
    setShowAddForm(false);
    setNewMed({
      name: '',
      generic: '',
      company: 'Square Pharmaceuticals Ltd',
      category: 'otc',
      type: 'Tablet',
      stripSize: 10,
      pricePerUnit: 5,
      pricePerStrip: 50,
      discountPercent: 5,
      requiresPrescription: false,
      stock: 100,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
      description: '',
      indications: '',
      dosage: '',
      sideEffects: ''
    });
  };

  // Edit medicine modal state & handlers
  const [editingMed, setEditingMed] = useState(null);

  // Product photo upload refs & handlers
  const editImageInputRef = useRef(null);
  const newImageInputRef = useRef(null);

  const compressProductImage = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WEBP) নির্বাচন করুন।' : 'Please choose an image file (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert(lang === 'bn' ? 'ছবির সাইজ ৮ মেগাবাইটের কম হতে হবে।' : 'Image size must be under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 600; // Optimal 600px resolution for high-res medicine presentation
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
        callback(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEditPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressProductImage(file, (base64) => {
      setEditingMed(prev => prev ? ({ ...prev, image: base64 }) : null);
    });
    e.target.value = '';
  };

  const handleNewPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressProductImage(file, (base64) => {
      setNewMed(prev => ({ ...prev, image: base64 }));
    });
    e.target.value = '';
  };

  const handleStartEdit = (med) => {
    setEditingMed({ ...med });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingMed || !editingMed.name || !editingMed.generic) return;
    updateMedicine(editingMed);
    setEditingMed(null);
  };

  const totalSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const pendingRx = prescriptions.filter(p => p.status === 'Pending Review').length;

  const getOrderTimestamp = (order) => {
    if (!order) return 0;
    if (order.timestamp && typeof order.timestamp === 'number') {
      return order.timestamp;
    }
    if (order.createdAt) {
      const parts = String(order.createdAt).split(',');
      if (parts.length === 2) {
        const dateParts = parts[0].trim().split('/');
        if (dateParts.length === 3) {
          const [d, m, y] = dateParts.map(Number);
          const timePart = parts[1].trim();
          const parsedDate = new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${timePart}`);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.getTime();
          }
        }
      }
      const t = Date.parse(order.createdAt);
      if (!isNaN(t)) return t;
    }
    return 0;
  };

  const filteredOrders = orders
    .filter(o => {
      const matchStatus = orderFilter === 'all' || o.status === orderFilter;
      const q = orderSearch.toLowerCase().trim();
      const matchQuery = !q || (
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.includes(q))
      );
      return matchStatus && matchQuery;
    })
    .sort((a, b) => {
      const timeA = getOrderTimestamp(a);
      const timeB = getOrderTimestamp(b);
      if (timeA !== timeB) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });

  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ordersPerPage,
    (orderPage - 1) * ordersPerPage + ordersPerPage
  );

  const handleOrderPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalOrderPages) return;
    setOrderPage(newPage);
    const topElem = document.getElementById('admin-orders-list-top');
    if (topElem) {
      topElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredMedicines = medSearch.trim()
    ? mergeSearchResults(searchMedicines(medicines, medSearch), adminMedexResults)
    : [...medicines].sort((a, b) => (a.generic || '').localeCompare(b.generic || '') || (a.name || '').localeCompare(b.name || ''));

  const totalMedPages = Math.ceil(filteredMedicines.length / medItemsPerPage) || 1;
  const paginatedAdminMedicines = filteredMedicines.slice(
    (medPage - 1) * medItemsPerPage,
    (medPage - 1) * medItemsPerPage + medItemsPerPage
  );

  const handleAdminMedPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalMedPages) return;
    setMedPage(newPage);
    const tableTop = document.getElementById('admin-med-table-top');
    if (tableTop) {
      tableTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ==========================================
  // CUSTOMER MANAGEMENT STATE & HELPERS
  // ==========================================
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all', 'ordered', 'prescriptions'
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 9;

  // Edit Customer Modal State
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editCustomerForm, setEditCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: null
  });
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false);
  const editCustomerPhotoRef = useRef(null);

  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: null
  });
  const [showNewAvatarPicker, setShowNewAvatarPicker] = useState(false);
  const newCustomerPhotoRef = useRef(null);

  // Inspect Customer History Modal State
  const [inspectCustomer, setInspectCustomer] = useState(null);

  // Compress photo for customer avatars
  const compressCustomerAvatar = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(lang === 'bn' ? 'অনুগ্রহ করে ছবি ফাইল নির্বাচন করুন' : 'Please select an image file', 'error');
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
        callback(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEditCustomerPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressCustomerAvatar(file, (base64) => {
      setEditCustomerForm(prev => ({ ...prev, avatar: base64 }));
    });
    e.target.value = '';
  };

  const handleNewCustomerPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressCustomerAvatar(file, (base64) => {
      setNewCustomerForm(prev => ({ ...prev, avatar: base64 }));
    });
    e.target.value = '';
  };

  // Consolidate customers from customerProfiles, orders, prescriptions
  const consolidatedCustomers = React.useMemo(() => {
    const map = new Map();

    // 1. From customerProfiles
    (customerProfiles || []).forEach(cp => {
      if (cp && cp.phone) {
        const cleanPhone = String(cp.phone).trim();
        if (cleanPhone && cleanPhone !== '01711223344') {
          map.set(cleanPhone, {
            name: cp.name || 'বেলী গ্রাহক',
            phone: cleanPhone,
            address: cp.address || '',
            avatar: cp.avatar || null,
            createdAt: cp.createdAt || '',
            lastOrderDate: cp.lastOrderDate || '',
            updatedAt: cp.updatedAt || ''
          });
        }
      }
    });

    // 2. Discover from orders
    (orders || []).forEach(o => {
      if (o && o.customerPhone) {
        const cleanPhone = String(o.customerPhone).trim();
        if (cleanPhone && cleanPhone !== '01711223344') {
          if (!map.has(cleanPhone)) {
            map.set(cleanPhone, {
              name: o.customerName || 'বেলী গ্রাহক',
              phone: cleanPhone,
              address: o.deliveryAddress || '',
              avatar: o.customerAvatar || null,
              createdAt: o.createdAt ? String(o.createdAt).split(',')[0].trim() : '',
              lastOrderDate: o.createdAt ? String(o.createdAt).split(',')[0].trim() : '',
              updatedAt: ''
            });
          } else {
            const existing = map.get(cleanPhone);
            if (!existing.lastOrderDate && o.createdAt) {
              existing.lastOrderDate = String(o.createdAt).split(',')[0].trim();
            }
            if (!existing.address && o.deliveryAddress) {
              existing.address = o.deliveryAddress;
            }
            if (!existing.avatar && o.customerAvatar) {
              existing.avatar = o.customerAvatar;
            }
          }
        }
      }
    });

    // 3. Discover from prescriptions
    (prescriptions || []).forEach(p => {
      if (p && p.customerPhone) {
        const cleanPhone = String(p.customerPhone).trim();
        if (cleanPhone && cleanPhone !== '01711223344') {
          if (!map.has(cleanPhone)) {
            map.set(cleanPhone, {
              name: p.customerName || 'বেলী গ্রাহক',
              phone: cleanPhone,
              address: p.deliveryAddress || '',
              avatar: p.customerAvatar || null,
              createdAt: p.createdAt ? String(p.createdAt).split(',')[0].trim() : '',
              lastOrderDate: '',
              updatedAt: ''
            });
          } else {
            const existing = map.get(cleanPhone);
            if (!existing.avatar && p.customerAvatar) {
              existing.avatar = p.customerAvatar;
            }
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [customerProfiles, orders, prescriptions]);

  // Customer stats calculator helper
  const getCustomerStats = (phone) => {
    const clean = String(phone || '').trim();
    if (!clean) return { orders: [], prescriptions: [], totalSpent: '0.00', deliveredOrders: 0 };

    const custOrders = orders.filter(o => 
      o.customerPhone && (
        o.customerPhone.trim() === clean ||
        o.customerPhone.includes(clean) ||
        clean.includes(o.customerPhone.trim())
      )
    );

    const custRx = prescriptions.filter(p => 
      p.customerPhone && (
        p.customerPhone.trim() === clean ||
        p.customerPhone.includes(clean)
      )
    );

    const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const deliveredOrders = custOrders.filter(o => o.status === 'Delivered').length;

    return {
      orders: custOrders,
      prescriptions: custRx,
      totalSpent: totalSpent.toFixed(2),
      deliveredOrders
    };
  };

  const totalCustomersWithOrders = consolidatedCustomers.filter(c => {
    return orders.some(o => o.customerPhone && (o.customerPhone.includes(c.phone) || c.phone.includes(o.customerPhone)));
  }).length;

  const totalCustomersWithRx = consolidatedCustomers.filter(c => {
    return prescriptions.some(p => p.customerPhone && (p.customerPhone.includes(c.phone) || c.phone.includes(p.customerPhone)));
  }).length;

  const totalCustomerSpent = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  // Filtered & Paginated Customers
  const filteredCustomers = consolidatedCustomers.filter(c => {
    const q = customerSearch.toLowerCase().trim();
    const matchSearch = !q || (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );

    if (!matchSearch) return false;

    if (customerFilter === 'ordered') {
      return orders.some(o => o.customerPhone && (o.customerPhone.includes(c.phone) || c.phone.includes(o.customerPhone)));
    }
    if (customerFilter === 'prescriptions') {
      return prescriptions.some(p => p.customerPhone && (p.customerPhone.includes(c.phone) || c.phone.includes(p.customerPhone)));
    }
    return true;
  });

  const totalCustomerPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;
  const paginatedCustomers = filteredCustomers.slice(
    (customerPage - 1) * customersPerPage,
    (customerPage - 1) * customersPerPage + customersPerPage
  );

  React.useEffect(() => {
    setCustomerPage(1);
  }, [customerSearch, customerFilter]);

  const handleCustomerPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalCustomerPages) return;
    setCustomerPage(newPage);
    const topElem = document.getElementById('admin-customers-top');
    if (topElem) {
      topElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStartEditCustomer = (cust) => {
    setEditingCustomer(cust);
    setEditCustomerForm({
      name: cust.name || '',
      phone: cust.phone || '',
      address: cust.address || '',
      avatar: cust.avatar || null
    });
    setShowEditAvatarPicker(false);
  };

  const handleSaveEditCustomer = (e) => {
    e.preventDefault();
    if (!editCustomerForm.name.trim() || !editCustomerForm.phone.trim()) {
      showToast(lang === 'bn' ? 'নাম ও মোবাইল নম্বর আবশ্যক' : 'Name and phone required', 'error');
      return;
    }
    adminUpdateCustomer(editingCustomer.phone, editCustomerForm);
    setEditingCustomer(null);
  };

  const handleSaveNewCustomer = (e) => {
    e.preventDefault();
    if (!newCustomerForm.phone.trim()) {
      showToast(lang === 'bn' ? 'গ্রাহকের মোবাইল নম্বর আবশ্যক' : 'Phone is required', 'error');
      return;
    }
    adminAddCustomer(newCustomerForm);
    setShowAddCustomerModal(false);
    setNewCustomerForm({ name: '', phone: '', address: '', avatar: null });
    setShowNewAvatarPicker(false);
  };

  const handleDeleteCustomer = (phone, name) => {
    if (window.confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে "${name}" (${phone}) গ্রাহকের প্রোফাইল ডিলিট করতে চান?` : `Are you sure you want to delete ${name} (${phone})?`)) {
      adminDeleteCustomer(phone);
    }
  };

  // ==========================================
  // SELL / POS (COUNTER BILLING) STATE & HELPERS
  // ==========================================
  const [sellSubTab, setSellSubTab] = useState('pos'); // 'pos' or 'history'
  const [sellSearch, setSellSearch] = useState('');
  const [sellCategory, setSellCategory] = useState('all');
  const [sellCart, setSellCart] = useState([]); // [{ id, name, price, quantity, unitLabel, stock }]
  const [sellCustomerType, setSellCustomerType] = useState('walkin'); // 'walkin' or 'existing'
  const [sellCustomerName, setSellCustomerName] = useState('কাউন্টার কাস্টমার');
  const [sellCustomerPhone, setSellCustomerPhone] = useState('');
  const [sellPaymentMethod, setSellPaymentMethod] = useState('Cash on Hand');
  const [sellDiscountType, setSellDiscountType] = useState('fixed'); // 'fixed' (৳) or 'percent' (%)
  const [sellDiscountValue, setSellDiscountValue] = useState('');
  const [sellReceivedAmount, setSellReceivedAmount] = useState('');
  const [sellTrxId, setSellTrxId] = useState('');
  const [sellNote, setSellNote] = useState('');
  const [sellHistoryFilter, setSellHistoryFilter] = useState('all'); // 'all', 'today', 'counter', 'online'
  const [sellHistorySearch, setSellHistorySearch] = useState('');
  const [sellHistoryPage, setSellHistoryPage] = useState(1);
  const sellHistoryPerPage = 10;

  // Floating POS Quick Calculator State & Handlers
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcKeyPress = (btn) => {
    if (btn === 'C') {
      setCalcInput('');
      setCalcResult('');
    } else if (btn === 'DEL') {
      setCalcInput(prev => prev.slice(0, -1));
    } else if (btn === '=') {
      try {
        const clean = calcInput.replace(/×/g, '*').replace(/÷/g, '/');
        if (/^[0-9+\-*/%.() ]+$/.test(clean)) {
          const res = Function(`'use strict'; return (${clean})`)();
          if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
            const formatted = Number(res.toFixed(2)).toString();
            setCalcResult(formatted);
            setCalcInput(formatted);
          }
        }
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput(prev => {
        const lastChar = prev.slice(-1);
        const operators = ['+', '-', '×', '÷', '%'];
        if (operators.includes(btn) && operators.includes(lastChar)) {
          return prev.slice(0, -1) + btn;
        }
        return prev + btn;
      });
    }
  };

  useEffect(() => {
    if (!isCalculatorOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCalculatorOpen(false);
      } else if (e.key >= '0' && e.key <= '9') {
        handleCalcKeyPress(e.key);
      } else if (e.key === '+') {
        handleCalcKeyPress('+');
      } else if (e.key === '-') {
        handleCalcKeyPress('-');
      } else if (e.key === '*' || e.key === 'x') {
        handleCalcKeyPress('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleCalcKeyPress('÷');
      } else if (e.key === '.') {
        handleCalcKeyPress('.');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalcKeyPress('=');
      } else if (e.key === 'Backspace') {
        handleCalcKeyPress('DEL');
      } else if (e.key === 'c' || e.key === 'C') {
        handleCalcKeyPress('C');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCalculatorOpen, calcInput]);

  // POS Cart Calculations
  const sellSubtotal = sellCart.reduce((sum, item) => sum + (Number(item.price || 0) * (Number(item.quantity) || 0)), 0);
  const parsedDiscountVal = Math.max(0, Number(sellDiscountValue) || 0);
  const sellDiscountAmount = sellDiscountType === 'percent' 
    ? Math.min(sellSubtotal, (sellSubtotal * parsedDiscountVal) / 100)
    : Math.min(sellSubtotal, parsedDiscountVal);
  const sellGrandTotal = Math.max(0, sellSubtotal - sellDiscountAmount);
  const parsedReceivedAmount = Number(sellReceivedAmount) || 0;
  const sellChangeDue = sellPaymentMethod === 'Cash on Hand' && parsedReceivedAmount > sellGrandTotal
    ? parsedReceivedAmount - sellGrandTotal
    : 0;
  const sellDueAmount = sellPaymentMethod === 'Cash on Hand' && parsedReceivedAmount > 0 && parsedReceivedAmount < sellGrandTotal
    ? sellGrandTotal - parsedReceivedAmount
    : 0;

  // Sales Analytics Metrics
  const isDateToday = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isDateThisWeek = (timestamp) => {
    if (!timestamp) return false;
    const now = Date.now();
    const diffDays = (now - timestamp) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  };

  const isDateThisMonth = (timestamp) => {
    if (!timestamp) return false;
    const d = new Date(timestamp);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  // Completed / delivered sales
  const completedSales = orders.filter(o => o.status === 'Delivered');
  const todaySalesOrders = completedSales.filter(o => isDateToday(getOrderTimestamp(o)));
  const todaySalesTotal = todaySalesOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  
  const weekSalesOrders = completedSales.filter(o => isDateThisWeek(getOrderTimestamp(o)));
  const weekSalesTotal = weekSalesOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const monthSalesOrders = completedSales.filter(o => isDateThisMonth(getOrderTimestamp(o)));
  const monthSalesTotal = monthSalesOrders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);

  const counterSalesList = completedSales.filter(o => o.isCounterSale || o.deliveryAddress?.includes('কাউন্টার'));
  const onlineSalesList = completedSales.filter(o => !o.isCounterSale && !o.deliveryAddress?.includes('কাউন্টার'));

  const [sellMedexResults, setSellMedexResults] = useState([]);
  const [isSellMedexLoading, setIsSellMedexLoading] = useState(false);
  const [sellMedPage, setSellMedPage] = useState(1);
  const sellMedItemsPerPage = 14;

  // Live MedEx fetch for sell catalog search (same as medicines catalog)
  React.useEffect(() => {
    const q = sellSearch.trim();
    if (q.length < 2) {
      setSellMedexResults([]);
      setIsSellMedexLoading(false);
      return;
    }
    setIsSellMedexLoading(true);
    const timer = setTimeout(async () => {
      try {
        const liveItems = await fetchMedexSearchResults(q);
        setSellMedexResults(liveItems);
      } catch {
        setSellMedexResults([]);
      } finally {
        setIsSellMedexLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [sellSearch]);

  React.useEffect(() => {
    setSellMedPage(1);
  }, [sellSearch, sellCategory]);

  // Filtered medicines for POS catalog selection (Searches ALL 50k+ Bangladesh medicines & MedEx!)
  const filteredSellMedicines = React.useMemo(() => {
    const q = sellSearch.trim();
    let results = [];
    if (q) {
      results = mergeSearchResults(searchMedicines(medicines, q), sellMedexResults);
    } else {
      results = [...medicines].sort((a, b) => (a.generic || '').localeCompare(b.generic || '') || (a.name || '').localeCompare(b.name || ''));
    }

    if (sellCategory !== 'all') {
      results = results.filter(m => m.category === sellCategory);
    }

    return results;
  }, [medicines, sellCategory, sellSearch, sellMedexResults]);

  const totalSellMedPages = Math.ceil(filteredSellMedicines.length / sellMedItemsPerPage) || 1;
  const paginatedSellMedicines = filteredSellMedicines.slice(
    (sellMedPage - 1) * sellMedItemsPerPage,
    (sellMedPage - 1) * sellMedItemsPerPage + sellMedItemsPerPage
  );

  // POS Unit Label Helper (Retail counter sales are in Tablet / Capsule / Piece)
  const getSellUnitLabel = (med) => {
    if (!med) return 'পিস';
    const type = (med.type || '').toLowerCase();
    const name = (med.name || '').toLowerCase();

    if (type.includes('syrup') || type.includes('suspension')) return 'বোতল';
    if (type.includes('cream') || type.includes('ointment') || type.includes('gel')) return 'টিউব';
    if (type.includes('drop')) return 'ড্রপ';
    if (type.includes('injection') || type.includes('ampoule') || type.includes('vial')) return 'ভায়াল';
    if (type.includes('inhaler')) return 'ইনহেলার';
    if (type.includes('capsule') || name.includes('capsule') || type.includes('cap')) return 'ক্যাপসুল (পিস)';
    if (type.includes('tablet') || name.includes('tablet') || type.includes('tab')) return 'ট্যাবলেট (পিস)';
    if (med.unitLabel && med.unitLabel !== 'পাতা' && med.unitLabel !== 'Strip') return med.unitLabel;
    return 'পিস';
  };

  // POS Unit Price Helper (per Tablet / per Piece price)
  const getSellUnitPrice = (med) => {
    if (!med) return 10;
    if (typeof med.pricePerUnit === 'number' && med.pricePerUnit > 0) {
      return Number(med.pricePerUnit);
    }
    if (typeof med.pricePerStrip === 'number' && med.pricePerStrip > 0) {
      const size = Number(med.stripSize) || 1;
      return Number((med.pricePerStrip / size).toFixed(2));
    }
    if (typeof med.price === 'number' && med.price > 0) {
      const size = Number(med.stripSize) || 1;
      if (size > 1 && !med.type?.toLowerCase().includes('bottle')) {
        return Number((med.price / size).toFixed(2));
      }
      return Number(med.price);
    }
    return 10;
  };

  // Cart actions
  const addToSellCart = (med) => {
    setSellCart(prev => {
      const existing = prev.find(it => it.id === med.id);
      const stock = typeof med.stock === 'number' ? med.stock : 100;
      const unitPrice = getSellUnitPrice(med);
      const unitLabel = getSellUnitLabel(med);
      if (existing) {
        if (Number(existing.quantity) >= stock) {
          showToast?.(`স্টকে মাত্র ${stock} ${unitLabel} রয়েছে!`, 'error');
          return prev;
        }
        return prev.map(it => it.id === med.id ? { ...it, quantity: (Number(it.quantity) || 0) + 1 } : it);
      }
      return [...prev, {
        id: med.id,
        medicineId: med.id,
        name: med.name,
        generic: med.generic || '',
        price: unitPrice,
        unitLabel: unitLabel,
        unitType: sellUnitType || (unitLabel === 'পাতা' ? 'strip' : 'unit'),
        stripSize: Number(med.stripSize) || 10,
        quantity: 1,
        stock: stock
      }];
    });
  };

  const updateSellCartQty = (id, newQty) => {
    const target = sellCart.find(it => it.id === id);
    if (!target) return;
    if (newQty === '') {
      setSellCart(prev => prev.map(it => it.id === id ? { ...it, quantity: '' } : it));
      return;
    }
    const num = Number(newQty);
    if (num <= 0) {
      setSellCart(prev => prev.filter(it => it.id !== id));
      return;
    }
    const stock = typeof target.stock === 'number' ? target.stock : 999;
    if (num > stock) {
      showToast?.(`স্টকে মাত্র ${stock} ${target.unitLabel || 'টি'} রয়েছে!`, 'error');
      setSellCart(prev => prev.map(it => it.id === id ? { ...it, quantity: stock } : it));
      return;
    }
    setSellCart(prev => prev.map(it => it.id === id ? { ...it, quantity: num } : it));
  };

  const removeFromSellCart = (id) => {
    setSellCart(prev => prev.filter(it => it.id !== id));
  };

  const clearSellCart = () => {
    setSellCart([]);
    setSellDiscountValue('');
    setSellReceivedAmount('');
    setSellTrxId('');
    setSellNote('');
  };

  // Complete Sale
  const handleCompleteSell = () => {
    if (sellCart.length === 0) {
      showToast?.('কার্ট খালি! বিক্রি করতে অন্তত একটি ওষুধ যোগ করুন।', 'error');
      return;
    }

    const custName = sellCustomerName.trim() || 'কাউন্টার কাস্টমার';
    const custPhone = sellCustomerPhone.trim() || 'N/A';

    const saleOrderData = {
      customerName: custName,
      customerPhone: custPhone,
      deliveryAddress: 'কাউন্টার বিক্রয় (Direct POS)',
      paymentMethod: sellPaymentMethod,
      trxId: sellPaymentMethod === 'Cash on Hand' ? 'N/A' : (sellTrxId.trim() || 'POS-' + Math.floor(100000 + Math.random() * 900000)),
      items: sellCart.map(it => ({
        id: it.id,
        medicineId: it.medicineId || it.id,
        stripSize: it.stripSize || 10,
        unitType: it.unitType || (it.unitLabel === 'পাতা' ? 'strip' : 'unit'),
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
        unitLabel: it.unitLabel || 'পিস'
      })),
      subtotal: Number(sellSubtotal.toFixed(2)),
      discount: Number(sellDiscountAmount.toFixed(2)),
      grandTotal: Number(sellGrandTotal.toFixed(2)),
      paidAmount: parsedReceivedAmount || sellGrandTotal,
      changeAmount: sellChangeDue,
      status: 'Delivered',
      paymentConfirmed: true,
      isCounterSale: true,
      patientNote: sellNote ? `[কাউন্টার সেল নোট]: ${sellNote}` : ''
    };

    const created = createOrder(saleOrderData);
    clearSellCart();
    if (sellCustomerType === 'walkin') {
      setSellCustomerName('কাউন্টার কাস্টমার');
      setSellCustomerPhone('');
    }
    if (created) {
      setActiveInvoiceOrder(created);
    }
  };

  // Filtered sales history
  const filteredSalesHistory = React.useMemo(() => {
    return orders.filter(o => {
      const isDeliveredOrCounter = o.status === 'Delivered' || o.isCounterSale || o.deliveryAddress?.includes('কাউন্টার');
      if (!isDeliveredOrCounter) return false;

      if (sellHistoryFilter === 'today' && !isDateToday(getOrderTimestamp(o))) return false;
      if (sellHistoryFilter === 'counter' && !(o.isCounterSale || o.deliveryAddress?.includes('কাউন্টার'))) return false;
      if (sellHistoryFilter === 'online' && (o.isCounterSale || o.deliveryAddress?.includes('কাউন্টার'))) return false;

      const q = sellHistorySearch.toLowerCase().trim();
      if (q) {
        const matchId = o.id && o.id.toLowerCase().includes(q);
        const matchName = o.customerName && o.customerName.toLowerCase().includes(q);
        const matchPhone = o.customerPhone && o.customerPhone.includes(q);
        return matchId || matchName || matchPhone;
      }
      return true;
    }).sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a));
  }, [orders, sellHistoryFilter, sellHistorySearch]);

  const totalSellHistoryPages = Math.ceil(filteredSalesHistory.length / sellHistoryPerPage) || 1;
  const paginatedSalesHistory = filteredSalesHistory.slice(
    (sellHistoryPage - 1) * sellHistoryPerPage,
    (sellHistoryPage - 1) * sellHistoryPerPage + sellHistoryPerPage
  );

  // ==========================================
  // STOCK IN & INVENTORY RESTOCK STATE & LOGIC
  // ==========================================
  const [restockSearch, setRestockSearch] = useState('');
  const [restockSelectedMed, setRestockSelectedMed] = useState(null);
  const [restockAddedQty, setRestockAddedQty] = useState('10');
  const [restockUnitType, setRestockUnitType] = useState('piece'); // 'piece' (পিস) or 'strip' (পাতা)
  const [restockPurchasePrice, setRestockPurchasePrice] = useState('');
  const [restockInvoiceNo, setRestockInvoiceNo] = useState('');
  const [restockSupplier, setRestockSupplier] = useState('');
  const [restockNote, setRestockNote] = useState('');
  const [restockSearchMedexResults, setRestockSearchMedexResults] = useState([]);
  const [isRestockMedexLoading, setIsRestockMedexLoading] = useState(false);
  const [restockQuickAddInputs, setRestockQuickAddInputs] = useState({});
  const [restockHistorySearch, setRestockHistorySearch] = useState('');
  const [restockHistoryPage, setRestockHistoryPage] = useState(1);
  const restockHistoryPerPage = 8;
  const [restockMedPage, setRestockMedPage] = useState(1);
  const restockMedPerPage = 12;

  // Inventory count badges
  const lowStockCount = useMemo(() => {
    return medicines.filter(m => {
      const s = typeof m.stock === 'number' ? m.stock : 100;
      return s <= 15 && s > 0;
    }).length;
  }, [medicines]);

  const outOfStockCount = useMemo(() => {
    return medicines.filter(m => (typeof m.stock === 'number' ? m.stock : 100) === 0).length;
  }, [medicines]);

  // Live MedEx fetch for stock-in search
  useEffect(() => {
    const q = restockSearch.trim();
    if (q.length < 2) {
      setRestockSearchMedexResults([]);
      setIsRestockMedexLoading(false);
      return;
    }
    setIsRestockMedexLoading(true);
    const timer = setTimeout(async () => {
      try {
        const liveItems = await fetchMedexSearchResults(q);
        setRestockSearchMedexResults(liveItems);
      } catch {
        setRestockSearchMedexResults([]);
      } finally {
        setIsRestockMedexLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [restockSearch]);

  useEffect(() => {
    setRestockMedPage(1);
  }, [restockSearch]);

  // Filtered medicines for Stock In search
  const filteredRestockMedicines = useMemo(() => {
    const q = restockSearch.trim();
    if (q) {
      return mergeSearchResults(searchMedicines(medicines, q), restockSearchMedexResults);
    }
    return [...medicines];
  }, [medicines, restockSearch, restockSearchMedexResults]);

  const totalRestockMedPages = Math.ceil(filteredRestockMedicines.length / restockMedPerPage) || 1;
  const paginatedRestockMedicines = filteredRestockMedicines.slice(
    (restockMedPage - 1) * restockMedPerPage,
    (restockMedPage - 1) * restockMedPerPage + restockMedPerPage
  );

  // Synchronize selected medicine with latest live catalog updates
  const activeRestockMed = useMemo(() => {
    if (!restockSelectedMed) return null;
    return medicines.find(m => m.id === restockSelectedMed.id) || restockSelectedMed;
  }, [medicines, restockSelectedMed]);

  // Current stock count of active restock item
  const restockCurrentStock = useMemo(() => {
    if (!activeRestockMed) return 0;
    return typeof activeRestockMed.stock === 'number' ? activeRestockMed.stock : 0;
  }, [activeRestockMed]);

  // Effective added pieces calculation (considering strip size if strip selected)
  const restockAddedPieces = useMemo(() => {
    const rawNum = Math.max(0, parseInt(restockAddedQty, 10) || 0);
    if (restockUnitType === 'strip') {
      const size = Number(activeRestockMed?.stripSize) || 10;
      return rawNum * size;
    }
    return rawNum;
  }, [restockAddedQty, restockUnitType, activeRestockMed]);

  // New resulting stock
  const restockResultingStock = restockCurrentStock + restockAddedPieces;

  // Handle restock submission
  const handleConfirmRestock = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!activeRestockMed) {
      showToast?.('অনুগ্রহ করে একটি ওষুধ নির্বাচন করুন!', 'error');
      return;
    }
    if (restockAddedPieces <= 0) {
      showToast?.('অনুগ্রহ করে যুক্ত করার সঠিক পরিমাণ লিখুন (কমপক্ষে ১)!', 'error');
      return;
    }

    const res = restockMedicine(activeRestockMed, restockAddedPieces, {
      unitLabel: restockUnitType === 'strip' ? 'পাতা' : 'পিস',
      invoiceNo: restockInvoiceNo,
      supplier: restockSupplier,
      purchasePrice: restockPurchasePrice,
      note: restockNote,
      adminUser: 'yeakub007'
    });

    if (res && res.success) {
      if (res.medicine) {
        setRestockSelectedMed(res.medicine);
      }
      // Keep selected medicine but reset incoming input to ready for next addition
      setRestockAddedQty('');
      setRestockPurchasePrice('');
      setRestockInvoiceNo('');
      setRestockNote('');
    }
  };

  // Quick Inline restock for table rows
  const handleQuickInlineRestock = (med) => {
    const val = parseInt(restockQuickAddInputs[med.id], 10);
    if (!val || val <= 0) {
      showToast?.('অনুগ্রহ করে সংখ্যা লিখুন (যেমন: ১০)!', 'error');
      return;
    }

    restockMedicine(med, val, {
      unitLabel: 'পিস',
      adminUser: 'yeakub007',
      note: 'কুইক স্টক ইন'
    });

    setRestockQuickAddInputs(prev => ({ ...prev, [med.id]: '' }));
  };

  // Filtered Restock Logs History
  const filteredRestockHistory = useMemo(() => {
    if (!Array.isArray(restockLogs)) return [];
    const q = restockHistorySearch.trim().toLowerCase();
    if (!q) return restockLogs;
    return restockLogs.filter(log => {
      const mName = (log.medicineName || '').toLowerCase();
      const mGen = (log.generic || '').toLowerCase();
      const mInv = (log.invoiceNo || '').toLowerCase();
      const mSup = (log.supplier || '').toLowerCase();
      return mName.includes(q) || mGen.includes(q) || mInv.includes(q) || mSup.includes(q);
    });
  }, [restockLogs, restockHistorySearch]);

  const totalRestockHistoryPages = Math.ceil(filteredRestockHistory.length / restockHistoryPerPage) || 1;
  const paginatedRestockHistory = filteredRestockHistory.slice(
    (restockHistoryPage - 1) * restockHistoryPerPage,
    (restockHistoryPage - 1) * restockHistoryPerPage + restockHistoryPerPage
  );

  // ==========================================
  // VIEW 1: DEDICATED ADMIN LOGIN SCREEN
  // ==========================================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b1b44] via-[#123184] to-[#02975E] flex flex-col justify-between p-4 sm:p-6 text-white selection:bg-[#02975E] selection:text-white">
        
        {/* Top bar */}
        <div className="max-w-6xl w-full mx-auto flex justify-between items-center py-2">
          <button
            onClick={() => navigateTo('store')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer backdrop-blur-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>গ্রাহক ওয়েবসাইটে ফিরে যান</span>
          </button>

          <span className="text-xs text-blue-200 hidden sm:inline">
            🔒 সুরক্ষিত অ্যাডমিন গেটওয়ে
          </span>
        </div>

        {/* Center Login Box */}
        <div className="max-w-md w-full mx-auto my-auto bg-white/95 text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md border border-white/40 space-y-6">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-1">
              <div className="logo-animated-wrapper">
                <img 
                  src="/logo.png" 
                  alt="বেলী ফার্মেসি" 
                  className="h-12 w-auto object-contain"
                />
                <span className="logo-animated-shine" aria-hidden="true" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#123184] tracking-tight">
              অ্যাডমিন কন্ট্রোল প্যানেল
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              ফার্মেসি ইনভেন্টরি, অর্ডার ও প্রেসক্রিপশন পরিচালনা পোর্টাল
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Username input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                ব্যবহারকারী নাম (Admin ID)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#123184] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yeakub007"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#123184] focus:ring-4 focus:ring-[#123184]/10 text-sm font-semibold outline-none transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#123184] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#123184] focus:ring-4 focus:ring-[#123184]/10 text-sm font-semibold outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Credentials Info Box */}
            <div 
              onClick={() => {
                setUsername('yeakub007');
                setPassword('1234');
                setLoginError('');
              }}
              className="bg-[#123184]/5 hover:bg-[#123184]/10 border border-[#123184]/15 rounded-2xl p-3 text-xs text-slate-600 space-y-1 cursor-pointer transition-colors"
              title="ক্লিক করে তথ্য পূরণ করুন"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#123184] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#02975E]" />
                  নির্ধারিত লগইন তথ্য:
                </span>
                <span className="text-[10px] text-[#02975E] font-bold bg-[#02975E]/10 px-2 py-0.5 rounded-full">
                  ক্লিক করে অটো-ফিল ⚡
                </span>
              </div>
              <p>ইউজারনেম: <code className="font-mono font-bold text-[#123184] bg-white px-1.5 py-0.5 rounded border border-slate-200">yeakub007</code></p>
              <p>পাসওয়ার্ড: <code className="font-mono font-bold text-[#02975E] bg-white px-1.5 py-0.5 rounded border border-slate-200">1234</code></p>
            </div>

            {/* Submit Button in Brand Navy Blue */}
            <button
              type="submit"
              className="w-full bg-[#123184] hover:bg-[#0d2463] text-white font-extrabold py-3.5 rounded-2xl shadow-xl shadow-[#123184]/30 text-sm transition-all cursor-pointer transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>লগইন করুন</span>
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-blue-200/80 py-2">
          © {new Date().getFullYear()} {config.name} ({config.nameBn}) • ফার্মেসি ম্যানেজমেন্ট সিস্টেম
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: DEDICATED FULL ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-gradient-to-b from-[#0b1b44] via-[#123184] to-[#02975E] text-white flex flex-col justify-between border-r border-white/10 shrink-0 shadow-2xl">
        
        {/* Sidebar Header & Nav */}
        <div>
          {/* Logo container */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="bg-white p-2 rounded-xl shadow-xs">
              <div className="logo-animated-wrapper">
                <img 
                  src="/logo.png" 
                  alt="বেলী ফার্মেসি" 
                  className="h-8 w-auto object-contain"
                />
                <span className="logo-animated-shine" aria-hidden="true" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-[#02975E] to-emerald-400 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'overview' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-300" />
              <span>সামগ্রিক পরিসংখ্যান</span>
            </button>

            <button
              onClick={() => setActiveTab('sell')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'sell' 
                  ? 'bg-gradient-to-r from-emerald-500/35 to-teal-500/30 text-white shadow-md backdrop-blur-xs border border-emerald-400/40 font-bold' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 text-emerald-300" />
                <span>সেল (Sell / POS)</span>
              </span>
              <span className="bg-[#02975E] text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase shadow-xs">
                Sell
              </span>
            </button>

            <button
              onClick={() => setActiveTab('restock')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'restock' 
                  ? 'bg-gradient-to-r from-teal-500/35 to-emerald-500/35 text-white shadow-md backdrop-blur-xs border border-emerald-400/40 font-bold' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <PackagePlus className="w-4 h-4 text-emerald-300" />
                <span>স্টক ইন ও রিস্টক</span>
              </span>
              <span className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider uppercase shadow-xs">
                Stock In
              </span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'orders' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <Package className="w-4 h-4 text-emerald-300" />
                <span>গ্রাহকের অর্ডার</span>
              </span>
              {pendingOrders > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-xs">
                  {pendingOrders}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'prescriptions' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>প্রেসক্রিপশন সমূহ</span>
              </span>
              {pendingRx > 0 && (
                <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-xs">
                  {pendingRx}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'customers' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>গ্রাহক ম্যানেজমেন্ট</span>
            </button>

            <button
              onClick={() => setActiveTab('medicines')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'medicines' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <Pill className="w-4 h-4 text-emerald-300" />
              <span>ওষুধ ক্যাটালগ ও স্টক</span>
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'coupons' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <Tag className="w-4 h-4 text-emerald-300" />
              <span>ডেলিভারি চার্জ ও কুপন কোড</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'ads' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <div className="flex-1 flex items-center justify-between">
                <span>ব্যানার ও অফার বিজ্ঞাপন</span>
                {(adBanner?.isActive || heroBanner?.imageUrl) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="ব্যানার বা বিজ্ঞাপন সক্রিয়" />
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                activeTab === 'settings' 
                  ? 'bg-white/20 text-white shadow-md backdrop-blur-xs border border-white/20' 
                  : 'text-blue-100/80 hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-300" />
              <span>ফার্মেসি সেটিংস ও প্রোফাইল</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Admin Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap justify-between items-center gap-4 sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-black text-[#123184]">
              {activeTab === 'overview' && 'সামগ্রিক ওভারভিউ ও ব্যবসায়িক তথ্য'}
              {activeTab === 'sell' && 'ফার্মেসি সেল ও কাউন্টার বিলিং (Point of Sale - POS)'}
              {activeTab === 'restock' && 'নতুন ওষুধ স্টক ইন ও ইনভেন্টরি বৃদ্ধি (Stock In & Restock)'}
              {activeTab === 'orders' && 'গ্রাহকের অর্ডার ও ডেলিভারি ম্যানেজমেন্ট'}
              {activeTab === 'prescriptions' && 'আপলোডকৃত প্রেসক্রিপশন ও ফার্মাসিস্ট রিভিউ'}
              {activeTab === 'customers' && 'নিবন্ধিত গ্রাহক প্রোফাইল ও কাস্টমার ম্যানেজমেন্ট'}
              {activeTab === 'medicines' && 'ওষুধ ক্যাটালগ ও স্টক পরিচালনা'}
              {activeTab === 'coupons' && 'ডেলিভারি চার্জ ও কুপন কোড ব্যবস্থাপনা'}
              {activeTab === 'ads' && 'হিরো ব্যানার ব্যাকগ্রাউন্ড ও অফার বিজ্ঞাপন কন্ট্রোল'}
              {activeTab === 'settings' && 'ফার্মেসি প্রোফাইল ও কনফিগারেশন'}
            </h1>
            <span className="text-xs text-slate-500">
              বেলী ফার্মেসি ম্যানেজমেন্ট সিস্টেম • রিয়েল-টাইম লাইভ ডাটা
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-none shadow-2xs">
              <div className="w-8 h-8 rounded-none bg-[#02975E] text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                Y
              </div>
              <div className="text-left leading-tight">
                <span className="text-xs font-black text-slate-900 block">
                  Yeakub Ahmed
                </span>
                <span className="text-[10px] text-[#02975E] font-bold font-mono block">
                  @yeakub007 (Admin)
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={adminLogout}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold px-3.5 py-2 rounded-none text-xs transition-colors cursor-pointer shadow-xs"
              title="অ্যাডমিন প্যানেল থেকে লগআউট করুন"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>লগআউট</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 flex-1">
          
          {/* ================================================= */}
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {/* ================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Overview Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                
                <div 
                  onClick={() => setActiveTab('sell')}
                  className="bg-white p-4.5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#123184] hover:shadow-sm transition-all"
                  title="সেল কাউন্টার ও বিক্রির হিসেব দেখতে ক্লিক করুন"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">মোট বিক্রি</span>
                    <span className="p-1.5 rounded-none bg-[#123184]/10 text-[#123184]">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xl font-black text-[#123184]">৳{Number(totalSales || 0).toFixed(2)}</span>
                  <span className="text-[11px] text-[#02975E] font-bold">সেল কাউন্টার &rarr;</span>
                </div>

                <div 
                  onClick={() => setActiveTab('restock')}
                  className="bg-white p-4.5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-teal-500 hover:shadow-sm transition-all"
                  title="নতুন ওষুধ স্টক ইন ও রিস্টক করতে ক্লিক করুন"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">স্টক ইন ও রিস্টক</span>
                    <span className="p-1.5 rounded-none bg-teal-100 text-teal-800">
                      <PackagePlus className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xl font-black text-teal-900">{medicines.length} প্রকার</span>
                  <span className="text-[11px] text-teal-600 font-bold">
                    {lowStockCount > 0 ? `⚠️ ${lowStockCount} টি লো-স্টক` : 'স্টক বৃদ্ধি করুন →'}
                  </span>
                </div>

                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white p-4.5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#123184] hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">নিবন্ধিত গ্রাহক</span>
                    <span className="p-1.5 rounded-none bg-emerald-100 text-[#02975E]">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{consolidatedCustomers.length} জন</span>
                  <span className="text-[11px] text-[#123184] font-bold">ম্যানেজ করুন &rarr;</span>
                </div>

                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-4.5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#02975E] hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">মোট অর্ডার</span>
                    <span className="p-1.5 rounded-none bg-[#02975E]/10 text-[#02975E]">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{orders.length}</span>
                  <span className="text-[11px] text-amber-600 font-bold">{pendingOrders} টি অপেক্ষমান</span>
                </div>

                <div 
                  onClick={() => setActiveTab('prescriptions')}
                  className="bg-white p-4.5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">প্রেসক্রিপশন</span>
                    <span className="p-1.5 rounded-none bg-amber-100 text-amber-800">
                      <FileText className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-xl font-black text-slate-900">{prescriptions.length}</span>
                  <span className="text-[11px] text-rose-600 font-bold">{pendingRx} টি রিভিউ বাকি</span>
                </div>

              </div>

              {/* Quick Actions & Recent Orders Table */}
              <div className="bg-white rounded-none border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    সাম্প্রতিক গ্রাহকের অর্ডারসমূহ
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#123184] hover:underline cursor-pointer"
                  >
                    সকল অর্ডার দেখুন &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2.5 px-3">অর্ডার আইডি</th>
                        <th className="py-2.5 px-3">তারিখ</th>
                        <th className="py-2.5 px-3">গ্রাহকের নাম ও ফোন</th>
                        <th className="py-2.5 px-3">পেমেন্ট মেথড</th>
                        <th className="py-2.5 px-3">মোট মূল্য</th>
                        <th className="py-2.5 px-3">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...orders].sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a)).slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <button
                              type="button"
                              onClick={() => setActiveInvoiceOrder(o)}
                              className="group text-left cursor-pointer transition-all inline-flex items-center gap-1"
                              title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                            >
                              {o.status === 'Pending' ? (
                                <span className="bp-number-lighting text-xs group-hover:underline">
                                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping"></span>
                                  <span>{o.id}</span>
                                </span>
                              ) : (
                                <span className="font-bold text-[#123184] hover:text-[#02975E] underline decoration-dotted underline-offset-2">
                                  {o.id}
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{o.createdAt}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">
                            {(() => {
                              const avatarSrc = o.customerAvatar || customerProfiles?.find(p => p.phone === o.customerPhone)?.avatar || null;
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full ring-1 ring-slate-200 bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                                    {avatarSrc ? (
                                      <img src={avatarSrc} alt={o.customerName} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-[9px] font-black uppercase">
                                        {o.customerName ? o.customerName.slice(0, 1) : <User className="w-3 h-3" />}
                                      </div>
                                    )}
                                  </div>
                                  <span>{o.customerName} <span className="text-slate-400 font-normal">({o.customerPhone})</span></span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="py-2.5 px-3 uppercase font-medium">{o.paymentMethod}</td>
                          <td className="py-2.5 px-3 font-black text-[#123184]">৳{o.grandTotal}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'Delivered' 
                                ? 'bg-[#02975E]/15 text-[#02975E]' 
                                : (o.status === 'Pending' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800')
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* TAB: SELL / POS (DIRECT COUNTER SALE & SALES REPORT) */}
          {/* ================================================= */}
          {activeTab === 'sell' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Sub-Tabs Selector */}
              <div className="bg-white p-3 rounded-none border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSellSubTab('pos')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer ${
                      sellSubTab === 'pos'
                        ? 'bg-[#123184] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>নতুন সেল ও কাউন্টার বিলিং (POS)</span>
                    {sellCart.length > 0 && (
                      <span className="bg-[#02975E] text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                        {sellCart.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setSellSubTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer ${
                      sellSubTab === 'history'
                        ? 'bg-[#123184] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <History className="w-4 h-4" />
                    <span>বিক্রির ইতিহাস ও চালানসমূহ ({completedSales.length})</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>লাইভ পয়েন্ট অব সেল (POS) সিস্টেম</span>
                </div>
              </div>

              {/* SUBTAB 1: POS COUNTER */}
              {sellSubTab === 'pos' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Medicine Catalog & Live Search (7 Cols) */}
                  <div className="lg:col-span-7 space-y-4">
                    
                    {/* Search & Category Header */}
                    <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs space-y-3">
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={sellSearch}
                          onChange={(e) => setSellSearch(e.target.value)}
                          placeholder="ওষুধের নাম, জেনেরিক বা রোগের নাম লিখে খুঁজুন (বাংলা বা English)..."
                          className="w-full pl-9 pr-8 py-2.5 rounded-none border border-slate-200 text-xs outline-none focus:border-[#123184] font-medium"
                        />
                        {sellSearch && (
                          <button
                            type="button"
                            onClick={() => setSellSearch('')}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isSellMedexLoading && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                            লাইভ ডাটাবেজ খুঁজছে...
                          </span>
                        </div>
                      )}

                      {/* Category Badges */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
                        <button
                          onClick={() => setSellCategory('all')}
                          className={`px-3 py-1 rounded-none shrink-0 font-semibold cursor-pointer transition-colors ${
                            sellCategory === 'all'
                              ? 'bg-[#02975E] text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সকল ({medicines.length})
                        </button>
                        {CATEGORIES.slice(0, 10).map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => setSellCategory(cat.name)}
                            className={`px-3 py-1 rounded-none shrink-0 font-semibold cursor-pointer transition-colors ${
                              sellCategory === cat.name
                                ? 'bg-[#02975E] text-white font-bold'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Medicines List Grid */}
                    <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700">
                          ওষুধের তালিকা (মোট <strong className="text-[#123184]">{filteredSellMedicines.length}</strong> টি ওষুধ পাওয়া গেছে)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          পেজ {sellMedPage} / {totalSellMedPages}
                        </span>
                      </div>

                      {filteredSellMedicines.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                          কোনো ওষুধ পাওয়া যায়নি। অন্য নাম লিখে সার্চ করুন।
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[520px] overflow-y-auto pr-1">
                          {paginatedSellMedicines.map(med => {
                            const inCart = sellCart.find(it => it.id === med.id);
                            const stock = typeof med.stock === 'number' ? med.stock : 100;
                            const isOutOfStock = stock <= 0;
                            const unitPrice = getSellUnitPrice(med);
                            const medCompany = (med.manufacturer || med.company || 'বাংলাদেশ ফার্মাসিউটিক্যালস').replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস');
                            const medUnit = getSellUnitLabel(med);

                            return (
                              <div
                                key={med.id}
                                className={`p-3 border rounded-none flex flex-col justify-between transition-all ${
                                  inCart
                                    ? 'border-[#02975E] bg-emerald-50/40 shadow-xs'
                                    : 'border-slate-200 hover:border-[#123184]/40 bg-white'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-1">
                                    <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                                      {med.name}
                                    </h4>
                                    <div className="text-right shrink-0">
                                      <span className="font-black text-xs text-[#123184]">
                                        ৳{unitPrice.toFixed(2)}
                                      </span>
                                      <span className="text-[10px] text-slate-500 block font-normal">
                                        / {medUnit}
                                      </span>
                                      {med.stripSize > 1 && med.pricePerStrip ? (
                                        <span className="text-[9px] text-slate-400 block font-medium">
                                          (পাতা: ৳{med.pricePerStrip})
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>

                                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                                    {med.generic || med.category} • {medCompany}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    isOutOfStock 
                                      ? 'bg-rose-100 text-rose-700' 
                                      : (stock <= 10 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                                  }`}>
                                    {isOutOfStock ? 'স্টক আউট' : `স্টক: ${stock} ${medUnit}`}
                                  </span>

                                  <button
                                    type="button"
                                    disabled={isOutOfStock}
                                    onClick={() => addToSellCart(med)}
                                    className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                      isOutOfStock
                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                        : (inCart 
                                            ? 'bg-[#02975E] text-white hover:bg-[#027e4e]' 
                                            : 'bg-[#123184] text-white hover:bg-[#0d2463]')
                                    }`}
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>{inCart ? `কার্টে (${inCart.quantity})` : 'যোগ করুন'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* POS Pagination Controls */}
                      {totalSellMedPages > 1 && (
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 mt-3 text-xs">
                          <span className="text-slate-500 text-[11px]">
                            পেজ <strong>{sellMedPage}</strong> / <strong>{totalSellMedPages}</strong> (মোট <strong>{filteredSellMedicines.length}</strong> টি)
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={sellMedPage === 1}
                              onClick={() => setSellMedPage(p => Math.max(1, p - 1))}
                              className="px-2 py-1 border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer text-xs font-bold"
                            >
                              পূর্ববর্তী
                            </button>
                            {getVisiblePages(sellMedPage, totalSellMedPages).map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                disabled={p === '...'}
                                onClick={() => typeof p === 'number' && setSellMedPage(p)}
                                className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                                  p === sellMedPage
                                    ? 'bg-[#123184] text-white shadow-xs'
                                    : p === '...'
                                    ? 'text-slate-400 cursor-default'
                                    : 'text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                            <button
                              type="button"
                              disabled={sellMedPage === totalSellMedPages}
                              onClick={() => setSellMedPage(p => Math.min(totalSellMedPages, p + 1))}
                              className="px-2 py-1 border border-slate-200 rounded text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer text-xs font-bold"
                            >
                              পরবর্তী
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Column: Billing Slip & Checkout (5 Cols) */}
                  <div className="lg:col-span-5 bg-white p-5 rounded-none border-2 border-[#123184] shadow-md space-y-4 sticky top-16">
                    
                    {/* Bill Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#02975E] bg-emerald-50 px-2 py-0.5 rounded">
                          কাউন্টার ক্যাশ মেমো
                        </span>
                        <h3 className="font-black text-sm text-[#123184] mt-1">
                          বিক্রয় ও রশিদ তৈরি
                        </h3>
                      </div>
                      {sellCart.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSellCart}
                          className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>খালি করুন</span>
                        </button>
                      )}
                    </div>

                    {/* Customer Selection */}
                    <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">গ্রাহকের ধরন:</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setSellCustomerType('walkin');
                              setSellCustomerName('কাউন্টার কাস্টমার');
                              setSellCustomerPhone('');
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              sellCustomerType === 'walkin'
                                ? 'bg-[#123184] text-white'
                                : 'bg-white border text-slate-600'
                            }`}
                          >
                            কাউন্টার (Walk-in)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSellCustomerType('existing')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              sellCustomerType === 'existing'
                                ? 'bg-[#123184] text-white'
                                : 'bg-white border text-slate-600'
                            }`}
                          >
                            নিবন্ধিত গ্রাহক
                          </button>
                        </div>
                      </div>

                      {sellCustomerType === 'existing' ? (
                        <div>
                          <label className="text-[11px] text-slate-500 font-semibold block mb-1">গ্রাহক নির্বাচন করুন:</label>
                          <select
                            onChange={(e) => {
                              const selected = consolidatedCustomers.find(c => c.phone === e.target.value);
                              if (selected) {
                                setSellCustomerName(selected.name);
                                setSellCustomerPhone(selected.phone);
                              }
                            }}
                            className="w-full p-2 border border-slate-300 rounded-none bg-white text-xs outline-none"
                          >
                            <option value="">-- কাস্টমার বাছাই করুন --</option>
                            {consolidatedCustomers.map(c => (
                              <option key={c.phone} value={c.phone}>
                                {c.name} ({c.phone})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] text-slate-500 font-semibold block mb-1">গ্রাহকের নাম:</label>
                            <input
                              type="text"
                              value={sellCustomerName}
                              onChange={(e) => setSellCustomerName(e.target.value)}
                              placeholder="কাউন্টার কাস্টমার"
                              className="w-full p-1.5 border border-slate-300 rounded-none bg-white text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-500 font-semibold block mb-1">মোবাইল (ঐচ্ছিক):</label>
                            <input
                              type="text"
                              value={sellCustomerPhone}
                              onChange={(e) => setSellCustomerPhone(e.target.value)}
                              placeholder="017xxxxxxxx"
                              className="w-full p-1.5 border border-slate-300 rounded-none bg-white text-xs outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>নির্বাচিত ওষুধ ({sellCart.length} টি)</span>
                        <span>সাবটোটাল</span>
                      </div>

                      {sellCart.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 text-xs">
                          <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                          <span>বামপাশ থেকে ওষুধ সিলেক্ট করে কার্টে যোগ করুন</span>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 p-2">
                          {sellCart.map(item => (
                            <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 truncate">{item.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  ৳{Number(item.price).toFixed(2)} × {item.quantity || 0} {item.unitLabel}
                                </div>
                              </div>

                              <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateSellCartQty(item.id, (Number(item.quantity) || 1) - 1)}
                                  className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                  title="পরিমাণ ১ কমান"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={typeof item.stock === 'number' ? item.stock : 9999}
                                  value={item.quantity === '' ? '' : item.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      updateSellCartQty(item.id, '');
                                    } else {
                                      const num = parseInt(val, 10);
                                      if (!isNaN(num)) {
                                        updateSellCartQty(item.id, num);
                                      }
                                    }
                                  }}
                                  onBlur={() => {
                                    if (!item.quantity || Number(item.quantity) < 1) {
                                      updateSellCartQty(item.id, 1);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') e.currentTarget.blur();
                                  }}
                                  className="w-12 h-6 text-center font-black text-slate-900 bg-white text-xs outline-none border-x border-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-emerald-50"
                                  title="সরাসরি পরিমাণ টাইপ করুন"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateSellCartQty(item.id, (Number(item.quantity) || 0) + 1)}
                                  className="w-6 h-6 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                                  title="পরিমাণ ১ বাড়ান"
                                >
                                  +
                                </button>
                              </div>

                              <div className="font-extrabold text-[#123184] text-right w-16">
                                ৳{(item.price * (Number(item.quantity) || 0)).toFixed(2)}
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromSellCart(item.id)}
                                className="text-slate-400 hover:text-rose-600 cursor-pointer ml-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Discount & Calculation */}
                    <div className="bg-slate-50 p-3 rounded-none border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>মোট মূল্য (Subtotal):</span>
                        <span className="font-bold">৳{sellSubtotal.toFixed(2)}</span>
                      </div>

                      {/* Discount Input */}
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
                        <span className="text-slate-600 font-semibold">ছাড় / ডিসকাউন্ট:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={sellDiscountValue}
                            onChange={(e) => setSellDiscountValue(e.target.value)}
                            placeholder="0"
                            className="w-16 p-1 text-right border border-slate-300 rounded-none bg-white font-bold outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setSellDiscountType(sellDiscountType === 'fixed' ? 'percent' : 'fixed')}
                            className="px-1.5 py-1 rounded bg-slate-200 text-slate-700 font-black text-[10px] cursor-pointer"
                            title="টাকা বা শতাংশ পরিবর্তন করুন"
                          >
                            {sellDiscountType === 'fixed' ? '৳ টাকা' : '% শতাংশ'}
                          </button>
                        </div>
                      </div>

                      {sellDiscountAmount > 0 && (
                        <div className="flex justify-between items-center text-emerald-700 font-bold text-[11px]">
                          <span>মোট ছাড়:</span>
                          <span>-৳{sellDiscountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* Grand Total */}
                      <div className="flex justify-between items-center pt-2 border-t-2 border-slate-300">
                        <span className="text-sm font-black text-slate-900">সর্বমোট প্রদেয় বিল:</span>
                        <span className="text-xl font-black text-[#123184]">
                          ৳{sellGrandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-700 block">পেমেন্ট মাধ্যম:</span>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {[
                          { id: 'Cash on Hand', label: '💵 নগদ (Cash)' },
                          { id: 'bKash', label: '📱 bKash' },
                          { id: 'Nagad', label: '📱 Nagad' }
                        ].map(pm => (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setSellPaymentMethod(pm.id)}
                            className={`py-2 px-1 rounded-none text-center font-bold cursor-pointer transition-colors ${
                              sellPaymentMethod === pm.id
                                ? 'bg-[#02975E] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {pm.label}
                          </button>
                        ))}
                      </div>

                      {/* If Cash on Hand: Change calculator with full-width amount input box */}
                      {sellPaymentMethod === 'Cash on Hand' && (
                        <div className="bg-emerald-50/70 p-3 rounded-none border-2 border-emerald-300 space-y-2 text-xs">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                <Banknote className="w-4 h-4 text-[#02975E]" />
                                <span>কাস্টমার থেকে প্রাপ্ত ক্যাশ (Amount):</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => setSellReceivedAmount(sellGrandTotal.toString())}
                                className="text-[11px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold cursor-pointer border border-emerald-300 transition-colors"
                                title="বিল সমপরিমাণ ক্যাশ বসান"
                              >
                                সমান বিল (৳{sellGrandTotal.toFixed(0)})
                              </button>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-base font-black text-slate-400">৳</span>
                              <input
                                type="number"
                                min="0"
                                value={sellReceivedAmount}
                                onChange={(e) => setSellReceivedAmount(e.target.value)}
                                placeholder={`ক্যাশ টাকা টাইপ করুন (যেমন: ${sellGrandTotal || 500})`}
                                className="w-full pl-8 pr-3 py-2 border border-emerald-400 rounded-none bg-white font-black text-slate-900 text-base outline-none focus:ring-2 focus:ring-[#02975E]/30"
                              />
                            </div>
                          </div>

                          {/* Quick note buttons */}
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[10px] text-slate-500 font-semibold mr-1">কুইক নোট:</span>
                            {[50, 100, 200, 500, 1000].map(amt => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() => setSellReceivedAmount(amt.toString())}
                                className="text-[10px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-300 px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors"
                              >
                                ৳{amt}
                              </button>
                            ))}
                          </div>

                          {sellChangeDue > 0 && (
                            <div className="flex justify-between items-center bg-emerald-100/90 border border-emerald-300 p-2 rounded-none text-xs font-black text-emerald-900">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                <span>কাস্টমারকে ফেরত দিন (Change):</span>
                              </span>
                              <span className="text-base text-[#02975E]">৳{sellChangeDue.toFixed(2)}</span>
                            </div>
                          )}
                          {sellDueAmount > 0 && (
                            <div className="flex justify-between items-center bg-amber-100 border border-amber-300 p-2 rounded-none text-xs font-black text-amber-900">
                              <span className="flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 text-amber-700" />
                                <span>বাকি রয়েছে (Due):</span>
                              </span>
                              <span className="text-base text-amber-700">৳{sellDueAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* If bKash or Nagad: TrxId */}
                      {sellPaymentMethod !== 'Cash on Hand' && (
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-600 block">ট্রানজেকশন আইডি (TrxID - ঐচ্ছিক):</label>
                          <input
                            type="text"
                            value={sellTrxId}
                            onChange={(e) => setSellTrxId(e.target.value)}
                            placeholder="যেমন: 9J37X..."
                            className="w-full p-1.5 border border-slate-300 rounded-none bg-white text-xs outline-none uppercase font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Complete Sale Action Button */}
                    <button
                      type="button"
                      disabled={sellCart.length === 0}
                      onClick={handleCompleteSell}
                      className={`w-full py-3.5 px-4 rounded-none font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                        sellCart.length === 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-[#123184] via-[#02975E] to-[#027e4e] text-white hover:opacity-95 shadow-[#02975E]/30 transform hover:-translate-y-0.5'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                      <span>বিক্রি সম্পন্ন করুন ও ক্যাশ মেমো প্রিন্ট করুন</span>
                    </button>

                  </div>

                </div>
              )}

              {/* SUBTAB 2: SALES HISTORY & INVOICES */}
              {sellSubTab === 'history' && (
                <div className="space-y-4">
                  
                  {/* Filters & Search */}
                  <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
                    <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                      {[
                        { id: 'all', label: 'সকল বিক্রয়' },
                        { id: 'today', label: 'আজকের বিক্রি' },
                        { id: 'counter', label: 'শুধু কাউন্টার সেল' },
                        { id: 'online', label: 'অনলাইন অর্ডার' }
                      ].map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setSellHistoryFilter(f.id);
                            setSellHistoryPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-none cursor-pointer transition-colors ${
                            sellHistoryFilter === f.id
                              ? 'bg-[#123184] text-white font-bold'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={sellHistorySearch}
                        onChange={(e) => {
                          setSellHistorySearch(e.target.value);
                          setSellHistoryPage(1);
                        }}
                        placeholder="চালান নং, নাম বা ফোন..."
                        className="pl-9 pr-3 py-1.5 rounded-none border border-slate-200 text-xs outline-none focus:border-[#123184]"
                      />
                    </div>
                  </div>

                  {/* Sales History Table */}
                  <div className="bg-white rounded-none border border-slate-200 shadow-xs overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                          <th className="py-3 px-4">চালান নং / আইডি</th>
                          <th className="py-3 px-4">তারিখ ও সময়</th>
                          <th className="py-3 px-4">গ্রাহক</th>
                          <th className="py-3 px-4">বিক্রির ধরন</th>
                          <th className="py-3 px-4">ওষুধের তালিকা</th>
                          <th className="py-3 px-4">পেমেন্ট</th>
                          <th className="py-3 px-4">মোট বিল</th>
                          <th className="py-3 px-4 text-right">ক্যাশ মেমো</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedSalesHistory.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400">
                              কোনো বিক্রির রেকর্ড পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          paginatedSalesHistory.map(sale => {
                            const isCounter = sale.isCounterSale || sale.deliveryAddress?.includes('কাউন্টার');
                            return (
                              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4">
                                  <button
                                    type="button"
                                    onClick={() => setActiveInvoiceOrder(sale)}
                                    className="font-bold text-[#123184] hover:text-[#02975E] hover:underline decoration-dotted font-mono cursor-pointer"
                                    title="ইনভয়েস দেখতে ক্লিক করুন"
                                  >
                                    {sale.id}
                                  </button>
                                </td>
                                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                                  {sale.createdAt}
                                </td>
                                <td className="py-3 px-4 font-semibold text-slate-800">
                                  <div>{sale.customerName}</div>
                                  {sale.customerPhone && sale.customerPhone !== 'N/A' && (
                                    <div className="text-[11px] text-slate-400 font-normal">{sale.customerPhone}</div>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    isCounter 
                                      ? 'bg-emerald-100 text-emerald-800' 
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {isCounter ? 'কাউন্টার সেল' : 'অনলাইন ডেলিভারি'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 max-w-xs">
                                  <div className="truncate text-slate-700" title={Array.isArray(sale.items) ? sale.items.map(it => `${it.name} (x${it.quantity})`).join(', ') : ''}>
                                    {Array.isArray(sale.items) ? sale.items.map(it => `${it.name} (x${it.quantity})`).join(', ') : 'তথ্য নেই'}
                                  </div>
                                </td>
                                <td className="py-3 px-4 uppercase font-semibold text-slate-700">
                                  {sale.paymentMethod || 'Cash'}
                                </td>
                                <td className="py-3 px-4 font-black text-slate-900 whitespace-nowrap">
                                  ৳{Number(sale.grandTotal || 0).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => setActiveInvoiceOrder(sale)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#123184] hover:bg-[#0d2463] text-white font-bold text-[11px] cursor-pointer shadow-xs transition-colors"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>চালান</span>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalSellHistoryPages > 1 && (
                    <div className="flex justify-between items-center bg-white p-3 border border-slate-200">
                      <span className="text-xs text-slate-500">
                        মোট {filteredSalesHistory.length} টির মধ্যে {(sellHistoryPage - 1) * sellHistoryPerPage + 1} - {Math.min(sellHistoryPage * sellHistoryPerPage, filteredSalesHistory.length)} দেখানো হচ্ছে
                      </span>
                      <div className="flex gap-1 text-xs">
                        <button
                          disabled={sellHistoryPage === 1}
                          onClick={() => setSellHistoryPage(p => Math.max(1, p - 1))}
                          className="px-2.5 py-1 border rounded disabled:opacity-40 cursor-pointer"
                        >
                          পূর্ববর্তী
                        </button>
                        <span className="px-3 py-1 font-bold text-[#123184]">
                          {sellHistoryPage} / {totalSellHistoryPages}
                        </span>
                        <button
                          disabled={sellHistoryPage === totalSellHistoryPages}
                          onClick={() => setSellHistoryPage(p => Math.min(totalSellHistoryPages, p + 1))}
                          className="px-2.5 py-1 border rounded disabled:opacity-40 cursor-pointer"
                        >
                          পরবর্তী
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* TAB: STOCK IN & INVENTORY RESTOCK */}
          {/* ================================================= */}
          {activeTab === 'restock' && (
            <div className="space-y-6">
              
              {/* Top Banner / Info Bar */}
              <div className="bg-gradient-to-r from-[#123184] via-[#0d2463] to-[#02975E] text-white p-5 sm:p-6 rounded-none shadow-md flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-emerald-300 shadow-xs">
                      <PackagePlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black tracking-tight">
                        ওষুধ স্টক ইন ও ইনভেন্টরি এন্ট্রি (Stock In & Restock)
                      </h2>
                      <p className="text-xs text-blue-100 font-medium">
                        ওষুধের নাম লিখে সার্চ করুন এবং নতুন আসা সংখ্যা যোগ করে সরাসরি ইনভেন্টরি স্টক বৃদ্ধি করুন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Workspace 2-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ======================================================== */}
                {/* COLUMN 1: MEDICINE SEARCH & SELECTION (lg:col-span-5) */}
                {/* ======================================================== */}
                <div className="lg:col-span-5 bg-white border border-slate-200 shadow-xs rounded-none p-4 sm:p-5 space-y-4">
                  
                  {/* Card Title */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#123184]/10 text-[#123184] flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900">
                          ১. ওষুধ সার্চ ও নির্বাচন করুন
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          নাম, জেনেরিক বা প্রস্তুতকারক দিয়ে খুঁজুন
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#02975E] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ৫০,০০০+ ডাটাবেজ
                    </span>
                  </div>

                  {/* Search Input Box */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={restockSearch}
                        onChange={(e) => setRestockSearch(e.target.value)}
                        placeholder="ওষুধের নাম লিখুন (যেমন: Napa, Maxpro, Seclo, নাপা)..."
                        className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/15 outline-none text-xs font-bold text-slate-900 rounded-none transition-all placeholder:text-slate-400"
                      />
                      {restockSearch && (
                        <button
                          type="button"
                          onClick={() => setRestockSearch('')}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Live MedEx Search Alert */}
                    {isRestockMedexLoading && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#02975E] bg-emerald-50 px-2.5 py-1 border border-emerald-100 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#02975E] animate-ping" />
                        <span>লাইভ বাংলাদেশ ড্রাগ ডাটাবেজ থেকে খোঁজা হচ্ছে...</span>
                      </div>
                    )}
                  </div>

                  {/* Medicines Search Results List */}
                  <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                    {paginatedRestockMedicines.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-2">
                        <Pill className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700">কোনো ওষুধ খুঁজে পাওয়া যায়নি</p>
                        <p className="text-[11px]">অন্য কোনো নাম বা জেনেরিক লিখে সার্চ করার চেষ্টা করুন।</p>
                      </div>
                    ) : (
                      paginatedRestockMedicines.map((med) => {
                        const isSelected = activeRestockMed?.id === med.id;
                        const stockCount = typeof med.stock === 'number' ? med.stock : 100;
                        const isLow = stockCount <= 15 && stockCount > 0;
                        const isOut = stockCount === 0;

                        return (
                          <div
                            key={med.id}
                            onClick={() => {
                              setRestockSelectedMed(med);
                              // Default incoming quantity
                              if (!restockAddedQty || restockAddedQty === '0') setRestockAddedQty('10');
                            }}
                            className={`p-3 border transition-all cursor-pointer flex items-center justify-between gap-3 text-left ${
                              isSelected
                                ? 'bg-emerald-50/80 border-[#02975E] shadow-sm ring-2 ring-[#02975E]/20'
                                : 'bg-white border-slate-200 hover:border-[#123184] hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                {med.image ? (
                                  <img src={med.image} alt={med.name} className="w-full h-full object-contain" />
                                ) : (
                                  <Pill className="w-5 h-5 text-slate-400" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-extrabold text-xs text-slate-900 truncate">
                                    {med.name}
                                  </h4>
                                  {med.nameBn && med.nameBn !== med.name && (
                                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded font-medium border border-emerald-100 truncate">
                                      {med.nameBn}
                                    </span>
                                  )}
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono font-bold">
                                    {med.type || 'Tablet'}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {med.generic} • <span className="text-slate-700 font-semibold">{med.company}</span>
                                </p>

                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-[#123184] font-bold">
                                    ৳{med.pricePerStrip || med.price || 0} / পাতা
                                  </span>
                                  {med.stripSize && (
                                    <span className="text-[10px] text-slate-400">
                                      ({med.stripSize} টি/পাতা)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Stock Status Badge & Action */}
                            <div className="text-right shrink-0 space-y-1">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block ${
                                  isOut
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {isOut ? '০ পিস (শূন্য)' : `${stockCount} পিস`}
                              </span>

                              <div>
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-1 rounded inline-flex items-center gap-1 transition-all ${
                                    isSelected
                                      ? 'bg-[#02975E] text-white shadow-xs'
                                      : 'bg-slate-100 hover:bg-[#123184] hover:text-white text-slate-700'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>নির্বাচিত</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>রিস্টক</span>
                                      <ChevronRight className="w-3 h-3" />
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pagination for Search Column */}
                  {totalRestockMedPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-500">
                        পেজ {restockMedPage} / {totalRestockMedPages} ({filteredRestockMedicines.length} টি)
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={restockMedPage === 1}
                          onClick={() => setRestockMedPage(p => Math.max(1, p - 1))}
                          className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 cursor-pointer text-xs"
                        >
                          পূর্ববর্তী
                        </button>
                        <button
                          type="button"
                          disabled={restockMedPage === totalRestockMedPages}
                          onClick={() => setRestockMedPage(p => Math.min(totalRestockMedPages, p + 1))}
                          className="px-2 py-1 border border-slate-200 rounded disabled:opacity-40 cursor-pointer text-xs"
                        >
                          পরবর্তী
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* ======================================================== */}
                {/* COLUMN 2: ACTIVE RESTOCK WORKSPACE & CALCULATION (7 cols) */}
                {/* ======================================================== */}
                <div className="lg:col-span-7 bg-white border border-slate-200 shadow-xs rounded-none p-4 sm:p-6 space-y-5">
                  
                  {/* Card Title */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                        <PackagePlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          ২. স্টক বৃদ্ধি ও লাইভ যোগফল
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          নতুন আসা সংখ্যা লিখুন — আগের স্টকের সাথে স্বয়ংক্রিয়ভাবে যোগ হয়ে স্টক বৃদ্ধি পাবে
                        </p>
                      </div>
                    </div>

                    {activeRestockMed && (
                      <button
                        type="button"
                        onClick={() => setRestockSelectedMed(null)}
                        className="text-xs text-slate-400 hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>ক্লিয়ার</span>
                      </button>
                    )}
                  </div>

                  {!activeRestockMed ? (
                    /* Empty State: Prompt user to select medicine */
                    <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto shadow-xs">
                        <Boxes className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 max-w-md mx-auto">
                        <h4 className="font-black text-base text-slate-800">
                          ওষুধ নির্বাচন করুন
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          বাম পাশের সার্চ বক্স থেকে ওষুধের নাম লিখে ওষুধটি নির্বাচন করুন। এরপর নতুন আনা সংখ্যা দিলেই আগের স্টকের সাথে যোগ হয়ে স্বয়ংক্রিয়ভাবে স্টক আপডেট হবে।
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Active Restock Workspace Form */
                    <form onSubmit={handleConfirmRestock} className="space-y-5 animate-in fade-in duration-200">
                      
                      {/* Selected Medicine Info Banner */}
                      <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-emerald-50/50 border border-slate-200 p-4 rounded-xl flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1.5 shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
                          {activeRestockMed.image ? (
                            <img src={activeRestockMed.image} alt={activeRestockMed.name} className="w-full h-full object-contain" />
                          ) : (
                            <Pill className="w-8 h-8 text-[#02975E]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <h3 className="font-black text-base text-[#123184]">
                              {activeRestockMed.name}
                            </h3>
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#123184] text-white">
                              আইডি: #{activeRestockMed.id}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium mt-0.5">
                            {activeRestockMed.generic} • <strong className="text-slate-800">{activeRestockMed.company}</strong>
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                            <span className="bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                              ধরণ: {activeRestockMed.type || 'Tablet'}
                            </span>
                            <span className="bg-white border border-slate-200 px-2 py-0.5 font-bold text-slate-700">
                              পাতা প্রতি: {activeRestockMed.stripSize || 10} পিস
                            </span>
                            <span className="bg-white border border-slate-200 px-2 py-0.5 font-bold text-[#02975E]">
                              মূল্য: ৳{activeRestockMed.pricePerStrip || 0} / পাতা
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Input Section: Unit Type & Incoming Count */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        
                        {/* Unit Type Selection */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            নতুন আসা ওষুধের একক (Unit)
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRestockUnitType('piece')}
                              className={`py-2 px-3 text-xs font-black transition-all border cursor-pointer text-center ${
                                restockUnitType === 'piece'
                                  ? 'bg-[#123184] text-white border-[#123184] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              ট্যাবলেট / পিস (Pcs)
                            </button>
                            <button
                              type="button"
                              onClick={() => setRestockUnitType('strip')}
                              className={`py-2 px-3 text-xs font-black transition-all border cursor-pointer text-center ${
                                restockUnitType === 'strip'
                                  ? 'bg-[#02975E] text-white border-[#02975E] shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              পাতা / বক্স (Strip)
                            </button>
                          </div>
                          <span className="text-[10px] text-slate-500 block">
                            {restockUnitType === 'strip' 
                              ? `১ পাতা = ${activeRestockMed.stripSize || 10} পিস হিসাবে স্বয়ংক্রিয়ভাবে হিসাব হবে`
                              : 'সরাসরি পিস বা ট্যাবলেটের সংখ্যা লিখুন'}
                          </span>
                        </div>

                        {/* Incoming Quantity Input */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>নতুন আসা ওষুধের সংখ্যা (Incoming Qty) *</span>
                            <span className="text-[#02975E] font-bold text-[11px]">
                              {restockUnitType === 'strip' ? 'পাতার সংখ্যা' : 'পিসের সংখ্যা'}
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              required
                              value={restockAddedQty}
                              onChange={(e) => setRestockAddedQty(e.target.value)}
                              placeholder="যেমন: 10"
                              className="w-full px-3.5 py-2.5 bg-white border-2 border-[#02975E] focus:border-[#123184] outline-none text-base font-black text-slate-900 transition-colors shadow-2xs"
                            />
                            <div className="absolute right-2 top-2 flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setRestockAddedQty(q => String(Math.max(1, (parseInt(q, 10) || 0) - 1)))}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center text-xs cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => setRestockAddedQty(q => String((parseInt(q, 10) || 0) + 1))}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center justify-center text-xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Quick Quantity Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-500 mr-1">
                          ক্লিক করে পূরণ করুন:
                        </span>
                        {[
                          { val: 5, label: '+৫' },
                          { val: 10, label: '+১০' },
                          { val: 20, label: '+২০' },
                          { val: 50, label: '+৫০' },
                          { val: 100, label: '+১০০' },
                          { val: 200, label: '+২০০' },
                          { val: 500, label: '+৫০০' }
                        ].map(chip => (
                          <button
                            key={chip.val}
                            type="button"
                            onClick={() => setRestockAddedQty(String(chip.val))}
                            className={`px-2.5 py-1 text-xs font-black transition-all cursor-pointer border ${
                              restockAddedQty === String(chip.val)
                                ? 'bg-[#02975E] text-white border-[#02975E] shadow-xs'
                                : 'bg-slate-100 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 border-slate-200'
                            }`}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      {/* ======================================================== */}
                      {/* REAL-TIME VISUAL MATH EQUATION: CURRENT + ADDED = FINAL  */}
                      {/* ======================================================== */}
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border-2 border-emerald-400 p-4 sm:p-5 rounded-2xl shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                            <TrendingUp className="w-4 h-4 text-[#02975E]" />
                            লাইভ স্টক ক্যালকুলেশন প্রিভিউ (Live Stock Preview)
                          </span>
                          <span className="text-[11px] font-bold bg-[#02975E] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                            স্বয়ংক্রিয় যোগফল
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 items-center text-center gap-2">
                          
                          {/* 1. CURRENT STOCK */}
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                            <span className="block text-[10px] text-slate-500 font-bold mb-0.5">
                              পূর্বের স্টক (Current)
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-slate-800">
                              {restockCurrentStock}
                            </span>
                            <span className="text-[10px] text-slate-500 block font-medium">পিস</span>
                          </div>

                          {/* Plus sign */}
                          <div className="flex justify-center text-emerald-600 font-black text-2xl sm:text-3xl">
                            +
                          </div>

                          {/* 2. INCOMING / ADDED STOCK */}
                          <div className="bg-emerald-100/80 p-3 rounded-xl border-2 border-emerald-400 shadow-xs">
                            <span className="block text-[10px] text-emerald-800 font-bold mb-0.5">
                              নতুন আগমন (Added)
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-[#02975E]">
                              +{restockAddedPieces}
                            </span>
                            <span className="text-[10px] text-emerald-700 block font-medium">
                              {restockUnitType === 'strip' ? `${restockAddedQty || 0} পাতা (${restockAddedPieces} পিস)` : 'পিস'}
                            </span>
                          </div>

                          {/* Equal sign */}
                          <div className="flex justify-center text-[#123184] font-black text-2xl sm:text-3xl">
                            =
                          </div>

                          {/* 3. NEW TOTAL RESULTING STOCK */}
                          <div className="col-span-3 sm:col-span-1 bg-gradient-to-br from-[#123184] to-[#02975E] text-white p-3 rounded-xl shadow-md border-2 border-emerald-400">
                            <span className="block text-[10px] text-emerald-200 font-bold mb-0.5">
                              আপডেটের পর মোট স্টক
                            </span>
                            <span className="text-2xl sm:text-3xl font-black tracking-tight">
                              {restockResultingStock}
                            </span>
                            <span className="text-[10px] text-emerald-200 block font-medium">
                              পিস (ইনভেন্টরি)
                            </span>
                          </div>

                        </div>

                        <div className="text-[11px] text-slate-600 bg-white/70 p-2 rounded-lg border border-emerald-200/50 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#02975E] shrink-0" />
                          <span>
                            নিশ্চিত করার পর <strong>{activeRestockMed.name}</strong>-এর স্টক সরাসরি <strong>{restockCurrentStock}</strong> থেকে বৃদ্ধি পেয়ে <strong>{restockResultingStock} পিস</strong> হবে।
                          </span>
                        </div>
                      </div>

                      {/* Optional Purchase / Supplier Details (Collapsible or 2x2 grid) */}
                      <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-3">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                          অতিরিক্ত তথ্য (ঐচ্ছিক / সুবিধার্থে):
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              ক্রয়মূল্য (টাকা / পিস)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={restockPurchasePrice}
                              onChange={(e) => setRestockPurchasePrice(e.target.value)}
                              placeholder="যেমন: ৪.৫০"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-xs font-semibold outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              চালান / ভাউচার নং
                            </label>
                            <input
                              type="text"
                              value={restockInvoiceNo}
                              onChange={(e) => setRestockInvoiceNo(e.target.value)}
                              placeholder="যেমন: INV-9281"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-xs font-semibold outline-none uppercase font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                              সরবরাহকারী / ডিলার
                            </label>
                            <input
                              type="text"
                              value={restockSupplier}
                              onChange={(e) => setRestockSupplier(e.target.value)}
                              placeholder="যেমন: স্কয়ার ডিপো"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-xs font-semibold outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Button: Confirm & Save */}
                      <button
                        type="submit"
                        disabled={restockAddedPieces <= 0}
                        className={`w-full py-4 px-6 font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                          restockAddedPieces <= 0
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-[#02975E] via-emerald-600 to-[#123184] hover:opacity-95 text-white shadow-emerald-500/30 transform hover:-translate-y-0.5'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>✓ নতুন স্টক নিশ্চিত ও ইনভেন্টরিতে সেভ করুন ({restockResultingStock} পিস)</span>
                      </button>

                    </form>
                  )}

                </div>

              </div>

              {/* ======================================================== */}
              {/* SECTION 3: RECENT RESTOCK HISTORY & AUDIT LOGS           */}
              {/* ======================================================== */}
              <div className="bg-white border border-slate-200 shadow-xs p-5 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        সাম্প্রতিক স্টক ইন হিস্টোরি ও লগ (Recent Restock History)
                      </h3>
                      <p className="text-xs text-slate-500">
                        কখন কোন ওষুধের স্টক কত বাড়ানো হয়েছিল তার পূর্ণ বিবরণ
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={restockHistorySearch}
                        onChange={(e) => setRestockHistorySearch(e.target.value)}
                        placeholder="হিস্টোরি সার্চ..."
                        className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 text-xs outline-none focus:bg-white focus:border-[#123184]"
                      />
                    </div>

                    {restockLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('আপনি কি সকল স্টক ইন হিস্টোরি মুছে ফেলতে চান?')) {
                            clearRestockLogs();
                          }
                        }}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        লগ মুছুন
                      </button>
                    )}
                  </div>
                </div>

                {/* History Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">তারিখ ও সময়</th>
                        <th className="p-3">ওষুধের নাম ও কোম্পানি</th>
                        <th className="p-3 text-center">আগের স্টক</th>
                        <th className="p-3 text-center">নতুন যোগ</th>
                        <th className="p-3 text-center">আপডেটের পর মোট</th>
                        <th className="p-3">চালান / নোট</th>
                        <th className="p-3 text-right">ব্যবহারকারী</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {paginatedRestockHistory.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            এখনও কোনো স্টক ইন করা হয়নি। ওপরের ফর্ম ব্যবহার করে ওষুধ রিস্টক করুন।
                          </td>
                        </tr>
                      ) : (
                        paginatedRestockHistory.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{log.dateStr}</span>
                              <span className="text-[10px] text-slate-400">{log.timeStr}</span>
                            </td>

                            <td className="p-3">
                              <span className="font-black text-slate-900 block">{log.medicineName}</span>
                              <span className="text-[11px] text-slate-500">{log.generic} {log.company ? `• ${log.company}` : ''}</span>
                            </td>

                            <td className="p-3 text-center font-bold text-slate-600">
                              {log.oldStock} পিস
                            </td>

                            <td className="p-3 text-center">
                              <span className="bg-emerald-100 text-[#02975E] font-black px-2 py-0.5 rounded-full text-[11px] inline-block">
                                +{log.addedStock} {log.unitLabel || 'পিস'}
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              <span className="font-black text-sm text-[#123184] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded inline-block">
                                {log.newStock} পিস
                              </span>
                            </td>

                            <td className="p-3 text-slate-600">
                              {log.invoiceNo && <span className="font-mono font-bold text-[11px] block text-slate-800">চালান: {log.invoiceNo}</span>}
                              {log.supplier && <span className="text-[10px] text-slate-500 block">সাপ্লায়ার: {log.supplier}</span>}
                              {log.note && <span className="text-[10px] text-slate-400 italic block">{log.note}</span>}
                              {!log.invoiceNo && !log.supplier && !log.note && '—'}
                            </td>

                            <td className="p-3 text-right">
                              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5">
                                @{log.adminUser || 'yeakub007'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination for History Table */}
                {totalRestockHistoryPages > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      মোট {filteredRestockHistory.length} টির মধ্যে {(restockHistoryPage - 1) * restockHistoryPerPage + 1} - {Math.min(restockHistoryPage * restockHistoryPerPage, filteredRestockHistory.length)} দেখানো হচ্ছে
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={restockHistoryPage === 1}
                        onClick={() => setRestockHistoryPage(p => Math.max(1, p - 1))}
                        className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 cursor-pointer"
                      >
                        পূর্ববর্তী
                      </button>
                      <span className="px-2 py-1 font-bold text-[#123184]">
                        {restockHistoryPage} / {totalRestockHistoryPages}
                      </span>
                      <button
                        type="button"
                        disabled={restockHistoryPage === totalRestockHistoryPages}
                        onClick={() => setRestockHistoryPage(p => Math.min(totalRestockHistoryPages, p + 1))}
                        className="px-2.5 py-1 border border-slate-200 rounded disabled:opacity-40 cursor-pointer"
                      >
                        পরবর্তী
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* ======================================================== */}
              {/* SECTION 4: FAST MULTI-ITEM INLINE RESTOCK TABLE          */}
              {/* ======================================================== */}
              <div className="bg-white border border-slate-200 shadow-xs p-5 space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                        দ্রুত ক্যাটালগ রিস্টক (Fast Multi-Item Restock)
                      </h3>
                      <p className="text-xs text-slate-500">
                        চালান থেকে দ্রুত একাধিক ওষুধে এক ক্লিকেই নতুন স্টক যোগ করুন
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    সংখ্যা লিখে <kbd className="bg-slate-100 px-1 py-0.5 border font-mono">Enter</kbd> চাপুন বা <strong className="text-[#02975E]">+ যোগ</strong> বাটনে ক্লিক করুন
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">ওষুধের নাম</th>
                        <th className="p-3">জেনেরিক ও প্রস্তুতকারক</th>
                        <th className="p-3 text-center">বর্তমান বিদ্যমান স্টক</th>
                        <th className="p-3 text-center">নতুন আসার সংখ্যা</th>
                        <th className="p-3 text-center">নতুন মোট স্টক হবে</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRestockMedicines.slice(0, 8).map((med) => {
                        const currentStock = typeof med.stock === 'number' ? med.stock : 100;
                        const inputVal = restockQuickAddInputs[med.id] || '';
                        const parsedAdd = parseInt(inputVal, 10) || 0;
                        const previewNewTotal = currentStock + parsedAdd;

                        return (
                          <tr key={`quick-${med.id}`} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                              <span className="block">{med.name}</span>
                              {med.nameBn && <span className="text-[10px] text-emerald-800 font-normal">{med.nameBn}</span>}
                            </td>

                            <td className="p-3 text-slate-600">
                              <span>{med.generic}</span>
                              <span className="block text-[10px] text-slate-400">{med.company}</span>
                            </td>

                            <td className="p-3 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded text-[11px] ${
                                currentStock === 0 
                                  ? 'bg-rose-100 text-rose-800 font-black' 
                                  : currentStock <= 15 
                                  ? 'bg-amber-100 text-amber-900 font-bold' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {currentStock} পিস
                              </span>
                            </td>

                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1">
                                <span className="text-emerald-600 font-bold text-sm">+</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={inputVal}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRestockQuickAddInputs(prev => ({ ...prev, [med.id]: val }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleQuickInlineRestock(med);
                                    }
                                  }}
                                  placeholder="১০"
                                  className="w-16 px-2 py-1 text-center font-black border border-slate-300 focus:border-[#02975E] bg-white outline-none rounded-none text-xs"
                                />
                                <span className="text-[10px] text-slate-400">পিস</span>
                              </div>
                            </td>

                            <td className="p-3 text-center">
                              {parsedAdd > 0 ? (
                                <span className="font-black text-[#123184] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs">
                                  {previewNewTotal} পিস
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <button
                                type="button"
                                disabled={parsedAdd <= 0}
                                onClick={() => handleQuickInlineRestock(med)}
                                className={`px-3 py-1.5 font-bold text-xs rounded transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  parsedAdd <= 0
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-[#02975E] hover:bg-[#027e4e] text-white shadow-xs'
                                }`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>স্টক ইন</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT */}
          {/* ================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Filter pills & search */}
              <div id="admin-orders-list-top" className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
                
                {/* Filter buttons */}
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                  {['all', 'Pending', 'Processing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-none cursor-pointer transition-all ${
                        orderFilter === st 
                          ? 'bg-[#123184] text-white shadow-xs font-bold' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'all' ? `সবগুলো (${orders.length})` : st}
                    </button>
                  ))}
                </div>

                {/* Search in orders */}
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-500 hidden sm:inline-block">
                    মোট {filteredOrders.length}টি অর্ডার (১০টি প্রতি পেজে)
                  </span>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="অর্ডার আইডি বা ফোন..."
                      className="pl-9 pr-3 py-1.5 rounded-none border border-slate-200 text-xs outline-none focus:border-[#123184]"
                    />
                  </div>
                </div>
              </div>

              {/* Order Cards List */}
              <div className="space-y-4">
                {paginatedOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </div>
                ) : (
                  paginatedOrders.map(order => {
                    const avatarSrc = order.customerAvatar || customerProfiles?.find(p => p.phone === order.customerPhone)?.avatar || null;
                    
                    // Status style configuration
                    const getStatusConfig = (st) => {
                      switch (st) {
                        case 'Delivered':
                          return {
                            badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
                            dot: 'bg-emerald-500',
                            cardBorder: 'border-l-4 border-l-emerald-500',
                            label: 'Delivered (সম্পন্ন)'
                          };
                        case 'Pending':
                          return {
                            badge: 'bg-amber-50 text-amber-800 border-amber-300',
                            dot: 'bg-amber-500 animate-pulse',
                            cardBorder: 'border-l-4 border-l-amber-500',
                            label: 'Pending (অপেক্ষমান)'
                          };
                        case 'Processing':
                          return {
                            badge: 'bg-blue-50 text-blue-800 border-blue-300',
                            dot: 'bg-blue-500',
                            cardBorder: 'border-l-4 border-l-blue-500',
                            label: 'Processing (প্রক্রিয়াধীন)'
                          };
                        case 'Dispatched':
                          return {
                            badge: 'bg-indigo-50 text-indigo-800 border-indigo-300',
                            dot: 'bg-indigo-500',
                            cardBorder: 'border-l-4 border-l-indigo-500',
                            label: 'Dispatched (প্যাকড)'
                          };
                        case 'Out for Delivery':
                          return {
                            badge: 'bg-teal-50 text-teal-800 border-teal-300',
                            dot: 'bg-teal-500',
                            cardBorder: 'border-l-4 border-l-teal-500',
                            label: 'Out for Delivery (পথে)'
                          };
                        case 'Cancelled':
                          return {
                            badge: 'bg-rose-50 text-rose-800 border-rose-300',
                            dot: 'bg-rose-500',
                            cardBorder: 'border-l-4 border-l-rose-500',
                            label: 'Cancelled (বাতিল)'
                          };
                        default:
                          return {
                            badge: 'bg-slate-50 text-slate-800 border-slate-300',
                            dot: 'bg-slate-400',
                            cardBorder: 'border-l-4 border-l-slate-400',
                            label: st || 'Unknown'
                          };
                      }
                    };
                    const statusMeta = getStatusConfig(order.status);
                    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '').replace(/^880|^0/, '');

                    return (
                      <div 
                        key={order.id} 
                        className={`bg-white rounded-lg border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all overflow-hidden ${statusMeta.cardBorder}`}
                      >
                        {/* 1. Slim Header Bar: Order ID, Timestamp, Status & Actions */}
                        <div className="bg-slate-50/70 px-3.5 py-1.5 sm:py-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                            {order.status === 'Pending' ? (
                              <button
                                type="button"
                                onClick={() => setActiveInvoiceOrder(order)}
                                className="group text-left cursor-pointer inline-flex items-center gap-1 focus:outline-none"
                                title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                              >
                                <span className="bp-number-lighting text-xs font-black group-hover:underline">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                                  </span>
                                  <span>#{order.id}</span>
                                  <span className="text-[8px] uppercase font-black px-1 py-0.1 rounded bg-rose-200/60 text-rose-900 border border-rose-300">
                                    NEW
                                  </span>
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setActiveInvoiceOrder(order)}
                                className="text-xs font-black text-[#123184] hover:text-[#02975E] hover:underline cursor-pointer transition-colors focus:outline-none flex items-center gap-0.5"
                                title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                              >
                                <span className="text-slate-400 font-semibold text-[11px]">#</span>
                                <span>{order.id}</span>
                              </button>
                            )}

                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {order.createdAt}
                            </span>

                            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold border ${statusMeta.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`}></span>
                              {order.status}
                            </span>
                          </div>

                          {/* Top Right: Status dropdown + Invoice button */}
                          <div className="flex items-center gap-1.5">
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-[11px] font-bold border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 outline-none focus:border-[#123184] cursor-pointer hover:border-slate-300 transition-colors shadow-2xs"
                            >
                              <option value="Pending">Pending (অপেক্ষমান)</option>
                              <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
                              <option value="Dispatched">Dispatched (প্যাকড)</option>
                              <option value="Out for Delivery">Out for Delivery (পথে)</option>
                              <option value="Delivered">Delivered (সম্পন্ন)</option>
                              <option value="Cancelled">Cancelled (বাতিল)</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => setActiveInvoiceOrder(order)}
                              className="inline-flex items-center gap-1 bg-[#123184] hover:bg-[#0d2463] text-white font-bold text-[11px] px-2.5 py-1 rounded cursor-pointer transition-colors shadow-2xs"
                              title="ইনভয়েস দেখুন / প্রিন্ট করুন"
                            >
                              <Printer className="w-3 h-3" />
                              <span>ইনভয়েস</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Compact Body */}
                        <div className="p-3 sm:p-3.5 space-y-2.5">
                          {/* Top Row: Customer & Delivery details */}
                          <div className="flex flex-wrap lg:flex-nowrap items-start justify-between gap-3 text-xs">
                            {/* Customer Info */}
                            <div className="flex items-center gap-2.5 min-w-[210px]">
                              <div className="w-8 h-8 rounded-full ring-1 ring-slate-200 p-0.5 bg-white shrink-0 flex items-center justify-center overflow-hidden">
                                {avatarSrc ? (
                                  <img 
                                    src={avatarSrc} 
                                    alt={order.customerName} 
                                    className="w-full h-full object-cover rounded-full" 
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-xs font-black uppercase">
                                    {order.customerName ? order.customerName.slice(0, 1) : <User className="w-3.5 h-3.5" />}
                                  </div>
                                )}
                              </div>
                              <div className="leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900 text-xs">{order.customerName || 'নাম নেই'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <a 
                                    href={`tel:${order.customerPhone}`} 
                                    className="text-[#02975E] hover:underline font-bold text-[11px] inline-flex items-center gap-0.5"
                                    title="কল করুন"
                                  >
                                    <PhoneCall className="w-2.5 h-2.5" />
                                    <span>{order.customerPhone}</span>
                                  </a>
                                  {order.customerPhone && (
                                    <a
                                      href={`https://wa.me/880${cleanPhone}?text=${encodeURIComponent(`আসসালামু আলাইকুম ${order.customerName || ''}, বেলি ফার্মেসি থেকে আপনার অর্ডার (${order.id}) সংক্রান্ত যোগাযোগ করছি।`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold px-1.5 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-0.5 transition-colors"
                                      title="WhatsApp এ মেসেজ পাঠান"
                                    >
                                      <span>💬 WA</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delivery Address Box */}
                            <div className="flex-1 min-w-[240px] bg-slate-50/70 rounded px-2.5 py-1.5 border border-slate-100 text-[11px]">
                              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 font-semibold mb-0.5">
                                <span className="inline-flex items-center gap-1 text-slate-600 font-bold">
                                  <MapPin className="w-3 h-3 text-[#123184]" />
                                  ডেলিভারি ঠিকানা
                                </span>
                                {order.deliveryType && (
                                  <span className="bg-white border border-slate-200 px-1.5 py-0.2 rounded text-[9px] font-bold text-slate-600">
                                    {order.deliveryType}
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-700 leading-snug break-words">
                                {order.deliveryAddress || 'কোনো ঠিকানা দেওয়া হয়নি'}
                              </p>
                              {order.patientNote && (
                                <p className="mt-1 text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 inline-block font-medium">
                                  📝 "{order.patientNote}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Middle Row: Medicines Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-0.5">
                              <Pill className="w-3 h-3 text-purple-600" />
                              ওষুধ ({order.items?.length || 0}):
                            </span>
                            {order.items?.map((it, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-800 transition-colors"
                              >
                                <span className="font-bold text-slate-900 text-[11px]">{it.name}</span>
                                <span className="text-slate-500 text-[10px]">({it.unitLabel || 'ইউনিট'} × {it.quantity})</span>
                                {it.price && (
                                  <span className="font-black text-[#123184] text-[10px] ml-0.5">
                                    ৳{(Number(it.price) * Number(it.quantity)).toFixed(2)}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>

                          {/* Delivered Payment Status / Settlement options (Compact) */}
                          {order.status === 'Delivered' && (
                            order.paymentConfirmed ? (
                              <div className="bg-emerald-50/70 border border-emerald-200 px-2.5 py-1.5 rounded flex flex-wrap items-center justify-between gap-1.5 text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-[#02975E] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                    ✓
                                  </span>
                                  <span className="font-bold text-slate-700 text-[11px]">সংরক্ষিত পেমেন্ট:</span>
                                  <span className="font-black text-[11px]">
                                    {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') ? (
                                      <span className="text-[#D12053] inline-flex items-center gap-1">
                                        <img src="/bkash-logo.png" alt="bKash" className="h-3 object-contain" /> bKash
                                      </span>
                                    ) : (order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') ? (
                                      <span className="text-[#E31B23] inline-flex items-center gap-1">
                                        <img src="/nagad-logo.png" alt="Nagad" className="h-3 object-contain" /> Nagad
                                      </span>
                                    ) : (
                                      <span className="text-slate-900 font-bold">💵 Cash on Hand</span>
                                    )}
                                  </span>
                                  {order.trxId && order.trxId !== 'N/A' && (
                                    <span className="font-mono text-emerald-900 bg-white px-1.5 py-0.2 rounded border border-emerald-300 font-bold text-[10px]">
                                      Trx: {order.trxId}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                                    🔒 কনফার্মড
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateOrderPaymentMethod(order.id, order.paymentMethod, order.trxId, false)}
                                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                  >
                                    পরিবর্তন
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-black text-slate-700 shrink-0">💳 পেমেন্ট:</span>
                                  
                                  {/* Cash on Hand */}
                                  <button
                                    type="button"
                                    onClick={() => updateOrderPaymentMethod(order.id, 'Cash on Hand', 'N/A', true)}
                                    className={`px-2 py-0.5 border rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
                                      order.paymentMethod === 'Cash on Hand' || order.paymentMethod === 'cod'
                                        ? 'border-[#02975E] bg-emerald-50 text-[#02975E] font-black ring-1 ring-[#02975E]'
                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span>💵 Cash</span>
                                    {(order.paymentMethod === 'Cash on Hand' || order.paymentMethod === 'cod') && <span className="text-[9px]">✓</span>}
                                  </button>

                                  {/* bKash */}
                                  <button
                                    type="button"
                                    onClick={() => updateOrderPaymentMethod(order.id, 'bKash', order.trxId, false)}
                                    className={`px-2 py-0.5 border rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
                                      order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash'
                                        ? 'border-[#D12053] bg-pink-50 text-[#D12053] font-black ring-1 ring-[#D12053]'
                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <img src="/bkash-logo.png" alt="bKash" className="h-2.5 object-contain" />
                                    <span>bKash</span>
                                    {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') && <span className="text-[9px]">✓</span>}
                                  </button>

                                  {/* Nagad */}
                                  <button
                                    type="button"
                                    onClick={() => updateOrderPaymentMethod(order.id, 'Nagad', order.trxId, false)}
                                    className={`px-2 py-0.5 border rounded flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-all ${
                                      order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad'
                                        ? 'border-[#E31B23] bg-amber-50 text-[#E31B23] font-black ring-1 ring-[#E31B23]'
                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                    }`}
                                  >
                                    <img src="/nagad-logo.png" alt="Nagad" className="h-2.5 object-contain" />
                                    <span>Nagad</span>
                                    {(order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') && <span className="text-[9px]">✓</span>}
                                  </button>
                                </div>

                                {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash' || order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') && (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      id={`admin-trx-${order.id}`}
                                      defaultValue={order.trxId !== 'N/A' ? order.trxId : ''}
                                      placeholder="TrxID দিন"
                                      className="w-28 px-2 py-0.5 text-[10px] border border-slate-300 rounded bg-white font-mono uppercase font-bold outline-none focus:border-[#123184]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const val = document.getElementById(`admin-trx-${order.id}`)?.value;
                                        if (val !== undefined) {
                                          updateOrderPaymentMethod(order.id, order.paymentMethod || 'Cash on Hand', val, true);
                                        }
                                      }}
                                      className="bg-[#123184] hover:bg-[#0d2463] text-white px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer"
                                    >
                                      সেভ
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        {/* 3. Slim Footer: Payment Method & Total */}
                        <div className="bg-slate-50/70 px-3.5 py-1.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] flex-wrap">
                            <span className="font-bold text-slate-600 inline-flex items-center gap-1">
                              <Banknote className="w-3 h-3 text-emerald-600" />
                              পদ্ধতি:
                            </span>
                            <span className="uppercase font-extrabold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.2 rounded text-[10px]">
                              {order.paymentMethod || 'Cash on Hand'}
                            </span>
                            {order.trxId && order.trxId !== 'N/A' && (
                              <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.2 rounded">
                                Trx: {order.trxId}
                              </span>
                            )}
                            {order.deliveryFee > 0 && (
                              <span className="text-[10px] text-slate-400">
                                (ডেলিভারি: ৳{order.deliveryFee})
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              মোট প্রদেয়:
                            </span>
                            <span className="text-base sm:text-lg font-black text-[#123184] tracking-tight">
                              ৳{Number(order.grandTotal || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Order Pagination Controls (10 orders per page) */}
              {filteredOrders.length > 0 && totalOrderPages > 1 && (
                <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    {lang === 'bn' ? (
                      <span>
                        পেজ <strong className="text-[#123184] font-black">{orderPage}</strong> এর <strong className="text-slate-900">{totalOrderPages}</strong> — মোট <strong className="text-emerald-700">{filteredOrders.length}</strong>টি অর্ডারের মধ্যে <strong className="text-slate-900">{(orderPage - 1) * ordersPerPage + 1} থেকে {Math.min(orderPage * ordersPerPage, filteredOrders.length)}</strong> তম দেখানো হচ্ছে (সর্বশেষ অর্ডার উপরে)
                      </span>
                    ) : (
                      <span>
                        Page <strong className="text-[#123184] font-black">{orderPage}</strong> of <strong className="text-slate-900">{totalOrderPages}</strong> — Showing <strong className="text-slate-900">{(orderPage - 1) * ordersPerPage + 1} to {Math.min(orderPage * ordersPerPage, filteredOrders.length)}</strong> of {filteredOrders.length} orders
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handleOrderPageChange(orderPage - 1)}
                      disabled={orderPage === 1}
                      className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                        orderPage === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-[#123184] hover:text-white hover:border-[#123184] cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'পূর্ববর্তী পেজ' : 'Previous'}</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {getVisiblePages(orderPage, totalOrderPages).map((pageNum, idx) =>
                        pageNum === '...' ? (
                          <span
                            key={`order-ellipsis-${idx}`}
                            className="w-8 h-9 flex items-center justify-center text-xs font-black text-slate-400 select-none tracking-widest"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleOrderPageChange(pageNum)}
                            className={`w-9 h-9 text-xs font-black border transition-all rounded-none cursor-pointer ${
                              orderPage === pageNum
                                ? 'bg-[#123184] text-white border-[#123184] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handleOrderPageChange(orderPage + 1)}
                      disabled={orderPage === totalOrderPages}
                      className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                        orderPage === totalOrderPages
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-[#02975E] text-white border-[#02975E] hover:bg-[#027e4e] shadow-xs cursor-pointer'
                      }`}
                    >
                      <span>{lang === 'bn' ? 'পরবর্তী পেজ (Next)' : 'Next Page'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3: PRESCRIPTIONS REVIEW */}
          {/* ================================================= */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    আপলোডকৃত প্রেসক্রিপশন সমূহ ({prescriptions.length}টি)
                  </h3>
                  <span className="text-xs text-slate-500">রোগীর প্রেসক্রিপশন দেখে ওষুধ কনফার্ম করুন</span>
                </div>
              </div>

              {prescriptions.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-none border border-slate-200 text-slate-400">
                  কোনো প্রেসক্রিপশন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5">
                  {[...prescriptions].sort((a, b) => {
                    const parseRxTime = (item) => (item.timestamp && typeof item.timestamp === 'number') ? item.timestamp : (item.createdAt ? Date.parse(item.createdAt) : 0) || 0;
                    return parseRxTime(b) - parseRxTime(a);
                  }).map(rx => (
                  <div key={rx.id} className="bg-white rounded-none border border-slate-200 p-3 space-y-2.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <div className="min-w-0">
                          <span className="font-black text-xs sm:text-sm text-[#123184] block truncate">{rx.id}</span>
                          <span className="text-[10px] text-slate-400 block">{rx.createdAt}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-none text-[9px] font-bold shrink-0 ${
                          rx.status === 'Reviewed' ? 'bg-[#02975E]/15 text-[#02975E]' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rx.status}
                        </span>
                      </div>

                      <div className="text-[11px] leading-snug space-y-1">
                        {(() => {
                          const rxAvatar = rx.customerAvatar || customerProfiles?.find(p => p.phone === rx.customerPhone)?.avatar || null;
                          return (
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full ring-1 ring-emerald-500/30 p-0.5 bg-white shrink-0 shadow-2xs flex items-center justify-center overflow-hidden">
                                {rxAvatar ? (
                                  <img src={rxAvatar} alt={rx.customerName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-[10px] font-black uppercase">
                                    {rx.customerName ? rx.customerName.slice(0, 1) : <User className="w-3.5 h-3.5" />}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate text-xs">{rx.customerName}</p>
                                <p className="text-slate-500 text-[10px]">📞 <a href={`tel:${rx.customerPhone}`} className="text-[#02975E] font-bold hover:underline">{rx.customerPhone}</a></p>
                              </div>
                            </div>
                          );
                        })()}
                        <p className="text-slate-500 line-clamp-1" title={rx.deliveryAddress}>ঠিকানা: {rx.deliveryAddress}</p>
                        {rx.notes && <p className="text-slate-600 italic bg-slate-50 p-1 rounded-none text-[10px] line-clamp-2">নোট: "{rx.notes}"</p>}
                      </div>

                      {/* Image Thumbnail */}
                      {rx.image && (
                        <div 
                          onClick={() => handleOpenRxPreview(rx.image)}
                          className="relative h-32 bg-slate-100 rounded-none overflow-hidden cursor-pointer group border border-slate-200"
                        >
                          <img
                            src={rx.image}
                            alt="Prescription"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>বড় করে দেখুন</span>
                          </div>
                        </div>
                      )}
                      {/* Prescribed Medicines Summary or Entry Button */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        {rx.voiceNote && (
                          <div className="bg-amber-50 border border-amber-200 px-2 py-1.5 text-xs flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Mic className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-extrabold text-amber-900 text-[11px] truncate">
                                🎙️ অডিও সেবনবিধি যুক্ত
                              </span>
                            </div>
                            {rx.voiceNoteDuration && (
                              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.5 rounded shrink-0">
                                {rx.voiceNoteDuration}
                              </span>
                            )}
                          </div>
                        )}
                        {rx.prescribedMedicines && rx.prescribedMedicines.length > 0 ? (
                          <div className="bg-emerald-50 border border-emerald-200 p-2 text-xs space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-[#02975E] text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#02975E]" />
                                <span>{rx.prescribedMedicines.length}টি ওষুধ এন্ট্রি সম্পন্ন</span>
                              </span>
                              <span className="font-black text-slate-900 text-xs">
                                ৳{rx.totalPrice}
                              </span>
                            </div>
                            {rx.isAddedToCart && (
                              <div className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded inline-flex items-center gap-1">
                                ✓ গ্রাহক ইতোমধ্যে কার্টে নিয়েছেন
                              </div>
                            )}
                            <div className="text-[10px] text-slate-600 truncate">
                              {rx.prescribedMedicines.map(m => m.name).join(', ')}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleOpenRxMedicinesModal(rx)}
                              className="w-full text-center bg-white hover:bg-emerald-100 text-[#02975E] border border-emerald-300 font-bold py-1 text-[11px] cursor-pointer transition-colors shadow-2xs"
                            >
                              ওষুধ তালিকা ও পরিবর্তন
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenRxMedicinesModal(rx)}
                            className="w-full flex items-center justify-center gap-1.5 bg-[#123184] hover:bg-[#0d2463] text-white font-bold py-1.5 px-2 text-[11px] transition-colors cursor-pointer shadow-2xs"
                          >
                            <Pill className="w-3.5 h-3.5 text-emerald-300" />
                            <span>ওষুধ এন্ট্রি ও মূল্য নির্ধারণ</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status & Call Buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <select
                        value={rx.status}
                        onChange={(e) => updatePrescriptionStatus(rx.id, e.target.value)}
                        className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 flex-1 bg-slate-50 text-slate-800 outline-none hover:bg-white focus:border-[#02975E] transition-colors"
                      >
                        <option value="Pending Review">Pending Review</option>
                        <option value="Reviewed">Reviewed (পর্যালোচনা সম্পন্ন)</option>
                        <option value="Customer Called">Customer Called (কল দেওয়া হয়েছে)</option>
                        <option value="Order Created">Order Created (অর্ডার প্রস্তুত)</option>
                        <option value="Added to Cart">Added to Cart (গ্রাহক কার্টে যোগ করেছেন)</option>
                      </select>

                      <a
                        href={`tel:${rx.customerPhone}`}
                        className="bg-[#02975E] hover:bg-[#027e4e] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0"
                      >
                        কল দিন
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          )}

          {/* ================================================= */}
          {/* TAB 3.5: CUSTOMER MANAGEMENT (গ্রাহক ম্যানেজমেন্ট) */}
          {/* ================================================= */}
          {activeTab === 'customers' && (
            <div id="admin-customers-top" className="space-y-6">
              
              {/* Top 4 Metrics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">মোট নিবন্ধিত গ্রাহক</span>
                    <span className="p-2 bg-[#123184]/10 text-[#123184]">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#123184]">{consolidatedCustomers.length} জন</span>
                  <span className="text-[11px] text-[#02975E] font-bold">লাইভ ক্লাউড ডাটাবেজ</span>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">সক্রিয় অর্ডারকারী</span>
                    <span className="p-2 bg-[#02975E]/10 text-[#02975E]">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{totalCustomersWithOrders} জন</span>
                  <span className="text-[11px] text-emerald-600 font-bold">অর্ডার সম্পন্নকারী গ্রাহক</span>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">গ্রাহকদের মোট কেনাকাটা</span>
                    <span className="p-2 bg-emerald-100 text-emerald-800">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">৳{totalCustomerSpent.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-500 font-medium">সর্বমোট সংগৃহীত বিক্রয়</span>
                </div>

                <div className="bg-white p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">প্রেসক্রিপশন আপলোডকারী</span>
                    <span className="p-2 bg-amber-100 text-amber-800">
                      <FileText className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{totalCustomersWithRx} জন</span>
                  <span className="text-[11px] text-amber-600 font-bold">প্রেসক্রিপশন ইউজার</span>
                </div>

              </div>

              {/* Search, Filter & Action Bar */}
              <div className="bg-white p-4 border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[260px] max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      placeholder="নাম, ফোন নম্বর বা ঠিকানা দিয়ে গ্রাহক খুঁজুন..."
                      className="w-full pl-9 pr-8 py-2 border border-slate-200 text-xs outline-none focus:border-[#123184] transition-colors"
                    />
                    {customerSearch && (
                      <button 
                        type="button" 
                        onClick={() => setCustomerSearch('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Filter Tabs */}
                  <div className="flex items-center bg-slate-100 p-1 text-xs font-bold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setCustomerFilter('all')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${
                        customerFilter === 'all' ? 'bg-white text-[#123184] shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      সকল ({consolidatedCustomers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerFilter('ordered')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${
                        customerFilter === 'ordered' ? 'bg-white text-[#123184] shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      অর্ডারকারী ({totalCustomersWithOrders})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerFilter('prescriptions')}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${
                        customerFilter === 'prescriptions' ? 'bg-white text-[#123184] shadow-xs' : 'hover:text-slate-900'
                      }`}
                    >
                      প্রেসক্রিপশন ({totalCustomersWithRx})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddCustomerModal(true)}
                    className="flex items-center gap-1.5 text-xs bg-[#02975E] hover:bg-[#027e4e] text-white font-extrabold px-4 py-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>নতুন গ্রাহক যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Customers Grid */}
              {paginatedCustomers.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <Users className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-base text-slate-700">কোনো গ্রাহক পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {customerSearch 
                      ? `"${customerSearch}" এর সাথে মিলে এমন কোনো গ্রাহক নেই। অন্য কি-ওয়ার্ড দিয়ে খুঁজুন।`
                      : 'নতুন কোনো গ্রাহক এখনও একাউন্ট তৈরি বা অর্ডার করেননি। আপনি ওপরের বোতাম দিয়ে নতুন গ্রাহক যুক্ত করতে পারেন।'}
                  </p>
                  {customerSearch && (
                    <button
                      type="button"
                      onClick={() => setCustomerSearch('')}
                      className="text-xs font-bold text-[#123184] hover:underline cursor-pointer"
                    >
                      সার্চ ক্লিয়ার করুন
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCustomers.map((cust) => {
                    const stats = getCustomerStats(cust.phone);
                    return (
                      <div 
                        key={cust.phone} 
                        className="bg-white border border-slate-200 p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        {/* Card Header & Avatar */}
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                            {cust.avatar ? (
                              <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#123184] text-white font-black flex items-center justify-center text-base">
                                {(cust.name || 'গ').charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-black text-sm text-slate-900 truncate" title={cust.name}>
                                {cust.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 shrink-0 font-medium">
                                {cust.createdAt || 'নিবন্ধিত'}
                              </span>
                            </div>

                            {/* Phone with quick call & copy */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <Phone className="w-3.5 h-3.5 text-[#123184] shrink-0" />
                              <a 
                                href={`tel:${cust.phone}`} 
                                className="text-xs font-mono font-bold text-[#123184] hover:underline"
                              >
                                {cust.phone}
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(cust.phone);
                                  showToast?.(`ফোন নম্বর (${cust.phone}) কপি হয়েছে`, 'info');
                                }}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="নম্বর কপি করুন"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Delivery Address */}
                            <div className="flex items-start gap-1.5 mt-1 text-[11px] text-slate-600">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <p className="line-clamp-2 leading-tight">
                                {cust.address || <span className="text-slate-400 italic">ঠিকানা দেওয়া হয়নি</span>}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Stats Strip */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 text-center border border-slate-100 text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-500 font-medium">মোট অর্ডার</span>
                            <span className="font-black text-slate-900">{stats.orders.length} টি</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-medium">মোট ব্যয়</span>
                            <span className="font-black text-[#02975E]">৳{stats.totalSpent}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500 font-medium">প্রেসক্রিপশন</span>
                            <span className="font-black text-amber-700">{stats.prescriptions.length} টি</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleStartEditCustomer(cust)}
                            className="flex-1 bg-[#123184] hover:bg-[#0d2463] text-white text-xs font-bold py-2 px-3 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>তথ্য এডিট</span>
                          </button>

                          {/* Order History */}
                          {stats.orders.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setInspectCustomer(cust)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-[#02975E] border border-emerald-200 text-xs font-bold py-2 px-2.5 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              title="অর্ডার হিস্টোরি দেখুন"
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>অর্ডার ({stats.orders.length})</span>
                            </button>
                          )}

                          {/* Direct Call */}
                          <a
                            href={`tel:${cust.phone}`}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-2.5 flex items-center justify-center transition-colors"
                            title="কল করুন"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-[#02975E]" />
                          </a>

                          {/* Delete Customer */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(cust.phone, cust.name)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold py-2 px-2.5 flex items-center justify-center transition-colors cursor-pointer"
                            title="গ্রাহক প্রোফাইল মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {filteredCustomers.length > 0 && totalCustomerPages > 1 && (
                <div className="bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 font-medium">
                    পেজ <strong className="text-[#123184] font-black">{customerPage}</strong> এর <strong className="text-slate-900">{totalCustomerPages}</strong> — মোট <strong className="text-emerald-700">{filteredCustomers.length}</strong> জন গ্রাহকের মধ্যে <strong className="text-slate-900">{(customerPage - 1) * customersPerPage + 1} থেকে {Math.min(customerPage * customersPerPage, filteredCustomers.length)}</strong> তম দেখানো হচ্ছে
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCustomerPageChange(customerPage - 1)}
                      disabled={customerPage === 1}
                      className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        customerPage === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-[#123184] hover:text-white hover:border-[#123184] cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>পূর্ববর্তী</span>
                    </button>

                    <div className="flex items-center gap-1 flex-wrap">
                      {getVisiblePages(customerPage, totalCustomerPages).map((pageNum, idx) =>
                        pageNum === '...' ? (
                          <span
                            key={`cust-ellipsis-${idx}`}
                            className="w-8 h-9 flex items-center justify-center text-xs font-black text-slate-400 select-none tracking-widest"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleCustomerPageChange(pageNum)}
                            className={`w-9 h-9 text-xs font-black border transition-all rounded-none cursor-pointer ${
                              customerPage === pageNum
                                ? 'bg-[#123184] text-white border-[#123184] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCustomerPageChange(customerPage + 1)}
                      disabled={customerPage === totalCustomerPages}
                      className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all ${
                        customerPage === totalCustomerPages
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-[#123184] hover:text-white hover:border-[#123184] cursor-pointer'
                      }`}
                    >
                      <span>পরবর্তী</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 4: MEDICINE INVENTORY CRUD */}
          {/* ================================================= */}
          {activeTab === 'medicines' && (
            <div id="admin-med-table-top" className="space-y-4">
              
              {/* Top Action Bar */}
              <div className="bg-white p-4 rounded-none border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={medSearch}
                      onChange={(e) => setMedSearch(e.target.value)}
                      placeholder="ওষুধ বা কোম্পানির নাম..."
                      className="pl-9 pr-3 py-1.5 rounded-none border border-slate-200 text-xs outline-none focus:border-[#123184]"
                    />
                  </div>
                  {isAdminMedexLoading && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                        লাইভ ডাটাবেজ খুঁজছে...
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetToDefaultMedicines}
                    className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-none cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ডিফল্ট ক্যাটালগ</span>
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 text-xs bg-[#02975E] hover:bg-[#027e4e] text-white font-extrabold px-3.5 py-2 rounded-none cursor-pointer shadow-md shadow-[#02975E]/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন ওষুধ যোগ করুন</span>
                  </button>
                </div>
              </div>

              {/* Add Medicine Form Modal */}
              {showAddForm && (
                <form onSubmit={handleAddMedicineSubmit} className="bg-white rounded-none border-2 border-[#02975E] p-6 space-y-4 animate-in fade-in shadow-xl">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-[#123184]">নতুন ওষুধ সংযুক্তকরণ</h4>
                    <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕ বন্ধ করুন</button>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold mb-1">ওষুধের নাম (Brand Name) *</label>
                      <input
                        type="text"
                        required
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        placeholder="যেমন: Napa Extra"
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">জেনেরিক নাম (Generic) *</label>
                      <input
                        type="text"
                        required
                        value={newMed.generic}
                        onChange={(e) => setNewMed({ ...newMed, generic: e.target.value })}
                        placeholder="Paracetamol 500mg"
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">কোম্পানি / প্রস্তুতকারক *</label>
                      <input
                        type="text"
                        required
                        value={newMed.company}
                        onChange={(e) => setNewMed({ ...newMed, company: e.target.value })}
                        placeholder="Square / Beximco"
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">ক্যাটাগরি</label>
                      <select
                        value={newMed.category}
                        onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      >
                        {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>{c.nameBn}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">ধরণ (Type)</label>
                      <select
                        value={newMed.type}
                        onChange={(e) => setNewMed({ ...newMed, type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl bg-white"
                      >
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Drop">Drop</option>
                        <option value="Cream">Cream</option>
                        <option value="Device">Device</option>
                        <option value="Pack">Pack</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">পাতা প্রতি মূল্য (৳) *</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        value={newMed.pricePerStrip}
                        onChange={(e) => setNewMed({ ...newMed, pricePerStrip: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">পিস প্রতি মূল্য (৳)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={newMed.pricePerUnit}
                        onChange={(e) => setNewMed({ ...newMed, pricePerUnit: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">ডিসকাউন্ট %</label>
                      <input
                        type="number"
                        value={newMed.discountPercent}
                        onChange={(e) => setNewMed({ ...newMed, discountPercent: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold mb-1">স্টক সংখ্যা</label>
                      <input
                        type="number"
                        value={newMed.stock}
                        onChange={(e) => setNewMed({ ...newMed, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>

                    {/* New Medicine Photo Upload */}
                    <div className="sm:col-span-3 bg-gradient-to-r from-emerald-50/70 to-blue-50/40 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#02975E]" />
                          <span>প্রোডাক্টের ছবি আপলোড (Product Photo)</span>
                        </label>
                        <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
                          গ্রাহকরা এই ছবিটি দেখতে পাবেন
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-1.5 shrink-0">
                          {newMed.image ? (
                            <img 
                              src={newMed.image} 
                              alt="New Product" 
                              className="w-full h-full object-contain rounded-xl"
                            />
                          ) : (
                            <div className="text-center text-slate-400">
                              <ImageIcon className="w-6 h-6 mx-auto stroke-1" />
                              <span className="text-[9px] block">ছবি নেই</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          <input 
                            type="file" 
                            ref={newImageInputRef} 
                            onChange={handleNewPhotoUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => newImageInputRef.current?.click()}
                              className="px-3.5 py-2 rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:shadow"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>ছবি আপলোড করুন</span>
                            </button>

                            {newMed.image && (
                              <button
                                type="button"
                                onClick={() => setNewMed({ ...newMed, image: '' })}
                                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer"
                              >
                                মুছুন
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[11px] text-slate-500 whitespace-nowrap">অথবা লিংক:</span>
                            <input
                              type="url"
                              value={newMed.image?.startsWith('data:') ? '' : (newMed.image || '')}
                              onChange={(e) => setNewMed({ ...newMed, image: e.target.value })}
                              placeholder={newMed.image?.startsWith('data:') ? '✓ ডিভাইস থেকে ছবি আপলোড করা হয়েছে' : 'https://...'}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-[11px] font-mono outline-none bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white cursor-pointer shadow-md"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Medicines Table */}
              <div className="bg-white rounded-none border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <th className="p-3">ওষুধের নাম ও কোম্পানি</th>
                        <th className="p-3">জেনেরিক</th>
                        <th className="p-3">মূল্য (পাতা/পিস)</th>
                        <th className="p-3">ডিসকাউন্ট</th>
                        <th className="p-3">স্টক সংখ্যা</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedAdminMedicines.map(med => (
                        <tr key={med.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900">{med.name}</span>
                              {med.nameBn && med.nameBn !== med.name && (
                                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">
                                  {med.nameBn}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block">{med.company?.replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস')} ({med.type})</span>
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate">{med.generic}</td>
                          <td className="p-3 font-bold text-[#123184]">
                            ৳{med.pricePerStrip} <span className="text-slate-400 font-normal">/ ৳{med.pricePerUnit}</span>
                          </td>
                          <td className="p-3">
                            {med.discountPercent > 0 ? (
                              <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-none font-bold text-[10px]">
                                {med.discountPercent}%
                              </span>
                            ) : (
                              <span className="text-slate-400">০%</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-700">{med.stock} pcs</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(med)}
                                className="text-[#123184] hover:text-[#02975E] hover:bg-[#123184]/10 p-1.5 rounded-none transition-colors cursor-pointer"
                                title="এডিট করুন (Edit)"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`আপনি কি নিশ্চিত যে "${med.name}" মুছে ফেলতে চান?`)) {
                                    deleteMedicine(med.id);
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-none transition-colors cursor-pointer"
                                title="মুছে ফেলুন (Delete)"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls with Next / Previous */}
              {totalMedPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 shadow-xs rounded-none">
                  <div className="text-xs sm:text-sm font-semibold text-slate-700">
                    {lang === 'bn' ? (
                      <span>
                        পেজ <strong className="text-[#123184] font-black">{medPage}</strong> / <strong>{totalMedPages}</strong> — মোট {filteredMedicines.length} টির মধ্যে <strong>{(medPage - 1) * medItemsPerPage + 1} থেকে {Math.min(medPage * medItemsPerPage, filteredMedicines.length)}</strong> টি ওষুধ প্রদর্শিত হচ্ছে
                      </span>
                    ) : (
                      <span>
                        Page <strong className="text-[#123184] font-black">{medPage}</strong> of <strong>{totalMedPages}</strong> — Showing <strong>{(medPage - 1) * medItemsPerPage + 1} to {Math.min(medPage * medItemsPerPage, filteredMedicines.length)}</strong> of {filteredMedicines.length} medicines
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Previous Button */}
                    <button
                      type="button"
                      onClick={() => handleAdminMedPageChange(medPage - 1)}
                      disabled={medPage === 1}
                      className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                        medPage === 1
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-[#123184] hover:text-white hover:border-[#123184] cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'পূর্ববর্তী পেজ' : 'Previous'}</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {getVisiblePages(medPage, totalMedPages).map((pageNum, idx) =>
                        pageNum === '...' ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-9 flex items-center justify-center text-xs font-black text-slate-400 select-none tracking-widest"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => handleAdminMedPageChange(pageNum)}
                            className={`w-9 h-9 text-xs font-black border transition-all rounded-none cursor-pointer ${
                              medPage === pageNum
                                ? 'bg-[#123184] text-white border-[#123184] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next Button */}
                    <button
                      type="button"
                      onClick={() => handleAdminMedPageChange(medPage + 1)}
                      disabled={medPage === totalMedPages}
                      className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                        medPage === totalMedPages
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : 'bg-[#02975E] text-white border-[#02975E] hover:bg-[#027e4e] shadow-xs cursor-pointer'
                      }`}
                    >
                      <span>{lang === 'bn' ? 'পরবর্তী পেজ (Next)' : 'Next Page'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* TAB: DELIVERY & COUPON SETTINGS */}
          {/* ================================================= */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full">
              
              {/* Top Quick Status Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">নিয়মিত ডেলিভারি চার্জ</span>
                    <span className="text-2xl font-black text-[#123184]">৳{config.deliveryFee}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#123184] flex items-center justify-center">
                    <Truck className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">ফ্রি ডেলিভারি ন্যূনতম অর্ডার</span>
                    <span className="text-2xl font-black text-[#02975E]">৳{config.freeDeliveryThreshold}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#02975E] flex items-center justify-center">
                    <Gift className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 font-bold block">মোট কুপন কোড</span>
                    <span className="text-2xl font-black text-amber-600">
                      {coupons.length} <span className="text-xs font-normal text-slate-400">({coupons.filter(c => c.isActive).length}টি সক্রিয়)</span>
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* CARD 1: DELIVERY CHARGE SETTINGS */}
              <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#123184]/10 text-[#123184] flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#123184]">
                        ডেলিভারি চার্জ কনফিগারেশন
                      </h3>
                      <p className="text-xs text-slate-500">
                        এখানে পরিবর্তিত চার্জ সাথে সাথে গ্রাহকের শপিং কার্ট ও চেকআউটে প্রযোজ্য হবে।
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveDelivery} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Regular Delivery Fee */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        নিয়মিত ডেলিভারি চার্জ (টাকা)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryForm.deliveryFee}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryFee: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#123184] outline-none text-sm font-bold text-slate-900 rounded-none transition-colors"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">সাধারণ হোম ডেলিভারির জন্য প্রযোজ্য</span>
                    </div>

                    {/* Free Delivery Threshold */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        ফ্রি ডেলিভারি পাওয়ার ন্যূনতম অর্ডার (টাকা)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryForm.freeDeliveryThreshold}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryThreshold: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#02975E] outline-none text-sm font-bold text-slate-900 rounded-none transition-colors"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">এই পরিমাণের সমান বা বেশি অর্ডারে চার্জ ৳০ হবে</span>
                    </div>

                    {/* Express Delivery Fee */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        জরুরি / এক্সপ্রেস ডেলিভারি চার্জ (টাকা)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                        <input
                          type="number"
                          min="0"
                          value={deliveryForm.expressDeliveryFee}
                          onChange={(e) => setDeliveryForm({ ...deliveryForm, expressDeliveryFee: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#123184] outline-none text-sm font-bold text-slate-900 rounded-none transition-colors"
                          required
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">চেকআউটে জরুরি অপশন বেছে নিলে প্রযোজ্য</span>
                    </div>
                  </div>

                  {/* Live Simulation Note */}
                  <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-none text-xs text-slate-700 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#02975E] shrink-0" />
                      <span>
                        <b>ওয়েবসাইটে বর্তমান নিয়ম:</b> ৳{deliveryForm.freeDeliveryThreshold} টাকার কম অর্ডারে ডেলিভারি ফি <b>৳{deliveryForm.deliveryFee}</b>, এবং ৳{deliveryForm.freeDeliveryThreshold} বা তার বেশি অর্ডারে <b>সম্পূর্ণ ফ্রি</b>।
                      </span>
                    </div>
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0d2463] hover:to-[#027e4e] text-white px-5 py-2 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>ডেলিভারি চার্জ সেভ করুন</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: COUPON CODES MANAGEMENT */}
              <div className="bg-white border border-slate-200 p-6 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#123184]">
                        কুপন কোড ও ডিসকাউন্ট অফার
                      </h3>
                      <p className="text-xs text-slate-500">
                        নতুন কুপন কোড তৈরি করুন অথবা বিদ্যমান কোডের ছাড় ও সক্রিয়তা নিয়ন্ত্রণ করুন।
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenAddCoupon}
                    className="bg-[#02975E] hover:bg-[#027e4e] text-white px-4 py-2 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন কুপন যোগ করুন</span>
                  </button>
                </div>

                {/* Coupons Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="p-3">কুপন কোড</th>
                        <th className="p-3">ছাড়ের পরিমাণ</th>
                        <th className="p-3">বিবরণ</th>
                        <th className="p-3">ন্যূনতম অর্ডার</th>
                        <th className="p-3">সর্বোচ্চ ছাড়</th>
                        <th className="p-3 text-center">স্ট্যাটাস</th>
                        <th className="p-3 text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <span className="font-mono font-black text-sm bg-blue-50 text-[#123184] px-2.5 py-1 border border-blue-200 inline-block tracking-wider">
                              {coupon.code}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            {coupon.type === 'percent' ? (
                              <span className="text-[#02975E] font-black">{coupon.value}% ছাড়</span>
                            ) : (
                              <span className="text-blue-700 font-black">৳{coupon.value} ফ্ল্যাট ছাড়</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 max-w-xs truncate font-medium">
                            {coupon.description || '—'}
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">
                            {coupon.minOrder > 0 ? `৳${coupon.minOrder}` : 'যেকোনো অর্ডার'}
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">
                            {coupon.type === 'percent' && coupon.maxDiscount > 0 ? `৳${coupon.maxDiscount}` : 'সীমাহীন'}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleCouponStatus(coupon.id)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-full cursor-pointer transition-all ${
                                coupon.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                              title="ক্লিক করে স্ট্যাটাস পরিবর্তন করুন"
                            >
                              {coupon.isActive ? '● সক্রিয়' : '○ নিষ্ক্রিয়'}
                            </button>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditCoupon(coupon)}
                                className="p-1.5 hover:bg-blue-50 text-[#123184] rounded-sm transition-colors cursor-pointer"
                                title="এডিট করুন"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`কুপন '${coupon.code}' ডিলিট করতে চান?`)) {
                                    deleteCoupon(coupon.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-sm transition-colors cursor-pointer"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* TAB: BANNER & POPUP ADS MANAGEMENT */}
          {/* ================================================= */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full">
              
              {/* Sub-Tabs Switcher: Hero Banner vs Popup Ads */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setBannerTab('hero')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    bannerTab === 'hero'
                      ? 'bg-[#123184] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>১. ওয়েবসাইটের মূল হিরো ব্যানার (Hero Banner)</span>
                  {heroBanner?.imageUrl ? (
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">কাস্টম ফটো সক্রিয়</span>
                  ) : (
                    <span className="text-[10px] bg-slate-300 text-slate-700 px-2 py-0.5 rounded-full font-bold">ডিফল্ট গ্র্যাডিয়েন্ট</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setBannerTab('popup')}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    bannerTab === 'popup'
                      ? 'bg-[#123184] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>২. অফার ও পপআপ বিজ্ঞাপন (Offer Popup)</span>
                  {adForm.isActive ? (
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold">অনলাইন সক্রিয়</span>
                  ) : (
                    <span className="text-[10px] bg-slate-300 text-slate-700 px-2 py-0.5 rounded-full font-bold">বন্ধ রয়েছে</span>
                  )}
                </button>
              </div>

              {/* ================================================= */}
              {/* SUB-SECTION 1: HERO BANNER MANAGEMENT */}
              {/* ================================================= */}
              {bannerTab === 'hero' && (
                <div className="space-y-6">
                  {/* Banner Size & Specification Recommendation Card */}
                  <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                            সাইজ নির্দেশিকা (Banner Dimensions)
                          </span>
                          <span className="text-xs text-blue-200 font-semibold">সঠিক ডিসপ্লে ও সুন্দর ফ্রেমের জন্য</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-black text-white">
                          হিরো ব্যানারের আদর্শ সাইজ: <span className="text-emerald-400 font-black underline decoration-emerald-400/50">১২৮০ × ৩২০ পিক্সেল (1280 × 320 px)</span>
                        </h4>
                        <p className="text-xs text-blue-100/90 leading-relaxed max-w-2xl">
                          এই সাইজের (৪:১ অনুপাত) ব্যানার আপলোড করলে কম্পিউটার, ল্যাপটপ, ট্যাবলেট বা মোবাইল ফোন—যেকোনো স্ক্রিনে ছবি ক্রপ ছাড়া নিখুঁতভাবে প্রদর্শিত হবে।
                        </p>
                      </div>

                      {/* Specs badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center shrink-0">
                        <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl">
                          <span className="text-[10px] text-blue-200 block font-bold">প্রস্তাবিত রেজোলিউশন</span>
                          <span className="text-xs font-black text-emerald-300">1280 × 320 px</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl">
                          <span className="text-[10px] text-blue-200 block font-bold">রেশিও (অনুপাত)</span>
                          <span className="text-xs font-black text-amber-300">৪:১ (4:1 Ratio)</span>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-2 rounded-xl col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-blue-200 block font-bold">ফরম্যাট ও সাইজ</span>
                          <span className="text-xs font-black text-cyan-300">JPG, PNG (সর্বোচ্চ 2MB)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Form & Live Preview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Form Controls (7 cols) */}
                    <div className="lg:col-span-7 bg-white border border-slate-200 p-6 shadow-xs rounded-2xl space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#123184] flex items-center justify-center font-bold">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-base text-[#123184]">
                              হিরো ব্যানার পরিবর্তন ও কনফিগারেশন
                            </h3>
                            <p className="text-xs text-slate-500">
                              ওয়েবসাইটের হোমপেজের উপরের মূল ব্যাকগ্রাউন্ড ফটো বা ব্যানার পরিবর্তন করুন
                            </p>
                          </div>
                        </div>

                        {heroForm.imageUrl && (
                          <button
                            type="button"
                            onClick={handleResetHeroBanner}
                            className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="ডিফল্ট গ্র্যাডিয়েন্টে ফেরত যান"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>রিসেট</span>
                          </button>
                        )}
                      </div>

                      <form onSubmit={handleSaveHeroBanner} className="space-y-5">
                        {/* Image Selection Method (File upload vs Direct URL) */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                            <span>ব্যানার ফটো নির্বাচন পদ্ধতি:</span>
                            <span className="text-[11px] text-emerald-700 font-semibold">১২৮০ × ৩২০ px সাইজের ছবি দিন</span>
                          </label>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setHeroUploadMethod('file')}
                              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                heroUploadMethod === 'file'
                                  ? 'bg-[#123184] text-white border-[#123184]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>ডিভাইস থেকে ফাইল আপলোড</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setHeroUploadMethod('url')}
                              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                heroUploadMethod === 'url'
                                  ? 'bg-[#123184] text-white border-[#123184]'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>অনলাইন ছবির সরাসরি লিংক (URL)</span>
                            </button>
                          </div>

                          {heroUploadMethod === 'file' ? (
                            <div className="border-2 border-dashed border-slate-300 hover:border-[#123184] p-6 text-center bg-slate-50 rounded-xl transition-colors">
                              <input
                                type="file"
                                ref={heroFileInputRef}
                                accept="image/*"
                                onChange={handleHeroImageFileChange}
                                className="hidden"
                              />
                              <div className="space-y-3">
                                <div className="w-12 h-12 rounded-full bg-blue-100 text-[#123184] flex items-center justify-center mx-auto">
                                  <Camera className="w-6 h-6" />
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => heroFileInputRef.current?.click()}
                                    disabled={isUploadingHero}
                                    className="bg-[#123184] hover:bg-[#0e2669] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                                  >
                                    {isUploadingHero ? 'ফটো অপটিমাইজ ও আপলোড হচ্ছে...' : 'কম্পিউটার বা মোবাইল থেকে ব্যানার ছবি নির্বাচন করুন'}
                                  </button>
                                  <span className="block text-[11px] text-slate-400 mt-2 font-medium">
                                    ১২৮০ × ৩২০ পিক্সেল (৪:১ রেশিও) ছবি সবচেয়ে ভালো দেখাবে • সর্বোচ্চ ২ MB
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <input
                                type="url"
                                value={heroForm.imageUrl}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHeroForm(prev => ({ ...prev, imageUrl: val }));
                                }}
                                placeholder="https://example.com/banner-1280x320.jpg"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#123184] outline-none text-xs text-slate-900 rounded-xl transition-colors"
                              />
                              <span className="text-[10px] text-slate-400 block">
                                যেকোনো হোস্ট করা ছবির ডিরেক্ট URL পেস্ট করুন (অনুপাত ৪:১ হলে ক্রপ ছাড়া সুন্দর আসবে)
                              </span>
                            </div>
                          )}

                          {heroForm.imageUrl && (
                            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                              <span className="flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-4 h-4 text-[#02975E]" />
                                কাস্টম ব্যানার ফটো সিলেক্টেড রয়েছে
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setHeroForm(prev => ({ ...prev, imageUrl: '' }));
                                }}
                                className="text-rose-600 hover:text-rose-800 text-[11px] font-bold underline cursor-pointer"
                              >
                                ছবি রিমুভ করুন
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Overlay and Text Display Toggles */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          {/* Toggle: Dark Overlay */}
                          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">কালো রিডাবিলিটি ওভারলে</span>
                              <span className="text-[10px] text-slate-500">লেখা স্পষ্ট পড়ার জন্য ডার্ক শেড</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={heroForm.showOverlay}
                                onChange={(e) => setHeroForm(prev => ({ ...prev, showOverlay: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#02975E]"></div>
                            </label>
                          </div>

                          {/* Toggle: Show Text */}
                          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">ব্যানারের লেখা দেখান</span>
                              <span className="text-[10px] text-slate-500">ছবির ভেতরে লেখা থাকলে অফ করুন</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={heroForm.showText}
                                onChange={(e) => setHeroForm(prev => ({ ...prev, showText: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#02975E]"></div>
                            </label>
                          </div>
                        </div>

                        {/* Text Content Inputs (Only active if showText is true) */}
                        {heroForm.showText && (
                          <div className="space-y-3.5 p-4 bg-slate-50/80 border border-slate-200 rounded-xl">
                            <span className="text-xs font-extrabold text-[#123184] block border-b border-slate-200 pb-1.5">
                              ব্যানারের শিরোনাম ও সাবটাইটেল কাস্টমাইজেশন:
                            </span>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 block">
                                  শিরোনাম লাইন ১:
                                </label>
                                <input
                                  type="text"
                                  value={heroForm.titleLine1}
                                  onChange={(e) => setHeroForm(prev => ({ ...prev, titleLine1: e.target.value }))}
                                  placeholder="প্রয়োজনে দ্রুত আসল ওষুধ"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#123184] outline-none text-xs rounded-xl"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-700 block">
                                  শিরোনাম লাইন ২ (হাইলাইটেড):
                                </label>
                                <input
                                  type="text"
                                  value={heroForm.titleLine2}
                                  onChange={(e) => setHeroForm(prev => ({ ...prev, titleLine2: e.target.value }))}
                                  placeholder="পৌঁছে যাবে আপনার দোরগোড়ায়"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#123184] outline-none text-xs rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700 block">
                                সাবটাইটেল / বিবরণ:
                              </label>
                              <textarea
                                rows={2}
                                value={heroForm.subtitle}
                                onChange={(e) => setHeroForm(prev => ({ ...prev, subtitle: e.target.value }))}
                                placeholder="প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন..."
                                className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-[#123184] outline-none text-xs rounded-xl"
                              />
                            </div>
                          </div>
                        )}

                        {/* Save & Publish Button */}
                        <div className="pt-2 flex flex-col sm:flex-row gap-3">
                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e2669] hover:to-[#027e4e] text-white py-3.5 px-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>হিরো ব্যানার সেভ ও লাইভ আপডেট করুন (Save & Publish)</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Right Column: Live Mockup / Preview (5 cols) */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#123184]" />
                          <span>হোমপেজ লাইভ প্রিভিউ (Live Preview):</span>
                        </span>
                        <span className="text-[11px] text-slate-400">অনুপাত ৪:১ (1280×320)</span>
                      </div>

                      {/* Mockup Container imitating Hero.jsx */}
                      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-300 aspect-[4/1.2] min-h-[220px] flex flex-col justify-center">
                        {heroForm.imageUrl ? (
                          <div 
                            className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                            style={{ backgroundImage: `url(${heroForm.imageUrl})` }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-r from-[#123184] via-[#0d235c] to-[#02975E]">
                            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none"></div>
                          </div>
                        )}

                        {/* Overlay */}
                        {heroForm.imageUrl && heroForm.showOverlay && (
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/60 to-slate-950/40 pointer-events-none"></div>
                        )}

                        {/* Content Preview */}
                        <div className="relative z-10 p-5 text-white space-y-2">
                          {heroForm.showText ? (
                            <>
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] text-emerald-300 font-bold border border-white/10">
                                <span>{config.name}</span>
                                <span>•</span>
                                <span>২৪/৭ হোম ডেলিভারি</span>
                              </div>
                              <h2 className="text-base sm:text-lg font-black leading-tight drop-shadow-md">
                                {heroForm.titleLine1 || 'প্রয়োজনে দ্রুত আসল ওষুধ'} <br />
                                <span className="text-emerald-400">{heroForm.titleLine2 || 'পৌঁছে যাবে আপনার দোরগোড়ায়'}</span>
                              </h2>
                              <p className="text-[11px] text-slate-200 line-clamp-2 max-w-sm drop-shadow-xs">
                                {heroForm.subtitle || 'প্রেসক্রিপশন আপলোড করুন অথবা নাম দিয়ে ওষুধ খুঁজুন...'}
                              </p>
                            </>
                          ) : (
                            <div className="text-center py-6">
                              <span className="inline-block px-3 py-1 rounded-full bg-black/50 text-white text-[11px] font-bold backdrop-blur-md border border-white/20">
                                ব্যানার ফটোতে টেক্সট লুকানো রয়েছে (ছবির ভেতরের লেখা দেখা যাবে)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Corner indicator */}
                        <div className="absolute bottom-2 right-2 z-20">
                          <span className="text-[9px] px-2 py-0.5 rounded-md bg-black/60 text-white font-mono">
                            {heroForm.imageUrl ? 'কাস্টম ছবি (4:1)' : 'ডিফল্ট থিম'}
                          </span>
                        </div>
                      </div>

                      {/* Info tip */}
                      <div className="p-3 bg-blue-50/80 border border-blue-200 text-xs text-blue-900 rounded-xl space-y-1">
                        <p className="font-bold flex items-center gap-1 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                          <span>ডিভাইস অ্যাডাপ্টেশন তথ্য:</span>
                        </p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          ১২৮০ × ৩২০ পিক্সেলের ছবি ওয়েবসাইটে সম্পূর্ণভাবে বিস্তৃত থাকে। আপনি সেভ বাটনে ক্লিক করলে তা সরাসরি ক্লাউডে সংরক্ষিত হবে এবং সকল ভিজিটর ও ডিভাইসে কোনো রিলোড ছাড়াই সাথে সাথে নতুন ব্যানার দেখতে পাবেন।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* SUB-SECTION 2: POPUP ADS MANAGEMENT */}
              {/* ================================================= */}
              {bannerTab === 'popup' && (
                <div className="space-y-6">
                  {/* Quick Status Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-slate-200 p-4 shadow-xs rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-bold block">পপআপ ফটো বিজ্ঞাপন স্ট্যাটাস</span>
                        <span className={`text-xl font-black ${adForm.isActive ? 'text-[#02975E]' : 'text-slate-400'}`}>
                          {adForm.isActive ? '✅ চালু রয়েছে (Active)' : '❌ বন্ধ রয়েছে (Disabled)'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !adForm.isActive;
                          setAdForm(prev => ({ ...prev, isActive: next }));
                          updateAdBanner({ ...adForm, isActive: next });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          adForm.isActive 
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        {adForm.isActive ? 'বিজ্ঞাপন বন্ধ করুন' : 'বিজ্ঞাপন চালু করুন'}
                      </button>
                    </div>

                    <div className="bg-white border border-slate-200 p-4 shadow-xs rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-bold block">লাইভ পপআপ টেস্ট</span>
                        <span className="text-xs text-slate-400">ওয়েবসাইটে ছবি কেমন দেখাবে দেখুন</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdModalOpen(true);
                        }}
                        className="bg-[#123184] hover:bg-[#0d2463] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        <span>পপআপ টেস্ট করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Form & Live Preview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Column: Photo Upload Form (6 cols) */}
                    <div className="lg:col-span-6 bg-white border border-slate-200 p-6 shadow-xs rounded-2xl space-y-5">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-9 h-9 rounded-xl bg-[#02975E]/10 text-[#02975E] flex items-center justify-center">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-[#123184]">
                            অফার / অ্যাডস ফটো আপলোড
                          </h3>
                          <p className="text-xs text-slate-500">
                            এখানে আপনার যেকোনো অফারের ফটো/ব্যানার আপলোড করুন। গ্রাহক ওয়েবসাইটে ঢুকলে শুধু এই ছবিটিই পপআপ আকারে দেখতে পাবেন।
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveAdBanner} className="space-y-5">
                        
                        {/* Status Toggle */}
                        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">বিজ্ঞাপন পপআপ সক্রিয় রাখুন</span>
                            <span className="text-[11px] text-slate-500">গ্রাহক পেজ ওপেন করলে ছবির পপআপ আসবে কিনা</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={adForm.isActive}
                              onChange={(e) => {
                                const val = e.target.checked;
                                const updated = {
                                  ...adBanner,
                                  ...adForm,
                                  isActive: val,
                                  updatedAt: new Date().toISOString()
                                };
                                setAdForm(updated);
                                updateAdBanner(updated);
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#02975E]"></div>
                          </label>
                        </div>

                        {/* Image Selection Method (File upload vs Direct URL) */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-700 block">
                            বিজ্ঞাপনের ফটো আপলোড বা লিংক নির্বাচন:
                          </label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setImageUploadMethod('file')}
                              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                imageUploadMethod === 'file' 
                                  ? 'bg-[#123184] text-white border-[#123184]' 
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>ডিভাইস থেকে ছবি আপলোড</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageUploadMethod('url')}
                              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                imageUploadMethod === 'url' 
                                  ? 'bg-[#123184] text-white border-[#123184]' 
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>ছবির অনলাইন লিংক (URL)</span>
                            </button>
                          </div>

                          {imageUploadMethod === 'file' ? (
                            <div className="border-2 border-dashed border-slate-300 hover:border-[#02975E] p-6 text-center bg-slate-50 rounded-xl transition-colors">
                              <input 
                                type="file"
                                ref={adFileInputRef}
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className="hidden"
                              />
                              <div className="space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#02975E] flex items-center justify-center mx-auto">
                                  <Camera className="w-6 h-6" />
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => adFileInputRef.current?.click()}
                                    disabled={isUploadingImage}
                                    className="bg-[#02975E] hover:bg-[#027e4e] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                                  >
                                    {isUploadingImage ? 'ছবি অপটিমাইজ ও সেভ হচ্ছে...' : 'কম্পিউটার বা মোবাইল থেকে ফটো নির্বাচন করুন'}
                                  </button>
                                  <span className="block text-[11px] text-slate-400 mt-2">
                                    JPG, PNG, WebP ফরম্যাট সমর্থিত (অটোমেটিক কম্প্রেস ও সেভ হবে)
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <input 
                                type="url"
                                value={adForm.imageUrl}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setAdForm(prev => ({ ...prev, imageUrl: val }));
                                }}
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
                                    const updated = {
                                      ...adBanner,
                                      ...adForm,
                                      imageUrl: val,
                                      isActive: true,
                                      updatedAt: new Date().toISOString()
                                    };
                                    setAdForm(updated);
                                    updateAdBanner(updated);
                                  }
                                }}
                                placeholder="https://example.com/offer-banner.jpg"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#123184] outline-none text-xs text-slate-900 rounded-xl transition-colors"
                              />
                              <span className="text-[10px] text-slate-400 block">
                                যেকোনো অনলাইন ছবির সরাসরি লিংক পেস্ট করুন
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#123184] to-[#02975E] hover:from-[#0e2669] hover:to-[#027e4e] text-white py-3.5 px-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            <span>ফটো ব্যানার সেভ ও লাইভ পাবলিশ করুন (Save & Publish)</span>
                          </button>
                        </div>

                      </form>
                    </div>

                    {/* Right Column: Real-Time Live Preview (6 cols) */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-[#123184]" />
                          <span>লাইভ ফটো প্রিভিউ (Live Preview):</span>
                        </span>
                        <span className="text-[11px] text-slate-400">গ্রাহক ঠিক এই ফটোটিই দেখতে পাবেন</span>
                      </div>

                      {/* Pure Photo Preview Mockup */}
                      <div className="relative bg-slate-900/10 p-3 rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden max-w-sm sm:max-w-md mx-auto text-center">
                        {/* Simulated Close Button */}
                        <div className="absolute top-5 right-5 z-20 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center shadow-md border border-white/20">
                          <X className="w-4 h-4" />
                        </div>

                        {/* Banner Image */}
                        <div className="relative w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center min-h-[220px]">
                          {adForm.imageUrl ? (
                            <img 
                              src={adForm.imageUrl} 
                              alt="Ad Preview" 
                              className="w-full h-auto max-h-[380px] object-contain rounded-xl"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-400 text-xs gap-2 p-8">
                              <ImageIcon className="w-10 h-10 text-slate-300" />
                              <span>কোনো ব্যানার ছবি দেওয়া হয়নি</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-3.5 bg-blue-50/70 border border-blue-200 text-xs text-blue-900 rounded-2xl space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-700" />
                          <span>টিপস:</span>
                        </p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          বিজ্ঞাপনের ব্যানারে কোনো অতিরিক্ত টেক্সট বক্স বা ওষুধের নাম থাকবে না। আপনার অফারের লেখা, কুপন বা ওষুধের ছবি সরাসরি ব্যানারের ভেতরে ডিজাইন করে ফটোটি আপলোড করে দিন।
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================= */}
          {/* TAB 5: PHARMACY SETTINGS & INFO */}
          {/* ================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-4 max-w-3xl mx-auto w-full">
              <div className="bg-white rounded-none border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#123184]">ফার্মেসি প্রোফাইল ও লগইন বিবরণ</h3>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">ফার্মেসির নাম:</span>
                    <span className="text-sm font-black text-slate-900">{config.name} ({config.nameBn})</span>
                  </div>

                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">অফিসিয়াল স্লোগান:</span>
                    <span className="text-sm font-black text-[#02975E]">{config.slogan}</span>
                  </div>

                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">অ্যাডমিন আইডি (Username):</span>
                    <code className="text-sm font-mono font-black text-[#123184]">{config.adminUsername}</code>
                  </div>

                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">অ্যাডমিন পাসওয়ার্ড:</span>
                    <code className="text-sm font-mono font-black text-[#02975E]">{config.adminPassword}</code>
                  </div>

                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">হটলাইন ও ফোন:</span>
                    <span className="text-sm font-black text-slate-900">{config.phone}</span>
                  </div>

                  <div className="p-3 rounded-none bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-500 block">বিকাশ ও নগদ পেমেন্ট নম্বর:</span>
                    <span className="text-sm font-black text-slate-900">{config.bkashNumber}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#02975E]" />
                  <span>লাইসেন্স নং: DA-DH-2024-9182 • ড্রাগ কন্ট্রোল অ্যাডমিনিস্ট্রেশন</span>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>


      {/* Edit Medicine Modal */}
      {editingMed && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setEditingMed(null)}
        >
          <div 
            className="bg-white rounded-none max-w-2xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <Edit3 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    ওষুধের তথ্য পরিবর্তন (Edit Medicine)
                  </h3>
                  <p className="text-xs text-blue-100">
                    আইডি: #{editingMed.id} • {editingMed.name} ({editingMed.company})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingMed(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ওষুধের নাম (Brand Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMed.name || ''}
                    onChange={(e) => setEditingMed({ ...editingMed, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/10 outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    জেনেরিক নাম (Generic) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMed.generic || ''}
                    onChange={(e) => setEditingMed({ ...editingMed, generic: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/10 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    কোম্পানি / প্রস্তুতকারক *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMed.company || ''}
                    onChange={(e) => setEditingMed({ ...editingMed, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] focus:ring-2 focus:ring-[#02975E]/10 outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ক্যাটাগরি (Category)
                  </label>
                  <select
                    value={editingMed.category || 'otc'}
                    onChange={(e) => setEditingMed({ ...editingMed, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:border-[#02975E] outline-none text-slate-900 font-medium"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.nameBn} ({c.name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ধরণ (Form / Type)
                  </label>
                  <select
                    value={editingMed.type || 'Tablet'}
                    onChange={(e) => setEditingMed({ ...editingMed, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:border-[#02975E] outline-none text-slate-900 font-medium"
                  >
                    <option value="Tablet">Tablet (ট্যাবলেট)</option>
                    <option value="Capsule">Capsule (ক্যাপসুল)</option>
                    <option value="Syrup">Syrup (সিরাপ)</option>
                    <option value="Drop">Drop (ড্রপ)</option>
                    <option value="Cream">Cream / Ointment (মলম)</option>
                    <option value="Device">Device (ডিভাইস/যন্ত্র)</option>
                    <option value="Pack">Pack / Box (প্যাক)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    পাতায় পিস সংখ্যা (Strip Size)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingMed.stripSize || 10}
                    onChange={(e) => setEditingMed({ ...editingMed, stripSize: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    পাতা প্রতি মূল্য (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingMed.pricePerStrip}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const size = editingMed.stripSize || 10;
                      const unitVal = Number((val / size).toFixed(2));
                      setEditingMed({ ...editingMed, pricePerStrip: val, pricePerUnit: unitVal });
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none font-bold text-[#123184]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    পিস প্রতি মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingMed.pricePerUnit}
                    onChange={(e) => setEditingMed({ ...editingMed, pricePerUnit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ডিসকাউন্ট (% ছাড়)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editingMed.discountPercent}
                    onChange={(e) => setEditingMed({ ...editingMed, discountPercent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    স্টক সংখ্যা (Stock in pcs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingMed.stock}
                    onChange={(e) => setEditingMed({ ...editingMed, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none font-bold text-emerald-700"
                  />
                </div>

                <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50/70 via-blue-50/40 to-slate-50 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#02975E]" />
                      <span>প্রোডাক্টের ছবি আপলোড (Product Photo) *</span>
                    </label>
                    <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                      ✓ গ্রাহকরা এই ছবিটিই দেখতে পাবেন
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Live Image Preview Thumbnail */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-1.5">
                        {editingMed.image ? (
                          <img 
                            src={editingMed.image} 
                            alt={editingMed.name || 'Product'} 
                            className="w-full h-full object-contain rounded-xl"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60';
                            }}
                          />
                        ) : (
                          <div className="text-center text-slate-400">
                            <ImageIcon className="w-8 h-8 mx-auto stroke-1 text-slate-400" />
                            <span className="text-[10px] block mt-0.5">ছবি নেই</span>
                          </div>
                        )}
                      </div>

                      {editingMed.image && (
                        <button
                          type="button"
                          onClick={() => setEditingMed({ ...editingMed, image: '' })}
                          title="ছবি রিমুভ করুন"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2 w-full">
                      <input 
                        type="file" 
                        ref={editImageInputRef} 
                        onChange={handleEditPhotoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editImageInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all hover:shadow"
                        >
                          <Upload className="w-4 h-4" />
                          <span>ডিভাইস থেকে ছবি আপলোড করুন</span>
                        </button>

                        {editingMed.image && (
                          <button
                            type="button"
                            onClick={() => setEditingMed({ ...editingMed, image: '' })}
                            className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                          >
                            ছবি মুছুন
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500">
                        মোবাইল ক্যামেরা বা গ্যালারি থেকে যেকোনো JPG, PNG, WEBP ছবি দিন। ছবি অপটিমাইজ হয়ে সেভ হবে।
                      </p>

                      {/* Optional URL input fallback */}
                      <div className="pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-500 whitespace-nowrap">অথবা অনলাইন লিংক:</span>
                          <input
                            type="url"
                            value={editingMed.image?.startsWith('data:') ? '' : (editingMed.image || '')}
                            onChange={(e) => setEditingMed({ ...editingMed, image: e.target.value })}
                            placeholder={editingMed.image?.startsWith('data:') ? '✓ ডিভাইস থেকে ছবি আপলোড করা হয়েছে' : 'https://example.com/photo.jpg'}
                            className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none text-[11px] font-mono text-slate-700 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    কার্যকারিতা ও বিবরণ (Description)
                  </label>
                  <textarea
                    rows="2"
                    value={editingMed.description || ''}
                    onChange={(e) => setEditingMed({ ...editingMed, description: e.target.value })}
                    placeholder="ওষুধের কার্যকারিতা ও নির্দেশিকা..."
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-[#02975E] outline-none text-slate-900"
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      checked={editingMed.requiresPrescription || false}
                      onChange={(e) => setEditingMed({ ...editingMed, requiresPrescription: e.target.checked })}
                      className="w-4 h-4 rounded text-[#02975E] focus:ring-[#02975E] cursor-pointer"
                    />
                    <span>প্রেসক্রিপশন আবশ্যক (Prescription Required - Rx Only)</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingMed(null)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#02975E] hover:bg-[#027e4e] text-white cursor-pointer shadow-md flex items-center gap-2 transition-all hover:shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Coupon Modal */}
      {showCouponModal && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setShowCouponModal(false)}
        >
          <div 
            className="bg-white rounded-none max-w-md w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-base">
                  {editingCouponId ? 'কুপন কোড পরিবর্তন (Edit Coupon)' : 'নতুন কুপন কোড তৈরি (Add Coupon)'}
                </h3>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCoupon} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  কুপন কোড (যেমন: EID20, DISCOUNT50) *
                </label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  placeholder="যেমন: BELI15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 font-mono font-bold uppercase text-slate-900 outline-none focus:border-[#123184]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  বিবরণ / অফারের নাম
                </label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="যেমন: ঈদ উপলক্ষে বিশেষ ১৫% ছাড়"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-[#123184]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ডিসকাউন্ট ধরন
                  </label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 font-bold text-slate-900 outline-none"
                  >
                    <option value="percent">শতাংশ ছাড় (%)</option>
                    <option value="flat">নির্দিষ্ট টাকা ছাড় (৳)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ছাড়ের পরিমাণ ({couponForm.type === 'percent' ? '%' : '৳'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 font-bold text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    ন্যূনতম অর্ডার মূল্য (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.minOrder}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrder: e.target.value })}
                    placeholder="0 = যেকোনো অর্ডার"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    সর্বোচ্চ ছাড় সীমা (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    placeholder="0 = সীমাহীন"
                    disabled={couponForm.type === 'flat'}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 outline-none disabled:bg-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="coupon_active_check"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#02975E] rounded-none cursor-pointer"
                />
                <label htmlFor="coupon_active_check" className="font-bold text-slate-800 cursor-pointer">
                  কুপনটি সক্রিয় (Active) রাখুন
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02975E] hover:bg-[#027e4e] text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCouponId ? 'আপডেট করুন' : 'তৈরি করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* MODAL: PRESCRIPTION MEDICINES ENTRY & PRICING */}
      {/* ================================================= */}
      {activeRxForMedicines && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setActiveRxForMedicines(null)}
        >
          <div 
            className="bg-white rounded-none w-[98vw] max-w-[1720px] my-2 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 sm:p-4 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <Pill className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
                    <span>প্রেসক্রিপশন অনুযায়ী ওষুধ এন্ট্রি ও মূল্য নির্ধারণ</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">#{activeRxForMedicines.id}</span>
                  </h3>
                  <p className="text-[11px] text-blue-100 line-clamp-1">
                    রোগী: <b className="text-white">{activeRxForMedicines.customerName}</b> ({activeRxForMedicines.customerPhone}) • ঠিকানা: {activeRxForMedicines.deliveryAddress}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveRxForMedicines(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Two column layout (Left: Prescription Image (50%), Right: Medicine Selector & List (50%)) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Left Column: Prescription Image (lg:col-span-6) */}
              <div className="lg:col-span-6 p-4 bg-slate-50 flex flex-col justify-between space-y-3">
                <div className="w-full flex-1 flex flex-col">
                  {/* Image Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#123184]" />
                      <span>প্রেসক্রিপশন কপি</span>
                    </span>

                    {activeRxForMedicines.image && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsRxEnlargedOnLeft(prev => !prev);
                            setRxZoom(prev => prev > 1 ? 1 : 1.6);
                          }}
                          className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer px-3 py-1 rounded transition-colors ${
                            isRxEnlargedOnLeft || rxZoom > 1
                              ? 'bg-[#123184] text-white shadow-xs'
                              : 'bg-blue-50 text-[#123184] hover:bg-blue-100 border border-blue-200 shadow-2xs'
                          }`}
                          title="বাম পাশে প্রেসক্রিপশন বড় জুম করে দেখুন"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isRxEnlargedOnLeft || rxZoom > 1 ? 'স্বাভাবিক সাইজ' : 'বড় করে দেখুন'}</span>
                        </button>

                        <div className="flex items-center bg-white border border-slate-200 rounded px-1 text-xs">
                          <button
                            type="button"
                            onClick={() => setRxZoom(z => Math.max(0.6, Number((z - 0.2).toFixed(2))))}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                            title="জুম আউট"
                          >
                            -
                          </button>
                          <span className="px-1 text-[10px] font-mono font-bold text-[#02975E]">
                            {Math.round(rxZoom * 100)}%
                          </span>
                          <button
                            type="button"
                            onClick={() => setRxZoom(z => Math.min(3, Number((z + 0.2).toFixed(2))))}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                            title="জুম ইন"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRxRotation(r => (r + 90) % 360)}
                          className="p-1 text-slate-600 hover:bg-white border border-slate-200 rounded cursor-pointer transition-colors"
                          title="ছবি ঘোরান (Rotate 90°)"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => { setRxZoom(1); setRxRotation(0); setIsRxEnlargedOnLeft(false); }}
                          className="px-2 py-0.5 text-[10px] text-slate-500 hover:bg-white border border-slate-200 rounded cursor-pointer"
                          title="রিসেট"
                        >
                          রিসেট
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Prescription High-Resolution Image Box */}
                  {activeRxForMedicines.image ? (
                    <div className="w-full bg-slate-900/5 border border-slate-300 rounded-none overflow-auto flex-1 min-h-[460px] max-h-[66vh] flex items-center justify-center p-2 shadow-inner relative group select-none">
                      <div 
                        className="transition-transform duration-200 ease-out flex items-center justify-center"
                        style={{
                          transform: `scale(${rxZoom}) rotate(${rxRotation}deg)`,
                          transformOrigin: 'center center'
                        }}
                      >
                        <img
                          src={activeRxForMedicines.image}
                          alt="Prescription Large"
                          className="max-h-[64vh] max-w-full object-contain cursor-zoom-in rounded shadow-md bg-white border border-slate-200"
                          onClick={() => {
                            setRxZoom(z => z > 1 ? 1 : 1.6);
                            setIsRxEnlargedOnLeft(prev => !prev);
                          }}
                          title="ক্লিক করে বড় বা স্বাভাবিক সাইজ করুন"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 w-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      ছবি পাওয়া যায়নি
                    </div>
                  )}

                  {activeRxForMedicines.notes && (
                    <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-none">
                      <span className="font-bold block">রোগীর নোট:</span>
                      <span>"{activeRxForMedicines.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="w-full text-xs text-slate-500 bg-white p-2.5 border border-slate-200">
                  <span className="font-bold block text-slate-700 mb-0.5">💡 ফার্মাসিস্ট টিপস:</span>
                  বামপাশে বড় প্রেসক্রিপশন দেখে সরাসরি ডানপাশে ওষুধ সার্চ করে যোগ করুন।
                </div>
              </div>

              {/* Right Column: Search Medicines & Prescribed List (lg:col-span-6) */}
              <div className="lg:col-span-6 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                
                {/* 1. Add Medicine Box */}
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-none space-y-3">
                  <h4 className="font-bold text-xs text-[#123184] flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#02975E]" />
                    <span>ক্যাটালগ থেকে ওষুধ সার্চ ও নির্বাচন করুন</span>
                  </h4>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={rxMedSearch}
                      onChange={(e) => {
                        setRxMedSearch(e.target.value);
                        if (selectedMedToAdd) setSelectedMedToAdd(null);
                      }}
                      placeholder="ওষুধের নাম বা জেনেরিক দিয়ে খুঁজুন (যেমন: Napa, Seclo, Monas)..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 text-xs font-semibold rounded-none outline-none focus:border-[#123184]"
                    />
                  </div>

                  {/* Live Search Suggestions Dropdown */}
                  {rxMedSearch.trim() !== '' && !selectedMedToAdd && (
                    <div className="max-h-52 overflow-y-auto bg-white border border-slate-300 shadow-md divide-y divide-slate-100 text-xs">
                      {isRxMedexLoading && (
                        <div className="p-2 bg-emerald-50 text-emerald-800 font-semibold text-[11px] flex items-center gap-1.5 border-b border-emerald-100 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                          <span>লাইভ ডাটাবেজ থেকে খোঁজা হচ্ছে...</span>
                        </div>
                      )}
                      {mergeSearchResults(searchMedicines(medicines, rxMedSearch).slice(0, 8), rxMedexResults)
                        .slice(0, 10)
                        .map(med => (
                          <div
                            key={med.id}
                            onClick={() => {
                              setSelectedMedToAdd(med);
                              setRxMedSearch(med.name);
                            }}
                            className="p-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center transition-colors"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-900">{med.name}</span>
                                {med.nameBn && med.nameBn !== med.name && (
                                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1 rounded font-medium border border-emerald-100">
                                    {med.nameBn}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">{med.generic} • {med.company?.replace(/MedEx(\s*Bangladesh)?(\s*Verified)?/gi, 'বাংলাদেশ ফার্মাসিউটিক্যালস')}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-black text-[#123184] block">৳{med.pricePerStrip}/পাতা</span>
                              <span className="text-[10px] text-slate-400">৳{med.pricePerUnit}/পিস</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Selected Medicine Quantity & Unit selector */}
                  {selectedMedToAdd && (
                    <div className="bg-white border border-emerald-300 p-3 space-y-2.5 animate-in fade-in">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm">{selectedMedToAdd.name}</span>
                          <span className="text-xs text-slate-500 block">{selectedMedToAdd.generic} • {selectedMedToAdd.company}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMedToAdd(null);
                            setRxMedSearch('');
                          }}
                          className="text-xs text-rose-500 hover:underline cursor-pointer"
                        >
                          পরিবর্তন
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-end text-xs pt-1">
                        <div>
                          <label className="font-bold text-slate-600 block mb-1">প্যাক নির্বাচন:</label>
                          <select
                            value={rxAddUnitType}
                            onChange={(e) => setRxAddUnitType(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 font-bold bg-slate-50 rounded-none outline-none"
                          >
                            <option value="strip">পাতা ({selectedMedToAdd.stripSize}টি) - ৳{(selectedMedToAdd.pricePerStrip * (1 - (selectedMedToAdd.discountPercent || 0) / 100)).toFixed(2)}</option>
                            <option value="unit">১ পিস - ৳{(selectedMedToAdd.pricePerUnit * (1 - (selectedMedToAdd.discountPercent || 0) / 100)).toFixed(2)}</option>
                          </select>
                        </div>

                        <div>
                          <label className="font-bold text-slate-600 block mb-1">পরিমাণ:</label>
                          <div className="flex items-center border border-slate-300 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setRxAddQuantity(Math.max(1, rxAddQuantity - 1))}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-black text-slate-900">{rxAddQuantity}</span>
                            <button
                              type="button"
                              onClick={() => setRxAddQuantity(rxAddQuantity + 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={handleAddMedicineToRx}
                            className="w-full bg-[#02975E] hover:bg-[#027e4e] text-white font-bold py-1.5 px-3 rounded-none text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>তালিকায় যোগ করুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Added Medicines List Table */}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-700">
                      প্রেসক্রিপশনের ওষুধের তালিকা ({rxMedicinesList.length}টি)
                    </span>
                    <span className="text-xs text-slate-500">
                      মোট হিসাব: <b className="text-[#123184] text-sm">৳{rxMedicinesList.reduce((sum, i) => sum + i.total, 0).toFixed(2)}</b>
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto border border-slate-200 divide-y divide-slate-100 text-xs">
                    {rxMedicinesList.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 italic">
                        এখনও কোনো ওষুধ যোগ করা হয়নি। উপরের বক্স থেকে ওষুধ নির্বাচন করুন।
                      </div>
                    ) : (
                      rxMedicinesList.map((item, idx) => (
                        <div key={idx} className="p-2.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-slate-900 block truncate">{item.name}</span>
                            <span className="text-[11px] text-slate-500">{item.unitLabel} • একক মূল্য: ৳{item.unitPrice}</span>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center border border-slate-200 bg-white">
                              <button
                                type="button"
                                onClick={() => handleUpdateRxItemQuantity(idx, (Number(item.quantity) || 1) - 1)}
                                className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity === '' ? '' : item.quantity}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === '') {
                                    handleUpdateRxItemQuantity(idx, '');
                                  } else {
                                    const n = parseInt(val, 10);
                                    if (!isNaN(n)) handleUpdateRxItemQuantity(idx, n);
                                  }
                                }}
                                onBlur={() => {
                                  if (!item.quantity || Number(item.quantity) < 1) handleUpdateRxItemQuantity(idx, 1);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') e.currentTarget.blur();
                                }}
                                className="w-10 text-center font-bold text-slate-800 text-xs border-none outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:bg-emerald-50"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateRxItemQuantity(idx, (Number(item.quantity) || 0) + 1)}
                                className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="font-black text-slate-900 w-16 text-right">
                              ৳{item.total.toFixed(2)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineFromRx(idx)}
                              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Pharmacist Notes / Directions */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    ফার্মাসিস্ট পরামর্শ ও খাবার নিয়মাবলী (ঐচ্ছিক):
                  </label>
                  <input
                    type="text"
                    value={rxPharmacistNotes}
                    onChange={(e) => setRxPharmacistNotes(e.target.value)}
                    placeholder="যেমন: সকালে ১টি রাতে ১টি খাবার পর। ভরা পেটে সেব্য..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-none outline-none focus:border-[#123184]"
                  />
                </div>

                {/* 3.1 Voice Note (Audio Directions) */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-none space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                      <Mic className="w-4 h-4 text-amber-600" />
                      <span>🎙️ প্রেসক্রিপশন অডিও সেবনবিধি (ভয়েস নোট):</span>
                    </div>
                    {rxVoiceDuration && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        দৈর্ঘ্য: {rxVoiceDuration}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    বয়স্ক রোগী বা পড়তে সমস্যা হওয়া কাস্টমারদের জন্য মুখে বলে দিন কোন ওষুধ কখন খাবেন (যেমন: "চাচা, লাল ট্যাবলেটটি সকালে ও রাতে ভরা পেটে ১টা খাবেন...")।
                  </p>

                  {/* Audio Player if recorded/uploaded */}
                  {rxVoiceNote ? (
                    <div className="space-y-2">
                      <VoiceNotePlayer 
                        audioUrl={rxVoiceNote} 
                        pharmacistNotes={rxPharmacistNotes}
                        durationLabel={rxVoiceDuration}
                        label="সংযুক্ত অডিও নির্দেশিকা"
                        isCompact={true}
                      />
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          অডিও প্রস্তুত আছে! সংরক্ষণে এটি গ্রাহক প্রোফাইল ও অর্ডারে শুনতে পাবেন।
                        </span>
                        <button
                          type="button"
                          onClick={handleDeleteVoiceNote}
                          className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          <Trash2 className="w-3 h-3" />
                          অডিও মুছুন
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Recording & Upload Controls */
                    <div className="space-y-2">
                      {isRecordingVoice ? (
                        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-300 rounded">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                            </span>
                            <span className="text-xs font-black text-red-700">
                              রেকর্ডিং চলছে... {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={stopVoiceRecording}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow cursor-pointer transition-colors"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                              রেকর্ডিং সম্পন্ন
                            </button>
                            <button
                              type="button"
                              onClick={cancelVoiceRecording}
                              className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
                            >
                              বাতিল
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={startVoiceRecording}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            <span>মাইক্রোফোনে রেকর্ড করুন</span>
                          </button>

                          <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>অডিও ফাইল আপলোড</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleVoiceFileUpload}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleUseSampleVoice}
                            className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs flex items-center gap-1 border border-amber-300 cursor-pointer transition-colors ml-auto"
                            title="মাইক্রোফোন ছাড়া সরাসরি টেস্ট করতে ক্লিক করুন"
                          >
                            <span>নমুনা টেস্ট অডিও</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Action Strip */}
                <div className="p-3 bg-slate-100 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block">সর্বমোট প্রদেয় মূল্য:</span>
                    <span className="text-xl font-black text-[#123184]">
                      ৳{rxMedicinesList.reduce((sum, i) => sum + i.total, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveRxForMedicines(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs hover:bg-white cursor-pointer"
                    >
                      বাতিল
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePrescriptionMedicines}
                      disabled={rxMedicinesList.length === 0}
                      className="px-5 py-2 bg-[#02975E] hover:bg-[#027e4e] disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>সংরক্ষণ ও প্রোফাইলে পাঠান</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      )}

      {/* 1. Edit Customer Modal */}
      {editingCustomer && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setEditingCustomer(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <Edit3 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    গ্রাহকের তথ্য এডিট করুন (Edit Customer)
                  </h3>
                  <span className="text-[11px] text-blue-100">
                    {editingCustomer.name} • {editingCustomer.phone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditCustomer} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Profile Photo / Avatar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800">প্রোফাইল ছবি / অবতার:</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center shrink-0">
                    {editCustomerForm.avatar ? (
                      <img src={editCustomerForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#123184] text-white font-bold flex items-center justify-center text-lg">
                        {(editCustomerForm.name || 'গ').charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input 
                      type="file" 
                      ref={editCustomerPhotoRef} 
                      onChange={handleEditCustomerPhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editCustomerPhotoRef.current?.click()}
                        className="bg-[#02975E] hover:bg-[#027e4e] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>ছবি আপলোড</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)}
                        className="bg-[#123184] hover:bg-[#0d2463] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>প্রিসেট অবতার</span>
                      </button>
                      {editCustomerForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setEditCustomerForm(prev => ({ ...prev, avatar: null }))}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                        >
                          ছবি সরান
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Selection Grid */}
                {showEditAvatarPicker && (
                  <div className="pt-3 border-t border-slate-200 grid grid-cols-6 gap-2 animate-in fade-in">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setEditCustomerForm(prev => ({ ...prev, avatar: av.url }));
                          setShowEditAvatarPicker(false);
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 p-0.5 transition-all hover:scale-105 cursor-pointer ${
                          editCustomerForm.avatar === av.url ? 'border-[#02975E] ring-2 ring-[#02975E]/30' : 'border-slate-200'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-contain rounded-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">গ্রাহকের পুরো নাম *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editCustomerForm.name}
                    onChange={(e) => setEditCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#123184]"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={editCustomerForm.phone}
                    onChange={(e) => setEditCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="01711223344"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#123184] font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  মোবাইল নম্বর পরিবর্তন করলে গ্রাহকের সংশ্লিষ্ট অর্ডার ও প্রেসক্রিপশনেও নম্বরটি আপডেট হবে।
                </span>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ডেলিভারি ঠিকানা (Full Address)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows="3"
                    value={editCustomerForm.address}
                    onChange={(e) => setEditCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#123184]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#123184] to-[#02975E] text-white rounded-lg font-extrabold flex items-center gap-1.5 shadow-md hover:opacity-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add New Customer Modal */}
      {showAddCustomerModal && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setShowAddCustomerModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#027e4e] flex items-center justify-between bg-gradient-to-r from-[#02975E] to-[#123184] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <UserPlus className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    নতুন গ্রাহক নিবন্ধন করুন (Add Customer)
                  </h3>
                  <span className="text-[11px] text-emerald-100">
                    ম্যানুয়ালি নতুন গ্রাহকের প্রোফাইল ডাটাবেজে সংরক্ষণ করুন
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveNewCustomer} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Profile Photo / Avatar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800">প্রোফাইল ছবি / অবতার (ঐচ্ছিক):</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center shrink-0">
                    {newCustomerForm.avatar ? (
                      <img src={newCustomerForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#02975E] text-white font-bold flex items-center justify-center text-lg">
                        {(newCustomerForm.name || 'ন').charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input 
                      type="file" 
                      ref={newCustomerPhotoRef} 
                      onChange={handleNewCustomerPhotoUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => newCustomerPhotoRef.current?.click()}
                        className="bg-[#02975E] hover:bg-[#027e4e] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>ছবি আপলোড</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewAvatarPicker(!showNewAvatarPicker)}
                        className="bg-[#123184] hover:bg-[#0d2463] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>প্রিসেট অবতার</span>
                      </button>
                      {newCustomerForm.avatar && (
                        <button
                          type="button"
                          onClick={() => setNewCustomerForm(prev => ({ ...prev, avatar: null }))}
                          className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                        >
                          মুছুন
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preset Avatar Selection Grid */}
                {showNewAvatarPicker && (
                  <div className="pt-3 border-t border-slate-200 grid grid-cols-6 gap-2 animate-in fade-in">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          setNewCustomerForm(prev => ({ ...prev, avatar: av.url }));
                          setShowNewAvatarPicker(false);
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 p-0.5 transition-all hover:scale-105 cursor-pointer ${
                          newCustomerForm.avatar === av.url ? 'border-[#02975E] ring-2 ring-[#02975E]/30' : 'border-slate-200'
                        }`}
                        title={av.label}
                      >
                        <img src={av.url} alt={av.label} className="w-full h-full object-contain rounded-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">গ্রাহকের নাম (Name)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={newCustomerForm.name}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="যেমন: মো: রফিকুল ইসলাম"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#02975E]"
                  />
                </div>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">মোবাইল নম্বর (Phone) *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#02975E] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ডেলিভারি ঠিকানা (Address)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows="3"
                    value={newCustomerForm.address}
                    onChange={(e) => setNewCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="বাড়ি নং, রোড নং, এলাকা, থানা, জেলা..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#02975E]"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#02975E] hover:bg-[#027e4e] text-white rounded-lg font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>গ্রাহক তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Inspect Customer Orders Modal */}
      {inspectCustomer && (
        <div 
          className="fixed inset-0 z-60 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setInspectCustomer(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <Package className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg">
                    গ্রাহকের অর্ডার ও প্রেসক্রিপশন হিস্টোরি
                  </h3>
                  <span className="text-[11px] text-blue-100">
                    {inspectCustomer.name} • {inspectCustomer.phone}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectCustomer(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Customer Profile Summary Strip */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">ঠিকানা:</span>
                  <span className="font-semibold text-slate-800">{inspectCustomer.address || 'ঠিকানা দেওয়া হয়নি'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">মোট কেনাকাটা:</span>
                  <span className="font-black text-sm text-[#02975E]">
                    ৳{getCustomerStats(inspectCustomer.phone).totalSpent}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleStartEditCustomer(inspectCustomer);
                    setInspectCustomer(null);
                  }}
                  className="bg-[#123184] hover:bg-[#0d2463] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>তথ্য এডিট</span>
                </button>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#123184]" />
                  <span>অর্ডার সমূহ ({getCustomerStats(inspectCustomer.phone).orders.length} টি):</span>
                </h4>

                {getCustomerStats(inspectCustomer.phone).orders.length === 0 ? (
                  <p className="text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">কোনো অর্ডার পাওয়া যায়নি</p>
                ) : (
                  <div className="space-y-2.5">
                    {getCustomerStats(inspectCustomer.phone).orders.map((o) => (
                      <div key={o.id} className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveInvoiceOrder(o);
                              setInspectCustomer(null);
                            }}
                            className="font-bold text-[#123184] hover:text-[#02975E] underline decoration-dotted underline-offset-2 font-mono cursor-pointer transition-colors"
                            title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                          >
                            {o.id}
                          </button>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            o.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <span>{o.createdAt}</span>
                          <span className="font-black text-slate-900">৳{Number(o.grandTotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">
                            আইটেম: {Array.isArray(o.items) ? o.items.map(i => `${i.name} (x${i.quantity})`).join(', ') : 'তথ্য নেই'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveInvoiceOrder(o);
                              setInspectCustomer(null);
                            }}
                            className="text-[#123184] font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>চালান</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Calculator Tag on Right Edge (as requested by user) */}
      <div className="fixed right-0 top-[48%] -translate-y-1/2 z-40">
        <button
          type="button"
          onClick={() => setIsCalculatorOpen(prev => !prev)}
          className={`group flex items-center justify-center p-2.5 rounded-l-xl shadow-2xl border-l-2 border-y-2 border-white/40 cursor-pointer transition-all duration-200 hover:pr-3.5 focus:outline-none ${
            isCalculatorOpen 
              ? 'bg-rose-600 text-white shadow-rose-500/40 ring-2 ring-rose-400' 
              : 'bg-[#123184] hover:bg-[#02975E] text-white shadow-blue-900/40'
          }`}
          title="ক্যালকুলেটর (Quick Calculator)"
        >
          <Calculator className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
      </div>

      {/* Quick Floating Calculator Modal */}
      {isCalculatorOpen && (
        <div className="fixed right-12 top-[48%] -translate-y-1/2 z-50 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#123184] overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
          {/* Calculator Header */}
          <div className="bg-[#123184] text-white px-3.5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold tracking-wide">ক্যালকুলেটর (Calculator)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsCalculatorOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 cursor-pointer transition-colors"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Calculator Display */}
          <div className="bg-slate-900 text-white p-3 text-right font-mono select-none">
            <div className="text-[11px] text-slate-400 min-h-[16px] truncate">
              {calcInput || '0'}
            </div>
            <div className="text-2xl font-black text-emerald-400 tracking-wider truncate">
              {calcResult || (calcInput ? '' : '0')}
            </div>
          </div>

          {/* Keypad */}
          <div className="p-3 bg-slate-50 space-y-2">
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleCalcKeyPress('C')}
                className="p-2.5 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer active:scale-95 transition-all"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('DEL')}
                className="p-2.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer active:scale-95 transition-all"
                title="মুছুন"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('%')}
                className="p-2.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                %
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('÷')}
                className="p-2.5 rounded bg-blue-100 hover:bg-blue-200 text-[#123184] cursor-pointer active:scale-95 transition-all font-black text-sm"
              >
                ÷
              </button>

              <button
                type="button"
                onClick={() => handleCalcKeyPress('7')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                7
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('8')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                8
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('9')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                9
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('×')}
                className="p-2.5 rounded bg-blue-100 hover:bg-blue-200 text-[#123184] cursor-pointer active:scale-95 transition-all font-black text-sm"
              >
                ×
              </button>

              <button
                type="button"
                onClick={() => handleCalcKeyPress('4')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                4
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('5')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                5
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('6')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                6
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('-')}
                className="p-2.5 rounded bg-blue-100 hover:bg-blue-200 text-[#123184] cursor-pointer active:scale-95 transition-all font-black text-sm"
              >
                -
              </button>

              <button
                type="button"
                onClick={() => handleCalcKeyPress('1')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                1
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('2')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                2
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('3')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                3
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('+')}
                className="p-2.5 rounded bg-blue-100 hover:bg-blue-200 text-[#123184] cursor-pointer active:scale-95 transition-all font-black text-sm"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => handleCalcKeyPress('0')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('.')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all font-black text-sm"
              >
                .
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('00')}
                className="p-2.5 rounded bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 cursor-pointer active:scale-95 transition-all"
              >
                00
              </button>
              <button
                type="button"
                onClick={() => handleCalcKeyPress('=')}
                className="p-2.5 rounded bg-[#02975E] hover:bg-[#027e4e] text-white cursor-pointer active:scale-95 transition-all font-black text-base"
              >
                =
              </button>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-200 flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const val = calcResult || calcInput;
                  if (val && !isNaN(Number(val))) {
                    setSellReceivedAmount(val);
                    showToast?.(`৳${val} ক্যাশ বক্সে বসানো হয়েছে!`, 'success');
                  } else {
                    showToast?.('কোনো সংখ্যা হিসাব করা হয়নি!', 'info');
                  }
                }}
                className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold rounded cursor-pointer transition-colors"
                title="হিসাব করা টাকা সরাসরি ক্যাশ প্রাপ্তি বক্সে বসান"
              >
                📥 ক্যাশ বক্সে বসান
              </button>
              <button
                type="button"
                onClick={() => {
                  const val = calcResult || calcInput;
                  if (val) {
                    navigator.clipboard?.writeText(val);
                    showToast?.(`৳${val} কপি হয়েছে!`, 'success');
                  }
                }}
                className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded cursor-pointer transition-colors"
                title="কপি করুন"
              >
                📋 কপি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Preview Lightbox Modal (Highest z-index z-[100] so it floats above the Medicine Entry Modal) */}
      {previewRxImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-in fade-in duration-200 select-none"
          onClick={() => setPreviewRxImage(null)}
        >
          {/* Top Control Bar */}
          <div 
            className="w-full max-w-5xl bg-slate-900/90 border border-white/20 rounded-2xl px-4 py-2.5 flex items-center justify-between text-white shadow-2xl backdrop-blur-md z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                প্রেসক্রিপশন বড় ভিউ (Prescription Full View)
              </span>
            </div>

            {/* Zoom & Rotation Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setRxZoom(z => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                title="জুম আউট (Zoom Out)"
              >
                -
              </button>
              <span className="text-xs font-mono w-12 text-center text-emerald-400">
                {Math.round(rxZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setRxZoom(z => Math.min(3, Number((z + 0.25).toFixed(2))))}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                title="জুম ইন (Zoom In)"
              >
                +
              </button>
              <button
                type="button"
                onClick={() => setRxRotation(r => (r + 90) % 360)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="ঘোরান (Rotate 90°)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ঘোরান</span>
              </button>
              <button
                type="button"
                onClick={() => { setRxZoom(1); setRxRotation(0); }}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold cursor-pointer transition-colors hidden sm:block"
                title="রিসেট (Reset)"
              >
                রিসেট
              </button>
              <button
                type="button"
                onClick={() => window.open(previewRxImage, '_blank')}
                className="px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="নতুন ট্যাবে খুলুন"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">নতুন ট্যাবে</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewRxImage(null)}
                className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors ml-1"
                title="বন্ধ করুন (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Centered Image with Smooth Zoom and Rotation */}
          <div 
            className="flex-1 w-full max-w-5xl flex items-center justify-center overflow-auto p-2 my-2 cursor-zoom-out"
            onClick={() => setPreviewRxImage(null)}
          >
            <div 
              className="transition-transform duration-200 ease-out flex items-center justify-center max-h-full max-w-full"
              style={{
                transform: `scale(${rxZoom}) rotate(${rxRotation}deg)`,
                transformOrigin: 'center center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewRxImage}
                alt="Prescription Full Preview"
                className="max-h-[80vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border-2 border-white/20 bg-white"
              />
            </div>
          </div>

          {/* Bottom Hint */}
          <div className="text-[11px] text-white/60 pb-1">
            বাইরে ক্লিক করে বা ✕ বাটনে চাপ দিয়ে বন্ধ করতে পারবেন
          </div>
        </div>
      )}

    </div>
  );
};
