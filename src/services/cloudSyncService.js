// Global Real-Time Cloud Synchronization Service for Beli Pharmacy
// Provides instant cross-device synchronization between Admin PC, customer mobile devices, tablets, and any shared link.
// Powered by high-speed global Key-Value Cloud Store (kvdb.io) with zero-quota limitations.

const CLOUD_BUCKET = 'BTVv2sHxdsgSpeo4APxdvY';
const CLOUD_BASE_URL = `https://kvdb.io/${CLOUD_BUCKET}`;

// Helper for fetch with timeout
const cloudFetch = async (endpoint, options = {}, timeoutMs = 6000) => {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  
  try {
    const res = await fetch(`${CLOUD_BASE_URL}/${endpoint}`, {
      ...options,
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    return null;
  }
};

// ==========================================
// 1. SETTINGS CLOUD SYNC (Hero Slides, Payments, Delivery, Banners, Coupons)
// ==========================================

export const fetchCloudSettings = async () => {
  try {
    const res = await cloudFetch('settings', { cache: 'no-store' });
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const saveCloudSettings = async (settings) => {
  if (!settings) return false;
  try {
    const payload = {
      ...settings,
      updatedAt: Date.now()
    };
    const res = await cloudFetch('settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 2. MEDICINES CLOUD SYNC (Custom Photos, Stock & Prices)
// ==========================================

export const fetchCloudCustomMedicines = async () => {
  try {
    const res = await cloudFetch('custom_medicines', { cache: 'no-store' });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    return null;
  }
};

export const saveCloudCustomMedicines = async (medicinesList) => {
  if (!medicinesList || !Array.isArray(medicinesList)) return false;
  try {
    const res = await cloudFetch('custom_medicines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicinesList)
    }, 15000);
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudMedicine = async (medicine) => {
  if (!medicine || !medicine.id) return false;
  try {
    const existing = await fetchCloudCustomMedicines();
    const list = Array.isArray(existing) ? existing : [];
    const index = list.findIndex(m => m.id === medicine.id);
    let next;
    if (index >= 0) {
      next = [...list];
      next[index] = { ...next[index], ...medicine };
    } else {
      next = [medicine, ...list];
    }
    return await saveCloudCustomMedicines(next);
  } catch (err) {
    return false;
  }
};

export const deleteCloudCustomMedicine = async (medId) => {
  if (!medId) return false;
  try {
    const existing = await fetchCloudCustomMedicines();
    if (!Array.isArray(existing)) return false;
    const next = existing.filter(m => m.id !== medId);
    return await saveCloudCustomMedicines(next);
  } catch (err) {
    return false;
  }
};

// ==========================================
// 3. ORDERS CLOUD SYNC
// ==========================================

export const fetchCloudOrders = async () => {
  try {
    const res = await cloudFetch('orders', { cache: 'no-store' });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return null;
  }
};

export const saveCloudOrders = async (ordersList) => {
  if (!ordersList || !Array.isArray(ordersList)) return false;
  try {
    const res = await cloudFetch('orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ordersList.slice(0, 500))
    });
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudOrder = async (order) => {
  if (!order || !order.id) return false;
  try {
    const existing = await fetchCloudOrders();
    const list = Array.isArray(existing) ? existing : [];
    const index = list.findIndex(o => o.id === order.id);
    let next;
    if (index >= 0) {
      next = [...list];
      next[index] = { ...next[index], ...order };
    } else {
      next = [order, ...list];
    }
    return await saveCloudOrders(next);
  } catch (err) {
    return false;
  }
};

// ==========================================
// 4. PRESCRIPTIONS CLOUD SYNC
// ==========================================

export const fetchCloudPrescriptions = async () => {
  try {
    const res = await cloudFetch('prescriptions', { cache: 'no-store' });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return null;
  }
};

export const saveCloudPrescriptions = async (prescriptionsList) => {
  if (!prescriptionsList || !Array.isArray(prescriptionsList)) return false;
  try {
    const res = await cloudFetch('prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prescriptionsList.slice(0, 300))
    });
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudPrescription = async (prescription) => {
  if (!prescription || !prescription.id) return false;
  try {
    const existing = await fetchCloudPrescriptions();
    const list = Array.isArray(existing) ? existing : [];
    const index = list.findIndex(p => p.id === prescription.id);
    let next;
    if (index >= 0) {
      next = [...list];
      next[index] = { ...next[index], ...prescription };
    } else {
      next = [prescription, ...list];
    }
    return await saveCloudPrescriptions(next);
  } catch (err) {
    return false;
  }
};

// ==========================================
// 5. CUSTOMER PROFILES CLOUD SYNC
// ==========================================

export const fetchCloudCustomers = async () => {
  try {
    const res = await cloudFetch('customers', { cache: 'no-store' });
    if (!res || !res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return null;
  }
};

export const saveCloudCustomers = async (customersList) => {
  if (!customersList || !Array.isArray(customersList)) return false;
  try {
    const res = await cloudFetch('customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customersList.slice(0, 500))
    });
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudCustomer = async (customer) => {
  if (!customer || !customer.phone) return false;
  try {
    const existing = await fetchCloudCustomers();
    const list = Array.isArray(existing) ? existing : [];
    const index = list.findIndex(c => c.phone === customer.phone);
    let next;
    if (index >= 0) {
      next = [...list];
      next[index] = { ...next[index], ...customer };
    } else {
      next = [customer, ...list];
    }
    return await saveCloudCustomers(next);
  } catch (err) {
    return false;
  }
};

export const deleteCloudCustomer = async (phone) => {
  if (!phone) return false;
  try {
    const existing = await fetchCloudCustomers();
    if (!Array.isArray(existing)) return false;
    const next = existing.filter(c => c.phone !== phone);
    return await saveCloudCustomers(next);
  } catch (err) {
    return false;
  }
};

// ==========================================
// 6. MASTER ONE-CLICK CLOUD SYNC
// ==========================================

export const syncAllDataToCloud = async ({
  heroBanner,
  paymentSettings,
  deliverySettings,
  adBanner,
  coupons,
  adminUsers,
  customMedicines,
  orders,
  prescriptions,
  customers
}) => {
  const results = await Promise.allSettled([
    saveCloudSettings({ heroBanner, paymentSettings, deliverySettings, adBanner, coupons, adminUsers }),
    customMedicines && customMedicines.length > 0 ? saveCloudCustomMedicines(customMedicines) : Promise.resolve(true),
    orders && orders.length > 0 ? saveCloudOrders(orders) : Promise.resolve(true),
    prescriptions && prescriptions.length > 0 ? saveCloudPrescriptions(prescriptions) : Promise.resolve(true),
    customers && customers.length > 0 ? saveCloudCustomers(customers) : Promise.resolve(true)
  ]);

  const allSuccess = results.every(r => r.status === 'fulfilled' && r.value !== false);
  return { success: allSuccess, results };
};

// Aliases for drop-in compatibility
export const saveCloudOrder = saveSingleCloudOrder;
export const saveCloudPrescription = saveSingleCloudPrescription;
export const saveCloudCustomer = saveSingleCloudCustomer;
export const saveCloudMedicine = saveSingleCloudMedicine;
export const fetchCloudMedicines = fetchCloudCustomMedicines;
export const batchSaveCloudMedicines = saveCloudCustomMedicines;

