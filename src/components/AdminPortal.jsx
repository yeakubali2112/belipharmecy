import React, { useState, useRef } from 'react';
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
  Volume2
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
    updatePrescriptionStatus,
    updatePrescriptionMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    resetToDefaultMedicines,
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
    if (newQty <= 0) {
      handleRemoveMedicineFromRx(index);
      return;
    }
    setRxMedicinesList(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          quantity: newQty,
          total: Number((item.unitPrice * newQty).toFixed(2))
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
                <span>অফার ও বিজ্ঞাপন পপআপ</span>
                {adBanner?.isActive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="বিজ্ঞাপন সক্রিয়" />
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
              {activeTab === 'orders' && 'গ্রাহকের অর্ডার ও ডেলিভারি ম্যানেজমেন্ট'}
              {activeTab === 'prescriptions' && 'আপলোডকৃত প্রেসক্রিপশন ও ফার্মাসিস্ট রিভিউ'}
              {activeTab === 'customers' && 'নিবন্ধিত গ্রাহক প্রোফাইল ও কাস্টমার ম্যানেজমেন্ট'}
              {activeTab === 'medicines' && 'ওষুধ ক্যাটালগ ও স্টক পরিচালনা'}
              {activeTab === 'coupons' && 'ডেলিভারি চার্জ ও কুপন কোড ব্যবস্থাপনা'}
              {activeTab === 'ads' && 'হোমপেজ অফার ও বিজ্ঞাপন পপআপ কন্ট্রোল (Popup Ads)'}
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
              {/* 5 Big Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                <div className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">মোট বিক্রি</span>
                    <span className="p-2 rounded-none bg-[#123184]/10 text-[#123184]">
                      <DollarSign className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#123184]">৳{Number(totalSales || 0).toFixed(2)}</span>
                  <span className="text-[11px] text-[#02975E] font-bold">লাইভ ক্যালকুলেশন</span>
                </div>

                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#123184] hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">নিবন্ধিত গ্রাহক</span>
                    <span className="p-2 rounded-none bg-emerald-100 text-[#02975E]">
                      <Users className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{consolidatedCustomers.length} জন</span>
                  <span className="text-[11px] text-[#123184] font-bold">ম্যানেজ করুন &rarr;</span>
                </div>

                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-[#02975E] hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">মোট অর্ডার</span>
                    <span className="p-2 rounded-none bg-[#02975E]/10 text-[#02975E]">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{orders.length}</span>
                  <span className="text-[11px] text-amber-600 font-bold">{pendingOrders} টি নতুন অপেক্ষমান</span>
                </div>

                <div 
                  onClick={() => setActiveTab('prescriptions')}
                  className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">প্রেসক্রিপশন জমা</span>
                    <span className="p-2 rounded-none bg-amber-100 text-amber-800">
                      <FileText className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{prescriptions.length}</span>
                  <span className="text-[11px] text-rose-600 font-bold">{pendingRx} টি রিভিউ বাকি</span>
                </div>

                <div 
                  onClick={() => setActiveTab('medicines')}
                  className="bg-white p-5 rounded-none border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 cursor-pointer hover:border-purple-400 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">ওষুধ আইটেম</span>
                    <span className="p-2 rounded-none bg-purple-100 text-purple-800">
                      <Pill className="w-4 h-4" />
                    </span>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{medicines.length} প্রকার</span>
                  <span className="text-[11px] text-slate-500 font-medium">ইন-স্টক ক্যাটালগ</span>
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
              <div className="space-y-3">
                {paginatedOrders.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-none border border-slate-200 text-slate-400">
                    কোনো অর্ডার পাওয়া যায়নি।
                  </div>
                ) : (
                  paginatedOrders.map(order => {
                    const avatarSrc = order.customerAvatar || customerProfiles?.find(p => p.phone === order.customerPhone)?.avatar || null;
                    return (
                      <div key={order.id} className="bg-white rounded-none border border-slate-200 p-5 space-y-3 shadow-xs">
                        <div className="flex flex-wrap justify-between items-start gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {order.status === 'Pending' ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveInvoiceOrder(order)}
                                  className="group text-left cursor-pointer inline-flex items-center gap-1.5 focus:outline-none"
                                  title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                                >
                                  <span className="bp-number-lighting text-sm group-hover:underline">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                    </span>
                                    <span>{order.id}</span>
                                    <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-rose-200/50 text-rose-900 border border-rose-300">
                                      NEW
                                    </span>
                                  </span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveInvoiceOrder(order)}
                                  className="text-base font-black text-[#123184] hover:text-[#02975E] hover:underline decoration-dotted underline-offset-2 cursor-pointer transition-colors focus:outline-none"
                                  title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                                >
                                  {order.id}
                                </button>
                              )}
                              <span className="text-xs text-slate-400">• {order.createdAt}</span>
                            </div>

                            {/* Customer Profile Photo & Info */}
                            <div className="flex items-center gap-2.5 mt-2.5">
                              <div className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 p-0.5 bg-white shrink-0 shadow-xs flex items-center justify-center overflow-hidden">
                                {avatarSrc ? (
                                  <img 
                                    src={avatarSrc} 
                                    alt={order.customerName} 
                                    className="w-full h-full object-cover rounded-full" 
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#123184] to-[#02975E] text-white flex items-center justify-center text-xs font-black uppercase">
                                    {order.customerName ? order.customerName.slice(0, 1) : <User className="w-4 h-4" />}
                                  </div>
                                )}
                              </div>
                              <div className="text-xs text-slate-800 leading-tight">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-500 font-medium">গ্রাহক:</span>
                                  <span className="font-extrabold text-slate-900 text-sm">{order.customerName}</span>
                                </div>
                                <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                                  <span>📞</span>
                                  <a href={`tel:${order.customerPhone}`} className="text-[#02975E] hover:underline font-bold">{order.customerPhone}</a>
                                </div>
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-2">
                              ঠিকানা: {order.deliveryAddress}
                            </p>
                          {order.patientNote && (
                            <p className="text-xs text-amber-800 bg-amber-50 p-1.5 rounded-lg mt-1">
                              নোট: "{order.patientNote}"
                            </p>
                          )}
                        </div>

                        {/* Status selector & invoice button */}
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-xs font-bold border border-slate-300 rounded-none px-3 py-2 bg-slate-50 outline-none focus:border-[#123184] cursor-pointer"
                          >
                            <option value="Pending">Pending (অপেক্ষমান)</option>
                            <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
                            <option value="Dispatched">Dispatched (প্যাকড)</option>
                            <option value="Out for Delivery">Out for Delivery (পথে)</option>
                            <option value="Delivered">Delivered (সম্পন্ন)</option>
                            <option value="Cancelled">Cancelled (বাতিল)</option>
                          </select>

                          <button
                            onClick={() => setActiveInvoiceOrder(order)}
                            className="flex items-center gap-1.5 bg-[#123184] hover:bg-[#0d2463] text-white font-bold text-xs px-3 py-2 rounded-none cursor-pointer transition-colors shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>ইনভয়েস</span>
                          </button>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-slate-500">ওষুধের তালিকা:</span>
                        <div className="flex flex-wrap gap-2">
                          {order.items?.map((it, idx) => (
                            <span key={idx} className="bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-none font-medium text-slate-800">
                              {it.name} ({it.unitLabel} × {it.quantity})
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Payment Options (Cash on Hand, bKash, Nagad) when Delivered */}
                      {order.status === 'Delivered' && (
                        order.paymentConfirmed ? (
                          /* Customer Confirmed Payment View */
                          <div className="bg-emerald-50 border border-emerald-200 p-2 sm:p-2.5 rounded-none flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-none bg-[#02975E] text-white flex items-center justify-center text-xs font-black">
                                ✓
                              </span>
                              <div className="text-xs">
                                <span className="font-bold text-slate-700">গ্রাহকের সংরক্ষিত পেমেন্ট:</span>
                                <span className="ml-1.5 font-black">
                                  {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') ? (
                                    <span className="text-[#D12053] inline-flex items-center gap-1">
                                      <img src="/bkash-logo.png" alt="bKash" className="h-3.5 object-contain" /> bKash
                                    </span>
                                  ) : (order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') ? (
                                    <span className="text-[#E31B23] inline-flex items-center gap-1">
                                      <img src="/nagad-logo.png" alt="Nagad" className="h-3.5 object-contain" /> Nagad
                                    </span>
                                  ) : (
                                    <span className="text-slate-900">💵 Cash on Hand</span>
                                  )}
                                </span>
                                {order.trxId && order.trxId !== 'N/A' && (
                                  <span className="ml-1.5 font-mono text-slate-800 bg-white px-1.5 py-0.5 border border-emerald-300 font-bold">
                                    TrxID: {order.trxId}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5">
                                🔒 গ্রাহক কর্তৃক সংরক্ষিত
                              </span>
                              <button
                                type="button"
                                onClick={() => updateOrderPaymentMethod(order.id, order.paymentMethod, order.trxId, false)}
                                className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                                title="এডমিন এডিট মোড"
                              >
                                পরিবর্তন
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Admin can set/update payment if customer hasn't yet */
                          <div className="bg-slate-50 border border-slate-200 p-2 sm:p-2.5 rounded-none space-y-1.5 w-fit max-w-2xl shadow-2xs">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-black text-slate-800 flex items-center gap-1 shrink-0">
                                💳 পেমেন্ট পদ্ধতি:
                              </span>

                              {/* Compact Buttons */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {/* Cash on Hand */}
                                <button
                                  type="button"
                                  onClick={() => updateOrderPaymentMethod(order.id, 'Cash on Hand', 'N/A', true)}
                                  className={`px-2.5 py-1 border rounded-none flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                                    order.paymentMethod === 'Cash on Hand' || order.paymentMethod === 'cod'
                                      ? 'border-[#02975E] bg-white text-[#02975E] shadow-2xs font-black ring-1 ring-[#02975E]'
                                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>💵</span>
                                  <span>Cash on Hand</span>
                                  {(order.paymentMethod === 'Cash on Hand' || order.paymentMethod === 'cod') && (
                                    <span className="text-[10px] text-[#02975E] font-black">✓</span>
                                  )}
                                </button>

                                {/* bKash */}
                                <button
                                  type="button"
                                  onClick={() => updateOrderPaymentMethod(order.id, 'bKash', order.trxId, false)}
                                  className={`px-2.5 py-1 border rounded-none flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                                    order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash'
                                      ? 'border-[#D12053] bg-white text-[#D12053] shadow-2xs font-black ring-1 ring-[#D12053]'
                                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <img src="/bkash-logo.png" alt="bKash" className="h-3 object-contain" />
                                  <span>bKash</span>
                                  {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') && (
                                    <span className="text-[10px] text-[#D12053] font-black">✓</span>
                                  )}
                                </button>

                                {/* Nagad */}
                                <button
                                  type="button"
                                  onClick={() => updateOrderPaymentMethod(order.id, 'Nagad', order.trxId, false)}
                                  className={`px-2.5 py-1 border rounded-none flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                                    order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad'
                                      ? 'border-[#E31B23] bg-white text-[#E31B23] shadow-2xs font-black ring-1 ring-[#E31B23]'
                                      : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <img src="/nagad-logo.png" alt="Nagad" className="h-3 object-contain" />
                                  <span>Nagad</span>
                                  {(order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') && (
                                    <span className="text-[10px] text-[#E31B23] font-black">✓</span>
                                  )}
                                </button>
                              </div>

                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 shrink-0">
                                অপেক্ষমান
                              </span>
                            </div>

                            {/* Compact TrxID input when bKash or Nagad is chosen */}
                            {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash' || order.paymentMethod === 'Nagad' || order.paymentMethod === 'nagad') && (
                              <div className="flex items-center gap-1.5 pt-0.5 text-[11px]">
                                <span className="text-[10px] font-bold text-slate-600 shrink-0">
                                  {(order.paymentMethod === 'bKash' || order.paymentMethod === 'bkash') ? 'bKash TrxID:' : 'Nagad TrxID:'}
                                </span>
                                <input
                                  type="text"
                                  id={`admin-trx-${order.id}`}
                                  defaultValue={order.trxId !== 'N/A' ? order.trxId : ''}
                                  placeholder="ট্রানজেকশন আইডি"
                                  className="w-36 sm:w-44 px-2 py-0.5 text-[11px] border border-slate-300 rounded-none bg-white font-mono uppercase font-bold outline-none focus:border-[#123184]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = document.getElementById(`admin-trx-${order.id}`)?.value;
                                    if (val !== undefined) {
                                      updateOrderPaymentMethod(order.id, order.paymentMethod || 'Cash on Hand', val, true);
                                    }
                                  }}
                                  className="bg-[#123184] hover:bg-[#0d2463] text-white px-2.5 py-0.5 rounded-none text-[10px] font-bold cursor-pointer"
                                >
                                  সংরক্ষণ
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Payment & Grand Total strip */}
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                        <span className="text-slate-600 font-medium">
                          বর্তমান পদ্ধতি: <b className="uppercase text-slate-900">{order.paymentMethod}</b> {order.trxId && order.trxId !== 'N/A' && `(TrxID: ${order.trxId})`}
                        </span>
                        <span className="font-black text-base text-[#123184]">
                          মোট প্রদেয়: ৳{Number(order.grandTotal || 0).toFixed(2)}
                        </span>
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
                          onClick={() => setPreviewRxImage(rx.image)}
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
          {/* TAB: OFFER & POPUP ADS MANAGEMENT */}
          {/* ================================================= */}
          {activeTab === 'ads' && (
            <div className="space-y-6 max-w-5xl mx-auto w-full">
              
              {/* Quick Status Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between">
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

                <div className="bg-white border border-slate-200 p-4 shadow-xs flex items-center justify-between">
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
                <div className="lg:col-span-6 bg-white border border-slate-200 p-6 shadow-xs space-y-5">
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
                  <div className="relative bg-slate-900/10 p-3 rounded-xl border-2 border-slate-200 shadow-xl overflow-hidden max-w-sm sm:max-w-md mx-auto text-center">
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

      {/* Full Image Preview Modal */}
      {previewRxImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewRxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl">
            <button
              onClick={() => setPreviewRxImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white rounded-full p-2 cursor-pointer"
            >
              ✕
            </button>
            <img
              src={previewRxImage}
              alt="Prescription Large"
              className="max-h-[85vh] max-w-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

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
            className="bg-white rounded-none max-w-5xl w-full my-6 shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-gradient-to-r from-[#123184] to-[#02975E] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-xs">
                  <Pill className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    <span>প্রেসক্রিপশন অনুযায়ী ওষুধ এন্ট্রি ও মূল্য নির্ধারণ</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono">#{activeRxForMedicines.id}</span>
                  </h3>
                  <p className="text-xs text-blue-100">
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

            {/* Modal Body: Two column layout (Left: Prescription Image, Right: Medicine Selector & List) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Left Column: Prescription Image */}
              <div className="lg:col-span-5 p-4 bg-slate-50 flex flex-col items-center justify-between space-y-3">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#123184]" />
                      <span>প্রেসক্রিপশন কপি</span>
                    </span>
                    {activeRxForMedicines.image && (
                      <button
                        type="button"
                        onClick={() => setPreviewRxImage(activeRxForMedicines.image)}
                        className="text-[11px] text-[#123184] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>বড় করে দেখুন</span>
                      </button>
                    )}
                  </div>

                  {activeRxForMedicines.image ? (
                    <div className="w-full bg-white border border-slate-200 rounded-none overflow-hidden max-h-[380px] flex items-center justify-center p-2 shadow-inner">
                      <img
                        src={activeRxForMedicines.image}
                        alt="Prescription Large"
                        className="max-h-[360px] w-full object-contain cursor-zoom-in hover:scale-105 transition-transform"
                        onClick={() => setPreviewRxImage(activeRxForMedicines.image)}
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      ছবি পাওয়া যায়নি
                    </div>
                  )}

                  {activeRxForMedicines.notes && (
                    <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 rounded-none">
                      <span className="font-bold block">রোগীর নোট:</span>
                      <span>"{activeRxForMedicines.notes}"</span>
                    </div>
                  )}
                </div>

                <div className="w-full text-xs text-slate-500 bg-white p-3 border border-slate-200">
                  <span className="font-bold block text-slate-700 mb-1">💡 ফার্মাসিস্ট নির্দেশিকা:</span>
                  প্রেসক্রিপশন দেখে ডানপাশে ওষুধ সার্চ করে যোগ করুন। ওষুধের দাম অটোমেটিক ওয়েবসাইট মূল্যের সাথে মিলে হিসাব হবে।
                </div>
              </div>

              {/* Right Column: Search Medicines & Prescribed List */}
              <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                
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
                                onClick={() => handleUpdateRxItemQuantity(idx, item.quantity - 1)}
                                className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateRxItemQuantity(idx, item.quantity + 1)}
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

    </div>
  );
};
