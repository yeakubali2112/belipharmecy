import React, { useState, useMemo } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { searchMedicines } from './utils/medicineSearch';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { MedicineCard } from './components/MedicineCard';
import { MedicineModal } from './components/MedicineModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PrescriptionUploadModal } from './components/PrescriptionUploadModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { HealthToolsModal } from './components/HealthToolsModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminPortal } from './components/AdminPortal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { AdPopupModal } from './components/AdPopupModal';
import { Footer } from './components/Footer';
import { 
  Phone, 
  MessageCircle, 
  Search, 
  Sparkles, 
  AlertCircle, 
  ArrowUp,
  Pill,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MainApp = () => {
  const { 
    medicines, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery, 
    setSearchQuery,
    toast, 
    lang, 
    config,
    setIsPrescriptionModalOpen,
    setIsCartOpen,
    cart,
    currentView
  } = useShop();

  const [sortBy, setSortBy] = useState('popular');
  const [filterRx, setFilterRx] = useState('all'); // 'all', 'otc', 'rx'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Reset to first page whenever search or filter criteria change
  React.useEffect(() => {
    setCurrentPage(1);
    if (searchQuery.trim()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedCategory, searchQuery, filterRx, sortBy]);

  React.useEffect(() => {
    document.title = 'Beli Pharmacy | বেলী ফার্মেসি';
  }, []);

  // Filter & sort logic (powered by bilingual Bangladesh medicine search)
  const filteredMedicines = useMemo(() => {
    let list = searchQuery.trim()
      ? searchMedicines(medicines, searchQuery, { category: selectedCategory, filterRx })
      : medicines.filter((med) => {
          const matchCategory = selectedCategory === 'all' || med.category === selectedCategory;
          let matchRx = true;
          if (filterRx === 'otc') matchRx = !med.requiresPrescription;
          if (filterRx === 'rx') matchRx = !!med.requiresPrescription;
          return matchCategory && matchRx;
        });

    return list.sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerStrip - b.pricePerStrip;
      if (sortBy === 'price-desc') return b.pricePerStrip - a.pricePerStrip;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // maintain search relevance ranking
    });
  }, [medicines, selectedCategory, searchQuery, filterRx, sortBy]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage) || 1;

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const catalogEl = document.getElementById('medicines-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // If in dedicated Admin Portal view
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 relative selection:bg-[#02975E] selection:text-white">
        {/* Toast Alert */}
        {toast && (
          <div className="fixed top-6 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 fade-in">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          </div>
        )}

        <AdminPortal />
        <InvoiceModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative selection:bg-emerald-600 selection:text-white">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 fade-in">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header />

      {/* Hero Section (Hidden when user is actively searching so products show immediately) */}
      {!searchQuery.trim() && <Hero />}

      {/* Category Pills & Filters */}
      <CategoryFilter
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterRx={filterRx}
        setFilterRx={setFilterRx}
      />

      {/* Main Medicine Catalog Grid */}
      <main id="medicines-catalog" className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Section Title & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Pill className="w-6 h-6 text-emerald-600" />
              <span>{lang === 'bn' ? 'উপলব্ধ ওষুধ ও স্বাস্থ্যপণ্য' : 'Available Medicines'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {lang === 'bn' 
                ? `মোট ${filteredMedicines.length} টি ওষুধ • দেখাচ্ছে ${(currentPage - 1) * itemsPerPage + 1} থেকে ${Math.min(currentPage * itemsPerPage, filteredMedicines.length)} টি (পেজ ${currentPage}/${totalPages})` 
                : `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredMedicines.length)} of ${filteredMedicines.length} products (Page ${currentPage}/${totalPages})`}
            </p>
          </div>

          {searchQuery && (
            <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-none border border-emerald-200 flex items-center gap-2">
              <span>{lang === 'bn' ? 'অনুসন্ধান:' : 'Search:'} <b>"{searchQuery}"</b></span>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Medicines Display Grid with Pagination */}
        {filteredMedicines.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {paginatedMedicines.map((med) => (
                <MedicineCard key={med.id} medicine={med} />
              ))}
            </div>

            {/* Pagination Bar: Previous, Page Numbers, Next */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-4 shadow-xs rounded-none">
                <div className="text-xs sm:text-sm font-semibold text-slate-700">
                  {lang === 'bn' ? (
                    <span>
                      পেজ <strong className="text-[#123184] font-black">{currentPage}</strong> / <strong>{totalPages}</strong> — মোট {filteredMedicines.length} টির মধ্যে <strong>{(currentPage - 1) * itemsPerPage + 1} থেকে {Math.min(currentPage * itemsPerPage, filteredMedicines.length)}</strong> টি পণ্য দেখানো হচ্ছে
                    </span>
                  ) : (
                    <span>
                      Page <strong className="text-[#123184] font-black">{currentPage}</strong> of <strong>{totalPages}</strong> — Showing <strong>{(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMedicines.length)}</strong> of {filteredMedicines.length} products
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-[#123184] hover:text-white hover:border-[#123184] cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'পূর্ববর্তী পেজ' : 'Previous'}</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-9 h-9 text-xs font-black border transition-all rounded-none cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#123184] text-white border-[#123184] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-xs font-bold flex items-center gap-1.5 border transition-all rounded-none ${
                      currentPage === totalPages
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
        ) : (
          <div className="bg-white rounded-none border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-none bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">
              {lang === 'bn' ? 'কোনো ওষুধ খুঁজে পাওয়া যায়নি' : 'No medicine found'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'bn' 
                ? 'আপনার প্রয়োজনীয় ওষুধটি আমাদের তালিকায় না থাকলে সরাসরি প্রেসক্রিপশন আপলোড করুন বা ফোনে জানান।'
                : 'If not found in the list, please upload prescription or call us directly.'}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setFilterRx('all');
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-none transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
              </button>
              <button
                onClick={() => setIsPrescriptionModalOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-none transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'প্রেসক্রিপশন দিন' : 'Upload Rx'}
              </button>
            </div>
          </div>
        )}


      </main>

      {/* Floating Action Buttons: WhatsApp (#02975E) & Call (#123184) */}
      <div className="fixed bottom-6 right-4 z-40 flex flex-col gap-3">
        {/* WhatsApp Chat Button in #02975E */}
        <a
          href={`https://wa.me/8801774961757?text=${encodeURIComponent('Hello Beli Pharmacy! I need help with medicine order.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 rounded-full bg-[#02975E] hover:bg-[#027e4e] text-white shadow-xl shadow-[#02975E]/40 flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer group"
          title="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="sr-only">WhatsApp</span>
        </a>

        {/* Direct Call Button in #123184 */}
        <a
          href={`tel:${config.phone}`}
          className="w-13 h-13 rounded-full bg-[#123184] hover:bg-[#0d2463] text-white shadow-xl shadow-[#123184]/40 flex items-center justify-center transition-all transform hover:scale-110 cursor-pointer"
          title="Call Pharmacy"
        >
          <Phone className="w-6 h-6 animate-pulse" />
          <span className="sr-only">Call</span>
        </a>
      </div>

      {/* Mobile Floating Cart Summary Button */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-20 z-40 md:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#123184] text-white py-3 px-4 rounded-2xl shadow-2xl flex items-center justify-between font-bold text-xs border border-[#0d2463] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="bg-[#02975E] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                {totalCartCount}
              </span>
              <span>কার্ট দেখুন</span>
            </div>
            <span className="text-[#02975E] font-black text-sm">
              এগিয়ে যান &rarr;
            </span>
          </button>
        </div>
      )}

      {/* Modals */}
      <CartDrawer />
      <CheckoutModal />
      <PrescriptionUploadModal />
      <OrderTrackingModal />
      <MedicineModal />
      <InvoiceModal />
      <HealthToolsModal />
      <CustomerProfileModal />
      <AdPopupModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Beli Pharmacy App caught error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      // Clear oversized prescriptions cache if quota overflow caused the crash
      const p = localStorage.getItem('beli_prescriptions');
      if (p && p.length > 500000) {
        localStorage.removeItem('beli_prescriptions');
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">একটি অপ্রত্যাশিত ত্রুটি ঘটেছে</h2>
              <p className="text-xs text-slate-500 mt-1">
                ওয়েব অ্যাপ্লিকেশনটি নিরাপদে পুনরায় লোড করতে নিচের বাটনে চাপ দিন।
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full bg-[#123184] hover:bg-[#0d2463] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md cursor-pointer"
            >
              পুনরায় লোড করুন (Reload Page)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ShopProvider>
        <MainApp />
      </ShopProvider>
    </ErrorBoundary>
  );
}
