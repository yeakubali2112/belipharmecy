// Supabase PostgreSQL & Cloud Database Synchronization Service for Beli Pharmacy (বেলী ফার্মেসি)
// Connects to PostgreSQL database via /api/db endpoint with automatic fallback and retry guards.

const API_BASE = '/api/db';

/**
 * Checks the database connection status
 * @returns {Promise<{connected: boolean, configured: boolean, details?: string, error?: string}>}
 */
export const checkDatabaseStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=test_connection`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { connected: false, configured: false, error: data.error || `HTTP ${res.status}` };
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return { connected: false, configured: false, error: err.message || 'Cannot reach API' };
  }
};

/**
 * Trigger database schema initialization
 */
export const initDatabaseSchema = async () => {
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'init_schema' })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// ==========================================
// 1. SETTINGS SYNC (Hero, Delivery, Payment, Ads, Coupons, Users)
// ==========================================

const safeParse = (val, fallback = null) => {
  if (val === undefined || val === null) return fallback;
  let parsed = val;
  while (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }
  return parsed ?? fallback;
};

export const fetchCloudSettings = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=settings`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    if (json.success && json.data) {
      // Re-map into standard settings structure with guaranteed parsed objects
      const deliverySettings = safeParse(json.data.delivery_settings || json.data.deliverySettings);
      const paymentSettings = safeParse(json.data.payment_settings || json.data.paymentSettings);
      const coupons = safeParse(json.data.coupons);
      const adBanner = safeParse(json.data.ad_banner || json.data.adBanner);
      const heroBanner = safeParse(json.data.hero_banner || json.data.heroBanner);
      const adminUsers = safeParse(json.data.admin_users || json.data.adminUsers);

      return {
        deliverySettings,
        paymentSettings,
        coupons,
        adBanner,
        heroBanner,
        adminUsers
      };
    }
    return null;
  } catch (err) {
    console.warn('[DB Settings Fetch Warning]:', err.message);
    return null;
  }
};

export const saveCloudSettings = async (settings) => {
  if (!settings) return false;
  try {
    const tasks = [];
    if (settings.deliverySettings) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'delivery_settings', data: settings.deliverySettings })
      }));
    }
    if (settings.paymentSettings) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'payment_settings', data: settings.paymentSettings })
      }));
    }
    if (settings.heroBanner) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'hero_banner', data: settings.heroBanner })
      }));
    }
    if (settings.adBanner) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'ad_banner', data: settings.adBanner })
      }));
    }
    if (settings.coupons) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'coupons', data: settings.coupons })
      }));
    }
    if (settings.adminUsers) {
      tasks.push(fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_settings', key: 'admin_users', data: settings.adminUsers })
      }));
    }
    await Promise.allSettled(tasks);
    return true;
  } catch (err) {
    console.warn('[DB Settings Save Warning]:', err.message);
    return false;
  }
};

// ==========================================
// 2. MEDICINES SYNC (Custom Photos, Stock & Prices)
// ==========================================

export const fetchCloudCustomMedicines = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=medicines`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : null;
  } catch (err) {
    return null;
  }
};

export const saveCloudCustomMedicines = async (medicinesList) => {
  if (!medicinesList || !Array.isArray(medicinesList)) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'batch_save_medicines', medicines: medicinesList })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudMedicine = async (medicine) => {
  if (!medicine || !medicine.id) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_medicine', medicine })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const deleteCloudCustomMedicine = async (medId) => {
  if (!medId) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_medicine', medicineId: medId })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 3. ORDERS SYNC
// ==========================================

export const fetchCloudOrders = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=orders`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    return [];
  }
};

export const saveCloudOrders = async (ordersList) => {
  if (!ordersList || !Array.isArray(ordersList)) return false;
  try {
    for (const o of ordersList.slice(0, 50)) {
      await saveSingleCloudOrder(o);
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudOrder = async (order) => {
  if (!order || !order.id) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_order', order })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 4. PRESCRIPTIONS SYNC
// ==========================================

export const fetchCloudPrescriptions = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=prescriptions`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    return [];
  }
};

export const saveCloudPrescriptions = async (prescriptionsList) => {
  if (!prescriptionsList || !Array.isArray(prescriptionsList)) return false;
  try {
    for (const p of prescriptionsList.slice(0, 30)) {
      await saveSingleCloudPrescription(p);
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudPrescription = async (prescription) => {
  if (!prescription || !prescription.id) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_prescription', prescription })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 5. CUSTOMER PROFILES SYNC
// ==========================================

export const fetchCloudCustomers = async () => {
  try {
    const res = await fetch(`${API_BASE}?type=customers`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    return [];
  }
};

export const saveCloudCustomers = async (customersList) => {
  if (!customersList || !Array.isArray(customersList)) return false;
  try {
    for (const c of customersList.slice(0, 50)) {
      await saveSingleCloudCustomer(c);
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const saveSingleCloudCustomer = async (customer) => {
  if (!customer || !customer.phone) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_customer', customer })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const deleteCloudCustomer = async (phone) => {
  if (!phone) return false;
  try {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_customer', phone })
    });
    return res.ok;
  } catch (err) {
    return false;
  }
};

// ==========================================
// 6. MASTER ALL-DATA SYNC
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

// Compatibility aliases
export const saveCloudOrder = saveSingleCloudOrder;
export const saveCloudPrescription = saveSingleCloudPrescription;
export const saveCloudCustomer = saveSingleCloudCustomer;
export const saveCloudMedicine = saveSingleCloudMedicine;
export const fetchCloudMedicines = fetchCloudCustomMedicines;
export const batchSaveCloudMedicines = saveCloudCustomMedicines;
