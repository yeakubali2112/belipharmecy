import React, { useState } from 'react';
import { 
  X, 
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
  DollarSign, 
  Eye, 
  RotateCcw,
  AlertCircle,
  ExternalLink,
  Printer
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CATEGORIES } from '../data/medicines';

export const AdminPanel = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    isAdminAuthenticated, 
    setIsAdminAuthenticated,
    config, 
    orders, 
    prescriptions, 
    medicines, 
    updateOrderStatus, 
    updatePrescriptionStatus,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    resetToDefaultMedicines,
    setActiveInvoiceOrder,
    lang 
  } = useShop();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'orders', 'prescriptions', 'medicines'
  
  // New medicine form state
  const [showAddForm, setShowAddForm] = useState(false);
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

  // Selected prescription preview modal
  const [previewRxImage, setPreviewRxImage] = useState(null);

  if (!isAdminOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput.trim() === config.adminPin) {
      setIsAdminAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
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

  const totalSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const pendingRx = prescriptions.filter(p => p.status === 'Pending Review').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full my-4 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Brand Navy Blue #123184 */}
        <div className="p-4 sm:p-5 border-b border-[#0d2463] flex items-center justify-between bg-[#123184] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#02975E] flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {lang === 'bn' ? 'বেলী ফার্মেসি অ্যাডমিন কন্ট্রোল প্যানেল' : 'Beli Pharmacy Admin Panel'}
              </h2>
              <span className="text-xs text-blue-200">
                {lang === 'bn' ? 'ইনভেন্টরি, অর্ডার ও প্রেসক্রিপশন পরিচালনা' : 'Manage Inventory, Orders & Prescriptions'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => setIsAdminAuthenticated(false)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
              >
                লগআউট
              </button>
            )}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PIN Authentication Gate */}
        {!isAdminAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900">
              অ্যাডমিন পিন কোড প্রবেশ করুন
            </h3>
            <p className="text-xs text-slate-500">
              নিরাপত্তা পিন দিয়ে অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন। ডিফল্ট পিন: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-emerald-700">1234</code>
            </p>

            <form onSubmit={handlePinSubmit} className="w-full space-y-3 pt-2">
              <input
                type="password"
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="পিন কোড লিখুন..."
                className={`w-full text-center text-xl tracking-widest px-4 py-3 rounded-2xl border ${
                  pinError ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-300 focus:border-emerald-600'
                } outline-none font-mono font-bold`}
              />
              {pinError && (
                <p className="text-xs text-rose-600 font-semibold">ভুল পিন কোড! অনুগ্রহ করে 1234 লিখুন।</p>
              )}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl transition-colors cursor-pointer text-sm shadow-md"
              >
                আনলক করুন
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-5 flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'overview' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>সামগ্রিক পরিসংখ্যান</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-5 flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'orders' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>গ্রাহকের অর্ডার ({orders.length})</span>
                {pendingOrders > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('prescriptions')}
                className={`py-3 px-5 flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'prescriptions' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>প্রেসক্রিপশন ({prescriptions.length})</span>
                {pendingRx > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingRx}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('medicines')}
                className={`py-3 px-5 flex items-center gap-2 border-b-2 cursor-pointer whitespace-nowrap ${
                  activeTab === 'medicines' ? 'border-emerald-600 text-emerald-800 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>ওষুধ ক্যাটালগ ও স্টক ({medicines.length})</span>
              </button>
            </div>

            {/* Tab Contents Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold block">মোট বিক্রি (Revenue)</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">৳{totalSales.toFixed(0)}</span>
                      <span className="text-[11px] text-emerald-600 font-medium">সম্পূর্ণ পরিশোধিত ও চলতি</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold block">মোট অর্ডার</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{orders.length}</span>
                      <span className="text-[11px] text-amber-600 font-medium">{pendingOrders} টি পেন্ডিং</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold block">প্রেসক্রিপশন জমা</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{prescriptions.length}</span>
                      <span className="text-[11px] text-rose-600 font-medium">{pendingRx} টি অপেক্ষমান</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-xs text-slate-500 font-semibold block">মোট ওষুধ স্টক</span>
                      <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{medicines.length} প্রকার</span>
                      <span className="text-[11px] text-slate-500 font-medium">লাইভ ডাটাবেজ</span>
                    </div>
                  </div>

                  {/* Recent Orders Overview */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                    <h4 className="font-bold text-sm text-slate-900">সাম্প্রতিক অর্ডারের সংক্ষিপ্ত তালিকা</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                            <th className="pb-2">আইডি</th>
                            <th className="pb-2">গ্রাহক</th>
                            <th className="pb-2">মোট মূল্য</th>
                            <th className="pb-2">পেমেন্ট</th>
                            <th className="pb-2">স্ট্যাটাস</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {orders.slice(0, 5).map(o => (
                            <tr key={o.id} className="py-2">
                              <td className="py-2.5 font-bold text-slate-900">{o.id}</td>
                              <td className="py-2.5">{o.customerName} ({o.customerPhone})</td>
                              <td className="py-2.5 font-bold text-emerald-800">৳{o.grandTotal}</td>
                              <td className="py-2.5 uppercase font-medium">{o.paymentMethod}</td>
                              <td className="py-2.5">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
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

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900">অর্ডার সমূহ ({orders.length}টি)</h3>
                  </div>

                  <div className="space-y-3">
                    {orders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <button
                              type="button"
                              onClick={() => setActiveInvoiceOrder(order)}
                              className="text-base font-extrabold text-[#123184] hover:text-[#02975E] hover:underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                              title="ইনভয়েস ও বিস্তারিত দেখতে ক্লিক করুন"
                            >
                              {order.id}
                            </button>
                            <span className="text-xs text-slate-400 ml-2">{order.createdAt}</span>
                            <div className="text-xs text-slate-700 mt-0.5 font-semibold">
                              {order.customerName} • 📞 <a href={`tel:${order.customerPhone}`} className="text-emerald-700 hover:underline">{order.customerPhone}</a>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              ঠিকানা: {order.deliveryAddress}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {/* Change status selector */}
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs font-bold border border-slate-300 rounded-xl px-2.5 py-1.5 bg-slate-50 outline-none focus:border-emerald-600 cursor-pointer"
                            >
                              <option value="Pending">Pending (অপেক্ষমান)</option>
                              <option value="Processing">Processing (প্রক্রিয়াধীন)</option>
                              <option value="Dispatched">Dispatched (প্যাকড)</option>
                              <option value="Out for Delivery">Out for Delivery (পথে)</option>
                              <option value="Delivered">Delivered (সম্পন্ন)</option>
                              <option value="Cancelled">Cancelled (বাতিল)</option>
                            </select>

                            <button
                              onClick={() => {
                                setActiveInvoiceOrder(order);
                              }}
                              className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>ইনভয়েস</span>
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="text-xs space-y-1">
                          <span className="font-semibold text-slate-500">অর্ডার করা ওষুধ:</span>
                          <div className="flex flex-wrap gap-2">
                            {order.items?.map((it, idx) => (
                              <span key={idx} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700">
                                {it.name} ({it.unitLabel} × {it.quantity})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                          <span className="text-slate-500">
                            পেমেন্ট: <b className="uppercase">{order.paymentMethod}</b> {order.trxId && order.trxId !== 'N/A' && `(Trx: ${order.trxId})`}
                          </span>
                          <span className="font-extrabold text-sm text-emerald-800">
                            মোট: ৳{order.grandTotal}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PRESCRIPTIONS REVIEW */}
              {activeTab === 'prescriptions' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">আপলোডকৃত প্রেসক্রিপশন ({prescriptions.length}টি)</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {prescriptions.map(rx => (
                      <div key={rx.id} className="bg-white rounded-xl border border-slate-200 p-3 space-y-2.5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <div className="min-w-0">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">{rx.id}</span>
                              <span className="text-[10px] text-slate-400 block">{rx.createdAt}</span>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                              {rx.status}
                            </span>
                          </div>

                          <div className="text-[11px] leading-snug space-y-0.5">
                            <p className="font-bold text-slate-800 truncate">রোগীর নাম: {rx.customerName}</p>
                            <p className="text-slate-600">ফোন: <a href={`tel:${rx.customerPhone}`} className="text-emerald-700 hover:underline font-semibold">{rx.customerPhone}</a></p>
                            <p className="text-slate-500 line-clamp-1" title={rx.deliveryAddress}>ঠিকানা: {rx.deliveryAddress}</p>
                            {rx.notes && <p className="text-slate-600 italic bg-slate-50 p-1 rounded text-[10px] line-clamp-2">নোট: "{rx.notes}"</p>}
                          </div>

                          {/* Image Thumbnail */}
                          {rx.image && (
                            <div 
                              onClick={() => setPreviewRxImage(rx.image)}
                              className="relative h-32 bg-slate-100 rounded-lg overflow-hidden cursor-pointer group border border-slate-200"
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
                        </div>

                        {/* Status Toggle & Call Button */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                          <select
                            value={rx.status}
                            onChange={(e) => updatePrescriptionStatus(rx.id, e.target.value)}
                            className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 flex-1 bg-slate-50 text-slate-800 outline-none hover:bg-white focus:border-emerald-600 transition-colors"
                          >
                            <option value="Pending Review">Pending Review</option>
                            <option value="Reviewed">Reviewed (পর্যালোচনা সম্পন্ন)</option>
                            <option value="Customer Called">Customer Called (কল করা হয়েছে)</option>
                            <option value="Order Created">Order Created (অর্ডার প্রস্তুত)</option>
                          </select>

                          <a
                            href={`tel:${rx.customerPhone}`}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors shrink-0"
                          >
                            কল দিন
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MEDICINE CATALOG CRUD */}
              {activeTab === 'medicines' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">ওষুধের তালিকা ({medicines.length}টি)</h3>
                      <p className="text-xs text-slate-500">মূল্য ও স্টক তাৎক্ষণিক পরিবর্তন করুন</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={resetToDefaultMedicines}
                        className="flex items-center gap-1.5 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 py-2 rounded-xl cursor-pointer"
                        title="Reset to default medicines"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>ডিফল্ট তালিকা</span>
                      </button>

                      <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>নতুন ওষুধ যুক্ত করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Medicine Form Modal/Section */}
                  {showAddForm && (
                    <form onSubmit={handleAddMedicineSubmit} className="bg-white rounded-2xl border-2 border-emerald-500 p-5 space-y-4 animate-in fade-in">
                      <h4 className="font-bold text-sm text-slate-900 text-emerald-800">নতুন ওষুধের তথ্য দিন</h4>
                      <div className="grid sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold mb-1">ওষুধের নাম (Brand Name) *</label>
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
                          <label className="block font-semibold mb-1">জেনেরিক নাম (Generic) *</label>
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
                          <label className="block font-semibold mb-1">কোম্পানি / প্রস্তুতকারক *</label>
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
                          <label className="block font-semibold mb-1">ক্যাটাগরি</label>
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
                          <label className="block font-semibold mb-1">ধরণ (Type)</label>
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
                          <label className="block font-semibold mb-1">পাতা প্রতি মূল্য (৳) *</label>
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
                          <label className="block font-semibold mb-1">পিস প্রতি মূল্য (৳)</label>
                          <input
                            type="number"
                            step="0.5"
                            value={newMed.pricePerUnit}
                            onChange={(e) => setNewMed({ ...newMed, pricePerUnit: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">ডিসকাউন্ট %</label>
                          <input
                            type="number"
                            value={newMed.discountPercent}
                            onChange={(e) => setNewMed({ ...newMed, discountPercent: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold mb-1">স্টক সংখ্যা</label>
                          <input
                            type="number"
                            value={newMed.stock}
                            onChange={(e) => setNewMed({ ...newMed, stock: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border rounded-xl"
                          />
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
                          className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-md"
                        >
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Medicines Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                            <th className="p-3">ওষুধের নাম ও কোম্পানি</th>
                            <th className="p-3">জেনেরিক</th>
                            <th className="p-3">মূল্য (পাতা/পিস)</th>
                            <th className="p-3">ডিসকাউন্ট</th>
                            <th className="p-3">স্টক</th>
                            <th className="p-3 text-right">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {medicines.map(med => (
                            <tr key={med.id} className="hover:bg-slate-50">
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{med.name}</span>
                                <span className="text-[11px] text-slate-500">{med.company} ({med.type})</span>
                              </td>
                              <td className="p-3 text-slate-600 max-w-xs truncate">{med.generic}</td>
                              <td className="p-3 font-bold text-emerald-800">
                                ৳{med.pricePerStrip} <span className="text-slate-400 font-normal">/ ৳{med.pricePerUnit}</span>
                              </td>
                              <td className="p-3">
                                {med.discountPercent > 0 ? (
                                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold text-[10px]">
                                    {med.discountPercent}%
                                  </span>
                                ) : (
                                  <span className="text-slate-400">০%</span>
                                )}
                              </td>
                              <td className="p-3 font-semibold text-slate-700">{med.stock} pcs</td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => deleteMedicine(med.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal for full prescription zoom */}
        {previewRxImage && (
          <div 
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setPreviewRxImage(null)}
          >
            <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl p-2">
              <button
                onClick={() => setPreviewRxImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewRxImage}
                alt="Enlarged prescription"
                className="max-h-[85vh] max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
