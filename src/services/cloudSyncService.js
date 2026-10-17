// Global Real-Time Cloud Synchronization Service for Beli Pharmacy
// Provides instant cross-device synchronization between Admin PC, customer mobile devices, tablets, and any shared link.
// Powered by high-speed global cloud store with zero quota limitations and real-time push.

const CLOUD_STORE_TOPIC = 'beli_pharmacy_cloud_store_2026';
const CLOUD_STORE_URL = `https://ntfy.sh/${CLOUD_STORE_TOPIC}`;

let pollCache = null;
let pollCacheTime = 0;

// Fetches the latest file attachment URLs from the cloud store
const getLatestAttachmentUrls = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && pollCache && (now - pollCacheTime < 8000)) {
    return pollCache;
  }
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 6000) : null;
    const res = await fetch(`${CLOUD_STORE_URL}/json?poll=1&since=all`, {
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res || !res.ok) return pollCache || {};

    const text = await res.text();
    const lines = text.trim().split('\n').filter(Boolean);
    const keyMap = {};
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.attachment?.name && item.attachment?.url) {
          const k = item.attachment.name.replace('.json', '');
          keyMap[k] = item.attachment.url;
        }
      } catch {}
    }
    pollCache = keyMap;
    pollCacheTime = now;
    return keyMap;
  } catch (err) {
    return pollCache || {};
  }
};

export const fetchCloudData = async (key) => {
  try {
    const urls = await getLatestAttachmentUrls();
    const fileUrl = urls[key];
    if (!fileUrl) return null;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 7000) : null;
    const res = await fetch(fileUrl, {
      cache: 'no-store',
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);
    if (!res || !res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const saveCloudData = async (key, data, timeoutMs = 15000) => {
  if (!data) return false;
  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    const res = await fetch(CLOUD_STORE_URL, {
      method: 'POST',
      headers: {
        'Title': `Beli_${key}`,
        'Tags': key,
        'X-Filename': `${key}.json`
      },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    });
    if (timeoutId) clearTimeout(timeoutId);
    pollCacheTime = 0; // invalidate cache
    return res && res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 1. SETTINGS CLOUD SYNC (Hero Slides, Payments, Delivery, Banners, Coupons)
// ==========================================

export const fetchCloudSettings = async () => {
  return await fetchCloudData('settings');
};

export const saveCloudSettings = async (settings) => {
  if (!settings) return false;
  return await saveCloudData('settings', {
    ...settings,
    updatedAt: Date.now()
  });
};

// ==========================================
// 2. MEDICINES CLOUD SYNC (Custom Photos, Stock & Prices)
// ==========================================

export const fetchCloudCustomMedicines = async () => {
  const data = await fetchCloudData('custom_medicines');
  return Array.isArray(data) ? data : null;
};

export const saveCloudCustomMedicines = async (medicinesList) => {
  if (!medicinesList || !Array.isArray(medicinesList)) return false;
  return await saveCloudData('custom_medicines', medicinesList, 25000);
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
  const data = await fetchCloudData('orders');
  return Array.isArray(data) ? data : [];
};

export const saveCloudOrders = async (ordersList) => {
  if (!ordersList || !Array.isArray(ordersList)) return false;
  return await saveCloudData('orders', ordersList.slice(0, 500));
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
  const data = await fetchCloudData('prescriptions');
  return Array.isArray(data) ? data : [];
};

export const saveCloudPrescriptions = async (prescriptionsList) => {
  if (!prescriptionsList || !Array.isArray(prescriptionsList)) return false;
  return await saveCloudData('prescriptions', prescriptionsList.slice(0, 300));
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
  const data = await fetchCloudData('customers');
  return Array.isArray(data) ? data : [];
};

export const saveCloudCustomers = async (customersList) => {
  if (!customersList || !Array.isArray(customersList)) return false;
  return await saveCloudData('customers', customersList.slice(0, 500));
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
  const tasks = [
    saveCloudSettings({ heroBanner, paymentSettings, deliverySettings, adBanner, coupons, adminUsers })
  ];

  if (customMedicines && customMedicines.length > 0) {
    tasks.push(saveCloudCustomMedicines(customMedicines));
  }
  if (orders && orders.length > 0) {
    tasks.push(saveCloudOrders(orders));
  }
  if (prescriptions && prescriptions.length > 0) {
    tasks.push(saveCloudPrescriptions(prescriptions));
  }
  if (customers && customers.length > 0) {
    tasks.push(saveCloudCustomers(customers));
  }

  const results = await Promise.allSettled(tasks);
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
